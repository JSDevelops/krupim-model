'use client'

import React from 'react'
import Link from 'next/link'
import StudentIcon from '@/app/student/StudentIcon'
import StudentManualView from '@/components/student/StudentManualView'
import styles from '@/app/student/studentPages.module.css'

export default function StudentManualPage() {
  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <div className={styles.eyebrow}>
              <StudentIcon name="book" size={14} />
              <span>Student Guidebook & Handbook</span>
            </div>
            <h1 className={styles.title}>คู่มือการใช้งานสำหรับนักเรียน</h1>
            <p className={styles.subtitle}>
              คำแนะนำทีละขั้นตอนอย่างละเอียด ตั้งแต่เริ่มต้นใช้งาน, สำรวจคำศัพท์, ฝึกสนทนา, แก้ไขสถานการณ์, ทำแบบทดสอบ Quiz, สแกน AR จนถึงการส่งงานและรับใบประกาศนียบัตร
            </p>
            <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
              <Link href="/student/profile" className={styles.heroAction}>
                <StudentIcon name="user" size={14} />
                <span>กลับสู่โปรไฟล์</span>
              </Link>
              <Link href="/student/explore" className={styles.heroAction}>
                <StudentIcon name="target" size={14} />
                <span>เริ่มทำกิจกรรม (F)</span>
              </Link>
            </div>
          </div>
        </section>

        <section className={styles.content}>
          <StudentManualView />
        </section>
      </div>
    </main>
  )
}
