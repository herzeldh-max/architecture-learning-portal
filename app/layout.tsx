import type { Metadata } from 'next'
import { Heebo } from 'next/font/google'
import './globals.css'

const heebo = Heebo({
  subsets: ['hebrew', 'latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-heebo',
})

export const metadata: Metadata = {
  title: 'פורטל לימוד - אדריכלות ועיצוב פנים',
  description: 'מערכת לימוד לסטודנטים לאדריכלות ועיצוב פנים - תורת הבנייה ותחיקת הבנייה',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl" className={heebo.variable}>
      <body className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
        {children}
      </body>
    </html>
  )
}
