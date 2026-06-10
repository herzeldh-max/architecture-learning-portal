import { createClient, createAdminClient } from '@/lib/supabase-server'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const adminClient = createAdminClient()
  const { data: profile } = await adminClient
    .from('user_profiles')
    .select('full_name, role')
    .eq('id', user!.id)
    .single()

  const { data: recentAnswers } = await supabase
    .from('exam_answers')
    .select('score, created_at, course:exam_sessions(course)')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })
    .limit(10)

  const avgScore = recentAnswers && recentAnswers.length > 0
    ? Math.round(recentAnswers.reduce((s, a) => s + (a.score || 0), 0) / recentAnswers.length * 10) / 10
    : null

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--primary)' }}>
          שלום, {profile?.full_name || 'סטודנט'} 👋
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>ברוך הבא לפורטל הלימוד</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
        <CourseCard
          icon="📐"
          title="תורת הבנייה"
          description="חומרי לימוד, שאלות חופשיות והכנה למבחן"
          links={[
            { href: '/building-theory', label: 'חומרי לימוד' },
            { href: '/building-theory/chat', label: 'שאלות חופשיות' },
            { href: '/building-theory/exam', label: 'הכנה למבחן' },
          ]}
          color="var(--primary)"
        />
        <CourseCard
          icon="📋"
          title="תחיקת הבנייה"
          description="שאלות על תקנות תכנון ובנייה עם מקורות עדכניים"
          links={[
            { href: '/building-legislation/chat', label: 'שאלות על תקנות' },
          ]}
          color="#2d6a4f"
        />
      </div>

      {profile?.role === 'admin' && (
        <div className="card p-5 mb-6" style={{ borderRight: '4px solid var(--secondary)' }}>
          <h2 className="font-bold text-lg mb-3" style={{ color: 'var(--primary)' }}>ממשק מנהל</h2>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin">
              <button className="btn-primary">לממשק הניהול</button>
            </Link>
            <Link href="/admin/upload">
              <button className="btn-secondary">העלאת PDFs</button>
            </Link>
            <Link href="/admin/statistics">
              <button className="btn-secondary">סטטיסטיקות</button>
            </Link>
          </div>
        </div>
      )}

      {avgScore !== null && (
        <div className="card p-5">
          <h2 className="font-bold mb-3" style={{ color: 'var(--primary)' }}>סטטיסטיקות אחרונות</h2>
          <div className="flex gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold" style={{ color: avgScore >= 7 ? 'var(--success)' : avgScore >= 4 ? 'var(--warning)' : 'var(--error)' }}>
                {avgScore}
              </div>
              <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>ממוצע ציון</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold" style={{ color: 'var(--primary)' }}>
                {recentAnswers?.length || 0}
              </div>
              <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>שאלות אחרונות</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function CourseCard({ icon, title, description, links, color }: {
  icon: string; title: string; description: string
  links: { href: string; label: string }[]; color: string
}) {
  return (
    <div className="card p-6" style={{ borderTop: `4px solid ${color}` }}>
      <div className="flex items-center gap-3 mb-3">
        <span className="text-3xl">{icon}</span>
        <div>
          <h2 className="text-lg font-bold" style={{ color }}>{title}</h2>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{description}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mt-4">
        {links.map(l => (
          <Link key={l.href} href={l.href}>
            <button className="btn-primary text-sm" style={{ backgroundColor: color }}>
              {l.label}
            </button>
          </Link>
        ))}
      </div>
    </div>
  )
}
