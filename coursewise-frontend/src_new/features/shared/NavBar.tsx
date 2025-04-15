import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, Menu, X, LogOut, User, Home, GraduationCap, Layout, Info } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const NavBar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);

      // Check if admin
      if (session) {
        const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
        setIsAdmin(session.user.email === adminEmail);
      }
      
      setLoading(false);
    };
    
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
      
      // Check if admin
      if (session) {
        const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
        setIsAdmin(session.user.email === adminEmail);
      } else {
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Define nav items
  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/academic-tools', label: 'Academic Tools', icon: BookOpen },
    { path: '/about', label: 'About', icon: Info },
  ];

  // Add dashboard to nav items if user is logged in
  if (isLoggedIn) {
    navItems.push({ path: '/dashboard', label: 'Dashboard', icon: Layout });
  }

  // Add admin dashboard if user is admin
  if (isAdmin) {
    navItems.push({ path: '/admin/dashboard', label: 'Admin', icon: Layout });
  }

  if (loading) {
    return (
      <nav className="sticky top-0 z-50 bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-700 text-white shadow-md py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <GraduationCap className="h-8 w-8" />
              <span className="text-xl font-bold">CourseWise</span>
            </Link>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-gradient-to-r from-indigo-700/95 via-indigo-600/95 to-purple-700/95 text-white shadow-lg py-4 relative">
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDMwaC0yVjBoMnYzMHptLTIgMEgydjJoMzJ2LTJ6bTAgMnYyOGgydi0yOGgtMnptMi0ydi0zaC0ydjNoMnptLTIgMEgwdjJoMzR2LTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="bg-white/15 p-2 rounded-full transition-all duration-300 group-hover:bg-white/25 group-hover:scale-105 shadow-lg">
              <GraduationCap className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-100">CourseWise</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link 
                key={item.path}
                to={item.path} 
                className={`${isActive(item.path) 
                  ? 'bg-white/20 text-white font-medium shadow-lg border-b-2 border-white/40' 
                  : 'text-white/90 hover:bg-white/15 hover:border-b-2 hover:border-white/30'
                } px-4 py-2 rounded-md flex items-center space-x-2 transition-all duration-300 backdrop-blur-sm`}
              >
                <item.icon className={`w-4 h-4 ${isActive(item.path) ? 'text-white' : 'text-white/80'}`} />
                <span>{item.label}</span>
              </Link>
            ))}
            
            {isLoggedIn ? (
              <button 
                onClick={handleSignOut}
                className="ml-2 text-white/90 hover:bg-white/15 px-4 py-2 rounded-md flex items-center space-x-2 transition-all duration-300 backdrop-blur-sm hover:shadow-lg"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            ) : (
              <Link 
                to="/login" 
                className="ml-2 bg-white/15 text-white px-4 py-2 rounded-md flex items-center space-x-2 transition-all duration-300 hover:bg-white/25 hover:shadow-lg backdrop-blur-sm border border-white/10"
              >
                <User className="w-4 h-4" />
                <span>Sign In</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={toggleMenu} className="text-white bg-white/15 p-2 rounded-md hover:bg-white/25 transition-all duration-300 shadow-md hover:shadow-lg">
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden mt-4 py-2 border-t border-white/20 backdrop-blur-md bg-indigo-700/60 rounded-lg shadow-xl">
            <div className="flex flex-col space-y-2 p-2">
              {navItems.map((item) => (
                <Link 
                  key={item.path}
                  to={item.path} 
                  className={`${isActive(item.path) 
                    ? 'bg-white/20 text-white font-medium shadow-md border-l-4 border-white/40' 
                    : 'text-white/90 hover:bg-white/15 hover:border-l-4 hover:border-white/30'
                  } px-4 py-3 rounded-md flex items-center space-x-3 transition-all duration-300`}
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              ))}
              
              {isLoggedIn ? (
                <button 
                  onClick={() => {
                    handleSignOut();
                    setIsOpen(false);
                  }}
                  className="text-white/90 hover:bg-white/15 px-4 py-3 rounded-md flex items-center space-x-3 transition-all duration-300 text-left hover:shadow-md"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Sign Out</span>
                </button>
              ) : (
                <Link 
                  to="/login" 
                  className="bg-white/15 text-white px-4 py-3 rounded-md flex items-center space-x-3 transition-all duration-300 hover:bg-white/25 shadow-md hover:shadow-lg border border-white/10"
                  onClick={() => setIsOpen(false)}
                >
                  <User className="w-5 h-5" />
                  <span>Sign In</span>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavBar; 