// 环境变量配置
// 提供构建时的默认值，避免构建失败

export const getSupabaseUrl = (): string => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!url) {
    console.warn('NEXT_PUBLIC_SUPABASE_URL is not set, using fallback')
    return 'https://placeholder.supabase.co'
  }
  return url
}

export const getSupabaseAnonKey = (): string => {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!key) {
    console.warn('NEXT_PUBLIC_SUPABASE_ANON_KEY is not set, using fallback')
    return 'placeholder-anon-key'
  }
  return key
}

export const getSupabaseServiceKey = (): string => {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!serviceKey && !anonKey) {
    console.warn('Neither SUPABASE_SERVICE_ROLE_KEY nor NEXT_PUBLIC_SUPABASE_ANON_KEY is set, using fallback')
    return 'placeholder-service-key'
  }
  
  return serviceKey || anonKey || 'placeholder-service-key'
}

export const getAppUrl = (): string => {
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
}