import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/api-auth'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// GET /api/universities - 搜索和筛选大学
export const GET = withAuth(async (request: NextRequest, user) => {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { searchParams } = new URL(request.url)
    
    // 获取查询参数
    const search = searchParams.get('search') || ''
    const country = searchParams.get('country') || ''
    const state = searchParams.get('state') || ''
    const minRanking = searchParams.get('minRanking')
    const maxRanking = searchParams.get('maxRanking')
    const minAcceptanceRate = searchParams.get('minAcceptanceRate')
    const maxAcceptanceRate = searchParams.get('maxAcceptanceRate')
    const applicationSystem = searchParams.get('applicationSystem') || ''
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // 构建查询
    let query = supabase
      .from('universities')
      .select('*')
      .order('us_news_ranking', { ascending: true, nullsFirst: false })
      .range(offset, offset + limit - 1)

    // 应用筛选条件
    if (search) {
      query = query.or(`name.ilike.%${search}%,city.ilike.%${search}%,state.ilike.%${search}%`)
    }

    if (country) {
      query = query.ilike('country', `%${country}%`)
    }

    if (state) {
      query = query.ilike('state', `%${state}%`)
    }

    if (minRanking) {
      query = query.gte('us_news_ranking', parseInt(minRanking))
    }

    if (maxRanking) {
      query = query.lte('us_news_ranking', parseInt(maxRanking))
    }

    if (minAcceptanceRate) {
      query = query.gte('acceptance_rate', parseFloat(minAcceptanceRate) / 100)
    }

    if (maxAcceptanceRate) {
      query = query.lte('acceptance_rate', parseFloat(maxAcceptanceRate) / 100)
    }

    if (applicationSystem) {
      query = query.eq('application_system', applicationSystem)
    }

    const { data: universities, error } = await query

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch universities' }, { status: 400 })
    }

    // 获取总数（用于分页）
    const { count } = await supabase
      .from('universities')
      .select('*', { count: 'exact', head: true })

    return NextResponse.json({ 
      universities,
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (offset + limit) < (count || 0)
      }
    })
  } catch (error) {
    console.error('Error fetching universities:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})