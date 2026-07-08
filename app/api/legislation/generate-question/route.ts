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

    const { questionType, sessionId, isFirst, language } = await req.json()
    const lang: 'he' | 'ar' = language === 'ar' ? 'ar' : 'he'

    let currentSessionId = sessionId
    if (isFirst || !currentSessionId) {
      const { data: session } = await supabase
        .from('exam_sessions')
        .insert({ user_id: user.id, course: 'building_legislation', semester: 'both', question_type: questionType })
        .select('id')
        .single()
      currentSessionId = session?.id
    }

    const { data: pdfs } = await supabase
      .from('pdfs')
      .select('title, extracted_text')
      .eq('course', 'building_legislation')
      .not('extracted_text', 'is', null)
      .neq('extracted_text', '')
      .limit(20)

    const pdfContext = pdfs && pdfs.length > 0
      ? pdfs.map(p => `${p.title}:\n${p.extracted_text?.slice(0, 3000)}`).join('\n\n')
      : ''

    const { data: history } = await supabase
      .from('question_history')
      .select('question_hash, question_text')
      .eq('user_id', user.id)
      .eq('course', 'building_legislation')
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
      ? `\nשאלות שכבר נשאלו לסטודנט זה (אל תחזור עליהן):\n${recentQuestions.map(q => `- ${q}`).join('\n')}\n`
      : ''

    const languageInstruction = lang === 'ar'
      ? '\n\nחשוב מאוד: צור את השאלה, התשובות וההסבר בשפה הערבית הספרותית (فصحى) בלבד. תרגם את המושגים המשפטיים לערבית בצורה מדויקת.'
      : ''

    const pdfSection = pdfContext
      ? `\nמסמכי תחיקה מועלים:\n${pdfContext}\n`
      : '\n(אין מסמכים מועלים - השתמש בידע המקיף שלך על תחיקת הבנייה בישראל)\n'

    const topics = [
      'חוק התכנון והבנייה תשכ"ה-1965 - עקרונות כלליים',
      'היתר בנייה - תנאים, תהליך, ותוקף',
      'תוכניות מתאר - ארצית, מחוזית ומקומית',
      'ועדות תכנון ובנייה - מקומיות ומחוזיות',
      'עבירות בנייה, הריסה ואכיפה',
      'זכויות בנייה ושטחי בנייה מותרים',
      'קווי בנין ומרחקים חוקיים',
      'נגישות לנכים (תקן ישראלי 1918)',
      'בטיחות אש בבניינים - תקנות',
      'ממ"ד ומרחב מוגן - הנחיות פיקוד העורף',
      'תקנות חניה ושטחי ציבור',
      'בנייה ירוקה ותקנות אנרגיה',
      'חוק המקרקעין ורישום בטאבו',
      'תקנות הבנייה - אוורור, תאורה ותברואה',
      'הגשת תוכניות ואישורים נדרשים',
    ]

    const topicHint = topics[Math.floor(Math.random() * topics.length)]

    const systemPrompt = `אתה מרצה מומחה לתחיקת הבנייה הישראלית. צור שאלת ${actualType === 'multiple' ? 'אמריקאית (multiple choice)' : 'פתוחה'} מקצועית ומאתגרת על דיני תכנון ובנייה בישראל.
${pdfSection}
דרישות:
1. שאלה ברמת קושי בינונית-גבוהה, מבוססת על חוקים ותקנות אמיתיים
2. ${actualType === 'multiple' ? '4 תשובות אפשריות, רק אחת נכונה' : 'שאלה פתוחה שדורשת הסבר מעמיק'}
3. כלול הסבר/פתרון מפורט עם אזכור לחוק/תקנה הרלוונטיים
4. נושא מוצע לשאלה הפעם: ${topicHint}
${avoidList}
הנחיה: כבר שאלת ${usedCount} שאלות. צור שאלה חדשה לגמרי על נושא שונה או זווית שונה.${languageInstruction}`

    let prompt
    if (actualType === 'multiple') {
      prompt = `צור שאלה אמריקאית על תחיקת הבנייה. החזר JSON בדיוק:
{
  "question": "השאלה כאן",
  "choices": ["תשובה א", "תשובה ב", "תשובה ג", "תשובה ד"],
  "correctIndex": 0,
  "explanation": "הסבר מפורט מדוע התשובה נכונה, כולל אזכור לחוק/תקנה"
}`
    } else {
      prompt = `צור שאלה פתוחה על תחיקת הבנייה. החזר JSON בדיוק:
{
  "question": "השאלה כאן",
  "sampleAnswer": "תשובה לדוגמה מפורטת עם אזכורי חוק",
  "keyPoints": ["נקודת מפתח 1", "נקודת מפתח 2", "נקודת מפתח 3"]
}`
    }

    let parsed: { question: string; choices?: string[]; correctIndex?: number; explanation?: string; sampleAnswer?: string; keyPoints?: string[] } | null = null
    let qHash = ''
    const maxAttempts = 3
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const extra = attempt > 0 ? 'השאלה שיצרת בניסיון הקודם כבר נשאלה - צור שאלה שונה לחלוטין.' : undefined
      const raw = await chat(systemPrompt + (extra ? `\n${extra}` : ''), prompt)
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
      const shuffledIndices = shuffleArray([0, 1, 2, 3])
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
        { user_id: user.id, question_hash: qHash, question_text: parsed.question, course: 'building_legislation' },
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
        { user_id: user.id, question_hash: qHash, question_text: parsed.question, course: 'building_legislation' },
        { onConflict: 'user_id,question_hash', ignoreDuplicates: true }
      )

      return NextResponse.json({ question, sessionId: currentSessionId })
    }
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to generate question' }, { status: 500 })
  }
}
