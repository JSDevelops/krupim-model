'use client'

import { useEffect, useRef, useState } from 'react'
import styles from './AppConfirmDialog.module.css'

export type ConfirmDialogOptions = {
  title?: string
  description: string
  confirmText?: string
  cancelText?: string
  tone?: 'default' | 'danger'
}

type ConfirmRequest = {
  options: ConfirmDialogOptions
  resolve: (confirmed: boolean) => void
}

const CONFIRM_EVENT = 'krupim:confirm'

export function confirmAction(options: ConfirmDialogOptions | string) {
  if (typeof window === 'undefined') return Promise.resolve(false)
  const normalized = typeof options === 'string' ? { description: options } : options
  return new Promise<boolean>(resolve => {
    window.dispatchEvent(new CustomEvent<ConfirmRequest>(CONFIRM_EVENT, {
      detail: { options: normalized, resolve },
    }))
  })
}

export default function AppConfirmDialog() {
  const [queue, setQueue] = useState<ConfirmRequest[]>([])
  const cancelButtonRef = useRef<HTMLButtonElement>(null)
  const current = queue[0]

  useEffect(() => {
    const receiveRequest = (event: Event) => {
      const request = (event as CustomEvent<ConfirmRequest>).detail
      setQueue(existing => [...existing, request])
    }
    window.addEventListener(CONFIRM_EVENT, receiveRequest)
    return () => window.removeEventListener(CONFIRM_EVENT, receiveRequest)
  }, [])

  useEffect(() => {
    if (!current) return
    cancelButtonRef.current?.focus()
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        current.resolve(false)
        setQueue(existing => existing.slice(1))
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [current])

  if (!current) return null

  const complete = (confirmed: boolean) => {
    current.resolve(confirmed)
    setQueue(existing => existing.slice(1))
  }

  return (
    <div className={styles.overlay} role="presentation">
      <section
        className={styles.dialog}
        data-tone={current.options.tone || 'default'}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="app-confirm-title"
        aria-describedby="app-confirm-description"
      >
        <div className={styles.content}>
          <span className={styles.icon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M10.3 4.2 2.6 18a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 4.2a2 2 0 0 0-3.4 0Z" />
              <path d="M12 9v4M12 17h.01" />
            </svg>
          </span>
          <h2 id="app-confirm-title">{current.options.title || 'ยืนยันการดำเนินการ'}</h2>
          <p id="app-confirm-description">{current.options.description}</p>
        </div>
        <footer className={styles.actions}>
          <button ref={cancelButtonRef} className={styles.cancel} type="button" onClick={() => complete(false)}>{current.options.cancelText || 'ยกเลิก'}</button>
          <button className={styles.confirm} type="button" onClick={() => complete(true)}>{current.options.confirmText || 'ยืนยัน'}</button>
        </footer>
      </section>
    </div>
  )
}
