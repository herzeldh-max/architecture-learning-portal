import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase-server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const adminClient = createAdminClient()
    const { data: profile } = await adminClient
      .from('user_profiles')
      .select('full_name, role')
      .eq('id', user.id)
      .single()

    return NextResponse.json({ email: user.email, full_name: profile?.full_name || '', role: profile?.role })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const { type, newValue } = await req.json()
    if (!type || !newValue?.trim()) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    const adminClient = createAdminClient()

    if (type === 'name') {
      const { error } = await adminClient
        .from('user_profiles')
        .update({ full_name: newValue.trim() })
        .eq('id', user.id)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    } else if (type === 'password') {
      if (newValue.length < 6) return NextResponse.json({ error: 'short' }, { status: 400 })
      const { error } = await adminClient.auth.admin.updateUserById(user.id, { password: newValue })
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    } else {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
