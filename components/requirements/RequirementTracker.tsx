'use client'

import { useState, useEffect } from 'react'
import { Plus, CheckCircle2, Clock, AlertTriangle, Edit2, Trash2, Calendar } from 'lucide-react'
import { Application, ApplicationRequirement, RequirementStatus } from '@/lib/database.types'
import { supabase } from '@/lib/supabase'
import { format } from 'date-fns'

interface RequirementTrackerProps {
  applicationId: string
}

interface RequirementFormData {
  requirementType: string
  status: RequirementStatus
  deadline: string
  notes: string
}

const defaultRequirements = [
  'essay',
  'recommendation_letter',
  'transcript',
  'test_scores',
  'portfolio',
  'interview',
  'application_form',
  'financial_documents'
]

const requirementLabels: Record<string, string> = {
  essay: '个人陈述/文书',
  recommendation_letter: '推荐信',
  transcript: '成绩单',
  test_scores: '标准化考试成绩',
  portfolio: '作品集',
  interview: '面试',
  application_form: '申请表格',
  financial_documents: '财务文件'
}

export default function RequirementTracker({ applicationId }: RequirementTrackerProps) {
  const [requirements, setRequirements] = useState<ApplicationRequirement[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingRequirement, setEditingRequirement] = useState<ApplicationRequirement | null>(null)
  const [formData, setFormData] = useState<RequirementFormData>({
    requirementType: '',
    status: 'not_started',
    deadline: '',
    notes: ''
  })

  useEffect(() => {
    fetchRequirements()
  }, [applicationId])

  const fetchRequirements = async () => {
    try {
      const { data, error } = await supabase
        .from('application_requirements')
        .select('*')
        .eq('application_id', applicationId)
        .order('created_at', { ascending: true })

      if (error) throw error
      setRequirements(data || [])
    } catch (error) {
      console.error('Error fetching requirements:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const requirementData = {
        application_id: applicationId,
        requirement_type: formData.requirementType,
        status: formData.status,
        deadline: formData.deadline || null,
        notes: formData.notes || null,
      }

      let result
      if (editingRequirement) {
        result = await supabase
          .from('application_requirements')
          .update(requirementData)
          .eq('id', editingRequirement.id)
      } else {
        result = await supabase
          .from('application_requirements')
          .insert(requirementData)
      }

      if (result.error) throw result.error

      await fetchRequirements()
      handleCloseForm()
    } catch (error) {
      console.error('Error saving requirement:', error)
      alert('保存要求时出错，请重试')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (requirementId: string) => {
    if (!confirm('确定要删除这个要求吗？')) return

    try {
      const { error } = await supabase
        .from('application_requirements')
        .delete()
        .eq('id', requirementId)

      if (error) throw error
      await fetchRequirements()
    } catch (error) {
      console.error('Error deleting requirement:', error)
      alert('删除要求时出错，请重试')
    }
  }

  const handleEdit = (requirement: ApplicationRequirement) => {
    setEditingRequirement(requirement)
    setFormData({
      requirementType: requirement.requirement_type,
      status: requirement.status as RequirementStatus,
      deadline: requirement.deadline || '',
      notes: requirement.notes || ''
    })
    setShowAddForm(true)
  }

  const handleCloseForm = () => {
    setShowAddForm(false)
    setEditingRequirement(null)
    setFormData({
      requirementType: '',
      status: 'not_started',
      deadline: '',
      notes: ''
    })
  }

  const getStatusColor = (status: RequirementStatus) => {
    switch (status) {
      case 'not_started':
        return 'text-gray-600 bg-gray-100'
      case 'in_progress':
        return 'text-blue-600 bg-blue-100'
      case 'completed':
        return 'text-green-600 bg-green-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: RequirementStatus) => {
    switch (status) {
      case 'not_started':
        return <Clock className="h-4 w-4" />
      case 'in_progress':
        return <Clock className="h-4 w-4" />
      case 'completed':
        return <CheckCircle2 className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getProgressStats = () => {
    const total = requirements.length
    const completed = requirements.filter(req => req.status === 'completed').length
    const inProgress = requirements.filter(req => req.status === 'in_progress').length
    const notStarted = requirements.filter(req => req.status === 'not_started').length

    return { total, completed, inProgress, notStarted, progress: total > 0 ? (completed / total) * 100 : 0 }
  }

  const stats = getProgressStats()

  if (loading && requirements.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* 头部和进度 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">申请要求追踪</h3>
          <p className="text-sm text-gray-600 mt-1">
            跟踪申请所需的各项材料和文档
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4" />
          添加要求
        </button>
      </div>

      {/* 进度概览 */}
      {requirements.length > 0 && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700">总体进度</span>
            <span className="text-sm text-gray-600">
              {stats.completed} / {stats.total} 已完成
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
            <div
              className="bg-green-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${stats.progress}%` }}
            />
          </div>
          <div className="grid grid-cols-3 gap-4 text-center text-sm">
            <div>
              <div className="font-semibold text-green-600">{stats.completed}</div>
              <div className="text-gray-500">已完成</div>
            </div>
            <div>
              <div className="font-semibold text-blue-600">{stats.inProgress}</div>
              <div className="text-gray-500">进行中</div>
            </div>
            <div>
              <div className="font-semibold text-gray-600">{stats.notStarted}</div>
              <div className="text-gray-500">未开始</div>
            </div>
          </div>
        </div>
      )}

      {/* 要求列表 */}
      {requirements.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
            <svg fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.1 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/>
            </svg>
          </div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">
            还没有添加申请要求
          </h4>
          <p className="text-gray-600 mb-4">
            添加需要完成的申请材料和文档，跟踪准备进度
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4" />
            添加第一个要求
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {requirements.map((requirement) => (
            <div
              key={requirement.id}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-medium text-gray-900">
                      {requirementLabels[requirement.requirement_type] || requirement.requirement_type}
                    </h4>
                    <div className={`flex items-center gap-1 px-2 py-1 text-xs rounded-full ${getStatusColor(requirement.status as RequirementStatus)}`}>
                      {getStatusIcon(requirement.status as RequirementStatus)}
                      <span>
                        {(requirement.status as RequirementStatus) === 'not_started' && '未开始'}
                        {(requirement.status as RequirementStatus) === 'in_progress' && '进行中'}
                        {(requirement.status as RequirementStatus) === 'completed' && '已完成'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    {requirement.deadline && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        截止: {format(new Date(requirement.deadline), 'MM月dd日')}
                      </div>
                    )}
                    <div>
                      创建于 {format(new Date(requirement.created_at), 'MM月dd日')}
                    </div>
                  </div>

                  {requirement.notes && (
                    <div className="mt-2 p-2 bg-gray-100 rounded text-sm">
                      {requirement.notes}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(requirement)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                    title="编辑要求"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(requirement.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                    title="删除要求"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 添加/编辑表单模态框 */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                {editingRequirement ? '编辑要求' : '添加申请要求'}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* 要求类型 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    要求类型 *
                  </label>
                  {editingRequirement ? (
                    <input
                      type="text"
                      value={requirementLabels[formData.requirementType] || formData.requirementType}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500"
                    />
                  ) : (
                    <select
                      required
                      value={formData.requirementType}
                      onChange={(e) => setFormData({ ...formData, requirementType: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">请选择要求类型</option>
                      {defaultRequirements.map(type => (
                        <option key={type} value={type}>
                          {requirementLabels[type]}
                        </option>
                      ))}
                      <option value="other">其他（自定义）</option>
                    </select>
                  )}
                </div>

                {/* 自定义类型 */}
                {formData.requirementType === 'other' && !editingRequirement && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      自定义要求名称 *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="输入自定义要求名称"
                      onChange={(e) => setFormData({ ...formData, requirementType: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}

                {/* 状态 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    状态 *
                  </label>
                  <select
                    required
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as RequirementStatus })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="not_started">未开始</option>
                    <option value="in_progress">进行中</option>
                    <option value="completed">已完成</option>
                  </select>
                </div>

                {/* 截止日期 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    截止日期（可选）
                  </label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* 备注 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    备注（可选）
                  </label>
                  <textarea
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="添加相关备注或说明..."
                  />
                </div>

                {/* 操作按钮 */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseForm}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {loading ? '保存中...' : (editingRequirement ? '更新' : '添加')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}