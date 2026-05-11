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

export function buildTheorySystemPrompt(pdfTexts: string[]): string {
  const context = pdfTexts.length > 0
    ? `להלן תוכן המצגות מהקורס:\n\n${pdfTexts.join('\n\n---\n\n')}`
    : 'אין עדיין חומרי לימוד מועלים. ענה על פי ידע כללי בתורת הבנייה.'

  return `אתה עוזר לימוד מקצועי לקורס תורת הבנייה באדריכלות.
ענה תמיד בעברית, בצורה ברורה ומקצועית.
${context}

כשאתה עונה על שאלה:
1. הסתמך קודם כל על החומרים מהמצגות
2. אם הנושא לא מופיע במצגות, ענה על פי ידע מקצועי אמין
3. ציין מהיכן לקחת את המידע (שם המצגה אם רלוונטי)
4. השתמש בדוגמאות מעשיות`
}

export function buildLegislationSystemPrompt(): string {
  return `אתה עוזר מקצועי לקורס תחיקת הבנייה באדריכלות.
ענה תמיד בעברית, בצורה מדויקת ומפורטת.

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
- עדכון אחרון: [תאריך אם ידוע]`
}
