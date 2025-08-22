'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { UserRole } from '@/lib/database.types'

interface ProfileSetupProps {
  role: UserRole
  onComplete: () => void
}

export default function ProfileSetup({ role, onComplete }: ProfileSetupProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    try {
      if (role === 'student') {
        await supabase.from('students').insert({
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
      } else if (role === 'parent') {
        await supabase.from('parents').insert({
          user_id: user.id,
          name: formData.name,
          email: user.email!,
          student_ids: formData.studentIds.length > 0 ? formData.studentIds : null,
        })
      }

      onComplete()
    } catch (error) {
      console.error('Error creating profile:', error)
      alert('创建档案时出错，请重试')
    } finally {
      setLoading(false)
    }
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