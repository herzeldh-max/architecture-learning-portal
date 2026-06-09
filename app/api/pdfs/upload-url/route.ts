import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const adminClient = createAdminClient()
    const { data: profile } = await adminClient
      .from('user_profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Admin only' }, { status: 403 })

    const { course, semester, filename } = await req.json()
    const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_')
    const storagePath = `${course}/${semester}/${Date.now()}_${safeName}`

    const { data, error } = await adminClient.storage
      .from('pdfs')
      .createSignedUploadUrl(storagePath)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ signedUrl: data.signedUrl, storagePath })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
