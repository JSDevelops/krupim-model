import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { queryDb } from '@/lib/db'
import styles from './page.module.css'

type Certificate = {
  certificateCode: string
  issuedName: string
  schoolName: string | null
  overallScore: number
  issuedAt: string
  valid: boolean
}

export const metadata: Metadata = {
  title: 'ตรวจสอบใบรับรอง | KruPIM FINE Model',
  robots: { index: false, follow: false },
}

export default async function VerifyCertificatePage({ params }: { params: Promise<{ code: string }> }) {
  const { code: rawCode } = await params
  const code = rawCode.toUpperCase()
  if (!/^FINE-[A-F0-9]{16}$/.test(code)) notFound()
  const result = await queryDb<Certificate & Record<string, unknown>>(`
    SELECT certificate_code AS "certificateCode", issued_name AS "issuedName",
           school_name AS "schoolName", overall_score AS "overallScore",
           issued_at AS "issuedAt", revoked_at IS NULL AS valid
    FROM certificates WHERE certificate_code=$1 LIMIT 1
  `, [code])
  const certificate = result.rows[0]
  if (!certificate) notFound()

  const issuedDate = new Intl.DateTimeFormat('th-TH', { dateStyle: 'long' }).format(new Date(certificate.issuedAt))
  return <main className={styles.page}>
    <section className={styles.card}>
      <div className={`${styles.mark} ${certificate.valid ? styles.valid : styles.revoked}`} aria-hidden="true">
        <svg viewBox="0 0 24 24"><path d="m7 12 3 3 7-7"/><circle cx="12" cy="12" r="9"/></svg>
      </div>
      <p className={styles.eyebrow}>KruPIM · FINE Model</p>
      <h1>{certificate.valid ? 'ใบรับรองนี้ถูกต้อง' : 'ใบรับรองนี้ถูกยกเลิกแล้ว'}</h1>
      <p className={styles.lead}>ผลการตรวจสอบจากฐานข้อมูลกลางของระบบ</p>
      <dl>
        <div><dt>ชื่อผู้ได้รับ</dt><dd>{certificate.issuedName}</dd></div>
        <div><dt>สถานศึกษา</dt><dd>{certificate.schoolName || 'ไม่ระบุ'}</dd></div>
        <div><dt>คะแนนรวม</dt><dd>{certificate.overallScore}%</dd></div>
        <div><dt>วันที่ออก</dt><dd>{issuedDate}</dd></div>
        <div><dt>เลขที่ใบรับรอง</dt><dd>{certificate.certificateCode}</dd></div>
      </dl>
      <Link href="/">กลับหน้าหลัก</Link>
    </section>
  </main>
}
