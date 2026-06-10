import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { chat } from '@/lib/claude'
import { hashQuestion, shuffleArray } from '@/lib/question-engine'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { semester, questionType, sessionId, isFirst } = await req.json()

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
      .limit(30)

    const filteredPdfs = pdfs?.filter(p =>
      semester === 'both' || p.semester === semester || p.semester === 'both'
    ) || []

    if (filteredPdfs.length === 0) {
      return NextResponse.json({ error: 'no-materials', message: 'אין עדיין חומרי לימוד זמינים לסמסטר שנבחר. פנה למרצה להעלאת חומרים.' }, { status: 404 })
    }

    const pdfContext = filteredPdfs.map(p => `${p.title}:\n${p.extracted_text?.slice(0, 3000)}`).join('\n\n')

    const { data: usedHashes } = await supabase
      .from('question_history')
      .select('question_hash')
      .eq('user_id', user.id)
      .eq('course', 'building_theory')
      .limit(100)

    const usedCount = usedHashes?.length || 0

    const actualType = questionType === 'mixed'
      ? (Math.random() > 0.5 ? 'multiple' : 'open')
      : questionType

    const systemPrompt = `אתה מרצה מומחה לתורת הבנייה. צור שאלת ${actualType === 'multiple' ? 'אמריקאית (multiple choice)' : 'פתוחה'} מעניינת ומאתגרת על תורת הבנייה.

חומרי הקורס (זהו המקור היחיד המותר לשאלות):
${pdfContext}

דרישות:
1. השאלה תהיה ברמת קושי בינונית-גבוהה, מקצועית
2. השאלה והתשובה חייבות להתבסס אך ורק על הנושאים, המונחים והתכנים שמופיעים בחומרי הקורס שסופקו לעיל - אסור לשאול על נושאים, חומרים או נתונים שאינם מופיעים בחומרים הללו, גם אם הם נכונים מבחינה מקצועית כללית
3. ${actualType === 'multiple' ? '4 תשובות אפשריות, רק אחת נכונה' : 'שאלה פתוחה שדורשת הסבר מעמיק'}
4. כלול הסבר/פתרון מפורט, המתבסס על החומרים שסופקו

הנחיה: כבר שאלת ${usedCount} שאלות. צור שאלה על נושא שונה מהנושאים הקודמים, אך עדיין מתוך חומרי הקורס בלבד.`

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

    const raw = await chat(systemPrompt, prompt)
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON in response')

    const parsed = JSON.parse(jsonMatch[0])

    if (actualType === 'multiple') {
      const originalChoices = parsed.choices
      const originalCorrectIndex = parsed.correctIndex
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

      const qHash = hashQuestion(parsed.question)
      await supabase.from('question_history').upsert(
        { user_id: user.id, question_hash: qHash, course: 'building_theory' },
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

      const qHash = hashQuestion(parsed.question)
      await supabase.from('question_history').upsert(
        { user_id: user.id, question_hash: qHash, course: 'building_theory' },
        { onConflict: 'user_id,question_hash', ignoreDuplicates: true }
      )

      return NextResponse.json({ question, sessionId: currentSessionId })
    }
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to generate question' }, { status: 500 })
  }
}
