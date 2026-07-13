import Link from 'next/link'
import { cookies } from 'next/headers'
import { getDictionary, isValidLang } from '@/lib/i18n'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import HeroVideo from '@/components/HeroVideo'

export default async function HomePage() {
  const cookieStore = await cookies()
  const langCookie = cookieStore.get('lang')?.value
  const lang = isValidLang(langCookie) ? langCookie : 'he'
  const t = getDictionary(lang)

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      {/* STICKY NAV */}
      <header className="hero-header" role="banner">
        <a href="https://www.tcb.ac.il" target="_blank" rel="noopener noreferrer">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/college-logo.png"
            alt="המכללה הטכנולוגית באר שבע"
            style={{ height: '46px', width: 'auto' }}
            className="object-contain rounded"
          />
        </a>
        <nav aria-label="ניווט ראשי" className="flex items-center gap-4">
          <LanguageSwitcher />
          <Link href="/login"
            className="text-sm font-semibold"
            style={{ color: 'var(--text-muted)' }}>
            {t.common.login}
          </Link>
          <Link href="/register"
            className="text-sm font-bold px-5 py-2.5 rounded-lg"
            style={{ background: 'var(--secondary)', color: 'var(--secondary-text)' }}>
            {t.common.register}
          </Link>
        </nav>
      </header>

      <main id="main-content" tabIndex={-1} className="flex-1">
        {/* HERO */}
        <section className="hero-section" aria-label="כותרת ראשית">
          <HeroVideo />
          <div className="hero-overlay" aria-hidden="true" />
          <div className="hero-content">
            <h1 style={{
              fontFamily: 'var(--font-frank-ruhl), Georgia, serif',
              fontWeight: 700,
              fontSize: 'clamp(36px, 5vw, 58px)',
              lineHeight: 1.18,
              color: '#fff',
              marginBottom: '26px',
              textShadow: '0 2px 20px rgba(5,15,40,0.6)',
            }}>
              פורטל לימוד לאדריכלות<br />ועיצוב פנים
            </h1>
            <p style={{
              fontSize: '19px',
              lineHeight: 1.7,
              color: 'rgba(235,240,255,0.92)',
              maxWidth: '480px',
              margin: '0 auto 40px',
            }}>
              {t.home.heroDesc}
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/register"
                className="font-bold text-base px-8 py-4 rounded-lg transition-opacity hover:opacity-90"
                style={{ background: 'var(--secondary)', color: 'var(--secondary-text)' }}>
                {t.home.startNow}
              </Link>
              <Link href="/login"
                className="font-semibold text-base px-7 py-4 rounded-lg transition-opacity hover:opacity-80"
                style={{ border: '1.5px solid rgba(220,230,255,0.6)', color: '#fff' }}>
                {t.common.login}
              </Link>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="py-24 px-6" aria-label="תכונות הפורטל">
          <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
            <div className="text-center mb-16">
              <h2 style={{
                fontFamily: 'var(--font-frank-ruhl), Georgia, serif',
                fontWeight: 700,
                fontSize: '38px',
                color: 'var(--text)',
                marginBottom: '14px',
              }}>
                {t.home.featuresTitle}
              </h2>
              <p style={{ fontSize: '17px', color: 'var(--text-muted)' }}>
                {t.home.featuresSubtitle}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
              <FeatureCard numeral="01" title={t.home.features.theory.title} subtitle={t.home.features.theory.subtitle}
                points={t.home.features.theory.points} />
              <FeatureCard numeral="02" title={t.home.features.legislation.title} subtitle={t.home.features.legislation.subtitle}
                points={t.home.features.legislation.points} />
              <FeatureCard numeral="03" title={t.home.features.exam.title} subtitle={t.home.features.exam.subtitle}
                points={t.home.features.exam.points} />
              <FeatureCard numeral="04" title={t.home.features.progress.title} subtitle={t.home.features.progress.subtitle}
                points={t.home.features.progress.points} />
            </div>
          </div>
        </section>

        {/* CTA BAND */}
        <section style={{ background: 'var(--primary)', padding: '72px 48px', textAlign: 'center' }}>
          <h2 style={{
            fontFamily: 'var(--font-frank-ruhl), Georgia, serif',
            fontSize: '32px',
            fontWeight: 700,
            color: '#fff',
            marginBottom: '16px',
          }}>
            מוכנים להתחיל להתכונן?
          </h2>
          <p style={{ fontSize: '16px', color: 'rgba(200,215,255,0.85)', marginBottom: '32px' }}>
            הרשמה חד-פעמית, גישה מיידית לכל חומרי הלימוד והתרגול
          </p>
          <Link href="/register"
            className="inline-block font-bold text-base px-10 py-4 rounded-lg transition-opacity hover:opacity-90"
            style={{ background: 'var(--secondary)', color: 'var(--secondary-text)' }}>
            להרשמה
          </Link>
        </section>
      </main>

      {/* FOOTER */}
      <footer style={{ background: 'var(--bg)', borderTop: '1px solid var(--border)', padding: '32px 48px' }}
        className="flex items-center justify-between flex-wrap gap-4" role="contentinfo">
        <a href="https://www.tcb.ac.il" target="_blank" rel="noopener noreferrer">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/college-logo.png" alt="לוגו" style={{ height: '34px', width: 'auto' }} className="object-contain" />
        </a>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center' }}>
          {t.footer}
        </p>
        <div className="flex items-center gap-4">
          <Link href="/accessibility" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--primary)' }}>
            הצהרת נגישות
          </Link>
          <Link href="/privacy" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--primary)' }}>
            מדיניות פרטיות
          </Link>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ numeral, title, subtitle, points }: {
  numeral: string
  title: string
  subtitle: string
  points: string[]
}) {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid var(--border)',
      borderRadius: '14px',
      padding: '36px',
    }}>
      <div style={{
        fontFamily: 'var(--font-frank-ruhl), Georgia, serif',
        fontSize: '26px',
        fontWeight: 700,
        color: 'var(--secondary)',
        marginBottom: '18px',
      }}>
        {numeral}
      </div>
      <h3 style={{
        fontFamily: 'var(--font-frank-ruhl), Georgia, serif',
        fontSize: '22px',
        fontWeight: 600,
        color: 'var(--text)',
        marginBottom: '6px',
      }}>
        {title}
      </h3>
      <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '18px' }}>
        {subtitle}
      </p>
      <ul>
        {points.map((p, i) => (
          <li key={i} style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: '8px',
            fontSize: '15px',
            color: 'var(--text)',
            padding: '8px 0',
            borderTop: '1px solid var(--border)',
          }}>
            <span style={{ color: 'var(--primary)', fontWeight: 700, flexShrink: 0 }}>–</span>
            <span>{p}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
