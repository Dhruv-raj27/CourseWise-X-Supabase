export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  profilePicture?: string;
  institution?: string;
  branch?: string;
  semester?: number;
}

export { Course } from './types/index'; 