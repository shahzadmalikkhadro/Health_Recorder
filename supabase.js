/**
 * Supabase configuration and initialization
 */
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://glnuukcfwjivrgclteec.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdsbnV1a2Nmd2ppdnJnY2x0ZWVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3NjIyMTksImV4cCI6MjA5MDMzODIxOX0.c7gLhr5Nl-Vhv7ZwMFU4hOQ8e4ElVj6OSZblJeuXBY8'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export default supabase
