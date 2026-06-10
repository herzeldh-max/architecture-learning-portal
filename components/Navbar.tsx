'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'

interface NavbarProps {
  userName: string
  role: 'admin' | 'student'
}

export default function Navbar({ userName, role }: NavbarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const studentLinks = [
    { href: '/dashboard', label: 'דף הבית' },
    { href: '/building-theory', label: 'תורת הבנייה' },
    { href: '/building-legislation/chat', label: 'תחיקת הבנייה' },
  ]

  const adminLinks = [
    { href: '/dashboard', label: 'דף הבית' },
    { href: '/building-theory', label: 'תורת הבנייה' },
    { href: '/building-legislation/chat', label: 'תחיקת הבנייה' },
    { href: '/admin', label: 'ניהול' },
  ]

  const links = role === 'admin' ? adminLinks : studentLinks

  return (
    <nav style={{ backgroundColor: 'var(--primary)' }} className="text-white shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <Link href="/dashboard" className="font-bold text-base truncate max-w-xs">
            פורטל לימוד - אדריכלות
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {links.map(l => (
              <Link
                key={l.href}
                href={l.href}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname === l.href || pathname.startsWith(l.href + '/')
                    ? 'bg-white/20'
                    : 'hover:bg-white/10'
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <span className="text-sm opacity-75 truncate max-w-32">{userName}</span>
            {role === 'admin' && (
              <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: 'var(--secondary)', color: '#1a202c' }}>
                מנהל
              </span>
            )}
            <button onClick={handleLogout} className="text-sm px-3 py-1.5 rounded-lg border border-white/30 hover:bg-white/10 transition-colors">
              יציאה
            </button>
            <div className="h-10 w-px bg-white/20 mx-1" />
            <a href="https://www.tcb.ac.il" target="_blank" rel="noopener noreferrer">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/college-logo.png"
                alt="המכללה הטכנולוגית באר שבע"
                style={{ height: '48px', width: 'auto' }}
                className="object-contain rounded"
              />
            </a>
          </div>

          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 rounded hover:bg-white/10">
            <div className="w-5 h-0.5 bg-white mb-1"></div>
            <div className="w-5 h-0.5 bg-white mb-1"></div>
            <div className="w-5 h-0.5 bg-white"></div>
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden pb-3 border-t border-white/20 mt-1 pt-2">
            {links.map(l => (
              <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm hover:bg-white/10 transition-colors">
                {l.label}
              </Link>
            ))}
            <div className="border-t border-white/20 mt-2 pt-2 flex items-center justify-between px-3">
              <span className="text-sm opacity-75">{userName}</span>
              <button onClick={handleLogout} className="text-sm underline opacity-75 hover:opacity-100">יציאה</button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
