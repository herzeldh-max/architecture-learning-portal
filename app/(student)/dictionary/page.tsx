'use client'

import { useState, useMemo } from 'react'
import { useLanguage } from '@/components/LanguageProvider'
import { glossaryTerms } from '@/lib/glossary'

const HEBREW_ALPHABET = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 'י', 'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ', 'ק', 'ר', 'ש', 'ת']

export default function DictionaryPage() {
  const { t } = useLanguage()
  const [search, setSearch] = useState('')
  const [letter, setLetter] = useState<string>('all')

  const availableLetters = useMemo(() => {
    const present = new Set(glossaryTerms.map(term => term.he[0]))
    return HEBREW_ALPHABET.filter(l => present.has(l))
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return glossaryTerms.filter(term => {
      if (letter !== 'all' && term.he[0] !== letter) return false
      if (!q) return true
      return (
        term.he.toLowerCase().includes(q) ||
        term.ar.toLowerCase().includes(q) ||
        term.definitionHe.toLowerCase().includes(q) ||
        term.definitionAr.toLowerCase().includes(q)
      )
    })
  }, [search, letter])

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--primary)' }}>{t.dictionary.title}</h1>
        <p style={{ color: 'var(--text-muted)' }}>{t.dictionary.subtitle}</p>
      </div>

      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={t.dictionary.searchPlaceholder}
          className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2"
          style={{ borderColor: 'var(--border)' }}
        />
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setLetter('all')}
          className="px-3 py-1 rounded-lg border text-sm font-bold"
          style={{
            borderColor: 'var(--border)',
            backgroundColor: letter === 'all' ? 'var(--primary)' : 'transparent',
            color: letter === 'all' ? '#fff' : 'inherit',
          }}
        >
          {t.dictionary.allLetters}
        </button>
        {availableLetters.map(l => (
          <button
            key={l}
            onClick={() => setLetter(l)}
            className="w-9 h-9 rounded-lg border text-sm font-bold"
            style={{
              borderColor: 'var(--border)',
              backgroundColor: letter === l ? 'var(--primary)' : 'transparent',
              color: letter === l ? '#fff' : 'inherit',
            }}
          >
            {l}
          </button>
        ))}
      </div>

      <div className="mb-4 text-sm" style={{ color: 'var(--text-muted)' }}>
        {t.dictionary.termsCount.replace('{n}', String(filtered.length))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
          {t.dictionary.noResults}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((term, i) => (
            <div key={i} className="card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-lg" style={{ color: 'var(--primary)' }}>{term.he}</span>
                {term.ar && (
                  <span className="font-bold text-lg" dir="rtl" style={{ color: 'var(--primary)' }}>{term.ar}</span>
                )}
              </div>
              <p className="text-sm mb-1">{term.definitionHe}</p>
              {term.definitionAr && (
                <p className="text-sm" dir="rtl">{term.definitionAr}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
