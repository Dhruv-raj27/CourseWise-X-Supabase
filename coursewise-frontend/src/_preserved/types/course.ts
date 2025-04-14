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
  enrollmentStatus?: 'open' | 'closed' | 'waitlist';
} 