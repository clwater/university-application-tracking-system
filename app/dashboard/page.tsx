'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import StudentDashboard from '@/components/dashboard/StudentDashboard'
import ParentDashboard from '@/components/dashboard/ParentDashboard'

export default function DashboardPage() {
  const { user, userRole, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (userRole === 'student') {
    return <StudentDashboard />
  }

  if (userRole === 'parent') {
    return <ParentDashboard />
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">角色未识别</h2>
        <p className="text-gray-600">请重新登录或联系管理员</p>
      </div>
    </div>
  )
}