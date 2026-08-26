'use client'

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import AdminIcon from '@/components/admin/AdminIcon'
import { authenticatedFetch } from '@/lib/api'
import styles from './page.module.css'

type UserRole = 'developer' | 'teacher' | 'student'
type UserStatus = 'active' | 'inactive' | 'pending'
type UserTab = 'teachers' | 'pending' | 'students'
type ManagedRole = 'teacher' | 'student'
type ManagedStatus = 'active' | 'inactive' | 'pending'

interface UserItem {
  id: string
  name: string
  email: string
  role: UserRole
  requestedRole?: UserRole
  school: string
  status: UserStatus
  createdAt?: string
}

interface AdminProfileRecord {
  id: string
  name?: string
  email?: string
  role?: UserRole
  requested_role?: UserRole
  approval_status?: UserStatus
  school_name?: string
  created_at?: string
}

interface UserForm {
  name: string
  email: string
  password: string
  confirmPassword: string
  school: string
  role: ManagedRole
  status: ManagedStatus
}

type ConfirmAction = {
  kind: 'delete' | 'reject'
  user: UserItem
}

const emptyUserForm: UserForm = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  school: '',
  role: 'student',
  status: 'active',
}

const tabLabels: Record<UserTab, string> = {
  teachers: 'ครูผู้สอน',
  pending: 'รออนุมัติ',
  students: 'นักเรียน',
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return 'U'
  return parts.slice(0, 2).map(part => part.charAt(0)).join('').toUpperCase()
}

function formatDate(value?: string) {
  if (!value) return 'ไม่ระบุ'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'ไม่ระบุ'
  return new Intl.DateTimeFormat('th-TH', {
    day: 'numeric',
    month: 'short',
    year: '2-digit',
  }).format(date)
}

async function getResponseError(response: Response) {
  try {
    const payload = await response.json() as { error?: string | { message?: string } }
    if (typeof payload.error === 'string') return payload.error
    if (payload.error?.message) return payload.error.message
  } catch {
    // The generic message below is more useful than a JSON parse failure.
  }
  return 'ไม่สามารถดำเนินการได้ กรุณาลองใหม่อีกครั้ง'
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([])
  const [activeTab, setActiveTab] = useState<UserTab>('teachers')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [busyAction, setBusyAction] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [createForm, setCreateForm] = useState<UserForm>(emptyUserForm)
  const [editTarget, setEditTarget] = useState<UserItem | null>(null)
  const [editForm, setEditForm] = useState<UserForm>(emptyUserForm)
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null)
  const [visiblePasswords, setVisiblePasswords] = useState({
    create: false,
    createConfirm: false,
    edit: false,
    editConfirm: false,
  })

  const loadUsers = useCallback(async (signal?: AbortSignal) => {
    const response = await authenticatedFetch('/api/admin/users', { signal })
    if (!response.ok) throw new Error(await getResponseError(response))
    const payload = await response.json() as { users?: AdminProfileRecord[] }
    setUsers((payload.users ?? []).map(user => ({
      id: user.id,
      name: user.name?.trim() || user.email || 'ผู้ใช้งาน',
      email: user.email || '',
      role: user.role || 'student',
      requestedRole: user.requested_role,
      school: user.school_name?.trim() || 'ไม่ระบุสถานศึกษา',
      status: user.approval_status || 'inactive',
      createdAt: user.created_at,
    })))
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    void Promise.resolve()
      .then(() => loadUsers(controller.signal))
      .catch(loadError => {
        if (loadError instanceof Error && loadError.name !== 'AbortError') {
          setError(loadError.message)
        }
      })
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [loadUsers])

  useEffect(() => {
    const requestedTab = new URLSearchParams(window.location.search).get('tab')
    const timer = window.setTimeout(() => {
      if (requestedTab === 'teachers' || requestedTab === 'pending' || requestedTab === 'students') {
        setActiveTab(requestedTab)
      }
    }, 0)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key !== 'Escape' || busyAction) return
      setCreateOpen(false)
      setEditTarget(null)
      setConfirmAction(null)
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [busyAction])

  const managedUsers = useMemo(() => users.filter(user => user.role !== 'developer'), [users])

  const groups = useMemo(() => {
    const pending = managedUsers.filter(user => user.requestedRole === 'teacher' && user.status === 'pending')
    const pendingIds = new Set(pending.map(user => user.id))
    return {
      teachers: managedUsers.filter(user => user.role === 'teacher' && !pendingIds.has(user.id)),
      pending,
      students: managedUsers.filter(user => user.role === 'student' && !pendingIds.has(user.id)),
    }
  }, [managedUsers])

  const visibleUsers = useMemo(() => {
    const keyword = search.trim().toLocaleLowerCase('th-TH')
    if (!keyword) return groups[activeTab]
    return groups[activeTab].filter(user => (
      user.name.toLocaleLowerCase('th-TH').includes(keyword)
      || user.email.toLocaleLowerCase('th-TH').includes(keyword)
      || user.school.toLocaleLowerCase('th-TH').includes(keyword)
    ))
  }, [activeTab, groups, search])

  const summary = [
    { key: 'total', label: 'ผู้ใช้ทั้งหมด', value: managedUsers.length, detail: 'บัญชีครูและนักเรียน', icon: 'users' as const },
    { key: 'teachers', label: 'ครูผู้สอน', value: groups.teachers.length, detail: 'บัญชีที่ได้รับสิทธิ์แล้ว', icon: 'teacher' as const },
    { key: 'students', label: 'นักเรียน', value: groups.students.length, detail: 'ผู้เรียนที่ลงทะเบียน', icon: 'student' as const },
    { key: 'pending', label: 'รออนุมัติ', value: groups.pending.length, detail: 'คำขอสิทธิ์ครูผู้สอน', icon: 'clock' as const },
  ]

  function clearFeedback() {
    setError('')
    setNotice('')
  }

  async function refreshUsers(showFeedback = false) {
    clearFeedback()
    setRefreshing(true)
    try {
      await loadUsers()
      if (showFeedback) setNotice('อัปเดตข้อมูลผู้ใช้งานแล้ว')
    } catch (refreshError) {
      setError(refreshError instanceof Error ? refreshError.message : 'ไม่สามารถโหลดข้อมูลผู้ใช้งานได้')
    } finally {
      setRefreshing(false)
    }
  }

  async function updateUser(user: UserItem, action: 'approve' | 'reject' | 'toggle') {
    const actionKey = `${action}:${user.id}`
    clearFeedback()
    setBusyAction(actionKey)
    try {
      const response = await authenticatedFetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id, action }),
      })
      if (!response.ok) throw new Error(await getResponseError(response))
      await loadUsers()
      return true
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'ไม่สามารถปรับปรุงบัญชีได้')
      return false
    } finally {
      setBusyAction(null)
    }
  }

  async function handleCreateUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const { confirmPassword, ...payload } = createForm
    if (createForm.password !== confirmPassword) {
      toast.warning('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน')
      return
    }
    clearFeedback()
    setBusyAction('create')
    try {
      const response = await authenticatedFetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!response.ok) throw new Error(await getResponseError(response))
      await loadUsers()
      setCreateForm(emptyUserForm)
      setVisiblePasswords(current => ({ ...current, create: false, createConfirm: false }))
      setCreateOpen(false)
      setActiveTab(createForm.role === 'teacher' ? 'teachers' : 'students')
      toast.success(`เพิ่มบัญชี${createForm.role === 'teacher' ? 'ครูผู้สอน' : 'นักเรียน'}เรียบร้อยแล้ว`)
    } catch (createError) {
      toast.error(createError instanceof Error ? createError.message : 'ไม่สามารถเพิ่มบัญชีผู้ใช้ได้')
    } finally {
      setBusyAction(null)
    }
  }

  function openEditUser(user: UserItem) {
    clearFeedback()
    setEditTarget(user)
    setEditForm({
      name: user.name,
      email: user.email,
      password: '',
      confirmPassword: '',
      school: user.school === 'ไม่ระบุสถานศึกษา' ? '' : user.school,
      role: user.role === 'teacher' ? 'teacher' : 'student',
      status: user.status,
    })
    setVisiblePasswords(current => ({ ...current, edit: false, editConfirm: false }))
  }

  async function handleEditUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!editTarget) return
    const { confirmPassword, ...payload } = editForm
    if (editForm.password !== confirmPassword) {
      toast.warning('รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน')
      return
    }
    clearFeedback()
    setBusyAction(`update:${editTarget.id}`)
    try {
      const response = await authenticatedFetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editTarget.id, action: 'update', ...payload }),
      })
      if (!response.ok) throw new Error(await getResponseError(response))
      await loadUsers()
      setEditTarget(null)
      setEditForm(emptyUserForm)
      setVisiblePasswords(current => ({ ...current, edit: false, editConfirm: false }))
      setActiveTab(editForm.role === 'teacher' ? 'teachers' : 'students')
      toast.success(`บันทึกข้อมูลของ ${editForm.name} แล้ว`)
    } catch (editError) {
      toast.error(editError instanceof Error ? editError.message : 'ไม่สามารถแก้ไขบัญชีได้')
    } finally {
      setBusyAction(null)
    }
  }

  async function handleConfirm() {
    if (!confirmAction) return
    const { kind, user } = confirmAction
    if (kind === 'reject') {
      const success = await updateUser(user, 'reject')
      if (success) {
        setConfirmAction(null)
        setNotice(`ปฏิเสธคำขอสิทธิ์ครูของ ${user.name} แล้ว`)
      }
      return
    }

    clearFeedback()
    setBusyAction(`delete:${user.id}`)
    try {
      const response = await authenticatedFetch(`/api/admin/users?id=${encodeURIComponent(user.id)}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error(await getResponseError(response))
      await loadUsers()
      setConfirmAction(null)
      setNotice(`ลบบัญชี ${user.name} ออกจากระบบแล้ว`)
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'ไม่สามารถลบบัญชีได้')
    } finally {
      setBusyAction(null)
    }
  }

  async function handleApprove(user: UserItem) {
    const success = await updateUser(user, 'approve')
    if (success) {
      setNotice(`อนุมัติสิทธิ์ครูให้ ${user.name} แล้ว`)
      if (groups.pending.length === 1) setActiveTab('teachers')
    }
  }

  async function handleToggle(user: UserItem) {
    const success = await updateUser(user, 'toggle')
    if (success) {
      setNotice(user.status === 'active' ? `ระงับการใช้งานของ ${user.name} แล้ว` : `เปิดใช้งานบัญชี ${user.name} แล้ว`)
    }
  }

  const tabDescription = activeTab === 'pending'
    ? 'ตรวจสอบและอนุมัติคำขอเปลี่ยนบทบาทเป็นครูผู้สอน'
    : `จัดการบัญชี${tabLabels[activeTab]}และสถานะการเข้าใช้งาน`

  return (
    <main className={styles.usersPage}>
      <header className={styles.pageHeader}>
        <div>
          <p>USER MANAGEMENT</p>
          <h1>จัดการผู้ใช้งาน</h1>
          <span>ดูแลบัญชี บทบาท และสิทธิ์การเข้าใช้งานจากจุดเดียว</span>
        </div>
        <div className={styles.headerActions}>
          <button
            className={styles.secondaryButton}
            type="button"
            onClick={() => void refreshUsers(true)}
            disabled={refreshing || Boolean(busyAction)}
          >
            <AdminIcon name="refresh" size={16} />
            <span>{refreshing ? 'กำลังอัปเดต' : 'อัปเดตข้อมูล'}</span>
          </button>
          <button
            className={styles.primaryButton}
            type="button"
            onClick={() => {
              clearFeedback()
              setCreateForm(emptyUserForm)
              setVisiblePasswords(current => ({ ...current, create: false, createConfirm: false }))
              setCreateOpen(true)
            }}
          >
            <AdminIcon name="plus" size={16} />
            <span>เพิ่มผู้ใช้งาน</span>
          </button>
        </div>
      </header>

      {error && (
        <div className={styles.error} role="alert">
          <span>{error}</span>
          <button type="button" onClick={() => setError('')}>ปิด</button>
        </div>
      )}
      {notice && (
        <div className={styles.notice} role="status">
          <AdminIcon name="check" size={16} />
          <span>{notice}</span>
          <button type="button" aria-label="ปิดข้อความ" onClick={() => setNotice('')}>
            <AdminIcon name="close" size={14} />
          </button>
        </div>
      )}

      <section className={styles.metrics} aria-label="สรุปจำนวนผู้ใช้งาน">
        {summary.map(item => (
          <article className={styles.metricCard} data-metric={item.key} key={item.key}>
            <span className={styles.metricIcon}><AdminIcon name={item.icon} size={20} /></span>
            <span className={styles.metricCopy}>
              <small>{item.label}</small>
              <strong>{loading ? '—' : item.value.toLocaleString('th-TH')}</strong>
              <span>{item.detail}</span>
            </span>
          </article>
        ))}
      </section>

      <section className={styles.workspace}>
        <div className={styles.workspaceHeader}>
          <div className={styles.tabs} role="tablist" aria-label="ประเภทผู้ใช้งาน">
            {(Object.keys(tabLabels) as UserTab[]).map(tab => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={activeTab === tab}
                className={styles.tab}
                onClick={() => setActiveTab(tab)}
              >
                {tabLabels[tab]}
                <span>{groups[tab].length.toLocaleString('th-TH')}</span>
              </button>
            ))}
          </div>
          <div className={styles.workspaceTitle}>
            <div>
              <h2>{tabLabels[activeTab]}</h2>
              <p>{tabDescription}</p>
            </div>
            <label className={styles.searchBox}>
              <AdminIcon name="search" size={17} />
              <span className={styles.srOnly}>ค้นหาผู้ใช้งาน</span>
              <input
                type="search"
                value={search}
                onChange={event => setSearch(event.target.value)}
                placeholder="ค้นหาชื่อ อีเมล หรือสถานศึกษา"
              />
            </label>
          </div>
        </div>

        <div className={styles.userList} aria-busy={loading || refreshing}>
          <div className={styles.listHeader} aria-hidden="true">
            <span>ผู้ใช้งาน</span>
            <span>สถานศึกษา</span>
            <span>บทบาท</span>
            <span>วันที่สมัคร</span>
            <span>สถานะ</span>
            <span>จัดการ</span>
          </div>

          {loading ? (
            <div className={styles.loadingState}>
              <span className={styles.loadingIndicator} />
              <p>กำลังโหลดข้อมูลผู้ใช้งาน</p>
            </div>
          ) : visibleUsers.length === 0 ? (
            <div className={styles.emptyState}>
              <span><AdminIcon name={search ? 'search' : activeTab === 'pending' ? 'clock' : 'users'} size={24} /></span>
              <h3>{search ? 'ไม่พบผู้ใช้ที่ตรงกับการค้นหา' : `ยังไม่มี${tabLabels[activeTab]}ในรายการ`}</h3>
              <p>{search ? 'ลองเปลี่ยนชื่อ อีเมล หรือสถานศึกษาที่ใช้ค้นหา' : 'ข้อมูลจะแสดงที่นี่เมื่อมีผู้ใช้งานในหมวดนี้'}</p>
            </div>
          ) : visibleUsers.map(user => {
            const isBusy = busyAction?.endsWith(user.id) ?? false
            return (
              <article className={styles.userRow} key={user.id} data-role={activeTab === 'pending' ? 'pending' : user.role}>
                <div className={styles.userIdentity}>
                  <span className={styles.avatar}>{getInitials(user.name)}</span>
                  <span>
                    <strong>{user.name}</strong>
                    <small>{user.email || 'ไม่ระบุอีเมล'}</small>
                  </span>
                </div>
                <span className={styles.school} title={user.school}>{user.school}</span>
                <span className={styles.roleBadge} data-role={activeTab === 'pending' ? 'pending' : user.role}>
                  {activeTab === 'pending' ? 'คำขอครู' : user.role === 'teacher' ? 'ครู' : 'นักเรียน'}
                </span>
                <span className={styles.createdAt}>{formatDate(user.createdAt)}</span>
                <span className={styles.statusBadge} data-status={user.status}>
                  {user.status === 'active' ? 'ใช้งาน' : user.status === 'pending' ? 'รออนุมัติ' : 'ระงับ'}
                </span>
                <div className={styles.userActions}>
                  {activeTab === 'pending' ? (
                    <>
                      <button
                        type="button"
                        className={styles.iconButton}
                        aria-label={`แก้ไขบัญชี ${user.name}`}
                        title="แก้ไขข้อมูล"
                        onClick={() => openEditUser(user)}
                        disabled={isBusy}
                      >
                        <AdminIcon name="edit" size={15} />
                      </button>
                      <button
                        type="button"
                        className={styles.approveButton}
                        onClick={() => void handleApprove(user)}
                        disabled={isBusy}
                      >
                        <AdminIcon name="check" size={15} />
                        <span>อนุมัติ</span>
                      </button>
                      <button
                        type="button"
                        className={styles.iconButtonDanger}
                        aria-label={`ปฏิเสธคำขอของ ${user.name}`}
                        title="ปฏิเสธคำขอ"
                        onClick={() => setConfirmAction({ kind: 'reject', user })}
                        disabled={isBusy}
                      >
                        <AdminIcon name="close" size={15} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        className={styles.iconButton}
                        aria-label={`แก้ไขบัญชี ${user.name}`}
                        title="แก้ไขข้อมูล"
                        onClick={() => openEditUser(user)}
                        disabled={isBusy}
                      >
                        <AdminIcon name="edit" size={15} />
                      </button>
                      <button
                        type="button"
                        className={styles.iconButton}
                        aria-label={`${user.status === 'active' ? 'ระงับ' : 'เปิด'}บัญชี ${user.name}`}
                        title={user.status === 'active' ? 'ระงับบัญชี' : 'เปิดใช้งานบัญชี'}
                        onClick={() => void handleToggle(user)}
                        disabled={isBusy}
                      >
                        <AdminIcon name={user.status === 'active' ? 'pause' : 'play'} size={15} />
                      </button>
                      <button
                        type="button"
                        className={styles.iconButtonDanger}
                        aria-label={`ลบบัญชี ${user.name}`}
                        title="ลบบัญชี"
                        onClick={() => setConfirmAction({ kind: 'delete', user })}
                        disabled={isBusy}
                      >
                        <AdminIcon name="trash" size={15} />
                      </button>
                    </>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      </section>

      {createOpen && (
        <div className={styles.modalOverlay} onMouseDown={event => {
          if (event.target === event.currentTarget && !busyAction) setCreateOpen(false)
        }}>
          <section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="create-title">
            <div className={styles.modalHeader}>
              <span><AdminIcon name={createForm.role === 'teacher' ? 'teacher' : 'student'} size={22} /></span>
              <div>
                <h2 id="create-title">เพิ่มผู้ใช้งานใหม่</h2>
                <p>สร้างบัญชีครูหรือนักเรียนและกำหนดสิทธิ์ได้ทันที</p>
              </div>
              <button type="button" aria-label="ปิดหน้าต่าง" onClick={() => setCreateOpen(false)} disabled={Boolean(busyAction)}>
                <AdminIcon name="close" size={18} />
              </button>
            </div>
            <form className={styles.modalForm} onSubmit={handleCreateUser}>
              <fieldset className={styles.roleFieldset}>
                <legend>ประเภทบัญชี</legend>
                <div className={styles.roleSelector}>
                  <button
                    type="button"
                    aria-pressed={createForm.role === 'teacher'}
                    onClick={() => setCreateForm(current => ({ ...current, role: 'teacher' }))}
                  >
                    <span><AdminIcon name="teacher" size={20} /></span>
                    <span><strong>ครูผู้สอน</strong><small>จัดการชั้นเรียนและเนื้อหา</small></span>
                    <AdminIcon name="check" size={16} />
                  </button>
                  <button
                    type="button"
                    aria-pressed={createForm.role === 'student'}
                    onClick={() => setCreateForm(current => ({ ...current, role: 'student' }))}
                  >
                    <span><AdminIcon name="student" size={20} /></span>
                    <span><strong>นักเรียน</strong><small>เข้าเรียนและทำกิจกรรม</small></span>
                    <AdminIcon name="check" size={16} />
                  </button>
                </div>
              </fieldset>
              <div className={styles.formGrid}>
                <label>
                  <span>ชื่อ–นามสกุล</span>
                  <input
                    autoFocus
                    required
                    value={createForm.name}
                    onChange={event => setCreateForm(current => ({ ...current, name: event.target.value }))}
                    placeholder="ชื่อผู้ใช้งาน"
                  />
                </label>
                <label>
                  <span>อีเมล</span>
                  <input
                    required
                    type="email"
                    autoComplete="email"
                    value={createForm.email}
                    onChange={event => setCreateForm(current => ({ ...current, email: event.target.value }))}
                    placeholder={createForm.role === 'teacher' ? 'teacher@example.com' : 'student@example.com'}
                  />
                </label>
                <label>
                  <span>รหัสผ่านเริ่มต้น</span>
                  <span className={styles.passwordField}>
                    <input
                      required
                      minLength={8}
                      type={visiblePasswords.create ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={createForm.password}
                      onChange={event => setCreateForm(current => ({ ...current, password: event.target.value }))}
                      placeholder="อย่างน้อย 8 ตัวอักษร"
                    />
                    <button
                      type="button"
                      aria-label={visiblePasswords.create ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                      aria-pressed={visiblePasswords.create}
                      onClick={() => setVisiblePasswords(current => ({ ...current, create: !current.create }))}
                    >
                      <AdminIcon name={visiblePasswords.create ? 'eyeOff' : 'eye'} size={18} />
                    </button>
                  </span>
                </label>
                <label>
                  <span>ยืนยันรหัสผ่าน</span>
                  <span className={styles.passwordField}>
                    <input
                      required
                      minLength={8}
                      type={visiblePasswords.createConfirm ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={createForm.confirmPassword}
                      onChange={event => setCreateForm(current => ({ ...current, confirmPassword: event.target.value }))}
                      placeholder="กรอกรหัสผ่านอีกครั้ง"
                    />
                    <button
                      type="button"
                      aria-label={visiblePasswords.createConfirm ? 'ซ่อนการยืนยันรหัสผ่าน' : 'แสดงการยืนยันรหัสผ่าน'}
                      aria-pressed={visiblePasswords.createConfirm}
                      onClick={() => setVisiblePasswords(current => ({ ...current, createConfirm: !current.createConfirm }))}
                    >
                      <AdminIcon name={visiblePasswords.createConfirm ? 'eyeOff' : 'eye'} size={18} />
                    </button>
                  </span>
                </label>
                <label>
                  <span>สถานศึกษา</span>
                  <input
                    value={createForm.school}
                    onChange={event => setCreateForm(current => ({ ...current, school: event.target.value }))}
                    placeholder="ชื่อสถานศึกษา (ถ้ามี)"
                  />
                </label>
                <label>
                  <span>สถานะเริ่มต้น</span>
                  <select
                    value={createForm.status}
                    onChange={event => setCreateForm(current => ({ ...current, status: event.target.value as ManagedStatus }))}
                  >
                    <option value="active">เปิดใช้งาน</option>
                    <option value="inactive">ระงับการใช้งาน</option>
                  </select>
                </label>
              </div>
              <div className={styles.modalActions}>
                <button type="button" onClick={() => setCreateOpen(false)} disabled={Boolean(busyAction)}>ยกเลิก</button>
                <button type="submit" className={styles.primaryButton} disabled={Boolean(busyAction)}>
                  <AdminIcon name={busyAction === 'create' ? 'clock' : 'check'} size={17} />
                  {busyAction === 'create' ? 'กำลังบันทึกบัญชี' : 'บันทึกผู้ใช้งาน'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {editTarget && (
        <div className={styles.modalOverlay} onMouseDown={event => {
          if (event.target === event.currentTarget && !busyAction) setEditTarget(null)
        }}>
          <section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="edit-title">
            <div className={styles.modalHeader}>
              <span><AdminIcon name="edit" size={22} /></span>
              <div>
                <h2 id="edit-title">แก้ไขบัญชีผู้ใช้งาน</h2>
                <p>ปรับข้อมูล บทบาท สถานะ และรหัสผ่านของ {editTarget.name}</p>
              </div>
              <button type="button" aria-label="ปิดหน้าต่าง" onClick={() => setEditTarget(null)} disabled={Boolean(busyAction)}>
                <AdminIcon name="close" size={18} />
              </button>
            </div>
            <form className={styles.modalForm} onSubmit={handleEditUser}>
              <fieldset className={styles.roleFieldset}>
                <legend>บทบาทในระบบ</legend>
                <div className={styles.roleSelector}>
                  <button
                    type="button"
                    aria-pressed={editForm.role === 'teacher'}
                    onClick={() => setEditForm(current => ({ ...current, role: 'teacher' }))}
                  >
                    <span><AdminIcon name="teacher" size={20} /></span>
                    <span><strong>ครูผู้สอน</strong><small>จัดการชั้นเรียนและเนื้อหา</small></span>
                    <AdminIcon name="check" size={16} />
                  </button>
                  <button
                    type="button"
                    aria-pressed={editForm.role === 'student'}
                    onClick={() => setEditForm(current => ({
                      ...current,
                      role: 'student',
                      status: current.status === 'pending' ? 'inactive' : current.status,
                    }))}
                  >
                    <span><AdminIcon name="student" size={20} /></span>
                    <span><strong>นักเรียน</strong><small>เข้าเรียนและทำกิจกรรม</small></span>
                    <AdminIcon name="check" size={16} />
                  </button>
                </div>
              </fieldset>
              {editTarget.role === 'teacher' && editForm.role === 'student' && (
                <div className={styles.formWarning} role="note">
                  <AdminIcon name="shield" size={17} />
                  <span>เมื่อเปลี่ยนเป็นนักเรียน ระบบจะเก็บชั้นเรียนและเนื้อหาเดิมไว้ แต่ยกเลิกการเชื่อมโยงบัญชีนี้ในฐานะผู้สอน</span>
                </div>
              )}
              <div className={styles.formGrid}>
                <label>
                  <span>ชื่อ–นามสกุล</span>
                  <input
                    autoFocus
                    required
                    value={editForm.name}
                    onChange={event => setEditForm(current => ({ ...current, name: event.target.value }))}
                    placeholder="ชื่อผู้ใช้งาน"
                  />
                </label>
                <label>
                  <span>อีเมล</span>
                  <input
                    required
                    type="email"
                    autoComplete="email"
                    value={editForm.email}
                    onChange={event => setEditForm(current => ({ ...current, email: event.target.value }))}
                    placeholder="user@example.com"
                  />
                </label>
                <label>
                  <span>สถานศึกษา</span>
                  <input
                    value={editForm.school}
                    onChange={event => setEditForm(current => ({ ...current, school: event.target.value }))}
                    placeholder="ชื่อสถานศึกษา (ถ้ามี)"
                  />
                </label>
                <label>
                  <span>สถานะบัญชี</span>
                  <select
                    value={editForm.status}
                    onChange={event => setEditForm(current => ({ ...current, status: event.target.value as ManagedStatus }))}
                  >
                    <option value="active">เปิดใช้งาน</option>
                    <option value="inactive">ระงับการใช้งาน</option>
                    {editForm.role === 'teacher' && <option value="pending">รออนุมัติ</option>}
                  </select>
                </label>
                <label>
                  <span>รหัสผ่านใหม่ <small>ไม่เปลี่ยนให้เว้นว่าง</small></span>
                  <span className={styles.passwordField}>
                    <input
                      minLength={8}
                      type={visiblePasswords.edit ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={editForm.password}
                      onChange={event => setEditForm(current => ({ ...current, password: event.target.value }))}
                      placeholder="อย่างน้อย 8 ตัวอักษร"
                    />
                    <button
                      type="button"
                      aria-label={visiblePasswords.edit ? 'ซ่อนรหัสผ่านใหม่' : 'แสดงรหัสผ่านใหม่'}
                      aria-pressed={visiblePasswords.edit}
                      onClick={() => setVisiblePasswords(current => ({ ...current, edit: !current.edit }))}
                    >
                      <AdminIcon name={visiblePasswords.edit ? 'eyeOff' : 'eye'} size={18} />
                    </button>
                  </span>
                </label>
                <label>
                  <span>ยืนยันรหัสผ่านใหม่</span>
                  <span className={styles.passwordField}>
                    <input
                      minLength={8}
                      type={visiblePasswords.editConfirm ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={editForm.confirmPassword}
                      onChange={event => setEditForm(current => ({ ...current, confirmPassword: event.target.value }))}
                      placeholder="กรอกรหัสผ่านอีกครั้ง"
                    />
                    <button
                      type="button"
                      aria-label={visiblePasswords.editConfirm ? 'ซ่อนการยืนยันรหัสผ่านใหม่' : 'แสดงการยืนยันรหัสผ่านใหม่'}
                      aria-pressed={visiblePasswords.editConfirm}
                      onClick={() => setVisiblePasswords(current => ({ ...current, editConfirm: !current.editConfirm }))}
                    >
                      <AdminIcon name={visiblePasswords.editConfirm ? 'eyeOff' : 'eye'} size={18} />
                    </button>
                  </span>
                </label>
              </div>
              <div className={styles.modalActions}>
                <button type="button" onClick={() => setEditTarget(null)} disabled={Boolean(busyAction)}>ยกเลิก</button>
                <button type="submit" className={styles.primaryButton} disabled={Boolean(busyAction)}>
                  <AdminIcon name={busyAction?.startsWith('update:') ? 'clock' : 'check'} size={17} />
                  {busyAction?.startsWith('update:') ? 'กำลังบันทึกข้อมูล' : 'บันทึกการแก้ไข'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {confirmAction && (
        <div className={styles.modalOverlay} onMouseDown={event => {
          if (event.target === event.currentTarget && !busyAction) setConfirmAction(null)
        }}>
          <section className={`${styles.modal} ${styles.confirmModal}`} role="alertdialog" aria-modal="true" aria-labelledby="confirm-title">
            <div className={styles.confirmIcon}>
              <AdminIcon name={confirmAction.kind === 'delete' ? 'trash' : 'close'} size={22} />
            </div>
            <h2 id="confirm-title">{confirmAction.kind === 'delete' ? 'ยืนยันการลบบัญชี' : 'ยืนยันการปฏิเสธคำขอ'}</h2>
            <p>
              {confirmAction.kind === 'delete'
                ? confirmAction.user.role === 'teacher'
                  ? `บัญชีของ ${confirmAction.user.name} จะถูกลบ ส่วนชั้นเรียนและเนื้อหาเดิมจะยังคงอยู่โดยยกเลิกการเชื่อมโยงเจ้าของบัญชี`
                  : `บัญชีของ ${confirmAction.user.name} และข้อมูลการเรียนที่เชื่อมโยงจะถูกลบออกจากระบบ`
                : `คำขอสิทธิ์ครูของ ${confirmAction.user.name} จะถูกปฏิเสธและบัญชีจะถูกระงับ`}
            </p>
            <div className={styles.modalActions}>
              <button type="button" onClick={() => setConfirmAction(null)} disabled={Boolean(busyAction)}>ยกเลิก</button>
              <button type="button" className={styles.dangerButton} onClick={() => void handleConfirm()} disabled={Boolean(busyAction)}>
                {busyAction ? 'กำลังดำเนินการ' : confirmAction.kind === 'delete' ? 'ลบบัญชี' : 'ปฏิเสธคำขอ'}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  )
}
