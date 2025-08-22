import { NextRequest, NextResponse } from 'next/server'
import { withParentAuth } from '@/lib/api-auth'
import { createClient } from '@supabase/supabase-js'
import { getSupabaseUrl, getSupabaseServiceKey } from '@/lib/env'

const supabaseUrl = getSupabaseUrl()
const supabaseServiceKey = getSupabaseServiceKey()

// GET /api/parent/students - 获取关联的学生列表
export const GET = withParentAuth(async (request: NextRequest, user) => {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // 获取家长档案和关联的学生ID
    const { data: parent, error: parentError } = await supabase
      .from('parents')
      .select('student_ids')
      .eq('user_id', user.id)
      .single()

    if (parentError || !parent?.student_ids) {
      return NextResponse.json({ students: [] })
    }

    // 获取学生详细信息
    const { data: students, error } = await supabase
      .from('students')
      .select(`
        *,
        applications (
          *,
          universities (*)
        )
      `)
      .in('id', parent.student_ids)

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch students' }, { status: 400 })
    }

    return NextResponse.json({ students })
  } catch (error) {
    console.error('Error fetching students:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})