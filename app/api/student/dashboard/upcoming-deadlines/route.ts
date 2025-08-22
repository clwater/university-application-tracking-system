import { NextRequest, NextResponse } from 'next/server'
import { withStudentAuth } from '@/lib/api-auth'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// GET /api/student/dashboard/upcoming-deadlines - 获取即将到期的申请
export const GET = withStudentAuth(async (request: NextRequest, user) => {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')
    
    // 获取学生ID
    const { data: student } = await supabase
      .from('students')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!student) {
      return NextResponse.json({ error: 'Student profile not found' }, { status: 404 })
    }

    // 计算日期范围
    const today = new Date()
    const futureDate = new Date()
    futureDate.setDate(today.getDate() + days)

    // 获取即将到期的申请
    const { data: applications, error } = await supabase
      .from('applications')
      .select(`
        *,
        universities (*)
      `)
      .eq('student_id', student.id)
      .not('deadline', 'is', null)
      .gte('deadline', today.toISOString().split('T')[0])
      .lte('deadline', futureDate.toISOString().split('T')[0])
      .order('deadline', { ascending: true })

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch upcoming deadlines' }, { status: 400 })
    }

    // 为每个申请添加紧急程度信息
    const applicationsWithUrgency = applications?.map(app => {
      const deadline = new Date(app.deadline!)
      const diffTime = deadline.getTime() - today.getTime()
      const daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      let urgency = 'normal'
      if (daysUntil <= 3) urgency = 'critical'
      else if (daysUntil <= 7) urgency = 'high'
      else if (daysUntil <= 14) urgency = 'medium'

      return {
        ...app,
        daysUntil,
        urgency,
      }
    }) || []

    return NextResponse.json({ applications: applicationsWithUrgency })
  } catch (error) {
    console.error('Error fetching upcoming deadlines:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})