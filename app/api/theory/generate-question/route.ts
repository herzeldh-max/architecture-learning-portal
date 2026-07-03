import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { chat } from '@/lib/claude'
import { hashQuestion, shuffleArray } from '@/lib/question-engine'

export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { semester, questionType, sessionId, isFirst, language } = await req.json()
    const lang: 'he' | 'ar' = language === 'ar' ? 'ar' : 'he'

    let currentSessionId = sessionId
    if (isFirst || !currentSessionId) {
      const { data: session } = await supabase
        .from('exam_sessions')
        .insert({ user_id: user.id, course: 'building_theory', semester, question_type: questionType })
        .select('id')
        .single()
      currentSessionId = session?.id
    }

    const { data: pdfs } = await supabase
      .from('pdfs')
      .select('title, extracted_text, semester')
      .eq('course', 'building_theory')
      .not('extracted_text', 'is', null)
      .neq('extracted_text', '')
      .limit(15)

    const filteredPdfs = pdfs?.filter(p =>
      semester === 'both' || p.semester === semester || p.semester === 'both'
    ) || []

    if (filteredPdfs.length === 0) {
      const message = lang === 'ar'
        ? 'لا توجد مواد تعليمية متاحة للفصل الدراسي المحدد حاليًا. يرجى التواصل مع المحاضر لرفع المواد.'
        : 'אין עדיין חומרי לימוד זמינים לסמסטר שנבחר. פנה למרצה להעלאת חומרים.'
      return NextResponse.json({ error: 'no-materials', message }, { status: 404 })
    }

    const pdfContext = filteredPdfs.map(p => `${p.title}:\n${p.extracted_text?.slice(0, 2000)}`).join('\n\n')

    const { data: history } = await supabase
      .from('question_history')
      .select('question_hash, question_text')
      .eq('user_id', user.id)
      .eq('course', 'building_theory')
      .order('created_at', { ascending: false })
      .limit(200)

    const usedHashes = new Set((history || []).map(h => h.question_hash))
    const usedCount = usedHashes.size
    const recentQuestions = (history || [])
      .map(h => h.question_text)
      .filter((t): t is string => !!t)
      .slice(0, 40)

    const actualType = questionType === 'mixed'
      ? (Math.random() > 0.5 ? 'multiple' : 'open')
      : questionType

    const avoidList = recentQuestions.length > 0
      ? `\nשאלות שכבר נשאלו לסטודנט זה (אל תחזור עליהן ואל תיצור וריאציה קרובה אליהן):\n${recentQuestions.map(q => `- ${q}`).join('\n')}\n`
      : ''

    const languageInstruction = lang === 'ar'
      ? '\n\nחשוב מאוד: חומרי הקורס לעיל כתובים בעברית, אך עליך ליצור את השאלה, התשובות וההסבר בשפה הערבית הספרותית (فصحى) בלבד. תרגם את המושגים המקצועיים מהחומר העברי לערבית בצורה מדויקת ומקצועית.'
      : ''

    const buildSystemPrompt = (extra?: string) => `אתה מרצה מומחה לתורת הבנייה. צור שאלת ${actualType === 'multiple' ? 'אמריקאית (multiple choice)' : 'פתוחה'} מעניינת ומאתגרת על תורת הבנייה.

חומרי הקורס (זהו המקור היחיד המותר לשאלות):
${pdfContext}

דרישות:
1. השאלה תהיה ברמת קושי בינונית-גבוהה, מקצועית
2. השאלה והתשובה חייבות להתבסס אך ורק על הנושאים, המונחים והתכנים שמופיעים בחומרי הקורס שסופקו לעיל - אסור לשאול על נושאים, חומרים או נתונים שאינם מופיעים בחומרים הללו, גם אם הם נכונים מבחינה מקצועית כללית
3. ${actualType === 'multiple' ? '4 תשובות אפשריות, רק אחת נכונה' : 'שאלה פתוחה שדורשת הסבר מעמיק'}
4. כלול הסבר/פתרון מפורט, המתבסס על החומרים שסופקו
${avoidList}
הנחיה: כבר שאלת ${usedCount} שאלות. צור שאלה חדשה לגמרי, על נושא, היבט או זווית שונים מהשאלות שכבר נשאלו, אך עדיין מתוך חומרי הקורס בלבד. הקורס מכיל מגוון רחב של נושאים, פרקים, הגדרות, חישובים ודוגמאות - חפש זוויות חדשות (הגדרה, יישום, השוואה, חישוב, יתרון/חיסרון וכו') כדי למנוע חזרה.${languageInstruction}${extra ? `\n${extra}` : ''}`

    let prompt
    if (actualType === 'multiple') {
      prompt = `צור שאלה אמריקאית. החזר JSON בדיוק בפורמט הזה:
{
  "question": "השאלה כאן",
  "choices": ["תשובה א", "תשובה ב", "תשובה ג", "תשובה ד"],
  "correctIndex": 0,
  "explanation": "הסבר מפורט מדוע התשובה נכונה"
}
שים לב: correctIndex הוא index של התשובה הנכונה ב-choices (0-3)`
    } else {
      prompt = `צור שאלה פתוחה. החזר JSON בדיוק בפורמט הזה:
{
  "question": "השאלה כאן",
  "sampleAnswer": "תשובה לדוגמה מפורטת",
  "keyPoints": ["נקודת מפתח 1", "נקודת מפתח 2", "נקודת מפתח 3"]
}`
    }

    let parsed: { question: string; choices?: string[]; correctIndex?: number; explanation?: string; sampleAnswer?: string; keyPoints?: string[] } | null = null
    let qHash = ''
    const maxAttempts = 3
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const extra = attempt > 0 ? 'השאלה שיצרת בניסיון הקודם כבר נשאלה בעבר - צור שאלה שונה לחלוטין.' : undefined
      const raw = await chat(buildSystemPrompt(extra), prompt)
      const jsonMatch = raw.match(/\{[\s\S]*\}/)
      if (!jsonMatch) continue
      const candidate = JSON.parse(jsonMatch[0])
      const candidateHash = hashQuestion(candidate.question)
      if (!usedHashes.has(candidateHash)) {
        parsed = candidate
        qHash = candidateHash
        break
      }
      parsed = candidate
      qHash = candidateHash
    }
    if (!parsed) throw new Error('No JSON in response')

    if (actualType === 'multiple') {
      const originalChoices = parsed.choices!
      const originalCorrectIndex = parsed.correctIndex!
      const correctAnswer = originalChoices[originalCorrectIndex]

      const indices = [0, 1, 2, 3]
      const shuffledIndices = shuffleArray(indices)
      const shuffledChoices = shuffledIndices.map(i => originalChoices[i])
      const newCorrectIndex = shuffledChoices.indexOf(correctAnswer)

      const question = {
        type: 'multiple',
        question: parsed.question,
        choices: shuffledChoices,
        correctIndex: newCorrectIndex,
        explanation: parsed.explanation,
      }

      await supabase.from('question_history').upsert(
        { user_id: user.id, question_hash: qHash, question_text: parsed.question, course: 'building_theory' },
        { onConflict: 'user_id,question_hash', ignoreDuplicates: true }
      )

      return NextResponse.json({ question, sessionId: currentSessionId })
    } else {
      const question = {
        type: 'open',
        question: parsed.question,
        sampleAnswer: parsed.sampleAnswer,
        keyPoints: parsed.keyPoints || [],
      }

      await supabase.from('question_history').upsert(
        { user_id: user.id, question_hash: qHash, question_text: parsed.question, course: 'building_theory' },
        { onConflict: 'user_id,question_hash', ignoreDuplicates: true }
      )

      return NextResponse.json({ question, sessionId: currentSessionId })
    }
  } catch (e) {
    console.error(e)
    const msg = String(e)
    if (msg.includes('credit') || msg.includes('balance') || msg.includes('quota')) {
      return NextResponse.json({ error: 'service-unavailable', message: 'שירות ה-AI אינו זמין כרגע עקב מגבלת שימוש. אנא פנה למרצה.' }, { status: 503 })
    }
    return NextResponse.json({ error: 'Failed to generate question' }, { status: 500 })
  }
}
