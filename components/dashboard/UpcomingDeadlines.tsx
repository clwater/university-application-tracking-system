'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, AlertTriangle, ExternalLink } from 'lucide-react'
import { format, differenceInDays } from 'date-fns'
import { Application, University } from '@/lib/database.types'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

interface ApplicationWithUniversity extends Application {
  universities: University
}

export default function UpcomingDeadlines() {
  const { user } = useAuth()
  const [upcomingApplications, setUpcomingApplications] = useState<ApplicationWithUniversity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchUpcomingDeadlines()
    }
  }, [user])

  const fetchUpcomingDeadlines = async () => {
    if (!user) return

    try {
      const { data: student } = await supabase
        .from('students')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!student) return

      const today = new Date()
      const thirtyDaysFromNow = new Date()
      thirtyDaysFromNow.setDate(today.getDate() + 30)

      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          universities (*)
        `)
        .eq('student_id', student.id)
        .not('deadline', 'is', null)
        .gte('deadline', today.toISOString())
        .lte('deadline', thirtyDaysFromNow.toISOString())
        .order('deadline', { ascending: true })

      if (error) throw error
      setUpcomingApplications(data as ApplicationWithUniversity[] || [])
    } catch (error) {
      console.error('Error fetching upcoming deadlines:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDaysUntilDeadline = (deadline: string) => {
    return differenceInDays(new Date(deadline), new Date())
  }

  const getUrgencyColor = (daysUntil: number) => {
    if (daysUntil <= 3) return 'text-red-600 bg-red-50 border-red-200'
    if (daysUntil <= 7) return 'text-orange-600 bg-orange-50 border-orange-200'
    if (daysUntil <= 14) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    return 'text-blue-600 bg-blue-50 border-blue-200'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'not_started':
        return 'bg-gray-100 text-gray-800'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'submitted':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5 text-orange-600" />
          <h3 className="text-lg font-semibold">即将到期的申请</h3>
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-4 border rounded-lg animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="h-5 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </div>
                <div className="h-6 w-16 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-orange-600" />
          <h3 className="text-lg font-semibold">即将到期的申请</h3>
        </div>
        <span className="text-sm text-gray-500">
          接下来30天
        </span>
      </div>

      {upcomingApplications.length === 0 ? (
        <div className="text-center py-8">
          <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">接下来30天内没有截止申请</p>
          <p className="text-sm text-gray-400 mt-1">
            您可以放松一下，或者提前准备其他申请材料
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {upcomingApplications.map((application) => {
            const daysUntil = getDaysUntilDeadline(application.deadline!)
            const urgencyColor = getUrgencyColor(daysUntil)
            
            return (
              <div
                key={application.id}
                className={`p-4 border rounded-lg ${urgencyColor} hover:shadow-md transition-shadow`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium text-gray-900 truncate">
                        {application.universities.name}
                      </h4>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(application.status)}`}>
                        {application.status === 'not_started' && '未开始'}
                        {application.status === 'in_progress' && '进行中'}
                        {application.status === 'submitted' && '已提交'}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-gray-600">
                        {format(new Date(application.deadline!), 'MM月dd日')}
                      </span>
                      <span className="text-gray-500">
                        {application.application_type === 'early_decision' && 'ED'}
                        {application.application_type === 'early_action' && 'EA'}
                        {application.application_type === 'regular_decision' && 'RD'}
                        {application.application_type === 'rolling_admission' && '滚动录取'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 ml-4">
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        {daysUntil <= 3 && <AlertTriangle className="h-4 w-4" />}
                        <span className="font-semibold">
                          {daysUntil === 0 ? '今天' : 
                           daysUntil === 1 ? '明天' : 
                           `${daysUntil}天`}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">剩余</span>
                    </div>
                    
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                      <ExternalLink className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                {application.notes && (
                  <div className="mt-3 pt-3 border-t border-current border-opacity-20">
                    <p className="text-sm text-gray-700">
                      {application.notes}
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {upcomingApplications.length > 0 && (
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">
              共 {upcomingApplications.length} 个即将到期的申请
            </span>
            <button className="text-blue-600 hover:text-blue-800 font-medium">
              查看全部 →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}