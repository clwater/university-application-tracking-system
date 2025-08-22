import { NextRequest, NextResponse } from 'next/server'
import { withParentAuth } from '@/lib/api-auth'
import { createClient } from '@supabase/supabase-js'
import { getSupabaseUrl, getSupabaseServiceKey } from '@/lib/env'

const supabaseUrl = getSupabaseUrl()
const supabaseServiceKey = getSupabaseServiceKey()

// PUT /api/parent/applications/[id]/notes - 家长添加/更新申请备注
export const PUT = withParentAuth(async (request: NextRequest, user, { params }: { params: { id: string } }) => {
  try {
    const body = await request.json()
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const applicationId = params.id

    // 验证家长是否有访问此申请的权限
    const { data: parent } = await supabase
      .from('parents')
      .select('student_ids')
      .eq('user_id', user.id)
      .single()

    if (!parent?.student_ids) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // 检查申请是否属于家长关联的学生
    const { data: application } = await supabase
      .from('applications')
      .select('student_id')
      .eq('id', applicationId)
      .single()

    if (!application || !parent.student_ids.includes(application.student_id)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // 家长只能添加/更新备注，不能修改其他字段
    const currentNotes = body.current_notes || ''
    const parentNote = `\n\n[家长备注 - ${new Date().toLocaleDateString()}]: ${body.parent_note}`
    const updatedNotes = currentNotes + parentNote

    const { data: updatedApplication, error } = await supabase
      .from('applications')
      .update({
        notes: updatedNotes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', applicationId)
      .select(`
        *,
        universities (*)
      `)
      .single()

    if (error) {
      return NextResponse.json({ error: 'Failed to update notes' }, { status: 400 })
    }

    return NextResponse.json({ application: updatedApplication })
  } catch (error) {
    console.error('Error updating application notes:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})