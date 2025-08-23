'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export default function MobileDebugInfo() {
  const { user, userRole, loading } = useAuth()
  const [showDebug, setShowDebug] = useState(false)

  // 只在开发环境或特定条件下显示
  if (process.env.NODE_ENV === 'production' && !showDebug) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setShowDebug(true)}
          className="bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-50 hover:opacity-100"
        >
          Debug
        </button>
      </div>
    )
  }

  if (!showDebug) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-black bg-opacity-80 text-white text-xs p-4 rounded-lg z-50 max-h-48 overflow-y-auto">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold">Debug Info</h3>
        <button
          onClick={() => setShowDebug(false)}
          className="text-gray-400 hover:text-white"
        >
          ×
        </button>
      </div>
      
      <div className="space-y-1">
        <div>
          <span className="text-gray-400">Loading:</span> {loading ? 'true' : 'false'}
        </div>
        <div>
          <span className="text-gray-400">User ID:</span> {user?.id || 'null'}
        </div>
        <div>
          <span className="text-gray-400">User Email:</span> {user?.email || 'null'}
        </div>
        <div>
          <span className="text-gray-400">User Role:</span> {userRole || 'null'}
        </div>
        <div>
          <span className="text-gray-400">User Metadata:</span> {JSON.stringify(user?.user_metadata || {})}
        </div>
        <div>
          <span className="text-gray-400">Current URL:</span> {typeof window !== 'undefined' ? window.location.pathname : 'unknown'}
        </div>
        <div>
          <span className="text-gray-400">User Agent:</span> {typeof navigator !== 'undefined' ? navigator.userAgent.substring(0, 50) + '...' : 'unknown'}
        </div>
        <div>
          <span className="text-gray-400">Network:</span> {typeof navigator !== 'undefined' ? (navigator as any).connection?.effectiveType || 'unknown' : 'unknown'}
        </div>
      </div>
    </div>
  )
}