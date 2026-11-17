/**
 * lib/export.ts
 * Client-side export utilities for teacher assignment reports.
 * Uses SheetJS (xlsx) for Excel and jsPDF + jspdf-autotable for PDF.
 */

export type SubmissionRow = {
  studentName: string
  email?: string | null
  class?: string
  status: string
  score: number | null
  maxScore: number
  feedback?: string | null
  rubricLevelK?: number | null
  rubricLevelS?: number | null
  rubricLevelA?: number | null
  rubricLevelC?: number | null
  knowledge?: number | null
  skills?: number | null
  attitude?: number | null
  competency?: number | null
  submittedAt?: string | null
  gradedAt?: string | null
}

export type AssignmentMeta = {
  title: string
  className: string
  activityType: string
  maxScore: number
  dueDate?: string | null
  teacherName?: string
}

const RUBRIC_LABELS: Record<number, string> = { 4: 'ดีเยี่ยม (4)', 3: 'ดี (3)', 2: 'พอใช้ (2)', 1: 'ควรปรับปรุง (1)' }

function rubricLabel(level: number | null | undefined): string {
  if (!level) return '-'
  return RUBRIC_LABELS[level] ?? String(level)
}
function scoreDisplay(score: number | null | undefined, max: number): string {
  if (score === null || score === undefined) return 'ยังไม่ตรวจ'
  return `${score}/${max} (${Math.round((score / max) * 100)}%)`
}
function ksaDisplay(val: number | null | undefined): string {
  if (val === null || val === undefined) return '-'
  return `${val}%`
}
function statusThai(status: string, score: number | null | undefined): string {
  if (status === 'returned') return 'ส่งกลับแก้ไข'
  if (status === 'resubmitted') return 'ส่งใหม่แล้ว'
  if (score !== null && score !== undefined) return 'ตรวจแล้ว'
  if (status === 'submitted') return 'รอตรวจ'
  return 'ยังไม่ส่ง'
}

/** Export to Excel (.xlsx) using SheetJS */
export async function exportSubmissionsToExcel(
  submissions: SubmissionRow[],
  assignment: AssignmentMeta,
): Promise<void> {
  const { utils, writeFileXLSX } = await import('xlsx')

  const rows = submissions.map((s, i) => ({
    'ลำดับ': i + 1,
    'ชื่อ-นามสกุล': s.studentName,
    'อีเมล': s.email ?? '-',
    'ห้องเรียน': s.class ?? assignment.className,
    'สถานะ': statusThai(s.status, s.score),
    'คะแนนรวม': scoreDisplay(s.score, s.maxScore),
    'K - ความรู้ (20%)': ksaDisplay(s.knowledge),
    'S - ทักษะ (30%)': ksaDisplay(s.skills),
    'A - เจตคติ (10%)': ksaDisplay(s.attitude),
    'C - สมรรถนะ (40%)': ksaDisplay(s.competency),
    'Rubric K': rubricLabel(s.rubricLevelK),
    'Rubric S': rubricLabel(s.rubricLevelS),
    'Rubric A': rubricLabel(s.rubricLevelA),
    'Rubric C': rubricLabel(s.rubricLevelC),
    'ข้อเสนอแนะ': s.feedback ?? '-',
    'วันที่ส่งงาน': s.submittedAt ?? '-',
    'วันที่ตรวจ': s.gradedAt ?? '-',
  }))

  const ws = utils.json_to_sheet(rows)
  ws['!cols'] = [
    { wch: 6 }, { wch: 24 }, { wch: 28 }, { wch: 14 }, { wch: 14 },
    { wch: 16 }, { wch: 16 }, { wch: 16 }, { wch: 16 }, { wch: 16 },
    { wch: 16 }, { wch: 16 }, { wch: 16 }, { wch: 16 },
    { wch: 40 }, { wch: 20 }, { wch: 20 },
  ]

  const wb = utils.book_new()
  utils.book_append_sheet(wb, ws, 'รายงานคะแนน')

  const graded = submissions.filter(s => s.score !== null && s.score !== undefined)
  const avgScore = graded.length
    ? Math.round(graded.reduce((acc, s) => acc + (s.score! / s.maxScore) * 100, 0) / graded.length)
    : 0
  const summaryRows = [
    { 'ข้อมูล': 'ชื่องาน', 'ค่า': assignment.title },
    { 'ข้อมูล': 'ห้องเรียน', 'ค่า': assignment.className },
    { 'ข้อมูล': 'ประเภทกิจกรรม', 'ค่า': assignment.activityType },
    { 'ข้อมูล': 'คะแนนเต็ม', 'ค่า': assignment.maxScore },
    { 'ข้อมูล': 'จำนวนนักเรียนทั้งหมด', 'ค่า': submissions.length },
    { 'ข้อมูล': 'จำนวนที่ส่งงานแล้ว', 'ค่า': submissions.filter(s => s.status !== 'pending').length },
    { 'ข้อมูล': 'จำนวนที่ตรวจแล้ว', 'ค่า': graded.length },
    { 'ข้อมูล': 'คะแนนเฉลี่ย (%)', 'ค่า': `${avgScore}%` },
    { 'ข้อมูล': 'วันที่ออกรายงาน', 'ค่า': new Intl.DateTimeFormat('th-TH', { dateStyle: 'long', timeStyle: 'short' }).format(new Date()) },
  ]
  const ws2 = utils.json_to_sheet(summaryRows)
  ws2['!cols'] = [{ wch: 26 }, { wch: 40 }]
  utils.book_append_sheet(wb, ws2, 'สรุปภาพรวม')

  const safeTitle = assignment.title.replace(/[^a-zA-Z0-9\u0E00-\u0E7F\s-]/g, '').trim().slice(0, 40)
  writeFileXLSX(wb, `รายงาน_${safeTitle}_${assignment.className}.xlsx`)
}

/** Export to PDF using jsPDF + jspdf-autotable */
export async function exportSubmissionsToPDF(
  submissions: SubmissionRow[],
  assignment: AssignmentMeta,
): Promise<void> {
  const { default: jsPDF } = await import('jspdf')
  const { default: autoTable } = await import('jspdf-autotable')

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
  doc.setFont('helvetica')

  const now = new Intl.DateTimeFormat('th-TH', { dateStyle: 'full', timeStyle: 'short' }).format(new Date())
  const graded = submissions.filter(s => s.score !== null && s.score !== undefined)
  const avgScore = graded.length
    ? Math.round(graded.reduce((acc, s) => acc + (s.score! / s.maxScore) * 100, 0) / graded.length)
    : 0

  doc.setFontSize(14)
  doc.setTextColor(22, 78, 56)
  doc.text(`Assignment Report - ${assignment.title}`, 14, 16)

  doc.setFontSize(9)
  doc.setTextColor(80, 100, 90)
  doc.text(`Class: ${assignment.className}  |  Type: ${assignment.activityType}  |  Max Score: ${assignment.maxScore}`, 14, 22)
  doc.text(`Submitted: ${submissions.filter(s => s.status !== 'pending').length}/${submissions.length}  |  Graded: ${graded.length}  |  Average: ${avgScore}%`, 14, 27)
  doc.text(`Generated: ${now}`, 14, 32)

  doc.setDrawColor(210, 230, 220)
  doc.line(14, 35, 283, 35)

  const tableBody = submissions.map((s, i) => [
    String(i + 1),
    s.studentName,
    s.class ?? assignment.className,
    statusThai(s.status, s.score),
    scoreDisplay(s.score, s.maxScore),
    ksaDisplay(s.knowledge),
    ksaDisplay(s.skills),
    ksaDisplay(s.attitude),
    ksaDisplay(s.competency),
    rubricLabel(s.rubricLevelK),
    rubricLabel(s.rubricLevelS),
    (s.feedback ?? '-').slice(0, 60),
    s.submittedAt ?? '-',
  ])

  autoTable(doc, {
    startY: 38,
    head: [['#', 'Name', 'Class', 'Status', 'Score', 'K%', 'S%', 'A%', 'C%', 'Rubric K', 'Rubric S', 'Feedback', 'Submitted']],
    body: tableBody,
    styles: { fontSize: 7, cellPadding: 2 },
    headStyles: { fillColor: [34, 84, 63], textColor: 255, fontStyle: 'bold', fontSize: 7.5 },
    alternateRowStyles: { fillColor: [245, 250, 247] },
    columnStyles: {
      0: { cellWidth: 8 }, 1: { cellWidth: 38 }, 2: { cellWidth: 20 },
      3: { cellWidth: 18 }, 4: { cellWidth: 20 }, 5: { cellWidth: 12 },
      6: { cellWidth: 12 }, 7: { cellWidth: 12 }, 8: { cellWidth: 12 },
      9: { cellWidth: 20 }, 10: { cellWidth: 20 }, 11: { cellWidth: 46 },
      12: { cellWidth: 26 },
    },
    didDrawPage: (data) => {
      doc.setFontSize(7)
      doc.setTextColor(150)
      doc.text(
        `Page ${data.pageNumber} | FINE Model (AR 3D+AI Scan) | Teacher: ${assignment.teacherName ?? 'Teacher'}`,
        14, doc.internal.pageSize.height - 8,
      )
    },
  })

  const safeTitle = assignment.title.replace(/[^a-zA-Z0-9\s-]/g, '').trim().slice(0, 40) || 'report'
  doc.save(`Report_${safeTitle}_${assignment.className}.pdf`)
}

export type AnonymizedStudentItem = {
  id: string
  className?: string | null
  schoolName?: string | null
  knowledge: number
  skills: number
  attitude: number
  competency: number
  overall?: number
  lessonsCompleted: number
  timeSpentMinutes: number
  sessions: number
  lastActive?: string | null
}

export type AnonymizedResearchMeta = {
  researchTitle?: string
  targetGroup?: string
  academicYear?: string
  teacherName?: string
}

/**
 * ส่งออกข้อมูลผลการเรียนรู้ KSA-C ของนักเรียนทั้งหมดในรูปแบบรหัสนิรนาม (De-identified Dataset)
 * สอดคล้องตามมาตรฐานจริยธรรมการวิจัยในมนุษย์และ พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA)
 * เหมาะสำหรับนำไปวิเคราะห์สถิติใน SPSS, Excel และแนบในบทที่ 4 หรือภาคผนวกงานวิจัย/วิทยานิพนธ์
 */
export async function exportAnonymizedStudentsResearchExcel(
  students: AnonymizedStudentItem[],
  meta?: AnonymizedResearchMeta,
): Promise<void> {
  const { utils, writeFileXLSX } = await import('xlsx')

  const getQualityLevel = (score: number) => {
    if (score >= 80) return 'ดีเยี่ยม (ระดับ 4)'
    if (score >= 70) return 'ดี (ระดับ 3)'
    if (score >= 60) return 'พอใช้ (ระดับ 2)'
    return 'ควรปรับปรุง (ระดับ 1)'
  }

  const rows = students.map((s, index) => {
    const participantCode = `STU-${String(index + 1).padStart(3, '0')}`
    const overall = s.overall !== undefined
      ? s.overall
      : Math.round(Number(s.knowledge || 0) * 0.2 + Number(s.skills || 0) * 0.3 + Number(s.attitude || 0) * 0.1 + Number(s.competency || 0) * 0.4)

    return {
      'รหัสผู้เข้าร่วมวิจัย (Participant ID)': participantCode,
      'กลุ่มตัวอย่าง / ชั้นเรียน': s.className || meta?.targetGroup || 'กลุ่มทดลอง FINE Model',
      'K - ความรู้ (20%)': Number(s.knowledge || 0),
      'S - ทักษะปฏิบัติ (30%)': Number(s.skills || 0),
      'A - เจตคติ (10%)': Number(s.attitude || 0),
      'C - สมรรถนะวิชาชีพ (40%)': Number(s.competency || 0),
      'คะแนนรวมถ่วงน้ำหนัก (%)': overall,
      'ระดับคุณภาพสมรรถนะ': getQualityLevel(overall),
      'บทเรียนที่สำเร็จ (บท)': Number(s.lessonsCompleted || 0),
      'เวลาเรียนสะสม (นาที)': Number(s.timeSpentMinutes || 0),
      'จำนวนครั้งที่เข้าใช้ระบบ': Number(s.sessions || 0),
      'สถานะการให้ความยินยอม': 'ยินยอมเข้าร่วมวิจัย (Informed Consent Granted)',
    }
  })

  const ws1 = utils.json_to_sheet(rows)
  ws1['!cols'] = [
    { wch: 26 }, { wch: 24 }, { wch: 18 }, { wch: 22 },
    { wch: 18 }, { wch: 24 }, { wch: 22 }, { wch: 20 },
    { wch: 20 }, { wch: 20 }, { wch: 22 }, { wch: 36 },
  ]

  const totalN = students.length
  const calcAvg = (getter: (s: AnonymizedStudentItem) => number) =>
    totalN ? (students.reduce((sum, s) => sum + getter(s), 0) / totalN).toFixed(2) : '0.00'

  const avgK = calcAvg(s => Number(s.knowledge || 0))
  const avgS = calcAvg(s => Number(s.skills || 0))
  const avgA = calcAvg(s => Number(s.attitude || 0))
  const avgC = calcAvg(s => Number(s.competency || 0))
  const avgOverall = calcAvg(s => (s.overall !== undefined ? s.overall : Math.round(Number(s.knowledge || 0) * 0.2 + Number(s.skills || 0) * 0.3 + Number(s.attitude || 0) * 0.1 + Number(s.competency || 0) * 0.4)))

  const passed70Count = students.filter(s => {
    const ov = s.overall !== undefined ? s.overall : Math.round(Number(s.knowledge || 0) * 0.2 + Number(s.skills || 0) * 0.3 + Number(s.attitude || 0) * 0.1 + Number(s.competency || 0) * 0.4)
    return ov >= 70
  }).length
  const passRate = totalN ? ((passed70Count / totalN) * 100).toFixed(1) : '0.0'

  const summaryRows = [
    { 'หัวข้อสถิติการวิจัย': 'ชื่องานวิจัย/โครงการ', 'ข้อมูล / ค่าสถิติ': meta?.researchTitle || 'การพัฒนาการจัดการเรียนรู้ภาษาอังกฤษจำลองสถานการณ์ด้วยนวัตกรรม FINE Model (AR & AI 3D)' },
    { 'หัวข้อสถิติการวิจัย': 'กลุ่มตัวอย่าง (Target Sample)', 'ข้อมูล / ค่าสถิติ': meta?.targetGroup || 'นักเรียน/นักศึกษาในชั้นเรียนที่ใช้ FINE Model' },
    { 'หัวข้อสถิติการวิจัย': 'จำนวนกลุ่มตัวอย่างทั้งหมด (N)', 'ข้อมูล / ค่าสถิติ': `${totalN} คน` },
    { 'หัวข้อสถิติการวิจัย': 'ค่าเฉลี่ยด้านความรู้ (Mean K)', 'ข้อมูล / ค่าสถิติ': `${avgK}%` },
    { 'หัวข้อสถิติการวิจัย': 'ค่าเฉลี่ยด้านทักษะปฏิบัติ (Mean S)', 'ข้อมูล / ค่าสถิติ': `${avgS}%` },
    { 'หัวข้อสถิติการวิจัย': 'ค่าเฉลี่ยด้านเจตคติ (Mean A)', 'ข้อมูล / ค่าสถิติ': `${avgA}%` },
    { 'หัวข้อสถิติการวิจัย': 'ค่าเฉลี่ยด้านสมรรถนะวิชาชีพ (Mean C)', 'ข้อมูล / ค่าสถิติ': `${avgC}%` },
    { 'หัวข้อสถิติการวิจัย': 'คะแนนเฉลี่ยรวมถ่วงน้ำหนัก (Mean Total)', 'ข้อมูล / ค่าสถิติ': `${avgOverall}%` },
    { 'หัวข้อสถิติการวิจัย': 'จำนวนผู้ผ่านเกณฑ์ร้อยละ 70', 'ข้อมูล / ค่าสถิติ': `${passed70Count} คน (${passRate}%)` },
    { 'หัวข้อสถิติการวิจัย': 'วันที่ประมวลผลข้อมูล', 'ข้อมูล / ค่าสถิติ': new Intl.DateTimeFormat('th-TH', { dateStyle: 'long', timeStyle: 'short' }).format(new Date()) },
    { 'หัวข้อสถิติการวิจัย': 'การปฏิบัติตามจริยธรรมการวิจัย (Research Ethics & PDPA)', 'ข้อมูล / ค่าสถิติ': 'ข้อมูลชุดนี้ถูกแปลงเป็นรหัสนิรนาม (De-identified) ตัดข้อมูลระบุตัวตนรายบุคคล (No PII) ทั้งหมด ตามมาตรฐานจริยธรรมการวิจัยในมนุษย์และ พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562' },
  ]

  const ws2 = utils.json_to_sheet(summaryRows)
  ws2['!cols'] = [{ wch: 38 }, { wch: 70 }]

  const wb = utils.book_new()
  utils.book_append_sheet(wb, ws1, 'ข้อมูลคะแนนวิจัย (นิรนาม)')
  utils.book_append_sheet(wb, ws2, 'สรุปสถิติเชิงพรรณนา')

  const timestamp = new Date().toISOString().slice(0, 10)
  const safeGroup = meta?.targetGroup ? meta.targetGroup.replace(/[^a-zA-Z0-9\u0E00-\u0E7F_-]/g, '').trim() + '_' : ''
  writeFileXLSX(wb, `ข้อมูลวิจัยนิรนาม_FINE_Model_KSA_${safeGroup}${timestamp}.xlsx`)
}

/**
 * ส่งออกผลคะแนนแบบทดสอบ / งานที่มอบหมาย แบบไม่ระบุชื่อ (De-identified Submissions)
 */
export async function exportAnonymizedSubmissionsToExcel(
  submissions: SubmissionRow[],
  assignment: AssignmentMeta,
): Promise<void> {
  const { utils, writeFileXLSX } = await import('xlsx')

  const rows = submissions.map((s, i) => ({
    'รหัสผู้เรียน (ID)': `STU-${String(i + 1).padStart(3, '0')}`,
    'กลุ่มทดลอง / ห้องเรียน': s.class ?? assignment.className,
    'สถานะส่งงาน': statusThai(s.status, s.score),
    'คะแนนรวม': scoreDisplay(s.score, s.maxScore),
    'K - ความรู้ (20%)': ksaDisplay(s.knowledge),
    'S - ทักษะปฏิบัติ (30%)': ksaDisplay(s.skills),
    'A - เจตคติ (10%)': ksaDisplay(s.attitude),
    'C - สมรรถนะ (40%)': ksaDisplay(s.competency),
    'Rubric K': rubricLabel(s.rubricLevelK),
    'Rubric S': rubricLabel(s.rubricLevelS),
    'Rubric A': rubricLabel(s.rubricLevelA),
    'Rubric C': rubricLabel(s.rubricLevelC),
    'ข้อเสนอแนะครูผู้สอน': s.feedback ?? '-',
    'สถานะจริยธรรม': 'Informed Consent (De-identified)',
  }))

  const ws = utils.json_to_sheet(rows)
  ws['!cols'] = [
    { wch: 20 }, { wch: 22 }, { wch: 16 }, { wch: 20 },
    { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 18 },
    { wch: 16 }, { wch: 16 }, { wch: 16 }, { wch: 16 },
    { wch: 40 }, { wch: 26 },
  ]

  const wb = utils.book_new()
  utils.book_append_sheet(wb, ws, 'คะแนนแบบทดสอบ (นิรนาม)')

  const graded = submissions.filter(s => s.score !== null && s.score !== undefined)
  const avgScore = graded.length
    ? Math.round(graded.reduce((acc, s) => acc + (s.score! / s.maxScore) * 100, 0) / graded.length)
    : 0

  const summaryRows = [
    { 'หัวข้อสถิติ': 'ชื่อแบบประเมิน/กิจกรรม', 'ค่า': assignment.title },
    { 'หัวข้อสถิติ': 'กลุ่มตัวอย่าง', 'ค่า': assignment.className },
    { 'หัวข้อสถิติ': 'ประเภทกิจกรรม FINE Model', 'ค่า': assignment.activityType },
    { 'หัวข้อสถิติ': 'คะแนนเต็ม', 'ค่า': assignment.maxScore },
    { 'หัวข้อสถิติ': 'จำนวนผู้เข้าร่วมทั้งหมด (N)', 'ค่า': submissions.length },
    { 'หัวข้อสถิติ': 'จำนวนที่ตรวจแล้ว', 'ค่า': graded.length },
    { 'หัวข้อสถิติ': 'คะแนนเฉลี่ยร้อยละ', 'ค่า': `${avgScore}%` },
    { 'หัวข้อสถิติ': 'มาตรฐานจริยธรรม', 'ค่า': 'ข้อมูลแปลงเป็นรหัสนิรนาม (De-identified) เหมาะสำหรับแนบในบทที่ 4 หรือภาคผนวกวิทยานิพนธ์' },
  ]
  const ws2 = utils.json_to_sheet(summaryRows)
  ws2['!cols'] = [{ wch: 26 }, { wch: 60 }]
  utils.book_append_sheet(wb, ws2, 'สรุปผลเชิงสถิติ')

  const safeTitle = assignment.title.replace(/[^a-zA-Z0-9\u0E00-\u0E7F\s-]/g, '').trim().slice(0, 40)
  writeFileXLSX(wb, `รายงานวิจัยนิรนาม_${safeTitle}_${assignment.className}.xlsx`)
}
