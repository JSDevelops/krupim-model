'use client'
import { useRouter } from 'next/navigation'
import { useRole, UserRole } from '@/context/RoleContext'
import { useEffect } from 'react'


const roles = [
  {
    id: 'developer' as UserRole,
    label: 'ผู้ดูแลระบบ', labelEn: 'Administrator', emoji: '⚙️',
    subtitle: 'เจ้าของโปรเจค / ผู้พัฒนา',
    description: 'จัดการระบบทั้งหมด ควบคุมเนื้อหา จัดการทะเบียนผู้ใช้ และวิเคราะห์ผลรวมระบบ',
    features: ['🔧 จัดการผู้ใช้ทั้งหมด', '🗂️ จัดการเนื้อหา AR/AI', '📈 วิเคราะห์รายงานรวม', '⚙️ ตั้งค่าโครงสร้างระบบ'],
    gradient: 'linear-gradient(135deg, #102B1F 0%, #1E4D3A 100%)',
    color: '#1E4D3A', bg: '#EAF3EE', border: '#C5DDD3',
    path: '/admin/dashboard',
    badge: 'ADMIN ✦',
    badgeBg: '#1E4D3A',
  },
  {
    id: 'teacher' as UserRole,
    label: 'ครูผู้สอน', labelEn: 'Teacher / Instructor', emoji: '👩‍🏫',
    subtitle: 'ผู้บริหารการสอนและการประเมินผล',
    description: 'จัดทำแผนการสอน รายงานผลสมรรถนะ มอบหมายกิจกรรม และจัดการทะเบียนเด็ก',
    features: ['📖 แผนการสอน FINE MODEL', '⚡ AI Scenario จำลองโจทย์', '📋 สั่งงานและประเมิน Rubrics', '👥 ทะเบียนและออกประกาศ PDF'],
    gradient: 'linear-gradient(135deg, #4A3010 0%, #2E1D0A 100%)',
    color: '#4A3010', bg: '#FBF6E9', border: '#F0E0A8',
    path: '/teacher/dashboard',
    badge: 'TEACHER ✦',
    badgeBg: '#A6882A',
  },
  {
    id: 'student' as UserRole,
    label: 'นักเรียน / นักศึกษา', labelEn: 'Student Portal', emoji: '👨‍🎓',
    subtitle: 'ผู้เรียนรู้และฝึกสมรรถนะวิชาชีพ',
    description: 'เรียนรู้ผ่านโมเดล AR 3D, ฝึกประเมินศัพท์ AI Scan และบทสนทนาสถานการณ์จริง',
    features: ['🎨 ส่องอุปกรณ์ AR & 3D', '🤖 ฝึกศัพท์ผ่าน AI Scan', '💬 สนทนากับ AI Gemini', '🎭 สวมบทบาท Simulation'],
    gradient: 'linear-gradient(135deg, #1E4D3A 0%, #C9A84C 100%)',
    color: '#1E4D3A', bg: '#F5F2ED', border: '#D8D2C6',
    path: '/student/explore',
    badge: 'STUDENT ✦',
    badgeBg: '#C9A84C',
  },
]

export default function RoleSelectPage() {
  const router = useRouter()
  const { setUser, user } = useRole()

  useEffect(() => {
    const savedRole = localStorage.getItem('userRole')
    const savedUserInfo = localStorage.getItem('userInfo')
    let parsedUser: any = null
    try { parsedUser = savedUserInfo ? JSON.parse(savedUserInfo) : null } catch {}
    
    if (!savedRole) {
      router.replace('/')
    } else if (savedRole !== 'developer' && parsedUser?.role !== 'developer') {
      router.replace(`/${savedRole === 'teacher' ? 'teacher' : 'student'}/dashboard`)
    }
  }, [user])

  function selectRole(role: typeof roles[0]) {
    const savedUserInfo = localStorage.getItem('userInfo')
    let parsedUser: any = null
    try { parsedUser = savedUserInfo ? JSON.parse(savedUserInfo) : null } catch {}

    // Allow switching if the logged in user is developer, or if it matches the role they chose
    if (user?.role === 'developer' || parsedUser?.role === 'developer' || user?.role === role.id || parsedUser?.role === role.id) {
      localStorage.setItem('userRole', role.id)
      if (user) {
        setUser({ ...user, role: role.id })
      }
      router.push(role.path)
      return
    }

    // Fallback: If context is still loading but they clicked, let them proceed based on their selection
    localStorage.setItem('userRole', role.id)
    router.push(role.path)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #071812 0%, #102B1F 40%, #1E4D3A 100%)', display: 'flex', flexDirection: 'column' }}>
      
      {/* Injecting CSS animations & responsive classes */}
      <style>{`
        .roles-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          max-width: 1200px;
          width: 100%;
          margin: 0 auto;
          padding: 16px 20px 48px;
        }
        .role-card {
          border: none;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 12px 30px rgba(0,0,0,0.15);
          cursor: pointer;
          text-align: left;
          padding: 0;
          background: white;
          width: 100%;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          flex-direction: column;
          height: 100%;
          border: 1px solid rgba(255,255,255,0.1);
        }
        .role-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 20px 40px rgba(16,43,31,0.30);
          border-color: #C9A84C;
        }
        .role-card:active {
          transform: translateY(-2px);
        }
        @media (max-width: 900px) {
          .roles-grid {
            grid-template-columns: 1fr;
            gap: 20px;
            padding: 16px 16px 32px;
          }
        }
      `}</style>

      {/* Header */}
      <div style={{ padding: '64px var(--space-4) 32px', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 24 }}>
          <img src="/logo.png" alt="FINE MODE Logo" style={{ width: 64, height: 64, borderRadius: 16, border: '2.5px solid #C9A84C', boxShadow: '0 0 25px rgba(201,168,76,0.3)' }} />
          <div style={{ textAlign: 'left' }}>
            <div style={{ color: 'white', fontSize: 26, fontWeight: 800, letterSpacing: '1.5px', fontFamily: 'var(--font-primary)' }}>FINE MODE</div>
            <div style={{ color: '#C9A84C', fontSize: 12, letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 700, marginTop: '2px' }}>AR+AI 3D Learning Platform</div>
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ color: 'white', fontSize: 24, fontWeight: 800, marginBottom: 8 }}>เลือกบทบาทผู้ใช้งานเพื่อเริ่มต้น</h1>
          <p style={{ color: 'rgba(253,250,244,0.80)', fontSize: 14 }}>กรุณาเลือกประเภทผู้เรียนรู้ เพื่อเข้าใช้ฟีเจอร์และห้องปฏิบัติการโรงแรมจำลอง</p>
        </div>
      </div>

      {/* Content wrapper with white luxury curve */}
      <div style={{ background: '#F8F6F2', borderRadius: '32px 32px 0 0', flex: 1, padding: '40px 16px 16px', display: 'flex', flexDirection: 'column' }}>
        
        {/* Responsive Grid Container */}
        <div className="roles-grid">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => selectRole(role)}
              className="role-card"
            >
              {/* Card Header Gradient */}
              <div style={{ background: role.gradient, padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', color: 'white' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ width: 56, height: 56, background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>
                    {role.emoji}
                  </div>
                  <span style={{ background: 'rgba(255,255,255,0.22)', color: '#FDFAF4', fontSize: '10px', fontWeight: 800, padding: '4px 10px', borderRadius: '20px', letterSpacing: '1px', border: '1px solid rgba(255,255,255,0.15)' }}>
                    {role.badge}
                  </span>
                </div>
                <div style={{ textAlign: 'left' }}>
                  <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#FDFAF4', margin: 0 }}>{role.label}</h2>
                  <div style={{ color: 'rgba(253,250,244,0.75)', fontSize: '12px', marginTop: '4px', fontWeight: 500 }}>{role.labelEn}</div>
                </div>
              </div>

              {/* Card Body Details */}
              <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '20px', background: 'white' }}>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 800, fontSize: '13px', color: '#A6882A', marginBottom: '6px' }}>{role.subtitle}</div>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
                    {role.description}
                  </p>
                </div>

                {/* Features Checklist */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {role.features.map(f => (
                    <div key={f} style={{ fontSize: '12px', fontWeight: 700, padding: '8px 14px', borderRadius: '12px', background: role.bg, color: role.color, display: 'flex', alignItems: 'center', gap: '6px', border: `1px solid ${role.border}` }}>
                      <span>✓</span> {f}
                    </div>
                  ))}
                </div>
              </div>
            </button>
          ))}
        </div>

        <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)', marginTop: 'auto', paddingBottom: '24px', maxWidth: '600px', margin: '0 auto' }}>
          การเข้าใช้งานถือว่าคุณยอมรับข้อกำหนดการให้บริการและการคุ้มครองข้อมูลส่วนบุคคลของระบบปฏิบัติการ FINE MODE ✦
        </p>
      </div>

    </div>
  )
}
