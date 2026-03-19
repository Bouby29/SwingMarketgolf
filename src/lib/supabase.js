import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ahhowdesruijqgcpemhu.supabase.co'
const supabaseKey = 'sb_publishable_JbvmLE-PYA3g5--KVXvnLQ_E6XaHxUp'

export const supabase = createClient(supabaseUrl, supabaseKey)