'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

const Scanner = dynamic(
  () => import('@yudiel/react-qr-scanner').then((mod) => mod.Scanner),
  { ssr: false }
)

export default function QRScannerPage() {
  const router = useRouter()
  const [error, setError] = useState<string>('')
  const [scanned, setScanned] = useState(false)

  const handleScan = (detectedCodes: any[]) => {
    if (scanned || detectedCodes.length === 0) return
    const value = detectedCodes[0].rawValue
    if (value) {
      setScanned(true)
      // Assuming the QR code contains a URL like http://localhost:3000/student/ar-view?id=xyz
      // We will parse it and redirect
      try {
        const url = new URL(value)
        if (url.pathname.includes('/student/ar-view')) {
          router.push(url.pathname + url.search)
        } else {
          setError('QR Code นี้ไม่ใช่ QR Code สำหรับเรียนรู้ AR ของระบบ FINE MODEL')
          setTimeout(() => setScanned(false), 3000)
        }
      } catch (e) {
        setError('รูปแบบ QR Code ไม่ถูกต้อง')
        setTimeout(() => setScanned(false), 3000)
      }
    }
  }

  return (
    <div className="student-container">
      <div className="glass-card fade-in" style={{ padding: '24px', textAlign: 'center', minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#1E4D3A', margin: '0 0 16px 0' }}>📷 สแกน QR Code เพื่อเปิด AR</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
          นำกล้องส่องไปที่ QR Code ที่คุณครูให้เพื่อเปิดดูโมเดล 3 มิติแบบไม่มีพื้นหลัง
        </p>

        {error && (
          <div style={{ background: '#FAE8EB', color: '#8B2635', padding: '12px 16px', borderRadius: '12px', marginBottom: '24px', fontWeight: 700, width: '100%', maxWidth: '400px' }}>
            ⚠️ {error}
          </div>
        )}

        <div style={{ width: '100%', maxWidth: '400px', background: '#000', borderRadius: '24px', overflow: 'hidden', position: 'relative', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
          {!scanned ? (
            <Scanner
              onScan={handleScan}
              onError={(err) => console.log(err)}
              components={{
                onOff: true,
                torch: true,
                zoom: true,
                finder: true,
              }}
            />
          ) : (
            <div style={{ padding: '60px 20px', color: '#FFF', fontWeight: 800 }}>
              กำลังพาท่านเข้าสู่บทเรียน...
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
