import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { chatWithHistory } from '@/lib/claude'
import { buildTheorySystemPrompt } from '@/lib/question-engine'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { message, history } = await req.json()

    const { data: pdfs } = await supabase
      .from('pdfs')
      .select('title, extracted_text, semester')
      .eq('course', 'building_theory')
      .not('extracted_text', 'is', null)
      .neq('extracted_text', '')
      .order('uploaded_at', { ascending: false })
      .limit(30)

    const pdfTexts = pdfs?.map(p =>
      `מצגת: ${p.title} (סמסטר ${p.semester === 'A' ? 'א' : p.semester === 'B' ? 'ב' : 'שניהם'})\n${p.extracted_text?.slice(0, 5000)}`
    ) || []

    const systemPrompt = buildTheorySystemPrompt(pdfTexts)

    const historyMsgs = (history || []).slice(-8).map((m: { role: string; content: string }) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }))
    historyMsgs.push({ role: 'user' as const, content: message })

    const reply = await chatWithHistory(systemPrompt, historyMsgs)
    return NextResponse.json({ reply })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
