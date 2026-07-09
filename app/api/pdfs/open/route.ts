import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const id = new URL(req.url).searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    const adminClient = createAdminClient()
    const { data: pdf } = await adminClient
      .from('pdfs')
      .select('storage_path')
      .eq('id', id)
      .single()

    if (!pdf?.storage_path) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const { data, error } = await adminClient.storage
      .from('pdfs')
      .createSignedUrl(pdf.storage_path, 3600)

    if (error || !data?.signedUrl) return NextResponse.json({ error: 'Storage error' }, { status: 500 })

    return NextResponse.redirect(data.signedUrl)
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
