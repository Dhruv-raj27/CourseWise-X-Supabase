// Enums from database
export type CourseStatus = 'active' | 'inactive' | 'archived';
export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard';
export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';

// Schedule type
export interface Schedule {
  day: DayOfWeek;
  start_time: string;
  end_time: string;
}

// User interface matching the database
export interface User {
  id: string;
  email: string;
  full_name: string | null;
  auth_provider: string;
  google_user_id: string | null;
  email_verified: boolean;
  
  // Academic details
  institution: string | null;
  branch: string | null;
  semester: number | null;
  
  // Profile details
  profile_picture_url: string | null;
  role: string;
  bio: string | null;
  
  // Additional preferences
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
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

// Course interface matching the database
export interface Course {
  id: string;
  code: string;
  name: string;
  credits: number;
  stream_id: string;
  semester: number;
  description: string | null;
  instructor: string | null;
  difficulty: DifficultyLevel | null;
  department: string | null;
  status: CourseStatus;
  prerequisites: string[];
  anti_requisites: string[];
  schedule: Schedule[];
  created_at: string;
  updated_at: string;
}

// Stream interface
export interface Stream {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

// Selected Course interface
export interface SelectedCourse {
  id: string;
  user_id: string;
  course_id: string;
  created_at: string;
}

// Course Review interface
export interface CourseReview {
  id: string;
  course_id: string;
  user_id: string;
  rating: number;
  review: string | null;
  semester: number;
  created_at: string;
  updated_at: string;
} 