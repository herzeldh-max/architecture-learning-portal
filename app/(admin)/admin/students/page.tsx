'use client'

import { useState, useEffect } from 'react'

interface Student {
  id: string
  full_name: string
  created_at: string
  questionCount: number
  avgScore: number
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/students')
      .then(r => r.json())
      .then(d => { setStudents(d.students || []); setLoading(false) })
  }, [])

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <a href="/admin" style={{ color: 'var(--text-muted)' }} className="text-sm">ממשק מנהל</a>
        <span style={{ color: 'var(--text-muted)' }}>›</span>
        <span className="text-sm font-medium">סטודנטים</span>
      </div>

      <h1 className="text-xl font-bold mb-4" style={{ color: 'var(--primary)' }}>
        סטודנטים רשומים ({students.length})
      </h1>

      {loading ? (
        <div className="card p-8 text-center"><span className="spinner mx-auto"></span></div>
      ) : students.length === 0 ? (
        <div className="card p-8 text-center" style={{ color: 'var(--text-muted)' }}>אין סטודנטים רשומים עדיין</div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead style={{ backgroundColor: 'var(--bg)' }}>
              <tr>
                <th className="text-right p-3 font-semibold">שם</th>
                <th className="text-right p-3 font-semibold">תאריך הרשמה</th>
                <th className="text-center p-3 font-semibold">שאלות שנשאלו</th>
                <th className="text-center p-3 font-semibold">ממוצע ציון</th>
                <th className="text-center p-3 font-semibold">רמה</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s, i) => {
                const level = s.avgScore >= 7 ? 'טוב' : s.avgScore >= 5 ? 'בינוני' : s.questionCount === 0 ? 'לא פעיל' : 'חלש'
                const levelColor = s.avgScore >= 7 ? 'var(--success)' : s.avgScore >= 5 ? 'var(--warning)' : s.questionCount === 0 ? 'var(--text-muted)' : 'var(--error)'
                return (
                  <tr key={s.id} style={{ borderTop: '1px solid var(--border)', backgroundColor: i % 2 === 0 ? 'white' : 'var(--bg)' }}>
                    <td className="p-3 font-medium">{s.full_name}</td>
                    <td className="p-3" style={{ color: 'var(--text-muted)' }}>
                      {new Date(s.created_at).toLocaleDateString('he-IL')}
                    </td>
                    <td className="p-3 text-center">{s.questionCount}</td>
                    <td className="p-3 text-center font-bold" style={{ color: s.questionCount > 0 ? levelColor : 'var(--text-muted)' }}>
                      {s.questionCount > 0 ? `${s.avgScore}/10` : '-'}
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
