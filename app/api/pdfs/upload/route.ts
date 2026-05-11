import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase-server'

export const runtime = 'nodejs'
export const maxDuration = 60

async function extractPdfText(buffer: Buffer): Promise<string> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require('pdf-parse')
    const data = await pdfParse(buffer)
    return data.text.slice(0, 50000)
  } catch {
    return ''
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin only' }, { status: 403 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    const title = formData.get('title') as string
    const course = formData.get('course') as string
    const semester = formData.get('semester') as string

    if (!file || !title || !course) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const adminClient = createAdminClient()
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const fileName = `${course}/${semester}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`

    const { error: uploadError } = await adminClient.storage
      .from('pdfs')
      .upload(fileName, buffer, { contentType: 'application/pdf', upsert: false })

    if (uploadError) {
      return NextResponse.json({ error: `Upload failed: ${uploadError.message}` }, { status: 500 })
    }

    const extractedText = await extractPdfText(buffer)

    const { data: pdfRecord, error: dbError } = await adminClient
      .from('pdfs')
      .insert({
        course,
        semester,
        title,
        storage_path: fileName,
        extracted_text: extractedText,
        file_size: buffer.length,
        uploaded_by: user.id,
      })
      .select('id')
      .single()

    if (dbError) {
      await adminClient.storage.from('pdfs').remove([fileName])
      return NextResponse.json({ error: 'DB insert failed' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      id: pdfRecord?.id,
      textLength: extractedText.length,
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
