'use client'
import { useRole } from '@/context/RoleContext'

export default function TeacherProfilePage() {
  const { user, setUser } = useRole()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px' }}>
      {/* Header Profile */}
      <div className="erp-card" style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        
        {/* Avatar with click to upload */}
        <div 
          onClick={() => {
            if (typeof window !== 'undefined') {
              const el = document.getElementById('teacher-avatar-input')
              if (el) el.click()
            }
          }}
          style={{ 
            width: 90, height: 90, background: '#F3E5F5', 
            border: '3px solid #E1BEE7', borderRadius: '50%', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            fontSize: '46px', cursor: 'pointer', overflow: 'hidden',
            position: 'relative'
          }}
          title="คลิกเพื่ออัปโหลดรูปภาพใหม่"
        >
          {user?.avatar && user.avatar.startsWith('data:image') ? (
            <img 
              src={user.avatar} 
              alt="Teacher Avatar" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
          ) : (
            <span>{user?.avatar ?? '👩‍🏫'}</span>
          )}

          <div style={{
            position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: 0, transition: 'opacity 0.2s',
            fontSize: 12, color: 'white'
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
          >
            📸 เปลี่ยนรูป
          </div>
        </div>

        {/* Hidden File Input */}
        <input 
          type="file" 
          id="teacher-avatar-input"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file && user) {
              const reader = new FileReader()
              reader.onload = (event) => {
                const base64 = event.target?.result as string
                // 1. อัปเดตข้อมูลเข้าระบบหลัก
                setUser({ ...user, avatar: base64 })
                // 2. อัปเดตรายชื่อ registeredUsers
                const registered = localStorage.getItem('registeredUsers')
                if (registered) {
                  try {
                    const list = JSON.parse(registered)
                    const idx = list.findIndex((u: any) => u.email === user.email)
                    if (idx !== -1) {
                      list[idx].avatar = base64
                      localStorage.setItem('registeredUsers', JSON.stringify(list))
                    }
                  } catch (err) {}
                }
              }
              reader.readAsDataURL(file)
            }
          }}
        />

        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 700 }}>{user?.name}</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
            ครูผู้เชี่ยวชาญด้าน F&B Service · {user?.school}
          </p>
          <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
            <span style={{ background: '#F3E5F5', color: '#7B1FA2', fontSize: '11px', fontWeight: 700, padding: '4px 12px', borderRadius: '20px' }}>
              👩‍🏫 ครูผู้สอน (Teacher)
            </span>
            <span style={{ background: 'var(--gray-100)', color: 'var(--text-secondary)', fontSize: '11px', padding: '4px 12px', borderRadius: '20px' }}>
              ID: teacher-001
            </span>
          </div>
        </div>
      </div>

      {/* Account Info Details */}
      <div className="erp-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, borderBottom: '1px solid var(--gray-200)', paddingBottom: '10px', color: '#7B1FA2' }}>
          📋 ข้อมูลส่วนตัวและบัญชี (Account Details)
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>อีเมลติดต่อ</div>
            <div style={{ fontSize: '14px', fontWeight: 600, marginTop: '2px' }}>{user?.email ?? 'teacher@school.ac.th'}</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>สถาบันการศึกษา / วิทยาลัย</div>
            <div style={{ fontSize: '14px', fontWeight: 600, marginTop: '2px' }}>{user?.school}</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>เบอร์โทรศัพท์</div>
            <div style={{ fontSize: '14px', fontWeight: 600, marginTop: '2px' }}>089-123-4567</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>แผนกวิชา</div>
            <div style={{ fontSize: '14px', fontWeight: 600, marginTop: '2px' }}>การท่องเที่ยวและการบริการ</div>
          </div>
        </div>
      </div>

      {/* Classroom stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        {[
          { label: 'วิชาที่เปิดสอน', value: 'การบริการ F&B เบื้องต้น', icon: '🍽️', color: '#7B1FA2' },
          { label: 'มอบหมายกิจกรรมรวม', value: '14 กิจกรรมปีนี้', icon: '📋', color: '#1565C0' },
          { label: 'สัมมนาการสอนร่วม', value: '2 ครั้ง', icon: '👥', color: '#00897B' },
        ].map(card => (
          <div key={card.label} className="erp-card" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '26px' }}>{card.icon}</span>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{card.label}</div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: card.color, marginTop: '2px' }}>{card.value}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
