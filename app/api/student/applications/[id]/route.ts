import { NextRequest, NextResponse } from 'next/server'
import { withStudentAuth, verifyResourceOwnership } from '@/lib/api-auth'
import { createClient } from '@supabase/supabase-js'
import { getSupabaseUrl, getSupabaseServiceKey } from '@/lib/env'

const supabaseUrl = getSupabaseUrl()
const supabaseServiceKey = getSupabaseServiceKey()

// GET /api/student/applications/[id] - 获取特定申请详情
export const GET = withStudentAuth(async (request: NextRequest, user, { params }: { params: { id: string } }) => {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const applicationId = params.id

    // 验证资源所有权
    const hasAccess = await verifyResourceOwnership(user, 'application', applicationId)
    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const { data: application, error } = await supabase
      .from('applications')
      .select(`
        *,
        universities (*),
        application_requirements (*)
      `)
      .eq('id', applicationId)
      .single()

    if (error) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    return NextResponse.json({ application })
  } catch (error) {
    console.error('Error fetching application:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

// PUT /api/student/applications/[id] - 更新申请
export const PUT = withStudentAuth(async (request: NextRequest, user, { params }: { params: { id: string } }) => {
  try {
    const body = await request.json()
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const applicationId = params.id

    // 验证资源所有权
    const hasAccess = await verifyResourceOwnership(user, 'application', applicationId)
    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const { data: application, error } = await supabase
      .from('applications')
      .update({
        application_type: body.application_type,
        deadline: body.deadline,
        status: body.status,
        submitted_date: body.submitted_date,
        decision_date: body.decision_date,
        decision_type: body.decision_type,
        notes: body.notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', applicationId)
      .select(`
        *,
        universities (*)
      `)
      .single()

    if (error) {
      return NextResponse.json({ error: 'Failed to update application' }, { status: 400 })
    }

    return NextResponse.json({ application })
  } catch (error) {
    console.error('Error updating application:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

// DELETE /api/student/applications/[id] - 删除申请
export const DELETE = withStudentAuth(async (request: NextRequest, user, { params }: { params: { id: string } }) => {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const applicationId = params.id

    // 验证资源所有权
    const hasAccess = await verifyResourceOwnership(user, 'application', applicationId)
    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // 删除相关的申请要求
    await supabase
      .from('application_requirements')
      .delete()
      .eq('application_id', applicationId)

    // 删除申请
    const { error } = await supabase
      .from('applications')
      .delete()
      .eq('id', applicationId)

    if (error) {
      return NextResponse.json({ error: 'Failed to delete application' }, { status: 400 })
    }

    return NextResponse.json({ message: 'Application deleted successfully' })
  } catch (error) {
    console.error('Error deleting application:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})