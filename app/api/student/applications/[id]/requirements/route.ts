import { NextRequest, NextResponse } from 'next/server'
import { withStudentAuth, verifyResourceOwnership } from '@/lib/api-auth'
import { createClient } from '@supabase/supabase-js'
import { getSupabaseUrl, getSupabaseServiceKey } from '@/lib/env'

const supabaseUrl = getSupabaseUrl()
const supabaseServiceKey = getSupabaseServiceKey()

// GET /api/student/applications/[id]/requirements - 获取申请要求
export const GET = withStudentAuth(async (request: NextRequest, user, { params }: { params: { id: string } }) => {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const applicationId = params.id

    // 验证资源所有权
    const hasAccess = await verifyResourceOwnership(user, 'application', applicationId)
    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const { data: requirements, error } = await supabase
      .from('application_requirements')
      .select('*')
      .eq('application_id', applicationId)
      .order('created_at', { ascending: true })

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch requirements' }, { status: 400 })
    }

    return NextResponse.json({ requirements })
  } catch (error) {
    console.error('Error fetching requirements:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

// POST /api/student/applications/[id]/requirements - 创建申请要求
export const POST = withStudentAuth(async (request: NextRequest, user, { params }: { params: { id: string } }) => {
  try {
    const body = await request.json()
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const applicationId = params.id

    // 验证资源所有权
    const hasAccess = await verifyResourceOwnership(user, 'application', applicationId)
    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const { data: requirement, error } = await supabase
      .from('application_requirements')
      .insert({
        application_id: applicationId,
        requirement_type: body.requirement_type,
        status: body.status || 'not_started',
        deadline: body.deadline,
        notes: body.notes,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: 'Failed to create requirement' }, { status: 400 })
    }

    return NextResponse.json({ requirement }, { status: 201 })
  } catch (error) {
    console.error('Error creating requirement:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})