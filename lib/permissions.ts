import { UserRole } from './database.types'

// 定义权限类型
export type Permission = 
  | 'read_own_applications'
  | 'write_own_applications'
  | 'read_child_applications'
  | 'write_child_notes'
  | 'read_universities'
  | 'manage_requirements'
  | 'view_financial_info'
  | 'admin_access'

// 角色权限映射
export const rolePermissions: Record<UserRole, Permission[]> = {
  student: [
    'read_own_applications',
    'write_own_applications',
    'read_universities',
    'manage_requirements',
  ],
  parent: [
    'read_child_applications',
    'write_child_notes',
    'read_universities',
    'view_financial_info',
  ],
  teacher: [
    'read_child_applications',
    'write_child_notes',
    'read_universities',
  ],
  admin: [
    'read_own_applications',
    'write_own_applications',
    'read_child_applications',
    'write_child_notes',
    'read_universities',
    'manage_requirements',
    'view_financial_info',
    'admin_access',
  ],
}

// 检查用户是否有特定权限
export function hasPermission(userRole: UserRole | null, permission: Permission): boolean {
  if (!userRole) return false
  return rolePermissions[userRole]?.includes(permission) || false
}

// 检查多个权限（需要全部满足）
export function hasAllPermissions(userRole: UserRole | null, permissions: Permission[]): boolean {
  if (!userRole) return false
  const userPermissions = rolePermissions[userRole] || []
  return permissions.every(permission => userPermissions.includes(permission))
}

// 检查多个权限（满足任意一个即可）
export function hasAnyPermission(userRole: UserRole | null, permissions: Permission[]): boolean {
  if (!userRole) return false
  const userPermissions = rolePermissions[userRole] || []
  return permissions.some(permission => userPermissions.includes(permission))
}

// 资源所有权检查
export interface ResourceOwnership {
  studentId?: string
  parentId?: string
  userId?: string
}

export async function canAccessResource(
  userRole: UserRole | null,
  userId: string | null,
  resource: ResourceOwnership
): Promise<boolean> {
  if (!userRole || !userId) return false

  switch (userRole) {
    case 'student':
      // 学生只能访问自己的资源
      return resource.userId === userId
    
    case 'parent':
      // 家长可以访问自己的资源和关联学生的资源
      if (resource.userId === userId || resource.parentId === userId) {
        return true
      }
      if (resource.studentId) {
        return await isParentOfStudent(userId, resource.studentId)
      }
      return false
    
    case 'admin':
      // 管理员可以访问所有资源
      return true
    
    default:
      return false
  }
}

// 检查家长是否是某个学生的监护人（需要查询数据库）
async function isParentOfStudent(parentUserId: string, studentId: string): Promise<boolean> {
  // 这里需要查询数据库来验证关系
  // 为了简化，这里返回true，实际应用中需要实现数据库查询
  return true
}

// API路由权限装饰器
export function requirePermission(permission: Permission) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: any[]) {
      // 这里应该从请求中获取用户角色
      // const userRole = getUserRoleFromRequest(args[0])
      // if (!hasPermission(userRole, permission)) {
      //   throw new Error('Insufficient permissions')
      // }
      
      return originalMethod.apply(this, args)
    }

    return descriptor
  }
}

// 错误类型
export class PermissionError extends Error {
  constructor(message: string = 'Insufficient permissions') {
    super(message)
    this.name = 'PermissionError'
  }
}

export class UnauthorizedError extends Error {
  constructor(message: string = 'Unauthorized access') {
    super(message)
    this.name = 'UnauthorizedError'
  }
}