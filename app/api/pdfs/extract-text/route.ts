import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase-server'
import { anthropic, MODEL } from '@/lib/claude'

export const runtime = 'nodejs'
export const maxDuration = 120

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const adminClient = createAdminClient()
    const { data: profile } = await adminClient
      .from('user_profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Admin only' }, { status: 403 })

    const { id } = await req.json()

    // שלב 1: קבלת נתיב האחסון מה-DB
    const { data: pdf, error: fetchError } = await adminClient
      .from('pdfs').select('id, storage_path, title').eq('id', id).single()
    if (fetchError || !pdf) return NextResponse.json({ error: 'PDF not found' }, { status: 404 })

    // שלב 2: הורדת הקובץ מ-Supabase Storage
    const { data: fileData, error: downloadError } = await adminClient.storage
      .from('pdfs').download(pdf.storage_path)
    if (downloadError || !fileData) {
      return NextResponse.json({ error: 'Failed to download file' }, { status: 500 })
    }

    const buffer = Buffer.from(await fileData.arrayBuffer())

    // שלב 3: שליחה ל-Claude Vision לחילוץ טקסט
    let extractedText = ''
    try {
      if (buffer.length > 20 * 1024 * 1024) {
        return NextResponse.json({ error: 'הקובץ גדול מדי לחילוץ OCR (מעל 20MB)' }, { status: 400 })
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
              text: 'חלץ את כל הטקסט מהמצגת הזו. כלול כותרות, תוכן שקפים, טבלאות ורשימות. החזר טקסט נקי ומסודר.',
            },
          ],
        }],
      })
      const block = response.content[0]
      extractedText = block.type === 'text' ? block.text.slice(0, 50000) : ''
    } catch (e) {
      console.error('Claude OCR error:', e)
      const msg = String(e)
      if (msg.includes('credit') || msg.includes('balance') || msg.includes('quota') || msg.includes('billing')) {
        return NextResponse.json({ error: 'אין קרדיטים ב-Anthropic API. יש להוסיף תקציב בכתובת console.anthropic.com ← Plans & Billing' }, { status: 503 })
      }
      if (msg.includes('timeout') || msg.includes('timed out')) {
        return NextResponse.json({ error: 'הקובץ גדול מדי — הבקשה פגה. נסה קובץ קטן יותר' }, { status: 408 })
      }
      return NextResponse.json({ error: `שגיאה בחילוץ טקסט: ${msg.slice(0, 120)}` }, { status: 500 })
    }

    if (!extractedText || extractedText.length < 50) {
      return NextResponse.json({ error: 'לא נמצא טקסט בקובץ גם לאחר OCR' }, { status: 422 })
    }

    // שלב 4: עדכון ה-DB
    const { error: updateError } = await adminClient
      .from('pdfs')
      .update({ extracted_text: extractedText })
      .eq('id', id)

    if (updateError) return NextResponse.json({ error: 'DB update failed' }, { status: 500 })

    return NextResponse.json({ success: true, textLength: extractedText.length })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
