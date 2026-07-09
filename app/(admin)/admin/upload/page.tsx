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

interface CourseImage {
  id: string
  title: string
  course: string
  file_size: number
  uploaded_at: string
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
  const [tab, setTab] = useState<'pdf' | 'image'>('pdf')

  // PDF state
  const [pdfs, setPdfs] = useState<PDF[]>([])
  const [pdfsLoading, setPdfsLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [title, setTitle] = useState('')
  const [course, setCourse] = useState('building_theory')
  const [semester, setSemester] = useState('A')
  const [file, setFile] = useState<File | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [extractStates, setExtractStates] = useState<Record<string, ExtractState>>({})

  // Image state
  const [images, setImages] = useState<CourseImage[]>([])
  const [imagesLoading, setImagesLoading] = useState(true)
  const [imgUploading, setImgUploading] = useState(false)
  const [imgTitle, setImgTitle] = useState('')
  const [imgCourse, setImgCourse] = useState('building_theory')
  const [imgFile, setImgFile] = useState<File | null>(null)
  const [imgMessage, setImgMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

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
    setPdfsLoading(true)
    const res = await fetch('/api/pdfs/list')
    const data = await res.json()
    setPdfs(data.pdfs || [])
    setPdfsLoading(false)
  }

  async function loadImages() {
    setImagesLoading(true)
    const res = await fetch('/api/images/list')
    const data = await res.json()
    setImages(data.images || [])
    setImagesLoading(false)
  }

  useEffect(() => { loadPdfs(); loadImages() }, [])

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    if (!file || !title) return
    setUploading(true)
    setMessage(null)

    try {
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

      setMessage({ type: 'success', text: 'מחלץ טקסט מהמצגת...' })
      const regRes = await fetch('/api/pdfs/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storagePath: urlData.storagePath, title, course, semester, fileSize: file.size }),
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

  async function handleImageUpload(e: React.FormEvent) {
    e.preventDefault()
    if (!imgFile || !imgTitle) return
    setImgUploading(true)
    setImgMessage(null)

    try {
      setImgMessage({ type: 'success', text: 'מכין העלאה...' })
      const urlRes = await fetch('/api/images/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ course: imgCourse, filename: imgFile.name }),
      })
      const urlData = await urlRes.json()
      if (!urlRes.ok) {
        setImgMessage({ type: 'error', text: urlData.error || 'שגיאה בהכנת ההעלאה' })
        setImgUploading(false)
        return
      }

      setImgMessage({ type: 'success', text: 'מעלה תמונה...' })
      const uploadRes = await fetch(urlData.signedUrl, {
        method: 'PUT',
        headers: { 'Content-Type': imgFile.type },
        body: imgFile,
      })
      if (!uploadRes.ok) {
        setImgMessage({ type: 'error', text: 'שגיאה בהעלאת התמונה לאחסון' })
        setImgUploading(false)
        return
      }

      const regRes = await fetch('/api/images/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storagePath: urlData.storagePath, title: imgTitle, course: imgCourse, fileSize: imgFile.size }),
      })
      if (regRes.ok) {
        setImgMessage({ type: 'success', text: 'התמונה הועלתה בהצלחה!' })
        setImgTitle(''); setImgFile(null)
        const input = document.getElementById('imgFileInput') as HTMLInputElement
        if (input) input.value = ''
        await loadImages()
      } else {
        const data = await regRes.json()
        setImgMessage({ type: 'error', text: data.error || 'שגיאה בשמירת התמונה' })
      }
    } catch {
      setImgMessage({ type: 'error', text: 'שגיאה בחיבור לשרת' })
    }
    setImgUploading(false)
  }

  async function handleImageDelete(id: string, title: string) {
    if (!confirm(`למחוק את "${title}"?`)) return
    const res = await fetch('/api/images/delete', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    if (res.ok) await loadImages()
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <a href="/admin" style={{ color: 'var(--text-muted)' }} className="text-sm">ממשק מנהל</a>
        <span style={{ color: 'var(--text-muted)' }}>›</span>
        <span className="text-sm font-medium">העלאת חומרי לימוד</span>
      </div>

      <div className="flex gap-2 mb-6">
        <button onClick={() => setTab('pdf')}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          style={tab === 'pdf' ? { backgroundColor: 'var(--primary)', color: 'white' } : { backgroundColor: 'var(--card)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
          מצגות PDF
        </button>
        <button onClick={() => setTab('image')}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          style={tab === 'image' ? { backgroundColor: 'var(--primary)', color: 'white' } : { backgroundColor: 'var(--card)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
          תמונות
        </button>
      </div>

      {tab === 'pdf' && (
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
                    {Object.entries(COURSE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
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
            {pdfsLoading ? (
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
      )}

      {tab === 'image' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="card p-6">
              <h2 className="font-bold text-lg mb-4" style={{ color: 'var(--primary)' }}>העלאת תמונה</h2>
              <form onSubmit={handleImageUpload} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">כותרת התמונה</label>
                  <input value={imgTitle} onChange={e => setImgTitle(e.target.value)}
                    className="input-field" placeholder="לדוגמה: פרט בנייה - חתך קיר" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">קורס</label>
                  <select value={imgCourse} onChange={e => setImgCourse(e.target.value)} className="input-field">
                    {Object.entries(COURSE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">קובץ תמונה (JPEG, PNG, WebP)</label>
                  <input id="imgFileInput" type="file" accept="image/jpeg,image/png,image/webp,image/jpg"
                    onChange={e => setImgFile(e.target.files?.[0] || null)}
                    className="input-field" required />
                  {imgFile && <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{imgFile.name} ({Math.round(imgFile.size / 1024)} KB)</p>}
                </div>

                {imgMessage && (
                  <div className="p-3 rounded-lg text-sm"
                    style={{ backgroundColor: imgMessage.type === 'success' ? '#f0fff4' : '#fff5f5', color: imgMessage.type === 'success' ? 'var(--success)' : 'var(--error)' }}>
                    {imgMessage.text}
                  </div>
                )}

                <button type="submit" disabled={imgUploading || !imgFile || !imgTitle} className="btn-primary w-full justify-center py-2.5">
                  {imgUploading ? <><span className="spinner" style={{ borderTopColor: 'white' }} /> מעלה...</> : 'העלה תמונה'}
                </button>
              </form>
            </div>
          </div>

          <div>
            <h2 className="font-bold text-lg mb-4" style={{ color: 'var(--primary)' }}>תמונות קיימות ({images.length})</h2>
            {imagesLoading ? (
              <div className="card p-8 text-center"><span className="spinner mx-auto"></span></div>
            ) : images.length === 0 ? (
              <div className="card p-6 text-center" style={{ color: 'var(--text-muted)' }}>אין תמונות עדיין</div>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {images.map(img => (
                  <div key={img.id} className="card p-3 flex items-center gap-3">
                    <span className="text-2xl flex-shrink-0">🖼️</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{img.title}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {COURSE_LABELS[img.course] || img.course} | {Math.round((img.file_size || 0) / 1024)} KB
                      </p>
                    </div>
                    <button onClick={() => handleImageDelete(img.id, img.title)}
                      className="text-red-500 hover:text-red-700 text-sm px-2 py-1 rounded flex-shrink-0">
                      מחק
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
