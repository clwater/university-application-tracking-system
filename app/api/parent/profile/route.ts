import { NextRequest, NextResponse } from 'next/server'
import { withParentAuth } from '@/lib/api-auth'
import { createClient } from '@supabase/supabase-js'
import { getSupabaseUrl, getSupabaseServiceKey } from '@/lib/env'

const supabaseUrl = getSupabaseUrl()
const supabaseServiceKey = getSupabaseServiceKey()

// GET /api/parent/profile - 获取家长档案
export const GET = withParentAuth(async (request: NextRequest, user) => {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    const { data: parent, error } = await supabase
      .from('parents')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error) {
      return NextResponse.json({ error: 'Parent profile not found' }, { status: 404 })
    }

    return NextResponse.json({ parent })
  } catch (error) {
    console.error('Error fetching parent profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

// PUT /api/parent/profile - 更新家长档案
export const PUT = withParentAuth(async (request: NextRequest, user) => {
  try {
    const body = await request.json()
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    const { data: parent, error } = await supabase
      .from('parents')
      .update({
        name: body.name,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 400 })
    }

    return NextResponse.json({ parent })
  } catch (error) {
    console.error('Error updating parent profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})