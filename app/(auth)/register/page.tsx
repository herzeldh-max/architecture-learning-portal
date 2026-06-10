'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

export default function RegisterPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password !== password2) { setError('הסיסמאות אינן תואמות'); return }
    if (password.length < 6) { setError('הסיסמה חייבת להכיל לפחות 6 תווים'); return }
    setLoading(true)

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, email, password }),
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error || 'שגיאה בהרשמה')
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    if (signInError) {
      setError('נרשמת בהצלחה! אנא התחבר.')
      setLoading(false)
      router.push('/login')
      return
    }
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="card p-8 w-full max-w-md">
        <div className="flex justify-end mb-4">
          <a href="https://www.tcb.ac.il" target="_blank" rel="noopener noreferrer">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/college-logo.png"
              alt="המכללה הטכנולוגית באר שבע"
              style={{ width: '130px', height: 'auto' }}
              className="object-contain rounded"
            />
          </a>
        </div>
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--primary)' }}>הרשמה לפורטל</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>פורטל לימוד - אדריכלות ועיצוב פנים</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">שם מלא</label>
            <input value={fullName} onChange={e => setFullName(e.target.value)}
              className="input-field" placeholder="ישראל ישראלי" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">אימייל</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              className="input-field" placeholder="your@email.com" required dir="ltr" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">סיסמה</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              className="input-field" placeholder="לפחות 6 תווים" required dir="ltr" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">אימות סיסמה</label>
            <input type="password" value={password2} onChange={e => setPassword2(e.target.value)}
              className="input-field" placeholder="הכנס שוב את הסיסמה" required dir="ltr" />
          </div>

          {error && (
            <div className="p-3 rounded-lg text-sm text-center" style={{ backgroundColor: '#fff5f5', color: 'var(--error)' }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 text-base">
            {loading ? <><span className="spinner" style={{ borderTopColor: 'white' }} /> נרשם...</> : 'הרשמה'}
          </button>
        </form>

        <p className="text-center text-sm mt-6" style={{ color: 'var(--text-muted)' }}>
          כבר רשום?{' '}
          <Link href="/login" className="font-semibold" style={{ color: 'var(--primary)' }}>כניסה</Link>
        </p>
        <p className="text-center mt-2">
          <Link href="/" className="text-sm" style={{ color: 'var(--text-muted)' }}>חזרה לדף הבית</Link>
        </p>
      </div>
    </div>
  )
}
