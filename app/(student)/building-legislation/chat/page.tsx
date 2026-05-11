'use client'

import { useState, useRef, useEffect } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function LegislationChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'שלום! אני עוזר הלימוד לקורס תחיקת הבנייה.\n\nאני יכול לענות על שאלות בנושא תקנות תכנון ובנייה עדכניות, חוקים, תקנות ונהלים. התשובות שלי מבוססות על מקורות רשמיים (אתר נבו, כנסת, משרד הפנים).\n\nשאל אותי כל שאלה!' }
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
      const res = await fetch('/api/legislation/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply || 'אירעה שגיאה.' }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'אירעה שגיאה בחיבור לשרת.' }])
    } finally {
      setLoading(false)
    }
  }

  const suggestions = [
    'מהו חוק התכנון והבנייה?',
    'מהן דרישות הנגישות לבניין ציבורי?',
    'מה הם תקנות הבטיחות באש לבניינים?',
    'מהם כללי הקו הבונה?',
  ]

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <span className="text-sm font-medium">תחיקת הבנייה</span>
        <span style={{ color: 'var(--text-muted)' }}>›</span>
        <span className="text-sm" style={{ color: 'var(--text-muted)' }}>שאלות על תקנות</span>
      </div>

      <div className="card overflow-hidden" style={{ height: 'calc(100vh - 210px)', display: 'flex', flexDirection: 'column' }}>
        <div className="p-4 border-b" style={{ backgroundColor: '#2d6a4f', color: 'white' }}>
          <h1 className="font-bold">📋 תחיקת הבנייה - שאלות על תקנות</h1>
          <p className="text-xs opacity-75">מבוסס על נבו, כנסת, משרד הפנים ומשרד הבינוי | מקורות מצוינים בכל תשובה</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`${msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'} max-w-[90%]`}
                style={msg.role === 'user' ? { backgroundColor: '#2d6a4f' } : {}}>
                <div className="prose-rtl text-sm whitespace-pre-wrap">{msg.content}</div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="chat-bubble-ai flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                <span className="spinner"></span> מחפש במקורות רשמיים...
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {messages.length === 1 && (
          <div className="px-4 pb-3">
            <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>שאלות מוצעות:</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s, i) => (
                <button key={i} onClick={() => setInput(s)}
                  className="text-xs px-3 py-1.5 rounded-full border" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={sendMessage} className="p-3 border-t flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            className="input-field flex-1"
            placeholder="שאל על תקנות תכנון ובנייה..."
            disabled={loading}
          />
          <button type="submit" disabled={loading || !input.trim()}
            className="btn-primary px-5" style={{ backgroundColor: '#2d6a4f' }}>
            שלח
          </button>
        </form>
      </div>
    </div>
  )
}
