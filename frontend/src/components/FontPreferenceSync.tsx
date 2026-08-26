'use client'

import { useEffect } from 'react'

export type AppFontKey = 'kanit' | 'sarabun' | 'prompt' | 'noto-sans-thai'
export type AppTextSize = 'normal' | 'large' | 'xlarge'

const supportedFonts = new Set<AppFontKey>(['kanit', 'sarabun', 'prompt', 'noto-sans-thai'])
const supportedTextSizes = new Set<AppTextSize>(['normal', 'large', 'xlarge'])

export function applyFontPreference(font: string) {
  const normalized: AppFontKey = supportedFonts.has(font as AppFontKey) ? font as AppFontKey : 'kanit'
  document.documentElement.dataset.appFont = normalized
}

export function applyTextSizePreference(size: string) {
  const normalized: AppTextSize = supportedTextSizes.has(size as AppTextSize) ? size as AppTextSize : 'normal'
  document.documentElement.dataset.textSize = normalized
}

export default function FontPreferenceSync() {
  useEffect(() => {
    const syncPreferences = () => {
      applyFontPreference(window.localStorage.getItem('uxFontFamily') || 'kanit')
      applyTextSizePreference(window.localStorage.getItem('uxTextSize') || 'normal')
    }

    syncPreferences()
    window.addEventListener('storage', syncPreferences)
    return () => window.removeEventListener('storage', syncPreferences)
  }, [])

  return null
}
