import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// POST /api/auth/setup-profile - 邮箱验证后创建用户档案
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // 验证token并获取用户信息
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // 检查用户是否已经有档案
    const { data: existingStudent } = await supabase
      .from('students')
      .select('id')
      .eq('user_id', user.id)
      .single()

    const { data: existingParent } = await supabase
      .from('parents')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (existingStudent || existingParent) {
      return NextResponse.json({ message: 'Profile already exists' })
    }

    // 从用户元数据获取角色和档案数据
    const role = user.user_metadata?.role || 'student'
    const profileData = user.user_metadata?.profile_data || {}

    console.log('Setting up profile for user:', user.id, 'with role:', role)

    if (role === 'student') {
      const { error: insertError } = await supabase
        .from('students')
        .insert({
          user_id: user.id,
          name: profileData.name || '',
          email: user.email!,
          graduation_year: profileData.graduationYear ? parseInt(profileData.graduationYear) : null,
          gpa: profileData.gpa ? parseFloat(profileData.gpa) : null,
          sat_score: profileData.satScore ? parseInt(profileData.satScore) : null,
          act_score: profileData.actScore ? parseInt(profileData.actScore) : null,
          target_countries: profileData.targetCountries || null,
          intended_majors: profileData.intendedMajors || null,
        })

      if (insertError) {
        console.error('Error creating student profile:', insertError)
        return NextResponse.json({ error: 'Failed to create student profile' }, { status: 500 })
      }
    } else if (role === 'parent') {
      const { error: insertError } = await supabase
        .from('parents')
        .insert({
          user_id: user.id,
          name: profileData.name || '',
          email: user.email!,
          student_ids: profileData.studentIds || null,
        })

      if (insertError) {
        console.error('Error creating parent profile:', insertError)
        return NextResponse.json({ error: 'Failed to create parent profile' }, { status: 500 })
      }
    }

    return NextResponse.json({ message: 'Profile created successfully', role })
  } catch (error) {
    console.error('Setup profile error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}