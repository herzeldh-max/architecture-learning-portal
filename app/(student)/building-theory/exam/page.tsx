'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

interface MultipleQuestion {
  type: 'multiple'
  question: string
  choices: string[]
  correctIndex: number
  explanation: string
}
interface OpenQuestion {
  type: 'open'
  question: string
  sampleAnswer: string
  keyPoints: string[]
}
type Question = MultipleQuestion | OpenQuestion

interface AnswerResult {
  score: 0 | 5 | 10
  feedback: string
  fullAnswer: string
}

function ExamContent() {
  const searchParams = useSearchParams()
  const initSemester = searchParams.get('semester') || 'both'

  const [phase, setPhase] = useState<'setup' | 'question' | 'result' | 'summary'>('setup')
  const [semester, setSemester] = useState(initSemester)
  const [qType, setQType] = useState<'mixed' | 'multiple' | 'open'>('mixed')
  const [sessionId, setSessionId] = useState<string | null>(null)

  const [currentQ, setCurrentQ] = useState<Question | null>(null)
  const [answer, setAnswer] = useState<string>('')
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null)
  const [result, setResult] = useState<AnswerResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [totalScore, setTotalScore] = useState(0)
  const [qCount, setQCount] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  async function startSession() {
    setLoading(true)
    try {
      const res = await fetch('/api/theory/generate-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ semester, questionType: qType, sessionId: null, isFirst: true }),
      })
      const data = await res.json()
      if (data.question) {
        setCurrentQ(data.question)
        setSessionId(data.sessionId)
        setPhase('question')
      }
    } catch { }
    setLoading(false)
  }

  async function nextQuestion() {
    setLoading(true)
    setResult(null)
    setAnswer('')
    setSelectedIdx(null)
    try {
      const res = await fetch('/api/theory/generate-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ semester, questionType: qType, sessionId }),
      })
      const data = await res.json()
      if (data.question) {
        setCurrentQ(data.question)
        setPhase('question')
      }
    } catch { }
    setLoading(false)
  }

  async function submitAnswer() {
    if (!currentQ) return
    setSubmitting(true)
    try {
      const studentAnswer = currentQ.type === 'multiple'
        ? (selectedIdx !== null ? currentQ.choices[selectedIdx] : '')
        : answer

      const res = await fetch('/api/theory/grade-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: currentQ,
          studentAnswer,
          sessionId,
        }),
      })
      const data = await res.json()
      setResult(data)
      setTotalScore(prev => prev + (data.score || 0))
      setQCount(prev => prev + 1)
      setPhase('result')
    } catch { }
    setSubmitting(false)
  }

  const avg = qCount > 0 ? Math.round((totalScore / (qCount * 10)) * 100) : 0

  if (phase === 'setup') {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--primary)' }}>הכנה למבחן - תורת הבנייה</h1>
        <div className="card p-6 max-w-lg mx-auto">
          <h2 className="font-bold mb-4">הגדרות תרגול</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">סמסטר</label>
              <div className="flex gap-2">
                {[['A', "סמסטר א'"], ['B', "סמסטר ב'"], ['both', 'שניהם']].map(([v, l]) => (
                  <button key={v} onClick={() => setSemester(v)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium border-2 transition-colors ${semester === v ? 'border-blue-800 text-white' : 'border-gray-200 text-gray-600'}`}
                    style={semester === v ? { backgroundColor: 'var(--primary)', borderColor: 'var(--primary)' } : {}}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">סוג שאלות</label>
              <div className="flex gap-2">
                {[['mixed', 'מעורב'], ['multiple', 'אמריקאיות'], ['open', 'פתוחות']].map(([v, l]) => (
                  <button key={v} onClick={() => setQType(v as typeof qType)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium border-2 transition-colors ${qType === v ? 'text-white' : 'border-gray-200 text-gray-600'}`}
                    style={qType === v ? { backgroundColor: 'var(--primary)', borderColor: 'var(--primary)' } : {}}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <button onClick={startSession} disabled={loading}
            className="btn-primary w-full justify-center py-3 mt-6 text-base">
            {loading ? <><span className="spinner" style={{ borderTopColor: 'white' }} /> מכין שאלה...</> : 'התחל תרגול'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold" style={{ color: 'var(--primary)' }}>הכנה למבחן</h1>
        <div className="flex items-center gap-4 text-sm">
          {qCount > 0 && (
            <>
              <span style={{ color: 'var(--text-muted)' }}>שאלות: {qCount}</span>
              <span style={{ color: 'var(--text-muted)' }}>סה"כ: {totalScore} נקודות</span>
              <span className="font-bold" style={{ color: avg >= 70 ? 'var(--success)' : avg >= 50 ? 'var(--warning)' : 'var(--error)' }}>
                {avg}%
              </span>
            </>
          )}
          <button onClick={() => { setPhase('setup'); setQCount(0); setTotalScore(0); setSessionId(null) }}
            className="text-sm px-3 py-1 rounded border" style={{ borderColor: 'var(--border)' }}>
            סיום
          </button>
        </div>
      </div>

      {loading ? (
        <div className="card p-12 text-center">
          <div className="spinner mx-auto mb-3" style={{ width: '2rem', height: '2rem' }}></div>
          <p style={{ color: 'var(--text-muted)' }}>מכין שאלה חדשה...</p>
        </div>
      ) : currentQ && (
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs px-2 py-1 rounded-full font-medium" style={{
              backgroundColor: currentQ.type === 'multiple' ? '#ebf8ff' : '#f0fff4',
              color: currentQ.type === 'multiple' ? '#2b6cb0' : '#276749'
            }}>
              {currentQ.type === 'multiple' ? 'אמריקאית' : 'פתוחה'}
            </span>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>שאלה {qCount + 1}</span>
          </div>

          <h2 className="text-lg font-semibold mb-5 leading-relaxed">{currentQ.question}</h2>

          {currentQ.type === 'multiple' ? (
            <div className="space-y-2 mb-5">
              {currentQ.choices.map((choice, i) => {
                let style: React.CSSProperties = { border: '2px solid var(--border)', cursor: 'pointer' }
                if (phase === 'result') {
                  if (i === currentQ.correctIndex) style = { border: '2px solid var(--success)', backgroundColor: '#f0fff4' }
                  else if (i === selectedIdx && i !== currentQ.correctIndex) style = { border: '2px solid var(--error)', backgroundColor: '#fff5f5' }
                } else if (selectedIdx === i) {
                  style = { border: '2px solid var(--primary)', backgroundColor: '#ebf4ff' }
                }
                return (
                  <button key={i} onClick={() => phase === 'question' && setSelectedIdx(i)}
                    className="w-full text-right p-3 rounded-lg transition-colors text-sm"
                    style={style} disabled={phase === 'result'}>
                    <span className="font-bold ml-2">{['א', 'ב', 'ג', 'ד'][i]}.</span> {choice}
                    {phase === 'result' && i === currentQ.correctIndex && ' ✓'}
                  </button>
                )
              })}
            </div>
          ) : (
            <textarea
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              disabled={phase === 'result'}
              className="input-field mb-5"
              rows={5}
              placeholder="כתב את תשובתך כאן..."
            />
          )}

          {phase === 'question' && (
            <button onClick={submitAnswer} disabled={submitting || (currentQ.type === 'multiple' ? selectedIdx === null : !answer.trim())}
              className="btn-primary px-6 py-2">
              {submitting ? <><span className="spinner" style={{ borderTopColor: 'white' }} /> בודק...</> : 'שלח תשובה'}
            </button>
          )}

          {phase === 'result' && result && (
            <div className="mt-4 space-y-3">
              <div className={`p-4 rounded-xl border-2 ${result.score === 10 ? 'score-10 border-green-200' : result.score === 5 ? 'score-5 border-yellow-200' : 'score-0 border-red-200'}`}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="score-badge" style={result.score === 10 ? { backgroundColor: '#276749', color: 'white' } : result.score === 5 ? { backgroundColor: '#975a16', color: 'white' } : { backgroundColor: '#c53030', color: 'white' }}>
                    {result.score}/10
                  </span>
                  <span className="font-semibold">
                    {result.score === 10 ? 'תשובה נכונה!' : result.score === 5 ? 'תשובה חלקית' : 'תשובה שגויה'}
                  </span>
                </div>
                <p className="text-sm">{result.feedback}</p>
                {result.score < 10 && result.fullAnswer && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="font-semibold text-sm mb-1">התשובה הנכונה:</p>
                    <p className="text-sm whitespace-pre-wrap">{result.fullAnswer}</p>
                  </div>
                )}
              </div>
              <button onClick={nextQuestion} className="btn-primary">
                שאלה הבאה ›
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function ExamPage() {
  return (
    <Suspense fallback={<div className="card p-8 text-center"><span className="spinner mx-auto"></span></div>}>
      <ExamContent />
    </Suspense>
  )
}
