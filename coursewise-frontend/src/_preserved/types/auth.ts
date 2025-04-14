export interface AuthResponse {
  token?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    institution?: string;
    branch?: string;
    semester?: number;
    profilePicture?: string;
  };
  message?: string;
  verificationToken?: string;
} 