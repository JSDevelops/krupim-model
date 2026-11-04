'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Unhandled Application Error:', error)
  }, [error])

  return (
    <div
      style={{
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        textAlign: 'center',
        fontFamily: 'inherit',
      }}
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: 'rgba(139, 38, 53, 0.1)',
          color: '#8B2635',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '28px',
          marginBottom: '20px',
        }}
      >
        ⚠️
      </div>
      <h1
        style={{
          fontSize: '22px',
          fontWeight: '700',
          color: 'var(--text-primary, #111827)',
          marginBottom: '8px',
        }}
      >
        เกิดข้อผิดพลาดในการโหลดข้อมูล
      </h1>
      <p
        style={{
          fontSize: '14px',
          color: 'var(--text-secondary, #6B7280)',
          maxWidth: '440px',
          lineHeight: '1.6',
          marginBottom: '24px',
        }}
      >
        ระบบพบปัญหาที่ไม่คาดคิด กรุณาลองโหลดใหม่อีกครั้ง หรือกลับไปยังหน้าหลัก
      </p>

      {error.digest && (
        <span
          style={{
            fontSize: '11px',
            color: '#9CA3AF',
            fontFamily: 'monospace',
            marginBottom: '20px',
            backgroundColor: 'rgba(0,0,0,0.03)',
            padding: '4px 8px',
            borderRadius: '4px',
          }}
        >
          Error ID: {error.digest}
        </span>
      )}

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          type="button"
          onClick={() => reset()}
          style={{
            padding: '10px 20px',
            borderRadius: '10px',
            backgroundColor: 'var(--primary, #1E4D3A)',
            color: '#ffffff',
            fontWeight: '600',
            fontSize: '14px',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(30, 77, 58, 0.2)',
          }}
        >
          ลองใหม่อีกครั้ง
        </button>
        <Link
          href="/"
          style={{
            padding: '10px 20px',
            borderRadius: '10px',
            backgroundColor: 'transparent',
            color: 'var(--text-primary, #111827)',
            fontWeight: '600',
            fontSize: '14px',
            border: '1px solid var(--border-color, #E5E7EB)',
            textDecoration: 'none',
          }}
        >
          กลับหน้าหลัก
        </Link>
      </div>
    </div>
  )
}

