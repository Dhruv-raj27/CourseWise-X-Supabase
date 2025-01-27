import axios, { AxiosError } from 'axios';

const API_URL = 'http://localhost:5000/api';

const testAPI = async () => {
  try {
    // Test 1: Sign up a test user
    const signupResponse = await axios.post(`${API_URL}/auth/signup`, {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      institution: 'IIIT Delhi',
      branch: 'Computer Science and Engineering',
      semester: 4
    });
    console.log('Signup Test:', signupResponse.data);

    // Test 2: Get courses
    const coursesResponse = await axios.get(`${API_URL}/courses`, {
      params: {
        branch: 'Computer Science and Engineering',
        semester: 4
      }
    });
    console.log('Courses Test:', coursesResponse.data);

  } catch (error: any) {
    console.error('API Test Error:', error.response?.data || error.message);
  }
};

testAPI(); 