'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

export default function DebugPage() {
  const { user, userRole, loading } = useAuth()
  const [testResults, setTestResults] = useState<any[]>([])
  const [testing, setTesting] = useState(false)

  const addResult = (test: string, result: any, error?: any) => {
    setTestResults(prev => [...prev, { 
      test, 
      result: result ? 'SUCCESS' : 'FAILED', 
      data: result || error?.message || error,
      timestamp: new Date().toLocaleTimeString()
    }])
  }

  const runTests = async () => {
    setTesting(true)
    setTestResults([])
    
    // Test 1: Basic connection
    try {
      const { data, error } = await supabase.from('students').select('count', { count: 'exact' })
      addResult('Database Connection', !error, { 
        success: !error, 
        count: data,
        error: error?.message,
        errorCode: error?.code 
      })
    } catch (error) {
      addResult('Database Connection', false, error)
    }

    // Test 2: Auth status
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      addResult('Auth Session', session, error)
    } catch (error) {
      addResult('Auth Session', false, error)
    }

    // Test 3: Student profile check
    if (user?.id) {
      try {
        const { data, error } = await supabase
          .from('students')
          .select('id, name')
          .eq('user_id', user.id)
          .maybeSingle()
        addResult('Student Profile Check', true, { found: !!data, error })
      } catch (error) {
        addResult('Student Profile Check', false, error)
      }

      // Test 4: Parent profile check  
      try {
        const { data, error } = await supabase
          .from('parents')
          .select('id, name')
          .eq('user_id', user.id)
          .maybeSingle()
        addResult('Parent Profile Check', true, { found: !!data, error })
      } catch (error) {
        addResult('Parent Profile Check', false, error)
      }
    }

    // Test 5: RLS Policy Test
    try {
      // 测试是否能查询一个不存在的用户ID，如果RLS正常工作应该返回空结果而不是错误
      const { data, error } = await supabase
        .from('students')
        .select('id')
        .eq('user_id', 'test-non-existent-user')
        .maybeSingle()
      
      addResult('RLS Policy Test', true, { 
        rlsWorking: !error && data === null,
        error: error?.message,
        errorCode: error?.code,
        data: data
      })
    } catch (error) {
      addResult('RLS Policy Test', false, error)
    }

    // Test 6: Network info
    const networkInfo = {
      userAgent: navigator.userAgent,
      connection: (navigator as any).connection?.effectiveType || 'unknown',
      online: navigator.onLine,
      cookieEnabled: navigator.cookieEnabled,
      localStorage: typeof localStorage !== 'undefined' ? 'available' : 'unavailable'
    }
    addResult('Network & Browser Info', true, networkInfo)

    setTesting(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">系统诊断</h1>
        
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold mb-4">当前状态</h2>
          <div className="space-y-2 text-sm">
            <div>Loading: {loading ? '是' : '否'}</div>
            <div>User ID: {user?.id || '无'}</div>
            <div>User Email: {user?.email || '无'}</div>
            <div>User Role: {userRole || '无'}</div>
            <div>环境: {process.env.NODE_ENV || '未知'}</div>
            <div>在线状态: {typeof navigator !== 'undefined' && navigator.onLine ? '在线' : '离线'}</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">数据库连接测试</h2>
            <button
              onClick={runTests}
              disabled={testing}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {testing ? '测试中...' : '运行测试'}
            </button>
          </div>
          
          {testResults.length > 0 && (
            <div className="space-y-3">
              {testResults.map((result, index) => (
                <div key={index} className="border border-gray-200 rounded p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{result.test}</span>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        result.result === 'SUCCESS' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {result.result}
                      </span>
                      <span className="text-xs text-gray-500">{result.timestamp}</span>
                    </div>
                  </div>
                  <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto max-h-32">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">快速操作</h2>
          <div className="space-y-3">
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              返回主页
            </button>
            <button
              onClick={() => supabase.auth.signOut()}
              className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              退出登录
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}