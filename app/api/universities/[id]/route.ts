import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/api-auth'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// GET /api/universities/[id] - 获取大学详细信息
export const GET = withAuth(async (request: NextRequest, user, { params }: { params: { id: string } }) => {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const universityId = params.id

    const { data: university, error } = await supabase
      .from('universities')
      .select('*')
      .eq('id', universityId)
      .single()

    if (error) {
      return NextResponse.json({ error: 'University not found' }, { status: 404 })
    }

    return NextResponse.json({ university })
  } catch (error) {
    console.error('Error fetching university:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})