import { createClient, createAdminClient } from '@/lib/supabase-server'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { getDictionary, isValidLang } from '@/lib/i18n'
import LegislationMaterials from '@/components/LegislationMaterials'

export default async function BuildingLegislationPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const adminClient = createAdminClient()
  const { data: profile } = await adminClient
    .from('user_profiles')
    .select('role')
    .eq('id', user!.id)
    .single()

  const cookieStore = await cookies()
  const langCookie = cookieStore.get('lang')?.value
  const lang = isValidLang(langCookie) ? langCookie : 'he'
  const t = getDictionary(lang)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--primary)' }}>{t.buildingLegislation.title}</h1>
          <p style={{ color: 'var(--text-muted)' }}>{t.buildingLegislation.subtitle}</p>
        </div>
        <Link href="/building-legislation/chat">
          <button className="btn-primary" style={{ backgroundColor: '#2d6a4f' }}>{t.buildingLegislation.chatButton}</button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Link href="/building-legislation/chat">
          <div className="card p-4 hover:shadow-md transition-shadow cursor-pointer h-full">
            <div className="text-2xl mb-2">💬</div>
            <h3 className="font-bold text-sm mb-1" style={{ color: '#2d6a4f' }}>{t.buildingLegislation.quickLinks.chat.title}</h3>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{t.buildingLegislation.quickLinks.chat.desc}</p>
          </div>
        </Link>
        <Link href="/building-legislation/exam">
          <div className="card p-4 hover:shadow-md transition-shadow cursor-pointer h-full" style={{ borderTop: '3px solid #2d6a4f' }}>
            <div className="text-2xl mb-2">📝</div>
            <h3 className="font-bold text-sm mb-1" style={{ color: '#2d6a4f' }}>{t.buildingLegislation.quickLinks.exam.title}</h3>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{t.buildingLegislation.quickLinks.exam.desc}</p>
          </div>
        </Link>
      </div>

      <LegislationMaterials isAdmin={profile?.role === 'admin'} />
    </div>
  )
}
