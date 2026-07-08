import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase-server'
import { sendVerificationCode } from '@/lib/email'

function generateCode(): string {
  return String(Math.floor(10000 + Math.random() * 90000))
}

function maskEmail(email: string): string {
  const [user, domain] = email.split('@')
  const masked = user.slice(0, 2) + '***'
  return `${masked}@${domain}`
}

export async function POST(_req: NextRequest) {
  // If email is not configured, skip 2FA entirely
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    return NextResponse.json({ skip: true })
  }

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.email) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const adminClient = createAdminClient()

    // Delete any previous unused login codes for this email
    await adminClient
      .from('verification_codes')
      .delete()
      .eq('email', user.email)
      .eq('purpose', 'login')
      .eq('used', false)

    const code = generateCode()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

    await adminClient.from('verification_codes').insert({
      email: user.email,
      code,
      purpose: 'login',
      expires_at: expiresAt,
    })

    await sendVerificationCode(user.email, code, 'login')

    const response = NextResponse.json({ maskedEmail: maskEmail(user.email) })
    response.cookies.set('pending_2fa', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600,
      path: '/',
    })
    return response
  } catch (err) {
    console.error('initiate-2fa error:', err)
    // If email sending fails, skip 2FA rather than blocking the user
    return NextResponse.json({ skip: true, emailError: true })
  }
}
