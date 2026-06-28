'use client'
import BottomNav from '@/components/BottomNav'
import Link from 'next/link'

const exploreItems = [
  { category: 'อาหาร', items: [
    { name: 'แซลมอนย่าง', nameEn: 'Grilled Salmon', emoji: '🐟', color: '#1565C0' },
    { name: 'สเต็กเนื้อ', nameEn: 'Beef Steak', emoji: '🥩', color: '#C62828' },
    { name: 'สลัด', nameEn: 'Caesar Salad', emoji: '🥗', color: '#2E7D32' },
    { name: 'ซุปข้าวโพด', nameEn: 'Corn Soup', emoji: '🍲', color: '#E65100' },
  ]},
  { category: 'เครื่องดื่ม', items: [
    { name: 'ไวน์แดง', nameEn: 'Red Wine', emoji: '🍷', color: '#880E4F' },
    { name: 'กาแฟ', nameEn: 'Espresso', emoji: '☕', color: '#4E342E' },
    { name: 'น้ำผลไม้', nameEn: 'Fruit Juice', emoji: '🍊', color: '#E65100' },
    { name: 'ชา', nameEn: 'Tea', emoji: '🍵', color: '#33691E' },
  ]},
  { category: 'อุปกรณ์', items: [
    { name: 'แก้วไวน์', nameEn: 'Wine Glass', emoji: '🥂', color: '#1565C0' },
    { name: 'จาน', nameEn: 'Dinner Plate', emoji: '🍽️', color: '#37474F' },
    { name: 'ช้อนส้อม', nameEn: 'Cutlery', emoji: '🍴', color: '#5D4037' },
    { name: 'กาน้ำ', nameEn: 'Teapot', emoji: '🫖', color: '#7B1FA2' },
  ]},
]

export default function ExplorePage() {
  return (
    <>
      <div className="page-content">
        <div style={{background:'var(--gradient-primary)', padding:'52px var(--space-4) var(--space-5)'}}>
          <h1 style={{color:'white', fontSize:20, fontWeight:700}}>สำรวจ</h1>
          <p style={{color:'rgba(255,255,255,0.75)', fontSize:12}}>อาหาร เครื่องดื่ม และอุปกรณ์</p>
          <div className="explore-search">
            <span style={{position:'absolute', left:14, fontSize:16}}>🔍</span>
            <input className="explore-search-input" placeholder="ค้นหา..." />
          </div>
        </div>

        <div style={{padding:'var(--space-4)'}}>
          {exploreItems.map(cat => (
            <div key={cat.category} style={{marginBottom:'var(--space-5)'}}>
              <h2 className="section-title mb-3">{cat.category}</h2>
              <div className="grid-2">
                {cat.items.map(item => (
                  <button key={item.name} className="explore-card">
                    <div style={{fontSize:36, marginBottom:8}}>{item.emoji}</div>
                    <div style={{fontWeight:700, fontSize:13, color: item.color}}>{item.name}</div>
                    <div style={{fontSize:11, color:'var(--text-muted)'}}>{item.nameEn}</div>
                    <div style={{display:'flex', gap:4, marginTop:6}}>
                      <Link href="/ai-scan" className="badge badge-primary" style={{fontSize:9, textDecoration:'none'}}>AI Scan</Link>
                      <Link href="/ar-3d" className="badge badge-secondary" style={{fontSize:9, textDecoration:'none'}}>3D View</Link>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <BottomNav />
      <style jsx>{`
        .explore-search { position: relative; margin-top: var(--space-3); }
        .explore-search-input { width: 100%; padding: 12px 12px 12px 42px; background: rgba(255,255,255,0.15); border: 1.5px solid rgba(255,255,255,0.25); border-radius: var(--radius-full); color: white; font-family: var(--font-primary); font-size: 14px; outline: none; }
        .explore-search-input::placeholder { color: rgba(255,255,255,0.6); }
        .explore-card { background: white; border: none; border-radius: var(--radius-lg); padding: var(--space-4); text-align: center; cursor: pointer; box-shadow: var(--shadow-sm); transition: all var(--transition-fast); }
        .explore-card:active { transform: scale(0.96); }
      `}</style>
    </>
  )
}
