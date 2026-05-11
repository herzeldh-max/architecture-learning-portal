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

    const { data: profiles } = await adminClient
      .from('user_profiles')
      .select('id, full_name, role, created_at')
      .eq('role', 'student')
      .order('created_at', { ascending: false })

    const studentIds = profiles?.map(p => p.id) || []
    const statsMap: Record<string, { count: number; avg: number }> = {}

    if (studentIds.length > 0) {
      const { data: answers } = await adminClient
        .from('exam_answers')
        .select('user_id, score')
        .in('user_id', studentIds)

      for (const sid of studentIds) {
        const userAnswers = answers?.filter(a => a.user_id === sid) || []
        const count = userAnswers.length
        const avg = count > 0 ? userAnswers.reduce((s, a) => s + (a.score || 0), 0) / count : 0
        statsMap[sid] = { count, avg: Math.round(avg * 10) / 10 }
      }
    }

    const students = profiles?.map(p => ({
      ...p,
      questionCount: statsMap[p.id]?.count || 0,
      avgScore: statsMap[p.id]?.avg || 0,
    }))

    return NextResponse.json({ students })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
