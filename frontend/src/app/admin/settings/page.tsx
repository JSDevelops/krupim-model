'use client'

import { FormEvent, useEffect, useState } from 'react'
import { toast } from 'sonner'
import AdminIcon from '@/components/admin/AdminIcon'
import AiProviderLogo, { type AiProviderKey } from '@/components/admin/AiProviderLogo'
import { applyFontPreference, applyTextSizePreference, type AppFontKey, type AppTextSize } from '@/components/FontPreferenceSync'
import { AI_MODEL_OPTIONS, DEFAULT_AI_MODELS } from '@/lib/aiModels'
import { authenticatedFetch } from '@/lib/api'
import styles from '../adminPages.module.css'
import ui from './settings.module.css'

type SettingsTab = 'system' | 'appearance'
type AiProvider = AiProviderKey

const providers: Array<{ key: AiProvider; name: string; tone: string }> = [
  { key: 'gemini', name: 'Google Gemini', tone: 'blue' },
  { key: 'openai', name: 'OpenAI', tone: 'green' },
  { key: 'claude', name: 'Anthropic Claude', tone: 'purple' },
]

type ProviderSetting = {
  model: string
  keyConfigured: boolean
  keyHint: string | null
  source: 'database' | 'environment' | 'none'
}

type ProviderSettings = Record<AiProvider, ProviderSetting>

type PublicProviderSetting = ProviderSetting & {
  provider: AiProvider
  active: boolean
}

type AISettingsResponse = {
  error?: string
  settings?: PublicProviderSetting[]
}

type TripoSetting = {
  modelVersion: string
  keyConfigured: boolean
  keyHint: string | null
  source: 'database' | 'environment' | 'none'
  updatedAt?: string | null
}

type TripoSettingsResponse = {
  error?: string
  setting?: TripoSetting
  modelVersions?: string[]
}

type HealthStatus = {
  state: 'loading' | 'online' | 'offline'
  latencyMs: number | null
  region: string | null
}

const initialProviderSettings: ProviderSettings = {
  gemini: { model: DEFAULT_AI_MODELS.gemini, keyConfigured: false, keyHint: null, source: 'none' },
  openai: { model: DEFAULT_AI_MODELS.openai, keyConfigured: false, keyHint: null, source: 'none' },
  claude: { model: DEFAULT_AI_MODELS.claude, keyConfigured: false, keyHint: null, source: 'none' },
}

const emptyApiKeys: Record<AiProvider, string> = { gemini: '', openai: '', claude: '' }

const thaiFonts: Array<{ key: AppFontKey; name: string; description: string }> = [
  { key: 'kanit', name: 'Kanit', description: 'ทันสมัย กระชับ เหมาะกับหน้าจอและ Dashboard' },
  { key: 'sarabun', name: 'Sarabun', description: 'อ่านง่าย เป็นทางการ เหมาะกับบทเรียนและเอกสาร' },
  { key: 'prompt', name: 'Prompt', description: 'เป็นมิตร สมดุล เหมาะกับระบบการเรียนรู้' },
  { key: 'noto-sans-thai', name: 'Noto Sans Thai', description: 'เป็นกลาง รองรับภาษาไทยและอักขระได้ครอบคลุม' },
]

const themeOptions = [
  { key: 'forest-gold', name: 'Forest Gold', description: 'เขียวเข้มและทอง', colors: ['#173f30', '#c4a64d'] },
  { key: 'dark-night', name: 'Obsidian', description: 'เข้ม สงบ ลดแสงจ้า', colors: ['#17201c', '#63756c'] },
  { key: 'royal-blue', name: 'Royal Blue', description: 'น้ำเงินมืออาชีพ', colors: ['#254d78', '#75a1c9'] },
  { key: 'cherry-blossom', name: 'Blossom', description: 'ชมพูอ่อน เป็นมิตร', colors: ['#9b5f72', '#e8bdca'] },
]

const legacySecretKeys = [
  'geminiApiKey',
  'openaiApiKey',
  'claudeApiKey',
  'threeDAIStudioKey',
  'tripoApiKey',
  'supabaseUrl',
  'supabaseAnonKey',
]

function removeLegacyApiKeys() {
  legacySecretKeys.forEach(key => window.localStorage.removeItem(key))
}

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('system')
  const [activeProvider, setActiveProvider] = useState<AiProvider>('gemini')
  const [providerSettings, setProviderSettings] = useState<ProviderSettings>(initialProviderSettings)
  const [apiKeyInputs, setApiKeyInputs] = useState(emptyApiKeys)
  const [showApiKey, setShowApiKey] = useState(false)
  const [loadingAISettings, setLoadingAISettings] = useState(true)
  const [tripoSetting, setTripoSetting] = useState<TripoSetting>({ modelVersion: 'v2.5-20250123', keyConfigured: false, keyHint: null, source: 'none' })
  const [tripoModelVersions, setTripoModelVersions] = useState<string[]>(['v2.5-20250123'])
  const [tripoApiKey, setTripoApiKey] = useState('')
  const [showTripoKey, setShowTripoKey] = useState(false)
  const [loadingTripo, setLoadingTripo] = useState(true)
  const [savingSystem, setSavingSystem] = useState(false)
  const [schoolName, setSchoolName] = useState('วิทยาลัยอาชีวศึกษากรุงเทพ')
  const [maintenance, setMaintenance] = useState(false)
  const [themeMode, setThemeMode] = useState('forest-gold')
  const [fontFamily, setFontFamily] = useState<AppFontKey>('kanit')
  const [textSize, setTextSize] = useState<AppTextSize>('normal')
  const [transitionStyle, setTransitionStyle] = useState('smooth')
  const [layoutDensity, setLayoutDensity] = useState('comfortable')
  const [arQuality, setArQuality] = useState('hd')
  const [showArHelp, setShowArHelp] = useState('once')
  const [microInteractions, setMicroInteractions] = useState(true)
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false)
  const [passwordOpen, setPasswordOpen] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [showPasswords, setShowPasswords] = useState(false)
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' })
  const [health, setHealth] = useState<HealthStatus>({ state: 'loading', latencyMs: null, region: null })

  useEffect(() => {
    void Promise.resolve().then(() => {
      removeLegacyApiKeys()
      const storedProvider = window.localStorage.getItem('activeAiProvider')
      if (storedProvider === 'gemini' || storedProvider === 'openai' || storedProvider === 'claude') setActiveProvider(storedProvider)
      setThemeMode(window.localStorage.getItem('uxThemeMode') || 'forest-gold')
      const storedFont = window.localStorage.getItem('uxFontFamily')
      setFontFamily(thaiFonts.some(font => font.key === storedFont) ? storedFont as AppFontKey : 'kanit')
      const storedTextSize = window.localStorage.getItem('uxTextSize')
      setTextSize(['normal', 'large', 'xlarge'].includes(storedTextSize || '') ? storedTextSize as AppTextSize : 'normal')
      setTransitionStyle(window.localStorage.getItem('uxTransitionStyle') || 'smooth')
      setLayoutDensity(window.localStorage.getItem('uxLayoutDensity') || 'comfortable')
      setArQuality(window.localStorage.getItem('uxArQuality') || 'hd')
      setShowArHelp(window.localStorage.getItem('uxShowArHelp') || 'once')
      setMicroInteractions(window.localStorage.getItem('uxMicroInteractions') !== 'false')
    })

    void fetch('/api/admin/ai-settings', { headers: { Accept: 'application/json' } })
      .then(async response => {
        const payload = await response.json() as AISettingsResponse
        if (!response.ok) throw new Error(payload.error || 'โหลดการตั้งค่า AI ไม่สำเร็จ')
        const nextSettings = { ...initialProviderSettings }
        for (const setting of payload.settings || []) {
          if (setting.provider !== 'gemini' && setting.provider !== 'openai' && setting.provider !== 'claude') continue
          nextSettings[setting.provider] = {
            model: setting.model,
            keyConfigured: Boolean(setting.keyConfigured),
            keyHint: setting.keyHint || null,
            source: setting.source || 'none',
          }
          if (setting.active) setActiveProvider(setting.provider)
        }
        setProviderSettings(nextSettings)
      })
      .catch(error => toast.error('โหลดการตั้งค่า AI ไม่สำเร็จ', {
        description: error instanceof Error ? error.message : 'กรุณาลองใหม่อีกครั้ง',
      }))
      .finally(() => setLoadingAISettings(false))

    void authenticatedFetch('/api/admin/system-settings', { cache: 'no-store' })
      .then(async response => {
        const payload = await response.json() as { settings?: { schoolName?: string; maintenance?: boolean }; error?: string }
        if (!response.ok) throw new Error(payload.error || 'โหลดการตั้งค่าระบบไม่สำเร็จ')
        setSchoolName(payload.settings?.schoolName || 'วิทยาลัยอาชีวศึกษากรุงเทพ')
        setMaintenance(payload.settings?.maintenance === true)
      })
      .catch(error => toast.error('โหลดการตั้งค่าระบบไม่สำเร็จ', {
        description: error instanceof Error ? error.message : 'กรุณาลองใหม่อีกครั้ง',
      }))

    void authenticatedFetch('/api/admin/tripo-settings', { cache: 'no-store' })
      .then(async response => {
        const payload = await response.json() as TripoSettingsResponse
        if (!response.ok || !payload.setting) throw new Error(payload.error || 'โหลดการตั้งค่า Tripo ไม่สำเร็จ')
        setTripoSetting(payload.setting)
        if (payload.modelVersions?.length) setTripoModelVersions(payload.modelVersions)
      })
      .catch(error => toast.error('โหลดการตั้งค่า Tripo ไม่สำเร็จ', {
        description: error instanceof Error ? error.message : 'กรุณารัน migration ล่าสุด',
      }))
      .finally(() => setLoadingTripo(false))

    void fetch('/api/health', { cache: 'no-store' })
      .then(async response => {
        const payload = await response.json() as { database?: string; latencyMs?: number; region?: string }
        if (!response.ok || payload.database !== 'online') throw new Error('Database offline')
        setHealth({
          state: 'online',
          latencyMs: typeof payload.latencyMs === 'number' ? payload.latencyMs : null,
          region: typeof payload.region === 'string' ? payload.region : null,
        })
      })
      .catch(() => setHealth({ state: 'offline', latencyMs: null, region: null }))
  }, [])

  async function handleSaveSystem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSavingSystem(true)
    const toastId = toast.loading('กำลังบันทึกการตั้งค่าระบบ...')
    try {
      const [response, systemResponse, tripoResponse] = await Promise.all([
        authenticatedFetch('/api/admin/ai-settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            provider: activeProvider,
            model: providerSettings[activeProvider].model,
            apiKey: apiKeyInputs[activeProvider].trim() || undefined,
            active: true,
          }),
        }),
        authenticatedFetch('/api/admin/system-settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ schoolName: schoolName.trim(), maintenance }),
        }),
        authenticatedFetch('/api/admin/tripo-settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            modelVersion: tripoSetting.modelVersion,
            apiKey: tripoApiKey.trim() || undefined,
          }),
        }),
      ])
      const [payload, systemPayload, tripoPayload] = await Promise.all([
        response.json() as Promise<AISettingsResponse>,
        systemResponse.json() as Promise<{ error?: string }>,
        tripoResponse.json() as Promise<TripoSettingsResponse>,
      ])
      if (!response.ok) throw new Error(payload.error || 'บันทึกการตั้งค่า AI ไม่สำเร็จ')
      if (!systemResponse.ok) throw new Error(systemPayload.error || 'บันทึกการตั้งค่าระบบไม่สำเร็จ')
      if (!tripoResponse.ok || !tripoPayload.setting) throw new Error(tripoPayload.error || 'บันทึกการตั้งค่า Tripo ไม่สำเร็จ')

      const nextSettings = { ...providerSettings }
      for (const setting of payload.settings || []) {
        if (setting.provider !== 'gemini' && setting.provider !== 'openai' && setting.provider !== 'claude') continue
        nextSettings[setting.provider] = {
          model: setting.model,
          keyConfigured: Boolean(setting.keyConfigured),
          keyHint: setting.keyHint || null,
          source: setting.source || 'none',
        }
      }
      setProviderSettings(nextSettings)
      setApiKeyInputs(current => ({ ...current, [activeProvider]: '' }))
      setTripoSetting(tripoPayload.setting)
      setTripoApiKey('')
      removeLegacyApiKeys()
      window.localStorage.setItem('activeAiProvider', activeProvider)
      toast.success('บันทึกการตั้งค่าระบบแล้ว', {
        id: toastId,
        description: `${selectedProvider.name} · ${nextSettings[activeProvider].model}`,
      })
    } catch (error) {
      toast.error('บันทึกการตั้งค่าไม่สำเร็จ', {
        id: toastId,
        description: error instanceof Error ? error.message : 'กรุณาตรวจสอบข้อมูลแล้วลองใหม่',
      })
    } finally {
      setSavingSystem(false)
    }
  }

  function handleSaveAppearance(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    window.localStorage.setItem('uxThemeMode', themeMode)
    window.localStorage.setItem('uxFontFamily', fontFamily)
    window.localStorage.setItem('uxTextSize', textSize)
    window.localStorage.setItem('uxTransitionStyle', transitionStyle)
    window.localStorage.setItem('uxLayoutDensity', layoutDensity)
    window.localStorage.setItem('uxArQuality', arQuality)
    window.localStorage.setItem('uxShowArHelp', showArHelp)
    window.localStorage.setItem('uxMicroInteractions', String(microInteractions))

    document.body.className = document.body.className
      .split(' ')
      .filter(className => !className.startsWith('theme-') && !className.startsWith('density-'))
      .join(' ')
    document.body.classList.add(`theme-${themeMode}`, `density-${layoutDensity}`)
    applyTextSizePreference(textSize)
    applyFontPreference(fontFamily)
    toast.success('บันทึกการตั้งค่าหน้าจอแล้ว', {
      description: 'ฟอนต์ ขนาดตัวอักษร และรูปแบบการแสดงผลถูกนำไปใช้แล้ว',
    })
  }

  function clearTemporaryData() {
    const protectedKeys = new Set([
      'schoolName',
      'activeAiProvider',
      'maintenanceMode',
      'uxThemeMode',
      'uxFontFamily',
      'uxTextSize',
      'uxTransitionStyle',
      'uxLayoutDensity',
      'uxArQuality',
      'uxShowArHelp',
      'uxMicroInteractions',
      'systemNews',
    ])
    const keysToDelete: string[] = []
    for (let index = 0; index < window.localStorage.length; index += 1) {
      const key = window.localStorage.key(index)
      if (key && !protectedKeys.has(key)) keysToDelete.push(key)
    }
    keysToDelete.forEach(key => window.localStorage.removeItem(key))
    window.sessionStorage.clear()
    removeLegacyApiKeys()
    setClearConfirmOpen(false)
    toast.success('ล้างข้อมูลชั่วคราวแล้ว', {
      description: `${keysToDelete.length.toLocaleString('th-TH')} รายการถูกนำออกจากอุปกรณ์นี้`,
    })
  }

  async function changeAdminPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!passwords.current) return toast.warning('กรุณาระบุรหัสผ่านปัจจุบัน')
    if (passwords.next.length < 10 || !/[A-Z]/.test(passwords.next) || !/[a-z]/.test(passwords.next) || !/\d/.test(passwords.next)) {
      return toast.warning('รหัสผ่านใหม่ต้องมีอย่างน้อย 10 ตัวอักษร พร้อมตัวพิมพ์ใหญ่ ตัวพิมพ์เล็ก และตัวเลข')
    }
    if (passwords.next !== passwords.confirm) return toast.warning('การยืนยันรหัสผ่านใหม่ไม่ตรงกัน')
    setSavingPassword(true)
    try {
      const response = await authenticatedFetch('/api/admin/account', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: passwords.current, newPassword: passwords.next }),
      })
      const payload = await response.json() as { error?: string }
      if (!response.ok) throw new Error(payload.error || 'เปลี่ยนรหัสผ่านไม่สำเร็จ')
      setPasswords({ current: '', next: '', confirm: '' })
      setShowPasswords(false)
      setPasswordOpen(false)
      toast.success('เปลี่ยนรหัสผ่านแล้ว กรุณาเข้าสู่ระบบใหม่')
      window.setTimeout(() => window.location.assign(new URL('/role-select', window.location.origin).toString()), 600)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'เปลี่ยนรหัสผ่านไม่สำเร็จ')
    } finally {
      setSavingPassword(false)
    }
  }

  const selectedProvider = providers.find(provider => provider.key === activeProvider) ?? providers[0]
  const selectedSetting = providerSettings[activeProvider]
  const selectedModel = AI_MODEL_OPTIONS[activeProvider].find(model => model.id === selectedSetting.model) ?? AI_MODEL_OPTIONS[activeProvider][0]
  const configuredProviders = providers.filter(provider => providerSettings[provider.key].keyConfigured).length
  const systemLoading = loadingAISettings || loadingTripo
  const passwordStrength = [
    { label: '10 ตัวอักษร', valid: passwords.next.length >= 10 },
    { label: 'A–Z และ a–z', valid: /[A-Z]/.test(passwords.next) && /[a-z]/.test(passwords.next) },
    { label: 'มีตัวเลข', valid: /\d/.test(passwords.next) },
  ]

  return (
    <main className={`${styles.adminPage} ${ui.settingsPage}`}>
      <header className={`${styles.pageHeader} ${ui.hero}`}>
        <div className={ui.heroCopy}>
          <p><AdminIcon name="settings" size={13} /> CONTROL CENTER</p>
          <h1>ตั้งค่าระบบ</h1>
          <span>จัดการ AI โมเดล 3 มิติ ความปลอดภัย และรูปแบบการแสดงผลจากจุดเดียว</span>
        </div>
        <div className={ui.heroAside}>
          <span className={ui.liveStatus} data-state={health.state}>
            <i />
            <span><small>สถานะ Production</small><strong>{health.state === 'loading' ? 'กำลังตรวจสอบ' : health.state === 'online' ? 'ทำงานปกติ' : 'ต้องตรวจสอบ'}</strong></span>
          </span>
          <span className={ui.regionStatus}>
            <AdminIcon name="database" size={16} />
            <span><small>Database region</small><strong>{health.region?.toUpperCase() || '—'}{health.latencyMs !== null ? ` · ${health.latencyMs} ms` : ''}</strong></span>
          </span>
        </div>
      </header>

      <section className={`${styles.settingsStatus} ${ui.overview}`} aria-label="สถานะการตั้งค่า">
        <article className={styles.statusCard} data-tone="blue">
          <span className={styles.providerStatusLogo} data-provider={activeProvider}><AiProviderLogo provider={activeProvider} size={22} /></span>
          <div><small>AI ที่กำลังใช้งาน</small><strong>{selectedProvider.name}</strong><p>{configuredProviders}/{providers.length} ผู้ให้บริการพร้อมใช้</p></div>
        </article>
        <article className={styles.statusCard} data-tone="green">
          <span><AdminIcon name="database" size={19} /></span>
          <div><small>ฐานข้อมูลหลัก</small><strong>Railway PostgreSQL</strong><p>{health.state === 'online' ? `Online${health.latencyMs !== null ? ` · ${health.latencyMs} ms` : ''}` : health.state === 'loading' ? 'กำลังตรวจสอบการเชื่อมต่อ' : 'ไม่สามารถเชื่อมต่อได้'}</p></div>
        </article>
        <article className={styles.statusCard} data-tone="purple">
          <span><AdminIcon name="cube" size={19} /></span>
          <div><small>3D Provider</small><strong>Tripo AI</strong><p>{tripoSetting.keyConfigured ? tripoSetting.modelVersion : 'ยังไม่ได้ตั้งค่า API Key'}</p></div>
        </article>
        <article className={styles.statusCard} data-tone={maintenance ? 'red' : 'gold'}>
          <span><AdminIcon name={maintenance ? 'pause' : 'check'} size={19} /></span>
          <div><small>สถานะระบบ</small><strong>{maintenance ? 'Maintenance' : 'พร้อมใช้งาน'}</strong><p>{maintenance ? 'จำกัดการเข้าใช้งาน' : 'ให้บริการตามปกติ'}</p></div>
        </article>
      </section>

      <section className={`${styles.settingsWorkspace} ${ui.workspace}`}>
        <div className={`${styles.settingsTabs} ${ui.tabs}`} role="tablist" aria-label="หมวดการตั้งค่า">
          <div className={ui.tabsIntro}><small>หมวดการตั้งค่า</small><strong>เลือกส่วนที่ต้องการจัดการ</strong></div>
          <button id="system-settings-tab" type="button" role="tab" aria-controls="system-settings-panel" aria-selected={activeTab === 'system'} onClick={() => setActiveTab('system')}><span className={ui.tabIcon}><AdminIcon name="shield" size={18} /></span><span><strong>ระบบและความปลอดภัย</strong><small>AI, 3D, ฐานข้อมูล และบัญชี</small></span><AdminIcon name="chevron" size={15} /></button>
          <button id="appearance-settings-tab" type="button" role="tab" aria-controls="appearance-settings-panel" aria-selected={activeTab === 'appearance'} onClick={() => setActiveTab('appearance')}><span className={ui.tabIcon}><AdminIcon name="palette" size={18} /></span><span><strong>หน้าจอและประสิทธิภาพ</strong><small>ธีม ฟอนต์ การเคลื่อนไหว และ AR</small></span><AdminIcon name="chevron" size={15} /></button>
          <div className={ui.securityNote}><AdminIcon name="shield" size={16} /><span><strong>ข้อมูลสำคัญได้รับการปกป้อง</strong><small>API Key ถูกเข้ารหัสก่อนจัดเก็บ</small></span></div>
        </div>

        {activeTab === 'system' ? (
          <form id="system-settings-panel" role="tabpanel" aria-labelledby="system-settings-tab" className={`${styles.settingsForm} ${ui.form}`} onSubmit={handleSaveSystem}>
            <section className={styles.settingsSection} data-tone="blue">
              <header className={styles.sectionHeader}>
                <span><AdminIcon name="sparkles" size={18} /></span>
                <div><h2>ผู้ให้บริการ AI</h2><p>เลือกบริการหลักสำหรับสร้างเนื้อหาและสนทนา</p></div>
              </header>
              <div className={styles.sectionBody}>
                <div className={`${styles.providerGrid} ${ui.providerGrid}`}>
                  {providers.map(provider => (
                    <button key={provider.key} type="button" data-tone={provider.tone} aria-pressed={activeProvider === provider.key} onClick={() => { setActiveProvider(provider.key); setShowApiKey(false) }}>
                      <span className={styles.providerLogo} data-provider={provider.key}><AiProviderLogo provider={provider.key} size={21} /></span>
                      <div><strong>{provider.name}</strong><small>{AI_MODEL_OPTIONS[provider.key].find(model => model.id === providerSettings[provider.key].model)?.name || providerSettings[provider.key].model}</small></div>
                      <i>{activeProvider === provider.key && <AdminIcon name="check" size={13} />}</i>
                    </button>
                  ))}
                </div>
                <div className={`${styles.aiConfigPanel} ${ui.configPanel}`} data-provider={activeProvider}>
                  <div className={styles.aiConfigHeader}>
                    <span className={styles.providerLogo} data-provider={activeProvider}><AiProviderLogo provider={activeProvider} size={23} /></span>
                    <div><strong>ตั้งค่า {selectedProvider.name}</strong><p>{selectedModel.description}</p></div>
                    <span className={styles.keyStatus} data-configured={selectedSetting.keyConfigured}>
                      <AdminIcon name={selectedSetting.keyConfigured ? 'check' : 'key'} size={13} />
                      {loadingAISettings ? 'กำลังตรวจสอบ' : selectedSetting.keyConfigured ? `ตั้งค่าแล้ว ${selectedSetting.keyHint || ''}` : 'ยังไม่มี API Key'}
                    </span>
                  </div>
                  <div className={styles.aiConfigGrid}>
                    <label className={styles.field}>
                      <span>โมเดลที่ใช้ทั้งระบบ</span>
                      <select
                        value={selectedSetting.model}
                        disabled={loadingAISettings || savingSystem}
                        onChange={event => setProviderSettings(current => ({
                          ...current,
                          [activeProvider]: { ...current[activeProvider], model: event.target.value },
                        }))}
                      >
                        {AI_MODEL_OPTIONS[activeProvider].map(model => <option key={model.id} value={model.id}>{model.name} — {model.id}</option>)}
                      </select>
                      <small>{selectedModel.description}</small>
                    </label>
                    <label className={styles.field}>
                      <span>API Key {selectedSetting.keyConfigured && <em>เว้นว่างเพื่อใช้คีย์เดิม</em>}</span>
                      <div className={styles.secretInput}>
                        <AdminIcon name="key" size={16} />
                        <input
                          type={showApiKey ? 'text' : 'password'}
                          value={apiKeyInputs[activeProvider]}
                          disabled={loadingAISettings || savingSystem}
                          autoComplete="new-password"
                          spellCheck={false}
                          placeholder={selectedSetting.keyConfigured ? `คีย์ปัจจุบัน ${selectedSetting.keyHint || ''}` : `วาง ${selectedProvider.name} API Key`}
                          onChange={event => setApiKeyInputs(current => ({ ...current, [activeProvider]: event.target.value }))}
                        />
                        <button type="button" onClick={() => setShowApiKey(current => !current)} aria-label={showApiKey ? 'ซ่อน API Key' : 'แสดง API Key'}>{showApiKey ? 'ซ่อน' : 'แสดง'}</button>
                      </div>
                      <small>คีย์ใหม่จะถูกเข้ารหัสก่อนบันทึก และระบบจะไม่ส่งคีย์เต็มกลับมาที่หน้านี้</small>
                    </label>
                  </div>
                </div>
                <div className={`${styles.infoBanner} ${ui.infoBanner}`}><AdminIcon name="shield" size={17} /><div><strong>Secret อยู่ฝั่ง Server เท่านั้น</strong><p>คีย์ถูกส่งผ่าน API สำหรับผู้ดูแลและเข้ารหัสก่อนจัดเก็บ ระบบจะไม่ส่งค่าจริงกลับมาที่เบราว์เซอร์</p></div></div>
              </div>
            </section>

            <section className={styles.settingsSection} data-tone="purple">
              <header className={styles.sectionHeader}>
                <span><AdminIcon name="cube" size={18} /></span>
                <div><h2>Tripo AI สำหรับสร้างโมเดล 3D</h2><p>กำหนด API Key และเวอร์ชันโมเดลสำหรับ Text-to-3D ทั้งระบบ</p></div>
              </header>
              <div className={styles.sectionBody}>
                <div className={`${styles.aiConfigPanel} ${ui.configPanel}`}>
                  <div className={styles.aiConfigHeader}>
                    <span className={styles.providerLogo}><AdminIcon name="cube" size={22} /></span>
                    <div><strong>Tripo 3D Generation</strong><p>ระบบจะ polling งานและบันทึก GLB ลง PostgreSQL อัตโนมัติ</p></div>
                    <span className={styles.keyStatus} data-configured={tripoSetting.keyConfigured}><AdminIcon name={tripoSetting.keyConfigured ? 'check' : 'key'} size={13} />{loadingTripo ? 'กำลังตรวจสอบ' : tripoSetting.keyConfigured ? `ตั้งค่าแล้ว ${tripoSetting.keyHint || ''}` : 'ยังไม่มี API Key'}</span>
                  </div>
                  <div className={styles.aiConfigGrid}>
                    <label className={styles.field}><span>Model version</span><select value={tripoSetting.modelVersion} disabled={loadingTripo || savingSystem} onChange={event => setTripoSetting(current => ({ ...current, modelVersion: event.target.value }))}>{tripoModelVersions.map(version => <option key={version} value={version}>{version}</option>)}</select><small>เวอร์ชันเริ่มต้นที่แนะนำคือ v2.5 และสามารถเลือก P1/Turbo/v3.1 ได้</small></label>
                    <label className={styles.field}><span>Tripo API Key {tripoSetting.keyConfigured && <em>เว้นว่างเพื่อใช้คีย์เดิม</em>}</span><div className={styles.secretInput}><AdminIcon name="key" size={16} /><input type={showTripoKey ? 'text' : 'password'} value={tripoApiKey} disabled={loadingTripo || savingSystem} autoComplete="new-password" spellCheck={false} placeholder={tripoSetting.keyConfigured ? `คีย์ปัจจุบัน ${tripoSetting.keyHint || ''}` : 'tsk_...'} onChange={event => setTripoApiKey(event.target.value)} /><button type="button" onClick={() => setShowTripoKey(current => !current)}>{showTripoKey ? 'ซ่อน' : 'แสดง'}</button></div><small>คีย์ถูกเข้ารหัส AES-256-GCM ก่อนบันทึก และไม่ส่งค่าจริงกลับมาที่หน้าเว็บ</small></label>
                  </div>
                </div>
              </div>
            </section>

            <div className={`${styles.settingsTwoColumns} ${ui.twoColumns}`}>
              <section className={styles.settingsSection} data-tone="green">
                <header className={styles.sectionHeader}><span><AdminIcon name="database" size={18} /></span><div><h2>ฐานข้อมูล Production</h2><p>การเชื่อมต่อฝั่ง Server ที่กำลังใช้งาน</p></div></header>
                <div className={styles.sectionBody}>
                  <div className={styles.readonlyField}><span>Provider</span><strong>Railway PostgreSQL</strong></div>
                  <div className={styles.readonlyField}><span>Region</span><strong>{health.region?.toUpperCase() || 'กำลังตรวจสอบ'}</strong></div>
                  <div className={styles.readonlyField}><span>Connection</span><strong>{health.state === 'online' ? `Online${health.latencyMs !== null ? ` · ${health.latencyMs} ms` : ''}` : health.state === 'loading' ? 'Checking' : 'Offline'}</strong></div>
                  <div className={styles.readonlyField}><span>Access policy</span><strong>Server-side only</strong></div>
                </div>
              </section>

              <section className={styles.settingsSection} data-tone="purple">
                <header className={styles.sectionHeader}><span><AdminIcon name="school" size={18} /></span><div><h2>ข้อมูลองค์กร</h2><p>ชื่อสถานศึกษาหลักที่แสดงในระบบ</p></div></header>
                <div className={styles.sectionBody}><label className={styles.field}><span>ชื่อสถานศึกษา</span><input required value={schoolName} onChange={event => setSchoolName(event.target.value)} /></label></div>
              </section>
            </div>

            <section className={styles.settingsSection} data-tone={maintenance ? 'red' : 'gold'}>
              <header className={styles.sectionHeader}><span><AdminIcon name="shield" size={18} /></span><div><h2>การบำรุงรักษาระบบ</h2><p>ควบคุมการเข้าใช้งานของครูและนักเรียนชั่วคราว</p></div></header>
              <div className={styles.toggleRow}>
                <div><strong>Maintenance Mode</strong><p>{maintenance ? 'ระบบอยู่ในโหมดบำรุงรักษา ผู้ใช้ทั่วไปอาจถูกจำกัดการเข้าใช้งาน' : 'ระบบเปิดให้ผู้ใช้ทุกบทบาทเข้าใช้งานตามปกติ'}</p></div>
                <button className={styles.switch} type="button" role="switch" aria-checked={maintenance} aria-label="เปิดหรือปิด Maintenance Mode" onClick={() => setMaintenance(current => !current)}><span /></button>
              </div>
            </section>

            <section className={styles.settingsSection} data-tone="purple">
              <header className={styles.sectionHeader}><span><AdminIcon name="key" size={18} /></span><div><h2>รหัสผ่านผู้ดูแลระบบ</h2><p>ควรเปลี่ยนรหัสผ่านเริ่มต้นก่อนเปิดให้ผู้ใช้งานจริง</p></div></header>
              <div className={styles.cacheRow}><div><strong>เปลี่ยนรหัสผ่านบัญชีปัจจุบัน</strong><p>กำหนดอย่างน้อย 10 ตัวอักษร พร้อมตัวพิมพ์ใหญ่ ตัวพิมพ์เล็ก และตัวเลข</p></div><button className={styles.secondaryButton} type="button" onClick={() => setPasswordOpen(true)}><AdminIcon name="key" size={15} />เปลี่ยนรหัสผ่าน</button></div>
            </section>

            <div className={`${styles.settingsFooter} ${ui.saveBar}`}><div><AdminIcon name="shield" size={16} /><span><strong>การตั้งค่าระบบ</strong><small>{systemLoading ? 'กำลังโหลดข้อมูลล่าสุด' : 'พร้อมบันทึกการเปลี่ยนแปลงลง Production'}</small></span></div><button className={`${styles.primaryButton} ${ui.saveButton}`} type="submit" disabled={systemLoading || savingSystem}><AdminIcon name={savingSystem ? 'refresh' : 'check'} size={16} />{savingSystem ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่าระบบ'}</button></div>
          </form>
        ) : (
          <form id="appearance-settings-panel" role="tabpanel" aria-labelledby="appearance-settings-tab" className={`${styles.settingsForm} ${ui.form}`} onSubmit={handleSaveAppearance}>
            <section className={styles.settingsSection} data-tone="purple">
              <header className={styles.sectionHeader}><span><AdminIcon name="palette" size={18} /></span><div><h2>ธีมและตัวอักษร</h2><p>กำหนดภาพลักษณ์และความสบายในการอ่าน</p></div></header>
              <div className={styles.sectionBody}>
                <fieldset className={ui.themeFieldset}>
                  <legend>โทนสีระบบ</legend>
                  <div className={ui.themeGrid}>
                    {themeOptions.map(theme => (
                      <button
                        key={theme.key}
                        type="button"
                        aria-pressed={themeMode === theme.key}
                        onClick={() => setThemeMode(theme.key)}
                      >
                        <span className={ui.themeSwatch} aria-hidden="true">
                          {theme.colors.map(color => <i key={color} style={{ background: color }} />)}
                        </span>
                        <span><strong>{theme.name}</strong><small>{theme.description}</small></span>
                        <i className={ui.choiceMark}>{themeMode === theme.key && <AdminIcon name="check" size={13} />}</i>
                      </button>
                    ))}
                  </div>
                </fieldset>
                <div className={`${styles.formGrid} ${ui.preferenceGrid}`}>
                  <label className={styles.field}><span>ขนาดตัวอักษร</span><select value={textSize} onChange={event => { const size = event.target.value as AppTextSize; setTextSize(size); applyTextSizePreference(size) }}><option value="normal">มาตรฐาน 100%</option><option value="large">ขนาดใหญ่ 115%</option><option value="xlarge">ขนาดใหญ่พิเศษ 130%</option></select></label>
                  <label className={styles.field}><span>ความหนาแน่นของหน้า</span><select value={layoutDensity} onChange={event => setLayoutDensity(event.target.value)}><option value="comfortable">Comfortable</option><option value="compact">Compact</option></select></label>
                </div>
                <fieldset className={styles.fontFieldset}>
                  <legend>Google Fonts ภาษาไทย</legend>
                  <div className={styles.fontOptions}>
                    {thaiFonts.map(font => (
                      <button key={font.key} type="button" data-font={font.key} aria-pressed={fontFamily === font.key} onClick={() => { setFontFamily(font.key); applyFontPreference(font.key) }}>
                        <span>กข</span>
                        <div><strong>{font.name}</strong><p>{font.description}</p><small>ครูพิมพ์ · การเรียนรู้ด้วย AR และ AI</small></div>
                        <i>{fontFamily === font.key && <AdminIcon name="check" size={13} />}</i>
                      </button>
                    ))}
                  </div>
                </fieldset>
                <div className={ui.appearancePreview} data-theme={themeMode} data-font={fontFamily} data-size={textSize}>
                  <div><small>ตัวอย่างการแสดงผล</small><strong>ห้องเรียน AR ที่พร้อมใช้งาน</strong><p>ตรวจสอบความสบายในการอ่านก่อนบันทึกการตั้งค่า</p></div>
                  <span className={ui.previewButton}><AdminIcon name="arrow" size={15} />เริ่มบทเรียน</span>
                </div>
              </div>
            </section>

            <div className={`${styles.settingsTwoColumns} ${ui.twoColumns}`}>
              <section className={styles.settingsSection} data-tone="blue">
                <header className={styles.sectionHeader}><span><AdminIcon name="monitor" size={18} /></span><div><h2>การเคลื่อนไหว</h2><p>ปรับประสิทธิภาพให้เหมาะกับอุปกรณ์</p></div></header>
                <div className={styles.sectionBody}>
                  <label className={styles.field}><span>เอฟเฟกต์เปลี่ยนหน้า</span><select value={transitionStyle} onChange={event => setTransitionStyle(event.target.value)}><option value="smooth">Smooth 60 FPS</option><option value="fade">Fade only</option><option value="none">ไม่ใช้ Animation</option></select></label>
                  <div className={styles.toggleRow}><div><strong>Micro-interactions</strong><p>แสดง feedback ขนาดเล็กเมื่อกดปุ่มหรือเปลี่ยนสถานะ</p></div><button className={styles.switch} type="button" role="switch" aria-checked={microInteractions} aria-label="เปิดหรือปิด Micro-interactions" onClick={() => setMicroInteractions(current => !current)}><span /></button></div>
                </div>
              </section>

              <section className={styles.settingsSection} data-tone="green">
                <header className={styles.sectionHeader}><span><AdminIcon name="cube" size={18} /></span><div><h2>AR และโมเดล 3 มิติ</h2><p>สมดุลคุณภาพภาพและความเร็วโหลด</p></div></header>
                <div className={styles.sectionBody}>
                  <label className={styles.field}><span>คุณภาพโมเดล</span><select value={arQuality} onChange={event => setArQuality(event.target.value)}><option value="hd">High Definition</option><option value="sd">Standard Definition</option></select></label>
                  <label className={styles.field}><span>แสดงคู่มือ AR</span><select value={showArHelp} onChange={event => setShowArHelp(event.target.value)}><option value="always">ทุกครั้ง</option><option value="once">เฉพาะครั้งแรก</option><option value="never">ไม่แสดง</option></select></label>
                </div>
              </section>
            </div>

            <section className={styles.settingsSection} data-tone="red">
              <header className={styles.sectionHeader}><span><AdminIcon name="archive" size={18} /></span><div><h2>ข้อมูลชั่วคราวของเบราว์เซอร์</h2><p>ล้าง session และ cache ที่ไม่ใช่ข้อมูลบัญชีหรือการตั้งค่าหลัก</p></div></header>
              <div className={styles.cacheRow}><div><strong>ล้างข้อมูลชั่วคราว</strong><p>ช่วยแก้ปัญหาข้อมูลค้างและคืนพื้นที่จัดเก็บ โดยเก็บประกาศและค่าระบบไว้</p></div><button className={styles.dangerOutlineButton} type="button" onClick={() => setClearConfirmOpen(true)}><AdminIcon name="trash" size={15} />ล้างข้อมูล</button></div>
            </section>

            <div className={`${styles.settingsFooter} ${ui.saveBar}`}><div><AdminIcon name="palette" size={16} /><span><strong>ตัวอย่างถูกนำไปใช้ทันที</strong><small>กดบันทึกเพื่อจดจำค่าบนอุปกรณ์นี้</small></span></div><button className={`${styles.primaryButton} ${ui.saveButton}`} type="submit"><AdminIcon name="check" size={16} />บันทึกและนำไปใช้</button></div>
          </form>
        )}
      </section>

      {clearConfirmOpen && (
        <div className={`${styles.modalOverlay} ${ui.modalOverlay}`} onMouseDown={event => {
          if (event.target === event.currentTarget) setClearConfirmOpen(false)
        }}>
          <section className={`${styles.modal} ${styles.confirmModal} ${ui.confirmDialog}`} role="alertdialog" aria-modal="true" aria-labelledby="clear-cache-title">
            <div className={styles.confirmIcon}><AdminIcon name="archive" size={22} /></div>
            <h2 id="clear-cache-title">ล้างข้อมูลชั่วคราวหรือไม่</h2>
            <p>Session และข้อมูล cache ที่ไม่จำเป็นจะถูกลบ แต่ประกาศและการตั้งค่าหลักจะยังคงอยู่</p>
            <div className={styles.modalActions}><button type="button" onClick={() => setClearConfirmOpen(false)}>ยกเลิก</button><button className={styles.dangerButton} type="button" onClick={clearTemporaryData}>ล้างข้อมูล</button></div>
          </section>
        </div>
      )}
      {passwordOpen && (
        <div className={`${styles.modalOverlay} ${ui.modalOverlay}`} onMouseDown={event => {
          if (event.target === event.currentTarget && !savingPassword) {
            setShowPasswords(false)
            setPasswordOpen(false)
          }
        }}>
          <section className={`${styles.modal} ${ui.passwordDialog}`} role="dialog" aria-modal="true" aria-labelledby="admin-password-title">
            <header className={`${styles.modalHeader} ${ui.dialogHeader}`}>
              <span><AdminIcon name="key" size={20} /></span>
              <div><h2 id="admin-password-title">เปลี่ยนรหัสผ่านผู้ดูแล</h2><p>ตั้งรหัสผ่านที่ปลอดภัย ระบบจะออกจากระบบทุกอุปกรณ์หลังบันทึก</p></div>
              <button type="button" aria-label="ปิดหน้าต่าง" onClick={() => { setShowPasswords(false); setPasswordOpen(false) }} disabled={savingPassword}><AdminIcon name="close" size={18} /></button>
            </header>
            <form className={ui.dialogForm} onSubmit={changeAdminPassword}>
              <label className={styles.field}>
                <span>รหัสผ่านปัจจุบัน</span>
                <div className={ui.passwordInput}>
                  <input autoFocus required type={showPasswords ? 'text' : 'password'} autoComplete="current-password" value={passwords.current} onChange={event => setPasswords(current => ({ ...current, current: event.target.value }))} />
                  <button type="button" aria-label={showPasswords ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'} onClick={() => setShowPasswords(current => !current)}><AdminIcon name={showPasswords ? 'eyeOff' : 'eye'} size={17} /></button>
                </div>
              </label>
              <div className={ui.passwordColumns}>
                <label className={styles.field}>
                  <span>รหัสผ่านใหม่</span>
                  <div className={ui.passwordInput}><input required minLength={10} type={showPasswords ? 'text' : 'password'} autoComplete="new-password" value={passwords.next} onChange={event => setPasswords(current => ({ ...current, next: event.target.value }))} /></div>
                </label>
                <label className={styles.field}>
                  <span>ยืนยันรหัสผ่านใหม่</span>
                  <div className={ui.passwordInput}><input required minLength={10} type={showPasswords ? 'text' : 'password'} autoComplete="new-password" value={passwords.confirm} onChange={event => setPasswords(current => ({ ...current, confirm: event.target.value }))} /></div>
                </label>
              </div>
              <div className={ui.passwordChecks} aria-label="เงื่อนไขรหัสผ่าน">
                {passwordStrength.map(item => <span key={item.label} data-valid={item.valid}><AdminIcon name={item.valid ? 'check' : 'clock'} size={12} />{item.label}</span>)}
                <span data-valid={passwords.confirm.length > 0 && passwords.next === passwords.confirm}><AdminIcon name={passwords.confirm.length > 0 && passwords.next === passwords.confirm ? 'check' : 'clock'} size={12} />รหัสผ่านตรงกัน</span>
              </div>
              <div className={`${styles.modalActions} ${ui.dialogActions}`}><button type="button" onClick={() => { setShowPasswords(false); setPasswordOpen(false) }} disabled={savingPassword}>ยกเลิก</button><button className={styles.primaryButton} type="submit" disabled={savingPassword}><AdminIcon name={savingPassword ? 'clock' : 'check'} size={15} />{savingPassword ? 'กำลังบันทึก' : 'ยืนยันเปลี่ยนรหัสผ่าน'}</button></div>
            </form>
          </section>
        </div>
      )}
    </main>
  )
}
