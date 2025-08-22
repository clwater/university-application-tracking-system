'use client'

import { useState, useEffect } from 'react'
import { Plus, Filter, Search } from 'lucide-react'
import { Application, University, ApplicationStatus } from '@/lib/database.types'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import ApplicationCard from './ApplicationCard'
import ApplicationForm from './ApplicationForm'
import ApplicationDetails from './ApplicationDetails'
import UniversitySearch from '../universities/UniversitySearch'

interface ApplicationWithUniversity extends Application {
  universities: University
}

export default function ApplicationList() {
  const { user } = useAuth()
  const [applications, setApplications] = useState<ApplicationWithUniversity[]>([])
  const [filteredApplications, setFilteredApplications] = useState<ApplicationWithUniversity[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showUniversitySearch, setShowUniversitySearch] = useState(false)
  const [editingApplication, setEditingApplication] = useState<ApplicationWithUniversity | null>(null)
  const [viewingApplication, setViewingApplication] = useState<ApplicationWithUniversity | null>(null)
  const [filters, setFilters] = useState({
    status: '',
    search: '',
  })
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    if (user) {
      fetchApplications()
    }
  }, [user])

  useEffect(() => {
    applyFilters()
  }, [applications, filters])

  const fetchApplications = async () => {
    if (!user) return

    try {
      // 首先获取学生ID
      const { data: student } = await supabase
        .from('students')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!student) return

      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          universities (*)
        `)
        .eq('student_id', student.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      setApplications(data as ApplicationWithUniversity[] || [])
    } catch (error) {
      console.error('Error fetching applications:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = applications

    // 按状态筛选
    if (filters.status) {
      filtered = filtered.filter(app => app.status === filters.status)
    }

    // 按搜索词筛选
    if (filters.search) {
      filtered = filtered.filter(app =>
        app.universities.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        app.universities.city?.toLowerCase().includes(filters.search.toLowerCase()) ||
        app.universities.state?.toLowerCase().includes(filters.search.toLowerCase())
      )
    }

    setFilteredApplications(filtered)
  }

  const handleAddApplication = async (university: University) => {
    // 检查是否已经申请过这所大学
    const existingApplication = applications.find(app => app.university_id === university.id)
    if (existingApplication) {
      alert('您已经申请过这所大学了')
      return
    }

    setShowUniversitySearch(false)
    setShowAddForm(true)
    // 这里需要传递选中的大学信息
    // 暂时先关闭搜索界面，显示表单
  }

  const handleEditApplication = (application: ApplicationWithUniversity) => {
    setEditingApplication(application)
    setShowAddForm(true)
  }

  const handleDeleteApplication = (applicationId: string) => {
    setApplications(apps => apps.filter(app => app.id !== applicationId))
    setFilteredApplications(apps => apps.filter(app => app.id !== applicationId))
  }

  const handleStatusUpdate = (applicationId: string, newStatus: ApplicationStatus, updates?: any) => {
    setApplications(apps => 
      apps.map(app => 
        app.id === applicationId 
          ? { ...app, status: newStatus, ...updates }
          : app
      )
    )
    setFilteredApplications(apps => 
      apps.map(app => 
        app.id === applicationId 
          ? { ...app, status: newStatus, ...updates }
          : app
      )
    )
  }

  const handleFormClose = () => {
    setShowAddForm(false)
    setEditingApplication(null)
    setShowUniversitySearch(false)
  }

  const handleFormSuccess = () => {
    fetchApplications()
  }

  const statusOptions = [
    { value: '', label: '全部状态' },
    { value: 'not_started', label: '未开始' },
    { value: 'in_progress', label: '进行中' },
    { value: 'submitted', label: '已提交' },
    { value: 'under_review', label: '审核中' },
    { value: 'accepted', label: '录取' },
    { value: 'rejected', label: '拒绝' },
    { value: 'waitlisted', label: '候补' },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 头部操作栏 */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900">我的申请</h2>
          <p className="text-gray-600 mt-1">
            管理您的大学申请进度 ({applications.length} 个申请)
          </p>
        </div>
        
        <button
          onClick={() => setShowUniversitySearch(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4" />
          添加申请
        </button>
      </div>

      {/* 搜索和筛选 */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="搜索大学名称或地区..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
          
          <div className="flex gap-2">
            <select
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <Filter className="h-4 w-4" />
              筛选
            </button>
          </div>
        </div>
      </div>

      {/* 申请列表 */}
      {filteredApplications.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 text-gray-300">
            <svg fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.1 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/>
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {filters.search || filters.status ? '没有找到匹配的申请' : '还没有申请'}
          </h3>
          <p className="text-gray-600 mb-4">
            {filters.search || filters.status 
              ? '尝试调整搜索条件或筛选器'
              : '开始添加您感兴趣的大学申请'
            }
          </p>
          {!filters.search && !filters.status && (
            <button
              onClick={() => setShowUniversitySearch(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4" />
              添加第一个申请
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredApplications.map((application) => (
            <ApplicationCard
              key={application.id}
              application={application}
              onEdit={handleEditApplication}
              onDelete={handleDeleteApplication}
              onStatusUpdate={handleStatusUpdate}
              onViewDetails={setViewingApplication}
            />
          ))}
        </div>
      )}

      {/* 大学搜索模态框 */}
      {showUniversitySearch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold">选择大学</h2>
              <button
                onClick={() => setShowUniversitySearch(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <UniversitySearch
                onSelectUniversity={handleAddApplication}
                selectedUniversities={applications.map(app => app.universities)}
              />
            </div>
          </div>
        </div>
      )}

      {/* 申请表单模态框 */}
      {showAddForm && editingApplication && (
        <ApplicationForm
          university={editingApplication.universities}
          existingApplication={editingApplication}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}

      {/* 申请详情模态框 */}
      {viewingApplication && (
        <ApplicationDetails
          application={viewingApplication}
          onClose={() => setViewingApplication(null)}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </div>
  )
}