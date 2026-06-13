'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { useLanguage } from '@/components/LanguageProvider'
import LanguageSwitcher from '@/components/LanguageSwitcher'

export default function ResetPasswordPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true)
      }
    })
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password !== password2) { setError(t.auth.resetPassword.errorMismatch); return }
    if (password.length < 6) { setError(t.auth.resetPassword.errorShort); return }
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (error) {
      setError(t.auth.resetPassword.errorGeneric)
    } else {
      setSuccess(true)
      setTimeout(() => router.push('/dashboard'), 2000)
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
          <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--primary)' }}>{t.auth.resetPassword.title}</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{t.auth.resetPassword.subtitle}</p>
        </div>

        {success ? (
          <div className="p-3 rounded-lg text-sm text-center" style={{ backgroundColor: '#f0fff4', color: 'var(--primary)' }}>
            {t.auth.resetPassword.success}
          </div>
        ) : !ready ? (
          <div className="p-3 rounded-lg text-sm text-center" style={{ backgroundColor: '#fff5f5', color: 'var(--error)' }}>
            {t.auth.resetPassword.invalidLink}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t.auth.resetPassword.password}</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="input-field"
                placeholder={t.auth.resetPassword.passwordPlaceholder}
                required
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t.auth.resetPassword.confirmPassword}</label>
              <input
                type="password"
                value={password2}
                onChange={e => setPassword2(e.target.value)}
                className="input-field"
                placeholder={t.auth.resetPassword.confirmPasswordPlaceholder}
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
              {loading ? <><span className="spinner" style={{ borderTopColor: 'white' }} /> {t.auth.resetPassword.submitting}</> : t.auth.resetPassword.submit}
            </button>
          </form>
        )}

        <p className="text-center text-sm mt-6">
          <Link href="/login" className="font-semibold" style={{ color: 'var(--primary)' }}>
            {t.auth.resetPassword.backToLogin}
          </Link>
        </p>
      </div>
    </div>
  )
}
