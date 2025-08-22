'use client'

import { useState, useEffect } from 'react'
import { Bell, X, Calendar, AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import { format, differenceInDays } from 'date-fns'
import { Application, University } from '@/lib/database.types'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

interface Notification {
  id: string
  type: 'deadline' | 'status_change' | 'reminder' | 'success'
  title: string
  message: string
  applicationId?: string
  createdAt: Date
  read: boolean
  urgent: boolean
}

interface ApplicationWithUniversity extends Application {
  universities: University
}

export default function NotificationCenter() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      generateNotifications()
    }
  }, [user])

  const generateNotifications = async () => {
    if (!user) return

    setLoading(true)
    try {
      const { data: student } = await supabase
        .from('students')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!student) return

      const { data: applications, error } = await supabase
        .from('applications')
        .select(`
          *,
          universities (*)
        `)
        .eq('student_id', student.id)

      if (error) throw error

      const generatedNotifications = generateNotificationsFromApplications(
        applications as ApplicationWithUniversity[] || []
      )

      setNotifications(generatedNotifications)
    } catch (error) {
      console.error('Error generating notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateNotificationsFromApplications = (applications: ApplicationWithUniversity[]): Notification[] => {
    const notifications: Notification[] = []
    const today = new Date()

    applications.forEach((application) => {
      if (!application.deadline) return

      const deadlineDate = new Date(application.deadline)
      const daysUntil = differenceInDays(deadlineDate, today)

      // 紧急截止日期通知（3天内）
      if (daysUntil <= 3 && daysUntil >= 0 && application.status !== 'submitted') {
        notifications.push({
          id: `deadline-urgent-${application.id}`,
          type: 'deadline',
          title: '紧急截止日期',
          message: `${application.universities.name} 的申请将在 ${daysUntil === 0 ? '今天' : `${daysUntil}天后`} 截止`,
          applicationId: application.id,
          createdAt: today,
          read: false,
          urgent: true,
        })
      }
      // 即将截止通知（7天内）
      else if (daysUntil <= 7 && daysUntil > 3 && application.status !== 'submitted') {
        notifications.push({
          id: `deadline-warning-${application.id}`,
          type: 'deadline',
          title: '申请截止提醒',
          message: `${application.universities.name} 的申请将在 ${daysUntil} 天后截止`,
          applicationId: application.id,
          createdAt: today,
          read: false,
          urgent: false,
        })
      }

      // 过期通知
      if (daysUntil < 0 && application.status !== 'submitted') {
        notifications.push({
          id: `deadline-overdue-${application.id}`,
          type: 'deadline',
          title: '申请已过期',
          message: `${application.universities.name} 的申请截止日期已过`,
          applicationId: application.id,
          createdAt: today,
          read: false,
          urgent: true,
        })
      }

      // 状态变化通知
      if (application.status === 'accepted') {
        notifications.push({
          id: `status-accepted-${application.id}`,
          type: 'success',
          title: '录取通知！',
          message: `恭喜！您已被 ${application.universities.name} 录取`,
          applicationId: application.id,
          createdAt: today,
          read: false,
          urgent: false,
        })
      }

      // 未开始申请提醒
      if (application.status === 'not_started' && daysUntil <= 14 && daysUntil > 7) {
        notifications.push({
          id: `reminder-start-${application.id}`,
          type: 'reminder',
          title: '开始申请提醒',
          message: `${application.universities.name} 的申请还未开始，建议尽快开始准备`,
          applicationId: application.id,
          createdAt: today,
          read: false,
          urgent: false,
        })
      }
    })

    // 按紧急程度和时间排序
    return notifications.sort((a, b) => {
      if (a.urgent && !b.urgent) return -1
      if (!a.urgent && b.urgent) return 1
      return b.createdAt.getTime() - a.createdAt.getTime()
    })
  }

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    )
  }

  const removeNotification = (notificationId: string) => {
    setNotifications(prev =>
      prev.filter(notification => notification.id !== notificationId)
    )
  }

  const getNotificationIcon = (type: string, urgent: boolean) => {
    const iconClass = urgent ? 'text-red-500' : 'text-gray-500'
    
    switch (type) {
      case 'deadline':
        return <Calendar className={`h-5 w-5 ${iconClass}`} />
      case 'status_change':
        return <CheckCircle className={`h-5 w-5 ${iconClass}`} />
      case 'reminder':
        return <Clock className={`h-5 w-5 ${iconClass}`} />
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      default:
        return <Bell className={`h-5 w-5 ${iconClass}`} />
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length
  const urgentCount = notifications.filter(n => !n.read && n.urgent).length

  return (
    <div className="relative">
      {/* 通知按钮 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className={`absolute -top-1 -right-1 h-5 w-5 rounded-full text-xs font-medium text-white flex items-center justify-center ${
            urgentCount > 0 ? 'bg-red-500' : 'bg-blue-500'
          }`}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* 通知面板 */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50 max-h-96 overflow-hidden">
            {/* 头部 */}
            <div className="p-4 border-b bg-gray-50">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  通知 ({unreadCount})
                </h3>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      全部已读
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* 通知列表 */}
            <div className="max-h-80 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-sm text-gray-500 mt-2">加载中...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">没有新通知</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 transition-colors ${
                        !notification.read ? 'bg-blue-50' : ''
                      } ${notification.urgent ? 'border-l-4 border-red-500' : ''}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type, notification.urgent)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className={`text-sm font-medium ${
                                !notification.read ? 'text-gray-900' : 'text-gray-700'
                              }`}>
                                {notification.title}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-400 mt-2">
                                {format(notification.createdAt, 'MM月dd日 HH:mm')}
                              </p>
                            </div>
                            
                            <div className="flex items-center gap-1 ml-2">
                              {!notification.read && (
                                <button
                                  onClick={() => markAsRead(notification.id)}
                                  className="text-xs text-blue-600 hover:text-blue-800"
                                >
                                  标记已读
                                </button>
                              )}
                              <button
                                onClick={() => removeNotification(notification.id)}
                                className="text-gray-400 hover:text-gray-600"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {notifications.length > 0 && (
              <div className="p-3 bg-gray-50 border-t text-center">
                <button
                  onClick={generateNotifications}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  刷新通知
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}