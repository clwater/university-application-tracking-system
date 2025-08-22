import { NextRequest, NextResponse } from 'next/server'
import { withParentAuth } from '@/lib/api-auth'
import { createClient } from '@supabase/supabase-js'
import { getSupabaseUrl, getSupabaseServiceKey } from '@/lib/env'

const supabaseUrl = getSupabaseUrl()
const supabaseServiceKey = getSupabaseServiceKey()

// GET /api/parent/students/[id]/applications - 获取指定学生的申请列表
export const GET = withParentAuth(async (request: NextRequest, user, { params }: { params: { id: string } }) => {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const studentId = params.id

    // 验证家长是否有访问此学生的权限
    const { data: parent } = await supabase
      .from('parents')
      .select('student_ids')
      .eq('user_id', user.id)
      .single()

    if (!parent?.student_ids?.includes(studentId)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // 获取学生的申请列表
    const { data: applications, error } = await supabase
      .from('applications')
      .select(`
        *,
        universities (*),
        application_requirements (*)
      `)
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 400 })
    }

    return NextResponse.json({ applications })
  } catch (error) {
    console.error('Error fetching student applications:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})