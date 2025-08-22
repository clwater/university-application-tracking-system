// API客户端工具函数

interface ApiResponse<T> {
  data?: T
  error?: string
  pagination?: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
}

class ApiClient {
  private baseUrl: string

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_APP_URL || ''
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}/api${endpoint}`
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      })

      const data = await response.json()

      if (!response.ok) {
        return { error: data.error || 'Request failed' }
      }

      return { data }
    } catch (error) {
      return { error: 'Network error' }
    }
  }

  // 学生端API
  student = {
    // 档案管理
    getProfile: () => this.request('/student/profile'),
    updateProfile: (data: any) => 
      this.request('/student/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    // 申请管理
    getApplications: () => this.request('/student/applications'),
    createApplication: (data: any) =>
      this.request('/student/applications', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getApplication: (id: string) => this.request(`/student/applications/${id}`),
    updateApplication: (id: string, data: any) =>
      this.request(`/student/applications/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    deleteApplication: (id: string) =>
      this.request(`/student/applications/${id}`, {
        method: 'DELETE',
      }),

    // 申请要求管理
    getRequirements: (applicationId: string) =>
      this.request(`/student/applications/${applicationId}/requirements`),
    createRequirement: (applicationId: string, data: any) =>
      this.request(`/student/applications/${applicationId}/requirements`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    updateRequirement: (id: string, data: any) =>
      this.request(`/student/requirements/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    deleteRequirement: (id: string) =>
      this.request(`/student/requirements/${id}`, {
        method: 'DELETE',
      }),

    // 仪表板数据
    getDashboardStats: () => this.request('/student/dashboard/stats'),
    getUpcomingDeadlines: (days = 30) =>
      this.request(`/student/dashboard/upcoming-deadlines?days=${days}`),
  }

  // 家长端API
  parent = {
    // 档案管理
    getProfile: () => this.request('/parent/profile'),
    updateProfile: (data: any) =>
      this.request('/parent/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    // 学生管理
    getStudents: () => this.request('/parent/students'),
    getStudentApplications: (studentId: string) =>
      this.request(`/parent/students/${studentId}/applications`),

    // 备注管理
    addApplicationNote: (applicationId: string, note: string, currentNotes = '') =>
      this.request(`/parent/applications/${applicationId}/notes`, {
        method: 'PUT',
        body: JSON.stringify({
          parent_note: note,
          current_notes: currentNotes,
        }),
      }),
  }

  // 通用API
  universities = {
    search: (params: {
      search?: string
      country?: string
      state?: string
      minRanking?: number
      maxRanking?: number
      minAcceptanceRate?: number
      maxAcceptanceRate?: number
      applicationSystem?: string
      limit?: number
      offset?: number
    } = {}) => {
      const queryParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString())
        }
      })
      
      return this.request(`/universities?${queryParams.toString()}`)
    },
    
    getById: (id: string) => this.request(`/universities/${id}`),
  }
}

export const apiClient = new ApiClient()

// 错误处理工具
export const handleApiError = (error: string | undefined) => {
  console.error('API Error:', error)
  // 这里可以添加用户友好的错误消息映射
  const errorMessages: Record<string, string> = {
    'Student profile not found': '找不到学生档案',
    'Parent profile not found': '找不到家长档案',
    'Access denied': '访问被拒绝',
    'Application already exists for this university': '已经申请过这所大学',
    'Application not found': '找不到申请',
    'University not found': '找不到大学',
    'Failed to create application': '创建申请失败',
    'Failed to update application': '更新申请失败',
    'Failed to delete application': '删除申请失败',
    'Network error': '网络错误，请检查连接',
  }

  return errorMessages[error || ''] || error || '未知错误'
}

// React Hook 用于API调用
import { useState, useEffect } from 'react'

export function useApi<T>(
  apiCall: () => Promise<ApiResponse<T>>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      
      const response = await apiCall()
      
      if (response.error) {
        setError(handleApiError(response.error))
      } else {
        setData(response.data || null)
      }
      
      setLoading(false)
    }

    fetchData()
  }, dependencies)

  const refetch = async () => {
    setLoading(true)
    setError(null)
    
    const response = await apiCall()
    
    if (response.error) {
      setError(handleApiError(response.error))
    } else {
      setData(response.data || null)
    }
    
    setLoading(false)
  }

  return { data, loading, error, refetch }
}