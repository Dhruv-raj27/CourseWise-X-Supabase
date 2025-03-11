import React, { useState, useEffect } from 'react';
import { Mail, Lock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { AuthResponse } from '../types/auth';

interface LoginPageProps {
  onLogin: (userData: AuthResponse['user']) => Promise<boolean>;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post<AuthResponse>(`${import.meta.env.VITE_API_URL}/auth/login`, {
        email,
        password
      });

      if (response.data?.token && response.data?.user) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        await onLogin(response.data.user);
        navigate('/dashboard');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      setError(errorMessage);
      
      if (errorMessage.includes('not verified')) {
        setError('Email not verified. Please check your email for verification link or contact support.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        setLoading(true);
        // First get the ID token from Google using the access token
        const userInfo = await axios.get(
          'https://www.googleapis.com/oauth2/v3/userinfo',
          {
            headers: { Authorization: `Bearer ${response.access_token}` },
          }
        );

        // Now send the user info to your backend
        const res = await axios.post<AuthResponse>(`${import.meta.env.VITE_API_URL}/auth/google`, {
          token: response.access_token,
          userInfo: userInfo.data
        });
        
        if (res.data?.token && res.data?.user) {
          localStorage.setItem('token', res.data.token);
          localStorage.setItem('user', JSON.stringify(res.data.user));
          await onLogin(res.data.user);
          navigate('/dashboard');
        }
      } catch (error: any) {
        console.error('Google login error:', error);
        setError(error.response?.data?.message || 'Google login failed');
      } finally {
        setLoading(false);
      }
    },
    onError: (error) => {
      console.error('Google login error:', error);
      setError('Google login failed');
    }
  });

  if (!mounted) {
    return null; // or a loading spinner
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Section - Login Form */}
      <div className="w-full md:w-1/2 p-4 md:p-8 flex items-center justify-center bg-white">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl font-bold">C</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">CourseWise</span>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Welcome Text */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">Welcome back</h1>
            <p className="text-gray-500">Please enter your details to sign in</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-600 focus:border-purple-600"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-600 focus:border-purple-600"
                    placeholder="Enter your password"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="remember" className="ml-2 text-sm text-gray-600">
                  Remember for 30 days
                </label>
              </div>
              <button type="button" className="text-sm text-purple-600 hover:text-purple-500 font-medium">
                Forgot password?
              </button>
            </div>

            <div className="space-y-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-lg
                         hover:from-indigo-700 hover:to-purple-700 transform hover:-translate-y-0.5 
                         transition-all duration-300 hover:shadow-lg"
              >
                {loading ? 'Signing in...' : 'Sign in'} <span className="ml-2">→</span>
              </button>

              <button
                type="button"
                onClick={() => handleGoogleLogin()}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <img
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  alt="Google"
                  className="w-5 h-5"
                />
                <span className="text-gray-700">Sign in with Google</span>
              </button>
            </div>
          </form>

          <p className="text-center text-gray-500 text-sm">
            Don't have an account?{' '}
            <Link to="/signup" className="text-purple-600 hover:text-purple-500 font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>

      {/* Right Section - Feature Showcase */}
      <div className="hidden md:flex w-full md:w-1/2 bg-gradient-to-br from-indigo-600 to-purple-600 p-8 items-center justify-center">
        <div className="max-w-md text-white">
          <div className="space-y-8">
            <h2 className="text-3xl font-bold">Start Your Learning Journey</h2>
            <p className="text-purple-100 text-lg">
              Access personalized course recommendations and create your perfect schedule with CourseWise.
            </p>
            
            {/* Feature Cards with continuous floating animation */}
            <div className="grid gap-6">
              <div className="bg-white/10 p-6 rounded-xl backdrop-blur-sm 
                            animate-float-slow">
                <h3 className="font-semibold mb-2">Smart Recommendations</h3>
                <p className="text-purple-100">Get course suggestions based on your interests and academic goals.</p>
              </div>
              
              <div className="bg-white/10 p-6 rounded-xl backdrop-blur-sm 
                            animate-float-slower">
                <h3 className="font-semibold mb-2">Conflict-Free Schedule</h3>
                <p className="text-purple-100">Our intelligent system ensures your timetable is optimized and clash-free.</p>
              </div>
              
              <div className="bg-white/10 p-6 rounded-xl backdrop-blur-sm 
                            animate-float-slowest">
                <h3 className="font-semibold mb-2">Track Your Progress</h3>
                <p className="text-purple-100">Monitor your academic journey with detailed progress tracking.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}