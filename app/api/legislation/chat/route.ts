import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { chat } from '@/lib/claude'
import { buildLegislationSystemPrompt } from '@/lib/question-engine'

async function searchTavily(query: string): Promise<string> {
  const apiKey = process.env.TAVILY_API_KEY
  if (!apiKey || apiKey === 'your_tavily_api_key_here') {
    return ''
  }

  try {
    const res = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: apiKey,
        query: `${query} תכנון ובנייה ישראל חוק תקנות`,
        search_depth: 'advanced',
        include_domains: ['nevo.co.il', 'knesset.gov.il', 'gov.il', 'moin.gov.il', 'moch.gov.il'],
        max_results: 5,
        include_answer: true,
      }),
    })

    if (!res.ok) return ''
    const data = await res.json()

    const results = data.results?.map((r: { title: string; url: string; content: string }) =>
      `**מקור:** ${r.title}\n**קישור:** ${r.url}\n**תוכן:** ${r.content?.slice(0, 1000)}`
    ).join('\n\n---\n\n') || ''

    return results
  } catch {
    return ''
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { message, language } = await req.json()

    const searchResults = await searchTavily(message)

    const systemPrompt = buildLegislationSystemPrompt(language === 'ar' ? 'ar' : 'he')

    const userContent = searchResults
      ? `שאלה: ${message}\n\nתוצאות חיפוש ממקורות רשמיים:\n${searchResults}\n\nענה על השאלה על פי המקורות הנ"ל. אם המידע לא מספיק, ציין זאת.`
      : `שאלה: ${message}\n\nשים לב: אין תוצאות חיפוש זמינות. ענה על פי ידע כללי מאומת, וציין שהמידע יש לאמת במקורות רשמיים.`

    const reply = await chat(systemPrompt, userContent)
    return NextResponse.json({ reply })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
