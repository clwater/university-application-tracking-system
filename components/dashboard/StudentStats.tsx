'use client'

import { useState, useEffect } from 'react'
import { BookOpen, Clock, CheckCircle2, AlertTriangle, Calendar, TrendingUp } from 'lucide-react'
import { Application, University } from '@/lib/database.types'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { isDeadlineApproaching } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  color: string
  subtext?: string
}

function StatCard({ title, value, icon, color, subtext }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {subtext && (
            <p className="text-sm text-gray-500 mt-1">{subtext}</p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

interface ApplicationWithUniversity extends Application {
  universities: University
}

export default function StudentStats() {
  const { user } = useAuth()
  const [applications, setApplications] = useState<ApplicationWithUniversity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchApplications()
    }
  }, [user])

  const fetchApplications = async () => {
    if (!user) return

    try {
      const { data: student } = await supabase
        .from('students')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!student) return

      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          universities (*)
        `)
        .eq('student_id', student.id)

      if (error) throw error
      setApplications(data as ApplicationWithUniversity[] || [])
    } catch (error) {
      console.error('Error fetching applications:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStats = () => {
    const total = applications.length
    const submitted = applications.filter(app => app.status === 'submitted' || app.status === 'under_review').length
    const accepted = applications.filter(app => app.status === 'accepted').length
    const rejected = applications.filter(app => app.status === 'rejected').length
    const waitlisted = applications.filter(app => app.status === 'waitlisted').length
    const inProgress = applications.filter(app => app.status === 'in_progress').length
    const notStarted = applications.filter(app => app.status === 'not_started').length

    // 即将到期的申请（7天内）
    const urgentDeadlines = applications.filter(app => 
      app.deadline && isDeadlineApproaching(app.deadline, 7)
    ).length

    // 本月需要完成的申请
    const thisMonth = new Date()
    const nextMonth = new Date(thisMonth.getFullYear(), thisMonth.getMonth() + 1, 1)
    const thisMonthDeadlines = applications.filter(app => {
      if (!app.deadline) return false
      const deadline = new Date(app.deadline)
      return deadline >= thisMonth && deadline < nextMonth
    }).length

    return {
      total,
      submitted,
      accepted,
      rejected,
      waitlisted,
      inProgress,
      notStarted,
      urgentDeadlines,
      thisMonthDeadlines,
      acceptanceRate: submitted > 0 ? ((accepted / submitted) * 100).toFixed(1) : '0'
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const stats = getStats()

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="总申请数"
        value={stats.total}
        icon={<BookOpen className="h-6 w-6 text-white" />}
        color="bg-blue-500"
        subtext={`${stats.inProgress + stats.notStarted} 个待完成`}
      />
      
      <StatCard
        title="已提交申请"
        value={stats.submitted}
        icon={<CheckCircle2 className="h-6 w-6 text-white" />}
        color="bg-green-500"
        subtext={`录取率 ${stats.acceptanceRate}%`}
      />
      
      <StatCard
        title="录取通知"
        value={stats.accepted}
        icon={<TrendingUp className="h-6 w-6 text-white" />}
        color="bg-emerald-500"
        subtext={stats.waitlisted > 0 ? `${stats.waitlisted} 个候补` : '恭喜您！'}
      />
      
      <StatCard
        title="紧急截止"
        value={stats.urgentDeadlines}
        icon={<AlertTriangle className="h-6 w-6 text-white" />}
        color={stats.urgentDeadlines > 0 ? "bg-red-500" : "bg-gray-400"}
        subtext="7天内到期"
      />
    </div>
  )
}