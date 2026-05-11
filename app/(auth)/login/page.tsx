'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('אימייל או סיסמה שגויים')
      setLoading(false)
    } else {
      router.refresh()
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="card p-8 w-full max-w-md">
        <div className="flex justify-end mb-4">
          <a href="https://www.tcb.ac.il" target="_blank" rel="noopener noreferrer">
            <Image
              src="/college-logo.png"
              alt="המכללה הטכנולוגית באר שבע"
              width={130}
              height={78}
              className="object-contain rounded"
            />
          </a>
        </div>
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--primary)' }}>כניסה לפורטל</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>פורטל לימוד - אדריכלות ועיצוב פנים</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">אימייל</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="input-field"
              placeholder="your@email.com"
              required
              dir="ltr"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">סיסמה</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="input-field"
              placeholder="••••••••"
              required
              dir="ltr"
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg text-sm text-center" style={{ backgroundColor: '#fff5f5', color: 'var(--error)' }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 text-base">
            {loading ? <><span className="spinner" style={{ borderTopColor: 'white' }} /> מתחבר...</> : 'כניסה'}
          </button>
        </form>

        <p className="text-center text-sm mt-6" style={{ color: 'var(--text-muted)' }}>
          אין לך חשבון?{' '}
          <Link href="/register" className="font-semibold" style={{ color: 'var(--primary)' }}>
            הרשמה
          </Link>
        </p>
        <p className="text-center mt-2">
          <Link href="/" className="text-sm" style={{ color: 'var(--text-muted)' }}>חזרה לדף הבית</Link>
        </p>
      </div>
    </div>
  )
}
