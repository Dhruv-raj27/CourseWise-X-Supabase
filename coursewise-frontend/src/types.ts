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
  semester: number;
  stream: string;
  description?: string;
} 