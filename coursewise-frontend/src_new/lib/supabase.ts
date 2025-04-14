import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Admin configuration
export const ADMIN_EMAIL = 'admn.coursewise@gmail.com';

export const verifyAdminCredentials = async (email: string, password: string): Promise<boolean> => {
  if (email !== ADMIN_EMAIL) return false;
  
  try {
    // Sign in with Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      console.error('Supabase auth error:', authError);
      return false;
    }

    // Verify admin role in Supabase
    const { data: adminData, error: adminError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', email)
      .single();

    if (adminError) {
      console.error('Admin verification error:', adminError);
      await supabase.auth.signOut();
      return false;
    }

    if (!adminData) {
      console.error('User is not an admin');
      await supabase.auth.signOut();
      return false;
    }

    return true;
  } catch (error) {
    console.error('Admin verification error:', error);
    return false;
  }
};

// Import file to see if it exists 