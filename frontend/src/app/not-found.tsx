import Link from 'next/link'

export default function NotFound() {
  return (
    <main
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
          fontSize: '72px',
          fontWeight: '900',
          color: 'var(--gold, #C9A84C)',
          lineHeight: '1',
          marginBottom: '16px',
          letterSpacing: '-2px',
        }}
      >
        404
      </div>
      <h1
        style={{
          fontSize: '22px',
          fontWeight: '700',
          color: 'var(--text-primary, #111827)',
          marginBottom: '8px',
        }}
      >
        ไม่พบหน้าที่คุณต้องการ
      </h1>
      <p
        style={{
          fontSize: '14px',
          color: 'var(--text-secondary, #6B7280)',
          maxWidth: '440px',
          lineHeight: '1.6',
          marginBottom: '28px',
        }}
      >
        หน้าที่คุณกำลังเข้าชมอาจถูกย้าย ลบ หรือยังไม่ได้เปิดให้บริการในระบบ FINE Model
      </p>
      <Link
        href="/role-select"
        style={{
          padding: '12px 24px',
          borderRadius: '12px',
          backgroundColor: 'var(--primary, #1E4D3A)',
          color: '#ffffff',
          fontWeight: '600',
          fontSize: '14px',
          textDecoration: 'none',
          boxShadow: '0 4px 12px rgba(30, 77, 58, 0.25)',
        }}
      >
        กลับไปหน้าเลือกบทบาท / เข้าสู่ระบบ
      </Link>
    </main>
  )
}

