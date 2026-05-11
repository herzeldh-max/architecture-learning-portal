import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'פורטל לימוד - אדריכלות ועיצוב פנים',
  description: 'מערכת לימוד לסטודנטים לאדריכלות ועיצוב פנים - תורת הבנייה ותחיקת הבנייה',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <body className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
        {children}
      </body>
    </html>
  )
}
