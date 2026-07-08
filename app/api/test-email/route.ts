import { NextResponse } from 'next/server'
import { sendVerificationCode } from '@/lib/email'
import { createClient, createAdminClient } from '@/lib/supabase-server'

export async function GET() {
  // Admin only
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  const adminClient = createAdminClient()
  const { data: profile } = await adminClient.from('user_profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Admin only' }, { status: 403 })

  try {
    await sendVerificationCode(user.email!, '12345', 'login')
    return NextResponse.json({ ok: true, sentTo: user.email })
  } catch (err: unknown) {
    const error = err as { message?: string; code?: string; response?: { body?: unknown } }
    return NextResponse.json({
      ok: false,
      error: error?.message || String(err),
      code: error?.code,
      response: error?.response?.body,
    })
  }
}
