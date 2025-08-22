'use client'

import { useState } from 'react'
import { Calendar, CheckCircle2, Clock, AlertTriangle, ArrowRight } from 'lucide-react'
import { Application, ApplicationStatus } from '@/lib/database.types'
import { supabase } from '@/lib/supabase'
import { format } from 'date-fns'

interface StatusManagerProps {
  application: Application
  onStatusUpdate: (applicationId: string, newStatus: ApplicationStatus, updates?: any) => void
}

export default function StatusManager({ application, onStatusUpdate }: StatusManagerProps) {
  const [loading, setLoading] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [newStatus, setNewStatus] = useState<ApplicationStatus>(application.status as ApplicationStatus)
  const [statusDetails, setStatusDetails] = useState({
    submittedDate: application.submitted_date || '',
    decisionDate: application.decision_date || '',
    decisionType: (application.decision_type as string) || '',
    notes: application.notes || '',
  })

  const statusOptions: { value: ApplicationStatus; label: string; description: string }[] = [
    { 
      value: 'not_started', 
      label: '未开始', 
      description: '还未开始准备申请材料' 
    },
    { 
      value: 'in_progress', 
      label: '进行中', 
      description: '正在准备申请材料和文档' 
    },
    { 
      value: 'submitted', 
      label: '已提交', 
      description: '申请已提交给学校' 
    },
    { 
      value: 'under_review', 
      label: '审核中', 
      description: '学校正在审核申请' 
    },
    { 
      value: 'accepted', 
      label: '录取', 
      description: '收到录取通知' 
    },
    { 
      value: 'rejected', 
      label: '拒绝', 
      description: '收到拒绝通知' 
    },
    { 
      value: 'waitlisted', 
      label: '候补', 
      description: '被放入候补名单' 
    },
  ]

  const getStatusColor = (status: ApplicationStatus) => {
    switch (status) {
      case 'not_started':
        return 'text-gray-600 bg-gray-100'
      case 'in_progress':
        return 'text-blue-600 bg-blue-100'
      case 'submitted':
        return 'text-green-600 bg-green-100'
      case 'under_review':
        return 'text-yellow-600 bg-yellow-100'
      case 'accepted':
        return 'text-emerald-600 bg-emerald-100'
      case 'rejected':
        return 'text-red-600 bg-red-100'
      case 'waitlisted':
        return 'text-orange-600 bg-orange-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: ApplicationStatus) => {
    switch (status) {
      case 'not_started':
      case 'in_progress':
        return <Clock className="h-4 w-4" />
      case 'submitted':
      case 'under_review':
      case 'accepted':
        return <CheckCircle2 className="h-4 w-4" />
      case 'rejected':
        return <AlertTriangle className="h-4 w-4" />
      case 'waitlisted':
        return <Clock className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const handleStatusUpdate = async () => {
    setLoading(true)
    try {
      const updates: any = {
        status: newStatus,
        notes: statusDetails.notes,
      }

      // 自动设置日期
      if (newStatus === 'submitted' && !application.submitted_date) {
        updates.submitted_date = statusDetails.submittedDate || new Date().toISOString().split('T')[0]
      }

      if (['accepted', 'rejected', 'waitlisted'].includes(newStatus) && !application.decision_date) {
        updates.decision_date = statusDetails.decisionDate || new Date().toISOString().split('T')[0]
        updates.decision_type = statusDetails.decisionType || newStatus
      }

      const { error } = await supabase
        .from('applications')
        .update(updates)
        .eq('id', application.id)

      if (error) throw error

      onStatusUpdate(application.id, newStatus, updates)
      setShowStatusModal(false)
    } catch (error) {
      console.error('Error updating status:', error)
      alert('更新状态时出错，请重试')
    } finally {
      setLoading(false)
    }
  }

  const getNextSuggestedStatus = () => {
    switch (application.status as ApplicationStatus) {
      case 'not_started':
        return 'in_progress'
      case 'in_progress':
        return 'submitted'
      case 'submitted':
        return 'under_review'
      case 'under_review':
        return 'accepted' // 或者让用户选择
      default:
        return null
    }
  }

  const nextStatus = getNextSuggestedStatus()

  return (
    <>
      {/* 当前状态显示 */}
      <div className="flex items-center gap-3">
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status as ApplicationStatus)}`}>
          {getStatusIcon(application.status as ApplicationStatus)}
          {statusOptions.find(option => option.value === application.status as ApplicationStatus)?.label}
        </div>

        {/* 快速更新按钮 */}
        {nextStatus && (
          <button
            onClick={() => {
              setNewStatus(nextStatus)
              setShowStatusModal(true)
            }}
            className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
          >
            <ArrowRight className="h-3 w-3" />
            更新到 {statusOptions.find(option => option.value === nextStatus)?.label}
          </button>
        )}

        {/* 手动更新按钮 */}
        <button
          onClick={() => setShowStatusModal(true)}
          className="text-sm text-gray-600 hover:text-gray-800 underline"
        >
          更改状态
        </button>
      </div>

      {/* 状态更新模态框 */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">更新申请状态</h3>

              {/* 状态选择 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  新状态
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as ApplicationStatus)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label} - {option.description}
                    </option>
                  ))}
                </select>
              </div>

              {/* 提交日期 */}
              {newStatus === 'submitted' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    提交日期
                  </label>
                  <input
                    type="date"
                    value={statusDetails.submittedDate}
                    onChange={(e) => setStatusDetails({ ...statusDetails, submittedDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              {/* 决定日期和类型 */}
              {['accepted', 'rejected', 'waitlisted'].includes(newStatus) && (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      决定日期
                    </label>
                    <input
                      type="date"
                      value={statusDetails.decisionDate}
                      onChange={(e) => setStatusDetails({ ...statusDetails, decisionDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      决定结果
                    </label>
                    <select
                      value={statusDetails.decisionType}
                      onChange={(e) => setStatusDetails({ ...statusDetails, decisionType: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">请选择</option>
                      <option value="accepted">录取</option>
                      <option value="rejected">拒绝</option>
                      <option value="waitlisted">候补</option>
                    </select>
                  </div>
                </>
              )}

              {/* 备注 */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  备注（可选）
                </label>
                <textarea
                  rows={3}
                  value={statusDetails.notes}
                  onChange={(e) => setStatusDetails({ ...statusDetails, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="添加关于状态变更的备注..."
                />
              </div>

              {/* 操作按钮 */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  取消
                </button>
                <button
                  onClick={handleStatusUpdate}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {loading ? '更新中...' : '确认更新'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}