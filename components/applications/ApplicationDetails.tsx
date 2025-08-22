'use client'

import { useState } from 'react'
import { X, MapPin, Calendar, DollarSign, ExternalLink } from 'lucide-react'
import { Application, University } from '@/lib/database.types'
import { format } from 'date-fns'
import RequirementTracker from '../requirements/RequirementTracker'
import StatusManager from './StatusManager'

interface ApplicationDetailsProps {
  application: Application & { universities: University }
  onClose: () => void
  onStatusUpdate?: (applicationId: string, newStatus: any, updates?: any) => void
}

export default function ApplicationDetails({ 
  application, 
  onClose, 
  onStatusUpdate 
}: ApplicationDetailsProps) {
  const [activeTab, setActiveTab] = useState('overview')

  const formatCurrency = (amount: number | null) => {
    if (!amount) return 'N/A'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const getDeadlines = () => {
    if (!application.universities.deadlines) return null
    return application.universities.deadlines as any
  }

  const deadlines = getDeadlines()

  const tabs = [
    { id: 'overview', label: '概览' },
    { id: 'requirements', label: '申请要求' },
    { id: 'timeline', label: '时间线' },
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b bg-gray-50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {application.universities.name}
            </h2>
            <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {application.universities.city}, {application.universities.state}
              </div>
              {application.universities.us_news_ranking && (
                <span>排名 #{application.universities.us_news_ranking}</span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full p-2"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* 标签导航 */}
        <div className="border-b">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* 内容区域 */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* 申请状态 */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">申请状态</h3>
                {onStatusUpdate ? (
                  <StatusManager
                    application={application}
                    onStatusUpdate={onStatusUpdate}
                  />
                ) : (
                  <div className="text-gray-600">只读模式</div>
                )}
              </div>

              {/* 基本信息 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">申请信息</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">申请类型:</span>
                      <span className="font-medium">
                        {application.application_type === 'early_decision' && '提前决定 (ED)'}
                        {application.application_type === 'early_action' && '提前行动 (EA)'}
                        {application.application_type === 'regular_decision' && '常规决定 (RD)'}
                        {application.application_type === 'rolling_admission' && '滚动录取'}
                      </span>
                    </div>
                    {application.deadline && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">截止日期:</span>
                        <span className="font-medium">
                          {format(new Date(application.deadline), 'yyyy年MM月dd日')}
                        </span>
                      </div>
                    )}
                    {application.submitted_date && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">提交日期:</span>
                        <span className="font-medium">
                          {format(new Date(application.submitted_date), 'yyyy年MM月dd日')}
                        </span>
                      </div>
                    )}
                    {application.decision_date && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">决定日期:</span>
                        <span className="font-medium">
                          {format(new Date(application.decision_date), 'yyyy年MM月dd日')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">学费信息</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">州内学费:</span>
                      <span className="font-medium">
                        {formatCurrency(application.universities.tuition_in_state)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">州外学费:</span>
                      <span className="font-medium">
                        {formatCurrency(application.universities.tuition_out_state)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">申请费:</span>
                      <span className="font-medium">
                        {formatCurrency(application.universities.application_fee)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 大学详情 */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">大学信息</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">录取率:</span>
                      <span className="font-medium">
                        {application.universities.acceptance_rate 
                          ? `${(application.universities.acceptance_rate * 100).toFixed(1)}%`
                          : 'N/A'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">申请系统:</span>
                      <span className="font-medium">
                        {application.universities.application_system || 'N/A'}
                      </span>
                    </div>
                  </div>
                  
                  {deadlines && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900">申请截止日期</h4>
                      {deadlines.early_decision && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">ED:</span>
                          <span className="font-medium">{deadlines.early_decision}</span>
                        </div>
                      )}
                      {deadlines.early_action && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">EA:</span>
                          <span className="font-medium">{deadlines.early_action}</span>
                        </div>
                      )}
                      {deadlines.regular && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">RD:</span>
                          <span className="font-medium">{deadlines.regular}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* 备注 */}
              {application.notes && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">备注</h3>
                  <p className="text-gray-700 text-sm">{application.notes}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'requirements' && (
            <RequirementTracker applicationId={application.id} />
          )}

          {activeTab === 'timeline' && (
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">时间线功能</h3>
              <p className="text-gray-600">时间线功能正在开发中...</p>
            </div>
          )}
        </div>

        {/* 底部操作栏 */}
        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            关闭
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <ExternalLink className="h-4 w-4" />
            查看大学官网
          </button>
        </div>
      </div>
    </div>
  )
}