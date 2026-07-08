'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { useLanguage } from '@/components/LanguageProvider'
import LanguageSwitcher from '@/components/LanguageSwitcher'

export default function RegisterPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password !== password2) { setError(t.auth.register.errorMismatch); return }
    if (password.length < 6) { setError(t.auth.register.errorShort); return }
    setLoading(true)

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, email, password }),
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error || t.auth.register.errorGeneric)
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    if (signInError) {
      setError(t.auth.register.successNeedsLogin)
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
          <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--primary)' }}>{t.auth.register.title}</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{t.auth.register.subtitle}</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4" noValidate>
          <div>
            <label htmlFor="reg-name" className="block text-sm font-medium mb-1">{t.auth.register.fullName}</label>
            <input id="reg-name" value={fullName} onChange={e => setFullName(e.target.value)}
              className="input-field" placeholder={t.auth.register.fullNamePlaceholder} required
              aria-required="true" autoComplete="name" />
          </div>
          <div>
            <label htmlFor="reg-email" className="block text-sm font-medium mb-1">{t.auth.register.email}</label>
            <input id="reg-email" type="email" value={email} onChange={e => setEmail(e.target.value)}
              className="input-field" placeholder="your@email.com" required dir="ltr"
              aria-required="true" autoComplete="email" />
          </div>
          <div>
            <label htmlFor="reg-password" className="block text-sm font-medium mb-1">{t.auth.register.password}</label>
            <input id="reg-password" type="password" value={password} onChange={e => setPassword(e.target.value)}
              className="input-field" placeholder={t.auth.register.passwordPlaceholder} required dir="ltr"
              aria-required="true" autoComplete="new-password" aria-describedby="reg-pass-hint" />
            <span id="reg-pass-hint" className="text-xs" style={{ color: 'var(--text-muted)' }}>לפחות 6 תווים</span>
          </div>
          <div>
            <label htmlFor="reg-password2" className="block text-sm font-medium mb-1">{t.auth.register.confirmPassword}</label>
            <input id="reg-password2" type="password" value={password2} onChange={e => setPassword2(e.target.value)}
              className="input-field" placeholder={t.auth.register.confirmPasswordPlaceholder} required dir="ltr"
              aria-required="true" autoComplete="new-password" />
          </div>

          <div role="alert" aria-live="assertive" aria-atomic="true">
            {error && (
              <div className="p-3 rounded-lg text-sm text-center" style={{ backgroundColor: '#fff5f5', color: 'var(--error)' }}>
                {error}
              </div>
            )}
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 text-base" aria-busy={loading}>
            {loading ? <><span className="spinner" aria-hidden="true" style={{ borderTopColor: 'white' }} /> {t.auth.register.submitting}</> : t.auth.register.submit}
          </button>
        </form>

        <p className="text-center text-sm mt-6" style={{ color: 'var(--text-muted)' }}>
          {t.auth.register.hasAccount}{' '}
          <Link href="/login" className="font-semibold" style={{ color: 'var(--primary)' }}>{t.auth.register.loginLink}</Link>
        </p>
        <p className="text-center mt-2">
          <Link href="/" className="text-sm" style={{ color: 'var(--text-muted)' }}>{t.common.backToHome}</Link>
        </p>
      </div>
    </div>
  )
}
