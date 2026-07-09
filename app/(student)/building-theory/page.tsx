import { createClient, createAdminClient } from '@/lib/supabase-server'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { getDictionary, isValidLang } from '@/lib/i18n'

export default async function BuildingTheoryPage() {
  const supabase = await createClient()
  const adminClient = createAdminClient()

  const { data: pdfs } = await supabase
    .from('pdfs')
    .select('id, title, semester, uploaded_at, file_size, storage_path')
    .eq('course', 'building_theory')
    .order('semester')
    .order('uploaded_at', { ascending: true })

  const pdfsWithUrls = await Promise.all((pdfs || []).map(async pdf => {
    if (!pdf.storage_path) return { ...pdf, signedUrl: null }
    const { data } = await adminClient.storage.from('pdfs').createSignedUrl(pdf.storage_path, 3600)
    return { ...pdf, signedUrl: data?.signedUrl || null }
  }))

  const { data: images } = await adminClient
    .from('course_images')
    .select('id, title, storage_path, file_size, uploaded_at')
    .eq('course', 'building_theory')
    .order('uploaded_at', { ascending: true })

  const imagesWithUrls = await Promise.all((images || []).map(async img => {
    const { data } = await adminClient.storage.from('images').createSignedUrl(img.storage_path, 3600)
    return { ...img, url: data?.signedUrl || null }
  }))

  const semesterA = pdfsWithUrls.filter(p => p.semester === 'A')
  const semesterB = pdfsWithUrls.filter(p => p.semester === 'B')
  const both = pdfsWithUrls.filter(p => p.semester === 'both')

  const cookieStore = await cookies()
  const langCookie = cookieStore.get('lang')?.value
  const lang = isValidLang(langCookie) ? langCookie : 'he'
  const t = getDictionary(lang)
  const dateLocale = lang === 'ar' ? 'ar' : 'he-IL'

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--primary)' }}>{t.buildingTheory.title}</h1>
          <p style={{ color: 'var(--text-muted)' }}>{t.buildingTheory.subtitle}</p>
        </div>
        <div className="flex gap-3">
          <Link href="/building-theory/chat">
            <button className="btn-secondary">{t.buildingTheory.chatButton}</button>
          </Link>
          <Link href="/building-theory/exam">
            <button className="btn-primary">{t.buildingTheory.examButton}</button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <QuickLink href="/building-theory/chat" icon="💬" title={t.buildingTheory.quickLinks.chat.title}
          desc={t.buildingTheory.quickLinks.chat.desc} />
        <QuickLink href="/building-theory/exam?semester=A" icon="📝" title={t.buildingTheory.quickLinks.examA.title}
          desc={t.buildingTheory.quickLinks.examA.desc} />
        <QuickLink href="/building-theory/exam?semester=B" icon="📝" title={t.buildingTheory.quickLinks.examB.title}
          desc={t.buildingTheory.quickLinks.examB.desc} />
      </div>

      {pdfsWithUrls.length === 0 && imagesWithUrls.length === 0 && (
        <div className="card p-8 text-center" style={{ color: 'var(--text-muted)' }}>
          <p className="text-lg mb-2">{t.buildingTheory.noMaterials}</p>
          <p className="text-sm">{t.buildingTheory.noMaterialsSub}</p>
        </div>
      )}

      {semesterA.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--primary)' }}>
            <span className="w-7 h-7 rounded-full text-white text-sm flex items-center justify-center font-bold" style={{ backgroundColor: 'var(--primary)' }}>{t.exam.choiceLetters[0]}</span>
            {t.buildingTheory.semesterA}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {semesterA.map(pdf => <PDFCard key={pdf.id} pdf={pdf} dateLocale={dateLocale} />)}
          </div>
        </div>
      )}

      {semesterB.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--primary)' }}>
            <span className="w-7 h-7 rounded-full text-white text-sm flex items-center justify-center font-bold" style={{ backgroundColor: 'var(--primary)' }}>{t.exam.choiceLetters[1]}</span>
            {t.buildingTheory.semesterB}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {semesterB.map(pdf => <PDFCard key={pdf.id} pdf={pdf} dateLocale={dateLocale} />)}
          </div>
        </div>
      )}

      {both.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-3" style={{ color: 'var(--primary)' }}>{t.buildingTheory.bothSemesters}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {both.map(pdf => <PDFCard key={pdf.id} pdf={pdf} dateLocale={dateLocale} />)}
          </div>
        </div>
      )}

      {imagesWithUrls.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-3" style={{ color: 'var(--primary)' }}>תמונות וחומרי לימוד</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {imagesWithUrls.map(img => <ImageCard key={img.id} img={img} dateLocale={dateLocale} />)}
          </div>
        </div>
      )}
    </div>
  )
}

function QuickLink({ href, icon, title, desc }: { href: string; icon: string; title: string; desc: string }) {
  return (
    <Link href={href}>
      <div className="card p-4 hover:shadow-md transition-shadow cursor-pointer h-full">
        <div className="text-2xl mb-2">{icon}</div>
        <h3 className="font-bold text-sm mb-1" style={{ color: 'var(--primary)' }}>{title}</h3>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{desc}</p>
      </div>
    </Link>
  )
}

function PDFCard({ pdf, dateLocale }: { pdf: { id: string; title: string; semester: string; uploaded_at: string; file_size: number; signedUrl: string | null }; dateLocale: string }) {
  const date = new Date(pdf.uploaded_at).toLocaleDateString(dateLocale)
  const size = pdf.file_size ? `${Math.round(pdf.file_size / 1024)} KB` : ''
  return (
    <div className="card p-4 flex items-center gap-3">
      <div className="text-3xl flex-shrink-0">📄</div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-sm truncate">{pdf.title}</h3>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
          {date} {size && `· ${size}`}
        </p>
      </div>
      {pdf.signedUrl && (
        <a href={pdf.signedUrl} target="_blank" rel="noopener noreferrer"
          className="flex-shrink-0 text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"
          style={{ backgroundColor: 'var(--primary)', color: 'white' }}>
          פתח
        </a>
      )}
    </div>
  )
}

function ImageCard({ img, dateLocale }: { img: { id: string; title: string; uploaded_at: string; file_size: number; url: string | null }; dateLocale: string }) {
  const date = new Date(img.uploaded_at).toLocaleDateString(dateLocale)
  const size = img.file_size ? `${Math.round(img.file_size / 1024)} KB` : ''
  if (!img.url) return null
  return (
    <div className="card overflow-hidden">
      <a href={img.url} target="_blank" rel="noopener noreferrer">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={img.url} alt={img.title}
          className="w-full h-48 object-cover hover:opacity-90 transition-opacity" />
      </a>
      <div className="p-3">
        <h3 className="font-semibold text-sm truncate">{img.title}</h3>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
          {date} {size && `· ${size}`}
        </p>
      </div>
    </div>
  )
}
