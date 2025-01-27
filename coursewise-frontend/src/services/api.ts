import axios from 'axios';

const API_URL = import.meta.env.PROD
  ? 'https://api.course-connect.in'
  : 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const auth = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  
  signup: async (userData: {
    name: string;
    email: string;
    password: string;
    institution: string;
    branch: string;
    semester: number;
  }) => {
    const response = await api.post('/auth/signup', userData);
    return response.data;
  }
};

export const courses = {
  getAllCourses: async (filters: {
    institution: string;
    branch: string;
    semester: number;
  }) => {
    const response = await api.get('/courses', { params: filters });
    return response.data;
  },
  
  getSelectedCourses: async (userId: string) => {
    const response = await api.get(`/courses/selected/${userId}`);
    return response.data;
  },
  
  selectCourse: async (courseId: string) => {
    const response = await api.post('/courses/select', { courseId });
    return response.data;
  }
};

export default api; 