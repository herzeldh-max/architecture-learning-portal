import Link from 'next/link'
import { cookies } from 'next/headers'
import { isValidLang } from '@/lib/i18n'

const EXERCISES = [
  {
    id: 1, difficulty: 'beginner',
    he: { title: 'בית מגורים פרטי', scenario: 'משפחה של 4 נפשות מבקשת לבנות בית בנגב. התקציב בינוני, השטח 300 מ"ר.', tips: ['ציין מספר חדרים', 'התייחס לאקלים הנגב', 'ציין סגנון אדריכלי'] },
    ar: { title: 'بيت سكني خاص', scenario: 'عائلة من 4 أفراد تطلب بناء منزل في منطقة النقب. الميزانية متوسطة والمساحة 300 م².', tips: ['حدد عدد الغرف', 'تحدث عن مناخ النقب', 'حدد الأسلوب المعماري'] },
    icon: '🏠',
  },
  {
    id: 2, difficulty: 'beginner',
    he: { title: 'גן ילדים', scenario: 'עיריית נצרת מבקשת גן ילדים חדש לגיל 3-6. תפוסה מקסימלית 60 ילדים, מגרש 800 מ"ר.', tips: ['חשוב על בטיחות וסקאלה', 'אור טבעי וצל', 'חלל חיצוני ופנימי'] },
    ar: { title: 'روضة أطفال', scenario: 'بلدية الناصرة تطلب روضة أطفال جديدة للأعمار 3-6 سنوات. الطاقة الاستيعابية 60 طفلاً، المساحة 800 م².', tips: ['فكر في الأمان والمقياس البشري', 'الإضاءة الطبيعية والظل', 'الفراغ الداخلي والخارجي'] },
    icon: '🎨',
  },
  {
    id: 3, difficulty: 'beginner',
    he: { title: 'חנות מקומית', scenario: 'בעל עסק רוצה לשפץ חנות מכולת ישנה של 80 מ"ר במרכז עיר מעורבת. רצון לשמר אופי מקומי.', tips: ['חזית מזמינה', 'פנים פונקציונלי', 'חומרים מקומיים'] },
    ar: { title: 'محل تجاري محلي', scenario: 'صاحب عمل يريد تجديد بقالة قديمة مساحتها 80 م² في مركز مدينة مختلطة. الرغبة في الحفاظ على الطابع المحلي.', tips: ['واجهة جذابة', 'داخلية وظيفية', 'مواد محلية'] },
    icon: '🏪',
  },
  {
    id: 4, difficulty: 'beginner',
    he: { title: 'פינת ישיבה בגינה', scenario: 'בעל בית פרטי מבקש לעצב פינת ישיבה מקורה בחצר 50 מ"ר בחיפה. שימוש: משפחתי ואירוח.', tips: ['צל ואוורור', 'חיבור לגינה', 'ריהוט מוגן גשם'] },
    ar: { title: 'ركن جلوس في الحديقة', scenario: 'صاحب منزل يطلب تصميم ركن جلوس مسقوف في حديقة 50 م² في حيفا. الاستخدام: عائلي واجتماعي.', tips: ['الظل والتهوية', 'الربط بالحديقة', 'أثاث مقاوم للمطر'] },
    icon: '🌿',
  },
  {
    id: 5, difficulty: 'beginner',
    he: { title: 'סטודיו לאמנות', scenario: 'אמנית מקומית מחפשת עיצוב לסטודיו עבודה קטן של 40 מ"ר בדירת קרקע בתל אביב. דרישה: אור צפוני מקסימלי.', tips: ['אור טבעי איכותי', 'אחסון לחומרי עבודה', 'רצפה עמידה'] },
    ar: { title: 'استوديو فني', scenario: 'فنانة محلية تبحث عن تصميم لاستوديو عمل صغير مساحته 40 م² في شقة أرضية في تل أبيب. المطلب: ضوء شمالي أقصى.', tips: ['إضاءة طبيعية عالية الجودة', 'تخزين لمواد العمل', 'أرضية متينة'] },
    icon: '🎭',
  },
  {
    id: 6, difficulty: 'intermediate',
    he: { title: 'ספריית שכונה', scenario: 'עיריית תל אביב מבקשת ספריית שכונה ב-400 מ"ר באזור מגורים צפוף. קהל: כל הגילאים כולל קשישים וילדים.', tips: ['נגישות מלאה', 'אקוסטיקה', 'אזורים נפרדים לגילאים'] },
    ar: { title: 'مكتبة حي', scenario: 'بلدية تل أبيب تطلب مكتبة حي بمساحة 400 م² في منطقة سكنية كثيفة. الجمهور: جميع الأعمار بمن فيهم المسنون والأطفال.', tips: ['إمكانية وصول كاملة', 'عزل صوتي', 'مناطق منفصلة حسب الأعمار'] },
    icon: '📚',
  },
  {
    id: 7, difficulty: 'intermediate',
    he: { title: 'מרכז קהילתי מעורב', scenario: 'עיר מעורבת יהודית-ערבית בגליל מבקשת מרכז קהילתי 1,200 מ"ר המשרת שתי קהילות. תקציב מוגבל.', tips: ['כיצד לשרת שתי תרבויות?', 'חלל גמיש', 'סמליות ניטרלית'] },
    ar: { title: 'مركز مجتمعي مشترك', scenario: 'مدينة يهودية-عربية مختلطة في الجليل تطلب مركزاً مجتمعياً بـ 1200 م² يخدم المجتمعين. الميزانية محدودة.', tips: ['كيف تخدم ثقافتين؟', 'فراغ مرن', 'رمزية محايدة'] },
    icon: '🤝',
  },
  {
    id: 8, difficulty: 'intermediate',
    he: { title: 'מסעדה בנוף טבעי', scenario: 'יזם מבקש מסעדה בת 120 כסאות על צוק עם נוף לים בצפון הכרמל. דרישה: חיבור מקסימלי לנוף.', tips: ['גלאזינג מקסימלי', 'כיוון ישיבה', 'השפעה על נוף טבעי'] },
    ar: { title: 'مطعم في محيط طبيعي', scenario: 'مستثمر يطلب مطعماً بـ 120 مقعداً على منحدر صخري مطل على البحر في شمال الكرمل. المطلب: أقصى اتصال بالمنظر.', tips: ['تكبير مساحة الزجاج', 'توجيه الجلوس', 'التأثير على المنظر الطبيعي'] },
    icon: '🍽️',
  },
  {
    id: 9, difficulty: 'intermediate',
    he: { title: 'בית כנסת / מסגד', scenario: 'קהילה מקומית בעיר מעורבת מחפשת עיצוב לבית תפילה של 200 מ"ר. נדרש כבוד לסביבה הבנויה הקיימת.', tips: ['כיוון (מזרח/ירושלים)', 'אור מסקרן', 'פינת קבלת קהל'] },
    ar: { title: 'مسجد / كنيس', scenario: 'مجتمع محلي في مدينة مختلطة يبحث عن تصميم لبيت عبادة بمساحة 200 م². مطلوب احترام البيئة المبنية القائمة.', tips: ['الاتجاه (القبلة/الشرق)', 'الإضاءة الروحانية', 'ساحة استقبال'] },
    icon: '🕌',
  },
  {
    id: 10, difficulty: 'intermediate',
    he: { title: 'משרד בניין היסטורי', scenario: 'חברת הייטק רוצה להתמקם בבניין מגורים מ-1935 בחיפה התחתית. 600 מ"ר בשלוש קומות. שיפוץ נדרש.', tips: ['שמירה על פסיפס ושאריות', 'תשתיות מודרניות בתוך ישן', 'גמישות מרחבית'] },
    ar: { title: 'مكتب في مبنى تاريخي', scenario: 'شركة تقنية تريد الاستقرار في مبنى سكني من عام 1935 في حيفا السفلى. 600 م² على ثلاثة طوابق. تجديد مطلوب.', tips: ['الحفاظ على الفسيفساء والعناصر الأصلية', 'بنية تحتية حديثة داخل القديم', 'مرونة مكانية'] },
    icon: '🏢',
  },
  {
    id: 11, difficulty: 'advanced',
    he: { title: 'שכונת מגורים בת-קיימא', scenario: 'חברה יזמית מתכננת שכונה חדשה ל-500 יחידות דיור בדרום ישראל. דרישה: אפס פחמן עד 2035, מחירים נגישים.', tips: ['אנרגיה מתחדשת בקנה מידה שכונתי', 'חשיבה על קהילה לא רק בניינים', 'כיצד לפצות בין עלות לקיימות'] },
    ar: { title: 'حي سكني مستدام', scenario: 'شركة مطورة تخطط لحي جديد لـ 500 وحدة سكنية في جنوب إسرائيل. المطلب: صافي كربون صفري بحلول 2035 وأسعار ميسورة.', tips: ['طاقة متجددة على مستوى الحي', 'التفكير في المجتمع لا المباني فقط', 'كيف توازن بين التكلفة والاستدامة'] },
    icon: '🌱',
  },
  {
    id: 12, difficulty: 'advanced',
    he: { title: 'שיפוץ ושימור מנדטורי', scenario: 'בניין מגורים בינלאומי מ-1935 בתל אביב (רשימת שימור א\'). נדרש לשפץ ל-12 יח"ד מודרניות תוך שימור מלא של החזית והאלמנטים המקוריים.', tips: ['מה שומרים, מה מחדשים?', 'תקנות רשות שימור', 'שכבת זמן וחדשנות'] },
    ar: { title: 'ترميم وصون مبنى انتدابي', scenario: 'مبنى سكني دولي من عام 1935 في تل أبيب (قائمة الصون أ). مطلوب تجديده لـ 12 وحدة سكنية حديثة مع الحفاظ الكامل على الواجهة والعناصر الأصلية.', tips: ['ما الذي تحافظ عليه وما الذي تجدده؟', 'لوائح هيئة الصون', 'طبقة الزمن والابتكار'] },
    icon: '🏛️',
  },
  {
    id: 13, difficulty: 'advanced',
    he: { title: 'מוזיאון אדריכלות', scenario: 'עיריית ירושלים מזמינה תחרות לעיצוב מוזיאון אדריכלות ישראלית. שטח: 3,500 מ"ר לצד הבניין הלאומי. דרישה: דיאלוג עם ההיסטוריה ועם העתיד.', tips: ['כיצד מוזיאון מדבר על עצמו?', 'רצף ורצף חוויתי', 'חומריות ירושלמית'] },
    ar: { title: 'متحف معماري', scenario: 'بلدية القدس تدعو لمسابقة لتصميم متحف للعمارة الإسرائيلية. المساحة: 3500 م² بجانب المبنى الوطني. المطلب: حوار مع التاريخ والمستقبل.', tips: ['كيف يتحدث المتحف عن نفسه؟', 'التسلسل والتجربة الحسية', 'مواد القدس وروحها'] },
    icon: '🏺',
  },
  {
    id: 14, difficulty: 'advanced',
    he: { title: 'קמפוס אוניברסיטאי', scenario: 'אוניברסיטה מבקשת לתכנן קמפוס חדש ל-5,000 סטודנטים בגליל. דרישות: חדשנות, קיימות, שילוב בנוף, מגורי סטודנטים ופקולטות.', tips: ['כיצד קמפוס בונה קהילה?', 'ציר הולכי רגל', 'זהות ויזואלית אחידה'] },
    ar: { title: 'حرم جامعي', scenario: 'جامعة تطلب التخطيط لحرم جامعي جديد لـ 5000 طالب في الجليل. المتطلبات: الابتكار والاستدامة والاندماج في المشهد الطبيعي وسكن الطلاب والكليات.', tips: ['كيف يبني الحرم مجتمعاً؟', 'محور المشاة', 'هوية بصرية موحدة'] },
    icon: '🎓',
  },
  {
    id: 15, difficulty: 'advanced',
    he: { title: 'מרכז רפואי קהילתי', scenario: 'רשות בריאות מבקשת מרכז רפואי קהילתי ב-2,000 מ"ר בעיר מעורבת. שירות: רופאים, מרפאות, בריאות הנפש, חדר שעת חירום.', tips: ['זרימת חולים ושמירת פרטיות', 'הפחתת סטרס בעיצוב', 'נגישות לכל אוכלוסייה'] },
    ar: { title: 'مركز طبي مجتمعي', scenario: 'سلطة الصحة تطلب مركزاً طبياً مجتمعياً بـ 2000 م² في مدينة مختلطة. الخدمات: أطباء ومراكز صحية وصحة نفسية وغرفة طوارئ.', tips: ['تدفق المرضى والخصوصية', 'تقليل التوتر من خلال التصميم', 'إمكانية الوصول لجميع السكان'] },
    icon: '🏥',
  },
]

export default async function PromptEngineeringPage() {
  const cookieStore = await cookies()
  const langCookie = cookieStore.get('lang')?.value
  const lang = (langCookie === 'ar' ? 'ar' : 'he') as 'he' | 'ar'
  const isAr = lang === 'ar'

  const labels = {
    he: {
      title: 'כתיבת פרומפטים לאדריכלות',
      subtitle: 'למד Prompt Engineering מעשי דרך תרחישים אדריכליים אמיתיים',
      what: 'מה תלמד כאן?',
      whatDesc: 'Prompt Engineering היא מיומנות קריטית לאדריכל המודרני. פרומפט טוב יכול להאיץ את תהליך העיצוב פי כמה.',
      criteria: ['ספציפיות', 'הקשר אדריכלי', 'מינוח מקצועי', 'כיוון עיצובי'],
      chooseScenario: 'בחר תרחיש לתרגול',
      difficulty: { beginner: 'מתחיל', intermediate: 'בינוני', advanced: 'מתקדם' },
      structure: 'המבנה של פרומפט אדריכלי טוב',
      structureItems: [
        { num: '1', title: 'תפקוד', ex: 'בית מגורים / בית ספר / מרכז מסחרי...' },
        { num: '2', title: 'הקשר', ex: 'מיקום, אקלים, שכונה, תרבות מקומית' },
        { num: '3', title: 'מגבלות', ex: 'תקציב, שטח, תקנות, לקוח ספציפי' },
        { num: '4', title: 'סגנון', ex: 'מינימליסטי, ביופיליה, היסטוריציזם...' },
        { num: '5', title: 'חומרים', ex: 'בטון חשוף, עץ מקומי, בלוק אבן...' },
      ],
      all: 'הכל', tips: 'רמזים',
    },
    ar: {
      title: 'كتابة البرومبت للعمارة',
      subtitle: 'تعلم هندسة البرومبت عملياً من خلال سيناريوهات معمارية حقيقية',
      what: 'ماذا ستتعلم هنا؟',
      whatDesc: 'هندسة البرومبت مهارة أساسية للمعماري الحديث. البرومبت الجيد يمكن أن يسرّع عملية التصميم أضعافاً مضاعفة.',
      criteria: ['الدقة والتحديد', 'السياق المعماري', 'المصطلحات المهنية', 'التوجه التصميمي'],
      chooseScenario: 'اختر سيناريو للتدريب',
      difficulty: { beginner: 'مبتدئ', intermediate: 'متوسط', advanced: 'متقدم' },
      structure: 'بنية البرومبت المعماري الجيد',
      structureItems: [
        { num: '1', title: 'الوظيفة', ex: 'مسكن / مدرسة / مركز تجاري...' },
        { num: '2', title: 'السياق', ex: 'الموقع، المناخ، الحي، الثقافة المحلية' },
        { num: '3', title: 'القيود', ex: 'الميزانية، المساحة، اللوائح، العميل' },
        { num: '4', title: 'الأسلوب', ex: 'بسيط، طبيعي، تاريخي...' },
        { num: '5', title: 'المواد', ex: 'خرسانة ظاهرة، خشب محلي، حجر...' },
      ],
      all: 'الكل', tips: 'تلميحات',
    },
  }

  const t = labels[lang]
  const diffColors = { beginner: '#2d6a4f', intermediate: '#e07b00', advanced: '#8b1a1a' }

  return (
    <div dir={isAr ? 'rtl' : 'rtl'}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--primary)' }}>{t.title}</h1>
        <p style={{ color: 'var(--text-muted)' }}>{t.subtitle}</p>
      </div>

      {/* הסבר */}
      <div className="card p-5 mb-6" style={{ borderRight: '4px solid var(--primary)' }}>
        <h2 className="font-bold text-base mb-2" style={{ color: 'var(--primary)' }}>{t.what}</h2>
        <p className="text-sm mb-3" style={{ color: 'var(--text)' }}>{t.whatDesc}</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(['🎯', '🏗️', '📐', '🎨'] as const).map((icon, i) => (
            <div key={i} className="text-center p-3 rounded-lg" style={{ backgroundColor: 'var(--background)' }}>
              <div className="text-2xl mb-1">{icon}</div>
              <div className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{t.criteria[i]}</div>
            </div>
          ))}
        </div>
      </div>

      {/* תרחישים לפי רמה */}
      {(['beginner', 'intermediate', 'advanced'] as const).map(diff => {
        const exercises = EXERCISES.filter(e => e.difficulty === diff)
        return (
          <div key={diff} className="mb-8">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2" style={{ color: diffColors[diff] }}>
              <span className="px-3 py-1 rounded-full text-white text-sm" style={{ backgroundColor: diffColors[diff] }}>
                {t.difficulty[diff]}
              </span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>— {exercises.length} תרגילים</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {exercises.map(ex => {
                const content = ex[lang]
                return (
                  <a key={ex.id} href={`/prompt-engineering/practice?level=${ex.id}`} style={{ textDecoration: 'none' }}>
                    <div className="card p-4 cursor-pointer hover:shadow-md transition-all h-full flex flex-col"
                      style={{ borderTop: `3px solid ${diffColors[diff]}` }}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{ex.icon}</span>
                        <h3 className="font-bold text-sm" style={{ color: 'var(--primary)' }}>{content.title}</h3>
                      </div>
                      <p className="text-xs mb-3 flex-1" style={{ color: 'var(--text)' }}>{content.scenario}</p>
                      <div className="text-xs p-2 rounded" style={{ backgroundColor: 'var(--background)', color: 'var(--text-muted)' }}>
                        💡 {content.tips[0]}
                      </div>
                    </div>
                  </a>
                )
              })}
            </div>
          </div>
        )
      })}

      {/* מבנה פרומפט */}
      <div className="card p-5 mt-2">
        <h2 className="font-bold text-base mb-3" style={{ color: 'var(--primary)' }}>{t.structure}</h2>
        <div className="space-y-2">
          {t.structureItems.map(item => (
            <div key={item.num} className="flex gap-3 items-start">
              <span className="w-6 h-6 rounded-full text-white text-xs flex items-center justify-center flex-shrink-0 font-bold mt-0.5"
                style={{ backgroundColor: 'var(--primary)' }}>{item.num}</span>
              <div>
                <span className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{item.title}: </span>
                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{item.ex}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
