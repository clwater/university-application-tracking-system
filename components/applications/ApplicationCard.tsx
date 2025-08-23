'use client'

import { useState } from 'react'
import { Calendar, MapPin, Edit2, Trash2, AlertCircle, CheckCircle2, Clock, XCircle } from 'lucide-react'
import { format, isAfter, isBefore, addDays } from 'date-fns'
import { Application, University, ApplicationStatus } from '@/lib/database.types'
import { getStatusColor, isDeadlineApproaching } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { usePermissions } from '@/components/auth/PermissionGate'
import StatusManager from './StatusManager'

interface ApplicationCardProps {
  application: Application & { universities: University }
  onEdit: (application: Application & { universities: University }) => void
  onDelete: (applicationId: string) => void
  onStatusUpdate?: (applicationId: string, newStatus: ApplicationStatus, updates?: any) => void
  onViewDetails?: (application: Application & { universities: University }) => void
  showActions?: boolean
}

export default function ApplicationCard({ 
  application, 
  onEdit, 
  onDelete, 
  onStatusUpdate,
  onViewDetails,
  showActions = true 
}: ApplicationCardProps) {
  const [loading, setLoading] = useState(false)
  const permissions = usePermissions()

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'not_started':
        return <Clock className="h-4 w-4" />
      case 'in_progress':
        return <Clock className="h-4 w-4" />
      case 'submitted':
        return <CheckCircle2 className="h-4 w-4" />
      case 'under_review':
        return <Clock className="h-4 w-4" />
      case 'accepted':
        return <CheckCircle2 className="h-4 w-4" />
      case 'rejected':
        return <XCircle className="h-4 w-4" />
      case 'waitlisted':
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getDeadlineStatus = () => {
    if (!application.deadline) return null
    
    const deadlineDate = new Date(application.deadline)
    const today = new Date()
    
    if (isBefore(deadlineDate, today)) {
      return { type: 'overdue', text: '已过期', color: 'text-red-600' }
    } else if (isDeadlineApproaching(application.deadline, 7)) {
      return { type: 'urgent', text: '即将到期', color: 'text-orange-600' }
    } else if (isDeadlineApproaching(application.deadline, 30)) {
      return { type: 'upcoming', text: '即将到来', color: 'text-yellow-600' }
    }
    
    return { type: 'normal', text: '正常', color: 'text-gray-600' }
  }

  const handleDelete = async () => {
    if (!confirm('确定要删除这个申请吗？此操作无法撤销。')) return

    setLoading(true)
    try {
      // 首先删除关联的申请要求
      const { error: requirementsError } = await supabase
        .from('application_requirements')
        .delete()
        .eq('application_id', application.id)

      if (requirementsError) {
        console.error('Error deleting requirements:', requirementsError)
        throw requirementsError
      }

      // 然后删除申请
      const { error: applicationError } = await supabase
        .from('applications')
        .delete()
        .eq('id', application.id)

      if (applicationError) {
        console.error('Error deleting application:', applicationError)
        throw applicationError
      }

      onDelete(application.id)
    } catch (error) {
      console.error('Error deleting application:', error)
      alert('删除申请时出错，请重试')
    } finally {
      setLoading(false)
    }
  }

  const deadlineStatus = getDeadlineStatus()

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      {/* 头部 */}
      <div className="flex items-start justify-between mb-4">
        <div 
          className="flex-1 cursor-pointer"
          onClick={() => onViewDetails?.(application)}
        >
          <h3 className="text-lg font-bold text-gray-900 hover:text-blue-600 transition-colors">
            {application.universities.name}
          </h3>
          <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
            <MapPin className="h-4 w-4" />
            {application.universities.city}, {application.universities.state}
          </div>
        </div>
        
        {showActions && permissions.canWrite && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(application)}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
              title="编辑申请"
            >
              <Edit2 className="h-4 w-4" />
            </button>
            {permissions.isStudent && (
              <button
                onClick={handleDelete}
                disabled={loading}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50"
                title="删除申请"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* 申请类型和状态 */}
      <div className="flex items-center justify-between mb-4">
        <span className="inline-block px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full">
          {application.application_type === 'early_decision' && 'ED'}
          {application.application_type === 'early_action' && 'EA'}
          {application.application_type === 'regular_decision' && 'RD'}
          {application.application_type === 'rolling_admission' && '滚动录取'}
        </span>
        
        {/* 状态管理器 */}
        {permissions.canWrite && onStatusUpdate ? (
          <StatusManager
            application={application}
            onStatusUpdate={onStatusUpdate}
          />
        ) : (
          <div className={`flex items-center gap-1 px-3 py-1 text-sm rounded-full ${getStatusColor(application.status)}`}>
            {getStatusIcon(application.status)}
            <span>
              {application.status === 'not_started' && '未开始'}
              {application.status === 'in_progress' && '进行中'}
              {application.status === 'submitted' && '已提交'}
              {application.status === 'under_review' && '审核中'}
              {application.status === 'accepted' && '录取'}
              {application.status === 'rejected' && '拒绝'}
              {application.status === 'waitlisted' && '候补'}
            </span>
          </div>
        )}
      </div>

      {/* 截止日期 */}
      {application.deadline && (
        <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-md">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium">截止日期:</span>
            <span className="text-sm">
              {format(new Date(application.deadline), 'yyyy年MM月dd日')}
            </span>
          </div>
          {deadlineStatus && (
            <div className={`text-xs font-medium ${deadlineStatus.color}`}>
              {deadlineStatus.text}
            </div>
          )}
        </div>
      )}

      {/* 关键日期 */}
      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        {application.submitted_date && (
          <div>
            <span className="text-gray-500">提交日期:</span>
            <div className="font-medium">
              {format(new Date(application.submitted_date), 'yyyy-MM-dd')}
            </div>
          </div>
        )}
        {application.decision_date && (
          <div>
            <span className="text-gray-500">决定日期:</span>
            <div className="font-medium">
              {format(new Date(application.decision_date), 'yyyy-MM-dd')}
            </div>
          </div>
        )}
      </div>

      {/* 决定结果 */}
      {application.decision_type && (
        <div className="mb-4">
          <span className={`inline-block px-3 py-1 text-sm rounded-full ${
            application.decision_type === 'accepted' ? 'bg-green-100 text-green-800' :
            application.decision_type === 'rejected' ? 'bg-red-100 text-red-800' :
            'bg-orange-100 text-orange-800'
          }`}>
            {application.decision_type === 'accepted' && '录取'}
            {application.decision_type === 'rejected' && '拒绝'}
            {application.decision_type === 'waitlisted' && '候补'}
          </span>
        </div>
      )}

      {/* 备注 */}
      {application.notes && (
        <div className="mt-4 p-3 bg-gray-50 rounded-md">
          <h4 className="text-sm font-medium text-gray-700 mb-1">备注</h4>
          <p className="text-sm text-gray-600">{application.notes}</p>
        </div>
      )}

      {/* 紧急警告 */}
      {deadlineStatus?.type === 'overdue' && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center gap-2 text-red-800">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm font-medium">申请截止日期已过</span>
          </div>
        </div>
      )}
      
      {deadlineStatus?.type === 'urgent' && (
        <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-md">
          <div className="flex items-center gap-2 text-orange-800">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm font-medium">截止日期即将到期</span>
          </div>
        </div>
      )}
    </div>
  )
}