'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import StudentDashboard from '@/components/dashboard/StudentDashboard'
import ParentDashboard from '@/components/dashboard/ParentDashboard'
import ProfileSetup from '@/components/auth/ProfileSetup'
import { UserRole } from '@/lib/database.types'

export default function DashboardPage() {
  const { user, userRole, loading } = useAuth()
  const router = useRouter()
  const [selectedRole, setSelectedRole] = useState<UserRole>('student')
  const [needsProfileSetup, setNeedsProfileSetup] = useState(false)
  const [profileSetupChecked, setProfileSetupChecked] = useState(false)

  useEffect(() => {
    if (!loading && !profileSetupChecked) {
      console.log('Dashboard: State check - user:', user?.id, 'userRole:', userRole)
      if (!user) {
        console.log('Dashboard: No user, redirecting to login')
        router.push('/auth/login')
      } else if (!userRole) {
        console.log('Dashboard: User exists but no role, showing ProfileSetup')
        // 用户已登录但没有角色，需要完善档案
        const roleFromMetadata = user.user_metadata?.role as UserRole
        console.log('Dashboard: Role from metadata:', roleFromMetadata)
        if (roleFromMetadata) {
          setSelectedRole(roleFromMetadata)
        }
        setNeedsProfileSetup(true)
      } else {
        console.log('Dashboard: User has role:', userRole, 'showing dashboard')
      }
      setProfileSetupChecked(true)
    }
  }, [user, userRole, loading, router, profileSetupChecked])

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

  // 如果需要完善档案，显示ProfileSetup
  if (needsProfileSetup) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <ProfileSetup
          role={selectedRole}
          onComplete={() => {
            console.log('Dashboard: ProfileSetup completed, resetting state')
            setNeedsProfileSetup(false)
            setProfileSetupChecked(false) // 重置检查状态，触发重新检查
          }}
        />
      </div>
    )
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
        <h2 className="text-2xl font-bold text-gray-900 mb-4">正在加载用户信息...</h2>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    </div>
  )
}