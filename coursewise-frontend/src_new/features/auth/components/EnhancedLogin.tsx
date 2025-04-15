import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  Star, 
  Users, 
  Shield, 
  Sparkles 
} from 'lucide-react';
import type { AuthError, Session } from '@supabase/supabase-js';
import { Box, Spinner, useToast } from '@chakra-ui/react';
import NavBar from '../../shared/NavBar';
import { GoogleIcon } from '../../../assets';

export default function EnhancedLogin() {
  const navigate = useNavigate();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [isSessionLoading, setIsSessionLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsSessionLoading(false);
      if (session) {
        // Check if there's a redirect URL in localStorage
        const redirectUrl = localStorage.getItem('redirectAfterLogin') || sessionStorage.getItem('redirectAfterLogin');
        if (redirectUrl) {
          localStorage.removeItem('redirectAfterLogin');
          sessionStorage.removeItem('redirectAfterLogin');
          navigate(redirectUrl);
        } else {
          navigate('/dashboard');
        }
      }
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        // Check if there's a redirect URL in localStorage
        const redirectUrl = localStorage.getItem('redirectAfterLogin') || sessionStorage.getItem('redirectAfterLogin');
        if (redirectUrl) {
          localStorage.removeItem('redirectAfterLogin');
          sessionStorage.removeItem('redirectAfterLogin');
          navigate(redirectUrl);
        } else {
          navigate('/dashboard');
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          scopes: 'email profile',
        },
      });

      if (error) throw error;
      if (!data.url) throw new Error('No authentication URL returned');

      // Redirect to Google OAuth
      window.location.href = data.url;
    } catch (error) {
      const authError = error as AuthError;
      console.error('Login error:', authError);
      toast({
        title: 'Authentication Error',
        description: authError.message || 'Failed to sign in with Google. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while checking session
  if (isSessionLoading) {
    return (
      <Box height="100vh" display="flex" alignItems="center" justifyContent="center" bg="gray.50">
        <Spinner
          thickness="4px"
          speed="0.65s"
          emptyColor="gray.200"
          color="purple.500"
          size="xl"
        />
      </Box>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <NavBar />
      <div className="flex-grow flex flex-col md:flex-row">
        {/* Left Section - Login Form */}
        <div className="w-full md:w-1/2 p-4 md:p-0 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="w-40 h-40 bg-purple-600 rounded-full -top-20 -left-20 absolute animate-pulse"></div>
              <div className="w-32 h-32 bg-indigo-600 rounded-full top-1/4 -right-16 absolute animate-pulse delay-300"></div>
              <div className="w-36 h-36 bg-blue-600 rounded-full bottom-1/3 -left-16 absolute animate-pulse delay-500"></div>
              <div className="w-28 h-28 bg-pink-600 rounded-full -bottom-14 right-1/4 absolute animate-pulse delay-700"></div>
            </div>
          </div>

          <div className="relative z-10 w-full max-w-md mx-4 my-8">
            <div className="bg-white p-10 rounded-2xl shadow-xl border border-gray-100 backdrop-blur-sm">
              <div className="text-center">
                <div className="flex justify-center mb-6">
                  <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-3 rounded-full shadow-md transform hover:scale-105 transition-transform">
                    <BookOpen className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Welcome Back!</h2>
                <p className="text-gray-600 mb-8">Sign in to continue to CourseWise</p>
              </div>

              <div className="relative mb-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-3 bg-white text-gray-500 text-sm">Continue with</span>
                </div>
              </div>

              <button
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                <GoogleIcon className="w-5 h-5" />
                <span className="font-medium">{isLoading ? 'Signing in...' : 'Google'}</span>
              </button>
              
              <div className="text-center text-gray-500 text-sm mt-8">
                <p>By signing in, you agree to our <a href="#" className="text-indigo-600 hover:text-indigo-800 transition-colors">Terms of Service</a> and <a href="#" className="text-indigo-600 hover:text-indigo-800 transition-colors">Privacy Policy</a></p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section - Features */}
        <div className="w-full md:w-1/2 bg-gradient-to-br from-indigo-600 to-purple-700 p-8 text-white relative overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wOCI+PHBhdGggZD0iTTM2IDMwaC0yVjBoMnYzMHptLTIgMEgydjJoMzJ2LTJ6bTAgMnYyOGgydi0yOGgtMnptMi0ydi0zaC0ydjNoMnptLTIgMEgwdjJoMzR2LTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>

          {/* Decorative elements */}
          <div className="absolute -right-20 -top-20 w-40 h-40 bg-white/10 rounded-full"></div>
          <div className="absolute -left-20 -bottom-20 w-60 h-60 bg-white/10 rounded-full"></div>

          <div className="h-full flex flex-col justify-center max-w-lg mx-auto relative z-10">
            <h2 className="text-3xl font-bold mb-8">Why Choose CourseWise?</h2>
            
            <div className="grid gap-6">
              <Feature
                icon={<Sparkles className="w-6 h-6" />}
                title="Smart Course Recommendations"
                description="Get personalized course suggestions based on your profile and interests"
              />
              <Feature
                icon={<Calendar className="w-6 h-6" />}
                title="Timetable Planning"
                description="Plan your semester schedule efficiently and avoid conflicts"
              />
              <Feature
                icon={<Star className="w-6 h-6" />}
                title="Course Reviews"
                description="Access detailed course reviews from fellow students"
              />
              <Feature
                icon={<Clock className="w-6 h-6" />}
                title="Time Management"
                description="Tools to help you balance your academic workload"
              />
            </div>
                
            <div className="mt-12 border-t border-white/20 pt-8">
              <div className="flex items-center gap-4 mb-4 bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                <Users className="w-5 h-5" />
                <span>Join 1000+ students using CourseWise</span>
              </div>
              <div className="flex items-center gap-4 bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                <Shield className="w-5 h-5" />
                <span>Secure & Privacy Focused</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Feature({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex gap-4 items-start bg-white/10 p-4 rounded-lg backdrop-blur-sm hover:bg-white/20 transition-colors duration-300">
      <div className="p-2 bg-white/20 rounded-lg">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold mb-1">{title}</h3>
        <p className="text-white/80 text-sm">{description}</p>
      </div>
    </div>
  );
} 