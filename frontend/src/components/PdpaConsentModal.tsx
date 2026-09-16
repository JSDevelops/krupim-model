'use client'

import React, { useState } from 'react'
import { useRole } from '@/context/RoleContext'
import styles from './PdpaConsentModal.module.css'

export default function PdpaConsentModal() {
  const { user, setUser, logout, loading } = useRole()
  const [agreed, setAgreed] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // หากยังโหลดไม่เสร็จ หรือไม่มีผู้ใช้งาน หรือกดยินยอมแล้ว ไม่ต้องแสดง Popup
  if (loading || !user || user.pdpa_consent === true) {
    return null
  }

  const handleAccept = async () => {
    if (!agreed || submitting) return
    setSubmitting(true)
    setErrorMsg('')

    try {
      const res = await fetch('/api/auth/pdpa-consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ version: '1.0' }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'เกิดข้อผิดพลาดในการบันทึกความยินยอม')
      }

      // อัปเดตสถานะใน context ทันที เพื่อให้ Popup ปิดและใช้งานระบบได้ต่อเนื่อง
      setUser({
        ...user,
        pdpa_consent: true,
        pdpa_consent_at: data.consentedAt || new Date().toISOString(),
        pdpa_consent_version: data.version || '1.0',
      })
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง')
    } finally {
      setSubmitting(false)
    }
  }

  const handleReject = async () => {
    if (confirm('หากท่านปฏิเสธการให้ความยินยอม ท่านจะไม่สามารถเข้าใช้งานระบบได้และระบบจะนำท่านออกจากระบบ ต้องการดำเนินการต่อหรือไม่?')) {
      await logout()
    }
  }

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="pdpa-title">
      <div className={styles.modal}>
        <div className={styles.header}>
          <div className={styles.iconWrapper}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <path d="m9 12 2 2 4-4"/>
            </svg>
          </div>
          <div className={styles.headerText}>
            <span className={styles.badge}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="10" />
              </svg>
              พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562
            </span>
            <h2 id="pdpa-title" className={styles.title}>
              นโยบายการคุ้มครองและขอสงวนข้อมูลส่วนบุคคล (PDPA)
            </h2>
            <p className={styles.subtitle}>
              แพลตฟอร์มการจัดการเรียนรู้โมเดล 3 มิติและ AR ด้วยนวัตกรรม FINE Model (เพื่อการศึกษาและวิจัย R&D)
            </p>
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.section}>
            <div className={styles.sectionTitle}>
              <span>🎯</span>
              <span>1. วัตถุประสงค์ในการจัดเก็บและประมวลผลข้อมูล</span>
            </div>
            <p className={styles.sectionText}>
              ข้อมูลส่วนบุคคลและข้อมูลการเรียนรู้ของท่านจะถูกนำไปใช้เพื่อสนับสนุนกระบวนการจัดการเรียนการสอน การประเมินสมรรถนะผู้เรียนตามกรอบ <strong>FINE Model (KSA-C)</strong> ตลอดจนการวิเคราะห์และพัฒนางานวิจัยนวัตกรรมการเรียนรู้ของผู้สอน โดยไม่มีการนำข้อมูลไปแสวงหาผลประโยชน์ทางการค้าใดๆ ทั้งสิ้น
            </p>
          </div>

          <div className={styles.section}>
            <div className={styles.sectionTitle}>
              <span>📋</span>
              <span>2. ประเภทข้อมูลส่วนบุคคลที่ระบบจัดเก็บ</span>
            </div>
            <ul className={styles.sectionList}>
              <li><strong>ข้อมูลระบุตัวตน:</strong> ชื่อ-นามสกุล, ที่อยู่อีเมล, บทบาท (ครู/นักเรียน), รหัสสถานศึกษา</li>
              <li><strong>ข้อมูลผลงานและการเรียนรู้:</strong> ไฟล์โมเดล 3D (.glb, .obj), บันทึกการส่งงาน, ภาพถ่าย/วิดีโอผลงาน AR, ประวัติการสร้างสรรค์ และชุดคำสั่ง AI Prompt</li>
              <li><strong>ข้อมูลการวัดและประเมินผล:</strong> ผลคะแนนสมรรถนะ KSA-C (ความรู้ ทักษะ เจตคติ ความคิดสร้างสรรค์), ระดับ Rubric และข้อเสนอแนะจากผู้สอน</li>
              <li><strong>ข้อมูลการเข้าใช้งาน:</strong> ประวัติวันเวลาที่เข้าสู่ระบบ บันทึกกิจกรรมระบบ (Audit Logs) เพื่อความปลอดภัย</li>
            </ul>
          </div>

          <div className={styles.section}>
            <div className={styles.sectionTitle}>
              <span>🔒</span>
              <span>3. มาตรการรักษาความมั่นคงปลอดภัยและการเปิดเผยข้อมูล</span>
            </div>
            <p className={styles.sectionText}>
              ระบบใช้มาตรการเข้ารหัสข้อมูล (Encryption) และการควบคุมการเข้าถึงตามสิทธิ์ (Role-Based Access Control) อย่างเคร่งครัด ในกรณีที่มีการนำเสนอผลการวิจัย ข้อมูลจะถูกนำเสนอในรูปแบบ <strong>ข้อมูลนิรนามหรือผลสรุปเชิงสถิติรวม (Aggregated / Anonymized Data)</strong> ที่ไม่สามารถระบุตัวตนรายบุคคลได้
            </p>
          </div>

          <div className={styles.section}>
            <div className={styles.sectionTitle}>
              <span>⚖️</span>
              <span>4. สิทธิของเจ้าของข้อมูลส่วนบุคคล (Data Subject Rights)</span>
            </div>
            <p className={styles.sectionText}>
              ท่านมีสิทธิ์ตามกฎหมายในการขอเข้าถึง ตรวจสอบ ขอสำเนา หรือขอปรับปรุงแก้ไขข้อมูลส่วนบุคคลให้ถูกต้องสมบูรณ์ รวมถึงสิทธิ์ในการเพิกถอนความยินยอมได้ตลอดเวลา โดยสามารถติดต่อผู้ดูแลระบบหรือครูผู้สอนประจำวิชา
            </p>
          </div>

          {errorMsg && (
            <div style={{ color: '#f87171', background: 'rgba(239, 68, 68, 0.15)', padding: '0.75rem 1rem', borderRadius: '0.5rem', fontSize: '0.85rem', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
              ⚠️ {errorMsg}
            </div>
          )}

          <label className={styles.agreementBox}>
            <input
              type="checkbox"
              className={styles.checkbox}
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              disabled={submitting}
            />
            <span className={styles.agreementLabel}>
              ข้าพเจ้าได้อ่าน เข้าใจ และยินยอมให้ระบบจัดเก็บ ประมวลผล และใช้ข้อมูลส่วนบุคคลของข้าพเจ้าตามนโยบายคุ้มครองข้อมูลส่วนบุคคล (PDPA Version 1.0) ที่ระบุไว้ข้างต้น
            </span>
          </label>
        </div>

        <div className={styles.footer}>
          <button
            type="button"
            className={styles.rejectBtn}
            onClick={handleReject}
            disabled={submitting}
          >
            ปฏิเสธและออกจากระบบ
          </button>
          <button
            type="button"
            className={styles.acceptBtn}
            onClick={handleAccept}
            disabled={!agreed || submitting}
          >
            {submitting ? (
              <>
                <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" strokeDasharray="30 60" />
                </svg>
                <span>กำลังบันทึก...</span>
              </>
            ) : (
              <>
                <span>ยอมรับข้อตกลงและเข้าใช้งาน</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14"/>
                  <path d="m12 5 7 7-7 7"/>
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
