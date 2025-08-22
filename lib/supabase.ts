import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'
import { getSupabaseUrl, getSupabaseAnonKey } from './env'

export const supabase = createClient<Database>(
  getSupabaseUrl(), 
  getSupabaseAnonKey()
)