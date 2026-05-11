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

export default function UploadPage() {
  const [pdfs, setPdfs] = useState<PDF[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [title, setTitle] = useState('')
  const [course, setCourse] = useState('building_theory')
  const [semester, setSemester] = useState('A')
  const [file, setFile] = useState<File | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

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

    const fd = new FormData()
    fd.append('file', file)
    fd.append('title', title)
    fd.append('course', course)
    fd.append('semester', semester)

    try {
      const res = await fetch('/api/pdfs/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (res.ok) {
        setMessage({ type: 'success', text: `הקובץ הועלה בהצלחה! ${data.textLength > 0 ? `(${data.textLength} תווים נקרחו)` : '(לא נקרא טקסט)'}` })
        setTitle(''); setFile(null)
        const input = document.getElementById('fileInput') as HTMLInputElement
        if (input) input.value = ''
        await loadPdfs()
      } else {
        setMessage({ type: 'error', text: data.error || 'שגיאה בהעלאה' })
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
                {uploading ? <><span className="spinner" style={{ borderTopColor: 'white' }} /> מעלה ומחלץ טקסט...</> : 'העלה קובץ'}
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
                      {pdf.course === 'building_theory' ? 'תורת הבנייה' : 'תחיקת הבנייה'} |
                      סמסטר {pdf.semester === 'A' ? 'א' : pdf.semester === 'B' ? 'ב' : 'שניהם'} |
                      {Math.round((pdf.file_size || 0) / 1024)} KB |
                      {pdf.hasText ? ' ✅ טקסט נקרא' : ' ⚠️ ללא טקסט'}
                    </p>
                  </div>
                  <button onClick={() => handleDelete(pdf.id, pdf.title)}
                    className="text-red-500 hover:text-red-700 text-sm px-2 py-1 rounded flex-shrink-0">
                    מחק
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
