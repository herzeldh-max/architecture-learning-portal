'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

export default function VerifyLoginPage() {
  const router = useRouter()
  const [code, setCode] = useState(['', '', '', '', ''])
  const [maskedEmail, setMaskedEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    const email = sessionStorage.getItem('verify_masked_email') || ''
    setMaskedEmail(email)
    inputRefs.current[0]?.focus()
  }, [])

  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(c => c - 1), 1000)
      return () => clearTimeout(t)
    }
  }, [countdown])

  function handleDigit(index: number, value: string) {
    if (!/^\d?$/.test(value)) return
    const next = [...code]
    next[index] = value
    setCode(next)
    setError('')
    if (value && index < 4) {
      inputRefs.current[index + 1]?.focus()
    }
    if (value && index === 4 && next.every(d => d !== '')) {
      submitCode(next.join(''))
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 5)
    if (text.length === 5) {
      const next = text.split('')
      setCode(next)
      inputRefs.current[4]?.focus()
      setTimeout(() => submitCode(text), 50)
    }
  }

  async function submitCode(codeStr: string) {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/complete-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codeStr }),
      })
      const data = await res.json()
      if (data.ok) {
        setSuccess(true)
        sessionStorage.removeItem('verify_masked_email')
        sessionStorage.removeItem('verify_email')
        setTimeout(() => router.push('/dashboard'), 600)
      } else if (data.error === 'expired') {
        setError('הקוד פג תוקף. לחץ "שלח שוב" לקבל קוד חדש.')
        setCode(['', '', '', '', ''])
        inputRefs.current[0]?.focus()
      } else {
        setError('הקוד שגוי. נסה שוב.')
        setCode(['', '', '', '', ''])
        inputRefs.current[0]?.focus()
      }
    } catch {
      setError('שגיאה בחיבור לשרת. נסה שוב.')
    }
    setLoading(false)
  }

  async function resend() {
    setResending(true)
    setError('')
    try {
      const res = await fetch('/api/auth/initiate-2fa', { method: 'POST' })
      const data = await res.json()
      if (data.skip) {
        // Email not configured - go to dashboard
        router.push('/dashboard')
        return
      }
      if (data.maskedEmail) {
        setMaskedEmail(data.maskedEmail)
        sessionStorage.setItem('verify_masked_email', data.maskedEmail)
      }
      setCode(['', '', '', '', ''])
      setCountdown(60)
      inputRefs.current[0]?.focus()
    } catch {
      setError('שגיאה בשליחת הקוד. נסה שוב.')
    }
    setResending(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="card p-8 w-full max-w-md text-center">
        <div className="text-5xl mb-4">🔐</div>
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--primary)' }}>אימות כניסה</h1>
        <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>
          שלחנו קוד אימות בן 5 ספרות למייל שנרשמת איתו:
        </p>
        {maskedEmail && (
          <p className="font-semibold mb-2" style={{ color: 'var(--primary)', direction: 'ltr' }}>
            {maskedEmail}
          </p>
        )}
        <p className="text-xs mb-6" style={{ color: 'var(--text-muted)' }}>
          אם לא קיבלת -- בדוק בתיקיית דואר זבל (Spam)
        </p>

        {success ? (
          <div className="py-6">
            <div className="text-4xl mb-2">✅</div>
            <p className="font-semibold" style={{ color: 'var(--success)' }}>אומת בהצלחה! מעביר לפורטל...</p>
          </div>
        ) : (
          <>
            <div className="flex justify-center gap-3 mb-6" dir="ltr" onPaste={handlePaste}>
              {code.map((digit, i) => (
                <input
                  key={i}
                  ref={el => { inputRefs.current[i] = el }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleDigit(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  disabled={loading}
                  className="text-center text-2xl font-bold rounded-xl border-2 transition-all"
                  style={{
                    width: '52px',
                    height: '64px',
                    borderColor: digit ? 'var(--primary)' : 'var(--border)',
                    backgroundColor: digit ? '#ebf4ff' : 'white',
                    outline: 'none',
                    color: 'var(--primary)',
                  }}
                />
              ))}
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg text-sm" style={{ backgroundColor: '#fff5f5', color: 'var(--error)' }}>
                {error}
              </div>
            )}

            <button
              onClick={() => submitCode(code.join(''))}
              disabled={loading || code.some(d => !d)}
              className="btn-primary w-full justify-center py-3 text-base mb-4"
            >
              {loading ? <><span className="spinner" style={{ borderTopColor: 'white' }} /> מאמת...</> : 'אמת קוד'}
            </button>

            <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
              לא קיבלת קוד?{' '}
              {countdown > 0 ? (
                <span>שלח שוב בעוד {countdown} שניות</span>
              ) : (
                <button
                  onClick={resend}
                  disabled={resending}
                  className="font-semibold underline"
                  style={{ color: 'var(--primary)' }}
                >
                  {resending ? 'שולח...' : 'שלח שוב'}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
