'use client'

import { useState, useEffect } from 'react'
import { Plus, Settings, LogOut } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import StudentStats from './StudentStats'
import UpcomingDeadlines from './UpcomingDeadlines'
import ApplicationProgress from './ApplicationProgress'
import ApplicationList from '../applications/ApplicationList'
import { StudentOnly } from '../auth/PermissionGate'
import NotificationCenter from '../notifications/NotificationCenter'
import UniversityComparison from '../universities/UniversityComparison'
import UniversitySearch from '../universities/UniversitySearch'
import UniversityCard from '../universities/UniversityCard'
import { University } from '@/lib/database.types'

export default function StudentDashboard() {
  const { user, userRole, signOut, getUserProfile } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [selectedUniversity, setSelectedUniversity] = useState<University | null>(null)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const profileData = await getUserProfile()
      setProfile(profileData)
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      // 跳转逻辑现在在AuthContext中处理
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const handleSettings = () => {
    setShowSettings(true)
  }

  const tabs = [
    { id: 'overview', label: '概览', icon: '📊' },
    { id: 'applications', label: '我的申请', icon: '📝' },
    { id: 'universities', label: '大学搜索', icon: '🏫' },
    { id: 'comparison', label: '大学对比', icon: '⚖️' },
    { id: 'requirements', label: '申请要求', icon: '📋' },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo和标题 */}
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                大学申请追踪系统
              </h1>
            </div>

            {/* 用户信息和操作 */}
            <div className="flex items-center gap-4">
              <NotificationCenter />
              
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {profile?.name || user?.email}
                  </div>
                  <div className="text-xs text-gray-500">学生</div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleSettings}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    title="设置"
                  >
                    <Settings className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="p-2 text-gray-400 hover:text-gray-600"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 主要内容区域 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* 欢迎信息 */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            欢迎回来，{profile?.name || '同学'}！
          </h2>
          <p className="text-gray-600 mt-1">
            管理您的大学申请进度，追踪重要截止日期
          </p>
        </div>

        {/* 标签页导航 */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* 标签页内容 */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <>
              {/* 统计卡片 */}
              <StudentStats />

              {/* 两列布局 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 即将到期的申请 */}
                <UpcomingDeadlines />

                {/* 申请进度 */}
                <ApplicationProgress />
              </div>

              {/* 快速操作 */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">快速操作</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => setActiveTab('applications')}
                    className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                  >
                    <Plus className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-600">添加新申请</span>
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('universities')}
                    className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                  >
                    <span className="text-gray-400">🔍</span>
                    <span className="text-gray-600">搜索大学</span>
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('requirements')}
                    className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                  >
                    <span className="text-gray-400">📋</span>
                    <span className="text-gray-600">检查要求</span>
                  </button>
                </div>
              </div>
            </>
          )}

          {activeTab === 'applications' && (
            <StudentOnly fallback={
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <p className="text-gray-600">您没有权限查看此内容</p>
              </div>
            }>
              <ApplicationList />
            </StudentOnly>
          )}

          {activeTab === 'universities' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 大学搜索 */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">大学搜索</h3>
                <UniversitySearch
                  onSelectUniversity={(university) => {
                    setSelectedUniversity(university)
                    console.log('Selected university:', university)
                  }}
                  selectedUniversities={selectedUniversity ? [selectedUniversity] : []}
                />
              </div>

              {/* 大学详情 */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">大学详情</h3>
                {selectedUniversity ? (
                  <UniversityCard
                    university={selectedUniversity}
                    showActions={false}
                  />
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <div className="text-4xl mb-4">🏫</div>
                    <p>点击左侧大学列表中的任意大学查看详情</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'comparison' && (
            <UniversityComparison />
          )}

          {activeTab === 'requirements' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">申请要求追踪</h3>
              <p className="text-gray-600">
                申请要求追踪功能已集成到各个申请详情中。
                点击"我的申请"标签页，然后点击任意申请来查看和管理要求。
              </p>
              <button
                onClick={() => setActiveTab('applications')}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                前往我的申请
              </button>
            </div>
          )}
        </div>
      </main>

      {/* 设置模态框 */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold">设置</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* 个人信息设置 */}
              <div>
                <h3 className="text-lg font-semibold mb-3">个人信息</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">姓名</label>
                    <div className="mt-1 text-sm text-gray-900">{profile?.name || '未设置'}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">邮箱</label>
                    <div className="mt-1 text-sm text-gray-900">{user?.email}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">毕业年份</label>
                    <div className="mt-1 text-sm text-gray-900">{profile?.graduation_year || '未设置'}</div>
                  </div>
                </div>
              </div>

              {/* 学术信息 */}
              <div>
                <h3 className="text-lg font-semibold mb-3">学术信息</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">GPA</label>
                    <div className="mt-1 text-sm text-gray-900">{profile?.gpa || '未设置'}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">SAT分数</label>
                    <div className="mt-1 text-sm text-gray-900">{profile?.sat_score || '未设置'}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">ACT分数</label>
                    <div className="mt-1 text-sm text-gray-900">{profile?.act_score || '未设置'}</div>
                  </div>
                </div>
              </div>

              {/* 申请偏好 */}
              <div>
                <h3 className="text-lg font-semibold mb-3">申请偏好</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">目标国家</label>
                    <div className="mt-1 text-sm text-gray-900">
                      {profile?.target_countries?.join(', ') || '未设置'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">意向专业</label>
                    <div className="mt-1 text-sm text-gray-900">
                      {profile?.intended_majors?.join(', ') || '未设置'}
                    </div>
                  </div>
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => {
                    setShowSettings(false)
                    // 这里可以添加编辑档案的逻辑
                    alert('档案编辑功能开发中...')
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  编辑档案
                </button>
                <button
                  onClick={() => setShowSettings(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}