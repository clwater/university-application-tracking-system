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

export default function StudentDashboard() {
  const { user, userRole, signOut, getUserProfile } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

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
                  <button className="p-2 text-gray-400 hover:text-gray-600">
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
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">大学搜索</h3>
              <UniversitySearch
                onSelectUniversity={(university) => {
                  // 这里可以添加选择大学后的逻辑
                  console.log('Selected university:', university)
                }}
              />
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
    </div>
  )
}