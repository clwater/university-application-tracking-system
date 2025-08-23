'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { UserRole } from '@/lib/database.types'

interface ProfileSetupProps {
  role: UserRole
  onComplete: () => void
}

export default function ProfileSetup({ role, onComplete }: ProfileSetupProps) {
  const { user, refreshUserRole } = useAuth()
  const [loading, setLoading] = useState(false)
  const [checkingExisting, setCheckingExisting] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    graduationYear: '',
    gpa: '',
    satScore: '',
    actScore: '',
    targetCountries: [] as string[],
    intendedMajors: [] as string[],
    studentIds: [] as string[], // 仅用于家长
  })

  // 检查用户是否已经有档案
  useEffect(() => {
    const checkExistingProfile = async () => {
      if (!user) {
        setCheckingExisting(false)
        return
      }

      console.log('ProfileSetup: Checking existing profile for user:', user.id)
      
      try {
        // 并行检查学生和家长档案，使用 maybeSingle 避免错误
        const [studentResult, parentResult] = await Promise.all([
          supabase
            .from('students')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle(),
          supabase
            .from('parents')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle()
        ])

        const { data: studentData, error: studentError } = studentResult
        const { data: parentData, error: parentError } = parentResult

        if (studentError && studentError.code !== 'PGRST116') {
          console.error('ProfileSetup: Student query error:', studentError)
        }

        if (parentError && parentError.code !== 'PGRST116') {
          console.error('ProfileSetup: Parent query error:', parentError)
        }

        if (studentData) {
          console.log('ProfileSetup: Found existing student profile, refreshing role')
          await refreshUserRole()
          onComplete()
          return
        }

        if (parentData) {
          console.log('ProfileSetup: Found existing parent profile, refreshing role')
          await refreshUserRole()
          onComplete()
          return
        }

        console.log('ProfileSetup: No existing profile found, showing setup form')
      } catch (error) {
        console.error('ProfileSetup: Error checking existing profile:', error)
      } finally {
        setCheckingExisting(false)
      }
    }

    checkExistingProfile()
  }, [user, refreshUserRole, onComplete])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    try {
      console.log('ProfileSetup: Creating profile for role:', role, 'user:', user.id)
      
      if (role === 'student') {
        const { data, error } = await supabase.from('students').insert({
          user_id: user.id,
          name: formData.name,
          email: user.email!,
          graduation_year: formData.graduationYear ? parseInt(formData.graduationYear) : null,
          gpa: formData.gpa ? parseFloat(formData.gpa) : null,
          sat_score: formData.satScore ? parseInt(formData.satScore) : null,
          act_score: formData.actScore ? parseInt(formData.actScore) : null,
          target_countries: formData.targetCountries.length > 0 ? formData.targetCountries : null,
          intended_majors: formData.intendedMajors.length > 0 ? formData.intendedMajors : null,
        })
        
        if (error) {
          console.error('Error creating student profile:', error)
          throw error
        }
        console.log('Student profile created successfully:', data)
      } else if (role === 'parent') {
        const { data, error } = await supabase.from('parents').insert({
          user_id: user.id,
          name: formData.name,
          email: user.email!,
          student_ids: formData.studentIds.length > 0 ? formData.studentIds : null,
        })
        
        if (error) {
          console.error('Error creating parent profile:', error)
          throw error
        }
        console.log('Parent profile created successfully:', data)
      }

      console.log('ProfileSetup: Refreshing user role...')
      // 刷新用户角色
      await refreshUserRole()
      
      console.log('ProfileSetup: Calling onComplete...')
      // 调用完成回调
      onComplete()
    } catch (error) {
      console.error('Error creating profile:', error)
      alert('创建档案时出错，请重试')
    } finally {
      setLoading(false)
    }
  }

  if (checkingExisting) {
    return (
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">检查现有档案...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6">
        完善您的档案
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 基本信息 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            姓名 *
          </label>
          <input
            type="text"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        {role === 'student' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                毕业年份
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.graduationYear}
                onChange={(e) => setFormData({ ...formData, graduationYear: e.target.value })}
                placeholder="例如: 2024"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                GPA
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.gpa}
                onChange={(e) => setFormData({ ...formData, gpa: e.target.value })}
                placeholder="例如: 3.85"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SAT分数
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.satScore}
                  onChange={(e) => setFormData({ ...formData, satScore: e.target.value })}
                  placeholder="1600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ACT分数
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.actScore}
                  onChange={(e) => setFormData({ ...formData, actScore: e.target.value })}
                  placeholder="36"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                目标国家（用逗号分隔）
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例如: 美国, 加拿大, 英国"
                onChange={(e) => {
                  const countries = e.target.value.split(',').map(c => c.trim()).filter(c => c)
                  setFormData({ ...formData, targetCountries: countries })
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                意向专业（用逗号分隔）
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例如: 计算机科学, 数学, 经济学"
                onChange={(e) => {
                  const majors = e.target.value.split(',').map(m => m.trim()).filter(m => m)
                  setFormData({ ...formData, intendedMajors: majors })
                }}
              />
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? '创建中...' : '完成设置'}
        </button>
      </form>
    </div>
  )
}