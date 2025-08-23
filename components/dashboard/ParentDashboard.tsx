'use client'

import { useState, useEffect } from 'react'
import { Users, Eye, MessageSquare, DollarSign, Settings, LogOut } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Student, Application, University } from '@/lib/database.types'

interface StudentWithApplications extends Student {
  applications: (Application & { universities: University })[]
}

export default function ParentDashboard() {
  const { user, signOut, getUserProfile } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [students, setStudents] = useState<StudentWithApplications[]>([])
  const [selectedStudent, setSelectedStudent] = useState<StudentWithApplications | null>(null)
  const [loading, setLoading] = useState(true)
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    loadProfile()
    loadStudents()
  }, [])

  const loadProfile = async () => {
    try {
      const profileData = await getUserProfile()
      setProfile(profileData)
    } catch (error) {
      console.error('Error loading profile:', error)
    }
  }

  const loadStudents = async () => {
    if (!user) return

    try {
      // 获取家长档案
      const { data: parent } = await supabase
        .from('parents')
        .select('student_ids')
        .eq('user_id', user.id)
        .single()

      if (!parent?.student_ids) {
        setLoading(false)
        return
      }

      // 获取学生信息和申请
      const { data: studentsData, error } = await supabase
        .from('students')
        .select(`
          *,
          applications (
            *,
            universities (*)
          )
        `)
        .in('id', parent.student_ids)

      if (error) throw error

      const studentsWithApplications = studentsData as StudentWithApplications[] || []
      setStudents(studentsWithApplications)
      
      if (studentsWithApplications.length > 0) {
        setSelectedStudent(studentsWithApplications[0])
      }
    } catch (error) {
      console.error('Error loading students:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      console.log('ParentDashboard: Sign out button clicked')
      
      await signOut()
      
      // 跳转逻辑现在在AuthContext中处理
      console.log('ParentDashboard: Sign out completed')
    } catch (error) {
      console.error('ParentDashboard: Error signing out:', error)
      
      // 强制跳转作为备选方案
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login'
      }
    }
  }

  const handleSettings = () => {
    setShowSettings(true)
  }

  const getStudentStats = (student: StudentWithApplications) => {
    const applications = student.applications || []
    const total = applications.length
    const submitted = applications.filter(app => 
      app.status === 'submitted' || app.status === 'under_review'
    ).length
    const accepted = applications.filter(app => app.status === 'accepted').length
    const pending = applications.filter(app => 
      app.status === 'not_started' || app.status === 'in_progress'
    ).length

    return { total, submitted, accepted, pending }
  }

  const formatCurrency = (amount: number | null) => {
    if (!amount) return 'N/A'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

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
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                大学申请追踪系统 - 家长端
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {profile?.name || user?.email}
                  </div>
                  <div className="text-xs text-gray-500">家长</div>
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
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors active:bg-gray-100 rounded-full min-w-[44px] min-h-[44px] flex items-center justify-center"
                    title="退出登录"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* 欢迎信息 */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            欢迎回来，{profile?.name || '家长'}！
          </h2>
          <p className="text-gray-600 mt-1">
            查看孩子的申请进度，提供支持和指导
          </p>
        </div>

        {students.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              没有关联的学生
            </h3>
            <p className="text-gray-600">
              请联系管理员将您的账户与学生账户关联
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 学生选择器 */}
            {students.length > 1 && (
              <div className="bg-white rounded-lg shadow-md p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  选择学生
                </label>
                <select
                  className="w-full md:w-auto px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedStudent?.id || ''}
                  onChange={(e) => {
                    const student = students.find(s => s.id === e.target.value)
                    setSelectedStudent(student || null)
                  }}
                >
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {selectedStudent && (
              <>
                {/* 学生信息概览 */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {selectedStudent.name}
                      </h3>
                      <p className="text-gray-600">{selectedStudent.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">
                        {selectedStudent.graduation_year || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-600">毕业年份</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">
                        {selectedStudent.gpa || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-600">GPA</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">
                        {selectedStudent.sat_score || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-600">SAT</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">
                        {selectedStudent.act_score || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-600">ACT</div>
                    </div>
                  </div>
                </div>

                {/* 申请统计 */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {(() => {
                    const stats = getStudentStats(selectedStudent)
                    return (
                      <>
                        <div className="bg-white rounded-lg shadow-md p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-600">总申请数</p>
                              <p className="text-3xl font-bold text-blue-600 mt-2">
                                {stats.total}
                              </p>
                            </div>
                            <div className="p-3 rounded-full bg-blue-100">
                              <Users className="h-6 w-6 text-blue-600" />
                            </div>
                          </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-600">已提交</p>
                              <p className="text-3xl font-bold text-green-600 mt-2">
                                {stats.submitted}
                              </p>
                            </div>
                            <div className="p-3 rounded-full bg-green-100">
                              <Eye className="h-6 w-6 text-green-600" />
                            </div>
                          </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-600">已录取</p>
                              <p className="text-3xl font-bold text-emerald-600 mt-2">
                                {stats.accepted}
                              </p>
                            </div>
                            <div className="p-3 rounded-full bg-emerald-100">
                              <MessageSquare className="h-6 w-6 text-emerald-600" />
                            </div>
                          </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-600">待完成</p>
                              <p className="text-3xl font-bold text-orange-600 mt-2">
                                {stats.pending}
                              </p>
                            </div>
                            <div className="p-3 rounded-full bg-orange-100">
                              <DollarSign className="h-6 w-6 text-orange-600" />
                            </div>
                          </div>
                        </div>
                      </>
                    )
                  })()}
                </div>

                {/* 申请列表 */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold mb-4">申请详情</h3>
                  
                  {selectedStudent.applications?.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">还没有申请记录</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {selectedStudent.applications?.map((application) => (
                        <div
                          key={application.id}
                          className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">
                                {application.universities.name}
                              </h4>
                              <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                                <span>
                                  {application.universities.city}, {application.universities.state}
                                </span>
                                <span>
                                  {application.application_type === 'early_decision' && 'ED'}
                                  {application.application_type === 'early_action' && 'EA'}
                                  {application.application_type === 'regular_decision' && 'RD'}
                                  {application.application_type === 'rolling_admission' && '滚动录取'}
                                </span>
                                {application.deadline && (
                                  <span>
                                    截止: {new Date(application.deadline).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-4">
                              <span className={`px-3 py-1 text-sm rounded-full ${
                                application.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                application.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                application.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {application.status === 'not_started' && '未开始'}
                                {application.status === 'in_progress' && '进行中'}
                                {application.status === 'submitted' && '已提交'}
                                {application.status === 'under_review' && '审核中'}
                                {application.status === 'accepted' && '录取'}
                                {application.status === 'rejected' && '拒绝'}
                                {application.status === 'waitlisted' && '候补'}
                              </span>
                              
                              {application.universities.tuition_out_state && (
                                <div className="text-right text-sm">
                                  <div className="text-gray-500">学费</div>
                                  <div className="font-medium">
                                    {formatCurrency(application.universities.tuition_out_state)}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {application.notes && (
                            <div className="mt-3 p-3 bg-gray-50 rounded text-sm">
                              <strong>备注:</strong> {application.notes}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 财务规划部分 */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold mb-4">财务规划</h3>
                  
                  {selectedStudent.applications?.length === 0 ? (
                    <p className="text-gray-500">添加申请后将显示费用估算</p>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <div className="text-lg font-bold text-blue-600">
                            {formatCurrency(
                              selectedStudent.applications?.reduce((sum, app) => 
                                sum + (app.universities.application_fee || 0), 0
                              ) || 0
                            )}
                          </div>
                          <div className="text-sm text-blue-600">申请费总计</div>
                        </div>
                        
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <div className="text-lg font-bold text-green-600">
                            {formatCurrency(
                              Math.min(...(selectedStudent.applications?.map(app => 
                                app.universities.tuition_out_state || 0
                              ).filter(tuition => tuition > 0) || [0]))
                            )}
                          </div>
                          <div className="text-sm text-green-600">最低学费</div>
                        </div>
                        
                        <div className="text-center p-4 bg-orange-50 rounded-lg">
                          <div className="text-lg font-bold text-orange-600">
                            {formatCurrency(
                              Math.max(...(selectedStudent.applications?.map(app => 
                                app.universities.tuition_out_state || 0
                              ) || [0]))
                            )}
                          </div>
                          <div className="text-sm text-orange-600">最高学费</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
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
                </div>
              </div>

              {/* 关联学生 */}
              <div>
                <h3 className="text-lg font-semibold mb-3">关联学生</h3>
                <div className="space-y-2">
                  {students.length > 0 ? students.map(student => (
                    <div key={student.id} className="text-sm text-gray-900 p-2 bg-gray-50 rounded">
                      {student.name} ({student.email})
                    </div>
                  )) : (
                    <div className="text-sm text-gray-500">暂无关联学生</div>
                  )}
                </div>
              </div>

              {/* 通知设置 */}
              <div>
                <h3 className="text-lg font-semibold mb-3">通知设置</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">申请状态更新</label>
                    <div className="text-sm text-gray-500">开发中</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">截止日期提醒</label>
                    <div className="text-sm text-gray-500">开发中</div>
                  </div>
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => {
                    setShowSettings(false)
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