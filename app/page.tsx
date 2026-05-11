import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header style={{ backgroundColor: 'var(--primary)' }} className="text-white py-4 px-6 shadow-lg">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">פורטל לימוד - אדריכלות ועיצוב פנים</h1>
            <p className="text-sm opacity-75">המכללה הטכנולוגית בבאר שבע</p>
          </div>
          <div className="flex gap-3">
            <Link href="/login">
              <button className="px-4 py-2 rounded-lg font-semibold border-2 border-white text-white hover:bg-white hover:text-blue-900 transition-colors">
                כניסה
              </button>
            </Link>
            <Link href="/register">
              <button
                className="px-4 py-2 rounded-lg font-semibold"
                style={{ backgroundColor: 'var(--secondary)', color: '#1a202c' }}
              >
                הרשמה
              </button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-16 px-6 text-center" style={{ backgroundColor: 'var(--primary)' }}>
          <div className="max-w-3xl mx-auto text-white">
            <h2 className="text-4xl font-bold mb-4">ברוכים הבאים לפורטל הלימוד</h2>
            <p className="text-lg mb-8" style={{ opacity: 0.85 }}>
              מערכת AI מתקדמת לסטודנטים לאדריכלות ועיצוב פנים.
              שאלות, חומרים, ותרגול לקראת הבחינות.
            </p>
            <Link href="/register">
              <button
                className="text-lg px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
                style={{ backgroundColor: 'var(--secondary)', color: '#1a202c' }}
              >
                התחל עכשיו
              </button>
            </Link>
          </div>
        </section>

        <section className="py-14 px-6">
          <div className="max-w-5xl mx-auto">
            <h3 className="text-2xl font-bold text-center mb-10" style={{ color: 'var(--primary)' }}>
              מה תמצאו בפורטל?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FeatureCard icon="📐" title="תורת הבנייה" subtitle="קורס לשנה א'"
                points={['חומרי לימוד מהמצגות לפי סמסטר','שאלות חופשיות על החומר עם AI','הכנה למבחן עם שאלות מותאמות','ניקוד מיידי ומשוב מפורט']} />
              <FeatureCard icon="📋" title="תחיקת הבנייה" subtitle="תקנות תכנון ובנייה"
                points={['שאלות על תקנות עדכניות','מידע ממקורות רשמיים (נבו, כנסת)','ציון מקור מדויק לכל תשובה','חומר עדכני ומאומת']} />
              <FeatureCard icon="🎯" title="הכנה למבחן" subtitle="שאלות ללא הגבלה"
                points={["שאלות אמריקאיות ופתוחות","תשובות אקראיות - לא תמיד א'",'מניעת חזרה על שאלות','מעקב ציונים אישי']} />
              <FeatureCard icon="📊" title="מעקב התקדמות" subtitle="ממשק אישי"
                points={['היסטוריית שאלות ותשובות','ממוצע ציונים לפי נושא','זיהוי נושאים שדורשים חיזוק','חשבון אישי מאובטח']} />
            </div>
          </div>
        </section>
      </main>

      <footer className="py-4 text-center text-sm" style={{ color: 'var(--text-muted)', borderTop: '1px solid var(--border)' }}>
        פורטל לימוד - אדריכלות ועיצוב פנים | &copy; כל הזכויות שמורות לבן שבת הרצל | המכללה הטכנולוגית באר שבע
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, subtitle, points }: { icon: string; title: string; subtitle: string; points: string[] }) {
  return (
    <div className="card p-6">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl">{icon}</span>
        <div>
          <h4 className="text-lg font-bold" style={{ color: 'var(--primary)' }}>{title}</h4>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>
        </div>
      </div>
      <ul className="space-y-2">
        {points.map((p, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <span className="mt-0.5 font-bold" style={{ color: 'var(--secondary)' }}>✓</span>
            <span>{p}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
