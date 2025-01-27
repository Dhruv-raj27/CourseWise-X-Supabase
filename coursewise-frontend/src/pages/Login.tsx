import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';

const Login = () => {
  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        const res = await axios.post('http://localhost:5000/api/auth/google', {
          token: response.access_token
        });
        
        // Store the token and user data
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        
        // Redirect to dashboard
        window.location.href = '/dashboard';
      } catch (error) {
        console.error('Login failed:', error);
      }
    },
    onError: () => console.log('Login Failed')
  });

  return (
    // ... your existing login JSX ...
    <button
      onClick={() => handleGoogleLogin()}
      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
    >
      Sign in with Google
    </button>
    // ... rest of your component ...
  );
};

export default Login;
