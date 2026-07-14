import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'מדיניות פרטיות - פורטל לימוד אדריכלות ועיצוב פנים',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen py-12 px-4" style={{ backgroundColor: 'var(--bg)' }}>
      <article
        className="max-w-3xl mx-auto card p-8"
        dir="rtl"
        lang="he"
        aria-labelledby="privacy-title"
      >
        <h1 id="privacy-title" className="text-3xl font-extrabold mb-2" style={{ color: 'var(--primary)' }}>
          מדיניות פרטיות
        </h1>
        <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>
          עדכון אחרון: יולי 2026
        </p>

        <section aria-labelledby="privacy-intro">
          <h2 id="privacy-intro" className="text-xl font-bold mb-3" style={{ color: 'var(--primary)' }}>
            כללי
          </h2>
          <p className="mb-4">
            פורטל הלימוד של מגמת אדריכלות ועיצוב פנים במכללה הטכנולוגית באר שבע (&quot;הפורטל&quot;) מכבד
            את פרטיותך. מדיניות זו מסבירה איזה מידע אנו אוספים, לשם מה, כיצד הוא מאובטח, ומהן זכויותיך
            ביחס אליו, בהתאם לחוק הגנת הפרטיות, התשמ&quot;א-1981, ולתיקון 13 לחוק (בתוקף מאוגוסט 2025).
          </p>
        </section>

        <section aria-labelledby="privacy-collected">
          <h2 id="privacy-collected" className="text-xl font-bold mb-3 mt-6" style={{ color: 'var(--primary)' }}>
            אילו פרטים אנו אוספים
          </h2>
          <ul className="space-y-2 mb-4" style={{ listStyle: 'disc', paddingRight: '1.5rem' }}>
            <li><strong>פרטי הרשמה:</strong> שם מלא וכתובת דוא&quot;ל, בעת יצירת חשבון</li>
            <li><strong>סיסמה:</strong> נשמרת בצורה מוצפנת (hash) על ידי ספק האימות (Supabase) - איננו רואים או שומרים אותה בטקסט גלוי</li>
            <li><strong>נתוני שימוש:</strong> שאלות שנשאלו, תשובות, ציונים, והיסטוריית תרגול - לצורך מעקב התקדמות אישי</li>
            <li><strong>קבצים שהועלו:</strong> חומרי לימוד (PDF) ותמונות שמעלים מרצים/מנהלים למערכת</li>
            <li><strong>עוגיית התחברות (session cookie):</strong> עוגייה הכרחית לתפעול, המשמשת לזיהוי המשתמש המחובר בלבד - אינה משמשת למעקב שיווקי או פרסומי</li>
            <li><strong>העדפות נגישות:</strong> נשמרות מקומית בדפדפן שלך (localStorage) ואינן נשלחות לשרת</li>
          </ul>
        </section>

        <section aria-labelledby="privacy-purpose">
          <h2 id="privacy-purpose" className="text-xl font-bold mb-3 mt-6" style={{ color: 'var(--primary)' }}>
            לשם מה נאסף המידע
          </h2>
          <p className="mb-4">
            המידע משמש אך ורק לצורך תפעול הפורטל: ניהול חשבון אישי, אימות זהות בכניסה, הצגת חומרי
            לימוד רלוונטיים, תרגול והכנה למבחנים, ומתן משוב על התקדמות. איננו מוכרים, משכירים
            או משתפים את המידע עם צדדים שלישיים לצרכי שיווק.
          </p>
        </section>

        <section aria-labelledby="privacy-access">
          <h2 id="privacy-access" className="text-xl font-bold mb-3 mt-6" style={{ color: 'var(--primary)' }}>
            מי נגיש למידע
          </h2>
          <p className="mb-4">
            לנתונים האישיים שלך גישה רק אתה עצמך, וצוות ניהול הפורטל במגמה (לצורך תמיכה, מעקב
            אקדמי וניהול המערכת). המידע מאוחסן אצל ספק תשתית ענן (Supabase) הכפוף לתנאי אבטחה
            ופרטיות מחמירים.
          </p>
        </section>

        <section aria-labelledby="privacy-cookies">
          <h2 id="privacy-cookies" className="text-xl font-bold mb-3 mt-6" style={{ color: 'var(--primary)' }}>
            שימוש בעוגיות (Cookies)
          </h2>
          <p className="mb-4">
            הפורטל משתמש בעוגייה אחת בלבד, הכרחית לתפקוד הבסיסי של האתר. אנו <strong>לא</strong> משתמשים
            בעוגיות מעקב, פרסום, או ניתוח סטטיסטי (כגון Google Analytics), ולא בפיקסלים של רשתות חברתיות.
          </p>
          <div className="overflow-x-auto mb-4">
            <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)' }}>
                  <th className="text-right p-2 font-semibold">שם</th>
                  <th className="text-right p-2 font-semibold">מטרה</th>
                  <th className="text-right p-2 font-semibold">סוג</th>
                  <th className="text-right p-2 font-semibold">תוקף</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <td className="p-2" dir="ltr" style={{ textAlign: 'right' }}>sb-*-auth-token</td>
                  <td className="p-2">זיהוי המשתמש המחובר, לצורך גישה לחשבון האישי</td>
                  <td className="p-2">הכרחית (צד ראשון)</td>
                  <td className="p-2">עד יציאה מהמערכת</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mb-4">
            בנוסף, העדפות נגישות (ניגודיות, גודל טקסט וכו&apos;) נשמרות ב-<span dir="ltr">localStorage</span>{' '}
            של הדפדפן שלך בלבד - זהו אינו cookie, המידע אינו נשלח לשרת ואינו מזוהה איתך אישית.
            מכיוון שמדובר בעוגייה הכרחית בלבד, אין אפשרות &quot;לדחות&quot; אותה מבלי לאבד את היכולת להתחבר לחשבון.
          </p>
        </section>

        <section aria-labelledby="privacy-security">
          <h2 id="privacy-security" className="text-xl font-bold mb-3 mt-6" style={{ color: 'var(--primary)' }}>
            אבטחת מידע
          </h2>
          <p className="mb-4">
            כל התקשורת עם הפורטל מוצפנת (HTTPS). סיסמאות נשמרות בצורה מוצפנת ואינן נגישות
            לצוות הניהול. אנו נוקטים אמצעים סבירים למניעת גישה בלתי מורשית, אובדן או שיבוש
            של המידע שנאסף.
          </p>
        </section>

        <section aria-labelledby="privacy-rights">
          <h2 id="privacy-rights" className="text-xl font-bold mb-3 mt-6" style={{ color: 'var(--primary)' }}>
            הזכויות שלך
          </h2>
          <p className="mb-4">
            באפשרותך לבקש בכל עת לעיין במידע שנשמר עליך, לתקן פרטים שגויים, או לבקש את מחיקת
            חשבונך וכל הנתונים הקשורים אליו (שאלות, ציונים, היסטוריית פעילות). לצורך כך, פנה/י
            לרכז/ת הפרטיות בפרטים המופיעים למטה.
          </p>
        </section>

        <section aria-labelledby="privacy-contact">
          <h2 id="privacy-contact" className="text-xl font-bold mb-3 mt-6" style={{ color: 'var(--primary)' }}>
            פנייה בנושא פרטיות
          </h2>
          <p className="mb-2">
            <strong>איש קשר:</strong> הרצל בן שבת
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
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            נשתדל להשיב לפניות בנושא פרטיות תוך 5 ימי עבודה.
          </p>
        </section>

        <p className="text-center mt-8">
          <Link href="/" className="text-sm font-semibold" style={{ color: 'var(--primary)' }}>
            חזרה לדף הבית
          </Link>
        </p>
      </article>
    </div>
  )
}
