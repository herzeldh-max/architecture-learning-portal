import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { chat } from '@/lib/claude'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { question, studentAnswer, sessionId, language } = await req.json()
    const lang: 'he' | 'ar' = language === 'ar' ? 'ar' : 'he'

    let score: 0 | 5 | 10
    let feedback: string
    let fullAnswer: string

    if (question.type === 'multiple') {
      const selectedChoice = studentAnswer
      const correctChoice = question.choices[question.correctIndex]
      const isCorrect = selectedChoice === correctChoice

      score = isCorrect ? 10 : 0
      if (lang === 'ar') {
        feedback = isCorrect
          ? `صحيح! ${question.explanation}`
          : `غير صحيح. لقد اخترت: "${selectedChoice}"`
        fullAnswer = isCorrect ? '' : `الإجابة الصحيحة: "${correctChoice}"\n\n${question.explanation}`
      } else {
        feedback = isCorrect
          ? `נכון! ${question.explanation}`
          : `לא נכון. בחרת: "${selectedChoice}"`
        fullAnswer = isCorrect ? '' : `התשובה הנכונה: "${correctChoice}"\n\n${question.explanation}`
      }
    } else {
      const languageInstruction = lang === 'ar'
        ? '\n\nחשוב: כתוב את ה-feedback וה-fullAnswer בשפה הערבית הספרותית (فصحى) בלבד, גם אם תשובת הסטודנט כתובה בעברית או בערבית.'
        : ''

      const prompt = `אתה מרצה לתורת הבנייה. הערך את תשובת הסטודנט.

שאלה: ${question.question}

תשובת מומחה לדוגמה: ${question.sampleAnswer}

נקודות מפתח שיש לכסות:
${question.keyPoints?.map((p: string, i: number) => `${i + 1}. ${p}`).join('\n')}

תשובת הסטודנט: ${studentAnswer || '(לא ענה)'}

הערך ותן ציון:
- 10: כיסה את כל הנקודות המרכזיות, תשובה מלאה ומדויקת
- 5: כיסה חלק מהנקודות, תשובה חלקית אך מראה הבנה
- 0: תשובה שגויה, חסרה לחלוטין, או לא ענה

החזר JSON בדיוק:
{
  "score": 0 | 5 | 10,
  "feedback": "משוב קצר ומפורט",
  "fullAnswer": "התשובה הנכונה המלאה"
}${languageInstruction}`

      const raw = await chat(
        'אתה מרצה מקצועי. תן הערכה הוגנת ומפורטת.',
        prompt
      )
      const jsonMatch = raw.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error('No JSON')
      const parsed = JSON.parse(jsonMatch[0])
      score = parsed.score
      feedback = parsed.feedback
      fullAnswer = parsed.fullAnswer
    }

    await supabase.from('exam_answers').insert({
      session_id: sessionId,
      user_id: user.id,
      question_text: question.question,
      question_type: question.type,
      choices: question.type === 'multiple' ? question.choices : null,
      correct_answer: question.type === 'multiple' ? question.choices[question.correctIndex] : question.sampleAnswer,
      student_answer: studentAnswer,
      score,
      feedback,
      full_correct_answer: fullAnswer || null,
    })

    return NextResponse.json({ score, feedback, fullAnswer })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Grading failed' }, { status: 500 })
  }
}
