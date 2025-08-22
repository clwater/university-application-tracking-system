'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, MapPin, Star, Users } from 'lucide-react'
import { University } from '@/lib/database.types'
import { supabase } from '@/lib/supabase'

interface SearchFilters {
  name: string
  country: string
  state: string
  minRanking: number | null
  maxRanking: number | null
  minAcceptanceRate: number | null
  maxAcceptanceRate: number | null
  applicationSystem: string
}

interface UniversitySearchProps {
  onSelectUniversity: (university: University) => void
  selectedUniversities?: University[]
}

export default function UniversitySearch({ onSelectUniversity, selectedUniversities = [] }: UniversitySearchProps) {
  const [universities, setUniversities] = useState<University[]>([])
  const [filteredUniversities, setFilteredUniversities] = useState<University[]>([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<SearchFilters>({
    name: '',
    country: '',
    state: '',
    minRanking: null,
    maxRanking: null,
    minAcceptanceRate: null,
    maxAcceptanceRate: null,
    applicationSystem: ''
  })

  useEffect(() => {
    fetchUniversities()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [universities, filters])

  const fetchUniversities = async () => {
    try {
      const { data, error } = await supabase
        .from('universities')
        .select('*')
        .order('us_news_ranking', { ascending: true, nullsLast: true })

      if (error) throw error
      setUniversities(data || [])
    } catch (error) {
      console.error('Error fetching universities:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = universities

    // 按名称筛选
    if (filters.name) {
      filtered = filtered.filter(uni =>
        uni.name.toLowerCase().includes(filters.name.toLowerCase())
      )
    }

    // 按国家筛选
    if (filters.country) {
      filtered = filtered.filter(uni =>
        uni.country?.toLowerCase().includes(filters.country.toLowerCase())
      )
    }

    // 按州筛选
    if (filters.state) {
      filtered = filtered.filter(uni =>
        uni.state?.toLowerCase().includes(filters.state.toLowerCase())
      )
    }

    // 按排名筛选
    if (filters.minRanking !== null) {
      filtered = filtered.filter(uni =>
        uni.us_news_ranking !== null && uni.us_news_ranking >= filters.minRanking!
      )
    }

    if (filters.maxRanking !== null) {
      filtered = filtered.filter(uni =>
        uni.us_news_ranking !== null && uni.us_news_ranking <= filters.maxRanking!
      )
    }

    // 按录取率筛选
    if (filters.minAcceptanceRate !== null) {
      filtered = filtered.filter(uni =>
        uni.acceptance_rate !== null && uni.acceptance_rate >= filters.minAcceptanceRate!
      )
    }

    if (filters.maxAcceptanceRate !== null) {
      filtered = filtered.filter(uni =>
        uni.acceptance_rate !== null && uni.acceptance_rate <= filters.maxAcceptanceRate!
      )
    }

    // 按申请系统筛选
    if (filters.applicationSystem) {
      filtered = filtered.filter(uni =>
        uni.application_system === filters.applicationSystem
      )
    }

    setFilteredUniversities(filtered)
  }

  const clearFilters = () => {
    setFilters({
      name: '',
      country: '',
      state: '',
      minRanking: null,
      maxRanking: null,
      minAcceptanceRate: null,
      maxAcceptanceRate: null,
      applicationSystem: ''
    })
  }

  const isSelected = (university: University) => {
    return selectedUniversities.some(selected => selected.id === university.id)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* 搜索栏 */}
      <div className="p-6 border-b">
        <div className="flex gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="搜索大学名称..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.name}
              onChange={(e) => setFilters({ ...filters, name: e.target.value })}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <Filter className="h-4 w-4" />
            筛选
          </button>
        </div>

        {/* 筛选器 */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">国家</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  value={filters.country}
                  onChange={(e) => setFilters({ ...filters, country: e.target.value })}
                  placeholder="美国, 加拿大..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">州/省</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  value={filters.state}
                  onChange={(e) => setFilters({ ...filters, state: e.target.value })}
                  placeholder="加州, 纽约..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">排名范围</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm"
                    placeholder="最低"
                    value={filters.minRanking || ''}
                    onChange={(e) => setFilters({ ...filters, minRanking: e.target.value ? parseInt(e.target.value) : null })}
                  />
                  <input
                    type="number"
                    className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm"
                    placeholder="最高"
                    value={filters.maxRanking || ''}
                    onChange={(e) => setFilters({ ...filters, maxRanking: e.target.value ? parseInt(e.target.value) : null })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">申请系统</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  value={filters.applicationSystem}
                  onChange={(e) => setFilters({ ...filters, applicationSystem: e.target.value })}
                >
                  <option value="">全部</option>
                  <option value="Common App">Common App</option>
                  <option value="Coalition">Coalition App</option>
                  <option value="Direct">直接申请</option>
                </select>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                清除筛选
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 大学列表 */}
      <div className="max-h-96 overflow-y-auto">
        {filteredUniversities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            没有找到符合条件的大学
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredUniversities.map((university) => (
              <div
                key={university.id}
                className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                  isSelected(university) ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                }`}
                onClick={() => onSelectUniversity(university)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{university.name}</h3>
                    <div className="mt-1 flex items-center gap-4 text-sm text-gray-600">
                      {university.city && university.state && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {university.city}, {university.state}
                        </div>
                      )}
                      {university.us_news_ranking && (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4" />
                          排名 #{university.us_news_ranking}
                        </div>
                      )}
                      {university.acceptance_rate && (
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          录取率 {(university.acceptance_rate * 100).toFixed(1)}%
                        </div>
                      )}
                    </div>
                    {university.application_system && (
                      <div className="mt-2">
                        <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                          {university.application_system}
                        </span>
                      </div>
                    )}
                  </div>
                  {isSelected(university) && (
                    <div className="ml-2 text-blue-600">
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}