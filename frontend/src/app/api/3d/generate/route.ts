import { randomUUID } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { queryDb, withTransaction } from '@/lib/db'
import { getTripoSetting } from '@/lib/tripoSettings'
import { ApiError, apiErrorResponse, getErrorMessage, guardApi } from '../../_lib/auth'

export const runtime = 'nodejs'

type TripoCreateResponse = { code?: number; data?: { task_id?: string } }

const jobSelect = `
  SELECT j.id,j.provider,j.external_task_id AS "externalTaskId",j.prompt,
         j.negative_prompt AS "negativePrompt",j.model_version AS "modelVersion",
         j.name_en AS "nameEn",j.name_th AS "nameTh",j.description,j.status,j.progress,
         j.glb_url AS "glbUrl",j.preview_url AS "previewUrl",j.error_message AS "errorMessage",
         j.ar_item_id AS "arItemId",j.created_at AS "createdAt",j.updated_at AS "updatedAt",
         j.completed_at AS "completedAt"
  FROM model_generation_jobs j
`

function requiredText(value: unknown, label: string, max: number) {
  const normalized = typeof value === 'string' ? value.trim() : ''
  if (!normalized) throw new ApiError(`กรุณากรอก${label}`, 400, 'VALIDATION_ERROR')
  if (normalized.length > max) throw new ApiError(`${label}ยาวเกิน ${max} ตัวอักษร`, 400, 'VALIDATION_ERROR')
  return normalized
}

function optionalText(value: unknown, label: string, max: number) {
  const normalized = typeof value === 'string' ? value.trim() : ''
  if (normalized.length > max) throw new ApiError(`${label}ยาวเกิน ${max} ตัวอักษร`, 400, 'VALIDATION_ERROR')
  return normalized
}

function developmentPreview(topic: string) {
  const lower = topic.toLowerCase()
  if (lower.includes('glass') || lower.includes('wine') || lower.includes('แก้ว')) return 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/WineGlass/glTF-Binary/WineGlass.glb'
  if (lower.includes('teapot') || lower.includes('กา')) return 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/UtahTeapot/glTF-Binary/UtahTeapot.glb'
  if (lower.includes('bottle') || lower.includes('water') || lower.includes('ขวด')) return 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/WaterBottle/glTF-Binary/WaterBottle.glb'
  return 'https://modelviewer.dev/shared-assets/models/Astronaut.glb'
}

export async function GET(request: NextRequest) {
  try {
    const user = await guardApi(request, { roles: ['teacher', 'developer'], maxRequests: 90 })
    const filter = user.role === 'developer' ? '' : 'WHERE j.created_by=$1::uuid'
    const values = user.role === 'developer' ? [] : [user.id]
    const result = await queryDb(`${jobSelect} ${filter} ORDER BY j.created_at DESC LIMIT 100`, values)
    return NextResponse.json({ jobs: result.rows }, { headers: { 'Cache-Control': 'private, no-store' } })
  } catch (error) {
    return apiErrorResponse(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await guardApi(request, { roles: ['teacher', 'developer'], maxRequests: 6 })
    const body = await request.json() as Record<string, unknown>
    const prompt = requiredText(body.prompt ?? body.topic, 'คำอธิบายโมเดล', 1_024)
    const negativePrompt = optionalText(body.negativePrompt, 'Negative prompt', 255)
    const nameEn = requiredText(body.nameEn, 'ชื่อภาษาอังกฤษ', 180)
    const nameTh = requiredText(body.nameTh, 'ชื่อภาษาไทย', 180)
    const description = optionalText(body.description, 'คำอธิบาย', 3_000)
    const setting = await getTripoSetting()

    if (setting.apiKey) {
      let response: Response
      try {
        response = await fetch('https://api.tripo3d.ai/v2/openapi/task', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${setting.apiKey}` },
          body: JSON.stringify({
            type: 'text_to_model', prompt,
            ...(negativePrompt ? { negative_prompt: negativePrompt } : {}),
            model_version: setting.modelVersion,
            pbr: true, texture: true, render_image: true,
          }),
          signal: AbortSignal.timeout(30_000),
        })
      } catch (error) {
        console.error('Tripo create request failed:', getErrorMessage(error))
        throw new ApiError('ไม่สามารถเชื่อมต่อ Tripo ได้', 502, 'TRIPO_UNAVAILABLE')
      }
      const payload = await response.json().catch(() => ({})) as TripoCreateResponse
      if (!response.ok || payload.code !== 0 || !payload.data?.task_id) {
        throw new ApiError('Tripo ไม่สามารถรับงานสร้างโมเดลได้ กรุณาตรวจสอบเครดิตและ API Key', response.status === 429 ? 429 : 502, 'TRIPO_CREATE_FAILED')
      }
      const inserted = await queryDb<{ id: string }>(`
        INSERT INTO model_generation_jobs(provider,external_task_id,created_by,prompt,negative_prompt,model_version,name_en,name_th,description,status,raw_response)
        VALUES('tripo',$1,$2::uuid,$3,$4,$5,$6,$7,$8,'queued',$9::jsonb)
        RETURNING id
      `, [payload.data.task_id, user.id, prompt, negativePrompt || null, setting.modelVersion, nameEn, nameTh, description || null, JSON.stringify(payload)])
      await queryDb(`
        INSERT INTO audit_logs(actor_id,action,entity_type,entity_id,details_json)
        VALUES($1::uuid,'create_3d_generation','model_generation_job',$2::text,jsonb_build_object('provider','tripo','modelVersion',$3::text))
      `, [user.id, inserted.rows[0].id, setting.modelVersion])
      const job = await queryDb(`${jobSelect} WHERE j.id=$1::uuid`, [inserted.rows[0].id])
      return NextResponse.json({ job: job.rows[0] }, { status: 202 })
    }

    if (process.env.NODE_ENV === 'production') {
      throw new ApiError('ยังไม่ได้ตั้งค่า Tripo API Key ในหน้าแอดมิน', 503, 'TRIPO_NOT_CONFIGURED')
    }

    const previewUrl = developmentPreview(prompt)
    const job = await withTransaction(async client => {
      const arItemId = `ar-${randomUUID()}`
      await client.query(`
        INSERT INTO ar_items(id,name_en,name_th,description,glb_url,created_by)
        VALUES($1,$2,$3,$4,$5,$6::uuid)
      `, [arItemId, nameEn, nameTh, description, previewUrl, user.id])
      const created = await client.query<{ id: string }>(`
        INSERT INTO model_generation_jobs(provider,created_by,ar_item_id,prompt,negative_prompt,model_version,name_en,name_th,description,status,progress,glb_url,completed_at)
        VALUES('development-preview',$1::uuid,$2,$3,$4,$5,$6,$7,$8,'preview',100,$9,NOW())
        RETURNING id
      `, [user.id, arItemId, prompt, negativePrompt || null, setting.modelVersion, nameEn, nameTh, description || null, previewUrl])
      await client.query(`
        INSERT INTO audit_logs(actor_id,action,entity_type,entity_id,details_json)
        VALUES($1::uuid,'create_3d_preview','model_generation_job',$2::text,jsonb_build_object('arItemId',$3::text))
      `, [user.id, created.rows[0].id, arItemId])
      const result = await client.query(`${jobSelect} WHERE j.id=$1::uuid`, [created.rows[0].id])
      return result.rows[0]
    })
    return NextResponse.json({ job }, { status: 201 })
  } catch (error) {
    return apiErrorResponse(error)
  }
}
