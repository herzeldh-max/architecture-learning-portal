import type { Metadata } from 'next'
import { Heebo, Noto_Sans_Arabic, Frank_Ruhl_Libre } from 'next/font/google'
import { cookies } from 'next/headers'
import { LanguageProvider } from '@/components/LanguageProvider'
import { isValidLang } from '@/lib/i18n'
import A11yWidget from '@/components/A11yWidget'
import './globals.css'

const frankRuhlLibre = Frank_Ruhl_Libre({
  subsets: ['hebrew', 'latin'],
  weight: ['400', '500', '600', '700', '900'],
  variable: '--font-frank-ruhl',
})

const heebo = Heebo({
  subsets: ['hebrew', 'latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-heebo',
})

const notoSansArabic = Noto_Sans_Arabic({
  subsets: ['arabic', 'latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-noto-arabic',
})

export const metadata: Metadata = {
  title: 'פורטל לימוד - אדריכלות ועיצוב פנים',
  description: 'מערכת לימוד לסטודנטים לאדריכלות ועיצוב פנים - תורת הבנייה ותחיקת הבנייה',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const langCookie = cookieStore.get('lang')?.value
  const lang = isValidLang(langCookie) ? langCookie : 'he'

  const bootstrapScript = `(function(){try{var p=JSON.parse(localStorage.getItem('a11y_prefs_v1')||'{}');var c=document.documentElement.classList;c.toggle('a11y-contrast-high',!!p.highContrast);c.toggle('a11y-text-large',!!p.largeText);c.toggle('a11y-links',!!p.highlightLinks);c.toggle('a11y-reduce-motion',!!p.reduceMotion);c.toggle('a11y-readable-font',!!p.readableFont);}catch(e){}})();`

  return (
    <html lang={lang} dir="rtl" className={`${heebo.variable} ${notoSansArabic.variable} ${frankRuhlLibre.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootstrapScript }} />
      </head>
      <body className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
        <a href="#main-content" className="skip-link">
          {lang === 'ar' ? 'تخطى إلى المحتوى الرئيسي' : 'דלג לתוכן הראשי'}
        </a>
        <LanguageProvider initialLang={lang}>
          {children}
        </LanguageProvider>
        <A11yWidget lang={lang} />
        <div role="status" aria-live="polite" aria-atomic="true" className="sr-only" id="a11y-announcer" />
      </body>
    </html>
  )
}
