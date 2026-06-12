'use client'

import { useState, useRef, useEffect } from 'react'
import { useLanguage } from '@/components/LanguageProvider'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function TheoryChatPage() {
  const { t, lang } = useLanguage()
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: t.theoryChat.initialMessage }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMsg = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setLoading(true)

    try {
      const res = await fetch('/api/theory/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          history: messages.slice(-8),
          language: lang,
        }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply || t.theoryChat.errorRetry }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: t.theoryChat.errorConnection }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <a href="/building-theory" className="text-sm" style={{ color: 'var(--text-muted)' }}>{t.theoryChat.breadcrumb}</a>
        <span style={{ color: 'var(--text-muted)' }}>›</span>
        <span className="text-sm font-medium">{t.theoryChat.title}</span>
      </div>

      <div className="card overflow-hidden" style={{ height: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column' }}>
        <div className="p-4 border-b" style={{ backgroundColor: 'var(--primary)', color: 'white' }}>
          <h1 className="font-bold">{t.theoryChat.chatTitle}</h1>
          <p className="text-xs opacity-75">{t.theoryChat.chatSubtitle}</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}>
                <div className="prose-rtl text-sm whitespace-pre-wrap">{msg.content}</div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="chat-bubble-ai flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                <span className="spinner"></span> {t.theoryChat.thinking}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={sendMessage} className="p-3 border-t flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            className="input-field flex-1"
            placeholder={t.theoryChat.placeholder}
            disabled={loading}
          />
          <button type="submit" disabled={loading || !input.trim()} className="btn-primary px-5">
            {t.theoryChat.send}
          </button>
        </form>
      </div>
    </div>
  )
}
