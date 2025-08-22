'use client'

import { useState } from 'react'
import { Calendar, Save, X } from 'lucide-react'
import { University, ApplicationType, ApplicationStatus } from '@/lib/database.types'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

interface ApplicationFormProps {
  university: University
  onClose: () => void
  onSuccess: () => void
  existingApplication?: any
}

export default function ApplicationForm({ 
  university, 
  onClose, 
  onSuccess, 
  existingApplication 
}: ApplicationFormProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    applicationType: existingApplication?.application_type || 'regular_decision',
    deadline: existingApplication?.deadline || '',
    status: existingApplication?.status || 'not_started',
    notes: existingApplication?.notes || '',
  })

  const applicationTypes: { value: ApplicationType; label: string }[] = [
    { value: 'early_decision', label: '提前决定 (ED)' },
    { value: 'early_action', label: '提前行动 (EA)' },
    { value: 'regular_decision', label: '常规决定 (RD)' },
    { value: 'rolling_admission', label: '滚动录取' },
  ]

  const statusOptions: { value: ApplicationStatus; label: string }[] = [
    { value: 'not_started', label: '未开始' },
    { value: 'in_progress', label: '进行中' },
    { value: 'submitted', label: '已提交' },
    { value: 'under_review', label: '审核中' },
    { value: 'accepted', label: '录取' },
    { value: 'rejected', label: '拒绝' },
    { value: 'waitlisted', label: '候补' },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    try {
      // 首先获取学生ID
      const { data: student } = await supabase
        .from('students')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!student) {
        throw new Error('Student profile not found')
      }

      const applicationData = {
        student_id: student.id,
        university_id: university.id,
        application_type: formData.applicationType,
        deadline: formData.deadline || null,
        status: formData.status,
        notes: formData.notes || null,
      }

      let result
      if (existingApplication) {
        // 更新现有申请
        result = await supabase
          .from('applications')
          .update(applicationData)
          .eq('id', existingApplication.id)
      } else {
        // 创建新申请
        result = await supabase
          .from('applications')
          .insert(applicationData)
      }

      if (result.error) throw result.error

      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error saving application:', error)
      alert('保存申请时出错，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold">
            {existingApplication ? '编辑申请' : '添加申请'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* 大学信息 */}
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="font-semibold text-gray-900">{university.name}</h3>
            <p className="text-sm text-gray-600">
              {university.city}, {university.state}
            </p>
          </div>

          {/* 申请类型 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              申请类型 *
            </label>
            <select
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.applicationType}
              onChange={(e) => setFormData({ ...formData, applicationType: e.target.value as ApplicationType })}
            >
              {applicationTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* 截止日期 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              截止日期
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="date"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              />
            </div>
          </div>

          {/* 状态 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              状态 *
            </label>
            <select
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as ApplicationStatus })}
            >
              {statusOptions.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          {/* 备注 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              备注
            </label>
            <textarea
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="申请相关的备注信息..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Save className="h-4 w-4" />
              {loading ? '保存中...' : (existingApplication ? '更新' : '创建')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}