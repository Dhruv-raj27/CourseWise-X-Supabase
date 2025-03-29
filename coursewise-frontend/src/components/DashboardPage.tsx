import React, { useState, useEffect } from 'react';
import { 
  User as UserIcon, Mail, Phone, GraduationCap, 
  Settings, Clock, BookOpen, Trophy, Star,
  Plus, ArrowRight
} from 'lucide-react';
import { User } from '../types';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface DashboardPageProps {
  user?: {
    id: string;
    name: string;
    email: string;
    profilePicture?: string;
  };
}

export default function DashboardPage({ user }: DashboardPageProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  
  // Get user data from localStorage if not provided through props
  const [userData, setUserData] = useState(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) return null;
      return JSON.parse(storedUser);
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  });
  
  const [formData, setFormData] = useState({
    name: userData?.name || '',
    email: userData?.email || '',
    phone: '',
    bio: '',
    department: userData?.branch || '',
    semester: userData?.semester || '',
    notifications: true,
    emailUpdates: true,
    twoFactorAuth: false
  });

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session || !userData) {
          navigate('/login');
          return;
        }

        // Fetch latest user data from database
        const { data: latestUserData, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (error) {
          console.error('Error fetching user data:', error);
          return;
        }

        if (latestUserData) {
          const updatedUserData = {
            id: latestUserData.id,
            name: latestUserData.full_name,
            email: latestUserData.email,
            branch: latestUserData.branch,
            semester: latestUserData.semester,
            role: latestUserData.role
          };
          localStorage.setItem('user', JSON.stringify(updatedUserData));
          setUserData(updatedUserData);
          setFormData(prev => ({
            ...prev,
            name: latestUserData.full_name,
            email: latestUserData.email,
            department: latestUserData.branch,
            semester: latestUserData.semester
          }));
        }
      } catch (error) {
        console.error('Error checking user session:', error);
        navigate('/login');
      }
    };

    checkUser();
  }, [navigate]);

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-6">Profile Information</h2>
            <form onSubmit={(e) => { e.preventDefault(); setIsEditing(false); }}>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <div className="relative">
                    <UserIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      disabled={!isEditing}
                      className="pl-10 w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
                      aria-label="Full name"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <div className="relative">
                    <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled={!isEditing}
                      className="pl-10 w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
                      aria-label="Email address"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <div className="relative">
                    <Phone className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      disabled={!isEditing}
                      className="pl-10 w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
                      aria-label="Phone number"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                  <div className="relative">
                    <GraduationCap className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      disabled={!isEditing}
                      className="pl-10 w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
                      aria-label="Department"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  disabled={!isEditing}
                  rows={4}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
                  aria-label="Bio"
                />
              </div>
              {isEditing && (
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    Save Changes
                  </button>
                </div>
              )}
            </form>
          </div>
        );

      case 'courses':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">My Courses</h2>
              <button
                onClick={() => navigate('/course-questionnaire')}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                <Plus className="w-4 h-4" />
                Add Courses
              </button>
            </div>
            <div className="bg-white rounded-lg p-6 text-center">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Courses Yet</h3>
              <p className="text-gray-600 mb-6">Start your learning journey by adding courses to your dashboard.</p>
              <button
                onClick={() => navigate('/course-questionnaire')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Browse Courses
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        );

      case 'achievements':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-6">Achievements</h2>
            <div className="bg-white rounded-lg p-6 text-center">
              <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Achievements Yet</h3>
              <p className="text-gray-600">Complete courses and participate in activities to earn achievements.</p>
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold mb-6">Settings</h2>
            
            {/* Notification Settings */}
            <section className="space-y-4">
              <h3 className="text-lg font-semibold">Notifications</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Push Notifications</h4>
                    <p className="text-sm text-gray-600">Receive notifications about course updates</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={formData.notifications}
                      onChange={(e) => setFormData({ ...formData, notifications: e.target.checked })}
                      className="sr-only peer"
                      aria-label="Enable push notifications"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Email Updates</h4>
                    <p className="text-sm text-gray-600">Receive email notifications</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={formData.emailUpdates}
                      onChange={(e) => setFormData({ ...formData, emailUpdates: e.target.checked })}
                      className="sr-only peer"
                      aria-label="Enable email updates"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
              </div>
            </section>

            {/* Security Settings */}
            <section className="space-y-4">
              <h3 className="text-lg font-semibold">Security</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Two-Factor Authentication</h4>
                    <p className="text-sm text-gray-600">Add an extra layer of security</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={formData.twoFactorAuth}
                      onChange={(e) => setFormData({ ...formData, twoFactorAuth: e.target.checked })}
                      className="sr-only peer"
                      aria-label="Enable two-factor authentication"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
              </div>
            </section>

            {/* Account Settings */}
            <section className="space-y-4">
              <h3 className="text-lg font-semibold">Account</h3>
              <div className="space-y-4">
                <button className="text-red-600 hover:text-red-800 font-medium">
                  Delete Account
                </button>
              </div>
            </section>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-8 md:grid-cols-[240px,1fr]">
        {/* Sidebar */}
        <div className="bg-white rounded-lg shadow-md p-6 h-fit">
          <div className="text-center mb-6">
            <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserIcon className="w-12 h-12 text-indigo-600" />
            </div>
            <h2 className="text-xl font-semibold">{userData.name}</h2>
            <p className="text-gray-500">{userData.role}</p>
          </div>
          
          <div className="space-y-2">
            <button 
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center space-x-2 px-4 py-2 text-left rounded-md ${
                activeTab === 'profile' ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-gray-50'
              }`}
            >
              <UserIcon className="w-5 h-5" />
              <span>Profile</span>
            </button>
            <button 
              onClick={() => setActiveTab('courses')}
              className={`w-full flex items-center space-x-2 px-4 py-2 text-left rounded-md ${
                activeTab === 'courses' ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-gray-50'
              }`}
            >
              <BookOpen className="w-5 h-5" />
              <span>My Courses</span>
            </button>
            <button 
              onClick={() => setActiveTab('achievements')}
              className={`w-full flex items-center space-x-2 px-4 py-2 text-left rounded-md ${
                activeTab === 'achievements' ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-gray-50'
              }`}
            >
              <Trophy className="w-5 h-5" />
              <span>Achievements</span>
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center space-x-2 px-4 py-2 text-left rounded-md ${
                activeTab === 'settings' ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-gray-50'
              }`}
            >
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
} 