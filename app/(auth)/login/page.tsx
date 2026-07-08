'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { useLanguage } from '@/components/LanguageProvider'
import LanguageSwitcher from '@/components/LanguageSwitcher'

export default function LoginPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const supabase = createClient()

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) {
      setError(t.auth.login.error)
      setLoading(false)
      return
    }

    // Initiate 2FA: send 5-digit code to email
    try {
      const res = await fetch('/api/auth/initiate-2fa', { method: 'POST' })
      const data = await res.json()

      // If email not configured or sending failed, go directly to dashboard
      if (data.skip) {
        router.refresh()
        router.push('/dashboard')
        return
      }

      if (data.maskedEmail) {
        sessionStorage.setItem('verify_masked_email', data.maskedEmail)
        sessionStorage.setItem('verify_email', email)
      }
      router.push('/verify-login')
    } catch {
      // Network error - go directly to dashboard
      router.refresh()
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="card p-8 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <LanguageSwitcher />
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
          <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--primary)' }}>{t.auth.login.title}</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{t.auth.login.subtitle}</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4" noValidate>
          <div>
            <label htmlFor="login-email" className="block text-sm font-medium mb-1">{t.auth.login.email}</label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="input-field"
              placeholder="your@email.com"
              required
              aria-required="true"
              dir="ltr"
              autoComplete="email"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="login-password" className="block text-sm font-medium">{t.auth.login.password}</label>
              <Link href="/forgot-password" className="text-sm font-semibold" style={{ color: 'var(--primary)' }}>
                {t.auth.login.forgotPasswordLink}
              </Link>
            </div>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="input-field"
              placeholder="••••••••"
              required
              aria-required="true"
              dir="ltr"
              autoComplete="current-password"
            />
          </div>

          <div role="alert" aria-live="assertive" aria-atomic="true">
            {error && (
              <div className="p-3 rounded-lg text-sm text-center" style={{ backgroundColor: '#fff5f5', color: 'var(--error)' }}>
                {error}
              </div>
            )}
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 text-base" aria-busy={loading}>
            {loading
              ? <><span className="spinner" aria-hidden="true" style={{ borderTopColor: 'white' }} /> {t.auth.login.submitting}</>
              : t.auth.login.submit}
          </button>
        </form>

        <p className="text-center text-sm mt-6" style={{ color: 'var(--text-muted)' }}>
          {t.auth.login.noAccount}{' '}
          <Link href="/register" className="font-semibold" style={{ color: 'var(--primary)' }}>
            {t.auth.login.registerLink}
          </Link>
        </p>
        <p className="text-center mt-2">
          <Link href="/" className="text-sm" style={{ color: 'var(--text-muted)' }}>{t.common.backToHome}</Link>
        </p>
      </div>
    </div>
  )
}
