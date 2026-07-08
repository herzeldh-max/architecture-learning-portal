import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase-server'
import { sendVerificationCode } from '@/lib/email'

function generateCode(): string {
  return String(Math.floor(10000 + Math.random() * 90000))
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.email) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const { purpose } = await req.json()
    if (!['change_name', 'change_password'].includes(purpose)) {
      return NextResponse.json({ error: 'Invalid purpose' }, { status: 400 })
    }

    const adminClient = createAdminClient()

    // Delete any previous unused codes for this purpose
    await adminClient
      .from('verification_codes')
      .delete()
      .eq('email', user.email)
      .eq('purpose', purpose)
      .eq('used', false)

    const code = generateCode()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

    await adminClient.from('verification_codes').insert({
      email: user.email,
      code,
      purpose,
      expires_at: expiresAt,
    })

    await sendVerificationCode(user.email, code, purpose)

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('send-code error:', err)
    return NextResponse.json({ error: 'Failed to send code' }, { status: 500 })
  }
}
