'use client'

import React, { useEffect, useRef } from 'react'

declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void
      render: (
        container: HTMLElement | string,
        parameters: {
          sitekey: string
          theme?: 'dark' | 'light'
          callback?: (token: string) => void
          'expired-callback'?: () => void
          'error-callback'?: () => void
        },
      ) => number
      reset: (opt_widget_id?: number) => void
      getResponse: (opt_widget_id?: number) => string
    }
    onRecaptchaApiLoaded?: () => void
  }
}

interface ReCaptchaProps {
  onVerify: (token: string) => void
  onExpire?: () => void
  onError?: () => void
  theme?: 'dark' | 'light'
  className?: string
}

export function ReCaptcha({
  onVerify,
  onExpire,
  onError,
  theme = 'dark',
  className,
}: ReCaptchaProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<number | null>(null)
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY

  // Keep latest callbacks in refs to prevent re-triggering effect and stale closures
  const onVerifyRef = useRef(onVerify)
  onVerifyRef.current = onVerify

  const onExpireRef = useRef(onExpire)
  onExpireRef.current = onExpire

  const onErrorRef = useRef(onError)
  onErrorRef.current = onError

  useEffect(() => {
    const currentSiteKey = siteKey
    if (!currentSiteKey) return

    function renderWidget() {
      if (!containerRef.current || !window.grecaptcha?.render || !currentSiteKey) return
      if (widgetIdRef.current !== null) return // already rendered

      try {
        widgetIdRef.current = window.grecaptcha.render(containerRef.current, {
          sitekey: currentSiteKey,
          theme,
          callback: (token: string) => {
            onVerifyRef.current?.(token)
          },
          'expired-callback': () => {
            onExpireRef.current?.()
          },
          'error-callback': () => {
            onErrorRef.current?.()
          },
        })
      } catch (err) {
        console.warn('[reCAPTCHA] render error:', err)
      }
    }

    if (window.grecaptcha?.render) {
      renderWidget()
    } else {
      const scriptId = 'google-recaptcha-script'
      let script = document.getElementById(scriptId) as HTMLScriptElement | null

      window.onRecaptchaApiLoaded = () => {
        if (window.grecaptcha?.ready) {
          window.grecaptcha.ready(renderWidget)
        } else {
          renderWidget()
        }
      }

      if (!script) {
        script = document.createElement('script')
        script.id = scriptId
        script.src = 'https://www.google.com/recaptcha/api.js?onload=onRecaptchaApiLoaded&render=explicit&hl=th'
        script.async = true
        script.defer = true
        document.head.appendChild(script)
      }
    }
  }, [siteKey, theme])

  // If site key is not configured, show a helper note in dev/local mode
  if (!siteKey) {
    if (process.env.NODE_ENV !== 'production') {
      return (
        <div
          style={{
            fontSize: '12px',
            color: 'var(--text-muted, #94A3B8)',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px dashed rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            padding: '8px 12px',
            margin: '8px 0',
            textAlign: 'center',
          }}
        >
          🛡️ <strong>Human Verification (reCAPTCHA) พร้อมทำงาน</strong>
          <div style={{ fontSize: '11px', opacity: 0.8, marginTop: '2px' }}>
            (พร้อมทำงานเมื่อระบุ NEXT_PUBLIC_RECAPTCHA_SITE_KEY ใน .env)
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        margin: '12px 0',
        minHeight: '78px',
      }}
      className={className}
    >
      <div ref={containerRef} />
    </div>
  )
}

/**
 * Utility to reliably get active reCAPTCHA token from DOM or grecaptcha API
 */
export function getActiveRecaptchaToken(fallbackToken?: string): string {
  if (fallbackToken && fallbackToken.trim()) return fallbackToken.trim()

  if (typeof window !== 'undefined' && window.grecaptcha?.getResponse) {
    try {
      const response = window.grecaptcha.getResponse()
      if (response && response.trim()) return response.trim()
    } catch {
      // ignore
    }
  }

  if (typeof document !== 'undefined') {
    const textarea = document.querySelector<HTMLTextAreaElement>('textarea[name="g-recaptcha-response"]')
    if (textarea?.value && textarea.value.trim()) {
      return textarea.value.trim()
    }
  }

  return ''
}
