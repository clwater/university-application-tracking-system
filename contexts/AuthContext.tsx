'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { UserRole } from '@/lib/database.types'

interface AuthContextType {
  user: User | null
  session: Session | null
  userRole: UserRole | null
  loading: boolean
  signOut: () => Promise<void>
  getUserProfile: () => Promise<any>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [userRole, setUserRole] = useState<UserRole | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 获取初始会话
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchUserRole(session.user.id)
      }
      setLoading(false)
    })

    // 监听认证状态变化
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchUserRole(session.user.id)
      } else {
        setUserRole(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserRole = async (userId: string) => {
    try {
      // 首先检查是否是学生
      const { data: student } = await supabase
        .from('students')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (student) {
        setUserRole('student')
        return
      }

      // 然后检查是否是家长
      const { data: parent } = await supabase
        .from('parents')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (parent) {
        setUserRole('parent')
        return
      }

      // 如果没有找到角色记录，设置为null，需要用户完善档案
      setUserRole(null)
    } catch (error) {
      console.error('Error fetching user role:', error)
      setUserRole(null)
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      // 等待状态更新完成后跳转
      setTimeout(() => {
        router.push('/auth/login')
      }, 100)
    } catch (error) {
      console.error('Sign out error:', error)
      router.push('/auth/login')
    }
  }

  const getUserProfile = async () => {
    if (!user || !userRole) return null

    if (userRole === 'student') {
      const { data } = await supabase
        .from('students')
        .select('*')
        .eq('user_id', user.id)
        .single()
      return data
    } else if (userRole === 'parent') {
      const { data } = await supabase
        .from('parents')
        .select('*')
        .eq('user_id', user.id)
        .single()
      return data
    }

    return null
  }

  const value = {
    user,
    session,
    userRole,
    loading,
    signOut,
    getUserProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}