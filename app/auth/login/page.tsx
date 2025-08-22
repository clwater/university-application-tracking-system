'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import LoginForm from '@/components/auth/LoginForm'
import ProfileSetup from '@/components/auth/ProfileSetup'
import { UserRole } from '@/lib/database.types'

export default function LoginPage() {
  const { user, userRole, loading } = useAuth()
  const router = useRouter()
  const [needsProfileSetup, setNeedsProfileSetup] = useState(false)
  const [selectedRole, setSelectedRole] = useState<UserRole>('student')

  useEffect(() => {
    if (!loading && user) {
      if (userRole) {
        router.push('/dashboard')
      } else {
        setNeedsProfileSetup(true)
      }
    }
  }, [user, userRole, loading, router])

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

  if (user && needsProfileSetup) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <ProfileSetup
          role={selectedRole}
          onComplete={() => router.push('/dashboard')}
        />
      </div>
    )
  }

  // 如果用户已登录且有角色，不显示登录表单（重定向在useEffect中处理）
  if (user && userRole) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">正在跳转...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <LoginForm onRoleSelect={setSelectedRole} />
    </div>
  )
}