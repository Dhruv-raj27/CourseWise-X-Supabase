export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          created_at?: string
          updated_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string;
          user_id: string;
          full_name: string | null;
          student_id: string | null;
          email: string | null;
          department: string | null;
          semester: number | null;
          program: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          full_name?: string | null;
          student_id?: string | null;
          email?: string | null;
          department?: string | null;
          semester?: number | null;
          program?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          full_name?: string | null;
          student_id?: string | null;
          email?: string | null;
          department?: string | null;
          semester?: number | null;
          program?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      }
      academic_details: {
        Row: {
          id: string;
          user_id: string;
          institution: string;
          program: string;
          specialization: string | null;
          current_semester: number;
          cgpa: number | null;
          total_credits: number;
          expected_graduation_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          institution: string;
          program: string;
          specialization?: string | null;
          current_semester: number;
          cgpa?: number | null;
          total_credits?: number;
          expected_graduation_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          institution?: string;
          program?: string;
          specialization?: string | null;
          current_semester?: number;
          cgpa?: number | null;
          total_credits?: number;
          expected_graduation_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      }
      user_preferences: {
        Row: {
          id: string;
          user_id: string;
          career_goal: string | null;
          preparation_type: string | null;
          certifications: string[];
          technical_skills: string[];
          improvement_areas: string[];
          course_format: string | null;
          time_commitment: string | null;
          course_style: string | null;
          primary_interest: string | null;
          secondary_interest: string | null;
          experience_level: string | null;
          work_environment: string | null;
          future_goal: string | null;
          preparation_timeline: string | null;
          soft_skills: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          career_goal?: string | null;
          preparation_type?: string | null;
          certifications?: string[];
          technical_skills?: string[];
          improvement_areas?: string[];
          course_format?: string | null;
          time_commitment?: string | null;
          course_style?: string | null;
          primary_interest?: string | null;
          secondary_interest?: string | null;
          experience_level?: string | null;
          work_environment?: string | null;
          future_goal?: string | null;
          preparation_timeline?: string | null;
          soft_skills?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          career_goal?: string | null;
          preparation_type?: string | null;
          certifications?: string[];
          technical_skills?: string[];
          improvement_areas?: string[];
          course_format?: string | null;
          time_commitment?: string | null;
          course_style?: string | null;
          primary_interest?: string | null;
          secondary_interest?: string | null;
          experience_level?: string | null;
          work_environment?: string | null;
          future_goal?: string | null;
          preparation_timeline?: string | null;
          soft_skills?: string[];
          created_at?: string;
          updated_at?: string;
        };
      }
      course_categories: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      }
      streams: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string
        }
      }
      courses: {
        Row: {
          id: string;
          code: string;
          name: string;
          description: string | null;
          credits: number;
          semester: string;
          stream: string | null;
          prerequisites: string[] | null;
          schedule: any | null;
          duration: number | null;
          instructor: string | null;
          tags: string[] | null;
          difficulty: string | null;
          max_students: number | null;
          min_cgpa: number | null;
          department: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          name: string;
          description?: string | null;
          credits: number;
          semester: string;
          stream?: string | null;
          prerequisites?: string[] | null;
          schedule?: any | null;
          duration?: number | null;
          instructor?: string | null;
          tags?: string[] | null;
          difficulty?: string | null;
          max_students?: number | null;
          min_cgpa?: number | null;
          department?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          name?: string;
          description?: string | null;
          credits?: number;
          semester?: string;
          stream?: string | null;
          prerequisites?: string[] | null;
          schedule?: any | null;
          duration?: number | null;
          instructor?: string | null;
          tags?: string[] | null;
          difficulty?: string | null;
          max_students?: number | null;
          min_cgpa?: number | null;
          department?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      }
      course_prerequisites: {
        Row: {
          id: string
          course_id: string
          prerequisite_id: string
          is_mandatory: boolean
          created_at: string
        }
        Insert: {
          id?: string
          course_id: string
          prerequisite_id: string
          is_mandatory?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          course_id?: string
          prerequisite_id?: string
          is_mandatory?: boolean
          created_at?: string
        }
      }
      course_schedules: {
        Row: {
          id: string
          course_id: string
          day_of_week: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday'
          start_time: string
          end_time: string
          room: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          course_id: string
          day_of_week: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday'
          start_time: string
          end_time: string
          room?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          course_id?: string
          day_of_week?: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday'
          start_time?: string
          end_time?: string
          room?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_course_enrollments: {
        Row: {
          id: string
          user_id: string
          course_id: string
          enrollment_date: string
          status: 'enrolled' | 'completed' | 'dropped'
          grade: string | null
          feedback: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          course_id: string
          enrollment_date?: string
          status: 'enrolled' | 'completed' | 'dropped'
          grade?: string | null
          feedback?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          course_id?: string
          enrollment_date?: string
          status?: 'enrolled' | 'completed' | 'dropped'
          grade?: string | null
          feedback?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      course_reviews: {
        Row: {
          id: string
          user_id: string
          course_id: string
          rating: number | null
          review_text: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          course_id: string
          rating?: number | null
          review_text?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          course_id?: string
          rating?: number | null
          review_text?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      admins: {
        Row: {
          id: string;
          role: 'super_admin' | 'admin' | 'moderator';
          permissions: Record<string, any>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role: 'super_admin' | 'admin' | 'moderator';
          permissions?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role?: 'super_admin' | 'admin' | 'moderator';
          permissions?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
        };
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 