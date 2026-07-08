import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'הצהרת נגישות - פורטל לימוד אדריכלות ועיצוב פנים',
}

export default function AccessibilityPage() {
  return (
    <div className="min-h-screen py-12 px-4" style={{ backgroundColor: 'var(--bg)' }}>
      <article
        className="max-w-3xl mx-auto card p-8"
        dir="rtl"
        lang="he"
        aria-labelledby="a11y-title"
      >
        <h1 id="a11y-title" className="text-3xl font-extrabold mb-2" style={{ color: 'var(--primary)' }}>
          הצהרת נגישות
        </h1>
        <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>
          עדכון אחרון: יוני 2026
        </p>

        <section aria-labelledby="a11y-commitment">
          <h2 id="a11y-commitment" className="text-xl font-bold mb-3" style={{ color: 'var(--primary)' }}>
            מחויבות לנגישות
          </h2>
          <p className="mb-4">
            המכללה הטכנולוגית באר שבע, מגמת אדריכלות ועיצוב פנים, מחויבת להנגיש את פורטל הלימוד
            לכלל המשתמשים, לרבות אנשים עם מוגבלויות, בהתאם לחוק שוויון זכויות לאנשים עם מוגבלות,
            תשנ&quot;ח-1998, ולתקנות הנגישות לשירות (תקן ישראלי IS 5568 / WCAG 2.1 ברמה AA).
          </p>
        </section>

        <section aria-labelledby="a11y-measures">
          <h2 id="a11y-measures" className="text-xl font-bold mb-3 mt-6" style={{ color: 'var(--primary)' }}>
            אמצעי הנגישות באתר
          </h2>
          <ul className="space-y-2 mb-4" style={{ listStyle: 'disc', paddingRight: '1.5rem' }}>
            <li>האתר מוצג בעברית עם תמיכה ב-RTL (כיוון כתיבה מימין לשמאל)</li>
            <li>ניווט מלא באמצעות מקלדת בכל דפי האתר</li>
            <li>תמיכה בקוראי מסך (NVDA, JAWS, VoiceOver)</li>
            <li>כל התמונות מלוות בטקסט חלופי תיאורי</li>
            <li>ניגודיות צבעים עומדת ביחס של 4.5:1 לפחות לטקסט רגיל</li>
            <li>קישור דילוג לתוכן הראשי (Skip Navigation) בראש כל דף</li>
            <li>כותרות מדורגות (h1–h4) בסדר הגיוני בכל עמוד</li>
            <li>שדות טופס מחוברים לתוויות מזהות</li>
            <li>הודעות שגיאה מוכרזות לקוראי מסך (role=&quot;alert&quot;)</li>
            <li>ווידג&apos;ט נגישות המאפשר: ניגודיות גבוהה, הגדלת טקסט, הדגשת קישורים, הפחתת אנימציות וגופן קריא</li>
            <li>קיצור מקלדת <kbd>Alt+A</kbd> לפתיחת תפריט הנגישות</li>
          </ul>
        </section>

        <section aria-labelledby="a11y-level">
          <h2 id="a11y-level" className="text-xl font-bold mb-3 mt-6" style={{ color: 'var(--primary)' }}>
            רמת תאימות
          </h2>
          <p className="mb-4">
            האתר עומד בדרישות תקן IS 5568:2020 ברמה AA, המתואם עם WCAG 2.1 AA.
            אנו עורכים בדיקות נגישות שוטפות ומבצעים שיפורים מתמידים.
          </p>
        </section>

        <section aria-labelledby="a11y-limitations">
          <h2 id="a11y-limitations" className="text-xl font-bold mb-3 mt-6" style={{ color: 'var(--primary)' }}>
            מגבלות ידועות
          </h2>
          <ul className="space-y-2 mb-4" style={{ listStyle: 'disc', paddingRight: '1.5rem' }}>
            <li>קבצי PDF שהועלו על ידי מרצים עשויים שלא להיות נגישים במלואם; פנה/י לרכז הנגישות לקבלת גרסה נגישה</li>
            <li>תוכן AI שנוצר בזמן אמת עשוי להכיל טבלאות שלא תמיד קריאות בקוראי מסך ישנים</li>
          </ul>
        </section>

        <section aria-labelledby="a11y-contact">
          <h2 id="a11y-contact" className="text-xl font-bold mb-3 mt-6" style={{ color: 'var(--primary)' }}>
            פנייה בנושא נגישות
          </h2>
          <p className="mb-2">
            <strong>רכז נגישות:</strong> הרצל בן שבת
          </p>
          <p className="mb-2">
            <strong>תפקיד:</strong> סגן ראש מגמת אדריכלות ועיצוב פנים
          </p>
          <p className="mb-2">
            <strong>דוא&quot;ל:</strong>{' '}
            <a href="mailto:herzelb@st.tcb.ac.il" dir="ltr" style={{ color: 'var(--primary)' }}>
              herzelb@st.tcb.ac.il
            </a>
          </p>
          <p className="mb-4">
            <strong>מוסד:</strong> המכללה הטכנולוגית באר שבע
          </p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            נשתדל להשיב לפניות נגישות תוך 5 ימי עבודה.
          </p>
        </section>

        <section aria-labelledby="a11y-law">
          <h2 id="a11y-law" className="text-xl font-bold mb-3 mt-6" style={{ color: 'var(--primary)' }}>
            בסיס חוקי
          </h2>
          <p className="mb-2">
            הצהרה זו מתבצעת בהתאם ל:
          </p>
          <ul className="space-y-1 mb-4" style={{ listStyle: 'disc', paddingRight: '1.5rem' }}>
            <li>
              <a href="https://www.nevo.co.il/law_html/law01/p214m2_001.htm"
                target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)' }}>
                חוק שוויון זכויות לאנשים עם מוגבלות, תשנ&quot;ח-1998
              </a>
            </li>
            <li>תקנות שוויון זכויות לאנשים עם מוגבלות (התאמות נגישות לשירות), תשע&quot;ג-2013</li>
            <li>תקן ישראלי IS 5568:2020 (מבוסס על WCAG 2.1 AA)</li>
          </ul>
        </section>

        <div className="mt-8 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
          <Link href="/" style={{ color: 'var(--primary)', fontWeight: 600 }}>
            ← חזרה לדף הבית
          </Link>
        </div>
      </article>
    </div>
  )
}
