import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase-server'
import { anthropic, MODEL } from '@/lib/claude'

export const runtime = 'nodejs'
export const maxDuration = 120

async function extractPdfText(buffer: Buffer): Promise<string> {
  // שלב 1: נסה עם pdf-parse (מהיר, לא עולה כסף)
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require('pdf-parse')
    const data = await pdfParse(buffer)
    const text = (data.text || '').trim()
    if (text.length > 200) {
      return text.slice(0, 50000)
    }
  } catch {
    // ממשיך לשלב הבא
  }

  // שלב 2: fallback - שלח ל-Claude Vision לחילוץ טקסט מ-PDF כתמונה
  // (עובד גם על מצגות שהן תמונות בלבד)
  try {
    if (buffer.length > 20 * 1024 * 1024) {
      // קובץ גדול מ-20MB - לא שולחים ל-Claude
      return ''
    }
    const base64 = buffer.toString('base64')
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'document',
            source: {
              type: 'base64',
              media_type: 'application/pdf',
              data: base64,
            },
          } as never,
          {
            type: 'text',
            text: 'חלץ את כל הטקסט מהמצגת/המסמך הזה. כלול כותרות, תוכן שקפים, טבלאות ורשימות. החזר טקסט נקי ומסודר בעברית.',
          },
        ],
      }],
    })
    const block = response.content[0]
    return block.type === 'text' ? block.text.slice(0, 50000) : ''
  } catch {
    return ''
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const adminClient = createAdminClient()
    const { data: profile } = await adminClient
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
