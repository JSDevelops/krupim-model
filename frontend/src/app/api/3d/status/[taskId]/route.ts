import { randomUUID } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { queryDb, withTransaction } from '@/lib/db'
import { getTripoSetting } from '@/lib/tripoSettings'
import { ApiError, apiErrorResponse, getErrorMessage, guardApi } from '../../../_lib/auth'

export const runtime = 'nodejs'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const MAX_MODEL_SIZE = 80 * 1024 * 1024
const finalStatuses = new Set(['success', 'failed', 'cancelled', 'banned', 'expired', 'preview'])

type Job = {
  id: string; external_task_id: string | null; created_by: string; ar_item_id: string | null
  prompt: string; name_en: string; name_th: string; description: string | null
  status: string; progress: number; glb_url: string | null; preview_url: string | null
  error_message: string | null; model_version: string | null
  created_at?: string; updated_at?: string; completed_at?: string | null
}

type TripoTaskResponse = {
  code?: number
  data?: {
    status?: string; progress?: number; error_msg?: string
    output?: { model?: string; pbr_model?: string; rendered_image?: string }
  }
}

function publicJob(job: Job) {
  return {
    id: job.id, externalTaskId: job.external_task_id, prompt: job.prompt, modelVersion: job.model_version,
    nameEn: job.name_en, nameTh: job.name_th, description: job.description, status: job.status,
    progress: job.progress, glbUrl: job.glb_url || '', previewUrl: job.preview_url || '',
    errorMessage: job.error_message, arItemId: job.ar_item_id,
    createdAt: job.created_at, updatedAt: job.updated_at, completedAt: job.completed_at,
  }
}

async function loadJob(id: string, user: { id: string; role: string }) {
  const values: unknown[] = [id]
  const owner = user.role === 'developer' ? '' : ' AND created_by=$2::uuid'
  if (user.role !== 'developer') values.push(user.id)
  const result = await queryDb<Job>(`SELECT * FROM model_generation_jobs WHERE id=$1::uuid${owner} LIMIT 1`, values)
  if (!result.rows[0]) throw new ApiError('ไม่พบงานสร้างโมเดลหรือคุณไม่มีสิทธิ์เข้าถึง', 404, 'NOT_FOUND')
  return result.rows[0]
}

async function downloadModel(url: string) {
  const response = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(60_000) })
  if (!response.ok) throw new Error(`Model download returned ${response.status}`)
  const declaredSize = Number(response.headers.get('content-length') || 0)
  if (declaredSize > MAX_MODEL_SIZE) throw new Error('Generated model exceeds 80 MB')
  const bytes = Buffer.from(await response.arrayBuffer())
  if (!bytes.length || bytes.length > MAX_MODEL_SIZE) throw new Error('Generated model file is empty or exceeds 80 MB')
  return { bytes, mimeType: response.headers.get('content-type')?.split(';')[0] || 'model/gltf-binary' }
}

export async function GET(request: NextRequest, context: { params: Promise<{ taskId: string }> }) {
  try {
    const user = await guardApi(request, { roles: ['teacher', 'developer'], maxRequests: 60 })
    const { taskId } = await context.params
    if (!UUID.test(taskId)) throw new ApiError('รหัสงานสร้างโมเดลไม่ถูกต้อง', 400, 'VALIDATION_ERROR')
    const job = await loadJob(taskId, user)
    if (finalStatuses.has(job.status)) return NextResponse.json({ job: publicJob(job) }, { headers: { 'Cache-Control': 'private, no-store' } })
    if (!job.external_task_id) throw new ApiError('งานนี้ไม่มีรหัสอ้างอิงจาก Tripo', 409, 'MISSING_EXTERNAL_TASK')

    const setting = await getTripoSetting()
    if (!setting.apiKey) throw new ApiError('ไม่พบ Tripo API Key ที่ใช้สร้างงานนี้', 503, 'TRIPO_NOT_CONFIGURED')
    let response: Response
    try {
      response = await fetch(`https://api.tripo3d.ai/v2/openapi/task/${encodeURIComponent(job.external_task_id)}`, {
        headers: { Authorization: `Bearer ${setting.apiKey}` }, cache: 'no-store', signal: AbortSignal.timeout(30_000),
      })
    } catch (error) {
      console.error('Tripo polling failed:', getErrorMessage(error))
      throw new ApiError('ไม่สามารถตรวจสถานะจาก Tripo ได้', 502, 'TRIPO_UNAVAILABLE')
    }
    const payload = await response.json().catch(() => ({})) as TripoTaskResponse
    if (!response.ok || payload.code !== 0 || !payload.data?.status) {
      throw new ApiError('Tripo ไม่สามารถส่งสถานะงานกลับมาได้', response.status === 429 ? 429 : 502, 'TRIPO_STATUS_FAILED')
    }

    const status = payload.data.status.toLowerCase()
    const allowed = ['queued','running','success','failed','cancelled','banned','expired','unknown']
    const normalizedStatus = allowed.includes(status) ? status : 'unknown'
    const progress = Math.max(0, Math.min(100, Number(payload.data.progress) || 0))
    const modelUrl = payload.data.output?.pbr_model || payload.data.output?.model || ''
    const previewUrl = payload.data.output?.rendered_image || ''

    if (normalizedStatus === 'success') {
      if (!modelUrl) throw new ApiError('Tripo สร้างงานสำเร็จแต่ไม่พบไฟล์โมเดล', 502, 'MODEL_URL_MISSING')
      let downloaded
      try {
        downloaded = await downloadModel(modelUrl)
      } catch (error) {
        await queryDb(`UPDATE model_generation_jobs SET progress=100,error_message=$2,raw_response=$3::jsonb,updated_at=NOW() WHERE id=$1::uuid`, [job.id, `รอดาวน์โหลดไฟล์: ${getErrorMessage(error).slice(0, 300)}`, JSON.stringify(payload)])
        throw new ApiError('สร้างโมเดลสำเร็จแต่ยังบันทึกไฟล์ไม่ได้ ระบบจะลองใหม่ในการ polling ครั้งถัดไป', 502, 'MODEL_PERSIST_RETRY')
      }
      const completed = await withTransaction(async client => {
        const locked = await client.query<Job>('SELECT * FROM model_generation_jobs WHERE id=$1::uuid FOR UPDATE', [job.id])
        if (locked.rows[0]?.status === 'success') return locked.rows[0]
        const asset = await client.query<{ id: string }>(`
          INSERT INTO generated_model_assets(owner_id,file_name,mime_type,size_bytes,file_data)
          VALUES($1::uuid,$2,$3,$4,$5) RETURNING id
        `, [job.created_by, `${job.name_en.replace(/[^a-z0-9_-]+/gi, '-').slice(0, 80) || 'tripo-model'}.glb`, downloaded.mimeType, downloaded.bytes.length, downloaded.bytes])
        const arItemId = job.ar_item_id || `ar-${randomUUID()}`
        const internalUrl = `/api/3d/assets/${asset.rows[0].id}`
        await client.query(`
          INSERT INTO ar_items(id,name_en,name_th,description,image_url,glb_url,created_by)
          VALUES($1,$2,$3,$4,$5,$6,$7::uuid)
          ON CONFLICT(id) DO UPDATE SET image_url=EXCLUDED.image_url,glb_url=EXCLUDED.glb_url,updated_at=NOW()
        `, [arItemId, job.name_en, job.name_th, job.description, previewUrl || null, internalUrl, job.created_by])
        const updated = await client.query<Job>(`
          UPDATE model_generation_jobs SET status='success',progress=100,asset_id=$2::uuid,ar_item_id=$3,
            glb_url=$4,preview_url=$5,error_message=NULL,raw_response=$6::jsonb,completed_at=NOW(),updated_at=NOW()
          WHERE id=$1::uuid RETURNING *
        `, [job.id, asset.rows[0].id, arItemId, internalUrl, previewUrl || null, JSON.stringify(payload)])
        await client.query(`
          INSERT INTO audit_logs(actor_id,action,entity_type,entity_id,details_json)
          VALUES($1::uuid,'complete_3d_generation','model_generation_job',$2::text,jsonb_build_object('arItemId',$3::text,'assetId',$4::text))
        `, [job.created_by, job.id, arItemId, asset.rows[0].id])
        return updated.rows[0]
      })
      return NextResponse.json({ job: publicJob(completed) }, { headers: { 'Cache-Control': 'private, no-store' } })
    }

    const isFinal = ['failed','cancelled','banned','expired'].includes(normalizedStatus)
    const updated = await queryDb<Job>(`
      UPDATE model_generation_jobs SET status=$2,progress=$3,preview_url=COALESCE(NULLIF($4,''),preview_url),
        error_message=$5,raw_response=$6::jsonb,updated_at=NOW(),completed_at=CASE WHEN $7 THEN NOW() ELSE completed_at END
      WHERE id=$1::uuid RETURNING *
    `, [job.id, normalizedStatus, progress, previewUrl, payload.data.error_msg || null, JSON.stringify(payload), isFinal])
    return NextResponse.json({ job: publicJob(updated.rows[0]) }, { headers: { 'Cache-Control': 'private, no-store' } })
  } catch (error) {
    return apiErrorResponse(error)
  }
}
