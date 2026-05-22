import { createClient } from '@supabase/supabase-js'
import { getSupabaseEnv } from './env.js'

const { url, anonKey } = getSupabaseEnv()

export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})
