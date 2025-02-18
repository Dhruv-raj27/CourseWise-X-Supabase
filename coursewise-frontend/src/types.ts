export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  profilePicture?: string;
  institution?: string;
  branch?: string;
  semester?: number;
}

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