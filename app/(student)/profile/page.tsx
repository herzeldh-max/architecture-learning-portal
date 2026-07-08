'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'

type Step = 'idle' | 'confirmPass' | 'newValue' | 'done'

function ProfileSection({ title, icon, description, children }: {
  title: string; icon: string; description: string; children: React.ReactNode
}) {
  return (
    <div className="card p-6">
      <div className="flex items-center gap-3 mb-1">
        <span className="text-2xl">{icon}</span>
        <h2 className="text-lg font-bold" style={{ color: 'var(--primary)' }}>{title}</h2>
      </div>
      <p className="text-sm mb-4 pr-9" style={{ color: 'var(--text-muted)' }}>{description}</p>
      {children}
    </div>
  )
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<{ email: string; full_name: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)

  // Name change state
  const [nameStep, setNameStep] = useState<Step>('idle')
  const [nameCurrentPass, setNameCurrentPass] = useState('')
  const [namePassError, setNamePassError] = useState('')
  const [namePassLoading, setNamePassLoading] = useState(false)
  const [newName, setNewName] = useState('')
  const [nameSaving, setNameSaving] = useState(false)

  // Password change state
  const [passStep, setPassStep] = useState<Step>('idle')
  const [passCurrentPass, setPassCurrentPass] = useState('')
  const [passPassError, setPassPassError] = useState('')
  const [passPassLoading, setPassPassLoading] = useState(false)
  const [newPass, setNewPass] = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [passSaving, setPassSaving] = useState(false)

  function showToast(msg: string, ok: boolean) {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3500)
  }

  useEffect(() => {
    fetch('/api/profile')
      .then(r => r.json())
      .then(d => { setProfile(d); setNewName(d.full_name || '') })
      .finally(() => setLoading(false))
  }, [])

  async function verifyCurrentPassword(currentPassword: string): Promise<boolean> {
    if (!profile?.email) return false
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email: profile.email,
      password: currentPassword,
    })
    return !error
  }

  // ---- NAME FLOW ----
  async function confirmNamePassword() {
    if (!nameCurrentPass) { setNamePassError('הכנס את הסיסמה הנוכחית'); return }
    setNamePassLoading(true)
    setNamePassError('')
    const ok = await verifyCurrentPassword(nameCurrentPass)
    if (ok) {
      setNameStep('newValue')
      setNamePassError('')
    } else {
      setNamePassError('סיסמה שגויה. נסה שוב.')
    }
    setNamePassLoading(false)
  }

  async function saveName() {
    if (!newName.trim() || newName.trim() === profile?.full_name) return
    setNameSaving(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'name', newValue: newName.trim() }),
      })
      if (res.ok) {
        setProfile(p => p ? { ...p, full_name: newName.trim() } : p)
        setNameStep('idle')
        setNameCurrentPass('')
        showToast('השם עודכן בהצלחה', true)
      } else {
        showToast('שגיאה בעדכון השם', false)
      }
    } catch {
      showToast('שגיאה בחיבור לשרת', false)
    }
    setNameSaving(false)
  }

  // ---- PASSWORD FLOW ----
  async function confirmPassPassword() {
    if (!passCurrentPass) { setPassPassError('הכנס את הסיסמה הנוכחית'); return }
    setPassPassLoading(true)
    setPassPassError('')
    const ok = await verifyCurrentPassword(passCurrentPass)
    if (ok) {
      setPassStep('newValue')
      setPassPassError('')
    } else {
      setPassPassError('סיסמה שגויה. נסה שוב.')
    }
    setPassPassLoading(false)
  }

  async function savePassword() {
    if (newPass.length < 6) { showToast('הסיסמה חייבת להכיל לפחות 6 תווים', false); return }
    if (newPass !== confirmPass) { showToast('הסיסמאות אינן תואמות', false); return }
    setPassSaving(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'password', newValue: newPass }),
      })
      if (res.ok) {
        setPassStep('idle')
        setPassCurrentPass('')
        setNewPass('')
        setConfirmPass('')
        showToast('הסיסמה עודכנה בהצלחה', true)
      } else {
        showToast('שגיאה בעדכון הסיסמה', false)
      }
    } catch {
      showToast('שגיאה בחיבור לשרת', false)
    }
    setPassSaving(false)
  }

  if (loading) return <div className="card p-8 text-center"><span className="spinner mx-auto"></span></div>

  return (
    <div className="max-w-xl mx-auto">
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-semibold text-white"
          style={{ backgroundColor: toast.ok ? 'var(--success)' : 'var(--error)', minWidth: '220px', textAlign: 'center' }}>
          {toast.msg}
        </div>
      )}

      <h1 className="text-xl font-bold mb-6" style={{ color: 'var(--primary)' }}>הפרופיל שלי</h1>

      {/* Info card */}
      <div className="card p-5 mb-4" style={{ borderRight: '4px solid var(--primary)' }}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold text-white"
            style={{ backgroundColor: 'var(--primary)' }}>
            {profile?.full_name?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <p className="font-bold text-base">{profile?.full_name || 'ללא שם'}</p>
            <p className="text-sm" style={{ color: 'var(--text-muted)', direction: 'ltr' }}>{profile?.email}</p>
          </div>
        </div>
      </div>

      {/* Change name */}
      <div className="mb-4">
        <ProfileSection icon="✏️" title="שינוי שם משתמש" description="שנה את השם שמוצג בפורטל. תידרש להזין את הסיסמה הנוכחית לאישור.">
          {nameStep === 'idle' && (
            <button onClick={() => setNameStep('confirmPass')} className="btn-primary">
              שנה שם משתמש
            </button>
          )}
          {nameStep === 'confirmPass' && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">סיסמה נוכחית לאישור</label>
                <input
                  type="password"
                  value={nameCurrentPass}
                  onChange={e => { setNameCurrentPass(e.target.value); setNamePassError('') }}
                  onKeyDown={e => e.key === 'Enter' && confirmNamePassword()}
                  className="input-field"
                  placeholder="הכנס סיסמה נוכחית"
                  dir="ltr"
                  autoFocus
                />
                {namePassError && <p className="text-sm mt-1" style={{ color: 'var(--error)' }}>{namePassError}</p>}
              </div>
              <div className="flex gap-2">
                <button onClick={confirmNamePassword} disabled={namePassLoading || !nameCurrentPass} className="btn-primary flex-1 justify-center">
                  {namePassLoading ? 'מאמת...' : 'אמת'}
                </button>
                <button onClick={() => { setNameStep('idle'); setNameCurrentPass(''); setNamePassError('') }}
                  className="flex-1 py-2 rounded-lg border text-sm font-semibold"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                  ביטול
                </button>
              </div>
            </div>
          )}
          {nameStep === 'newValue' && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">שם מלא חדש</label>
                <input
                  type="text"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && saveName()}
                  className="input-field"
                  placeholder="הכנס שם מלא"
                  autoFocus
                />
              </div>
              <div className="flex gap-2">
                <button onClick={saveName} disabled={nameSaving || !newName.trim() || newName.trim() === profile?.full_name} className="btn-primary flex-1 justify-center">
                  {nameSaving ? 'שומר...' : 'שמור שם'}
                </button>
                <button onClick={() => { setNameStep('idle'); setNameCurrentPass(''); setNewName(profile?.full_name || '') }}
                  className="flex-1 py-2 rounded-lg border text-sm font-semibold"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                  ביטול
                </button>
              </div>
            </div>
          )}
        </ProfileSection>
      </div>

      {/* Change password */}
      <ProfileSection icon="🔒" title="שינוי סיסמה" description="שנה את הסיסמה לחשבונך. תידרש להזין את הסיסמה הנוכחית לאישור.">
        {passStep === 'idle' && (
          <button onClick={() => setPassStep('confirmPass')} className="btn-primary">
            שנה סיסמה
          </button>
        )}
        {passStep === 'confirmPass' && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">סיסמה נוכחית לאישור</label>
              <input
                type="password"
                value={passCurrentPass}
                onChange={e => { setPassCurrentPass(e.target.value); setPassPassError('') }}
                onKeyDown={e => e.key === 'Enter' && confirmPassPassword()}
                className="input-field"
                placeholder="הכנס סיסמה נוכחית"
                dir="ltr"
                autoFocus
              />
              {passPassError && <p className="text-sm mt-1" style={{ color: 'var(--error)' }}>{passPassError}</p>}
            </div>
            <div className="flex gap-2">
              <button onClick={confirmPassPassword} disabled={passPassLoading || !passCurrentPass} className="btn-primary flex-1 justify-center">
                {passPassLoading ? 'מאמת...' : 'אמת'}
              </button>
              <button onClick={() => { setPassStep('idle'); setPassCurrentPass(''); setPassPassError('') }}
                className="flex-1 py-2 rounded-lg border text-sm font-semibold"
                style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                ביטול
              </button>
            </div>
          </div>
        )}
        {passStep === 'newValue' && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">סיסמה חדשה</label>
              <input type="password" value={newPass} onChange={e => setNewPass(e.target.value)}
                className="input-field" placeholder="לפחות 6 תווים" dir="ltr" autoFocus />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">אימות סיסמה</label>
              <input type="password" value={confirmPass} onChange={e => setConfirmPass(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && savePassword()}
                className="input-field" placeholder="הכנס שוב את הסיסמה" dir="ltr" />
            </div>
            {newPass && confirmPass && newPass !== confirmPass && (
              <p className="text-sm" style={{ color: 'var(--error)' }}>הסיסמאות אינן תואמות</p>
            )}
            <div className="flex gap-2">
              <button onClick={savePassword} disabled={passSaving || newPass.length < 6 || newPass !== confirmPass} className="btn-primary flex-1 justify-center">
                {passSaving ? 'שומר...' : 'שמור סיסמה'}
              </button>
              <button onClick={() => { setPassStep('idle'); setPassCurrentPass(''); setNewPass(''); setConfirmPass('') }}
                className="flex-1 py-2 rounded-lg border text-sm font-semibold"
                style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                ביטול
              </button>
            </div>
          </div>
        )}
      </ProfileSection>
    </div>
  )
}
