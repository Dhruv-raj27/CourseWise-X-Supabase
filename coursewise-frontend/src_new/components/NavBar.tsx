import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Link } from 'react-router-dom';
import { BookOpen, UserCircle, ChevronDown, Menu, X } from 'lucide-react';
import { MenuButton, MenuList, MenuItem } from '@chakra-ui/react';
import { supabase } from '../lib/supabase';

const NavBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const { session } = useAuth();
  const toast = useToast();

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/');
      toast({
        title: 'Logged out successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error logging out:', error);
      toast({
        title: 'Error logging out',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className={`${scrolled ? 'shadow-md py-2' : 'py-4'} transition-all duration-300 sticky top-0 z-50 bg-gradient-to-r from-indigo-700 to-purple-700`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 cursor-pointer" onClick={() => navigate('/')}>
              <div className="flex items-center gap-2">
                <div className="bg-white p-2 rounded-full shadow-lg">
                  <BookOpen className="h-6 w-6 text-indigo-600" />
                </div>
                <span className="text-white font-bold text-xl">CourseWise</span>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-center space-x-4">
                <Link
                  to="/"
                  className={`${
                    isActive('/') 
                      ? 'bg-white/20 text-white font-medium backdrop-blur-sm shadow-inner'
                      : 'text-white/90 hover:bg-white/10 hover:text-white'
                  } px-4 py-2 rounded-md text-sm font-medium transition-all duration-200`}
                >
                  Home
                </Link>
                <Link
                  to="/academic-tools"
                  className={`${
                    isActive('/academic-tools') || location.pathname.includes('/academic-tools')
                      ? 'bg-white/20 text-white font-medium backdrop-blur-sm shadow-inner'
                      : 'text-white/90 hover:bg-white/10 hover:text-white'
                  } px-4 py-2 rounded-md text-sm font-medium transition-all duration-200`}
                >
                  Academic Tools
                </Link>
                <Link
                  to="/about"
                  className={`${
                    isActive('/about')
                      ? 'bg-white/20 text-white font-medium backdrop-blur-sm shadow-inner'
                      : 'text-white/90 hover:bg-white/10 hover:text-white'
                  } px-4 py-2 rounded-md text-sm font-medium transition-all duration-200`}
                >
                  About
                </Link>
                {session?.user && (
                  <Link
                    to="/dashboard"
                    className={`${
                      isActive('/dashboard')
                        ? 'bg-white/20 text-white font-medium backdrop-blur-sm shadow-inner'
                        : 'text-white/90 hover:bg-white/10 hover:text-white'
                    } px-4 py-2 rounded-md text-sm font-medium transition-all duration-200`}
                  >
                    Dashboard
                  </Link>
                )}
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              {session?.user ? (
                <div className="relative ml-3">
                  <Menu>
                    <MenuButton className="flex items-center gap-2 max-w-xs bg-white/10 backdrop-blur-sm rounded-full px-3 py-1 text-sm text-white hover:bg-white/20 transition-all duration-200">
                      <UserCircle className="h-6 w-6" aria-hidden="true" />
                      <span className="truncate max-w-[150px]">{session.user.email}</span>
                      <ChevronDown className="h-4 w-4" />
                    </MenuButton>
                    <MenuList>
                      <MenuItem onClick={() => navigate('/profile')}>Profile</MenuItem>
                      <MenuItem onClick={handleLogout}>Sign out</MenuItem>
                    </MenuList>
                  </Menu>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-md text-sm font-medium bg-white text-indigo-600 hover:bg-opacity-90 transition-colors shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600"
                >
                  Sign in
                </Link>
              )}
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={toggleMenu}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-indigo-500 focus:outline-none"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`${
          isOpen ? 'block' : 'hidden'
        } md:hidden absolute w-full bg-indigo-800 shadow-lg transition-all duration-200 ease-in-out z-10`}
        id="mobile-menu"
      >
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link
            to="/"
            className={`${
              isActive('/') 
                ? 'bg-indigo-900 text-white' 
                : 'text-white hover:bg-indigo-600'
            } block px-3 py-2 rounded-md text-base font-medium`}
            onClick={toggleMenu}
          >
            Home
          </Link>
          <Link
            to="/academic-tools"
            className={`${
              isActive('/academic-tools') || location.pathname.includes('/academic-tools')
                ? 'bg-indigo-900 text-white' 
                : 'text-white hover:bg-indigo-600'
            } block px-3 py-2 rounded-md text-base font-medium`}
            onClick={toggleMenu}
          >
            Academic Tools
          </Link>
          <Link
            to="/about"
            className={`${
              isActive('/about') 
                ? 'bg-indigo-900 text-white' 
                : 'text-white hover:bg-indigo-600'
            } block px-3 py-2 rounded-md text-base font-medium`}
            onClick={toggleMenu}
          >
            About
          </Link>
          {session?.user && (
            <Link
              to="/dashboard"
              className={`${
                isActive('/dashboard') 
                  ? 'bg-indigo-900 text-white' 
                  : 'text-white hover:bg-indigo-600'
              } block px-3 py-2 rounded-md text-base font-medium`}
              onClick={toggleMenu}
            >
              Dashboard
            </Link>
          )}
        </div>
        <div className="pt-4 pb-3 border-t border-indigo-600">
          {session?.user ? (
            <div className="flex items-center px-5">
              <div className="flex-shrink-0">
                <UserCircle className="h-10 w-10 text-white" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-white">{session.user.email}</div>
              </div>
            </div>
          ) : (
            <div className="px-4 py-2">
              <Link
                to="/login"
                className="block text-center w-full px-4 py-2 rounded-md text-sm font-medium bg-white text-indigo-600 hover:bg-gray-100"
                onClick={toggleMenu}
              >
                Sign in
              </Link>
            </div>
          )}
          <div className="mt-3 px-2 space-y-1">
            {session?.user && (
              <>
                <Link
                  to="/profile"
                  className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-indigo-600"
                  onClick={toggleMenu}
                >
                  Profile
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    toggleMenu();
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white hover:bg-indigo-600"
                >
                  Sign out
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar; 