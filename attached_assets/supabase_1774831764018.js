import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables. Check your .env or Replit Secrets.');
}

// Public client — respects RLS, used when acting on behalf of a user
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client — bypasses RLS, used for server-side operations (cron jobs, etc.)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
