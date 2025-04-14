import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { BookOpen, Calendar, Clock, Star, Users, Shield, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/dashboard');
      }
    });
  }, [navigate]);

  const handleGoogleLogin = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
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
      console.error('Login error:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Section - Login Form */}
      <div className="w-full md:w-1/2 p-4 md:p-8 flex items-center justify-center bg-white relative overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="w-40 h-40 bg-purple-600 rounded-full -top-20 -left-20 absolute animate-pulse"></div>
            <div className="w-32 h-32 bg-indigo-600 rounded-full top-1/4 -right-16 absolute animate-pulse delay-300"></div>
            <div className="w-36 h-36 bg-blue-600 rounded-full bottom-1/3 -left-16 absolute animate-pulse delay-500"></div>
            <div className="w-28 h-28 bg-pink-600 rounded-full -bottom-14 right-1/4 absolute animate-pulse delay-700"></div>
          </div>
            </div>

        <div className="relative z-10 w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-2">Welcome Back!</h2>
            <p className="text-gray-600">Sign in to continue to CourseWise</p>
          </div>

              <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-all duration-200 shadow-sm"
          >
            <img src="/google.svg" alt="Google" className="w-5 h-5" />
            <span>Continue with Google</span>
              </button>
        </div>
      </div>

      {/* Right Section - Features */}
      <div className="w-full md:w-1/2 bg-gradient-to-br from-purple-600 to-indigo-700 p-8 text-white">
        <div className="h-full flex flex-col justify-center max-w-lg mx-auto">
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
              
          <div className="mt-12">
            <div className="flex items-center gap-4 mb-4">
              <Users className="w-5 h-5" />
              <span>Join 1000+ students using CourseWise</span>
              </div>
            <div className="flex items-center gap-4">
              <Shield className="w-5 h-5" />
              <span>Secure & Privacy Focused</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Feature({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex gap-4 items-start">
      <div className="p-2 bg-white/10 rounded-lg">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold mb-1">{title}</h3>
        <p className="text-white/80 text-sm">{description}</p>
      </div>
    </div>
  );
}