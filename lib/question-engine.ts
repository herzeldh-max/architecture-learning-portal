import crypto from 'crypto'

export function hashQuestion(question: string): string {
  return crypto.createHash('md5').update(question.trim().toLowerCase()).digest('hex')
}

export function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export interface MultipleChoiceQuestion {
  question: string
  choices: string[]
  correctIndex: number
  explanation: string
}

export interface OpenQuestion {
  question: string
  sampleAnswer: string
  keyPoints: string[]
}

export type ExamQuestion =
  | ({ type: 'multiple' } & MultipleChoiceQuestion)
  | ({ type: 'open' } & OpenQuestion)

export type Language = 'he' | 'ar'

export function buildTheorySystemPrompt(pdfTexts: string[], language: Language = 'he'): string {
  const context = pdfTexts.length > 0
    ? `להלן תוכן המצגות מהקורס:\n\n${pdfTexts.join('\n\n---\n\n')}`
    : 'אין עדיין חומרי לימוד מועלים. ענה על פי ידע כללי בתורת הבנייה.'

  const languageInstruction = language === 'ar'
    ? '\n\nחשוב מאוד: חומרי המקור (המצגות) כתובים בעברית, אך עליך לענות לסטודנט בשפה הערבית הספרותית (فصحى) בלבד - השאלה, ההסבר והדוגמאות. תרגם את המושגים המקצועיים מהחומר העברי לערבית בצורה מדויקת.'
    : ''

  return `אתה עוזר לימוד מקצועי לקורס תורת הבנייה באדריכלות.
ענה תמיד בעברית, בצורה ברורה ומקצועית.
${context}

כשאתה עונה על שאלה:
1. הסתמך קודם כל על החומרים מהמצגות
2. אם הנושא לא מופיע במצגות, ענה על פי ידע מקצועי אמין
3. ציין מהיכן לקחת את המידע (שם המצגה אם רלוונטי)
4. השתמש בדוגמאות מעשיות${languageInstruction}`
}

export function buildLegislationSystemPrompt(pdfTexts: string[] = [], language: Language = 'he'): string {
  const languageInstruction = language === 'ar'
    ? '\n\nחשוב מאוד: עליך לענות לסטודנט בשפה הערבית הספרותית (فصحى) בלבד - כולל הכותרות "תשובה" ו"מקור" שיש לתרגם ל"الإجابة" ו"المصدر". המקורות עצמם (שמות חוקים, אתרים) יכולים להישאר כפי שהם.'
    : ''

  const context = pdfTexts.length > 0
    ? `\n\nלהלן תוכן תקנים ומסמכים רשמיים שהועלו על ידי המרצה. הסתמך עליהם בעדיפות ראשונה כשהם רלוונטים לשאלה:\n\n${pdfTexts.join('\n\n---\n\n')}\n`
    : ''

  return `אתה עוזר מקצועי לקורס תחיקת הבנייה באדריכלות.
ענה תמיד בעברית, בצורה מדויקת ומפורטת.${context}

כשאתה עונה על שאלות בנושא תקנות תכנון ובנייה:
1. הצג את המידע העדכני ביותר
2. ציין בדיוק מאיזה מקור (אתר נבו, אתר הכנסת, משרד הפנים וכו')
3. ציין מספר חוק/תקנה/סעיף מדויק
4. אם יש שינויים אחרונים, ציין אותם
5. אל תנחש - אם אינך בטוח, אמור זאת

פורמט התשובה:
**תשובה:**
[תוכן מפורט]

**מקור:**
- אתר: [שם האתר + קישור]
- חוק/תקנה: [שם מדויק]
- סעיף: [מספר סעיף]
- עדכון אחרון: [תאריך אם ידוע]${languageInstruction}`
}
