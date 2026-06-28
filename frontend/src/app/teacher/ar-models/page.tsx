'use client'
import { useState, useEffect, useRef } from 'react'
import { QRCodeSVG } from 'qrcode.react'

interface ARModel {
  id: string
  title: string
  description: string
  glbUrl: string
  thumbnail: string
  createdAt: string
}

export default function ARModelsPage() {
  const [models, setModels] = useState<ARModel[]>([])
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false)
  const [showQRModal, setShowQRModal] = useState<ARModel | null>(null)
  
  // Form State
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [glbUrl, setGlbUrl] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedModels = localStorage.getItem('arModels')
      if (storedModels) {
        try {
          setModels(JSON.parse(storedModels))
        } catch (e) {}
      } else {
        const defaultModels: ARModel[] = [
          {
            id: 'ar-model-001',
            title: 'Table Setting (ชุดจัดโต๊ะอาหาร)',
            description: 'โมเดลชุดจัดโต๊ะอาหารแบบสากล ให้นักเรียนสแกนเพื่อเรียนรู้ตำแหน่งการจัดวางจาน มีด และแก้วน้ำ',
            glbUrl: 'https://modelviewer.dev/shared-assets/models/Astronaut.glb', // Fallback example
            thumbnail: '🍽️',
            createdAt: new Date().toISOString()
          },
          {
            id: 'ar-model-002',
            title: 'Wine Glass (แก้วไวน์)',
            description: 'ลักษณะของแก้วไวน์แดงและไวน์ขาว',
            glbUrl: 'https://modelviewer.dev/shared-assets/models/Astronaut.glb', // Fallback example
            thumbnail: '🍷',
            createdAt: new Date().toISOString()
          }
        ]
        setModels(defaultModels)
        localStorage.setItem('arModels', JSON.stringify(defaultModels))
      }
    }
  }, [])

  const saveModels = (updated: ARModel[]) => {
    setModels(updated)
    if (typeof window !== 'undefined') {
      localStorage.setItem('arModels', JSON.stringify(updated))
    }
  }

  const handleAddModel = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !glbUrl) return
    const newModel: ARModel = {
      id: `ar-model-${Date.now()}`,
      title,
      description,
      glbUrl,
      thumbnail: '📦',
      createdAt: new Date().toISOString()
    }
    saveModels([newModel, ...models])
    setShowAddModal(false)
    setTitle('')
    setDescription('')
    setGlbUrl('')
    alert('เพิ่มโมเดล 3 มิติเรียบร้อยแล้ว!')
  }

  const handleDeleteModel = (id: string) => {
    if (confirm('คุณต้องการลบโมเดลนี้ใช่หรือไม่?')) {
      saveModels(models.filter(m => m.id !== id))
    }
  }

  // Determine base URL for QR code
  const getBaseUrl = () => {
    if (typeof window !== 'undefined') {
      return window.location.origin
    }
    return 'http://localhost:3000'
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div className="erp-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1E4D3A', margin: 0 }}>🛸 AR & 3D Models (คลังโมเดล 3 มิติ)</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px', margin: '4px 0 0 0' }}>
            อัปโหลดหรือเพิ่มลิงก์โมเดล 3 มิติ และสร้าง QR Code ให้นักเรียนสแกนเพื่อเรียนรู้แบบ AR
          </p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn btn-primary" style={{ border: 'none', borderRadius: '10px', padding: '10px 20px', fontWeight: 700 }}>
          ➕ เพิ่มโมเดลใหม่
        </button>
      </div>

      {/* Model List */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {models.length === 0 ? (
          <div className="erp-card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            ยังไม่มีโมเดล 3 มิติ
          </div>
        ) : (
          models.map(model => (
            <div key={model.id} className="erp-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{ width: '60px', height: '60px', background: '#F5F0E6', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' }}>
                  {model.thumbnail}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1A1410', margin: '0 0 4px 0' }}>{model.title}</h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {model.description || 'ไม่มีคำอธิบาย'}
                  </p>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
                <button 
                  onClick={() => setShowQRModal(model)}
                  className="btn btn-primary" 
                  style={{ flex: 1, padding: '8px', fontSize: '13px', fontWeight: 700, borderRadius: '8px' }}
                >
                  📱 สร้าง QR Code
                </button>
                <button 
                  onClick={() => handleDeleteModel(model.id)}
                  className="btn btn-outline" 
                  style={{ padding: '8px 16px', fontSize: '13px', fontWeight: 700, borderRadius: '8px', color: '#8B2635', borderColor: '#FAE8EB', background: '#FAE8EB' }}
                >
                  ลบ
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200 }}>
          <div className="erp-card" style={{ width: '500px', maxWidth: '90%', background: '#FFF' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1E4D3A', margin: 0 }}>➕ เพิ่มโมเดล 3 มิติ</h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'transparent', border: 'none', fontSize: '20px', cursor: 'pointer' }}>✕</button>
            </div>
            <form onSubmit={handleAddModel} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>ชื่อโมเดล / บทเรียน</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="erp-input" required placeholder="เช่น ชุดจัดโต๊ะอาหาร" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>ลิงก์ไฟล์ .glb (URL)</label>
                <input type="url" value={glbUrl} onChange={e => setGlbUrl(e.target.value)} className="erp-input" required placeholder="https://example.com/model.glb" />
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>* ต้องเป็นลิงก์ไฟล์นามสกุล .glb ที่สามารถเข้าถึงได้</p>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>คำอธิบายเพิ่มเติม</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} className="erp-input" rows={3} placeholder="อธิบายเกี่ยวกับโมเดลนี้..." />
              </div>
              
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '12px', fontWeight: 700, borderRadius: '8px' }}>บันทึกข้อมูล</button>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-outline" style={{ flex: 1, padding: '12px', fontWeight: 700, borderRadius: '8px' }}>ยกเลิก</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQRModal && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200 }}>
          <div className="erp-card" style={{ width: '400px', maxWidth: '90%', background: '#FFF', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowQRModal(null)} style={{ background: 'transparent', border: 'none', fontSize: '20px', cursor: 'pointer' }}>✕</button>
            </div>
            
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1E4D3A', margin: '0 0 20px 0' }}>{showQRModal.title}</h3>
            
            <div style={{ padding: '20px', background: '#FFF', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', display: 'inline-block' }}>
              <QRCodeSVG 
                value={`${getBaseUrl()}/student/ar-view?id=${showQRModal.id}`} 
                size={200}
                level="M"
                includeMargin={true}
              />
            </div>
            
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '20px', padding: '0 20px' }}>
              ให้นักเรียนใช้เมนู "สแกน QR Code" ในระบบของนักเรียนเพื่อเปิดดูโมเดลนี้แบบ AR
            </p>
            
            <div style={{ display: 'flex', gap: '10px', marginTop: '24px', width: '100%' }}>
              <button onClick={() => window.print()} className="btn btn-primary" style={{ flex: 1, padding: '12px', fontWeight: 700, borderRadius: '8px' }}>
                🖨️ พิมพ์ QR Code
              </button>
            </div>
          </div>
        </div>
      )}
      
    </div>
  )
}
