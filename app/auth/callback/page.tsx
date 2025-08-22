'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { data, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('Auth error:', error)
        router.push('/auth/login')
        return
      }

      if (data.session) {
        // 尝试为新验证的用户创建档案
        try {
          const response = await fetch('/api/auth/setup-profile', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${data.session.access_token}`,
              'Content-Type': 'application/json',
            },
          })

          if (response.ok) {
            const result = await response.json()
            console.log('Profile setup result:', result)
            // 等待一段时间让AuthContext更新状态
            setTimeout(() => {
              router.push('/dashboard')
            }, 1000)
          } else {
            console.log('Profile already exists or error occurred')
            // 档案已存在，直接跳转
            router.push('/dashboard')
          }
        } catch (error) {
          console.error('Error setting up profile:', error)
          // 出错时也跳转到dashboard，让用户手动完成设置
          router.push('/dashboard')
        }
      } else {
        router.push('/auth/login')
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">正在处理登录...</p>
      </div>
    </div>
  )
}