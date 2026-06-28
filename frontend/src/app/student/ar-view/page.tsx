'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

interface ARModel {
  id: string
  title: string
  description: string
  glbUrl: string
  thumbnail: string
}

export default function ARViewerPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const id = searchParams.get('id')
  
  const [model, setModel] = useState<ARModel | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (typeof window !== 'undefined' && id) {
      const storedModels = localStorage.getItem('arModels')
      if (storedModels) {
        try {
          const parsed = JSON.parse(storedModels)
          const found = parsed.find((m: ARModel) => m.id === id)
          if (found) {
            setModel(found)
          }
        } catch (e) {}
      }
      setLoading(false)
    }
  }, [id])

  if (loading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>กำลังโหลดโมเดล 3 มิติ...</div>
  }

  if (!model) {
    return (
      <div className="student-container">
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center', minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#8B2635' }}>ไม่พบโมเดล 3 มิติ</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>โมเดลนี้อาจถูกลบไปแล้ว หรือ QR Code ไม่ถูกต้อง</p>
          <button onClick={() => router.push('/student/scanner')} className="btn btn-primary">
            กลับไปสแกนใหม่
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh', background: 'transparent' }}>
      
      {/* 3D Model Viewer with Transparent Background */}
      {/* We use global typing for model-viewer since it's a web component added via script */}
      {/* @ts-ignore */}
      <model-viewer
        src={model.glbUrl}
        ar
        ar-modes="webxr scene-viewer quick-look"
        camera-controls
        auto-rotate
        shadow-intensity="1"
        style={{ width: '100%', height: '100%', backgroundColor: 'transparent' }}
      >
        <div className="progress-bar hide" slot="progress-bar">
          <div className="update-bar"></div>
        </div>
        <button slot="ar-button" id="ar-button" className="btn btn-primary" style={{ position: 'absolute', bottom: '100px', left: '50%', transform: 'translateX(-50%)', padding: '12px 24px', borderRadius: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', zIndex: 100 }}>
          👀 ดูในโลกจริง (AR)
        </button>
      {/* @ts-ignore */}
      </model-viewer>

      {/* Overlay Information */}
      <div style={{ 
        position: 'absolute', top: '0', left: '0', right: '0', 
        padding: '20px', 
        background: 'linear-gradient(to bottom, rgba(30,77,58,0.9), transparent)', 
        color: '#FFF',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 800 }}>{model.title}</h1>
          <button onClick={() => router.push('/student/scanner')} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#FFF', padding: '8px 12px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
            ✕ ปิด
          </button>
        </div>
        <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>{model.description}</p>
      </div>

    </div>
  )
}
