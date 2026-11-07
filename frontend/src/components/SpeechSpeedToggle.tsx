'use client'

import { useEffect, useState } from 'react'
import styles from './SpeechSpeedToggle.module.css'

export type SpeechRate = 0.75 | 0.9 | 1.05

export const SPEECH_RATES: Array<{ rate: SpeechRate; label: string; icon: string; desc: string }> = [
  { rate: 0.75, label: '0.75x', icon: '🐢', desc: 'ช้า' },
  { rate: 0.9, label: '0.9x', icon: '🎯', desc: 'ปกติ' },
  { rate: 1.05, label: '1.05x', icon: '⚡', desc: 'เร็ว' },
]

export const STORAGE_KEY = 'finemodel_speech_rate'

export function getStoredSpeechRate(): number {
  if (typeof window === 'undefined') return 0.9
  try {
    const val = localStorage.getItem(STORAGE_KEY)
    if (val) {
      const num = parseFloat(val)
      if (!Number.isNaN(num) && num >= 0.5 && num <= 2) return num
    }
  } catch {}
  return 0.9
}

export function setStoredSpeechRate(rate: number): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, String(rate))
    window.dispatchEvent(new CustomEvent('finemodel-speech-rate-change', { detail: rate }))
  } catch {}
}

export default function SpeechSpeedToggle({
  currentRate,
  onRateChange,
  compact = false,
}: {
  currentRate?: number
  onRateChange?: (rate: number) => void
  compact?: boolean
}) {
  const [rate, setRate] = useState<number>(() => currentRate || getStoredSpeechRate())

  useEffect(() => {
    if (currentRate !== undefined) setRate(currentRate)
  }, [currentRate])

  useEffect(() => {
    function handleSync(e: Event) {
      const customEvent = e as CustomEvent<number>
      if (typeof customEvent.detail === 'number') {
        setRate(customEvent.detail)
        onRateChange?.(customEvent.detail)
      }
    }
    window.addEventListener('finemodel-speech-rate-change', handleSync)
    return () => window.removeEventListener('finemodel-speech-rate-change', handleSync)
  }, [onRateChange])

  function selectRate(newRate: number) {
    setRate(newRate)
    setStoredSpeechRate(newRate)
    onRateChange?.(newRate)
  }

  return (
    <div className={`${styles.wrap} ${compact ? styles.compact : ''}`}>
      <span className={styles.label}>
        <span className={styles.icon}>🎚️</span> ความเร็วเสียง:
      </span>
      <div className={styles.pills} role="group" aria-label="ปรับความเร็วการฟัง">
        {SPEECH_RATES.map(item => {
          const isActive = Math.abs(rate - item.rate) < 0.04
          return (
            <button
              key={item.rate}
              type="button"
              className={`${styles.pill} ${isActive ? styles.pillActive : ''}`}
              onClick={() => selectRate(item.rate)}
              title={`${item.desc} (ความเร็ว ${item.label})`}
              aria-pressed={isActive}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
              {!compact && <span className={styles.pillDesc}>({item.desc})</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}
