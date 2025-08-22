import { NextRequest, NextResponse } from 'next/server'
import { withStudentAuth } from '@/lib/api-auth'
import { createClient } from '@supabase/supabase-js'
import { getSupabaseUrl, getSupabaseServiceKey } from '@/lib/env'

const supabaseUrl = getSupabaseUrl()
const supabaseServiceKey = getSupabaseServiceKey()

// GET /api/student/applications - 获取学生的所有申请
export const GET = withStudentAuth(async (request: NextRequest, user) => {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // 首先获取学生ID
    const { data: student } = await supabase
      .from('students')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!student) {
      return NextResponse.json({ error: 'Student profile not found' }, { status: 404 })
    }

    // 获取申请列表
    const { data: applications, error } = await supabase
      .from('applications')
      .select(`
        *,
        universities (*)
      `)
      .eq('student_id', student.id)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 400 })
    }

    return NextResponse.json({ applications })
  } catch (error) {
    console.error('Error fetching applications:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

// POST /api/student/applications - 创建新申请
export const POST = withStudentAuth(async (request: NextRequest, user) => {
  try {
    const body = await request.json()
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // 获取学生ID
    const { data: student } = await supabase
      .from('students')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!student) {
      return NextResponse.json({ error: 'Student profile not found' }, { status: 404 })
    }

    // 检查是否已经申请过这所大学
    const { data: existingApplication } = await supabase
      .from('applications')
      .select('id')
      .eq('student_id', student.id)
      .eq('university_id', body.university_id)
      .single()

    if (existingApplication) {
      return NextResponse.json({ error: 'Application already exists for this university' }, { status: 409 })
    }

    // 创建新申请
    const { data: application, error } = await supabase
      .from('applications')
      .insert({
        student_id: student.id,
        university_id: body.university_id,
        application_type: body.application_type,
        deadline: body.deadline,
        status: body.status || 'not_started',
        notes: body.notes,
      })
      .select(`
        *,
        universities (*)
      `)
      .single()

    if (error) {
      return NextResponse.json({ error: 'Failed to create application' }, { status: 400 })
    }

    return NextResponse.json({ application }, { status: 201 })
  } catch (error) {
    console.error('Error creating application:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})