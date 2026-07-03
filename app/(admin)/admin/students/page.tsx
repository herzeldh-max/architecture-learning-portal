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

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [savingId, setSavingId] = useState<string | null>(null)

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Feedback
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)

  function showToast(msg: string, ok: boolean) {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    fetch('/api/admin/students')
      .then(r => r.json())
      .then(d => { setStudents(d.students || []); setLoading(false) })
  }, [])

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  function startEdit(s: Student) {
    setEditingId(s.id)
    setEditName(s.full_name)
  }

  function cancelEdit() {
    setEditingId(null)
    setEditName('')
  }

  async function saveName(studentId: string) {
    if (!editName.trim()) return
    setSavingId(studentId)
    try {
      const res = await fetch('/api/admin/students', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, fullName: editName.trim() }),
      })
      if (res.ok) {
        setStudents(prev => prev.map(s => s.id === studentId ? { ...s, full_name: editName.trim() } : s))
        setEditingId(null)
        showToast('השם עודכן בהצלחה', true)
      } else {
        showToast('שגיאה בעדכון השם', false)
      }
    } catch {
      showToast('שגיאה בחיבור לשרת', false)
    }
    setSavingId(null)
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await fetch('/api/admin/students', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: deleteTarget.id }),
      })
      if (res.ok) {
        setStudents(prev => prev.filter(s => s.id !== deleteTarget.id))
        showToast(`${deleteTarget.full_name} נמחק מהמערכת`, true)
      } else {
        showToast('שגיאה במחיקת הסטודנט', false)
      }
    } catch {
      showToast('שגיאה בחיבור לשרת', false)
    }
    setDeleting(false)
    setDeleteTarget(null)
  }

  const filteredStudents = useMemo(() => {
    const filtered = students.filter(s => s.full_name.includes(search.trim()))
    return [...filtered].sort((a, b) => {
      const av = a[sortKey] ?? ''
      const bv = b[sortKey] ?? ''
      if (av < bv) return sortDir === 'asc' ? -1 : 1
      if (av > bv) return sortDir === 'asc' ? 1 : -1
      return 0
    })
  }, [students, search, sortKey, sortDir])

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-semibold"
          style={{ backgroundColor: toast.ok ? 'var(--success)' : 'var(--error)', color: 'white', minWidth: '220px', textAlign: 'center' }}>
          {toast.msg}
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-40 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}>
          <div className="card p-6 max-w-sm w-full mx-4">
            <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--error)' }}>מחיקת סטודנט</h2>
            <p className="text-sm mb-1">האם אתה בטוח שברצונך למחוק את:</p>
            <p className="font-bold text-base mb-3" style={{ color: 'var(--primary)' }}>{deleteTarget.full_name}</p>
            <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>
              פעולה זו תמחק את כל הנתונים של הסטודנט (שאלות, ציונים, היסטוריה) ותבטל את גישתו לאתר. לא ניתן לשחזר.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} disabled={deleting}
                className="flex-1 py-2 rounded-lg border font-semibold text-sm"
                style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                ביטול
              </button>
              <button onClick={confirmDelete} disabled={deleting}
                className="flex-1 py-2 rounded-lg font-semibold text-sm text-white"
                style={{ backgroundColor: 'var(--error)' }}>
                {deleting ? 'מוחק...' : 'מחק סטודנט'}
              </button>
            </div>
          </div>
        </div>
      )}

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
                <th className="text-center p-3 font-semibold">פעולות</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((s, i) => {
                const level = s.avgScore >= 7 ? 'טוב' : s.avgScore >= 5 ? 'בינוני' : s.questionCount === 0 ? 'לא פעיל' : 'חלש'
                const levelColor = s.avgScore >= 7 ? 'var(--success)' : s.avgScore >= 5 ? 'var(--warning)' : s.questionCount === 0 ? 'var(--text-muted)' : 'var(--error)'
                const isEditing = editingId === s.id
                const isSaving = savingId === s.id

                return (
                  <tr key={s.id} style={{ borderTop: '1px solid var(--border)', backgroundColor: i % 2 === 0 ? 'white' : 'var(--bg)' }}>
                    <td className="p-3">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <input
                            autoFocus
                            value={editName}
                            onChange={e => setEditName(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') saveName(s.id); if (e.key === 'Escape') cancelEdit() }}
                            className="input-field py-1 px-2 text-sm"
                            style={{ minWidth: '140px' }}
                          />
                          <button onClick={() => saveName(s.id)} disabled={isSaving || !editName.trim()}
                            className="text-xs px-2 py-1 rounded font-semibold text-white"
                            style={{ backgroundColor: 'var(--success)', opacity: isSaving ? 0.6 : 1 }}>
                            {isSaving ? '...' : 'שמור'}
                          </button>
                          <button onClick={cancelEdit}
                            className="text-xs px-2 py-1 rounded font-semibold"
                            style={{ backgroundColor: 'var(--bg)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                            ביטול
                          </button>
                        </div>
                      ) : (
                        <span className="font-medium">{s.full_name}</span>
                      )}
                    </td>
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
                      <span className="text-xs px-2 py-1 rounded-full"
                        style={{ backgroundColor: `${levelColor}20`, color: levelColor, fontWeight: 600 }}>
                        {level}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {!isEditing && (
                          <button onClick={() => startEdit(s)}
                            title="ערוך שם"
                            className="text-xs px-2 py-1 rounded font-medium"
                            style={{ backgroundColor: '#ebf4ff', color: 'var(--primary)', border: '1px solid #bee3f8' }}>
                            ✏️ ערוך
                          </button>
                        )}
                        <button onClick={() => setDeleteTarget(s)}
                          title="מחק סטודנט"
                          className="text-xs px-2 py-1 rounded font-medium"
                          style={{ backgroundColor: '#fff5f5', color: 'var(--error)', border: '1px solid #fed7d7' }}>
                          🗑️ מחק
                        </button>
                      </div>
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
  label: string; k: SortKey; align?: 'right' | 'center'
  sortKey: SortKey; sortDir: 'asc' | 'desc'; onClick: (k: SortKey) => void
}) {
  const active = sortKey === k
  return (
    <th
      className={`${align === 'right' ? 'text-right' : 'text-center'} p-3 font-semibold cursor-pointer select-none hover:opacity-70`}
      onClick={() => onClick(k)}>
      {label} {active ? (sortDir === 'asc' ? '▲' : '▼') : ''}
    </th>
  )
}
