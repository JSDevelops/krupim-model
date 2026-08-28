'use client'

import { FormEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import AdminIcon from '@/components/admin/AdminIcon'
import AiProviderLogo, { type AiProviderKey } from '@/components/admin/AiProviderLogo'
import { applyFontPreference, applyTextSizePreference, type AppFontKey, type AppTextSize } from '@/components/FontPreferenceSync'
import { AI_MODEL_OPTIONS, DEFAULT_AI_MODELS } from '@/lib/aiModels'
import { authenticatedFetch } from '@/lib/api'
import styles from '../adminPages.module.css'

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
  const router = useRouter()
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
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' })

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
  }, [])

  async function handleSaveSystem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSavingSystem(true)
    const toastId = toast.loading('กำลังบันทึกการตั้งค่า AI...')
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
      setPasswordOpen(false)
      toast.success('เปลี่ยนรหัสผ่านแล้ว กรุณาเข้าสู่ระบบใหม่')
      window.setTimeout(() => router.replace('/role-select'), 600)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'เปลี่ยนรหัสผ่านไม่สำเร็จ')
    } finally {
      setSavingPassword(false)
    }
  }

  const selectedProvider = providers.find(provider => provider.key === activeProvider) ?? providers[0]
  const selectedSetting = providerSettings[activeProvider]
  const selectedModel = AI_MODEL_OPTIONS[activeProvider].find(model => model.id === selectedSetting.model) ?? AI_MODEL_OPTIONS[activeProvider][0]

  return (
    <main className={styles.adminPage}>
      <header className={styles.pageHeader}>
        <div>
          <p>ADMIN SETTINGS</p>
          <h1>ตั้งค่าระบบ</h1>
          <span>ควบคุมบริการหลัก ความปลอดภัย และประสบการณ์ใช้งานของแพลตฟอร์ม</span>
        </div>
      </header>

      <section className={styles.settingsStatus} aria-label="สถานะการตั้งค่า">
        <article className={styles.statusCard} data-tone="blue">
          <span className={styles.providerStatusLogo} data-provider={activeProvider}><AiProviderLogo provider={activeProvider} size={22} /></span>
          <div><small>AI Provider</small><strong>{selectedProvider.name}</strong><p>{selectedModel.name}</p></div>
        </article>
        <article className={styles.statusCard} data-tone="green">
          <span><AdminIcon name="database" size={19} /></span>
          <div><small>ฐานข้อมูล</small><strong>Local PostgreSQL</strong><p>เชื่อมต่อผ่าน Server</p></div>
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

      <section className={styles.settingsWorkspace}>
        <div className={styles.settingsTabs} role="tablist" aria-label="หมวดการตั้งค่า">
          <button type="button" role="tab" aria-selected={activeTab === 'system'} onClick={() => setActiveTab('system')}><AdminIcon name="shield" size={17} /><span>ระบบและความปลอดภัย</span></button>
          <button type="button" role="tab" aria-selected={activeTab === 'appearance'} onClick={() => setActiveTab('appearance')}><AdminIcon name="palette" size={17} /><span>หน้าจอและประสิทธิภาพ</span></button>
        </div>

        {activeTab === 'system' ? (
          <form className={styles.settingsForm} onSubmit={handleSaveSystem}>
            <section className={styles.settingsSection} data-tone="blue">
              <header className={styles.sectionHeader}>
                <span><AdminIcon name="sparkles" size={18} /></span>
                <div><h2>ผู้ให้บริการ AI</h2><p>เลือกบริการหลักสำหรับสร้างเนื้อหาและสนทนา</p></div>
              </header>
              <div className={styles.sectionBody}>
                <div className={styles.providerGrid}>
                  {providers.map(provider => (
                    <button key={provider.key} type="button" data-tone={provider.tone} aria-pressed={activeProvider === provider.key} onClick={() => { setActiveProvider(provider.key); setShowApiKey(false) }}>
                      <span className={styles.providerLogo} data-provider={provider.key}><AiProviderLogo provider={provider.key} size={21} /></span>
                      <div><strong>{provider.name}</strong><small>{AI_MODEL_OPTIONS[provider.key].find(model => model.id === providerSettings[provider.key].model)?.name || providerSettings[provider.key].model}</small></div>
                      <i>{activeProvider === provider.key && <AdminIcon name="check" size={13} />}</i>
                    </button>
                  ))}
                </div>
                <div className={styles.aiConfigPanel} data-provider={activeProvider}>
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
                <div className={styles.infoBanner}><AdminIcon name="shield" size={17} /><div><strong>Secret อยู่ฝั่ง Server เท่านั้น</strong><p>หน้าเว็บส่งคีย์ผ่าน API ที่จำกัดสิทธิ์เฉพาะผู้ดูแล จากนั้น PostgreSQL จะเก็บเฉพาะข้อมูลที่เข้ารหัส</p></div></div>
              </div>
            </section>

            <section className={styles.settingsSection} data-tone="purple">
              <header className={styles.sectionHeader}>
                <span><AdminIcon name="cube" size={18} /></span>
                <div><h2>Tripo AI สำหรับสร้างโมเดล 3D</h2><p>กำหนด API Key และเวอร์ชันโมเดลสำหรับ Text-to-3D ทั้งระบบ</p></div>
              </header>
              <div className={styles.sectionBody}>
                <div className={styles.aiConfigPanel}>
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

            <div className={styles.settingsTwoColumns}>
              <section className={styles.settingsSection} data-tone="green">
                <header className={styles.sectionHeader}><span><AdminIcon name="database" size={18} /></span><div><h2>ฐานข้อมูล</h2><p>การเชื่อมต่อสำหรับพัฒนาในเครื่อง</p></div></header>
                <div className={styles.sectionBody}>
                  <div className={styles.readonlyField}><span>Database engine</span><strong>PostgreSQL</strong></div>
                  <div className={styles.readonlyField}><span>Connection</span><strong>127.0.0.1:5432 / krupim_local</strong></div>
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

            <div className={styles.settingsFooter}><button className={styles.primaryButton} type="submit" disabled={loadingAISettings || loadingTripo || savingSystem}><AdminIcon name={savingSystem ? 'refresh' : 'check'} size={16} />{savingSystem ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่าระบบ'}</button></div>
          </form>
        ) : (
          <form className={styles.settingsForm} onSubmit={handleSaveAppearance}>
            <section className={styles.settingsSection} data-tone="purple">
              <header className={styles.sectionHeader}><span><AdminIcon name="palette" size={18} /></span><div><h2>ธีมและตัวอักษร</h2><p>กำหนดภาพลักษณ์และความสบายในการอ่าน</p></div></header>
              <div className={styles.sectionBody}>
                <div className={styles.formGrid}>
                  <label className={styles.field}><span>โทนสีระบบ</span><select value={themeMode} onChange={event => setThemeMode(event.target.value)}><option value="forest-gold">Forest Gold</option><option value="dark-night">Obsidian Dark</option><option value="royal-blue">Royal Blue</option><option value="cherry-blossom">Cherry Blossom</option></select></label>
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
              </div>
            </section>

            <div className={styles.settingsTwoColumns}>
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

            <div className={styles.settingsFooter}><button className={styles.primaryButton} type="submit"><AdminIcon name="check" size={16} />บันทึกและนำไปใช้</button></div>
          </form>
        )}
      </section>

      {clearConfirmOpen && (
        <div className={styles.modalOverlay} onMouseDown={event => {
          if (event.target === event.currentTarget) setClearConfirmOpen(false)
        }}>
          <section className={`${styles.modal} ${styles.confirmModal}`} role="alertdialog" aria-modal="true" aria-labelledby="clear-cache-title">
            <div className={styles.confirmIcon}><AdminIcon name="archive" size={22} /></div>
            <h2 id="clear-cache-title">ล้างข้อมูลชั่วคราวหรือไม่</h2>
            <p>Session และข้อมูล cache ที่ไม่จำเป็นจะถูกลบ แต่ประกาศและการตั้งค่าหลักจะยังคงอยู่</p>
            <div className={styles.modalActions}><button type="button" onClick={() => setClearConfirmOpen(false)}>ยกเลิก</button><button className={styles.dangerButton} type="button" onClick={clearTemporaryData}>ล้างข้อมูล</button></div>
          </section>
        </div>
      )}
      {passwordOpen && (
        <div className={styles.modalOverlay} onMouseDown={event => event.target === event.currentTarget && !savingPassword && setPasswordOpen(false)}>
          <section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="admin-password-title">
            <header className={styles.modalHeader}><span><AdminIcon name="key" size={20} /></span><div><h2 id="admin-password-title">เปลี่ยนรหัสผ่านผู้ดูแล</h2><p>รหัสผ่านใหม่จะถูก hash ก่อนบันทึกลง PostgreSQL</p></div><button type="button" onClick={() => setPasswordOpen(false)} disabled={savingPassword}><AdminIcon name="close" size={18} /></button></header>
            <form onSubmit={changeAdminPassword}><div className={styles.formGrid}><label className={styles.field}><span>รหัสผ่านปัจจุบัน</span><input autoFocus required type="password" autoComplete="current-password" value={passwords.current} onChange={event => setPasswords(current => ({ ...current, current: event.target.value }))} /></label><label className={styles.field}><span>รหัสผ่านใหม่</span><input required minLength={10} type="password" autoComplete="new-password" value={passwords.next} onChange={event => setPasswords(current => ({ ...current, next: event.target.value }))} /></label><label className={styles.field}><span>ยืนยันรหัสผ่านใหม่</span><input required minLength={10} type="password" autoComplete="new-password" value={passwords.confirm} onChange={event => setPasswords(current => ({ ...current, confirm: event.target.value }))} /></label></div><div className={styles.modalActions}><button type="button" onClick={() => setPasswordOpen(false)} disabled={savingPassword}>ยกเลิก</button><button className={styles.primaryButton} type="submit" disabled={savingPassword}><AdminIcon name={savingPassword ? 'clock' : 'check'} size={15} />{savingPassword ? 'กำลังบันทึก' : 'ยืนยันเปลี่ยนรหัสผ่าน'}</button></div></form>
          </section>
        </div>
      )}
    </main>
  )
}
