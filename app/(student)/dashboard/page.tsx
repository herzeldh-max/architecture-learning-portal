import { createClient, createAdminClient } from '@/lib/supabase-server'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { getDictionary, isValidLang } from '@/lib/i18n'

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

  const cookieStore = await cookies()
  const langCookie = cookieStore.get('lang')?.value
  const lang = isValidLang(langCookie) ? langCookie : 'he'
  const t = getDictionary(lang)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--primary)' }}>
          {t.dashboard.greeting.replace('{name}', profile?.full_name || (lang === 'ar' ? 'الطالب' : 'סטודנט'))}
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>{t.dashboard.welcome}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
        <CourseCard
          icon="📐"
          title={t.dashboard.theoryCard.title}
          description={t.dashboard.theoryCard.desc}
          links={[
            { href: '/building-theory', label: t.dashboard.theoryCard.links.materials },
            { href: '/building-theory/chat', label: t.dashboard.theoryCard.links.chat },
            { href: '/building-theory/exam', label: t.dashboard.theoryCard.links.exam },
          ]}
          color="var(--primary)"
        />
        <CourseCard
          icon="✍️"
          title="כתיבת פרומפטים לאדריכלות"
          description="למד Prompt Engineering מעשי עם תרחישים אדריכליים אמיתיים"
          links={[
            { href: '/prompt-engineering', label: 'לקורס' },
            { href: '/prompt-engineering/practice?level=1', label: 'תרגול מיידי' },
          ]}
          color="#7b2d8b"
        />
        <CourseCard
          icon="📋"
          title={t.dashboard.legislationCard.title}
          description={t.dashboard.legislationCard.desc}
          links={[
            { href: '/building-legislation', label: t.dashboard.legislationCard.link },
            { href: '/building-legislation/chat', label: t.buildingLegislation.chatButton },
            { href: '/building-legislation/exam', label: t.buildingLegislation.examButton },
          ]}
          color="#2d6a4f"
        />
      </div>

      {profile?.role === 'admin' && (
        <div className="card p-5 mb-6" style={{ borderRight: '4px solid var(--secondary)' }}>
          <h2 className="font-bold text-lg mb-3" style={{ color: 'var(--primary)' }}>{t.dashboard.adminSection.title}</h2>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin">
              <button className="btn-primary">{t.dashboard.adminSection.manage}</button>
            </Link>
            <Link href="/admin/upload">
              <button className="btn-secondary">{t.dashboard.adminSection.upload}</button>
            </Link>
            <Link href="/admin/statistics">
              <button className="btn-secondary">{t.dashboard.adminSection.stats}</button>
            </Link>
          </div>
        </div>
      )}

      {avgScore !== null && (
        <div className="card p-5">
          <h2 className="font-bold mb-3" style={{ color: 'var(--primary)' }}>{t.dashboard.recentStats.title}</h2>
          <div className="flex gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold" style={{ color: avgScore >= 7 ? 'var(--success)' : avgScore >= 4 ? 'var(--warning)' : 'var(--error)' }}>
                {avgScore}
              </div>
              <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{t.dashboard.recentStats.avgScore}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold" style={{ color: 'var(--primary)' }}>
                {recentAnswers?.length || 0}
              </div>
              <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{t.dashboard.recentStats.recentQuestions}</div>
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
