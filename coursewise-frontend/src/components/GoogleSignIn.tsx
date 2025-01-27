import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';

export default function GoogleSignIn() {
  const login = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        const res = await axios.post('http://localhost:5000/api/auth/google', {
          token: response.access_token
        });
        
        // Store the token
        localStorage.setItem('token', res.data.token);
        
        // Redirect or update UI
        window.location.href = '/dashboard';
      } catch (error) {
        console.error('Login failed:', error);
      }
    },
    onError: () => console.log('Login Failed')
  });

  return (
    <button
      onClick={() => login()}
      className="flex items-center justify-center gap-2 bg-white text-gray-700 px-4 py-2 rounded-lg shadow hover:shadow-md"
    >
      <img src="/google-icon.svg" alt="Google" className="w-6 h-6" />
      Sign in with Google
    </button>
  );
} 