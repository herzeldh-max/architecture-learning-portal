'use client'

import { useState, useEffect, useCallback } from 'react'

interface Prefs {
  highContrast: boolean
  largeText: boolean
  highlightLinks: boolean
  reduceMotion: boolean
  readableFont: boolean
}

const DEFAULT_PREFS: Prefs = {
  highContrast: false,
  largeText: false,
  highlightLinks: false,
  reduceMotion: false,
  readableFont: false,
}

function applyPrefs(p: Prefs) {
  const c = document.documentElement.classList
  c.toggle('a11y-contrast-high', p.highContrast)
  c.toggle('a11y-text-large', p.largeText)
  c.toggle('a11y-links', p.highlightLinks)
  c.toggle('a11y-reduce-motion', p.reduceMotion)
  c.toggle('a11y-readable-font', p.readableFont)
}

export default function A11yWidget({ lang }: { lang: string }) {
  const [open, setOpen] = useState(false)
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS)
  const isHe = lang !== 'ar'

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('a11y_prefs_v1') || '{}')
      const merged = { ...DEFAULT_PREFS, ...stored }
      setPrefs(merged)
      applyPrefs(merged)
    } catch { /* ignore */ }
  }, [])

  const update = useCallback((key: keyof Prefs) => {
    setPrefs(prev => {
      const next = { ...prev, [key]: !prev[key] }
      applyPrefs(next)
      try { localStorage.setItem('a11y_prefs_v1', JSON.stringify(next)) } catch { /* ignore */ }
      const announcer = document.getElementById('a11y-announcer')
      if (announcer) {
        const labels: Record<keyof Prefs, string> = {
          highContrast: isHe ? 'ניגודיות גבוהה' : 'تباين عالٍ',
          largeText: isHe ? 'טקסט גדול' : 'نص كبير',
          highlightLinks: isHe ? 'הדגשת קישורים' : 'تمييز الروابط',
          reduceMotion: isHe ? 'הפחתת אנימציות' : 'تقليل الحركة',
          readableFont: isHe ? 'גופן קריא' : 'خط مقروء',
        }
        announcer.textContent = `${labels[key]} ${next[key] ? (isHe ? 'מופעל' : 'مفعّل') : (isHe ? 'כבוי' : 'معطّل')}`
      }
      return next
    })
  }, [isHe])

  const reset = useCallback(() => {
    setPrefs(DEFAULT_PREFS)
    applyPrefs(DEFAULT_PREFS)
    try { localStorage.removeItem('a11y_prefs_v1') } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey && e.code === 'KeyA') {
        e.preventDefault()
        setOpen(o => !o)
      }
      if (e.key === 'Escape' && open) setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  const rows: { key: keyof Prefs; label: string }[] = isHe
    ? [
        { key: 'highContrast', label: 'ניגודיות גבוהה' },
        { key: 'largeText', label: 'טקסט גדול' },
        { key: 'highlightLinks', label: 'הדגשת קישורים' },
        { key: 'reduceMotion', label: 'הפחתת אנימציות' },
        { key: 'readableFont', label: 'גופן קריא' },
      ]
    : [
        { key: 'highContrast', label: 'تباين عالٍ' },
        { key: 'largeText', label: 'نص كبير' },
        { key: 'highlightLinks', label: 'تمييز الروابط' },
        { key: 'reduceMotion', label: 'تقليل الحركة' },
        { key: 'readableFont', label: 'خط مقروء' },
      ]

  return (
    <>
      {open && (
        <div id="a11y-widget-panel" role="dialog" aria-modal="true"
          aria-label={isHe ? 'הגדרות נגישות' : 'إعدادات إمكانية الوصول'}>
          <h2>{isHe ? 'הגדרות נגישות' : 'إعدادات إمكانية الوصول'}</h2>
          {rows.map(({ key, label }) => (
            <div key={key} className="a11y-toggle-row">
              <span>{label}</span>
              <button
                className="a11y-toggle-btn"
                aria-pressed={prefs[key]}
                onClick={() => update(key)}
              >
                {prefs[key] ? (isHe ? 'כבה' : 'إيقاف') : (isHe ? 'הפעל' : 'تشغيل')}
              </button>
            </div>
          ))}
          <button className="a11y-reset-btn" onClick={reset}>
            {isHe ? 'איפוס הכל' : 'إعادة تعيين الكل'}
          </button>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', textAlign: 'center' }}>
            {isHe ? (
              <><a href="/accessibility" style={{ color: 'var(--primary)' }}>הצהרת נגישות</a> | Alt+A לפתיחה</>
            ) : (
              <><a href="/accessibility" style={{ color: 'var(--primary)' }}>إعلان إمكانية الوصول</a> | Alt+A للفتح</>
            )}
          </p>
        </div>
      )}
      <button
        id="a11y-widget-trigger"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-controls="a11y-widget-panel"
        aria-keyshortcuts="Alt+A"
        aria-label={isHe ? 'פתח הגדרות נגישות (Alt+A)' : 'فتح إعدادات إمكانية الوصول (Alt+A)'}
        title={isHe ? 'הגדרות נגישות' : 'إعدادات إمكانية الوصول'}
      >
        ♿
      </button>
    </>
  )
}
