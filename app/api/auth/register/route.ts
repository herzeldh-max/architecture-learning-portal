import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  try {
    const { fullName, email, password } = await req.json()
    if (!fullName || !email || !password) {
      return NextResponse.json({ error: 'כל השדות נדרשים' }, { status: 400 })
    }

    const adminClient = createAdminClient()

    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (authError) {
      if (authError.message.includes('already registered')) {
        return NextResponse.json({ error: 'כתובת אימייל זו כבר רשומה במערכת' }, { status: 400 })
      }
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    const role = email === process.env.ADMIN_EMAIL ? 'admin' : 'student'

    const { error: profileError } = await adminClient
      .from('user_profiles')
      .insert({ id: authData.user.id, full_name: fullName, role })

    if (profileError) {
      await adminClient.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json({ error: 'שגיאה ביצירת הפרופיל' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'שגיאת שרת' }, { status: 500 })
  }
}
