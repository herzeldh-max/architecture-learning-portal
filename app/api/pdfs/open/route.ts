import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return new NextResponse('Unauthorized', { status: 401 })

    const id = new URL(req.url).searchParams.get('id')
    if (!id) return new NextResponse('Missing id', { status: 400 })

    const adminClient = createAdminClient()
    const { data: pdf } = await adminClient
      .from('pdfs')
      .select('storage_path')
      .eq('id', id)
      .single()

    if (!pdf?.storage_path) return new NextResponse('Not found', { status: 404 })

    const { data: urlData, error } = await adminClient.storage
      .from('pdfs')
      .createSignedUrl(pdf.storage_path, 600)

    if (error || !urlData?.signedUrl) return new NextResponse('Storage error', { status: 500 })

    const pdfRes = await fetch(urlData.signedUrl)
    if (!pdfRes.ok) return new NextResponse('Failed to fetch PDF', { status: 502 })

    const body = await pdfRes.arrayBuffer()

    return new NextResponse(body, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline',
        'Cache-Control': 'no-store, no-cache',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch {
    return new NextResponse('Server error', { status: 500 })
  }
}
