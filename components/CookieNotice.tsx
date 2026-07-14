'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const STORAGE_KEY = 'cookie_notice_dismissed_v1'

export default function CookieNotice() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true)
    } catch {
      // localStorage unavailable, skip
    }
  }, [])

  function dismiss() {
    try {
      localStorage.setItem(STORAGE_KEY, '1')
    } catch {
      // ignore
    }
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="region"
      aria-label="הודעה על שימוש בעוגיות"
      dir="rtl"
      style={{
        position: 'fixed',
        insetInlineStart: '1.5rem',
        insetInlineEnd: '1.5rem',
        bottom: '1.5rem',
        zIndex: 9996,
        maxWidth: '32rem',
        margin: '0 auto',
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: '0.75rem',
        padding: '1rem 1.25rem',
        boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        flexWrap: 'wrap',
      }}
    >
      <p className="text-sm" style={{ color: 'var(--text)', flex: '1 1 16rem', margin: 0 }}>
        האתר משתמש בעוגייה הכרחית אחת לצורך התחברות לחשבון בלבד - ללא מעקב או פרסום.{' '}
        <Link href="/privacy" className="font-semibold" style={{ color: 'var(--primary)' }}>
          פרטים נוספים
        </Link>
      </p>
      <button
        onClick={dismiss}
        className="text-sm font-semibold px-4 py-2 rounded-lg"
        style={{ background: 'var(--primary)', color: 'white', whiteSpace: 'nowrap' }}
      >
        הבנתי
      </button>
    </div>
  )
}
