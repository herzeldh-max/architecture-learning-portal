'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lang, Dictionary, getDictionary } from '@/lib/i18n'

interface LanguageContextValue {
  lang: Lang
  t: Dictionary
  setLang: (lang: Lang) => void
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ initialLang, children }: { initialLang: Lang; children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang)
  const router = useRouter()

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  function setLang(newLang: Lang) {
    document.cookie = `lang=${newLang}; path=/; max-age=31536000`
    setLangState(newLang)
    router.refresh()
  }

  return (
    <LanguageContext.Provider value={{ lang, t: getDictionary(lang), setLang }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
