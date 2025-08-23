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
  refreshUserRole: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [userRole, setUserRole] = useState<UserRole | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null
    
    // 设置5秒超时，防止无限加载
    timeoutId = setTimeout(() => {
      console.warn('AuthContext: Authentication timeout, setting loading to false')
      setLoading(false)
    }, 5000)

    // 获取初始会话
    const initAuth = async () => {
      try {
        console.log('AuthContext: Getting initial session...')
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('AuthContext: Error getting session:', error)
          setLoading(false)
          return
        }
        
        console.log('AuthContext: Initial session:', session?.user?.id || 'none')
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          await fetchUserRole(session.user.id)
        }
        
        if (timeoutId) {
          clearTimeout(timeoutId)
        }
        setLoading(false)
      } catch (error) {
        console.error('AuthContext: Error in initAuth:', error)
        if (timeoutId) {
          clearTimeout(timeoutId)
        }
        setLoading(false)
      }
    }

    initAuth()

    // 监听认证状态变化
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('AuthContext: Auth state changed:', event, session?.user?.id || 'none')
      setSession(session)
      setUser(session?.user ?? null)
      
      if (session?.user) {
        await fetchUserRole(session.user.id)
      } else {
        setUserRole(null)
      }
      
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [])

  const fetchUserRole = async (userId: string) => {
    try {
      console.log('AuthContext: Fetching user role for userId:', userId)
      
      // 并行查询学生和家长档案，提高效率
      const [studentResult, parentResult] = await Promise.all([
        supabase
          .from('students')
          .select('id, user_id')
          .eq('user_id', userId)
          .maybeSingle(),
        supabase
          .from('parents')
          .select('id, user_id')
          .eq('user_id', userId)
          .maybeSingle()
      ])

      const { data: student, error: studentError } = studentResult
      const { data: parent, error: parentError } = parentResult

      // 只记录真正的错误，忽略 "No rows" 错误
      if (studentError && studentError.code !== 'PGRST116') {
        console.log('AuthContext: Student query error:', studentError.message)
      }

      if (parentError && parentError.code !== 'PGRST116') {
        console.log('AuthContext: Parent query error:', parentError.message)
      }

      if (student) {
        console.log('AuthContext: Setting role to student')
        setUserRole('student')
        return
      }

      if (parent) {
        console.log('AuthContext: Setting role to parent')
        setUserRole('parent')
        return
      }

      // 如果没有找到角色记录，设置为null，需要用户完善档案
      console.log('AuthContext: No role found, setting to null')
      setUserRole(null)
    } catch (error) {
      console.error('AuthContext: Error fetching user role:', error)
      // 即使出错也设置为 null，让用户可以设置档案
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

  const refreshUserRole = async () => {
    if (user) {
      await fetchUserRole(user.id)
    }
  }

  const value = {
    user,
    session,
    userRole,
    loading,
    signOut,
    getUserProfile,
    refreshUserRole,
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