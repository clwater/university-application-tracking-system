import { NextRequest, NextResponse } from 'next/server'
import { withStudentAuth } from '@/lib/api-auth'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// GET /api/student/dashboard/stats - 获取学生仪表板统计数据
export const GET = withStudentAuth(async (request: NextRequest, user) => {
  try {
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

    // 获取申请统计
    const { data: applications } = await supabase
      .from('applications')
      .select('status, deadline, decision_type')
      .eq('student_id', student.id)

    // 计算统计数据
    const stats = {
      total: applications?.length || 0,
      submitted: applications?.filter(app => 
        app.status === 'submitted' || app.status === 'under_review'
      ).length || 0,
      accepted: applications?.filter(app => app.status === 'accepted').length || 0,
      rejected: applications?.filter(app => app.status === 'rejected').length || 0,
      waitlisted: applications?.filter(app => app.status === 'waitlisted').length || 0,
      inProgress: applications?.filter(app => app.status === 'in_progress').length || 0,
      notStarted: applications?.filter(app => app.status === 'not_started').length || 0,
    }

    // 计算即将到期的申请（7天内）
    const today = new Date()
    const urgentDeadlines = applications?.filter(app => {
      if (!app.deadline) return false
      const deadline = new Date(app.deadline)
      const diffTime = deadline.getTime() - today.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays <= 7 && diffDays >= 0
    }).length || 0

    // 计算录取率
    const acceptanceRate = stats.submitted > 0 
      ? ((stats.accepted / stats.submitted) * 100).toFixed(1) 
      : '0'

    // 获取申请进度分布
    const progressDistribution = {
      notStarted: stats.notStarted,
      inProgress: stats.inProgress,
      submitted: stats.submitted,
      completed: stats.accepted + stats.rejected + stats.waitlisted,
    }

    // 获取申请类型分布
    const { data: typeDistribution } = await supabase
      .from('applications')
      .select('application_type')
      .eq('student_id', student.id)

    const applicationTypes = {
      earlyDecision: typeDistribution?.filter(app => app.application_type === 'early_decision').length || 0,
      earlyAction: typeDistribution?.filter(app => app.application_type === 'early_action').length || 0,
      regularDecision: typeDistribution?.filter(app => app.application_type === 'regular_decision').length || 0,
      rollingAdmission: typeDistribution?.filter(app => app.application_type === 'rolling_admission').length || 0,
    }

    return NextResponse.json({
      stats: {
        ...stats,
        urgentDeadlines,
        acceptanceRate: parseFloat(acceptanceRate),
      },
      progressDistribution,
      applicationTypes,
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})