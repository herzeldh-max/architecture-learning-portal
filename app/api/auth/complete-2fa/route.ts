import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.email) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const { code } = await req.json()
    if (!code) return NextResponse.json({ error: 'Missing code' }, { status: 400 })

    const adminClient = createAdminClient()
    const { data: record } = await adminClient
      .from('verification_codes')
      .select('id, expires_at, used')
      .eq('email', user.email)
      .eq('code', code.trim())
      .eq('purpose', 'login')
      .eq('used', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (!record) return NextResponse.json({ error: 'invalid' }, { status: 400 })
    if (new Date(record.expires_at) < new Date()) {
      return NextResponse.json({ error: 'expired' }, { status: 400 })
    }

    await adminClient.from('verification_codes').update({ used: true }).eq('id', record.id)

    const response = NextResponse.json({ ok: true })
    response.cookies.set('pending_2fa', '', { maxAge: 0, path: '/' })
    return response
  } catch (err) {
    console.error('complete-2fa error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
