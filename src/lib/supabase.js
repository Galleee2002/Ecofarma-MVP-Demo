import { createClient } from '@supabase/supabase-js'
import { supabaseAnonKey, supabaseUrl } from './env.js'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
