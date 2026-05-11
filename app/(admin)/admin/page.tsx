import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'

export default async function AdminPage() {
  const supabase = await createClient()

  const [
    { count: studentCount },
    { count: pdfCount },
    { data: recentAnswers },
  ] = await Promise.all([
    supabase.from('user_profiles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
    supabase.from('pdfs').select('*', { count: 'exact', head: true }),
    supabase.from('exam_answers').select('score, created_at').order('created_at', { ascending: false }).limit(50),
  ])

  const avg = recentAnswers && recentAnswers.length > 0
    ? Math.round(recentAnswers.reduce((s, a) => s + (a.score || 0), 0) / recentAnswers.length * 10) / 10
    : 0

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--primary)' }}>ממשק מנהל</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="סטודנטים רשומים" value={studentCount || 0} icon="👥" />
        <StatCard label="קבצי PDF" value={pdfCount || 0} icon="📄" />
        <StatCard label="תשובות (50 אחרונות)" value={recentAnswers?.length || 0} icon="✍️" />
        <StatCard label="ממוצע ציון" value={avg} icon="📊" unit="/10" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <AdminCard
          href="/admin/upload"
          icon="📤"
          title="העלאת מצגות"
          desc="הוסף קבצי PDF לתורת הבנייה"
          color="var(--primary)"
        />
        <AdminCard
          href="/admin/students"
          icon="👥"
          title="ניהול סטודנטים"
          desc="צפה בסטודנטים ובציוניהם"
          color="#2d6a4f"
        />
        <AdminCard
          href="/admin/statistics"
          icon="📊"
          title="סטטיסטיקות"
          desc="ניתוח ביצועים ונתוני שימוש"
          color="#6b46c1"
        />
      </div>
    </div>
  )
}

function StatCard({ label, value, icon, unit = '' }: { label: string; value: number; icon: string; unit?: string }) {
  return (
    <div className="card p-4 text-center">
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-2xl font-bold" style={{ color: 'var(--primary)' }}>{value}{unit}</div>
      <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{label}</div>
    </div>
  )
}

function AdminCard({ href, icon, title, desc, color }: { href: string; icon: string; title: string; desc: string; color: string }) {
  return (
    <Link href={href}>
      <div className="card p-6 hover:shadow-md transition-shadow cursor-pointer" style={{ borderTop: `4px solid ${color}` }}>
        <div className="text-3xl mb-3">{icon}</div>
        <h2 className="font-bold text-lg mb-1" style={{ color }}>{title}</h2>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{desc}</p>
      </div>
    </Link>
  )
}
