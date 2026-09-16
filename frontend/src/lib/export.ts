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
        `Page ${data.pageNumber} | FINE Model AR AI 3D | Teacher: ${assignment.teacherName ?? 'Teacher'}`,
        14, doc.internal.pageSize.height - 8,
      )
    },
  })

  const safeTitle = assignment.title.replace(/[^a-zA-Z0-9\s-]/g, '').trim().slice(0, 40) || 'report'
  doc.save(`Report_${safeTitle}_${assignment.className}.pdf`)
}
