import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const adminClient = createAdminClient()
    const { data: profile } = await adminClient
      .from('user_profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Admin only' }, { status: 403 })

    const [studentsRes, answersRes, pdfsRes, sessionsRes] = await Promise.all([
      adminClient.from('user_profiles').select('id', { count: 'exact' }).eq('role', 'student'),
      adminClient.from('exam_answers').select('score, created_at, user_id, session_id'),
      adminClient.from('pdfs').select('id, course, semester, title'),
      adminClient.from('exam_sessions').select('id, course'),
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

    // פעילות יומית - 14 ימים אחרונים
    const dailyActivity: { date: string; count: number }[] = []
    for (let i = 13; i >= 0; i--) {
      const day = new Date()
      day.setDate(day.getDate() - i)
      const dayStr = day.toISOString().slice(0, 10)
      const count = answers.filter(a => a.created_at?.slice(0, 10) === dayStr).length
      dailyActivity.push({ date: dayStr, count })
    }

    // ממוצע ציון לפי קורס
    const sessionCourseMap: Record<string, string> = {}
    ;(sessionsRes.data || []).forEach(s => { sessionCourseMap[s.id] = s.course })

    const courseLabels: Record<string, string> = {
      building_theory: 'תורת הבנייה',
      building_legislation: 'תחיקת הבנייה',
    }
    const courseAgg: Record<string, { count: number; sum: number }> = {}
    answers.forEach(a => {
      const course = sessionCourseMap[a.session_id] || 'אחר'
      if (!courseAgg[course]) courseAgg[course] = { count: 0, sum: 0 }
      courseAgg[course].count++
      courseAgg[course].sum += a.score || 0
    })
    const courseStats = Object.entries(courseAgg).map(([course, { count, sum }]) => ({
      course,
      label: courseLabels[course] || course,
      count,
      avgScore: count > 0 ? Math.round((sum / count) * 10) / 10 : 0,
    }))

    return NextResponse.json({
      studentCount: studentsRes.count || 0,
      totalAnswers,
      avgScore,
      activeUsers,
      pdfCount: pdfsRes.data?.length || 0,
      scoreDistribution,
      pdfs: pdfsRes.data || [],
      dailyActivity,
      courseStats,
    })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
