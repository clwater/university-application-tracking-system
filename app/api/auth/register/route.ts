import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getSupabaseUrl, getSupabaseAnonKey } from '@/lib/env'

const supabaseUrl = getSupabaseUrl()
const supabaseAnonKey = getSupabaseAnonKey()

// POST /api/auth/register - 处理用户注册和角色设置
export async function POST(request: NextRequest) {
  try {
    const { email, password, role, profileData } = await request.json()
    
    if (!email || !password || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // 使用anon key创建客户端，而不是service role key
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // 使用常规注册方式
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role, // 将角色保存在用户元数据中
          profile_data: profileData || {}
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback`
      }
    })

    if (authError) {
      console.error('Auth error:', authError)
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    return NextResponse.json({ 
      message: 'Registration successful. Please check your email for verification.',
      user: authData.user
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}