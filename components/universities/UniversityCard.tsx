'use client'

import { MapPin, Star, Users, DollarSign, Calendar, ExternalLink } from 'lucide-react'
import { University } from '@/lib/database.types'

interface UniversityCardProps {
  university: University
  showActions?: boolean
  onAddApplication?: (university: University) => void
  onViewDetails?: (university: University) => void
}

export default function UniversityCard({ 
  university, 
  showActions = true, 
  onAddApplication, 
  onViewDetails 
}: UniversityCardProps) {
  const formatCurrency = (amount: number | null) => {
    if (!amount) return 'N/A'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const getDeadlines = () => {
    if (!university.deadlines) return null
    const deadlines = university.deadlines as any
    return deadlines
  }

  const deadlines = getDeadlines()

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow">
      {/* 头部信息 */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 pr-2">{university.name}</h3>
          <div className="mt-2 flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
            {university.city && university.state && (
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="truncate">
                  {university.city}, {university.state}
                  {university.country && university.country !== '美国' && (
                    <span className="ml-1">({university.country})</span>
                  )}
                </span>
              </div>
            )}
            {university.us_news_ranking && (
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                <span>US News 排名 #{university.us_news_ranking}</span>
              </div>
            )}
            {university.acceptance_rate && (
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                <span>录取率 {(university.acceptance_rate * 100).toFixed(1)}%</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 申请系统 */}
      {university.application_system && (
        <div className="mb-4">
          <span className="inline-block px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full">
            {university.application_system}
          </span>
        </div>
      )}

      {/* 学费信息 */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">学费信息</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
          <div className="flex items-center gap-1">
            <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0" />
            <span className="truncate">州内: {formatCurrency(university.tuition_in_state)}</span>
          </div>
          <div className="flex items-center gap-1">
            <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0" />
            <span className="truncate">州外: {formatCurrency(university.tuition_out_state)}</span>
          </div>
        </div>
        {university.application_fee && (
          <div className="mt-1 text-xs sm:text-sm text-gray-600">
            申请费: {formatCurrency(university.application_fee)}
          </div>
        )}
      </div>

      {/* 申请截止日期 */}
      {deadlines && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
            申请截止日期
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
            {deadlines.early_decision && (
              <div>
                <span className="font-medium">ED:</span> {deadlines.early_decision}
              </div>
            )}
            {deadlines.early_action && (
              <div>
                <span className="font-medium">EA:</span> {deadlines.early_action}
              </div>
            )}
            {deadlines.regular && (
              <div>
                <span className="font-medium">RD:</span> {deadlines.regular}
              </div>
            )}
            {deadlines.rolling && (
              <div>
                <span className="font-medium">滚动录取:</span> {deadlines.rolling}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 操作按钮 */}
      {showActions && (
        <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
          {onAddApplication && (
            <button
              onClick={() => onAddApplication(university)}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm font-medium"
            >
              添加申请
            </button>
          )}
          {onViewDetails && (
            <button
              onClick={() => onViewDetails(university)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm font-medium flex items-center justify-center gap-1"
            >
              <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4" />
              详情
            </button>
          )}
        </div>
      )}
    </div>
  )
}