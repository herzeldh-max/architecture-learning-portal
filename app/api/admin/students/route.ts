import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase-server'

async function verifyAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const adminClient = createAdminClient()
  const { data: profile } = await adminClient
    .from('user_profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return null
  return adminClient
}

export async function GET(req: NextRequest) {
  try {
    const adminClient = await verifyAdmin()
    if (!adminClient) return NextResponse.json({ error: 'Admin only' }, { status: 403 })

    const { data: profiles } = await adminClient
      .from('user_profiles')
      .select('id, full_name, role, created_at')
      .eq('role', 'student')
      .order('created_at', { ascending: false })

    const studentIds = profiles?.map(p => p.id) || []
    const statsMap: Record<string, { count: number; avg: number; lastActive: string | null }> = {}

    if (studentIds.length > 0) {
      const { data: answers } = await adminClient
        .from('exam_answers')
        .select('user_id, score, created_at')
        .in('user_id', studentIds)

      for (const sid of studentIds) {
        const userAnswers = answers?.filter(a => a.user_id === sid) || []
        const count = userAnswers.length
        const avg = count > 0 ? userAnswers.reduce((s, a) => s + (a.score || 0), 0) / count : 0
        const lastActive = count > 0
          ? userAnswers.reduce((latest, a) => a.created_at > latest ? a.created_at : latest, userAnswers[0].created_at)
          : null
        statsMap[sid] = { count, avg: Math.round(avg * 10) / 10, lastActive }
      }
    }

    const students = profiles?.map(p => ({
      ...p,
      questionCount: statsMap[p.id]?.count || 0,
      avgScore: statsMap[p.id]?.avg || 0,
      lastActive: statsMap[p.id]?.lastActive || null,
    }))

    return NextResponse.json({ students })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const adminClient = await verifyAdmin()
    if (!adminClient) return NextResponse.json({ error: 'Admin only' }, { status: 403 })

    const { studentId, fullName } = await req.json()
    if (!studentId || !fullName?.trim()) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const { error } = await adminClient
      .from('user_profiles')
      .update({ full_name: fullName.trim() })
      .eq('id', studentId)
      .eq('role', 'student')

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const adminClient = await verifyAdmin()
    if (!adminClient) return NextResponse.json({ error: 'Admin only' }, { status: 403 })

    const { studentId } = await req.json()
    if (!studentId) return NextResponse.json({ error: 'Missing studentId' }, { status: 400 })

    // Verify target is a student (not an admin)
    const { data: target } = await adminClient
      .from('user_profiles').select('role').eq('id', studentId).single()
    if (!target || target.role !== 'student') {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    // Delete all associated data before removing the user
    await adminClient.from('exam_answers').delete().eq('user_id', studentId)
    await adminClient.from('question_history').delete().eq('user_id', studentId)
    await adminClient.from('exam_sessions').delete().eq('user_id', studentId)
    await adminClient.from('user_profiles').delete().eq('id', studentId)

    // Delete the auth user (removes login access)
    await adminClient.auth.admin.deleteUser(studentId)

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
