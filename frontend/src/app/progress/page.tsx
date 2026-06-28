'use client'
import Link from 'next/link'
import BottomNav from '@/components/BottomNav'

const ksaData = [
  { key: 'K', label: 'ความรู้', labelEn: 'Knowledge', score: 80, icon: '📚', color: '#1565C0', bg: '#E3F2FD',
    items: ['อุปกรณ์ร้านอาหาร', 'เมนูอาหาร', 'มาตรฐาน Table Setting', 'ภาษาอังกฤษบริการ'] },
  { key: 'S', label: 'ทักษะ', labelEn: 'Skills', score: 70, icon: '🎯', color: '#7B1FA2', bg: '#F3E5F5',
    items: ['ฟัง-พูดภาษาอังกฤษ', 'รับออร์เดอร์', 'จัดโต๊ะอาหาร', 'ใช้ AI Scan'] },
  { key: 'A', label: 'เจตคติ', labelEn: 'Attitude', score: 85, icon: '💫', color: '#00897B', bg: '#E0F2F1',
    items: ['มีจิตใจบริการ', 'ตรงต่อเวลา', 'มุ่งมั่นพัฒนา', 'ทำงานเป็นทีม'] },
  { key: 'C', label: 'สมรรถนะ', labelEn: 'Competency', score: 65, icon: '⭐', color: '#E65100', bg: '#FFF3E0',
    items: ['บริการครบวงจร', 'แก้ปัญหาเฉพาะหน้า', 'สื่อสารภาษาอังกฤษ', 'ปฏิบัติตามมาตรฐาน'] },
]

const weeklyData = [20, 45, 35, 60, 75, 55, 80]
const days = ['จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส', 'อา']

export default function ProgressPage() {
  const overall = Math.round(ksaData.reduce((s, k) => s + k.score, 0) / ksaData.length)

  return (
    <>
      <div className="page-content">
        {/* Header */}
        <div className="prog-header">
          <div className="prog-header-bg" />
          <div className="prog-header-content">
            <div className="flex items-center justify-between">
              <div>
                <h1 style={{color:'white', fontSize:20, fontWeight:700}}>ความก้าวหน้า</h1>
                <p style={{color:'rgba(255,255,255,0.7)', fontSize:12}}>ติดตามพัฒนาการเรียนรู้ของคุณ</p>
              </div>
              <select className="period-select">
                <option>สัปดาห์นี้</option>
                <option>เดือนนี้</option>
                <option>ทั้งหมด</option>
              </select>
            </div>

            {/* Overall Circle */}
            <div className="overall-card">
              <div className="overall-circle-wrap">
                <svg width="120" height="120" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="12"/>
                  <circle
                    cx="60" cy="60" r="52"
                    fill="none"
                    stroke="white"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 52 * overall / 100} ${2 * Math.PI * 52 * (1 - overall / 100)}`}
                    transform="rotate(-90 60 60)"
                    style={{filter:'drop-shadow(0 0 6px rgba(255,255,255,0.5))'}}
                  />
                </svg>
                <div className="overall-text">
                  <div className="overall-pct">{overall}%</div>
                  <div className="overall-label">โดยรวม</div>
                </div>
              </div>
              <div className="overall-info">
                <div className="overall-grade">ดีมาก 🌟</div>
                <div className="overall-sub">เรียนจบแล้ว 3/5 Units</div>
                <div className="overall-sub">เวลาเรียนรวม 12 ชม.</div>
                <div className="overall-streak">🔥 ติดต่อกัน 5 วัน</div>
              </div>
            </div>
          </div>
        </div>

        <div className="prog-content">
          {/* Weekly Chart */}
          <div className="prog-section">
            <h2 className="section-title mb-3">กิจกรรม 7 วันที่ผ่านมา</h2>
            <div className="week-chart card card-body">
              <div className="bars">
                {weeklyData.map((v, i) => (
                  <div key={i} className="bar-col">
                    <div className="bar-wrap">
                      <div
                        className="bar-fill"
                        style={{height: `${v}%`, background: i === 6 ? 'var(--gradient-primary)' : 'var(--primary-100)'}}
                      />
                    </div>
                    <div className="bar-label">{days[i]}</div>
                  </div>
                ))}
              </div>
              <div className="chart-legend">
                <span>0</span><span>กิจกรรมต่อวัน</span><span>+10</span>
              </div>
            </div>
          </div>

          {/* KSA-C Detail */}
          <div className="prog-section">
            <h2 className="section-title mb-3">กรอบ KSA-C</h2>
            <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
              {ksaData.map(k => (
                <div key={k.key} className="ksa-card">
                  <div className="ksa-card-header" style={{background: k.bg}}>
                    <div className="ksa-circle" style={{background: k.color}}>
                      <span className="ksa-key-big">{k.key}</span>
                    </div>
                    <div className="ksa-title-wrap">
                      <div className="ksa-title">{k.label} <span style={{color:'var(--text-muted)', fontSize:12}}>({k.labelEn})</span></div>
                      <div className="ksa-score-wrap">
                        <div className="progress-bar-wrap" style={{flex:1, height:10}}>
                          <div className="progress-bar-fill" style={{width:`${k.score}%`, background: k.color}} />
                        </div>
                        <span style={{color: k.color, fontWeight:700, fontSize:16, width:40, textAlign:'right'}}>{k.score}%</span>
                      </div>
                    </div>
                    <span style={{fontSize:24}}>{k.icon}</span>
                  </div>
                  <div className="ksa-items">
                    {k.items.map((item, i) => (
                      <div key={i} className="ksa-item">
                        <span style={{color: k.color}}>✓</span> {item}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Units Progress */}
          <div className="prog-section">
            <h2 className="section-title mb-3">ความก้าวหน้าแต่ละ Unit</h2>
            <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
              {[
                { n: 1, title: 'Restaurant Equipment', score: 100, time: '2.5 ชม.', emoji: '🍳', color: '#2E7D32' },
                { n: 2, title: 'Table Setting', score: 75, time: '1.8 ชม.', emoji: '🍽️', color: '#1565C0' },
                { n: 3, title: 'Taking Food Orders', score: 80, time: '2 ชม.', emoji: '📝', color: '#7B1FA2' },
                { n: 4, title: 'Handling Complaints', score: 30, time: '0.5 ชม.', emoji: '🤝', color: '#E65100' },
                { n: 5, title: 'Service Recovery', score: 0, time: '0 ชม.', emoji: '⭐', color: '#757575' },
              ].map(u => (
                <div key={u.n} className="unit-prog-card">
                  <div className="unit-prog-icon" style={{background: u.color + '15'}}>
                    <span style={{fontSize:24}}>{u.emoji}</span>
                  </div>
                  <div className="unit-prog-info">
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6}}>
                      <span style={{fontWeight:600, fontSize:13}}>Unit {u.n}: {u.title}</span>
                      <span style={{color: u.color, fontWeight:700, fontSize:15}}>{u.score}%</span>
                    </div>
                    <div className="progress-bar-wrap" style={{height:8}}>
                      <div className="progress-bar-fill" style={{width:`${u.score}%`, background: u.color}} />
                    </div>
                    <div style={{fontSize:11, color:'var(--text-muted)', marginTop:4}}>⏱️ {u.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <BottomNav />

      <style jsx>{`
        .prog-header {
          position: relative;
          background: var(--gradient-primary);
          overflow: hidden;
        }
        .prog-header-bg {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 60%);
        }
        .prog-header-content {
          padding: 52px var(--space-4) var(--space-4);
          position: relative;
          z-index: 1;
        }
        .period-select {
          background: rgba(255,255,255,0.15);
          border: 1.5px solid rgba(255,255,255,0.3);
          color: white;
          border-radius: var(--radius-full);
          padding: 6px 12px;
          font-family: var(--font-primary);
          font-size: 12px;
          outline: none;
        }
        .overall-card {
          display: flex;
          align-items: center;
          gap: var(--space-4);
          background: rgba(255,255,255,0.12);
          border-radius: var(--radius-xl);
          padding: var(--space-4);
          margin-top: var(--space-4);
          border: 1px solid rgba(255,255,255,0.2);
        }
        .overall-circle-wrap { position: relative; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .overall-text { position: absolute; text-align: center; }
        .overall-pct { font-size: 24px; font-weight: 700; color: white; }
        .overall-label { font-size: 10px; color: rgba(255,255,255,0.7); }
        .overall-info { flex: 1; }
        .overall-grade { font-size: 18px; font-weight: 700; color: white; }
        .overall-sub { font-size: 12px; color: rgba(255,255,255,0.75); margin-top: 3px; }
        .overall-streak { font-size: 13px; color: white; margin-top: 6px; font-weight: 600; }
        .prog-content { padding: var(--space-4); }
        .prog-section { margin-bottom: var(--space-6); }
        .week-chart { padding: var(--space-4) !important; }
        .bars { display: flex; align-items: flex-end; height: 100px; gap: 8px; }
        .bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; height: 100%; }
        .bar-wrap { flex: 1; width: 100%; display: flex; align-items: flex-end; }
        .bar-fill { width: 100%; border-radius: 4px 4px 0 0; transition: height 1s ease; min-height: 4px; }
        .bar-label { font-size: 10px; color: var(--text-muted); font-weight: 500; }
        .chart-legend { display: flex; justify-content: space-between; font-size: 10px; color: var(--text-muted); margin-top: 6px; }
        .ksa-card { background: white; border-radius: var(--radius-lg); overflow: hidden; box-shadow: var(--shadow-sm); }
        .ksa-card-header { display: flex; align-items: center; gap: var(--space-3); padding: var(--space-3) var(--space-4); }
        .ksa-circle { width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .ksa-key-big { font-size: 20px; font-weight: 700; color: white; }
        .ksa-title-wrap { flex: 1; }
        .ksa-title { font-size: 14px; font-weight: 700; color: var(--text-primary); margin-bottom: 6px; }
        .ksa-score-wrap { display: flex; align-items: center; gap: 8px; }
        .ksa-items { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; padding: var(--space-3) var(--space-4); border-top: 1px solid var(--gray-100); }
        .ksa-item { font-size: 12px; color: var(--text-secondary); display: flex; align-items: center; gap: 4px; }
        .unit-prog-card { display: flex; align-items: center; gap: var(--space-3); background: white; border-radius: var(--radius-md); padding: var(--space-3); box-shadow: var(--shadow-sm); }
        .unit-prog-icon { width: 48px; height: 48px; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .unit-prog-info { flex: 1; min-width: 0; }
      `}</style>
    </>
  )
}
