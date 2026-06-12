'use client'

import { useState, useMemo } from 'react'
import { useLanguage } from '@/components/LanguageProvider'
import { glossaryTerms } from '@/lib/glossary'

export default function DictionaryPage() {
  const { t } = useLanguage()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<string>('all')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return glossaryTerms.filter(term => {
      if (category !== 'all' && term.category !== category) return false
      if (!q) return true
      return (
        term.he.toLowerCase().includes(q) ||
        term.ar.toLowerCase().includes(q) ||
        term.definitionHe.toLowerCase().includes(q) ||
        term.definitionAr.toLowerCase().includes(q)
      )
    })
  }, [search, category])

  const categories = Object.keys(t.dictionary.categories)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--primary)' }}>{t.dictionary.title}</h1>
        <p style={{ color: 'var(--text-muted)' }}>{t.dictionary.subtitle}</p>
      </div>

      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={t.dictionary.searchPlaceholder}
          className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2"
          style={{ borderColor: 'var(--border)' }}
        />
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="border rounded-lg px-4 py-2"
          style={{ borderColor: 'var(--border)' }}
        >
          <option value="all">{t.dictionary.categoryAll}</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{t.dictionary.categories[cat]}</option>
          ))}
        </select>
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
                <span className="font-bold text-lg" dir="rtl" style={{ color: 'var(--primary)' }}>{term.ar}</span>
              </div>
              <div className="text-xs uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>
                {t.dictionary.categories[term.category]}
              </div>
              <p className="text-sm mb-1">{term.definitionHe}</p>
              <p className="text-sm" dir="rtl">{term.definitionAr}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
