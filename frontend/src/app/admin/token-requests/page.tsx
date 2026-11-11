'use client'

import { useEffect, useState, useCallback } from 'react'
import { toast } from 'sonner'
import AdminIcon from '@/components/admin/AdminIcon'
import { authenticatedFetch } from '@/lib/api'
import {
  type TokenRequestRow,
  type TokenRequestStatus,
  REQUEST_TYPE_LABELS,
} from '@/lib/tokenRequestTypes'
import styles from './page.module.css'

type TabType = 'all' | 'pending' | 'approved' | 'rejected'

export default function AdminTokenRequestsPage() {
  const [requests, setRequests] = useState<TokenRequestRow[]>([])
  const [counts, setCounts] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 })
  const [activeTab, setActiveTab] = useState<TabType>('pending')
  const [loading, setLoading] = useState(true)

  // Modal State
  const [modalItem, setModalItem] = useState<{
    request: TokenRequestRow
    action: 'approve' | 'reject'
  } | null>(null)
  const [approvedQuota, setApprovedQuota] = useState(5000)
  const [adminNotes, setAdminNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const loadData = useCallback(async (tab = activeTab) => {
    setLoading(true)
    try {
      const param = tab === 'all' ? '' : `?status=${tab}`
      const res = await authenticatedFetch(`/api/admin/token-requests${param}`)
      if (!res.ok) throw new Error('โหลดข้อมูลคำขอไม่สำเร็จ')
      const data = await res.json()
      setRequests(data.requests || [])
      if (data.counts) setCounts(data.counts)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการโหลดข้อมูล')
    } finally {
      setLoading(false)
    }
  }, [activeTab])

  useEffect(() => {
    loadData(activeTab)
  }, [activeTab, loadData])

  function openActionModal(request: TokenRequestRow, action: 'approve' | 'reject') {
    setModalItem({ request, action })
    setApprovedQuota(5000)
    setAdminNotes(
      action === 'approve'
        ? 'อนุมัติการขยายโควต้าชั่วคราว สามารถใช้งานได้ทันที'
        : 'โควต้าปกติยังเพียงพอต่อการใช้งาน หากต้องการข้อมูลเพิ่มเติมโปรดติดต่อทีมงาน'
    )
  }

  async function handleConfirmAction() {
    if (!modalItem) return
    setSubmitting(true)
    try {
      const res = await authenticatedFetch('/api/admin/token-requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: modalItem.request.id,
          status: modalItem.action === 'approve' ? 'approved' : 'rejected',
          adminNotes,
          approvedQuota: modalItem.action === 'approve' ? approvedQuota : null,
        }),
      })

      if (!res.ok) throw new Error('ดำเนินการไม่สำเร็จ')
      toast.success(
        modalItem.action === 'approve'
          ? `อนุมัติคำขอของครู ${modalItem.request.teacher_name} เรียบร้อยแล้ว (+${approvedQuota.toLocaleString()} Requests)`
          : `ปฏิเสธคำขอเรียบร้อยแล้ว`
      )
      setModalItem(null)
      loadData(activeTab)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <p className={styles.eyebrow}>AI TOKEN &amp; QUOTA MANAGEMENT</p>
          <h1>คำขอโควต้า AI Token (Token Requests)</h1>
          <span className={styles.subtitle}>
            ตรวจสอบ จัดสรรโควต้าพิเศษ หรือตอบรับคำขอซื้อแพ็กเกจจากครูผู้สอน
          </span>
        </div>
        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() => loadData(activeTab)}
            disabled={loading}
          >
            <AdminIcon name="refresh" size={15} />
            รีเฟรช
          </button>
        </div>
      </header>

      {/* Metrics Grid */}
      <section className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricIcon} style={{ background: '#f0fdf4', color: '#166534' }}>
            <AdminIcon name="sparkles" size={22} />
          </div>
          <div className={styles.metricCopy}>
            <span>คำขอทั้งหมด</span>
            <strong>{counts.total}</strong>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricIcon} style={{ background: '#fef3c7', color: '#b45309' }}>
            <AdminIcon name="clock" size={22} />
          </div>
          <div className={styles.metricCopy}>
            <span>รอดำเนินการ</span>
            <strong style={{ color: '#b45309' }}>{counts.pending}</strong>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricIcon} style={{ background: '#ecfdf5', color: '#047857' }}>
            <AdminIcon name="check" size={22} />
          </div>
          <div className={styles.metricCopy}>
            <span>อนุมัติแล้ว</span>
            <strong style={{ color: '#047857' }}>{counts.approved}</strong>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricIcon} style={{ background: '#fef2f2', color: '#b91c1c' }}>
            <AdminIcon name="close" size={22} />
          </div>
          <div className={styles.metricCopy}>
            <span>ปฏิเสธ</span>
            <strong>{counts.rejected}</strong>
          </div>
        </div>
      </section>

      {/* Filter Tabs */}
      <div className={styles.tabs} role="tablist">
        {(
          [
            { id: 'pending', label: 'รอดำเนินการ', count: counts.pending },
            { id: 'approved', label: 'อนุมัติแล้ว', count: counts.approved },
            { id: 'rejected', label: 'ปฏิเสธ', count: counts.rejected },
            { id: 'all', label: 'ทั้งหมด', count: counts.total },
          ] as const
        ).map(t => (
          <button
            key={t.id}
            type="button"
            className={`${styles.tab} ${activeTab === t.id ? styles.activeTab : ''}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
            <span className={styles.tabCount}>{t.count}</span>
          </button>
        ))}
      </div>

      {/* Content Table */}
      <div className={styles.contentCard}>
        {loading ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <AdminIcon name="refresh" size={24} />
            </div>
            <h3>กำลังโหลดรายการคำขอ...</h3>
          </div>
        ) : requests.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <AdminIcon name="sparkles" size={24} />
            </div>
            <h3>ไม่พบรายการคำขอในสถานะนี้</h3>
            <p>เมื่อครูผู้สอนส่งคำขอเพิ่ม Token รายการจะมาปรากฏที่นี่</p>
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ครูผู้สอน / โรงเรียน</th>
                  <th>ประเภทคำขอ</th>
                  <th>จำนวนนักเรียน / วันที่</th>
                  <th>ช่องทางติดต่อ &amp; หมายเหตุ</th>
                  <th>วันที่ส่งคำขอ</th>
                  <th>สถานะ</th>
                  <th style={{ textAlign: 'right' }}>การดำเนินการ</th>
                </tr>
              </thead>
              <tbody>
                {requests.map(req => {
                  const typeLabel = REQUEST_TYPE_LABELS[req.request_type] || req.request_type
                  const isPending = req.status === 'pending'
                  const isApproved = req.status === 'approved'

                  return (
                    <tr key={req.id}>
                      <td className={styles.teacherCell}>
                        <strong>{req.teacher_name}</strong>
                        <small>{req.school_name || 'ไม่ระบุโรงเรียน'}</small>
                      </td>
                      <td>
                        <span
                          className={`${styles.typeBadge} ${
                            req.request_type === 'purchase_package'
                              ? styles.purchase
                              : req.request_type === 'institution_key'
                              ? styles.key
                              : ''
                          }`}
                        >
                          {typeLabel}
                        </span>
                        {req.package_name && (
                          <div style={{ fontSize: 11, color: '#64748b', marginTop: 3 }}>
                            แพ็กเกจ: {req.package_name}
                          </div>
                        )}
                      </td>
                      <td>
                        <div>👥 {req.student_count || 30} คน</div>
                        {req.target_date && (
                          <small style={{ color: '#64748b' }}>📅 {req.target_date}</small>
                        )}
                      </td>
                      <td>
                        {req.contact_channel && (
                          <div style={{ fontWeight: 600 }}>📞 {req.contact_channel}</div>
                        )}
                        {req.notes && (
                          <small style={{ color: '#64748b', display: 'block', maxWidth: 220 }}>
                            {req.notes}
                          </small>
                        )}
                      </td>
                      <td>
                        <span style={{ color: '#64748b' }}>
                          {new Date(req.created_at).toLocaleDateString('th-TH', {
                            day: 'numeric',
                            month: 'short',
                            year: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`${styles.statusBadge} ${
                            isPending
                              ? styles.statusPending
                              : isApproved
                              ? styles.statusApproved
                              : styles.statusRejected
                          }`}
                        >
                          {isPending && '🟡 รอดำเนินการ'}
                          {isApproved && `🟢 อนุมัติ (+${(req.approved_quota || 0).toLocaleString()} req)`}
                          {!isPending && !isApproved && '🔴 ปฏิเสธ'}
                        </span>
                        {req.admin_notes && (
                          <div style={{ fontSize: 10, color: '#64748b', marginTop: 3 }}>
                            บันทึก: {req.admin_notes}
                          </div>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {isPending ? (
                          <div className={styles.actionsCell} style={{ justifyContent: 'flex-end' }}>
                            <button
                              type="button"
                              className={styles.approveButton}
                              onClick={() => openActionModal(req, 'approve')}
                            >
                              <AdminIcon name="check" size={14} />
                              อนุมัติ
                            </button>
                            <button
                              type="button"
                              className={styles.rejectButton}
                              onClick={() => openActionModal(req, 'reject')}
                            >
                              <AdminIcon name="close" size={14} />
                              ปฏิเสธ
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: 11, color: '#94a3b8' }}>ดำเนินการแล้ว</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Action Modal */}
      {modalItem && (
        <div className={styles.modalBackdrop} onClick={() => !submitting && setModalItem(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>
                {modalItem.action === 'approve' ? 'อนุมัติคำขอโควต้า AI' : 'ปฏิเสธคำขอโควต้า AI'}
              </h2>
              <button
                type="button"
                className={styles.closeButton}
                onClick={() => setModalItem(null)}
                disabled={submitting}
              >
                <AdminIcon name="close" size={18} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div>
                <p style={{ margin: '0 0 4px', fontSize: 12, color: '#64748b' }}>ครูผู้ส่งคำขอ:</p>
                <strong style={{ fontSize: 14, color: '#1e293b' }}>
                  {modalItem.request.teacher_name} ({modalItem.request.school_name || 'ไม่ระบุโรงเรียน'})
                </strong>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                  ประเภท: {REQUEST_TYPE_LABELS[modalItem.request.request_type]} · นักเรียน {modalItem.request.student_count} คน
                </div>
              </div>

              {modalItem.action === 'approve' && (
                <div className={styles.formGroup}>
                  <label htmlFor="approvedQuota">จำนวนโควต้า Requests ที่อนุมัติเพิ่ม:</label>
                  <input
                    id="approvedQuota"
                    type="number"
                    min={500}
                    step={500}
                    value={approvedQuota}
                    onChange={e => setApprovedQuota(Number(e.target.value) || 0)}
                  />
                  <small style={{ color: '#64748b' }}>
                    * โควต้าจะถูกเพิ่มเข้ากับ Limit ประจำวันในระบบทันที
                  </small>
                </div>
              )}

              <div className={styles.formGroup}>
                <label htmlFor="adminNotes">
                  {modalItem.action === 'approve' ? 'ข้อความแจ้งถึงคุณครู (ส่งแจ้งเตือน):' : 'เหตุผลการปฏิเสธ:'}
                </label>
                <textarea
                  id="adminNotes"
                  rows={3}
                  value={adminNotes}
                  onChange={e => setAdminNotes(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => setModalItem(null)}
                disabled={submitting}
              >
                ยกเลิก
              </button>
              <button
                type="button"
                className={modalItem.action === 'approve' ? styles.primaryButton : styles.rejectButton}
                onClick={handleConfirmAction}
                disabled={submitting}
              >
                <AdminIcon name={modalItem.action === 'approve' ? 'check' : 'close'} size={15} />
                {submitting
                  ? 'กำลังบันทึก...'
                  : modalItem.action === 'approve'
                  ? 'ยืนยันอนุมัติคำขอ'
                  : 'ยืนยันปฏิเสธ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
