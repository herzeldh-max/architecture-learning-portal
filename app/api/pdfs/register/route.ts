import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase-server'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const adminClient = createAdminClient()
    const { data: profile } = await adminClient
      .from('user_profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Admin only' }, { status: 403 })

    const { storagePath, title, course, semester, fileSize } = await req.json()

    // הורדת הקובץ מ-Supabase לחילוץ טקסט
    let extractedText = ''
    try {
      const { data: fileData } = await adminClient.storage
        .from('pdfs')
        .download(storagePath)

      if (fileData) {
        const buffer = Buffer.from(await fileData.arrayBuffer())
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const pdfParse = require('pdf-parse')
        const parsed = await pdfParse(buffer)
        extractedText = (parsed.text || '').trim().slice(0, 50000)
      }
    } catch {
      // אם חילוץ טקסט נכשל -- ממשיכים בלי טקסט
    }

    const { data: pdfRecord, error: dbError } = await adminClient
      .from('pdfs')
      .insert({
        course,
        semester,
        title,
        storage_path: storagePath,
        extracted_text: extractedText,
        file_size: fileSize,
        uploaded_by: user.id,
      })
      .select('id')
      .single()

    if (dbError) {
      // אם DB נכשל -- מוחק את הקובץ מה-Storage
      await adminClient.storage.from('pdfs').remove([storagePath])
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
