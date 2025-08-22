'use client'

import { useState, useEffect } from 'react'
import { X, Plus, Star, MapPin, Users, DollarSign, Calendar, ArrowRight } from 'lucide-react'
import { University } from '@/lib/database.types'
import UniversitySearch from './UniversitySearch'

interface UniversityComparisonProps {
  initialUniversities?: University[]
  onClose?: () => void
}

export default function UniversityComparison({ 
  initialUniversities = [], 
  onClose 
}: UniversityComparisonProps) {
  const [selectedUniversities, setSelectedUniversities] = useState<University[]>(initialUniversities)
  const [showSearch, setShowSearch] = useState(false)

  const maxComparisons = 4

  const addUniversity = (university: University) => {
    if (selectedUniversities.length < maxComparisons && 
        !selectedUniversities.some(u => u.id === university.id)) {
      setSelectedUniversities([...selectedUniversities, university])
      setShowSearch(false)
    }
  }

  const removeUniversity = (universityId: string) => {
    setSelectedUniversities(selectedUniversities.filter(u => u.id !== universityId))
  }

  const formatCurrency = (amount: number | null) => {
    if (!amount) return 'N/A'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getAcceptanceRateColor = (rate: number | null) => {
    if (!rate) return 'text-gray-500'
    if (rate < 0.1) return 'text-red-600'
    if (rate < 0.3) return 'text-orange-600'
    if (rate < 0.5) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getRankingColor = (ranking: number | null) => {
    if (!ranking) return 'text-gray-500'
    if (ranking <= 10) return 'text-purple-600'
    if (ranking <= 25) return 'text-blue-600'
    if (ranking <= 50) return 'text-green-600'
    return 'text-gray-600'
  }

  const comparisonFields = [
    {
      label: '基本信息',
      fields: [
        {
          key: 'location',
          label: '地理位置',
          render: (uni: University) => (
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4 text-gray-400" />
              <span>{uni.city}, {uni.state}</span>
              {uni.country && uni.country !== '美国' && (
                <span className="text-gray-500">({uni.country})</span>
              )}
            </div>
          )
        },
        {
          key: 'ranking',
          label: 'US News 排名',
          render: (uni: University) => (
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-gray-400" />
              <span className={getRankingColor(uni.us_news_ranking)}>
                {uni.us_news_ranking ? `#${uni.us_news_ranking}` : 'N/A'}
              </span>
            </div>
          )
        },
        {
          key: 'acceptance_rate',
          label: '录取率',
          render: (uni: University) => (
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4 text-gray-400" />
              <span className={getAcceptanceRateColor(uni.acceptance_rate)}>
                {uni.acceptance_rate ? `${(uni.acceptance_rate * 100).toFixed(1)}%` : 'N/A'}
              </span>
            </div>
          )
        },
        {
          key: 'application_system',
          label: '申请系统',
          render: (uni: University) => (
            <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
              {uni.application_system || 'N/A'}
            </span>
          )
        },
      ]
    },
    {
      label: '费用信息',
      fields: [
        {
          key: 'tuition_in_state',
          label: '州内学费',
          render: (uni: University) => (
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4 text-gray-400" />
              <span className="font-medium">
                {formatCurrency(uni.tuition_in_state)}
              </span>
            </div>
          )
        },
        {
          key: 'tuition_out_state',
          label: '州外学费',
          render: (uni: University) => (
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4 text-gray-400" />
              <span className="font-medium">
                {formatCurrency(uni.tuition_out_state)}
              </span>
            </div>
          )
        },
        {
          key: 'application_fee',
          label: '申请费',
          render: (uni: University) => (
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4 text-gray-400" />
              <span>{formatCurrency(uni.application_fee)}</span>
            </div>
          )
        },
      ]
    },
    {
      label: '申请截止日期',
      fields: [
        {
          key: 'deadlines',
          label: '截止日期',
          render: (uni: University) => {
            const deadlines = uni.deadlines as any
            if (!deadlines) return <span className="text-gray-500">N/A</span>
            
            return (
              <div className="space-y-1 text-sm">
                {deadlines.early_decision && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 w-8">ED:</span>
                    <span>{deadlines.early_decision}</span>
                  </div>
                )}
                {deadlines.early_action && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 w-8">EA:</span>
                    <span>{deadlines.early_action}</span>
                  </div>
                )}
                {deadlines.regular && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 w-8">RD:</span>
                    <span>{deadlines.regular}</span>
                  </div>
                )}
              </div>
            )
          }
        },
      ]
    },
  ]

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* 头部 */}
      <div className="flex items-center justify-between p-6 border-b">
        <div>
          <h2 className="text-xl font-bold text-gray-900">大学对比</h2>
          <p className="text-gray-600 mt-1">
            并排比较不同大学的信息和要求
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full p-2"
          >
            <X className="h-6 w-6" />
          </button>
        )}
      </div>

      {/* 大学选择区域 */}
      <div className="p-6 border-b bg-gray-50">
        <div className="flex items-center gap-4 mb-4">
          <h3 className="font-semibold text-gray-900">选择要比较的大学</h3>
          <span className="text-sm text-gray-500">
            ({selectedUniversities.length}/{maxComparisons})
          </span>
        </div>

        <div className="flex flex-wrap gap-3">
          {/* 已选择的大学 */}
          {selectedUniversities.map((university) => (
            <div
              key={university.id}
              className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-2 rounded-lg"
            >
              <span className="font-medium">{university.name}</span>
              <button
                onClick={() => removeUniversity(university.id)}
                className="text-blue-600 hover:text-blue-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}

          {/* 添加大学按钮 */}
          {selectedUniversities.length < maxComparisons && (
            <button
              onClick={() => setShowSearch(true)}
              className="flex items-center gap-2 px-3 py-2 border-2 border-dashed border-gray-300 text-gray-600 rounded-lg hover:border-blue-500 hover:text-blue-600 transition-colors"
            >
              <Plus className="h-4 w-4" />
              添加大学
            </button>
          )}
        </div>
      </div>

      {/* 比较表格 */}
      {selectedUniversities.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left p-4 font-medium text-gray-900 w-48">
                  比较项目
                </th>
                {selectedUniversities.map((university) => (
                  <th key={university.id} className="text-left p-4 font-medium text-gray-900 min-w-64">
                    <div>
                      <div className="font-bold">{university.name}</div>
                      <div className="text-sm font-normal text-gray-600">
                        {university.city}, {university.state}
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparisonFields.map((section) => (
                <React.Fragment key={section.label}>
                  {/* 分组标题 */}
                  <tr className="bg-gray-100">
                    <td
                      colSpan={selectedUniversities.length + 1}
                      className="p-4 font-semibold text-gray-900"
                    >
                      {section.label}
                    </td>
                  </tr>
                  
                  {/* 分组字段 */}
                  {section.fields.map((field) => (
                    <tr key={field.key} className="border-b hover:bg-gray-50">
                      <td className="p-4 font-medium text-gray-700">
                        {field.label}
                      </td>
                      {selectedUniversities.map((university) => (
                        <td key={university.id} className="p-4">
                          {field.render(university)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
            <svg fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            开始比较大学
          </h3>
          <p className="text-gray-600 mb-4">
            选择至少两所大学来开始对比它们的信息
          </p>
          <button
            onClick={() => setShowSearch(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4" />
            选择大学
          </button>
        </div>
      )}

      {/* 搜索模态框 */}
      {showSearch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold">选择要对比的大学</h3>
              <button
                onClick={() => setShowSearch(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              <UniversitySearch
                onSelectUniversity={addUniversity}
                selectedUniversities={selectedUniversities}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}