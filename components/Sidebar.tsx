'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLanguage } from './LanguageProvider'

interface SidebarProps {
  role: 'admin' | 'student'
}

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname()
  const { t } = useLanguage()

  const links = [
    { href: '/dashboard', label: t.nav.home },
    { href: '/building-theory', label: t.nav.buildingTheory },
    { href: '/building-legislation', label: t.nav.buildingLegislation },
    { href: '/dictionary', label: t.nav.dictionary },
  ]

  if (role === 'admin') {
    links.push({ href: '/admin', label: t.nav.admin })
  }

  return (
    <aside className="hidden md:block w-56 flex-shrink-0">
      <nav className="card p-3 flex flex-col gap-1 sticky top-20">
        {links.map(l => {
          const active = pathname === l.href || pathname.startsWith(l.href + '/')
          return (
            <Link
              key={l.href}
              href={l.href}
              className="px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              style={active
                ? { backgroundColor: 'var(--primary)', color: 'white' }
                : { color: 'var(--text-muted)' }}
            >
              {l.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
