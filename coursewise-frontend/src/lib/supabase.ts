import { createClient } from '@supabase/supabase-js'
import { UserMetadata, SupabaseError } from '../types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

interface SignUpParams {
  email: string;
  password: string;
  metadata?: UserMetadata;
}

interface SignInParams {
  email: string;
  password: string;
}

// Auth helper functions
export const auth = {
  // Sign up with email and password
  signUp: async ({ email, password, metadata }: SignUpParams) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: `${window.location.origin}/auth/callback?type=signup`
        }
      })
      if (error) throw error
      return data
    } catch (error: unknown) {
      console.error('Sign up error:', error)
      throw error as SupabaseError
    }
  },

  // Sign in with email and password
  signIn: async ({ email, password }: SignInParams) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      if (error) throw error
      return data
    } catch (error: unknown) {
      console.error('Sign in error:', error)
      throw error as SupabaseError
    }
  },

  // Sign in with Google
  signInWithGoogle: async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })
      if (error) throw error
      return data
    } catch (error: unknown) {
      console.error('Google sign in error:', error)
      throw error as SupabaseError
    }
  },

  // Sign out
  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error: unknown) {
      console.error('Sign out error:', error)
      throw error as SupabaseError
    }
  },

  // Get current session
  getSession: async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) throw error
      return session
    } catch (error: unknown) {
      console.error('Get session error:', error)
      throw error as SupabaseError
    }
  },

  // Get current user
  getUser: async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) throw error
      return user
    } catch (error: unknown) {
      console.error('Get user error:', error)
      throw error as SupabaseError
    }
  },

  // Reset password
  resetPassword: async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?type=reset-password`
      })
      if (error) throw error
    } catch (error: unknown) {
      console.error('Reset password error:', error)
      throw error as SupabaseError
    }
  },

  // Update password
  updatePassword: async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })
      if (error) throw error
    } catch (error: unknown) {
      console.error('Update password error:', error)
      throw error as SupabaseError
    }
  }
} 