import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const course = searchParams.get('course')

    const adminClient = createAdminClient()
    let query = adminClient
      .from('pdfs')
      .select('id, course, semester, title, file_size, uploaded_at, extracted_text')
      .order('uploaded_at', { ascending: false })

    if (course) query = query.eq('course', course)

    const { data, error } = await query
    if (error) throw error

    const pdfs = data?.map(p => ({
      ...p,
      hasText: !!p.extracted_text && p.extracted_text.length > 0,
      extracted_text: undefined,
    }))

    return NextResponse.json({ pdfs })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
