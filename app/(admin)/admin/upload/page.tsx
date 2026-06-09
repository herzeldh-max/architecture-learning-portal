'use client'

import { useState, useEffect } from 'react'

interface PDF {
  id: string
  title: string
  course: string
  semester: string
  file_size: number
  uploaded_at: string
  hasText: boolean
}

type ExtractState = 'idle' | 'loading' | 'done' | 'error'

const COURSE_LABELS: Record<string, string> = {
  building_theory: 'תורת הבנייה',
  building_legislation: 'תחיקת הבנייה',
  interior_design: 'עיצוב פנים',
  architectural_drawing: 'שרטוט אדריכלי',
  urban_planning: 'תכנון עירוני',
  structures: 'מבנים וקונסטרוקציה',
  history_of_architecture: 'היסטוריה של האדריכלות',
  other: 'אחר',
}

export default function UploadPage() {
  const [pdfs, setPdfs] = useState<PDF[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [title, setTitle] = useState('')
  const [course, setCourse] = useState('building_theory')
  const [semester, setSemester] = useState('A')
  const [file, setFile] = useState<File | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [extractStates, setExtractStates] = useState<Record<string, ExtractState>>({})

  async function handleExtractText(id: string) {
    setExtractStates(prev => ({ ...prev, [id]: 'loading' }))
    try {
      const res = await fetch('/api/pdfs/extract-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      const data = await res.json()
      if (res.ok) {
        setExtractStates(prev => ({ ...prev, [id]: 'done' }))
        await loadPdfs()
      } else {
        console.error(data.error)
        setExtractStates(prev => ({ ...prev, [id]: 'error' }))
      }
    } catch {
      setExtractStates(prev => ({ ...prev, [id]: 'error' }))
    }
  }

  async function loadPdfs() {
    setLoading(true)
    const res = await fetch('/api/pdfs/list')
    const data = await res.json()
    setPdfs(data.pdfs || [])
    setLoading(false)
  }

  useEffect(() => { loadPdfs() }, [])

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    if (!file || !title) return
    setUploading(true)
    setMessage(null)

    try {
      // שלב 1: קבלת URL חתום להעלאה ישירה ל-Supabase (עוקף מגבלת 4.5MB של Vercel)
      setMessage({ type: 'success', text: 'מכין העלאה...' })
      const urlRes = await fetch('/api/pdfs/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ course, semester, filename: file.name }),
      })
      const urlData = await urlRes.json()
      if (!urlRes.ok) {
        setMessage({ type: 'error', text: urlData.error || 'שגיאה בהכנת ההעלאה' })
        setUploading(false)
        return
      }

      // שלב 2: העלאה ישירה ל-Supabase Storage (ללא מגבלת גודל)
      setMessage({ type: 'success', text: `מעלה קובץ (${Math.round(file.size / 1024 / 1024 * 10) / 10} MB)...` })
      const uploadRes = await fetch(urlData.signedUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/pdf' },
        body: file,
      })
      if (!uploadRes.ok) {
        setMessage({ type: 'error', text: 'שגיאה בהעלאת הקובץ לאחסון' })
        setUploading(false)
        return
      }

      // שלב 3: רישום ב-DB + חילוץ טקסט
      setMessage({ type: 'success', text: 'מחלץ טקסט מהמצגת...' })
      const regRes = await fetch('/api/pdfs/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storagePath: urlData.storagePath,
          title,
          course,
          semester,
          fileSize: file.size,
        }),
      })
      const regData = await regRes.json()
      if (regRes.ok) {
        setMessage({
          type: 'success',
          text: `הקובץ הועלה בהצלחה! ${regData.textLength > 0 ? `(${regData.textLength} תווים נחלצו)` : '(לא נחלץ טקסט)'}`,
        })
        setTitle(''); setFile(null)
        const input = document.getElementById('fileInput') as HTMLInputElement
        if (input) input.value = ''
        await loadPdfs()
      } else {
        setMessage({ type: 'error', text: regData.error || 'שגיאה בשמירת הקובץ' })
      }
    } catch {
      setMessage({ type: 'error', text: 'שגיאה בחיבור לשרת' })
    }
    setUploading(false)
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`למחוק את "${title}"?`)) return
    const res = await fetch('/api/pdfs/delete', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    if (res.ok) await loadPdfs()
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <a href="/admin" style={{ color: 'var(--text-muted)' }} className="text-sm">ממשק מנהל</a>
        <span style={{ color: 'var(--text-muted)' }}>›</span>
        <span className="text-sm font-medium">העלאת מצגות</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="card p-6">
            <h2 className="font-bold text-lg mb-4" style={{ color: 'var(--primary)' }}>העלאת קובץ PDF</h2>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">שם המצגה</label>
                <input value={title} onChange={e => setTitle(e.target.value)}
                  className="input-field" placeholder="לדוגמה: מבוא לחומרי בנייה" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">קורס</label>
                <select value={course} onChange={e => setCourse(e.target.value)} className="input-field">
                  <option value="building_theory">תורת הבנייה</option>
                  <option value="building_legislation">תחיקת הבנייה</option>
                  <option value="interior_design">עיצוב פנים</option>
                  <option value="architectural_drawing">שרטוט אדריכלי</option>
                  <option value="urban_planning">תכנון עירוני</option>
                  <option value="structures">מבנים וקונסטרוקציה</option>
                  <option value="history_of_architecture">היסטוריה של האדריכלות</option>
                  <option value="other">אחר</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">סמסטר</label>
                <div className="flex gap-2">
                  {[['A', "א'"], ['B', "ב'"], ['both', 'שניהם']].map(([v, l]) => (
                    <button key={v} type="button" onClick={() => setSemester(v)}
                      className="flex-1 py-2 text-sm rounded-lg border-2 font-medium transition-colors"
                      style={semester === v ? { backgroundColor: 'var(--primary)', borderColor: 'var(--primary)', color: 'white' } : { borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">קובץ PDF</label>
                <input id="fileInput" type="file" accept=".pdf"
                  onChange={e => setFile(e.target.files?.[0] || null)}
                  className="input-field" required />
                {file && <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{file.name} ({Math.round(file.size / 1024)} KB)</p>}
              </div>

              {message && (
                <div className="p-3 rounded-lg text-sm"
                  style={{ backgroundColor: message.type === 'success' ? '#f0fff4' : '#fff5f5', color: message.type === 'success' ? 'var(--success)' : 'var(--error)' }}>
                  {message.text}
                </div>
              )}

              <button type="submit" disabled={uploading || !file || !title} className="btn-primary w-full justify-center py-2.5">
                {uploading
                  ? <><span className="spinner" style={{ borderTopColor: 'white' }} /> {message?.text || 'מעלה...'}</>
                  : 'העלה קובץ'}
              </button>
            </form>
          </div>
        </div>

        <div>
          <h2 className="font-bold text-lg mb-4" style={{ color: 'var(--primary)' }}>קבצים קיימים ({pdfs.length})</h2>
          {loading ? (
            <div className="card p-8 text-center"><span className="spinner mx-auto"></span></div>
          ) : pdfs.length === 0 ? (
            <div className="card p-6 text-center" style={{ color: 'var(--text-muted)' }}>אין קבצים עדיין</div>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {pdfs.map(pdf => (
                <div key={pdf.id} className="card p-3 flex items-center gap-3">
                  <span className="text-2xl flex-shrink-0">📄</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{pdf.title}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {COURSE_LABELS[pdf.course] || pdf.course} |
                      סמסטר {pdf.semester === 'A' ? 'א' : pdf.semester === 'B' ? 'ב' : 'שניהם'} |
                      {Math.round((pdf.file_size || 0) / 1024)} KB |
                      {pdf.hasText ? ' ✅ טקסט נקרא' : ' ⚠️ ללא טקסט'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {!pdf.hasText && (
                      <button
                        onClick={() => handleExtractText(pdf.id)}
                        disabled={extractStates[pdf.id] === 'loading'}
                        title="חלץ טקסט באמצעות AI"
                        className="text-xs px-2 py-1 rounded border font-medium transition-colors"
                        style={{
                          borderColor: extractStates[pdf.id] === 'done' ? 'var(--success)' :
                                       extractStates[pdf.id] === 'error' ? 'var(--error)' : 'var(--primary)',
                          color: extractStates[pdf.id] === 'done' ? 'var(--success)' :
                                 extractStates[pdf.id] === 'error' ? 'var(--error)' : 'var(--primary)',
                        }}
                      >
                        {extractStates[pdf.id] === 'loading' ? '⏳ מחלץ...' :
                         extractStates[pdf.id] === 'done' ? '✅ הושלם' :
                         extractStates[pdf.id] === 'error' ? '❌ נכשל' :
                         '🔍 חלץ טקסט'}
                      </button>
                    )}
                    <button onClick={() => handleDelete(pdf.id, pdf.title)}
                      className="text-red-500 hover:text-red-700 text-sm px-2 py-1 rounded flex-shrink-0">
                      מחק
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
