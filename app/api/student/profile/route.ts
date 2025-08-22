import { NextRequest, NextResponse } from 'next/server'
import { withStudentAuth } from '@/lib/api-auth'
import { createClient } from '@supabase/supabase-js'
import { getSupabaseUrl, getSupabaseServiceKey } from '@/lib/env'

const supabaseUrl = getSupabaseUrl()
const supabaseServiceKey = getSupabaseServiceKey()

// GET /api/student/profile - 获取学生档案
export const GET = withStudentAuth(async (request: NextRequest, user) => {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    const { data: student, error } = await supabase
      .from('students')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error) {
      return NextResponse.json({ error: 'Student profile not found' }, { status: 404 })
    }

    return NextResponse.json({ student })
  } catch (error) {
    console.error('Error fetching student profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

// PUT /api/student/profile - 更新学生档案
export const PUT = withStudentAuth(async (request: NextRequest, user) => {
  try {
    const body = await request.json()
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    const { data: student, error } = await supabase
      .from('students')
      .update({
        name: body.name,
        graduation_year: body.graduation_year,
        gpa: body.gpa,
        sat_score: body.sat_score,
        act_score: body.act_score,
        target_countries: body.target_countries,
        intended_majors: body.intended_majors,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 400 })
    }

    return NextResponse.json({ student })
  } catch (error) {
    console.error('Error updating student profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})