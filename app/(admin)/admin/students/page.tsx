'use client'

import { useState, useEffect, useMemo } from 'react'

interface Student {
  id: string
  full_name: string
  created_at: string
  questionCount: number
  avgScore: number
  lastActive: string | null
}

type SortKey = 'full_name' | 'created_at' | 'questionCount' | 'avgScore' | 'lastActive'

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('full_name')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  useEffect(() => {
    fetch('/api/admin/students')
      .then(r => r.json())
      .then(d => { setStudents(d.students || []); setLoading(false) })
  }, [])

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const filteredStudents = useMemo(() => {
    const filtered = students.filter(s => s.full_name.includes(search.trim()))
    const sorted = [...filtered].sort((a, b) => {
      const av = a[sortKey] ?? ''
      const bv = b[sortKey] ?? ''
      if (av < bv) return sortDir === 'asc' ? -1 : 1
      if (av > bv) return sortDir === 'asc' ? 1 : -1
      return 0
    })
    return sorted
  }, [students, search, sortKey, sortDir])

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <a href="/admin" style={{ color: 'var(--text-muted)' }} className="text-sm">ממשק מנהל</a>
        <span style={{ color: 'var(--text-muted)' }}>›</span>
        <span className="text-sm font-medium">סטודנטים</span>
      </div>

      <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
        <h1 className="text-xl font-bold" style={{ color: 'var(--primary)' }}>
          סטודנטים רשומים ({students.length})
        </h1>
        <input
          type="text"
          placeholder="חיפוש לפי שם..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input-field max-w-xs"
        />
      </div>

      {loading ? (
        <div className="card p-8 text-center"><span className="spinner mx-auto"></span></div>
      ) : students.length === 0 ? (
        <div className="card p-8 text-center" style={{ color: 'var(--text-muted)' }}>אין סטודנטים רשומים עדיין</div>
      ) : filteredStudents.length === 0 ? (
        <div className="card p-8 text-center" style={{ color: 'var(--text-muted)' }}>לא נמצאו סטודנטים התואמים לחיפוש</div>
      ) : (
        <div className="card overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead style={{ backgroundColor: 'var(--bg)' }}>
              <tr>
                <SortHeader label="שם" k="full_name" align="right" sortKey={sortKey} sortDir={sortDir} onClick={toggleSort} />
                <SortHeader label="תאריך הרשמה" k="created_at" sortKey={sortKey} sortDir={sortDir} onClick={toggleSort} />
                <SortHeader label="שאלות שנשאלו" k="questionCount" sortKey={sortKey} sortDir={sortDir} onClick={toggleSort} />
                <SortHeader label="ממוצע ציון" k="avgScore" sortKey={sortKey} sortDir={sortDir} onClick={toggleSort} />
                <SortHeader label="פעילות אחרונה" k="lastActive" sortKey={sortKey} sortDir={sortDir} onClick={toggleSort} />
                <th className="text-center p-3 font-semibold">רמה</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((s, i) => {
                const level = s.avgScore >= 7 ? 'טוב' : s.avgScore >= 5 ? 'בינוני' : s.questionCount === 0 ? 'לא פעיל' : 'חלש'
                const levelColor = s.avgScore >= 7 ? 'var(--success)' : s.avgScore >= 5 ? 'var(--warning)' : s.questionCount === 0 ? 'var(--text-muted)' : 'var(--error)'
                return (
                  <tr key={s.id} style={{ borderTop: '1px solid var(--border)', backgroundColor: i % 2 === 0 ? 'white' : 'var(--bg)' }}>
                    <td className="p-3 font-medium">{s.full_name}</td>
                    <td className="p-3 text-center" style={{ color: 'var(--text-muted)' }}>
                      {new Date(s.created_at).toLocaleDateString('he-IL')}
                    </td>
                    <td className="p-3 text-center">{s.questionCount}</td>
                    <td className="p-3 text-center font-bold" style={{ color: s.questionCount > 0 ? levelColor : 'var(--text-muted)' }}>
                      {s.questionCount > 0 ? `${s.avgScore}/10` : '-'}
                    </td>
                    <td className="p-3 text-center" style={{ color: 'var(--text-muted)' }}>
                      {s.lastActive ? new Date(s.lastActive).toLocaleDateString('he-IL') : '-'}
                    </td>
                    <td className="p-3 text-center">
                      <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: `${levelColor}20`, color: levelColor, fontWeight: 600 }}>
                        {level}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function SortHeader({ label, k, align = 'center', sortKey, sortDir, onClick }: {
  label: string
  k: SortKey
  align?: 'right' | 'center'
  sortKey: SortKey
  sortDir: 'asc' | 'desc'
  onClick: (k: SortKey) => void
}) {
  const active = sortKey === k
  return (
    <th
      className={`${align === 'right' ? 'text-right' : 'text-center'} p-3 font-semibold cursor-pointer select-none hover:opacity-70`}
      onClick={() => onClick(k)}
    >
      {label} {active ? (sortDir === 'asc' ? '▲' : '▼') : ''}
    </th>
  )
}
