'use client'
import { useState } from 'react'

const analyticsData = {
  totalSessions: 1248, weekSessions: 183,
  avgScore: 78, completionRate: 72,
  weeklyScores: [65, 72, 70, 78, 82, 75, 85],
  ksa: [
    { k: 'K', label: 'Knowledge (ความรู้)', score: 80, color: '#1565C0' },
    { k: 'S', label: 'Skills (ทักษะ)', score: 72, color: '#7B1FA2' },
    { k: 'A', label: 'Attitude (เจตคติ)', score: 85, color: '#00897B' },
    { k: 'C', label: 'Competency (สมรรถนะ)', score: 68, color: '#E65100' }
  ],
  featureUsage: [
    { name: 'Gemini Chat', sessions: 456, pct: 90, color: '#1565C0', icon: '💬' },
    { name: 'AI Scan', sessions: 312, pct: 65, color: '#7B1FA2', icon: '🤖' },
    { name: 'Simulation', sessions: 278, pct: 55, color: '#C62828', icon: '🎭' },
    { name: 'AR 3D Object', sessions: 202, pct: 40, color: '#E65100', icon: '📦' },
  ],
  topStudents: [
    { name: 'นายพิทักษ์ ดีเลิศ', score: 95, class: 'ม.5/1', school: 'วิทยาลัยอาชีวศึกษากรุงเทพ', avatar: '👨‍🎓' },
    { name: 'นางสาวมาลี สวยงาม', score: 92, class: 'ม.5/1', school: 'วิทยาลัยอาชีวศึกษากรุงเทพ', avatar: '👩‍🎓' },
    { name: 'นายสมพร เก่งมาก', score: 88, class: 'ม.5/2', school: 'วิทยาลัยอาชีวศึกษานครปฐม', avatar: '👨‍🎓' },
  ],
}
const days = ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์', 'อาทิตย์']

export default function AdminAnalyticsPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div className="erp-card">
        <h2 style={{ fontSize: '20px', fontWeight: 700 }}>📈 ระบบรายงานการวิเคราะห์และประเมินผลสัมฤทธิ์ (System Analytics)</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
          ข้อมูลเชิงลึกด้านพัฒนาการการเรียนรู้ อัตราการเข้าใช้ระบบ อัตราความสำเร็จ และสถิติความมั่นใจการวิเคราะห์ AI
        </p>
      </div>

      {/* Grid Stats cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        {[
          { label: 'การใช้เรียนรวม (Sessions)', val: analyticsData.totalSessions, desc: `+${analyticsData.weekSessions} สัปดาห์นี้`, color: '#1565C0' },
          { label: 'คะแนนเฉลี่ยทั้งระบบ', val: `${analyticsData.avgScore}%`, desc: 'เกณฑ์ความรู้-ทักษะ F&B', color: '#7B1FA2' },
          { label: 'อัตราเรียนสำเร็จรายคน', val: `${analyticsData.completionRate}%`, desc: 'วัดผลแบบ KSA-C', color: '#00897B' },
          { label: 'Active โรงเรียน', val: '3 แห่ง', desc: 'ลงทะเบียนเรียนจริง', color: '#E65100' },
        ].map(card => (
          <div key={card.label} className="erp-card" style={{ borderLeft: `4px solid ${card.color}` }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>{card.label}</div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: card.color, marginTop: '4px' }}>{card.val}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{card.desc}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '24px' }}>
        {/* Left Side: KSA-C & Feature usage */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* KSA-C Breakdown */}
          <div className="erp-card">
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>📊 ผลประเมินกรอบ KSA-C รายด้าน</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {analyticsData.ksa.map(item => (
                <div key={item.k}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 700, fontSize: '14px' }}>{item.label}</span>
                    <span style={{ fontWeight: 700, color: item.color }}>{item.score}%</span>
                  </div>
                  <div className="progress-bar-wrap" style={{ height: '8px' }}>
                    <div className="progress-bar-fill" style={{ width: `${item.score}%`, background: item.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Feature Usage Stats */}
          <div className="erp-card">
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>📱 สถิติกิจกรรมการเรียนรู้แยกตามประเภทฟีเจอร์</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {analyticsData.featureUsage.map(f => (
                <div key={f.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '20px' }}>{f.icon}</span>
                    <span style={{ fontWeight: 600, fontSize: '14px' }}>{f.name}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '220px' }}>
                    <div className="progress-bar-wrap" style={{ flex: 1, height: '6px' }}>
                      <div className="progress-bar-fill" style={{ width: `${f.pct}%`, background: f.color }} />
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 700, width: '90px', textAlign: 'right' }}>
                      {f.sessions} Sessions
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Weekly Activity & Top Students */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Weekly chart */}
          <div className="erp-card">
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>🗓️ กิจกรรมรายสัปดาห์ (Weekly Activity)</h3>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '140px', padding: '0 20px' }}>
              {analyticsData.weeklyScores.map((v, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: 1 }}>
                  <div style={{ width: '24px', background: 'linear-gradient(180deg, #1976D2, #BBDEFB)', height: `${v * 1.2}px`, borderRadius: '4px 4px 0 0' }} />
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{days[i]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Students Table */}
          <div className="erp-card">
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>🏆 นักเรียนผลสัมฤทธิ์ดีเด่น (Top Performers)</h3>
            <div className="erp-table-container">
              <table className="erp-table">
                <thead>
                  <tr>
                    <th>ลำดับ</th>
                    <th>นักเรียน</th>
                    <th>ชั้นเรียน</th>
                    <th>วิทยาลัย</th>
                    <th style={{ textAlign: 'center' }}>คะแนนสะสม</th>
                  </tr>
                </thead>
                <tbody>
                  {analyticsData.topStudents.map((s, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 700 }}>{['🥇', '🥈', '🥉'][idx]}</td>
                      <td style={{ fontWeight: 700 }}>{s.name}</td>
                      <td>{s.class}</td>
                      <td>{s.school}</td>
                      <td style={{ textAlign: 'center', fontWeight: 700, color: 'var(--primary)', fontSize: '15px' }}>{s.score}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
