import { NextRequest, NextResponse } from 'next/server'
import { withStudentAuth } from '@/lib/api-auth'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// PUT /api/student/requirements/[id] - 更新申请要求
export const PUT = withStudentAuth(async (request: NextRequest, user, { params }: { params: { id: string } }) => {
  try {
    const body = await request.json()
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const requirementId = params.id

    // 验证要求是否属于当前学生
    const { data: student } = await supabase
      .from('students')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!student) {
      return NextResponse.json({ error: 'Student profile not found' }, { status: 404 })
    }

    const { data: requirement } = await supabase
      .from('application_requirements')
      .select(`
        *,
        applications!inner(student_id)
      `)
      .eq('id', requirementId)
      .eq('applications.student_id', student.id)
      .single()

    if (!requirement) {
      return NextResponse.json({ error: 'Requirement not found or access denied' }, { status: 403 })
    }

    // 更新要求
    const { data: updatedRequirement, error } = await supabase
      .from('application_requirements')
      .update({
        requirement_type: body.requirement_type,
        status: body.status,
        deadline: body.deadline,
        notes: body.notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', requirementId)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: 'Failed to update requirement' }, { status: 400 })
    }

    return NextResponse.json({ requirement: updatedRequirement })
  } catch (error) {
    console.error('Error updating requirement:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

// DELETE /api/student/requirements/[id] - 删除申请要求
export const DELETE = withStudentAuth(async (request: NextRequest, user, { params }: { params: { id: string } }) => {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const requirementId = params.id

    // 验证要求是否属于当前学生
    const { data: student } = await supabase
      .from('students')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!student) {
      return NextResponse.json({ error: 'Student profile not found' }, { status: 404 })
    }

    const { data: requirement } = await supabase
      .from('application_requirements')
      .select(`
        *,
        applications!inner(student_id)
      `)
      .eq('id', requirementId)
      .eq('applications.student_id', student.id)
      .single()

    if (!requirement) {
      return NextResponse.json({ error: 'Requirement not found or access denied' }, { status: 403 })
    }

    // 删除要求
    const { error } = await supabase
      .from('application_requirements')
      .delete()
      .eq('id', requirementId)

    if (error) {
      return NextResponse.json({ error: 'Failed to delete requirement' }, { status: 400 })
    }

    return NextResponse.json({ message: 'Requirement deleted successfully' })
  } catch (error) {
    console.error('Error deleting requirement:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})