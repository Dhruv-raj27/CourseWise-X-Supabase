import React, { useState, useEffect } from 'react';
import { 
  User as UserIcon, Mail, Phone,  GraduationCap, 
  Settings, Clock, BookOpen, Trophy, 
   Star
} from 'lucide-react';
import { User } from '../types';
import { useNavigate } from 'react-router-dom';

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
  const userData = user || JSON.parse(localStorage.getItem('user') || 'null');
  
  const [formData, setFormData] = useState({
    name: userData.name || '',
    email: userData.email || '',
    phone: '',
    bio: '',
    department: (userData as any).branch || '',
    semester: (userData as any).semester || '',
    notifications: true,
    emailUpdates: true,
    twoFactorAuth: false
  });

  const mockCourses = [
    { id: 1, name: 'Data Structures', progress: 75, grade: 'A', status: 'In Progress' },
    { id: 2, name: 'Algorithm Analysis', progress: 90, grade: 'A+', status: 'Completed' },
    { id: 3, name: 'Database Systems', progress: 60, grade: 'B+', status: 'In Progress' },
  ];

  const mockAchievements = [
    { id: 1, title: 'Perfect Attendance', date: '2024-03-15', icon: Clock },
    { id: 2, title: 'Top Performer', date: '2024-02-20', icon: Trophy },
    { id: 3, title: 'Course Excellence', date: '2024-01-10', icon: Star },
  ];

  useEffect(() => {
    if (!userData) {
      navigate('/login');
    }
  }, [userData, navigate]);

  if (!userData) {
    return <div>Loading...</div>;
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
                      title="Full Name"
                      placeholder="Enter your full name"
                      className="pl-10 w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
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
                      title="Email Address"
                      placeholder="Enter your email address"
                      className="pl-10 w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
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
                      title="Phone Number"
                      placeholder="Enter your phone number"
                      className="pl-10 w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
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
                      title="Department"
                      placeholder="Enter your department"
                      className="pl-10 w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
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
                  title="Bio"
                  placeholder="Tell us about yourself"
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
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
            <h2 className="text-2xl font-bold mb-6">My Courses</h2>
            <div className="grid gap-6">
              {mockCourses.map(course => (
                <div key={course.id} className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">{course.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      course.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {course.status}
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Progress</span>
                      <span>{course.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-indigo-600 h-2 rounded-full" 
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center mt-4">
                      <span className="text-sm text-gray-600">Current Grade: {course.grade}</span>
                      <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'achievements':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-6">Achievements</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {mockAchievements.map(achievement => {
                const Icon = achievement.icon;
                return (
                  <div key={achievement.id} className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center space-x-4">
                      <div className="bg-indigo-100 p-3 rounded-full">
                        <Icon className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{achievement.title}</h3>
                        <p className="text-sm text-gray-600">Achieved on {achievement.date}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
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
                      title="Push Notifications"
                      className="sr-only peer"
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
                      title="Email Updates"
                      className="sr-only peer"
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
                      title="Two-Factor Authentication"
                      className="sr-only peer"
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