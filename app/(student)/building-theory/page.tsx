import { createClient } from '@/lib/supabase-server'
import Link from 'next/link'

export default async function BuildingTheoryPage() {
  const supabase = await createClient()

  const { data: pdfs } = await supabase
    .from('pdfs')
    .select('id, title, semester, uploaded_at, file_size')
    .eq('course', 'building_theory')
    .order('semester')
    .order('uploaded_at', { ascending: true })

  const semesterA = pdfs?.filter(p => p.semester === 'A') || []
  const semesterB = pdfs?.filter(p => p.semester === 'B') || []
  const both = pdfs?.filter(p => p.semester === 'both') || []

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--primary)' }}>תורת הבנייה</h1>
          <p style={{ color: 'var(--text-muted)' }}>קורס לשנה א' | מצגות וחומרי לימוד</p>
        </div>
        <div className="flex gap-3">
          <Link href="/building-theory/chat">
            <button className="btn-secondary">שאלות חופשיות</button>
          </Link>
          <Link href="/building-theory/exam">
            <button className="btn-primary">הכנה למבחן</button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <QuickLink href="/building-theory/chat" icon="💬" title="שאלות חופשיות"
          desc="שאל כל שאלה על החומר" />
        <QuickLink href="/building-theory/exam?semester=A" icon="📝" title='הכנה למבחן - סמסטר א'
          desc="תרגול שאלות מסמסטר א'" />
        <QuickLink href="/building-theory/exam?semester=B" icon="📝" title='הכנה למבחן - סמסטר ב'
          desc="תרגול שאלות מסמסטר ב'" />
      </div>

      {pdfs && pdfs.length === 0 && (
        <div className="card p-8 text-center" style={{ color: 'var(--text-muted)' }}>
          <p className="text-lg mb-2">אין עדיין חומרי לימוד מועלים</p>
          <p className="text-sm">המרצה יעלה בקרוב את מצגות הקורס</p>
        </div>
      )}

      {semesterA.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--primary)' }}>
            <span className="w-7 h-7 rounded-full text-white text-sm flex items-center justify-center font-bold" style={{ backgroundColor: 'var(--primary)' }}>א</span>
            סמסטר א'
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {semesterA.map(pdf => <PDFCard key={pdf.id} pdf={pdf} />)}
          </div>
        </div>
      )}

      {semesterB.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--primary)' }}>
            <span className="w-7 h-7 rounded-full text-white text-sm flex items-center justify-center font-bold" style={{ backgroundColor: 'var(--primary)' }}>ב</span>
            סמסטר ב'
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {semesterB.map(pdf => <PDFCard key={pdf.id} pdf={pdf} />)}
          </div>
        </div>
      )}

      {both.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-3" style={{ color: 'var(--primary)' }}>חומר משני הסמסטרים</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {both.map(pdf => <PDFCard key={pdf.id} pdf={pdf} />)}
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

function PDFCard({ pdf }: { pdf: { id: string; title: string; semester: string; uploaded_at: string; file_size: number } }) {
  const date = new Date(pdf.uploaded_at).toLocaleDateString('he-IL')
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
    </div>
  )
}
