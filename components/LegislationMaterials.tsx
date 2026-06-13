'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from './LanguageProvider'

interface PDF {
  id: string
  title: string
  file_size: number
  uploaded_at: string
  hasText: boolean
}

export default function LegislationMaterials({ isAdmin }: { isAdmin: boolean }) {
  const { t, lang } = useLanguage()
  const dateLocale = lang === 'ar' ? 'ar' : 'he-IL'

  const [pdfs, setPdfs] = useState<PDF[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [title, setTitle] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  async function loadPdfs() {
    setLoading(true)
    const res = await fetch('/api/pdfs/list?course=building_legislation')
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
      const urlRes = await fetch('/api/pdfs/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ course: 'building_legislation', semester: 'both', filename: file.name }),
      })
      const urlData = await urlRes.json()
      if (!urlRes.ok) {
        setMessage({ type: 'error', text: urlData.error || t.buildingLegislation.upload.error })
        setUploading(false)
        return
      }

      const uploadRes = await fetch(urlData.signedUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/pdf' },
        body: file,
      })
      if (!uploadRes.ok) {
        setMessage({ type: 'error', text: t.buildingLegislation.upload.error })
        setUploading(false)
        return
      }

      const regRes = await fetch('/api/pdfs/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storagePath: urlData.storagePath,
          title,
          course: 'building_legislation',
          semester: 'both',
          fileSize: file.size,
        }),
      })
      if (regRes.ok) {
        setMessage({ type: 'success', text: t.buildingLegislation.upload.success })
        setTitle(''); setFile(null)
        const input = document.getElementById('legislationFileInput') as HTMLInputElement
        if (input) input.value = ''
        await loadPdfs()
      } else {
        setMessage({ type: 'error', text: t.buildingLegislation.upload.error })
      }
    } catch {
      setMessage({ type: 'error', text: t.buildingLegislation.upload.error })
    }
    setUploading(false)
  }

  async function handleDelete(id: string) {
    if (!confirm(t.buildingLegislation.upload.deleteConfirm)) return
    const res = await fetch('/api/pdfs/delete', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    if (res.ok) await loadPdfs()
  }

  return (
    <div>
      {isAdmin && (
        <div className="card p-4 mb-4">
          <h2 className="font-bold mb-3 text-sm" style={{ color: 'var(--primary)' }}>{t.buildingLegislation.upload.title}</h2>
          <form onSubmit={handleUpload} className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">{t.buildingLegislation.upload.nameLabel}</label>
              <input value={title} onChange={e => setTitle(e.target.value)}
                className="input-field" placeholder={t.buildingLegislation.upload.namePlaceholder} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t.buildingLegislation.upload.fileLabel}</label>
              <input id="legislationFileInput" type="file" accept=".pdf"
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

            <button type="submit" disabled={uploading || !file || !title} className="btn-primary w-full justify-center py-2.5" style={{ backgroundColor: '#2d6a4f' }}>
              {uploading
                ? <><span className="spinner" style={{ borderTopColor: 'white' }} /> {t.buildingLegislation.upload.uploading}</>
                : t.buildingLegislation.upload.submit}
            </button>
          </form>
        </div>
      )}

      <div className="card p-4">
        <h2 className="font-bold mb-3 text-sm" style={{ color: 'var(--primary)' }}>
          {isAdmin ? t.buildingLegislation.upload.existingTitle : t.buildingLegislation.materialsTitle}
        </h2>
        {loading ? (
          <div className="p-6 text-center"><span className="spinner mx-auto"></span></div>
        ) : pdfs.length === 0 ? (
          <div className="p-6 text-center" style={{ color: 'var(--text-muted)' }}>
            <p className="mb-1">{t.buildingLegislation.noMaterials}</p>
            <p className="text-xs">{t.buildingLegislation.noMaterialsSub}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {pdfs.map(pdf => (
              <div key={pdf.id} className="flex items-center gap-3 p-2 rounded-lg border" style={{ borderColor: 'var(--border)' }}>
                <span className="text-2xl flex-shrink-0">📄</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{pdf.title}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {new Date(pdf.uploaded_at).toLocaleDateString(dateLocale)} · {Math.round((pdf.file_size || 0) / 1024)} KB
                  </p>
                </div>
                {isAdmin && (
                  <button onClick={() => handleDelete(pdf.id)} className="text-red-500 hover:text-red-700 text-sm px-2 py-1 rounded flex-shrink-0">
                    {t.buildingLegislation.upload.delete}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
