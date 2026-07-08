'use client'

import { useState, useRef, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

type Lang = 'he' | 'ar'

interface Exercise {
  id: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  icon: string
  he: { title: string; scenario: string; tips: string[] }
  ar: { title: string; scenario: string; tips: string[] }
}

const EXERCISES: Exercise[] = [
  {
    id: 1, difficulty: 'beginner', icon: '🏠',
    he: { title: 'בית מגורים פרטי', scenario: 'לקוח מבקש לבנות בית פרטי לזוג עם שני ילדים באזור הנגב. התקציב בינוני.', tips: ['ציין את מספר החדרים הרצוי', 'התייחס לאקלים הנגבי (חום, קור לילי, רוחות)', 'ציין חומרים מקומיים אפשריים'] },
    ar: { title: 'بيت سكني خاص', scenario: 'عميل يطلب بناء منزل خاص لزوجين مع طفلين في منطقة النقب. الميزانية متوسطة.', tips: ['حدد عدد الغرف المطلوبة', 'تحدث عن مناخ النقب (الحر، برودة الليل، الرياح)', 'اذكر المواد المحلية الممكنة'] },
  },
  {
    id: 2, difficulty: 'beginner', icon: '🎨',
    he: { title: 'גן ילדים', scenario: 'עיריית נצרת מבקשת גן ילדים חדש לגיל 3-6. תפוסה מקסימלית 60 ילדים, מגרש 800 מ"ר.', tips: ['חשוב על בטיחות וסקאלה', 'אור טבעי וצל מספיק', 'חלל חיצוני ופנימי מקושרים'] },
    ar: { title: 'روضة أطفال', scenario: 'بلدية الناصرة تطلب روضة أطفال جديدة للأعمار 3-6 سنوات. الطاقة 60 طفلاً، المساحة 800 م².', tips: ['فكر في الأمان والمقياس البشري', 'الإضاءة الطبيعية والظل الكافي', 'ربط الفراغ الداخلي بالخارجي'] },
  },
  {
    id: 3, difficulty: 'beginner', icon: '🏪',
    he: { title: 'חנות מקומית', scenario: 'בעל עסק רוצה לשפץ חנות מכולת ישנה של 80 מ"ר במרכז עיר מעורבת. רצון לשמר אופי מקומי.', tips: ['חזית מזמינה', 'פנים פונקציונלי', 'חומרים מקומיים'] },
    ar: { title: 'محل تجاري محلي', scenario: 'صاحب عمل يريد تجديد بقالة قديمة 80 م² في مركز مدينة مختلطة. الرغبة في الحفاظ على الطابع المحلي.', tips: ['واجهة جذابة', 'داخلية وظيفية', 'مواد محلية'] },
  },
  {
    id: 4, difficulty: 'beginner', icon: '🌿',
    he: { title: 'פינת ישיבה בגינה', scenario: 'בעל בית פרטי מבקש לעצב פינת ישיבה מקורה בחצר 50 מ"ר בחיפה. שימוש: משפחתי ואירוח.', tips: ['צל ואוורור', 'חיבור לגינה', 'ריהוט מוגן גשם'] },
    ar: { title: 'ركن جلوس في الحديقة', scenario: 'صاحب منزل يطلب تصميم ركن جلوس مسقوف في حديقة 50 م² في حيفا. الاستخدام: عائلي واجتماعي.', tips: ['الظل والتهوية', 'الربط بالحديقة', 'أثاث مقاوم للمطر'] },
  },
  {
    id: 5, difficulty: 'beginner', icon: '🎭',
    he: { title: 'סטודיו לאמנות', scenario: 'אמנית מקומית מחפשת עיצוב לסטודיו עבודה קטן של 40 מ"ר בדירת קרקע בתל אביב. דרישה: אור צפוני מקסימלי.', tips: ['אור טבעי איכותי', 'אחסון לחומרי עבודה', 'רצפה עמידה'] },
    ar: { title: 'استوديو فني', scenario: 'فنانة محلية تبحث عن تصميم لاستوديو عمل صغير 40 م² في شقة أرضية بتل أبيب. المطلب: ضوء شمالي أقصى.', tips: ['إضاءة طبيعية عالية الجودة', 'تخزين لمواد العمل', 'أرضية متينة'] },
  },
  {
    id: 6, difficulty: 'intermediate', icon: '📚',
    he: { title: 'ספריית שכונה', scenario: 'עיריית תל אביב מבקשת ספריית שכונה ב-400 מ"ר באזור מגורים צפוף. קהל: כל הגילאים כולל קשישים וילדים.', tips: ['נגישות מלאה לכולם', 'אקוסטיקה ואור טבעי', 'אזורים נפרדים לגילאים שונים'] },
    ar: { title: 'مكتبة حي', scenario: 'بلدية تل أبيب تطلب مكتبة حي 400 م² في منطقة سكنية كثيفة. الجمهور: جميع الأعمار بمن فيهم المسنون والأطفال.', tips: ['إمكانية وصول كاملة للجميع', 'العزل الصوتي والإضاءة الطبيعية', 'مناطق منفصلة حسب الأعمار'] },
  },
  {
    id: 7, difficulty: 'intermediate', icon: '🤝',
    he: { title: 'מרכז קהילתי מעורב', scenario: 'עיר מעורבת יהודית-ערבית בגליל מבקשת מרכז קהילתי 1,200 מ"ר המשרת שתי קהילות. תקציב מוגבל.', tips: ['כיצד לשרת שתי תרבויות?', 'חלל גמיש לאירועים שונים', 'סמליות ניטרלית ומכילה'] },
    ar: { title: 'مركز مجتمعي مشترك', scenario: 'مدينة يهودية-عربية مختلطة في الجليل تطلب مركزاً مجتمعياً 1200 م² يخدم المجتمعين. الميزانية محدودة.', tips: ['كيف تخدم ثقافتين؟', 'فراغ مرن لأنشطة متنوعة', 'رمزية محايدة وشاملة'] },
  },
  {
    id: 8, difficulty: 'intermediate', icon: '🍽️',
    he: { title: 'מסעדה בנוף טבעי', scenario: 'יזם מבקש מסעדה בת 120 כסאות על צוק עם נוף לים בצפון הכרמל. דרישה: חיבור מקסימלי לנוף.', tips: ['גלאזינג מקסימלי לנוף', 'כיוון ישיבה וחוויה', 'השפעה מינימלית על הצוק'] },
    ar: { title: 'مطعم في محيط طبيعي', scenario: 'مستثمر يطلب مطعماً بـ 120 مقعداً على منحدر صخري مطل على البحر في شمال الكرمل. المطلب: أقصى اتصال بالمنظر.', tips: ['تكبير مساحة الزجاج للمنظر', 'توجيه الجلوس والتجربة', 'تأثير أدنى على الصخر'] },
  },
  {
    id: 9, difficulty: 'intermediate', icon: '🕌',
    he: { title: 'בית תפילה', scenario: 'קהילה מקומית בעיר מעורבת מחפשת עיצוב לבית תפילה של 200 מ"ר. נדרש כבוד לסביבה הבנויה הקיימת.', tips: ['כיוון ושפת חלל', 'אור מסקרן ורוחני', 'פינת קבלת קהל'] },
    ar: { title: 'بيت عبادة', scenario: 'مجتمع محلي في مدينة مختلطة يبحث عن تصميم لبيت عبادة 200 م². مطلوب احترام البيئة المبنية القائمة.', tips: ['الاتجاه ولغة الفراغ', 'الإضاءة الروحانية', 'ساحة استقبال'] },
  },
  {
    id: 10, difficulty: 'intermediate', icon: '🏢',
    he: { title: 'משרד בניין היסטורי', scenario: 'חברת הייטק רוצה להתמקם בבניין מגורים מ-1935 בחיפה התחתית. 600 מ"ר בשלוש קומות. שיפוץ נדרש.', tips: ['שמירה על פסיפס ואלמנטים מקוריים', 'תשתיות מודרניות בתוך ישן', 'גמישות מרחבית לצמיחה'] },
    ar: { title: 'مكتب في مبنى تاريخي', scenario: 'شركة تقنية تريد الاستقرار في مبنى سكني من 1935 في حيفا السفلى. 600 م² على ثلاثة طوابق. تجديد مطلوب.', tips: ['الحفاظ على الفسيفساء والعناصر الأصلية', 'بنية تحتية حديثة داخل القديم', 'مرونة مكانية للنمو'] },
  },
  {
    id: 11, difficulty: 'advanced', icon: '🌱',
    he: { title: 'שכונת מגורים בת-קיימא', scenario: 'חברה יזמית מתכננת שכונה חדשה ל-500 יחידות דיור בדרום ישראל. דרישה: אפס פחמן עד 2035, מחירים נגישים.', tips: ['אנרגיה מתחדשת בקנה מידה שכונתי', 'קהילה לא רק בניינים', 'כיצד לפצות בין עלות לקיימות'] },
    ar: { title: 'حي سكني مستدام', scenario: 'شركة مطورة تخطط لحي جديد لـ 500 وحدة سكنية في جنوب إسرائيل. المطلب: صافي كربون صفري بحلول 2035 وأسعار ميسورة.', tips: ['طاقة متجددة على مستوى الحي', 'مجتمع لا مباني فقط', 'كيف توازن بين التكلفة والاستدامة'] },
  },
  {
    id: 12, difficulty: 'advanced', icon: '🏛️',
    he: { title: 'שיפוץ ושימור מנדטורי', scenario: 'בניין מגורים בינלאומי מ-1935 בתל אביב (רשימת שימור א\'). נדרש לשפץ ל-12 יח"ד מודרניות תוך שימור מלא של החזית.', tips: ['מה שומרים, מה מחדשים?', 'תקנות רשות שימור', 'שכבת זמן וחדשנות'] },
    ar: { title: 'ترميم وصون مبنى انتدابي', scenario: 'مبنى سكني دولي من 1935 في تل أبيب (قائمة الصون أ). مطلوب تجديده لـ 12 وحدة سكنية حديثة مع الحفاظ الكامل على الواجهة.', tips: ['ما الذي تحافظ عليه وما الذي تجدده؟', 'لوائح هيئة الصون', 'طبقة الزمن والابتكار'] },
  },
  {
    id: 13, difficulty: 'advanced', icon: '🏺',
    he: { title: 'מוזיאון אדריכלות', scenario: 'עיריית ירושלים מזמינה תחרות לעיצוב מוזיאון אדריכלות ישראלית. שטח: 3,500 מ"ר לצד הבניין הלאומי. דרישה: דיאלוג עם ההיסטוריה.', tips: ['כיצד מוזיאון מדבר על עצמו?', 'רצף חוויתי ומרחבי', 'חומריות ירושלמית'] },
    ar: { title: 'متحف معماري', scenario: 'بلدية القدس تدعو لمسابقة لتصميم متحف للعمارة الإسرائيلية. المساحة: 3500 م² بجانب المبنى الوطني. المطلب: حوار مع التاريخ.', tips: ['كيف يتحدث المتحف عن نفسه؟', 'التسلسل التجريبي والمكاني', 'مواد القدس وروحها'] },
  },
  {
    id: 14, difficulty: 'advanced', icon: '🎓',
    he: { title: 'קמפוס אוניברסיטאי', scenario: 'אוניברסיטה מבקשת לתכנן קמפוס חדש ל-5,000 סטודנטים בגליל. דרישות: חדשנות, קיימות, שילוב בנוף, מגורי סטודנטים ופקולטות.', tips: ['כיצד קמפוס בונה קהילה?', 'ציר הולכי רגל', 'זהות ויזואלית אחידה'] },
    ar: { title: 'حرم جامعي', scenario: 'جامعة تطلب التخطيط لحرم جامعي جديد لـ 5000 طالب في الجليل. المتطلبات: الابتكار والاستدامة والاندماج في المشهد الطبيعي.', tips: ['كيف يبني الحرم مجتمعاً؟', 'محور المشاة', 'هوية بصرية موحدة'] },
  },
  {
    id: 15, difficulty: 'advanced', icon: '🏥',
    he: { title: 'מרכז רפואי קהילתי', scenario: 'רשות בריאות מבקשת מרכז רפואי קהילתי ב-2,000 מ"ר בעיר מעורבת. שירות: רופאים, מרפאות, בריאות הנפש, חדר שעת חירום.', tips: ['זרימת חולים ושמירת פרטיות', 'הפחתת סטרס בעיצוב', 'נגישות לכל אוכלוסייה'] },
    ar: { title: 'مركز طبي مجتمعي', scenario: 'سلطة الصحة تطلب مركزاً طبياً مجتمعياً 2000 م² في مدينة مختلطة. الخدمات: أطباء ومراكز صحية وصحة نفسية وطوارئ.', tips: ['تدفق المرضى والخصوصية', 'تقليل التوتر عبر التصميم', 'إمكانية الوصول لجميع السكان'] },
  },
]

interface Feedback {
  score: number
  breakdown: { specificity: number; context: number; terminology: number; direction: number }
  strengths: string
  missing: string
  guidingQuestion: string
}

interface HistoryItem {
  role: 'user' | 'assistant'
  content: string
  prompt?: string
  feedback?: Feedback
}

function ScoreBar({ label, value, max = 25 }: { label: string; value: number; max?: number }) {
  const pct = Math.round((value / max) * 100)
  const color = pct >= 80 ? '#2d6a4f' : pct >= 50 ? '#e07b00' : '#8b1a1a'
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span style={{ color: 'var(--text-muted)' }}>{label}</span>
        <span style={{ color }} className="font-bold">{value}/{max}</span>
      </div>
      <div className="h-2 rounded-full" style={{ backgroundColor: 'var(--border)' }}>
        <div className="h-2 rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  )
}

const UI = {
  he: {
    back: '← חזרה',
    attempt: 'ניסיון מספר',
    scenario: '📋 התרחיש',
    hints: 'רמזים לחשיבה:',
    lastAttempt: '📊 הניסיון האחרון',
    outOf: 'מתוך 100',
    writePrompt: 'כתוב את הפרומפט שלך:',
    writeImproved: 'כתוב גרסה משופרת:',
    placeholder1: 'תאר לכלי AI מה אתה רוצה לעצב... (מינימום 30 תווים)',
    placeholder2: 'עדכן את הפרומפט שלך בהתאם לשאלה המנחה...',
    minChars: 'תווים (מינימום 30)',
    chars: 'תווים',
    analyzing: 'מנתח...',
    send: 'שלח לניתוח',
    sendImproved: 'שלח גרסה משופרת',
    ctrlEnter: 'Ctrl+Enter לשליחה מהירה',
    historyTitle: 'היסטוריית ניסיונות',
    missing: 'חסר:',
    writeFirst: 'כתוב את הפרומפט הראשון שלך וקבל ניתוח',
    error: 'שגיאה בשרת, נסה שוב',
    scoreLabels: ['ספציפיות', 'הקשר', 'מינוח', 'כיוון'],
    lang: 'عربي',
    difficultyLabel: { beginner: 'מתחיל', intermediate: 'בינוני', advanced: 'מתקדם' },
  },
  ar: {
    back: '→ عودة',
    attempt: 'المحاولة رقم',
    scenario: '📋 السيناريو',
    hints: 'تلميحات للتفكير:',
    lastAttempt: '📊 المحاولة الأخيرة',
    outOf: 'من 100',
    writePrompt: 'اكتب برومبتك:',
    writeImproved: 'اكتب نسخة محسّنة:',
    placeholder1: 'صف لأداة الذكاء الاصطناعي ما تريد تصميمه... (30 حرفاً على الأقل)',
    placeholder2: 'حدّث برومبتك بناءً على السؤال الإرشادي...',
    minChars: 'حرفاً (30 على الأقل)',
    chars: 'حرفاً',
    analyzing: 'جاري التحليل...',
    send: 'أرسل للتحليل',
    sendImproved: 'أرسل النسخة المحسّنة',
    ctrlEnter: 'Ctrl+Enter للإرسال السريع',
    historyTitle: 'سجل المحاولات',
    missing: 'ينقص:',
    writeFirst: 'اكتب برومبتك الأول واحصل على تحليل',
    error: 'خطأ في الخادم، حاول مجدداً',
    scoreLabels: ['الدقة', 'السياق', 'المصطلحات', 'التوجه'],
    lang: 'עברית',
    difficultyLabel: { beginner: 'مبتدئ', intermediate: 'متوسط', advanced: 'متقدم' },
  },
}

function PracticeContent() {
  const searchParams = useSearchParams()
  const levelId = parseInt(searchParams.get('level') || '1', 10)
  const exercise = EXERCISES.find(e => e.id === levelId) || EXERCISES[0]

  const [lang, setLang] = useState<Lang>('he')
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [attempts, setAttempts] = useState(0)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const saved = document.cookie.split(';').find(c => c.trim().startsWith('lang='))?.split('=')[1]
    if (saved === 'ar') setLang('ar')
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [history])

  const t = UI[lang]
  const content = exercise[lang]
  const isAr = lang === 'ar'

  async function handleSubmit() {
    if (!prompt.trim() || loading) return
    setLoading(true)

    const apiHistory = history.map(h => ({ role: h.role, content: h.content }))

    try {
      const res = await fetch('/api/prompt-engineering', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          scenario: content.scenario,
          history: apiHistory,
          lang,
        }),
      })
      const feedback: Feedback = await res.json()

      setHistory(prev => [
        ...prev,
        { role: 'user', content: prompt.trim(), prompt: prompt.trim() },
        { role: 'assistant', content: JSON.stringify(feedback), feedback },
      ])
      setAttempts(a => a + 1)
      setPrompt('')
    } catch {
      alert(t.error)
    } finally {
      setLoading(false)
    }
  }

  const lastFeedback = history.filter(h => h.feedback).at(-1)?.feedback
  const diffColors = { beginner: '#2d6a4f', intermediate: '#e07b00', advanced: '#8b1a1a' }
  const diffColor = diffColors[exercise.difficulty]

  return (
    <div dir="rtl">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <Link href="/prompt-engineering">
            <button className="btn-secondary text-sm px-3 py-1">{t.back}</button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold" style={{ color: 'var(--primary)' }}>
                {exercise.icon} {content.title}
              </h1>
              <span className="px-2 py-0.5 rounded text-white text-xs" style={{ backgroundColor: diffColor }}>
                {t.difficultyLabel[exercise.difficulty]}
              </span>
            </div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{t.attempt} {attempts + 1}</p>
          </div>
        </div>
        <button
          onClick={() => setLang(l => l === 'he' ? 'ar' : 'he')}
          className="btn-secondary text-sm px-3 py-1"
          style={{ direction: 'ltr' }}
        >
          {t.lang}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        <div className="md:col-span-2 card p-4" style={{ borderRight: `4px solid ${diffColor}` }}>
          <h2 className="font-bold text-sm mb-2" style={{ color: diffColor }}>{t.scenario}</h2>
          <p className="text-sm mb-3" style={{ color: 'var(--text)', direction: isAr ? 'rtl' : 'rtl' }}>{content.scenario}</p>
          <div className="text-xs space-y-1" style={{ color: 'var(--text-muted)' }}>
            <p className="font-medium">{t.hints}</p>
            {content.tips.map((tip, i) => <p key={i}>• {tip}</p>)}
          </div>
        </div>

        {lastFeedback ? (
          <div className="card p-4">
            <h2 className="font-bold text-sm mb-3" style={{ color: 'var(--primary)' }}>{t.lastAttempt}</h2>
            <div className="text-center mb-3">
              <div className="text-4xl font-bold" style={{
                color: lastFeedback.score >= 75 ? '#2d6a4f' : lastFeedback.score >= 50 ? '#e07b00' : '#8b1a1a'
              }}>
                {lastFeedback.score}
              </div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{t.outOf}</div>
            </div>
            <div className="space-y-2">
              <ScoreBar label={t.scoreLabels[0]} value={lastFeedback.breakdown.specificity} />
              <ScoreBar label={t.scoreLabels[1]} value={lastFeedback.breakdown.context} />
              <ScoreBar label={t.scoreLabels[2]} value={lastFeedback.breakdown.terminology} />
              <ScoreBar label={t.scoreLabels[3]} value={lastFeedback.breakdown.direction} />
            </div>
          </div>
        ) : (
          <div className="card p-4 flex items-center justify-center text-center">
            <div>
              <div className="text-4xl mb-2">✍️</div>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{t.writeFirst}</p>
            </div>
          </div>
        )}
      </div>

      {history.length > 0 && (
        <div className="card p-4 mb-4 max-h-72 overflow-y-auto">
          <h2 className="font-bold text-sm mb-3" style={{ color: 'var(--primary)' }}>{t.historyTitle}</h2>
          <div className="space-y-3">
            {history.filter(h => h.role === 'assistant').map((h, i) => (
              h.feedback && (
                <div key={i} className="border-b pb-3 last:border-0 last:pb-0" style={{ borderColor: 'var(--border)' }}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold px-2 py-0.5 rounded text-white"
                      style={{ backgroundColor: h.feedback.score >= 75 ? '#2d6a4f' : h.feedback.score >= 50 ? '#e07b00' : '#8b1a1a' }}>
                      {h.feedback.score}/100
                    </span>
                  </div>
                  <p className="text-xs mb-1" style={{ color: 'var(--text)' }}>
                    <span style={{ color: '#2d6a4f' }}>✓</span> {h.feedback.strengths}
                  </p>
                  <p className="text-xs italic p-2 rounded" style={{ backgroundColor: 'var(--background)', color: 'var(--text)' }}>
                    ❓ {h.feedback.guidingQuestion}
                  </p>
                </div>
              )
            ))}
          </div>
          <div ref={bottomRef} />
        </div>
      )}

      {lastFeedback && (
        <div className="card p-4 mb-4" style={{ borderRight: '4px solid #e07b00' }}>
          <p className="text-sm font-medium mb-1" style={{ color: '#2d6a4f' }}>
            ✓ {lastFeedback.strengths}
          </p>
          <p className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>
            {t.missing} {lastFeedback.missing}
          </p>
          <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--background)' }}>
            <p className="text-sm font-medium" style={{ color: 'var(--primary)' }}>
              ❓ {lastFeedback.guidingQuestion}
            </p>
          </div>
        </div>
      )}

      <div className="card p-4">
        <label className="block text-sm font-bold mb-2" style={{ color: 'var(--primary)' }}>
          {attempts === 0 ? t.writePrompt : t.writeImproved}
        </label>
        <textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder={attempts === 0 ? t.placeholder1 : t.placeholder2}
          className="w-full p-3 rounded-lg border text-sm resize-none"
          style={{
            backgroundColor: 'var(--background)',
            borderColor: 'var(--border)',
            color: 'var(--text)',
            minHeight: '100px',
            direction: 'rtl',
          }}
          onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) handleSubmit() }}
        />
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs" style={{ color: prompt.length < 30 ? 'var(--error)' : 'var(--text-muted)' }}>
            {prompt.length} {prompt.length < 30 ? t.minChars : t.chars}
          </span>
          <button
            onClick={handleSubmit}
            disabled={loading || prompt.trim().length < 30}
            className="btn-primary"
            style={{ opacity: (loading || prompt.trim().length < 30) ? 0.6 : 1 }}
          >
            {loading ? t.analyzing : attempts === 0 ? t.send : t.sendImproved}
          </button>
        </div>
        <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>{t.ctrlEnter}</p>
      </div>
    </div>
  )
}

export default function PracticePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center" style={{ color: 'var(--text-muted)' }}>טוען...</div>}>
      <PracticeContent />
    </Suspense>
  )
}
