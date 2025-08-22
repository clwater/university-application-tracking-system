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
  const [isCustomSignUp, setIsCustomSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showRoleInfo, setShowRoleInfo] = useState(false)

  const handleCustomSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return

    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: selectedRole, // 将角色保存在用户元数据中
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) {
        console.error('Registration error:', error)
        alert(error.message || '注册失败')
      } else {
        alert('注册成功！请检查您的邮箱进行验证。')
        setIsCustomSignUp(false)
        setEmail('')
        setPassword('')
      }
    } catch (error) {
      console.error('Registration error:', error)
      alert('注册时发生错误')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            大学申请追踪系统
          </h1>
          <p className="text-sm text-gray-600 mt-2">
            {isCustomSignUp ? '创建新账户' : '登录到您的账户'}
          </p>
        </div>
        
        {/* 角色选择 - 仅在注册时显示 */}
        {isCustomSignUp && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              选择您的角色 *
            </label>
            <div className="flex space-x-4">
              <button
                type="button"
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
                type="button"
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
            <p className="text-xs text-gray-500 mt-1">
              请根据您的实际身份选择对应角色
            </p>
          </div>
        )}

        {/* 登录/注册表单 */}
        {isCustomSignUp ? (
          <form onSubmit={handleCustomSignUp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                邮箱地址
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="请输入邮箱地址"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                密码
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="请输入密码"
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? '注册中...' : '注册'}
            </button>

            <button
              type="button"
              onClick={() => setIsCustomSignUp(false)}
              className="w-full py-2 px-4 text-blue-600 hover:text-blue-700 text-sm"
            >
              已有账户？点击登录
            </button>
          </form>
        ) : (
          <>
            {/* Supabase Auth UI - 仅用于登录 */}
            <Auth
              supabaseClient={supabase}
              view="sign_in"
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
                  },
                },
              }}
              providers={[]}
              redirectTo={`${window.location.origin}/auth/callback`}
              onlyThirdPartyProviders={false}
            />

            <button
              type="button"
              onClick={() => setIsCustomSignUp(true)}
              className="w-full py-2 px-4 text-blue-600 hover:text-blue-700 text-sm mt-4"
            >
              没有账户？点击注册
            </button>
          </>
        )}

        {isCustomSignUp && (
          <div className="mt-4 text-center text-sm text-gray-600">
            当前选择角色: <span className="font-medium text-blue-600">
              {selectedRole === 'student' ? '学生' : '家长'}
            </span>
          </div>
        )}

        {!isCustomSignUp && (
          <div className="mt-4 text-center">
            <div className="text-xs text-gray-500 mb-2">
              系统将根据您的账户信息自动识别角色
            </div>
            <button
              type="button"
              onClick={() => setShowRoleInfo(!showRoleInfo)}
              className="text-xs text-blue-600 hover:text-blue-700 underline"
            >
              了解角色说明
            </button>
            {showRoleInfo && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg text-left text-xs text-gray-600">
                <div className="space-y-2">
                  <div>
                    <span className="font-medium text-blue-700">学生账户:</span> 
                    可以管理个人申请、查看申请进度、设置截止日期提醒等
                  </div>
                  <div>
                    <span className="font-medium text-green-700">家长账户:</span> 
                    可以查看关联学生的申请进度、添加备注、查看财务信息等
                  </div>
                  <div className="text-gray-500 italic">
                    * 账户角色在注册时确定，登录后自动识别
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}