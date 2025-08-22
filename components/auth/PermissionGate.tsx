'use client'

import { ReactNode } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Permission, hasPermission, hasAllPermissions, hasAnyPermission } from '@/lib/permissions'

interface PermissionGateProps {
  children: ReactNode
  permission?: Permission
  permissions?: Permission[]
  requireAll?: boolean // 如果为true，需要满足所有权限；如果为false，满足任意一个权限即可
  fallback?: ReactNode
  showFallback?: boolean
}

export default function PermissionGate({
  children,
  permission,
  permissions,
  requireAll = true,
  fallback = null,
  showFallback = false
}: PermissionGateProps) {
  const { userRole } = useAuth()

  const hasAccess = () => {
    if (permission) {
      return hasPermission(userRole, permission)
    }

    if (permissions && permissions.length > 0) {
      return requireAll 
        ? hasAllPermissions(userRole, permissions)
        : hasAnyPermission(userRole, permissions)
    }

    return true // 如果没有指定权限，默认允许访问
  }

  if (!hasAccess()) {
    if (showFallback && fallback) {
      return <>{fallback}</>
    }
    return null
  }

  return <>{children}</>
}

// 便捷的权限检查组件
export function StudentOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionGate
      permissions={['read_own_applications', 'write_own_applications']}
      requireAll={false}
      fallback={fallback}
      showFallback={!!fallback}
    >
      {children}
    </PermissionGate>
  )
}

export function ParentOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionGate
      permission="read_child_applications"
      fallback={fallback}
      showFallback={!!fallback}
    >
      {children}
    </PermissionGate>
  )
}

export function AdminOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionGate
      permission="admin_access"
      fallback={fallback}
      showFallback={!!fallback}
    >
      {children}
    </PermissionGate>
  )
}

// Hook for checking permissions in components
export function usePermissions() {
  const { userRole } = useAuth()

  return {
    hasPermission: (permission: Permission) => hasPermission(userRole, permission),
    hasAllPermissions: (permissions: Permission[]) => hasAllPermissions(userRole, permissions),
    hasAnyPermission: (permissions: Permission[]) => hasAnyPermission(userRole, permissions),
    canRead: hasPermission(userRole, 'read_own_applications') || hasPermission(userRole, 'read_child_applications'),
    canWrite: hasPermission(userRole, 'write_own_applications') || hasPermission(userRole, 'write_child_notes'),
    isStudent: userRole === 'student',
    isParent: userRole === 'parent',
    isAdmin: userRole === 'admin',
  }
}