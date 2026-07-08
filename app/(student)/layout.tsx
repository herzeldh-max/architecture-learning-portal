import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient, createAdminClient } from '@/lib/supabase-server'
import Navbar from '@/components/Navbar'
import Sidebar from '@/components/Sidebar'
import { getDictionary, isValidLang } from '@/lib/i18n'

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const cookieStore = await cookies()

  // If user has pending 2FA verification, redirect to verify page
  const pending2fa = cookieStore.get('pending_2fa')?.value
  if (pending2fa && pending2fa === user.id) redirect('/verify-login')

  const adminClient = createAdminClient()
  const { data: profile } = await adminClient
    .from('user_profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .single()

  const langCookie = cookieStore.get('lang')?.value
  const lang = isValidLang(langCookie) ? langCookie : 'he'
  const t = getDictionary(lang)

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar userName={profile?.full_name || user.email || ''} role={profile?.role || 'student'} />
      <Sidebar role={profile?.role || 'student'} />
      <div className="flex-1 w-full px-4 py-6 md:pr-60">
        <main id="main-content" tabIndex={-1} className="max-w-6xl mx-auto w-full min-w-0">
          {children}
        </main>
      </div>
      <footer className="py-3 text-center text-xs md:pr-60" style={{ color: 'var(--text-muted)', borderTop: '1px solid var(--border)' }} role="contentinfo">
        {t.footer}
        {' | '}
        <a href="/accessibility" style={{ color: 'var(--primary)' }}>הצהרת נגישות</a>
      </footer>
    </div>
  )
}
