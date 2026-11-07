'use client'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import StudentIcon from '../StudentIcon'
import styles from '../studentPages.module.css'

const Scanner = dynamic(() => import('@yudiel/react-qr-scanner').then(m => m.Scanner), { ssr: false })

export default function ScannerPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [scanned, setScanned] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current)
  }, [])

  function fail(message: string) {
    setError(message)
    timer.current = setTimeout(() => {
      setScanned(false)
      setError('')
    }, 2500)
  }

  function handleScan(codes: Array<{ rawValue: string }>) {
    if (scanned || !codes[0]?.rawValue) return
    setScanned(true)
    try {
      const raw = codes[0].rawValue
      let target = ''
      if (/^https?:\/\//.test(raw)) {
        const url = new URL(raw)
        target = url.pathname + url.search
      } else if (raw.startsWith('/')) {
        target = raw
      } else {
        const i = raw.indexOf('/student/ar-view')
        if (i >= 0) target = raw.slice(i)
      }
      if (target.startsWith('/student/ar-view')) {
        router.push(target)
      } else {
        fail('QR Code นี้ไม่ได้เชื่อมกับโมเดล AR ของระบบ')
      }
    } catch {
      fail('รูปแบบ QR Code ไม่ถูกต้อง')
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <div className={styles.eyebrow}>
              <StudentIcon name="camera" size={15} />
              AR 3D scanner
            </div>
            <h1 className={styles.title}>สแกน QR Code เพื่อเปิดโมเดล AR 3D</h1>
            <p className={styles.subtitle}>
              อนุญาตการใช้กล้อง แล้ววาง QR Code ให้อยู่ภายในกรอบ ระบบจะเปิดโมเดล 3 มิติเสมือนจริงให้ทันที
            </p>
            <div style={{ marginTop: 14 }}>
              <Link
                href="/student/explore?mode=scan"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '7px 14px',
                  borderRadius: 10,
                  background: 'rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  fontSize: '12px',
                  textDecoration: 'none',
                }}
              >
                ← กลับไปหน้าสำรวจ (Explore)
              </Link>
            </div>
          </div>
        </section>

        <section className={styles.content}>
          <div className={styles.scannerGrid}>
            <div className={styles.scannerFrame}>
              {!scanned ? (
                <Scanner
                  onScan={handleScan}
                  onError={() => setError('ไม่สามารถเปิดกล้องได้ กรุณาตรวจสอบสิทธิ์การใช้งาน')}
                  components={{ onOff: true, torch: true, zoom: true, finder: true }}
                />
              ) : (
                <div className={styles.scannerLoading}>
                  <StudentIcon name="refresh" size={25} />
                  <strong>กำลังเปิดโมเดล AR 3 มิติ...</strong>
                </div>
              )}
            </div>

            <aside className={styles.card}>
              <div className={styles.cardTitle}>
                <span className={styles.iconBox}>
                  <StudentIcon name="info" />
                </span>
                <div>
                  <h2>วิธีสแกน AR 3D</h2>
                  <p>ใช้เวลาเพียงไม่กี่วินาที</p>
                </div>
              </div>

              <div className={styles.ksaList}>
                {[
                  'เปิดกล้องและอนุญาตสิทธิ์การใช้งาน',
                  'วาง QR Code ให้อยู่ในกรอบและมีแสงเพียงพอ',
                  'ถือโทรศัพท์ให้นิ่งจนระบบเปิดโมเดล 3 มิติ',
                ].map((v, i) => (
                  <div className={styles.ksaItem} key={v}>
                    <span className={styles.ksaKey}>{i + 1}</span>
                    <div>
                      <strong>{v}</strong>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid #e2eae5' }}>
                <strong style={{ display: 'block', fontSize: '11px', color: '#173f30', marginBottom: 8 }}>
                  💡 ไม่มีแผ่นป้าย QR Code? เลือกดูโมเดล 3D ตัวอย่าง:
                </strong>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  <Link
                    href="/student/ar-view?nameEn=Dinner%20Fork&nameTh=ส้อมอาหารค่ำ&desc=ส้อมหลักสำหรับอาหารจานหลัก"
                    style={{
                      padding: '5px 10px',
                      borderRadius: 8,
                      background: '#edf5f1',
                      border: '1px solid #cce1d6',
                      color: '#1b4a39',
                      fontSize: '11px',
                      textDecoration: 'none',
                      fontWeight: 500,
                    }}
                  >
                    🍴 Dinner Fork
                  </Link>
                  <Link
                    href="/student/ar-view?nameEn=Soup%20Spoon&nameTh=ช้อนซุป&desc=ช้อนทรงกลมสำหรับรับประทานซุป"
                    style={{
                      padding: '5px 10px',
                      borderRadius: 8,
                      background: '#edf5f1',
                      border: '1px solid #cce1d6',
                      color: '#1b4a39',
                      fontSize: '11px',
                      textDecoration: 'none',
                      fontWeight: 500,
                    }}
                  >
                    🥄 Soup Spoon
                  </Link>
                  <Link
                    href="/student/ar-view?nameEn=Water%20Goblet&nameTh=แก้วน้ำทรงก้าน&desc=แก้วทรงก้านสำหรับน้ำดื่มบริสุทธิ์บนโต๊ะอาหาร"
                    style={{
                      padding: '5px 10px',
                      borderRadius: 8,
                      background: '#edf5f1',
                      border: '1px solid #cce1d6',
                      color: '#1b4a39',
                      fontSize: '11px',
                      textDecoration: 'none',
                      fontWeight: 500,
                    }}
                  >
                    🍷 Water Goblet
                  </Link>
                </div>
              </div>

              {error && (
                <div className={styles.notice} style={{ marginTop: 12 }}>
                  <StudentIcon name="info" size={17} />
                  <span>{error}</span>
                </div>
              )}
            </aside>
          </div>
        </section>
      </div>
    </main>
  )
}
