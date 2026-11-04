'use client'

import { useEffect } from 'react'

import Link from 'next/link'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Critical Root Error:', error)
  }, [error])

  return (
    <html lang="th">
      <body
        style={{
          margin: 0,
          fontFamily: "'Sukhumvit Set', -apple-system, BlinkMacSystemFont, sans-serif",
          backgroundColor: '#0a1a14',
          color: '#ffffff',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
        }}
      >
        <div style={{ textAlign: 'center', maxWidth: '480px' }}>
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              backgroundColor: 'rgba(201, 168, 76, 0.15)',
              border: '1px solid #C9A84C',
              color: '#C9A84C',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              margin: '0 auto 24px',
            }}
          >
            ✦
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 12px', color: '#ffffff' }}>
            เกิดข้อผิดพลาดระดับระบบ
          </h1>
          <p style={{ fontSize: '14px', color: '#a3b8af', lineHeight: '1.6', margin: '0 0 28px' }}>
            ขออภัยในความไม่สะดวก ระบบพบข้อผิดพลาดที่ไม่สามารถทำงานต่อได้ในหน้านี้
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={() => reset()}
              style={{
                padding: '12px 24px',
                borderRadius: '12px',
                backgroundColor: '#1E4D3A',
                border: '1px solid #C9A84C',
                color: '#ffffff',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              ลองใหม่อีกครั้ง
            </button>
            <Link
              href="/"
              style={{
                padding: '12px 24px',
                borderRadius: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: '#ffffff',
                textDecoration: 'none',
                fontWeight: 'bold',
              }}
            >
              กลับหน้าหลัก
            </Link>
          </div>
        </div>
      </body>
    </html>
  )
}
