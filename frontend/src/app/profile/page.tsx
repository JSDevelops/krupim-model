'use client'
import Link from 'next/link'
import BottomNav from '@/components/BottomNav'

export default function ProfilePage() {
  return (
    <>
      <div className="page-content">
        <div className="profile-header">
          <div className="profile-cover" />
          <div className="profile-avatar-wrap">
            <div className="profile-avatar">👩‍🏫</div>
            <button className="profile-edit-btn">✏️ แก้ไข</button>
          </div>
          <div className="profile-info">
            <h1 className="profile-name">ครูสวัสดิ์รัก นักเรียนดี</h1>
            <p className="profile-role-tag">ครูผู้สอน · วิทยาลัยอาชีวศึกษา</p>
          </div>
        </div>

        <div className="profile-content">
          {/* Stats */}
          <div className="grid-3" style={{gap:'10px', marginBottom:'var(--space-5)'}}>
            {[
              { value: '24', label: 'นักเรียน', icon: '👥' },
              { value: '12', label: 'ชั่วโมง', icon: '⏱️' },
              { value: '89%', label: 'เฉลี่ย', icon: '📊' },
            ].map(s => (
              <div key={s.label} className="stat-card">
                <div style={{fontSize:22, marginBottom:4}}>{s.icon}</div>
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Menu Items */}
          {[
            { icon: '🏫', label: 'ชั้นเรียนของฉัน', sub: '2 ชั้นเรียน', href: '/teacher/classes' },
            { icon: '📋', label: 'มอบหมายงาน', sub: '5 งานที่กำลังดำเนินการ', href: '/teacher/assignments' },
            { icon: '📊', label: 'รายงานผล', sub: 'ดูความก้าวหน้านักเรียน', href: '/teacher/reports' },
            { icon: '⚙️', label: 'ตั้งค่า', sub: 'บัญชีและการแจ้งเตือน', href: '/settings' },
            { icon: '❓', label: 'ช่วยเหลือ', sub: 'คู่มือการใช้งาน', href: '/help' },
          ].map(item => (
            <Link key={item.href} href={item.href} className="list-item" style={{marginBottom:'8px', textDecoration:'none'}}>
              <div className="feature-icon" style={{background:'var(--primary-50)'}}>
                <span style={{fontSize:22}}>{item.icon}</span>
              </div>
              <div style={{flex:1}}>
                <div style={{fontWeight:600, fontSize:14}}>{item.label}</div>
                <div style={{fontSize:12, color:'var(--text-muted)', marginTop:2}}>{item.sub}</div>
              </div>
              <span style={{color:'var(--text-muted)', fontSize:18}}>›</span>
            </Link>
          ))}

          <button className="btn btn-outline btn-block" style={{marginTop:'var(--space-4)', color:'var(--error)', borderColor:'var(--error)'}}>
            🚪 ออกจากระบบ
          </button>
        </div>
      </div>
      <BottomNav />

      <style jsx>{`
        .profile-header { background: var(--gradient-primary); position: relative; padding-bottom: var(--space-6); }
        .profile-cover { height: 100px; }
        .profile-avatar-wrap { display: flex; justify-content: space-between; align-items: flex-end; padding: 0 var(--space-4); margin-top: -32px; }
        .profile-avatar { width: 72px; height: 72px; background: white; border-radius: 50%; border: 4px solid white; display: flex; align-items: center; justify-content: center; font-size: 36px; box-shadow: var(--shadow-md); }
        .profile-edit-btn { background: white; border: 1.5px solid var(--gray-300); padding: 7px 16px; border-radius: var(--radius-full); font-family: var(--font-primary); font-size: 13px; font-weight: 600; cursor: pointer; }
        .profile-info { padding: var(--space-3) var(--space-4) 0; }
        .profile-name { font-size: 20px; font-weight: 700; color: white; }
        .profile-role-tag { font-size: 13px; color: rgba(255,255,255,0.8); margin-top: 4px; }
        .profile-content { padding: var(--space-4); }
      `}</style>
    </>
  )
}
