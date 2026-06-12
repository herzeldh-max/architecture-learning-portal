import type { Metadata } from 'next'
import { Heebo, Noto_Sans_Arabic } from 'next/font/google'
import { cookies } from 'next/headers'
import { LanguageProvider } from '@/components/LanguageProvider'
import { isValidLang } from '@/lib/i18n'
import './globals.css'

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

  return (
    <html lang={lang} dir="rtl" className={`${heebo.variable} ${notoSansArabic.variable}`}>
      <body className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
        <LanguageProvider initialLang={lang}>
          {children}
        </LanguageProvider>
      </body>
    </html>
  )
}
