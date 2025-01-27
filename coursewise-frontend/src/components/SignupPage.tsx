import React, { useState } from 'react';
import { Mail, Lock, User, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SignupPageProps {
  onSignup: (email: string, password: string, name: string, phone?: string) => void;
}

export default function SignupPage({ onSignup }: SignupPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSignup(email, password, name, phone);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Section - Signup Form */}
      <div className="w-1/2 p-8 flex items-center justify-center bg-white">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl font-bold">C</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">CourseWise</span>
          </div>

          {/* Welcome Text */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">Create an account</h1>
            <p className="text-gray-500">Join CourseWise to start your journey</p>
          </div>

          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-600 focus:border-purple-600"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>

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
                    placeholder="Create a password"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number (Optional)
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-600 focus:border-purple-600"
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-lg
                         hover:from-indigo-700 hover:to-purple-700 transform hover:-translate-y-0.5 
                         transition-all duration-300 hover:shadow-lg"
              >
                Create Account <span className="ml-2">→</span>
              </button>

              <button
                type="button"
                className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <img
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  alt="Google"
                  className="w-5 h-5"
                />
                <span className="text-gray-700">Sign up with Google</span>
              </button>
            </div>
          </form>

          <p className="text-center text-gray-500 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-purple-600 hover:text-purple-500 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Right Section - Feature Showcase */}
      <div className="w-1/2 bg-gradient-to-br from-indigo-600 to-purple-600 p-8 flex items-center justify-center">
        <div className="max-w-md text-white">
          <div className="space-y-8">
            <h2 className="text-3xl font-bold">Join Our Learning Community</h2>
            <p className="text-purple-100 text-lg">
              Create your account to access personalized course recommendations and join thousands of students.
            </p>
            
            {/* Feature Cards with continuous floating animation */}
            <div className="grid gap-6">
              <div className="bg-white/10 p-6 rounded-xl backdrop-blur-sm 
                            animate-float-slow"
              >
                <h3 className="font-semibold mb-2">Personalized Experience</h3>
                <p className="text-purple-100">Get tailored course suggestions based on your academic profile.</p>
              </div>
              
              <div className="bg-white/10 p-6 rounded-xl backdrop-blur-sm 
                            animate-float-slower"
              >
                <h3 className="font-semibold mb-2">Easy Course Selection</h3>
                <p className="text-purple-100">Browse and select courses with detailed information and reviews.</p>
              </div>
              
              <div className="bg-white/10 p-6 rounded-xl backdrop-blur-sm 
                            animate-float-slowest"
              >
                <h3 className="font-semibold mb-2">Student Community</h3>
                <p className="text-purple-100">Connect with fellow students and share your learning experience.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}