import { hash } from 'bcryptjs'
import { NextRequest, NextResponse } from 'next/server'
import { queryDb, withTransaction, type DbResult } from '@/lib/db'
import { apiErrorResponse, guardApi, getDatabase, ApiError } from '../../_lib/auth'
import { passwordPolicyError } from '@/lib/passwordPolicy'
import { removeLocalStoredFiles } from '@/lib/localFileStorage'

const developerOnly = ['developer'] as const
const managedRoles = ['teacher', 'student'] as const
const managedStatuses = ['active', 'inactive', 'pending'] as const

type ManagedRole = (typeof managedRoles)[number]
type ManagedStatus = (typeof managedStatuses)[number]

function isManagedRole(value: unknown): value is ManagedRole {
  return typeof value === 'string' && managedRoles.includes(value as ManagedRole)
}

function isManagedStatus(value: unknown): value is ManagedStatus {
  return typeof value === 'string' && managedStatuses.includes(value as ManagedStatus)
}

function readAccountFields(body: Record<string, unknown>) {
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  const schoolName = typeof body.school === 'string' ? body.school.trim() : ''
  const role = body.role
  const status = body.status

  if (!name || !/^\S+@\S+\.\S+$/.test(email) || !isManagedRole(role) || !isManagedStatus(status)) {
    throw new ApiError('กรุณาระบุชื่อ อีเมล บทบาท และสถานะให้ถูกต้อง', 400, 'INVALID_INPUT')
  }
  if (status === 'pending' && role !== 'teacher') {
    throw new ApiError('สถานะรออนุมัติใช้ได้เฉพาะบัญชีครูผู้สอน', 400, 'INVALID_INPUT')
  }

  return { name, email, schoolName, role, status }
}

async function resolveSchoolId(
  client: Parameters<Parameters<typeof withTransaction>[0]>[0],
  schoolName: string,
) {
  if (!schoolName) return null
  const school = await client.query<{ id: string }>(`
    INSERT INTO schools (name) VALUES ($1)
    ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
    RETURNING id
  `, [schoolName])
  return school.rows[0].id
}

async function releaseOwnershipReferences(
  client: Parameters<Parameters<typeof withTransaction>[0]>[0],
  id: string,
) {
  await client.query('UPDATE ai_provider_settings SET updated_by = NULL WHERE updated_by = $1', [id])
  await client.query('UPDATE classes SET teacher_id = NULL WHERE teacher_id = $1', [id])
  await client.query('UPDATE courses SET created_by = NULL WHERE created_by = $1', [id])
  await client.query('UPDATE assessments SET created_by = NULL WHERE created_by = $1', [id])
  await client.query('UPDATE student_assessments SET graded_by = NULL WHERE graded_by = $1', [id])
  await client.query('UPDATE assignments SET teacher_id = NULL WHERE teacher_id = $1', [id])
  await client.query('UPDATE ar_items SET created_by = NULL WHERE created_by = $1', [id])
}

function databaseErrorResponse(error: unknown) {
  const dbError = error as Error & { code?: string }
  if (dbError.code === '23505') {
    return NextResponse.json({ error: 'อีเมลนี้ถูกใช้งานแล้ว', code: 'EMAIL_EXISTS' }, { status: 409 })
  }
  return apiErrorResponse(error)
}

export async function GET(req: NextRequest) {
  try {
    await guardApi(req, { roles: developerOnly, maxRequests: 30 })
    const db = getDatabase()
    const { data, error } = await db
      .from('profiles')
      .select('id,name,email,role,requested_role,approval_status,school_name,avatar_url,created_at')
      .order('created_at', { ascending: false }) as DbResult

    if (error) throw new ApiError('Unable to load users', 500, 'DATABASE_ERROR')
    return NextResponse.json({ users: data ?? [] })
  } catch (error) {
    return apiErrorResponse(error)
  }
}

export async function POST(req: NextRequest) {
  try {
    const actor = await guardApi(req, { roles: developerOnly, maxRequests: 15 })
    const body = await req.json() as Record<string, unknown>
    const { name, email, schoolName, role, status } = readAccountFields(body)
    const password = typeof body.password === 'string' ? body.password : ''
    const passwordError = passwordPolicyError(password)
    if (passwordError) throw new ApiError(passwordError, 400, 'WEAK_PASSWORD')

    const passwordHash = await hash(password, 12)
    const id = await withTransaction(async client => {
      const schoolId = await resolveSchoolId(client, schoolName)
      const user = await client.query<{ id: string }>(`
        INSERT INTO app_users (email, password_hash) VALUES ($1, $2) RETURNING id
      `, [email, passwordHash])
      await client.query(`
        INSERT INTO profiles (
          id, name, email, role, requested_role, approval_status, school_id, school_name
        ) VALUES ($1, $2, $3, $4, $4, $5, $6, $7)
      `, [user.rows[0].id, name, email, role, status, schoolId, schoolName || null])
      return user.rows[0].id
    })

    await queryDb(`INSERT INTO audit_logs(actor_id,action,entity_type,entity_id,details_json) VALUES($1::uuid,'create_user','profile',$2,$3::jsonb)`, [actor.id, id, JSON.stringify({ email, role, status })])
    return NextResponse.json({ id }, { status: 201 })
  } catch (error) {
    return databaseErrorResponse(error)
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const actor = await guardApi(req, { roles: developerOnly, maxRequests: 30 })
    const body = await req.json() as Record<string, unknown>
    const id = typeof body.id === 'string' ? body.id : ''
    const action = typeof body.action === 'string' ? body.action : ''
    if (!id) throw new ApiError('User id is required', 400, 'INVALID_INPUT')
    if (id === actor.id) throw new ApiError('ไม่สามารถแก้ไขบัญชีผู้ดูแลที่กำลังใช้งานได้', 400, 'SELF_MUTATION')

    if (action === 'update') {
      const { name, email, schoolName, role, status } = readAccountFields(body)
      const password = typeof body.password === 'string' ? body.password : ''
      const passwordError = password ? passwordPolicyError(password) : null
      if (passwordError) throw new ApiError(passwordError, 400, 'WEAK_PASSWORD')
      const passwordHash = password ? await hash(password, 12) : null

      await withTransaction(async client => {
        const target = await client.query<{ role: string }>(
          'SELECT role FROM profiles WHERE id = $1 FOR UPDATE',
          [id],
        )
        if (!target.rows[0]) throw new ApiError('ไม่พบบัญชีผู้ใช้งาน', 404, 'NOT_FOUND')
        if (target.rows[0].role === 'developer') {
          throw new ApiError('ไม่สามารถแก้ไขบัญชีผู้ดูแลระบบจากหน้านี้ได้', 403, 'PROTECTED_ACCOUNT')
        }

        const schoolId = await resolveSchoolId(client, schoolName)
        if (target.rows[0].role === 'teacher' && role === 'student') {
          await releaseOwnershipReferences(client, id)
        }
        if (passwordHash) {
          await client.query(
            'UPDATE app_users SET email = $1, password_hash = $2, session_version=session_version+1, updated_at = NOW() WHERE id = $3',
            [email, passwordHash, id],
          )
        } else {
          await client.query('UPDATE app_users SET email = $1, session_version=session_version+1, updated_at = NOW() WHERE id = $2', [email, id])
        }
        await client.query(`
          UPDATE profiles
          SET name = $1, email = $2, role = $3, requested_role = $3,
              approval_status = $4, school_id = $5, school_name = $6, updated_at = NOW()
          WHERE id = $7
        `, [name, email, role, status, schoolId, schoolName || null, id])
      })
      await queryDb(`INSERT INTO audit_logs(actor_id,action,entity_type,entity_id,details_json) VALUES($1::uuid,'update_user','profile',$2,$3::jsonb)`, [actor.id, id, JSON.stringify({ email, role, status })])
      return NextResponse.json({ ok: true })
    }

    if (action === 'reset_password') {
      const password = typeof body.password === 'string' ? body.password : ''
      const passwordError = passwordPolicyError(password)
      if (passwordError) throw new ApiError(passwordError, 400, 'WEAK_PASSWORD')
      const passwordHash = await hash(password, 12)
      const result = await queryDb(`
        UPDATE app_users AS account
        SET password_hash = $1, session_version=session_version+1, updated_at = NOW()
        FROM profiles AS profile
        WHERE account.id = $2 AND profile.id = account.id AND profile.role IN ('teacher', 'student')
      `, [passwordHash, id])
      if (result.rowCount !== 1) throw new ApiError('User not found', 404, 'NOT_FOUND')
      await queryDb(`INSERT INTO audit_logs(actor_id,action,entity_type,entity_id,details_json) VALUES($1::uuid,'reset_password','profile',$2,'{}'::jsonb)`, [actor.id, id])
      return NextResponse.json({ ok: true })
    }

    let result
    if (action === 'approve') {
      result = await queryDb(`
        UPDATE profiles SET role = 'teacher', requested_role = 'teacher', approval_status = 'active', updated_at = NOW()
        WHERE id = $1 AND role <> 'developer'
      `, [id])
    } else if (action === 'reject') {
      result = await queryDb(`
        UPDATE profiles SET role = 'student', requested_role = 'student', approval_status = 'inactive', updated_at = NOW()
        WHERE id = $1 AND role <> 'developer'
      `, [id])
    } else if (action === 'toggle') {
      result = await queryDb(`
        UPDATE profiles
        SET approval_status = CASE WHEN approval_status = 'active' THEN 'inactive' ELSE 'active' END,
            updated_at = NOW()
        WHERE id = $1 AND role IN ('teacher', 'student')
      `, [id])
    } else {
      throw new ApiError('Unsupported action', 400, 'INVALID_INPUT')
    }

    if (result.rowCount !== 1) throw new ApiError('User not found', 404, 'NOT_FOUND')
    if (action === 'reject' || action === 'toggle' || action === 'approve') {
      await queryDb('UPDATE app_users SET session_version=session_version+1,updated_at=NOW() WHERE id=$1::uuid', [id])
    }
    if (action === 'approve') {
      await queryDb(`
        INSERT INTO notifications (user_id,title,message,type,link_url)
        VALUES ($1::uuid,'บัญชีครูได้รับการอนุมัติแล้ว','คุณสามารถเข้าใช้งาน Teacher Console ได้แล้ว','success','/teacher/dashboard')
      `, [id])
    }
    await queryDb(`INSERT INTO audit_logs(actor_id,action,entity_type,entity_id,details_json) VALUES($1::uuid,$2,'profile',$3,'{}'::jsonb)`, [actor.id, action, id])
    return NextResponse.json({ ok: true })
  } catch (error) {
    return databaseErrorResponse(error)
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const actor = await guardApi(req, { roles: developerOnly, maxRequests: 12 })
    const id = req.nextUrl.searchParams.get('id') || ''
    if (!id) throw new ApiError('User id is required', 400, 'INVALID_INPUT')
    if (id === actor.id) throw new ApiError('ไม่สามารถลบบัญชีผู้ดูแลที่กำลังใช้งานได้', 400, 'SELF_DELETE')

    const storageNames = await withTransaction(async client => {
      const target = await client.query<{ role: string }>(
        'SELECT role FROM profiles WHERE id = $1 FOR UPDATE',
        [id],
      )
      if (!target.rows[0]) throw new ApiError('ไม่พบบัญชีผู้ใช้งาน', 404, 'NOT_FOUND')
      if (target.rows[0].role === 'developer') {
        throw new ApiError('ไม่สามารถลบบัญชีผู้ดูแลระบบจากหน้านี้ได้', 403, 'PROTECTED_ACCOUNT')
      }

      const storedFiles = await client.query<{ storage_name: string }>('SELECT storage_name FROM stored_files WHERE owner_id=$1::uuid', [id])

      // Preserve teaching content while releasing nullable ownership references.
      await releaseOwnershipReferences(client, id)
      const deleted = await client.query('DELETE FROM app_users WHERE id = $1 RETURNING id', [id])
      if (deleted.rowCount !== 1) throw new ApiError('ไม่พบบัญชีผู้ใช้งาน', 404, 'NOT_FOUND')
      return storedFiles.rows.map(file => file.storage_name)
    })

    await removeLocalStoredFiles(storageNames)

    await queryDb(`INSERT INTO audit_logs(actor_id,action,entity_type,entity_id,details_json) VALUES($1::uuid,'delete_user','profile',$2,'{}'::jsonb)`, [actor.id, id])

    return NextResponse.json({ ok: true })
  } catch (error) {
    return databaseErrorResponse(error)
  }
}
