import { Link, useLocation } from 'react-router-dom';
import { GraduationCap, LogIn, User, Home, Info, BookOpen, Layout } from 'lucide-react';

interface NavbarProps {
  user: { name: string } | null;
  onLogout: () => void;
}

export default function Navbar({ user, onLogout }: NavbarProps) {
  const location = useLocation();
  const currentPath = location.pathname;

  // Define nav items - Dashboard only shows when user is logged in
  const navItems = [
    { id: '/', label: 'Home', icon: Home },
    { id: '/courses', label: 'Academic Tools', icon: BookOpen },
    { id: '/about', label: 'About', icon: Info },
  ];

  // Add dashboard if user is logged in
  if (user) {
    navItems.push(
      { id: '/dashboard', label: 'Dashboard', icon: Layout }
    );
  }

  return (
    <header className="bg-indigo-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center h-16">
          <Link to="/" className="flex items-center space-x-3">
            <GraduationCap className="w-8 h-8" />
            <span className="text-xl font-bold">CourseWise</span>
          </Link>

          <nav className="flex-1 flex justify-center space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  to={item.id}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium
                    ${currentPath === item.id
                      ? 'bg-indigo-700 text-white'
                      : 'text-indigo-100 hover:bg-indigo-500'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center">
            {user ? (
              <button
                onClick={onLogout}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-indigo-100 hover:bg-indigo-500 rounded-md"
              >
                <User className="w-4 h-4" />
                <span>Logout</span>
              </button>
            ) : (
              <Link
                to="/login"
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-indigo-100 hover:bg-indigo-500 rounded-md"
              >
                <LogIn className="w-4 h-4" />
                <span>Login</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}