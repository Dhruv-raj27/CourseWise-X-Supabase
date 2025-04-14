// Temporarily disabled to fix TypeScript errors
/*
export interface TimeSlot {
  day: string;
  startTime: string;
  endTime: string;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  description: string;
  credits: number;
  semester: number;
  stream: string;
  prerequisites: string[];
  antiRequisites: string[];
  schedule: TimeSlot[];
  duration: string;
  instructor: string;
  tags: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  type: 'lecture' | 'tutorial' | 'lab';
}
*/

// Temporary placeholder to prevent TypeScript errors
export interface TimeSlot {
  day: string;
  startTime: string;
  endTime: string;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  description: string;
  credits: number;
  semester: number;
  stream: string;
  prerequisites: string[];
  antiRequisites: string[];
  schedule: TimeSlot[];
  duration: string;
  instructor: string;
  tags: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  type: 'lecture' | 'tutorial' | 'lab';
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

export interface Review {
  id: string;
  courseId: string;
  userId: string;
  rating: number;
  review: string;
  timestamp: string;
  likes: number;
  helpful: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  institution?: string;
  program?: string;
  currentSemester?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  status: 'active' | 'completed' | 'dropped';
  enrolledAt: string;
  completedAt?: string;
  semester: number;
}