import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { UserRole } from './database.types'
import { hasPermission, PermissionError, UnauthorizedError } from './permissions'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export interface AuthenticatedUser {
  id: string
  email: string
  role: UserRole
}

// 从请求中获取认证用户信息
export async function getAuthenticatedUser(request: NextRequest): Promise<AuthenticatedUser | null> {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }

    const token = authHeader.substring(7)
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      return null
    }

    // 获取用户角色
    const userRole = await getUserRole(user.id)
    if (!userRole) {
      return null
    }

    return {
      id: user.id,
      email: user.email!,
      role: userRole,
    }
  } catch (error) {
    console.error('Error getting authenticated user:', error)
    return null
  }
}

// 获取用户角色
async function getUserRole(userId: string): Promise<UserRole | null> {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 检查是否是学生
    const { data: student } = await supabase
      .from('students')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (student) {
      return 'student'
    }

    // 检查是否是家长
    const { data: parent } = await supabase
      .from('parents')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (parent) {
      return 'parent'
    }

    // 如果没有找到角色记录，返回null
    return null
  } catch (error) {
    console.error('Error getting user role:', error)
    return null
  }
}

// API路由权限检查中间件
export function withAuth(handler: (request: NextRequest, user: AuthenticatedUser, ...args: any[]) => Promise<Response>) {
  return async (request: NextRequest, ...args: any[]): Promise<Response> => {
    const user = await getAuthenticatedUser(request)
    
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    try {
      return await handler(request, user, ...args)
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        return new Response(
          JSON.stringify({ error: error.message }),
          {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
          }
        )
      }

      if (error instanceof PermissionError) {
        return new Response(
          JSON.stringify({ error: error.message }),
          {
            status: 403,
            headers: { 'Content-Type': 'application/json' },
          }
        )
      }

      console.error('API error:', error)
      return new Response(
        JSON.stringify({ error: 'Internal server error' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }
  }
}

// 带权限检查的API路由中间件
export function withPermission(permission: Permission) {
  return function (handler: (request: NextRequest, user: AuthenticatedUser, ...args: any[]) => Promise<Response>) {
    return withAuth(async (request: NextRequest, user: AuthenticatedUser, ...args: any[]) => {
      if (!hasPermission(user.role, permission)) {
        throw new PermissionError(`Permission required: ${permission}`)
      }

      return await handler(request, user, ...args)
    })
  }
}

// 学生专用API路由
export function withStudentAuth(handler: (request: NextRequest, user: AuthenticatedUser, ...args: any[]) => Promise<Response>) {
  return withPermission('read_own_applications')(handler)
}

// 家长专用API路由
export function withParentAuth(handler: (request: NextRequest, user: AuthenticatedUser, ...args: any[]) => Promise<Response>) {
  return withPermission('read_child_applications')(handler)
}

// 管理员专用API路由
export function withAdminAuth(handler: (request: NextRequest, user: AuthenticatedUser, ...args: any[]) => Promise<Response>) {
  return withPermission('admin_access')(handler)
}

// 资源所有权验证
export async function verifyResourceOwnership(
  user: AuthenticatedUser,
  resourceType: 'application' | 'student' | 'parent',
  resourceId: string
): Promise<boolean> {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    switch (resourceType) {
      case 'application':
        if (user.role === 'student') {
          // 学生只能访问自己的申请
          const { data: student } = await supabase
            .from('students')
            .select('id')
            .eq('user_id', user.id)
            .single()

          if (!student) return false

          const { data: application } = await supabase
            .from('applications')
            .select('student_id')
            .eq('id', resourceId)
            .single()

          return application?.student_id === student.id
        } else if (user.role === 'parent') {
          // 家长可以访问关联学生的申请
          const { data: parent } = await supabase
            .from('parents')
            .select('student_ids')
            .eq('user_id', user.id)
            .single()

          if (!parent?.student_ids) return false

          const { data: application } = await supabase
            .from('applications')
            .select('student_id')
            .eq('id', resourceId)
            .single()

          return application && parent.student_ids.includes(application.student_id)
        }
        break

      case 'student':
        if (user.role === 'student') {
          const { data: student } = await supabase
            .from('students')
            .select('id')
            .eq('user_id', user.id)
            .single()

          return student?.id === resourceId
        } else if (user.role === 'parent') {
          const { data: parent } = await supabase
            .from('parents')
            .select('student_ids')
            .eq('user_id', user.id)
            .single()

          return parent?.student_ids?.includes(resourceId) || false
        }
        break

      case 'parent':
        return user.role === 'parent' && resourceId === user.id
    }

    return user.role === 'admin' // 管理员可以访问所有资源
  } catch (error) {
    console.error('Error verifying resource ownership:', error)
    return false
  }
}