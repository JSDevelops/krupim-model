'use client'

import { useEffect, useState } from 'react'
import styles from './SpeechSpeedToggle.module.css'

export type SpeechRate = 0.75 | 0.9 | 1.0

export const SPEECH_RATES: Array<{ rate: SpeechRate; text: string; sub: string }> = [
  { rate: 0.75, text: 'ช้า', sub: '0.75x' },
  { rate: 0.9, text: 'กลาง', sub: '0.9x' },
  { rate: 1.0, text: 'ปกติ', sub: '1.0x' },
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
        <svg
          className={styles.icon}
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        </svg>
        <span>ความเร็วเสียง:</span>
      </span>
      <div className={styles.pills} role="group" aria-label="ปรับความเร็วการฟัง (ช้า กลาง ปกติ)">
        {SPEECH_RATES.map(item => {
          const isActive = Math.abs(rate - item.rate) < 0.08
          return (
            <button
              key={item.rate}
              type="button"
              className={`${styles.pill} ${isActive ? styles.pillActive : ''}`}
              onClick={() => selectRate(item.rate)}
              title={`ความเร็ว ${item.text} (${item.sub})`}
              aria-pressed={isActive}
            >
              <span className={styles.pillText}>{item.text}</span>
              <span className={styles.pillSub}>{item.sub}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

