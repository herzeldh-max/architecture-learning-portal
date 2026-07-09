'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useRef, Suspense } from 'react'

function PDFViewer() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const id = searchParams.get('id')
  const title = searchParams.get('title') || 'מצגת'
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const block = (e: Event) => e.preventDefault()
    const blockKeys = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        ['s', 'p', 'a', 'c', 'u'].includes(e.key.toLowerCase())
      ) {
        e.preventDefault()
      }
    }
    document.addEventListener('contextmenu', block)
    document.addEventListener('keydown', blockKeys)
    return () => {
      document.removeEventListener('contextmenu', block)
      document.removeEventListener('keydown', blockKeys)
    }
  }, [])

  if (!id) {
    router.push('/building-theory')
    return null
  }

  return (
    <div
      className="fixed inset-0 flex flex-col"
      style={{ backgroundColor: '#1a1a2e', userSelect: 'none' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 h-12 flex-shrink-0"
        style={{ backgroundColor: 'var(--primary)' }}
      >
        <button
          onClick={() => router.push('/building-theory')}
          className="text-white text-sm font-medium px-3 py-1 rounded hover:bg-white/20 transition-colors"
        >
          ← חזרה
        </button>
        <span className="text-white text-sm font-semibold truncate px-4">{title}</span>
        <span className="text-white/50 text-xs">צפייה בלבד</span>
      </div>

      {/* PDF iframe wrapper — overlay blocks right-click on the iframe */}
      <div className="flex-1 relative overflow-hidden">
        <iframe
          src={`/api/pdfs/open?id=${id}#toolbar=0&navpanes=0&view=FitH`}
          className="w-full h-full border-0"
          title={title}
          sandbox="allow-same-origin allow-scripts"
        />
        {/* Transparent overlay: catches right-click, prevents direct link access */}
        <div
          ref={overlayRef}
          className="absolute inset-0"
          style={{ pointerEvents: 'none', zIndex: 10 }}
          onContextMenu={e => e.preventDefault()}
        />
      </div>

      <div
        className="text-center text-xs py-2 flex-shrink-0"
        style={{ color: 'rgba(255,255,255,0.4)' }}
      >
        חומר זה מוגן. אסור להעתיק, להדפיס או להפיץ ללא אישור.
      </div>
    </div>
  )
}

export default function ViewPage() {
  return (
    <Suspense>
      <PDFViewer />
    </Suspense>
  )
}
