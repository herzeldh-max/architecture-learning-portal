import { redirect } from 'next/navigation'
import { createClient, createAdminClient } from '@/lib/supabase-server'
import Navbar from '@/components/Navbar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const adminClient = createAdminClient()
  const { data: profile } = await adminClient
    .from('user_profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/dashboard')

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar userName={profile?.full_name || user.email || ''} role="admin" />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
        {children}
      </main>
      <footer className="py-3 text-center text-xs" style={{ color: 'var(--text-muted)', borderTop: '1px solid var(--border)' }}>
        פורטל לימוד - אדריכלות ועיצוב פנים | ממשק מנהל
      </footer>
    </div>
  )
}
