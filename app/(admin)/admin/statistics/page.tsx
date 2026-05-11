'use client'

import { useState, useEffect } from 'react'

interface Stats {
  studentCount: number
  totalAnswers: number
  avgScore: number
  activeUsers: number
  pdfCount: number
  scoreDistribution: { perfect: number; partial: number; wrong: number }
  pdfs: { id: string; course: string; semester: string; title: string }[]
}

export default function StatisticsPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/statistics')
      .then(r => r.json())
      .then(d => { setStats(d); setLoading(false) })
  }, [])

  if (loading) return <div className="card p-8 text-center mt-6"><span className="spinner mx-auto"></span></div>
  if (!stats) return null

  const total = stats.scoreDistribution.perfect + stats.scoreDistribution.partial + stats.scoreDistribution.wrong || 1
  const pct = (n: number) => Math.round((n / total) * 100)

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <a href="/admin" style={{ color: 'var(--text-muted)' }} className="text-sm">ממשק מנהל</a>
        <span style={{ color: 'var(--text-muted)' }}>›</span>
        <span className="text-sm font-medium">סטטיסטיקות</span>
      </div>

      <h1 className="text-xl font-bold mb-6" style={{ color: 'var(--primary)' }}>סטטיסטיקות המערכת</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Stat label="סטודנטים" value={stats.studentCount} icon="👥" />
        <Stat label="סה״כ תשובות" value={stats.totalAnswers} icon="✍️" />
        <Stat label="ממוצע ציון" value={`${stats.avgScore}/10`} icon="📊" />
        <Stat label="פעילים (7 ימים)" value={stats.activeUsers} icon="🔥" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="card p-5">
          <h2 className="font-bold mb-4" style={{ color: 'var(--primary)' }}>התפלגות ציונים</h2>
          {stats.totalAnswers === 0 ? (
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>אין נתונים עדיין</p>
          ) : (
            <div className="space-y-3">
              <ScoreBar label="נכון (10)" count={stats.scoreDistribution.perfect} pct={pct(stats.scoreDistribution.perfect)} color="var(--success)" />
              <ScoreBar label="חלקי (5)" count={stats.scoreDistribution.partial} pct={pct(stats.scoreDistribution.partial)} color="var(--warning)" />
              <ScoreBar label="שגוי (0)" count={stats.scoreDistribution.wrong} pct={pct(stats.scoreDistribution.wrong)} color="var(--error)" />
            </div>
          )}
        </div>

        <div className="card p-5">
          <h2 className="font-bold mb-4" style={{ color: 'var(--primary)' }}>קבצי PDF ({stats.pdfCount})</h2>
          <div className="space-y-2 max-h-52 overflow-y-auto">
            {stats.pdfs.length === 0 ? (
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>אין קבצים</p>
            ) : stats.pdfs.map(p => (
              <div key={p.id} className="flex items-center gap-2 text-sm">
                <span>📄</span>
                <span className="flex-1 truncate">{p.title}</span>
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--bg)', color: 'var(--text-muted)' }}>
                  {p.semester === 'A' ? "א'" : p.semester === 'B' ? "ב'" : 'שניהם'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card p-5">
        <h2 className="font-bold mb-3" style={{ color: 'var(--primary)' }}>מידע כללי</h2>
        <div className="text-sm space-y-1" style={{ color: 'var(--text-muted)' }}>
          <p>• סטודנטים רשומים: {stats.studentCount}</p>
          <p>• סה"כ שאלות שנענו: {stats.totalAnswers}</p>
          <p>• ממוצע ציון כללי: {stats.avgScore}/10 ({Math.round(stats.avgScore * 10)}%)</p>
          <p>• סטודנטים פעילים (7 ימים): {stats.activeUsers}</p>
          <p>• קבצי PDF: {stats.pdfCount}</p>
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value, icon }: { label: string; value: string | number; icon: string }) {
  return (
    <div className="card p-4 text-center">
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-2xl font-bold" style={{ color: 'var(--primary)' }}>{value}</div>
      <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{label}</div>
    </div>
  )
}

function ScoreBar({ label, count, pct, color }: { label: string; count: number; pct: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span>{label}</span>
        <span style={{ color }} className="font-semibold">{count} ({pct}%)</span>
      </div>
      <div className="w-full rounded-full h-2" style={{ backgroundColor: 'var(--border)' }}>
        <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }}></div>
      </div>
    </div>
  )
}
