'use client'

import { useLanguage } from './LanguageProvider'

export default function LanguageSwitcher({ variant = 'light' }: { variant?: 'light' | 'dark' }) {
  const { lang, setLang } = useLanguage()

  const isDark = variant === 'dark'
  const baseStyle: React.CSSProperties = isDark
    ? { borderColor: 'rgba(255,255,255,0.3)', color: 'white' }
    : { borderColor: 'var(--border)', color: 'var(--text-muted)' }

  return (
    <div className="flex items-center text-xs rounded-lg border overflow-hidden" style={baseStyle}>
      <button
        onClick={() => setLang('he')}
        className="px-2 py-1 transition-colors"
        style={lang === 'he' ? { backgroundColor: 'var(--secondary)', color: '#1a202c', fontWeight: 600 } : {}}
      >
        עברית
      </button>
      <button
        onClick={() => setLang('ar')}
        className="px-2 py-1 transition-colors"
        style={lang === 'ar' ? { backgroundColor: 'var(--secondary)', color: '#1a202c', fontWeight: 600 } : {}}
      >
        العربية
      </button>
    </div>
  )
}
