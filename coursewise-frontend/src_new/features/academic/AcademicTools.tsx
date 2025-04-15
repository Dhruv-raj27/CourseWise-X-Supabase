import React, { useState, useEffect } from 'react';
import { BookOpen, FileText, Calendar, Star, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../lib/hooks/useToast';
import NavBar from '../shared/NavBar';
import { supabase } from '../../lib/supabase';

const AcademicTools: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setIsAuthenticated(!!session);
        setIsLoading(false);
      } catch (error) {
        console.error('Error checking auth status:', error);
        setIsLoading(false);
      }
    };

    checkAuthStatus();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const features = [
    {
      title: 'Course Recommendation',
      description: 'Get personalized course recommendations based on your interests and academic history.',
      icon: BookOpen,
      path: '/course-recommendation',
      gradientFrom: 'from-indigo-500',
      gradientTo: 'to-purple-500',
      hoverColor: 'hover:bg-indigo-100',
      shadowColor: 'shadow-indigo-200',
    },
    {
      title: 'TT-Clash Checker',
      description: 'Check for time table clashes in your selected courses to avoid scheduling conflicts.',
      icon: AlertTriangle,
      path: '/tt-clash-checker',
      gradientFrom: 'from-rose-400',
      gradientTo: 'to-red-500',
      hoverColor: 'hover:bg-rose-100',
      shadowColor: 'shadow-rose-200',
    },
    {
      title: 'Course Reviews',
      description: 'Read and write reviews for courses to help fellow students make informed decisions.',
      icon: Star,
      path: '/course-reviews',
      gradientFrom: 'from-amber-400',
      gradientTo: 'to-orange-500',
      hoverColor: 'hover:bg-amber-100',
      shadowColor: 'shadow-amber-200',
    },
    {
      title: 'TimeTable Maker',
      description: 'Create your perfect timetable by selecting courses and visualizing your weekly schedule.',
      icon: Calendar,
      path: '/timetable-maker',
      gradientFrom: 'from-green-400',
      gradientTo: 'to-emerald-500',
      hoverColor: 'hover:bg-green-100',
      shadowColor: 'shadow-green-200',
    },
  ];

  const handleFeatureClick = (path: string) => {
    if (isAuthenticated) {
      navigate(path);
    } else {
      showToast('Please log in to access this feature', 'info');
      navigate('/login', { state: { from: path } });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute top-20 right-20 w-72 h-72 bg-purple-300/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-80 h-80 bg-indigo-300/20 rounded-full blur-3xl"></div>
        </div>
        
        <NavBar />
        
        <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center relative z-10">
          {/* Animated title placeholder */}
          <div className="animate-pulse mb-16 text-center">
            <div className="h-12 bg-indigo-300/50 rounded-lg w-64 mx-auto mb-6"></div>
            <div className="h-4 bg-indigo-200/50 rounded w-96 mx-auto mb-2"></div>
            <div className="h-4 bg-indigo-200/50 rounded w-80 mx-auto"></div>
          </div>
          
          {/* Card placeholders */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full max-w-6xl">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="bg-white/50 rounded-3xl p-8 animate-pulse shadow-lg">
                <div className="rounded-xl bg-indigo-300/50 h-16 w-16 mb-6"></div>
                <div className="h-6 bg-indigo-300/50 rounded w-3/4 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-indigo-200/50 rounded"></div>
                  <div className="h-4 bg-indigo-200/50 rounded"></div>
                  <div className="h-4 bg-indigo-200/50 rounded w-5/6"></div>
                </div>
                <div className="h-5 bg-indigo-300/50 rounded w-1/3 mt-8"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-20 right-20 w-72 h-72 bg-purple-300/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-indigo-300/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-blue-300/20 rounded-full blur-3xl"></div>
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM2MzY2ZjEiIGZpbGwtb3BhY2l0eT0iMC4wNCI+PHBhdGggZD0iTTM2IDM0aDRWMGgtNHYzNHptMCAyNmg0di0yaC00djJ6bTAtMyBoNHYtMmgtNHYyem0wLTNoNHYtMmgtNHYyem0wLTNoNHYtMmgtNHYyem0wLTNoNHYtMmgtNHYyek0wIDRjMC0yLjIxIDEuNzktNCA0LTRoNTJjMi4yMSAwIDQgMS43OSA0IDR2NTJjMCAyLjIxLTEuNzkgNC00IDRINGMtMi4yMSAwLTQtMS43OS00LTRWNHptNCAwdjUyaDUyVjRINHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-70"></div>
      </div>

      <NavBar />
      
      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 mb-6 tracking-tight">Academic Tools</h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            Explore our suite of academic tools designed to help you navigate your university journey with ease and confidence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-10 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div 
              key={index}
              onClick={() => handleFeatureClick(feature.path)}
              className={`relative bg-white/80 backdrop-blur-lg rounded-3xl overflow-hidden
                transition-all duration-500 transform hover:-translate-y-2 cursor-pointer
                shadow-xl hover:shadow-2xl group border border-gray-100/40`}
            >
              {/* Background glow effect */}
              <div className={`absolute -inset-1 opacity-0 group-hover:opacity-30 blur-xl bg-gradient-to-r ${feature.gradientFrom} ${feature.gradientTo} transition-opacity duration-500 rounded-3xl`}></div>
              
              <div className="p-10 flex flex-col h-full relative z-10">
                <div className={`w-20 h-20 rounded-2xl mb-8 flex items-center justify-center
                  bg-gradient-to-br ${feature.gradientFrom} ${feature.gradientTo} text-white
                  shadow-lg group-hover:shadow-xl transition-all duration-500 group-hover:scale-110`}
                >
                  <feature.icon className="h-10 w-10" />
                </div>
                
                <h3 className="text-3xl font-bold text-gray-800 mb-4 group-hover:translate-x-2 transition-transform duration-300">
                  {feature.title}
                </h3>
                
                <p className="text-lg text-gray-600 mb-8 flex-grow leading-relaxed">
                  {feature.description}
                </p>
                
                <div className={`flex items-center font-medium text-base
                  bg-clip-text text-transparent bg-gradient-to-r ${feature.gradientFrom} ${feature.gradientTo}
                  transition-all duration-300 group-hover:translate-x-2`}
                >
                  <span>Explore {feature.title}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 group-hover:translate-x-2 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>

        {!isAuthenticated && (
          <div className="mt-20 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-400/20 to-purple-400/20 blur-3xl rounded-3xl transform -skew-y-3"></div>
            <div className="relative text-center bg-white/90 backdrop-blur-lg max-w-3xl mx-auto p-10 rounded-3xl shadow-2xl border border-indigo-100/50 overflow-hidden">
              {/* Animated background shapes */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-200/30 rounded-full blur-xl"></div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-200/30 rounded-full blur-xl"></div>
              
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                Sign in to unlock all features
              </h3>
              <p className="text-gray-600 text-lg mb-8 max-w-xl mx-auto">
                Create an account or log in to access all our academic tools and save your progress across devices.
              </p>
              <button 
                onClick={() => navigate('/login')}
                className="relative inline-flex items-center overflow-hidden group px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl
                  shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <span className="absolute top-0 left-0 w-full h-full bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                <FileText className="h-5 w-5 mr-3" />
                <span>Sign In</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AcademicTools; 