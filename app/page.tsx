import Link from 'next/link'
import { cookies } from 'next/headers'
import { getDictionary, isValidLang } from '@/lib/i18n'
import LanguageSwitcher from '@/components/LanguageSwitcher'

export default async function HomePage() {
  const cookieStore = await cookies()
  const langCookie = cookieStore.get('lang')?.value
  const lang = isValidLang(langCookie) ? langCookie : 'he'
  const t = getDictionary(lang)

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <section
          className="hero-section"
          style={{ backgroundImage: "url('/hero-architecture.png')" }}
        >
          <header className="hero-header py-5 px-6">
            <div className="max-w-5xl mx-auto flex items-center justify-between">
              <a href="https://www.tcb.ac.il" target="_blank" rel="noopener noreferrer">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/college-logo.png"
                  alt="המכללה הטכנולוגית באר שבע"
                  style={{ height: '56px', width: 'auto' }}
                  className="object-contain rounded"
                />
              </a>
              <div className="flex items-center gap-3">
                <LanguageSwitcher variant="dark" />
                <Link href="/login">
                  <button className="px-4 py-2 rounded-lg font-semibold border-2 border-white text-white hover:bg-white hover:text-blue-900 transition-colors">
                    {t.common.login}
                  </button>
                </Link>
                <Link href="/register">
                  <button
                    className="px-4 py-2 rounded-lg font-semibold"
                    style={{ backgroundColor: 'var(--secondary)', color: '#1a202c' }}
                  >
                    {t.common.register}
                  </button>
                </Link>
              </div>
            </div>
          </header>

          <div className="hero-content-top text-white text-center px-6 pt-8 md:pt-12">
            <h1 className="text-xl md:text-2xl font-bold leading-tight">{lang === 'ar' ? 'بوابة التعلم - هندسة العمارة وتصميم الديكور الداخلي' : 'פורטל לימוד - אדריכלות ועיצוב פנים'}</h1>
            <p className="text-sm md:text-base opacity-80">{t.home.collegeSubtitle}</p>
          </div>

          <div className="hero-content max-w-3xl mx-auto px-6 pb-20 md:pb-28 text-white text-center flex flex-col items-center">
            <h2 className="text-4xl md:text-6xl font-extrabold mb-5 leading-tight">
              {t.home.heroTitle}
            </h2>
            <p className="text-lg md:text-xl mb-10 max-w-2xl" style={{ opacity: 0.9 }}>
              {t.home.heroDesc}
            </p>
            <Link href="/register">
              <button
                className="text-lg px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
                style={{ backgroundColor: 'var(--secondary)', color: '#1a202c' }}
              >
                {t.home.startNow}
              </button>
            </Link>
          </div>
        </section>

        <section className="py-20 px-6">
          <div className="max-w-5xl mx-auto">
            <h3 className="text-3xl font-extrabold text-center mb-3" style={{ color: 'var(--primary)' }}>
              {t.home.featuresTitle}
            </h3>
            <p className="text-center mb-14" style={{ color: 'var(--text-muted)' }}>
              {t.home.featuresSubtitle}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FeatureCard icon="📐" title={t.home.features.theory.title} subtitle={t.home.features.theory.subtitle}
                points={t.home.features.theory.points} />
              <FeatureCard icon="📋" title={t.home.features.legislation.title} subtitle={t.home.features.legislation.subtitle}
                points={t.home.features.legislation.points} />
              <FeatureCard icon="🎯" title={t.home.features.exam.title} subtitle={t.home.features.exam.subtitle}
                points={t.home.features.exam.points} />
              <FeatureCard icon="📊" title={t.home.features.progress.title} subtitle={t.home.features.progress.subtitle}
                points={t.home.features.progress.points} />
            </div>
          </div>
        </section>
      </main>

      <footer className="py-4 text-center text-sm" style={{ color: 'var(--text-muted)', borderTop: '1px solid var(--border)' }}>
        {t.footer}
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, subtitle, points }: { icon: string; title: string; subtitle: string; points: string[] }) {
  return (
    <div className="card p-8">
      <div className="flex items-center gap-4 mb-5">
        <span className="text-4xl">{icon}</span>
        <div>
          <h4 className="text-xl font-extrabold" style={{ color: 'var(--primary)' }}>{title}</h4>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>
        </div>
      </div>
      <ul className="space-y-2.5">
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
