export interface Course {
  id: string;
  name: string;
  code: string;
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