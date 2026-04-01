import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://pnhiuifejnnklbfpjmdr.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBuaGl1aWZlam5ua2xiZnBqbWRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2OTA3ODUsImV4cCI6MjA4OTI2Njc4NX0.PSnt0z41OiiUvoJgp3S5WO5g8Mhz-GORZbExlo_SXho'

export const supabase = createClient(supabaseUrl, supabaseKey)
export { entities, auth } from "./api";