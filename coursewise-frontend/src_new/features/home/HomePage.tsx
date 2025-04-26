import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Users, 
  Clock, 
  ArrowRight, 
  Sparkles, 
  GraduationCap, 
  Target, 
  Mail, 
  Phone,
  Star,
  Calendar
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import NavBar from '../shared/NavBar';

// Import images from assets
import { 
  DewanImage, 
  SharmaImage, 
  SrivastavaImage, 
  RajputImage 
} from '../../assets';

// Animation CSS classes
const animationStyles = `
  @keyframes float {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-20px); }
    100% { transform: translateY(0px); }
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }
  
  @keyframes spin-slow {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  @keyframes blob {
    0% { transform: scale(1) translate(0px, 0px); }
    33% { transform: scale(1.1) translate(30px, -50px); }
    66% { transform: scale(0.9) translate(-20px, 20px); }
    100% { transform: scale(1) translate(0px, 0px); }
  }
  
  .animate-float {
    animation: float 6s ease-in-out infinite;
  }
  
  .animate-float-delay-1 {
    animation: float 6s ease-in-out 2s infinite;
  }
  
  .animate-float-delay-2 {
    animation: float 6s ease-in-out 4s infinite;
  }
  
  .animate-pulse-slow {
    animation: pulse 5s ease-in-out infinite;
  }
  
  .animate-spin-slow {
    animation: spin-slow 20s linear infinite;
  }
  
  .animate-blob {
    animation: blob 15s ease-in-out infinite;
  }
  
  .animation-delay-2000 {
    animation-delay: 2000ms;
  }
  
  .animation-delay-4000 {
    animation-delay: 4000ms;
  }
  
  .animation-delay-6000 {
    animation-delay: 6000ms;
  }
`;

export default function HomePage() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: BookOpen,
      title: 'Smart Course Selection',
      description: 'Find the perfect courses based on your academic profile and interests.'
    },
    {
      icon: Users,
      title: 'Peer Insights',
      description: 'Learn from other students\' experiences and make informed decisions.'
    },
    {
      icon: Clock,
      title: 'Schedule Optimization',
      description: 'Automatically detect and prevent course timing conflicts.'
    },
    {
      icon: Target,
      title: 'Personalized Recommendations',
      description: 'Get course suggestions tailored to your academic goals and performance.'
    }
  ];

  const testimonials = [
    {
      name: 'Kunal Sharma',
      role: 'ECE Student',
      image: SharmaImage,
      text: 'CourseWise made my course selection process so much easier. The clash detection feature saved me from a lot of scheduling headaches!'
    },
    {
      name: 'Dhruv Dewan',
      role: 'Engineering Student',
      image: DewanImage,
      text: 'The personalized recommendations helped me discover courses I wouldn\'t have considered otherwise. Highly recommended!'
    },
    {
      name: 'Sarthak Srivastava',
      role: 'EVE Student',
      image: SrivastavaImage,
      text: 'As a EVE student, I love how CourseWise helps me plan my prerequisites and stay on track with my degree requirements.'
    },
    {
      name: "Dhruv Rajput",
      role: "ECE Student",
      image: RajputImage,
      text: "CourseWise revolutionized how I plan my academic journey. The intelligent course suggestions and conflict detection features are game-changers for students."
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  const handleGetStarted = () => {
    navigate('/academic-tools');
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/70">
      <NavBar />
      <div className="flex-grow space-y-12 py-0">
        {/* Hero Section - Enhanced with decorative elements and floating cards */}
        <section className="relative bg-gradient-to-br from-indigo-600 to-purple-700 text-white pt-20 pb-32 overflow-hidden transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}">
          {/* Animated background pattern */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzBoLTJWMGgydjMwem0tMiAwSDJ2MmgzMnYtMnptMCAydjI4aDJ2LTI4aC0yem0yLTJ2LTNoLTJ2M2gyem0tMiAwSDB2MmgzNHYtMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-10" />
          
          {/* Decorative circles */}
          <div className="absolute top-20 left-10 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-10 right-10 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-10 right-1/3 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
          
          <div className="relative container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="text-left md:w-1/2 mb-10 md:mb-0">
                <GraduationCap className="w-16 h-16 mb-6 animate-bounce" />
                <h1 className="text-4xl md:text-6xl font-bold mb-6">
                  Plan Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 to-purple-200">Academic Journey</span>
                </h1>
                <p className="text-xl text-indigo-100 mb-8 leading-relaxed">
                  Make informed decisions about your course selection with our intelligent recommendation system designed for today's students.
                </p>
                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={handleGetStarted}
                    className="group relative overflow-hidden bg-white text-indigo-600 hover:text-white px-8 py-4 rounded-lg text-lg font-bold shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-105 border-2 border-white"
                  >
                    <span className="relative z-10">Get Started</span>
                    <span className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></span>
                    <ArrowRight className="inline-block ml-2 relative z-10 group-hover:translate-x-2 transition-transform duration-300" />
                  </button>
                  <button 
                    onClick={() => navigate('/login')}
                    className="px-8 py-4 rounded-lg text-lg font-bold text-white border-2 border-white/50 hover:bg-white/10 transition-all duration-300"
                  >
                    Login
                  </button>
                </div>
                
                {/* Trust indicators */}
                <div className="mt-12 flex items-center gap-6 text-indigo-100/90">
                  <div className="flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    <span>200+ Students</span>
                  </div>
                  <div className="flex items-center">
                    <BookOpen className="w-5 h-5 mr-2" />
                    <span>100+ Courses</span>
                  </div>
                  <div className="flex items-center">
                    <Star className="w-5 h-5 mr-2" />
                    <span>4.5/5 Rating</span>
                  </div>
                </div>
              </div>
              
              {/* Hero image/floating cards */}
              <div className="md:w-1/2 relative">
                <style dangerouslySetInnerHTML={{ __html: animationStyles }} />
                <div className="relative w-full h-96">
                  {/* Main card */}
                  <div className="absolute top-0 right-0 w-72 bg-white rounded-xl shadow-2xl p-4 z-30 transform rotate-3 transition-all duration-500 hover:-translate-y-2 hover:rotate-0 animate-float">
                    <div className="bg-indigo-50 rounded-lg p-2 mb-3">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 mr-3">
                          <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-white" />
                          </div>
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-indigo-900">Course Recommendations</h3>
                          <p className="text-xs text-indigo-600">Personalized for your profile</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="rounded-lg bg-indigo-100/50 h-6 w-full"></div>
                      <div className="rounded-lg bg-indigo-100/50 h-6 w-3/4"></div>
                      <div className="rounded-lg bg-indigo-100/50 h-6 w-5/6"></div>
                    </div>
                  </div>
                  
                  {/* Secondary cards */}
                  <div className="absolute top-32 left-0 w-64 bg-white rounded-xl shadow-xl p-4 z-20 transform -rotate-6 transition-all duration-500 hover:-translate-y-2 hover:rotate-0">
                    <div className="bg-amber-50 rounded-lg p-2 mb-3">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 mr-3">
                          <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center">
                            <Star className="w-5 h-5 text-white" />
                          </div>
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-amber-900">Course Reviews</h3>
                          <p className="text-xs text-amber-600">From verified students</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="w-5 h-5 text-amber-400" fill="#FFC107" />
                      ))}
                    </div>
                  </div>
                  
                  <div className="absolute bottom-0 right-20 w-60 bg-white rounded-xl shadow-xl p-4 z-10 transform rotate-6 transition-all duration-500 hover:-translate-y-2 hover:rotate-0">
                    <div className="bg-green-50 rounded-lg p-2 mb-3">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 mr-3">
                          <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-white" />
                          </div>
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-green-900">Timetable</h3>
                          <p className="text-xs text-green-600">Conflict-free scheduling</p>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-5 gap-1">
                      {Array.from({ length: 15 }).map((_, i) => (
                        <div key={i} className={`h-3 rounded-sm ${i % 3 === 0 ? 'bg-green-200' : 'bg-gray-100'}`}></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Wave separator - rotated */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" fill="none" style={{ transform: 'rotate(180deg)', display: 'block' }}>
              <path fillRule="evenodd" clipRule="evenodd" d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 70C840 80 960 100 1080 100C1200 100 1320 80 1380 70L1440 60V0H0V120Z" fill="white" />
            </svg>
          </div>
        </section>
        
        {/* How it Works - Zigzag Layout */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 inline-block">How CourseWise Works</h2>
              <p className="text-gray-600 mt-3 max-w-2xl mx-auto">Our platform simplifies academic planning through an intuitive process</p>
            </div>
            
            <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-100/60 overflow-hidden">
              <div className="divide-y divide-gray-100">
                {[
                  {
                    title: 'Create Profile',
                    description: 'Sign up and tell us about your academic interests and goals. We use this information to personalize your experience and provide tailored recommendations.',
                    icon: Users,
                    color: 'bg-indigo-100 text-indigo-600',
                    iconBg: 'from-indigo-500 to-blue-500'
                  },
                  {
                    title: 'Get Recommendations',
                    description: 'Receive personalized course suggestions based on your profile, interests, and academic history. Our intelligent system matches you with courses that align with your goals.',
                    icon: Sparkles,
                    color: 'bg-purple-100 text-purple-600',
                    iconBg: 'from-purple-500 to-indigo-500'
                  },
                  {
                    title: 'Plan Schedule',
                    description: 'Organize your timetable without conflicts and optimize your learning path. Visualize your weekly schedule and make adjustments to find the perfect balance.',
                    icon: Calendar,
                    color: 'bg-green-100 text-green-600',
                    iconBg: 'from-green-500 to-emerald-500'
                  }
                ].map((step, index) => (
                  <div key={index} className={`flex flex-col ${index % 2 === 1 ? 'md:flex-row-reverse' : 'md:flex-row'} p-6 md:p-8`}>
                    <div className="md:w-1/3 flex justify-center mb-6 md:mb-0">
                      <div className={`w-36 h-36 rounded-2xl bg-gradient-to-br ${step.iconBg} flex items-center justify-center transform transition-all duration-300 hover:scale-110 shadow-lg`}>
                        <step.icon className="w-16 h-16 text-white" />
                      </div>
                    </div>
                    <div className="md:w-2/3 flex flex-col justify-center md:px-8">
                      <h3 className="text-2xl font-bold text-gray-800 mb-4">{index + 1}. {step.title}</h3>
                      <p className="text-gray-600 text-lg leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Services section with feature showcase */}
        <section className="py-16 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-100 rounded-full opacity-40 -mr-32 -mt-32 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-100 rounded-full opacity-40 -ml-32 -mb-32 blur-3xl"></div>
          <div className="absolute top-1/3 left-1/3 w-72 h-72 bg-blue-100 rounded-full opacity-30 blur-3xl"></div>
          
          <div className="container mx-auto px-6 relative z-10">
            <div className="flex flex-col md:flex-row items-center justify-between mb-10">
              <div className="md:w-1/2 mb-6 md:mb-0">
                <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 mb-4">Powerful Academic Tools</h2>
                <p className="text-gray-600 text-lg max-w-lg">Our suite of intelligent services helps you navigate your academic journey with confidence and clarity.</p>
              </div>
              <div className="md:w-1/2 flex justify-end">
                <button 
                  onClick={() => navigate('/academic-tools')}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg
                    shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  Explore All Features
                  <ArrowRight className="ml-2 h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100/60 p-6 md:p-8">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {features.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <div
                      key={index}
                      onClick={() => navigate('/academic-tools')}
                      className={`group relative bg-gradient-to-br from-indigo-50/50 to-purple-50/50 p-6 rounded-xl overflow-hidden shadow-md cursor-pointer 
                                transform transition-all duration-300 ease-in-out hover:-translate-y-2 
                                hover:shadow-xl border border-gray-100/80 animate-float animation-delay-${index * 2000}`}
                    >
                      {/* Gradient background that reveals on hover */}
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/90 to-purple-500/90 
                                    opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                      
                      {/* Top decoration */}
                      <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-100/80 rounded-bl-full -mt-6 -mr-6 
                                    group-hover:bg-white/10 transition-all duration-300"></div>
                      
                      {/* Content */}
                      <div className="relative z-10">
                        <div className="w-14 h-14 rounded-xl mb-4 flex items-center justify-center
                          bg-gradient-to-br from-indigo-500 to-purple-600 text-white
                          shadow-lg group-hover:scale-110 transition-all duration-300"
                        >
                          <Icon className="w-7 h-7" />
                        </div>
                        
                        <h3 className="text-xl font-bold text-gray-800 mb-2 
                                    group-hover:text-white transition-colors">
                          {feature.title}
                        </h3>
                        
                        <p className="text-gray-600 mb-4
                                    group-hover:text-white/90 transition-colors">
                          {feature.description}
                        </p>
                        
                        <div className="flex items-center text-indigo-600 font-medium
                                      group-hover:text-white transition-colors">
                          <span>Learn more</span>
                          <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
        
        {/* Enhanced Developers Showcase - Full Width */}
        <section className="py-16 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-60 right-10 w-96 h-96 bg-indigo-50 rounded-full opacity-70 blur-3xl"></div>
            <div className="absolute top-20 -left-20 w-80 h-80 bg-purple-50 rounded-full opacity-70 blur-3xl"></div>
            <div className="absolute bottom-0 right-1/4 w-60 h-60 bg-blue-50 rounded-full opacity-70 blur-3xl"></div>
          </div>
          
          <div className="container mx-auto px-6 relative z-10">
            <div className="text-center mb-10">
              <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 inline-block mb-4">Meet Our Developers</h2>
              <p className="text-gray-600 max-w-2xl mx-auto text-lg">The talented team behind CourseWise's innovative features and user experience</p>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100/60 overflow-hidden">
              <div className="mb-8 px-6 pt-6">
                {/* Desktop carousel with dots */}
                <div className="relative">
                  <div className="overflow-hidden mx-auto">
                    <div className="relative h-72 -mx-4">
                      {testimonials.map((testimonial, index) => (
                        <div
                          key={index}
                          className={`absolute inset-0 transition-all duration-700 ease-in-out px-4 ${
                            index === activeTestimonial
                              ? 'opacity-100 translate-x-0 z-20'
                              : index === (activeTestimonial + 1) % testimonials.length
                              ? 'opacity-0 translate-x-full z-10'
                              : 'opacity-0 -translate-x-full z-10'
                          }`}
                        >
                          <div className="bg-gradient-to-br from-indigo-50/30 to-purple-50/30 rounded-xl p-6 md:p-8 h-full transform transition-transform duration-500 hover:scale-[1.01] border border-indigo-100/30">
                            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 h-full">
                              <div className="flex-shrink-0">
                                <div className="relative group">
                                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full blur-md opacity-70 group-hover:opacity-100 transition-opacity duration-300"></div>
                                  <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg">
                                    <testimonial.image className="w-full h-full rounded-full object-cover" />
                                  </div>
                                </div>
                                <div className="mt-2 flex justify-center space-x-2">
                                  <a href="#" className="w-8 h-8 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-colors">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path></svg>
                                  </a>
                                  <a href="#" className="w-8 h-8 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-colors">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"></path></svg>
                                  </a>
                                  <a href="#" className="w-8 h-8 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-colors">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c5.51 0 10-4.48 10-10S17.51 2 12 2zm6.605 4.61a8.502 8.502 0 011.93 5.314c-.281-.054-3.101-.629-5.943-.271-.065-.141-.12-.293-.184-.445a25.416 25.416 0 00-.564-1.236c3.145-1.28 4.577-3.124 4.761-3.362zM12 3.475c2.17 0 4.154.813 5.662 2.148-.152.216-1.443 1.941-4.48 3.08-1.399-2.57-2.95-4.675-3.189-5A8.687 8.687 0 0112 3.475zm-3.633.803a53.896 53.896 0 013.167 4.935c-3.992 1.063-7.517 1.04-7.896 1.04a8.581 8.581 0 014.729-5.975zM3.453 12.01v-.26c.37.01 4.512.065 8.775-1.215.25.477.477.965.694 1.453-.109.033-.228.065-.336.098-4.404 1.42-6.747 5.303-6.942 5.629a8.522 8.522 0 01-2.19-5.705zM12 20.547a8.482 8.482 0 01-5.239-1.8c.152-.315 1.888-3.656 6.703-5.337.022-.01.033-.01.054-.022a35.318 35.318 0 011.823 6.475 8.4 8.4 0 01-3.341.684zm4.761-1.465c-.086-.52-.542-3.015-1.659-6.084 2.679-.423 5.022.271 5.314.369a8.468 8.468 0 01-3.655 5.715z" clipRule="evenodd"></path></svg>
                                  </a>
                                </div>
                              </div>
                              <div className="flex-1 flex flex-col justify-between h-full">
                                <div>
                                  <div className="flex items-center mb-4">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <Star key={star} className="w-5 h-5 text-yellow-400" fill="#FACC15" />
                                    ))}
                                  </div>
                                  <p className="text-gray-700 text-lg italic leading-relaxed mb-6">"{testimonial.text}"</p>
                                </div>
                                <div>
                                  <h3 className="text-xl font-bold text-indigo-700">{testimonial.name}</h3>
                                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Previous/Next buttons */}
                  <button 
                    className="absolute top-1/2 -left-4 transform -translate-y-1/2 bg-white p-3 rounded-full shadow-lg text-indigo-600 hover:text-white hover:bg-indigo-600 transition-colors z-30"
                    onClick={() => setActiveTestimonial((activeTestimonial - 1 + testimonials.length) % testimonials.length)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button 
                    className="absolute top-1/2 -right-4 transform -translate-y-1/2 bg-white p-3 rounded-full shadow-lg text-indigo-600 hover:text-white hover:bg-indigo-600 transition-colors z-30"
                    onClick={() => setActiveTestimonial((activeTestimonial + 1) % testimonials.length)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="flex justify-center space-x-3 pb-6">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveTestimonial(index)}
                    className={`transition-all duration-300 ${
                      index === activeTestimonial
                        ? 'w-10 h-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full shadow-md'
                        : 'w-3 h-3 bg-gray-300 rounded-full hover:bg-gray-400'
                    }`}
                    aria-label={`View testimonial ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section - In a box */}
        <section className="py-16 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM2MzY2ZjEiIGZpbGwtb3BhY2l0eT0iMC4wNCI+PHBhdGggZD0iTTM2IDM0aDRWMGgtNHYzNHptMCAyNmg0di0yaC00djJ6bTAtMyBoNHYtMmgtNHYyem0wLTNoNHYtMmgtNHYyek0wIDRjMC0yLjIxIDEuNzktNCA0LTRoNTJjMi4yMSAwIDQgMS43OSA0IDR2NTJjMCAyLjIxLTEuNzkgNC00IDRINGMtMi4yMSAwLTQtMS43OS00LTRWNHptNCAwdjUyaDUyVjRINHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-5"></div>
          
          <div className="container mx-auto px-6 relative z-10">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 inline-block mb-4">Why Students Choose CourseWise</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">Our platform has helped thousands of students make better academic choices</p>
            </div>
            
            <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-2xl shadow-xl overflow-hidden relative">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzBoLTJWMGgydjMwem0tMiAwSDJ2MmgzMnYtMnptMCAydjI4aDJ2LTI4aC0yem0yLTJ2LTNoLTJ2M2gyem0tMiAwSDB2MmgzNHYtMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-10"></div>
              <div className="absolute top-0 left-0 w-full h-12 bg-gradient-to-b from-white to-transparent opacity-20"></div>
              
              <div className="px-6 py-12 text-white relative">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
                  {[
                    { number: '90%', label: 'Student Satisfaction', icon: Star },
                    { number: '500+', label: 'Active Students', icon: Users },
                    { number: '100+', label: 'Courses Available', icon: BookOpen },
                    { number: '0+', label: 'Partner Colleges', icon: GraduationCap }
                  ].map((stat, index) => (
                    <div key={index} className="text-center" style={{animationDelay: `${index * 200}ms`}}>
                      <div className={`w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 transform transition-all duration-500 hover:scale-110 hover:bg-white/20 ${index % 2 === 0 ? 'animate-float' : 'animate-float-delay-2'}`}>
                        <stat.icon className="w-8 h-8 text-white" />
                      </div>
                      <div className="text-4xl font-bold mb-1 animate-pulse-slow">{stat.number}</div>
                      <div className="text-indigo-100">{stat.label}</div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-10 max-w-3xl mx-auto text-center">
                  <blockquote className="text-xl italic">
                    "CourseWise has revolutionized how students plan their academic journey, 
                    making course selection a strategic decision rather than a guessing game."
                  </blockquote>
                  <div className="mt-4">
                    <p className="font-bold">Academic Affairs Office</p>
                    <p className="text-indigo-200">Indraprastha Institue of Information & Technology, New Delhi</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white mt-auto">
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              {/* Logo and Contact */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="w-8 h-8" />
                  <span className="text-2xl font-bold">CourseWise</span>
                </div>
                <div className="text-indigo-200">
                  <p className="mb-2">Empowering students with:</p>
                  <div className="flex items-center gap-2 mb-1">
                    <span>100+ Available Courses</span>
                  </div>
                  {/* <div className="flex items-center gap-2 mb-1">
                    <span>50+ Colleges across India</span>
                  </div> */}
                  <div className="flex items-center gap-2">
                    <span>90% Student Satisfaction</span>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div>
                <h3 className="font-semibold mb-4">Contact Us</h3>
                <div className="text-indigo-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="w-4 h-4" />
                    <span>support@coursewise.com</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>+91 9351415734</span>
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <h3 className="font-semibold mb-4">Quick Links</h3>
                <div className="grid gap-2">
                  <Link to="/" className="text-indigo-200 hover:text-white transition-colors">Home</Link>
                  <Link to="/academic-tools" className="text-indigo-200 hover:text-white transition-colors">Academic Tools</Link>
                  <Link to="/login" className="text-indigo-200 hover:text-white transition-colors">Login</Link>
                </div>
              </div>

              {/* Features */}
              <div>
                <h3 className="font-semibold mb-4">Features</h3>
                <div className="grid gap-2">
                  <Link to="/course-recommendation" className="text-indigo-200 hover:text-white transition-colors">
                    Course Recommendations
                  </Link>
                  <Link to="/timetable-maker" className="text-indigo-200 hover:text-white transition-colors">
                    Timetable Generator
                  </Link>
                  <Link to="/course-reviews" className="text-indigo-200 hover:text-white transition-colors">
                    Course Reviews
                  </Link>
                  <Link to="/tt-clash-checker" className="text-indigo-200 hover:text-white transition-colors">
                    Clash Checker
                  </Link>
                </div>
              </div>
            </div>

            <div className="border-t border-indigo-500/30 mt-8 pt-8 text-center text-indigo-200">
              <p>© {new Date().getFullYear()} CourseWise. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
} 