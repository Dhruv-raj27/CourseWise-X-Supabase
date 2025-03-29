import { User } from '../types';

export interface AuthResponse {
  token?: string;
  user?: User;
  message?: string;
  verificationToken?: string;
} 