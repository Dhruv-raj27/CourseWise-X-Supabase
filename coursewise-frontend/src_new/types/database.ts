export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          auth_provider: string
          google_user_id: string | null
          email_verified: boolean
          phone_number: string | null
          institution: string | null
          branch: string | null
          semester: number | null
          profile_picture_url: string | null
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          auth_provider?: string
          google_user_id?: string | null
          email_verified?: boolean
          phone_number?: string | null
          institution?: string | null
          branch?: string | null
          semester?: number | null
          profile_picture_url?: string | null
          role?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          auth_provider?: string
          google_user_id?: string | null
          email_verified?: boolean
          phone_number?: string | null
          institution?: string | null
          branch?: string | null
          semester?: number | null
          profile_picture_url?: string | null
          role?: string
          created_at?: string
          updated_at?: string
        }
      }
      courses: {
        Row: {
          id: string
          code: string
          name: string
          credits: number
          stream_id: string
          semester: number
          description: string | null
          instructor: string | null
          difficulty: 'Easy' | 'Medium' | 'Hard' | null
          department: string | null
          status: 'active' | 'inactive' | 'archived'
          prerequisites: string[]
          anti_requisites: string[]
          schedule: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          code: string
          name: string
          credits: number
          stream_id: string
          semester: number
          description?: string | null
          instructor?: string | null
          difficulty?: 'Easy' | 'Medium' | 'Hard' | null
          department?: string | null
          status?: 'active' | 'inactive' | 'archived'
          prerequisites?: string[]
          anti_requisites?: string[]
          schedule?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          code?: string
          name?: string
          credits?: number
          stream_id?: string
          semester?: number
          description?: string | null
          instructor?: string | null
          difficulty?: 'Easy' | 'Medium' | 'Hard' | null
          department?: string | null
          status?: 'active' | 'inactive' | 'archived'
          prerequisites?: string[]
          anti_requisites?: string[]
          schedule?: Json
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
} 