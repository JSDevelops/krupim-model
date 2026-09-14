import { existsSync, unlinkSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { randomUUID } from 'node:crypto'
import { CookieSession, getDbClient, loadEnv } from './test-helper.mjs'

loadEnv()

const baseUrl = (process.argv[2] || process.env.TEST_BASE_URL || 'http://localhost:3000').replace(/\/$/, '')
console.log(`Starting Local File Upload Test against ${baseUrl}...`)

const adminSession = new CookieSession(baseUrl)
const headers = { 'X-Forwarded-For': '10.45.45.45' }

// 1. Admin login
const adminLogin = await adminSession.postJson('/api/auth/login', {
  email: 'admin@local.test',
  password: 'Admin123!',
  selectedRole: 'developer',
}, headers)

if (adminLogin.status !== 200) {
  throw new Error(`Admin login failed: ${adminLogin.status}`)
}

let teacher = null
let student = null
let storageName = ''
const classId = randomUUID()
const assignmentId = randomUUID()
let dbClient = null

try {
  dbClient = await getDbClient()

  const suffix = randomUUID().replace(/-/g, '').slice(0, 10)
  const teacherEmail = `upload-teacher-${suffix}@local.test`
  const studentEmail = `upload-student-${suffix}@local.test`

  // 2. Create teacher & student accounts
  const teacherRes = await adminSession.postJson('/api/admin/users', {
    name: 'Upload Teacher',
    email: teacherEmail,
    password: 'Teacher12345!',
    role: 'teacher',
    status: 'active',
    schoolName: 'Local Test',
  }, headers)
  teacher = teacherRes.data

  const studentRes = await adminSession.postJson('/api/admin/users', {
    name: 'Upload Student',
    email: studentEmail,
    password: 'Student12345!',
    role: 'student',
    status: 'active',
    schoolName: 'Local Test',
  }, headers)
  student = studentRes.data

  // 3. Prepare test classes & assignments in DB
  await dbClient.query(
    'INSERT INTO classes(id, teacher_id, name) VALUES($1, $2, \'Upload Test\')',
    [classId, teacher.id]
  )
  await dbClient.query(
    'INSERT INTO class_students(class_id, student_id) VALUES($1, $2)',
    [classId, student.id]
  )
  await dbClient.query(
    'INSERT INTO assignments(id, class_id, teacher_id, title) VALUES($1, $2, $3, \'Upload Assignment\')',
    [assignmentId, classId, teacher.id]
  )

  // 4. Student login
  const studentSession = new CookieSession(baseUrl)
  const studentLogin = await studentSession.postJson('/api/auth/login', {
    email: studentEmail,
    password: 'Student12345!',
    selectedRole: 'student',
  }, { 'X-Forwarded-For': '10.45.45.46' })

  if (studentLogin.status !== 200) {
    throw new Error(`Student login failed: ${studentLogin.status}`)
  }

  // 5. Native FormData upload to /api/student/files
  const formData = new FormData()
  formData.append('assignmentId', assignmentId)
  const fileContent = 'Sample upload test content from Node.js script'
  const fileBlob = new Blob([fileContent], { type: 'text/plain' })
  formData.append('file', fileBlob, 'README.md')

  const uploadRes = await studentSession.request('/api/student/files', {
    method: 'POST',
    headers: { 'X-Forwarded-For': '10.45.45.47' },
    body: formData,
  })

  if (!uploadRes.ok) {
    const errText = await uploadRes.text()
    throw new Error(`Upload request failed with ${uploadRes.status}: ${errText}`)
  }

  const upload = await uploadRes.json()
  if (!upload.file?.id || !upload.file?.url) {
    throw new Error('Upload response missing file metadata')
  }

  // 6. Student submits assignment
  const submissionRes = await studentSession.postJson('/api/student/assignments', {
    assignmentId,
    attachmentName: upload.file.name,
    attachmentUrl: upload.file.url,
  }, { 'X-Forwarded-For': '10.45.45.48' })

  if (submissionRes.status !== 201) {
    throw new Error(`Assignment submission returned ${submissionRes.status} instead of 201`)
  }

  // 7. Teacher login & download assignment
  const teacherSession = new CookieSession(baseUrl)
  const teacherLogin = await teacherSession.postJson('/api/auth/login', {
    email: teacherEmail,
    password: 'Teacher12345!',
    selectedRole: 'teacher',
  }, { 'X-Forwarded-For': '10.45.45.49' })

  if (teacherLogin.status !== 200) {
    throw new Error(`Teacher login failed: ${teacherLogin.status}`)
  }

  const downloadRes = await teacherSession.request(upload.file.url, {
    headers: { 'X-Forwarded-For': '10.45.45.50' },
  })

  if (downloadRes.status !== 200) {
    throw new Error(`Teacher file download returned ${downloadRes.status} instead of 200`)
  }

  // 8. Verify storage file path
  const storageRes = await dbClient.query('SELECT storage_name FROM stored_files WHERE id = $1', [upload.file.id])
  storageName = (storageRes.rows[0]?.storage_name || '').trim()

  const workspaceRoot = resolve(process.cwd(), '..')
  const uploadRoot = resolve(workspaceRoot, '.data', 'uploads')
  const storedPath = join(uploadRoot, storageName)

  // 9. Teacher deletes class -> should cleanup assignment & stored file
  const deleteClass = await teacherSession.delete(`/api/teacher/classes?type=class&classId=${classId}`, {
    'X-Forwarded-For': '10.45.45.51',
  })

  if (deleteClass.status !== 200) {
    throw new Error(`Delete class returned ${deleteClass.status}`)
  }

  if (existsSync(storedPath)) {
    throw new Error('Class deletion did not remove its stored assignment file')
  }

  storageName = ''
  console.log('✓ PASS local upload, teacher download, and class file cleanup')
} finally {
  if (dbClient) {
    await dbClient.query('DELETE FROM classes WHERE id = $1', [classId]).catch(() => null)
    await dbClient.end().catch(() => null)
  }
  if (teacher?.id) {
    await adminSession.delete(`/api/admin/users?id=${teacher.id}`, headers).catch(() => null)
  }
  if (student?.id) {
    await adminSession.delete(`/api/admin/users?id=${student.id}`, headers).catch(() => null)
  }
  if (storageName && /^[0-9a-f-]{36}\.[a-z0-9]{2,5}$/.test(storageName)) {
    const workspaceRoot = resolve(process.cwd(), '..')
    const uploadRoot = resolve(workspaceRoot, '.data', 'uploads')
    const target = join(uploadRoot, storageName)
    if (existsSync(target)) {
      unlinkSync(target)
    }
  }
}
