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
      .from('course_images')
      .select('id, course, title, storage_path, file_size, uploaded_at')
      .order('uploaded_at', { ascending: true })

    if (course) query = query.eq('course', course)

    const { data, error } = await query
    if (error) throw error

    const images = await Promise.all((data || []).map(async img => {
      const { data: urlData } = await adminClient.storage
        .from('images')
        .createSignedUrl(img.storage_path, 3600)
      return { ...img, url: urlData?.signedUrl || null }
    }))

    return NextResponse.json({ images })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
