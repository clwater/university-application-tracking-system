'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, PieChart } from 'lucide-react'
import { Application, University } from '@/lib/database.types'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

interface ApplicationWithUniversity extends Application {
  universities: University
}

interface ProgressBarProps {
  label: string
  value: number
  total: number
  color: string
}

function ProgressBar({ label, value, total, color }: ProgressBarProps) {
  const percentage = total > 0 ? (value / total) * 100 : 0

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm text-gray-600">
          {value} / {total} ({percentage.toFixed(0)}%)
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

export default function ApplicationProgress() {
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

  const getProgressStats = () => {
    const total = applications.length
    const notStarted = applications.filter(app => app.status === 'not_started').length
    const inProgress = applications.filter(app => app.status === 'in_progress').length
    const submitted = applications.filter(app => app.status === 'submitted' || app.status === 'under_review').length
    const completed = applications.filter(app => 
      app.status === 'accepted' || app.status === 'rejected' || app.status === 'waitlisted'
    ).length

    const accepted = applications.filter(app => app.status === 'accepted').length
    const rejected = applications.filter(app => app.status === 'rejected').length
    const waitlisted = applications.filter(app => app.status === 'waitlisted').length

    return {
      total,
      notStarted,
      inProgress,
      submitted,
      completed,
      accepted,
      rejected,
      waitlisted
    }
  }

  const getApplicationsByType = () => {
    const ed = applications.filter(app => app.application_type === 'early_decision').length
    const ea = applications.filter(app => app.application_type === 'early_action').length
    const rd = applications.filter(app => app.application_type === 'regular_decision').length
    const rolling = applications.filter(app => app.application_type === 'rolling_admission').length

    return { ed, ea, rd, rolling }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold">申请进度</h3>
        </div>
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex justify-between mb-2">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const stats = getProgressStats()
  const typeStats = getApplicationsByType()

  if (stats.total === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold">申请进度</h3>
        </div>
        <div className="text-center py-8">
          <PieChart className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">还没有申请数据</p>
          <p className="text-sm text-gray-400 mt-1">
            开始添加申请后，这里将显示您的进度统计
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold">申请进度</h3>
      </div>

      <div className="space-y-6">
        {/* 申请状态进度 */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-4">申请状态分布</h4>
          
          <ProgressBar
            label="未开始"
            value={stats.notStarted}
            total={stats.total}
            color="bg-gray-400"
          />
          
          <ProgressBar
            label="进行中"
            value={stats.inProgress}
            total={stats.total}
            color="bg-blue-500"
          />
          
          <ProgressBar
            label="已提交"
            value={stats.submitted}
            total={stats.total}
            color="bg-green-500"
          />
          
          <ProgressBar
            label="已完成"
            value={stats.completed}
            total={stats.total}
            color="bg-purple-500"
          />
        </div>

        {/* 申请类型分布 */}
        {(typeStats.ed + typeStats.ea + typeStats.rd + typeStats.rolling) > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-4">申请类型分布</h4>
            
            {typeStats.ed > 0 && (
              <ProgressBar
                label="提前决定 (ED)"
                value={typeStats.ed}
                total={stats.total}
                color="bg-red-500"
              />
            )}
            
            {typeStats.ea > 0 && (
              <ProgressBar
                label="提前行动 (EA)"
                value={typeStats.ea}
                total={stats.total}
                color="bg-orange-500"
              />
            )}
            
            {typeStats.rd > 0 && (
              <ProgressBar
                label="常规决定 (RD)"
                value={typeStats.rd}
                total={stats.total}
                color="bg-blue-500"
              />
            )}
            
            {typeStats.rolling > 0 && (
              <ProgressBar
                label="滚动录取"
                value={typeStats.rolling}
                total={stats.total}
                color="bg-green-500"
              />
            )}
          </div>
        )}

        {/* 成功率统计 */}
        {stats.completed > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-4">录取结果</h4>
            
            <ProgressBar
              label="录取"
              value={stats.accepted}
              total={stats.completed}
              color="bg-green-600"
            />
            
            <ProgressBar
              label="候补"
              value={stats.waitlisted}
              total={stats.completed}
              color="bg-yellow-500"
            />
            
            <ProgressBar
              label="拒绝"
              value={stats.rejected}
              total={stats.completed}
              color="bg-red-500"
            />
          </div>
        )}

        {/* 总结信息 */}
        <div className="pt-4 border-t">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-blue-600">总申请数</div>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {stats.completed > 0 ? ((stats.accepted / stats.completed) * 100).toFixed(0) : 0}%
              </div>
              <div className="text-sm text-green-600">录取率</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}