export interface Course {
  id: string;
  code: string;
  name: string;
  credits: number;
  prerequisites: string[];
  schedule: {
    day: string;
    startTime: string;
    endTime: string;
  }[];
  stream: string;
  semester: number;
  description: string;
  instructor?: string;
  duration?: string;
  difficulty?: string;
  tags?: string[];
  enrollmentStatus?: string;
  antiRequisites?: string[];
  type?: 'lecture' | 'tutorial' | 'lab';
  professor?: string;
}

export interface UserParams {
  stream: string;
  semester: number;
  cgpa: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
}

export interface SupabaseError {
  message: string;
  status?: number;
  name?: string;
}

export interface UserMetadata {
  full_name?: string;
  phone?: string;
  institution?: string;
  branch?: string;
  semester?: number;
  profilePicture?: string;
}

export interface ReviewFormData {
  courseName: string;
  courseCode: string;
  professorName: string;
  rating: number;
  difficulty: number;
  review: string;
  semester: string;
  anonymous: boolean;
}