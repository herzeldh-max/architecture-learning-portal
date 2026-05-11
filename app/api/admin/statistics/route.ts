import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase
      .from('user_profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Admin only' }, { status: 403 })

    const adminClient = createAdminClient()

    const [studentsRes, answersRes, pdfsRes] = await Promise.all([
      adminClient.from('user_profiles').select('id', { count: 'exact' }).eq('role', 'student'),
      adminClient.from('exam_answers').select('score, created_at, user_id'),
      adminClient.from('pdfs').select('id, course, semester, title'),
    ])

    const answers = answersRes.data || []
    const totalAnswers = answers.length
    const avgScore = totalAnswers > 0
      ? Math.round(answers.reduce((s, a) => s + (a.score || 0), 0) / totalAnswers * 10) / 10
      : 0

    const last7days = new Date(); last7days.setDate(last7days.getDate() - 7)
    const activeUsers = new Set(
      answers.filter(a => new Date(a.created_at) > last7days).map(a => a.user_id)
    ).size

    const scoreDistribution = { perfect: 0, partial: 0, wrong: 0 }
    answers.forEach(a => {
      if (a.score === 10) scoreDistribution.perfect++
      else if (a.score === 5) scoreDistribution.partial++
      else scoreDistribution.wrong++
    })

    return NextResponse.json({
      studentCount: studentsRes.count || 0,
      totalAnswers,
      avgScore,
      activeUsers,
      pdfCount: pdfsRes.data?.length || 0,
      scoreDistribution,
      pdfs: pdfsRes.data || [],
    })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
