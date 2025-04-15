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
  Phone 
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
    <div className="flex flex-col min-h-screen">
      <NavBar />
      <div className="flex-grow space-y-16 py-0">
        {/* Hero Section */}
        <section className={`relative bg-gradient-to-br from-indigo-600 to-purple-700 text-white py-24 rounded-none overflow-hidden transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzBoLTJWMGgydjMwem0tMiAwSDJ2MmgzMnYtMnptMCAydjI4aDJ2LTI4aC0yem0yLTJ2LTNoLTJ2M2gyem0tMiAwSDB2MmgzNHYtMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-10" />
          <div className="relative container mx-auto px-4 text-center">
            <GraduationCap className="w-16 h-16 mx-auto mb-6 animate-bounce" />
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Plan Your Academic Journey
            </h1>
            <p className="text-xl md:text-2xl text-indigo-100 mb-8 max-w-2xl mx-auto">
              Make informed decisions about your course selection with our intelligent recommendation system.
            </p>
            <button
              onClick={handleGetStarted}
              className="group relative overflow-hidden bg-white text-indigo-600 hover:text-white px-8 py-4 rounded-lg text-lg font-bold shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-105 border-2 border-white"
            >
              <span className="relative z-10">Get Started</span>
              <span className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></span>
              <ArrowRight className="inline-block ml-2 relative z-10 group-hover:translate-x-2 transition-transform duration-300" />
            </button>
          </div>
        </section>

        {/* Services section */}
        <div className="container mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold text-center mb-12">Our Services</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  onClick={() => navigate('/academic-tools')}
                  className="group relative bg-white p-6 rounded-lg shadow-md cursor-pointer
                            transform transition-all duration-300 ease-in-out
                            hover:-translate-y-2 hover:shadow-xl"
                >
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 
                                opacity-0 group-hover:opacity-100 transition-opacity duration-300 
                                rounded-lg"
                  />
                  
                  {/* Content */}
                  <div className="relative z-10">
                    <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-lg 
                                  bg-indigo-100 text-indigo-600 group-hover:bg-white/20 
                                  group-hover:text-white transition-all duration-300">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 
                                group-hover:text-white transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 text-sm 
                              group-hover:text-white/90 transition-colors">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Testimonials Section */}
        <section className="bg-gray-50 py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">What Our Users Say</h2>
            <div className="relative h-64">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className={`absolute top-0 left-0 w-full transition-all duration-500 ${
                    index === activeTestimonial
                      ? 'opacity-100 translate-x-0'
                      : 'opacity-0 translate-x-full'
                  }`}
                >
                  <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
                    <div className="mb-4">
                      <testimonial.image className="w-16 h-16 rounded-full shadow-md" />
                    </div>
                    <p className="text-lg text-gray-700 mb-4">"{testimonial.text}"</p>
                    <h3 className="font-semibold">{testimonial.name}</h3>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-center space-x-2 mt-4">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === activeTestimonial
                      ? 'bg-indigo-600 w-4'
                      : 'bg-gray-300'
                  }`}
                />
              ))}
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
                  <div className="flex items-center gap-2 mb-1">
                    <span>50+ Colleges across India</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>95% Student Satisfaction</span>
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