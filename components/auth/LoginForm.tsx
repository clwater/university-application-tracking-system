'use client'

import { useState } from 'react'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '@/lib/supabase'
import { UserRole } from '@/lib/database.types'

interface LoginFormProps {
  onRoleSelect?: (role: UserRole) => void
}

export default function LoginForm({ onRoleSelect }: LoginFormProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>('student')

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">
          大学申请追踪系统
        </h1>
        
        {/* 角色选择 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            选择您的角色
          </label>
          <div className="flex space-x-4">
            <button
              onClick={() => setSelectedRole('student')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${
                selectedRole === 'student'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              学生
            </button>
            <button
              onClick={() => setSelectedRole('parent')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${
                selectedRole === 'parent'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              家长
            </button>
          </div>
        </div>

        {/* Supabase Auth UI */}
        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#2563eb',
                  brandAccent: '#1d4ed8',
                },
              },
            },
          }}
          localization={{
            variables: {
              sign_in: {
                email_label: '邮箱地址',
                password_label: '密码',
                button_label: '登录',
                loading_button_label: '登录中...',
                social_provider_text: '使用{{provider}}登录',
                link_text: '已有账户？点击登录',
              },
              sign_up: {
                email_label: '邮箱地址',
                password_label: '密码',
                button_label: '注册',
                loading_button_label: '注册中...',
                social_provider_text: '使用{{provider}}注册',
                link_text: '没有账户？点击注册',
              },
            },
          }}
          providers={[]}
          redirectTo={`${window.location.origin}/auth/callback`}
          onlyThirdPartyProviders={false}
        />

        <div className="mt-4 text-center text-sm text-gray-600">
          当前选择角色: <span className="font-medium">
            {selectedRole === 'student' ? '学生' : '家长'}
          </span>
        </div>
      </div>
    </div>
  )
}