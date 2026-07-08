import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.email) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const { code, purpose } = await req.json()
    if (!code || !purpose) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    const adminClient = createAdminClient()
    const { data: record } = await adminClient
      .from('verification_codes')
      .select('id, expires_at')
      .eq('email', user.email)
      .eq('code', code.trim())
      .eq('purpose', purpose)
      .eq('used', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (!record) return NextResponse.json({ error: 'invalid' }, { status: 400 })
    if (new Date(record.expires_at) < new Date()) {
      return NextResponse.json({ error: 'expired' }, { status: 400 })
    }

    // Mark as used
    await adminClient.from('verification_codes').update({ used: true }).eq('id', record.id)

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
