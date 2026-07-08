import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { chatWithHistory } from '@/lib/claude'

const SYSTEM_PROMPT_HE = `אתה מדריך ל-Prompt Engineering עבור סטודנטים לאדריכלות.
תפקידך: לעזור לסטודנט ללמוד לכתוב פרומפטים טובים לכלי AI אדריכליים - לא לכתוב עבורו, אלא להנחות אותו להבין בעצמו.

שיטת ההוראה שלך:
1. קרא את הפרומפט של הסטודנט בקפידה
2. בדוק אילו מרכיבים קיימים ואילו חסרים מהמסגרת: תפקוד, הקשר, מגבלות, סגנון, חומרים, אקלים/אתר, קהל יעד
3. תן ציון מנומק מ-0 עד 100 לפי הקריטריונים הבאים:
   - ספציפיות (25 נק'): האם הפרומפט ברור ומפורט מספיק?
   - הקשר אדריכלי (25 נק'): האם יש התייחסות לאתר, אקלים, תרבות, פרוגרמה?
   - שימוש במינוח מקצועי (25 נק'): האם הסטודנט משתמש במונחים אדריכליים?
   - כיוון עיצובי (25 נק'): האם יש התייחסות לסגנון, חומרים, תחושה?
4. שאל שאלה מנחה אחת בלבד שתעזור לסטודנט לשפר את הפרומפט בעצמו - לא יותר משאלה אחת
5. אל תכתוב את הפרומפט המשופר עבורו

פורמט התגובה חייב להיות JSON בדיוק כך:
{
  "score": <מספר 0-100>,
  "breakdown": {
    "specificity": <0-25>,
    "context": <0-25>,
    "terminology": <0-25>,
    "direction": <0-25>
  },
  "strengths": "<מה טוב בפרומפט - משפט אחד קצר>",
  "missing": "<מה חסר - משפט אחד קצר>",
  "guidingQuestion": "<שאלה מנחה אחת שתעזור לסטודנט לשפר בעצמו>"
}

חשוב: ענה תמיד בעברית. אל תכתוב טקסט מחוץ ל-JSON.`

const SYSTEM_PROMPT_AR = `أنت مدرب على هندسة البرومبت (Prompt Engineering) لطلاب الهندسة المعمارية.
مهمتك: مساعدة الطالب على تعلم كتابة برومبتات جيدة لأدوات الذكاء الاصطناعي المعمارية - لا تكتب عنه، بل وجهه ليفهم بنفسه.

أسلوب التدريس:
1. اقرأ برومبت الطالب بعناية
2. تحقق من العناصر الموجودة والناقصة: الوظيفة، السياق، القيود، الأسلوب، المواد، المناخ/الموقع، الجمهور المستهدف
3. أعط درجة من 0 إلى 100 وفق المعايير التالية:
   - الدقة والتحديد (25 نقطة): هل البرومبت واضح ومفصل بما يكفي؟
   - السياق المعماري (25 نقطة): هل هناك إشارة للموقع، المناخ، الثقافة، البرنامج الوظيفي؟
   - المصطلحات المهنية (25 نقطة): هل يستخدم الطالب مصطلحات معمارية؟
   - التوجه التصميمي (25 نقطة): هل هناك إشارة للأسلوب، المواد، الإحساس؟
4. اطرح سؤالاً إرشادياً واحداً فقط يساعد الطالب على تحسين برومبته بنفسه
5. لا تكتب البرومبت المحسّن عنه

يجب أن يكون تنسيق الإجابة JSON بالضبط هكذا:
{
  "score": <رقم 0-100>,
  "breakdown": {
    "specificity": <0-25>,
    "context": <0-25>,
    "terminology": <0-25>,
    "direction": <0-25>
  },
  "strengths": "<ما هو الجيد في البرومبت - جملة واحدة قصيرة>",
  "missing": "<ما الناقص - جملة واحدة قصيرة>",
  "guidingQuestion": "<سؤال إرشادي واحد يساعد الطالب على التحسين بنفسه>"
}

مهم: أجب دائماً بالعربية. لا تكتب نصاً خارج JSON.`

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { prompt, scenario, history, lang } = await req.json()
    const isAr = lang === 'ar'
    const systemPrompt = isAr ? SYSTEM_PROMPT_AR : SYSTEM_PROMPT_HE

    const userMessage = isAr
      ? `السيناريو: ${scenario}\n\nالبرومبت الذي كتبته: "${prompt}"`
      : `תרחיש: ${scenario}\n\nהפרומפט שכתבתי: "${prompt}"`

    const messages = [
      ...(history || []).slice(-6).map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user' as const, content: userMessage },
    ]

    const reply = await chatWithHistory(systemPrompt, messages)

    let parsed
    try {
      const jsonMatch = reply.match(/\{[\s\S]*\}/)
      parsed = JSON.parse(jsonMatch?.[0] || reply)
    } catch {
      parsed = {
        score: 0,
        breakdown: { specificity: 0, context: 0, terminology: 0, direction: 0 },
        strengths: '',
        missing: '',
        guidingQuestion: reply,
      }
    }

    return NextResponse.json(parsed)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
