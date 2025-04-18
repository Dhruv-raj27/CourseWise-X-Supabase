import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { User } from '../../types';
import { motion } from 'framer-motion';
import { BookOpen, BarChart2, GraduationCap, Bell, User as UserIcon, Airplay } from 'lucide-react';
import UserProfile from './UserProfile';

interface TabItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [error, setError] = useState<string | null>(null);
  
  // Define tabs
  const tabs: TabItem[] = [
    { id: 'overview', label: 'Overview', icon: <Airplay size={20} /> },
    { id: 'profile', label: 'My Profile', icon: <UserIcon size={20} /> },
    { id: 'courses', label: 'My Courses', icon: <BookOpen size={20} /> },
    { id: 'progress', label: 'Academic Progress', icon: <BarChart2 size={20} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={20} /> },
  ];

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate('/login');
          return;
        }

        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (userError) {
          console.error('Error fetching user data:', userError);
          setError('Failed to load user data');
        } else if (userData) {
          setUser(userData as User);
        }
      } catch (error) {
        console.error('Error in dashboard:', error);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [navigate]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 text-center max-w-md w-full">
          <h3 className="text-xl font-semibold text-gray-700">User not found</h3>
          <p className="mt-2 text-gray-500">Please login to access your dashboard.</p>
          <button 
            onClick={() => navigate('/login')} 
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Welcome header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 md:p-8 mb-8 text-white"
        >
          <h1 className="text-2xl md:text-3xl font-bold">Welcome, {user.full_name || 'Student'}!</h1>
          <p className="mt-2 opacity-90">Manage your courses, track your progress, and customize your learning experience.</p>
        </motion.div>
        
        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100">
            {error}
          </div>
        )}
        
        {/* Tabs navigation */}
        <div className="mb-8">
          <div className="flex overflow-x-auto bg-white rounded-xl shadow-sm p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center px-4 py-3 whitespace-nowrap rounded-lg font-medium transition-colors ${
                  activeTab === tab.id 
                    ? 'bg-purple-100 text-purple-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* Tab content */}
        <div>
          {activeTab === 'overview' && <OverviewTab user={user} />}
          {activeTab === 'profile' && <UserProfile />}
          {activeTab === 'courses' && <CoursesTab user={user} />}
          {activeTab === 'progress' && <ProgressTab user={user} />}
          {activeTab === 'notifications' && <NotificationsTab user={user} />}
        </div>
      </div>
    </div>
  );
};

// Overview Tab Component
const OverviewTab: React.FC<{ user: User }> = ({ user }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {/* Current semester info */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <div className="flex items-center">
          <div className="p-3 bg-purple-100 rounded-full">
            <GraduationCap className="text-purple-600" size={24} />
          </div>
          <h2 className="ml-4 text-xl font-semibold text-gray-800">Current Semester</h2>
        </div>
        <div className="mt-4">
          <p className="text-gray-600">
            {user.semester ? `Semester ${user.semester}` : 'Not specified'}
          </p>
          <p className="mt-2 text-gray-600">
            {user.institution || 'Institution not specified'}
          </p>
        </div>
      </div>
      
      {/* Course stats */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <div className="flex items-center">
          <div className="p-3 bg-blue-100 rounded-full">
            <BookOpen className="text-blue-600" size={24} />
          </div>
          <h2 className="ml-4 text-xl font-semibold text-gray-800">Course Stats</h2>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-blue-800 font-semibold text-lg">5</p>
            <p className="text-blue-600 text-sm">Enrolled</p>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <p className="text-green-800 font-semibold text-lg">3</p>
            <p className="text-green-600 text-sm">Completed</p>
          </div>
          <div className="bg-amber-50 p-3 rounded-lg">
            <p className="text-amber-800 font-semibold text-lg">2</p>
            <p className="text-amber-600 text-sm">In Progress</p>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg">
            <p className="text-purple-800 font-semibold text-lg">15</p>
            <p className="text-purple-600 text-sm">Credits</p>
          </div>
        </div>
      </div>
      
      {/* Next assessments */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 md:col-span-2 lg:col-span-1">
        <div className="flex items-center">
          <div className="p-3 bg-amber-100 rounded-full">
            <BarChart2 className="text-amber-600" size={24} />
          </div>
          <h2 className="ml-4 text-xl font-semibold text-gray-800">Upcoming Deadlines</h2>
        </div>
        <div className="mt-4 space-y-3">
          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <div className="p-2 bg-red-100 rounded-md">
              <span className="text-red-600 font-semibold">May 15</span>
            </div>
            <div className="ml-3">
              <p className="text-gray-800 font-medium">Data Structures Assignment</p>
              <p className="text-gray-500 text-sm">CS201</p>
            </div>
          </div>
          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <div className="p-2 bg-amber-100 rounded-md">
              <span className="text-amber-600 font-semibold">May 20</span>
            </div>
            <div className="ml-3">
              <p className="text-gray-800 font-medium">Web Development Project</p>
              <p className="text-gray-500 text-sm">CS301</p>
            </div>
          </div>
          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <div className="p-2 bg-green-100 rounded-md">
              <span className="text-green-600 font-semibold">May 28</span>
            </div>
            <div className="ml-3">
              <p className="text-gray-800 font-medium">Algorithm Analysis Exam</p>
              <p className="text-gray-500 text-sm">CS202</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Course recommendations */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 md:col-span-2 lg:col-span-3">
        <div className="flex items-center">
          <div className="p-3 bg-green-100 rounded-full">
            <GraduationCap className="text-green-600" size={24} />
          </div>
          <h2 className="ml-4 text-xl font-semibold text-gray-800">Recommended Courses</h2>
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
            <div className="h-40 bg-gray-200">
              <img 
                src="https://images.unsplash.com/photo-1593720213428-28a5b9e94613?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80" 
                alt="Web Development" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-gray-800">Advanced Web Development</h3>
              <p className="text-gray-500 text-sm mt-1">Learn modern frontend frameworks and backend technologies</p>
              <div className="flex justify-between items-center mt-3">
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">CS301</span>
                <span className="text-gray-600 text-sm">4 credits</span>
              </div>
            </div>
          </div>
          <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
            <div className="h-40 bg-gray-200">
              <img 
                src="https://images.unsplash.com/photo-1507146153580-69a1fe6d8aa1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80" 
                alt="Machine Learning" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-gray-800">Introduction to Machine Learning</h3>
              <p className="text-gray-500 text-sm mt-1">Explore the fundamentals of ML algorithms and applications</p>
              <div className="flex justify-between items-center mt-3">
                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">CS401</span>
                <span className="text-gray-600 text-sm">3 credits</span>
              </div>
            </div>
          </div>
          <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
            <div className="h-40 bg-gray-200">
              <img 
                src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1774&q=80" 
                alt="Data Science" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-gray-800">Data Science Fundamentals</h3>
              <p className="text-gray-500 text-sm mt-1">Learn data analysis, visualization, and statistical methods</p>
              <div className="flex justify-between items-center mt-3">
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">CS302</span>
                <span className="text-gray-600 text-sm">4 credits</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// My Courses Tab Component
const CoursesTab: React.FC<{ user: User }> = ({ user }) => {
  const [courses, setCourses] = useState([
    {
      id: 'cs201',
      code: 'CS201',
      name: 'Data Structures and Algorithms',
      instructor: 'Dr. Jane Smith',
      progress: 65,
      status: 'In Progress'
    },
    {
      id: 'cs301',
      code: 'CS301',
      name: 'Web Development',
      instructor: 'Prof. John Davis',
      progress: 40,
      status: 'In Progress'
    },
    {
      id: 'cs202',
      code: 'CS202',
      name: 'Algorithm Analysis',
      instructor: 'Dr. Alan Turing',
      progress: 90,
      status: 'In Progress'
    },
    {
      id: 'cs101',
      code: 'CS101',
      name: 'Introduction to Programming',
      instructor: 'Prof. Mary Johnson',
      progress: 100,
      status: 'Completed'
    },
    {
      id: 'cs102',
      code: 'CS102',
      name: 'Object-Oriented Programming',
      instructor: 'Dr. Robert Wilson',
      progress: 100,
      status: 'Completed'
    }
  ]);

  const [filter, setFilter] = useState('all');

  const filteredCourses = filter === 'all' 
    ? courses 
    : courses.filter(course => course.status.toLowerCase() === filter);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl shadow-md p-6 border border-gray-100"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-3 md:mb-0">My Courses</h2>
        <div className="flex space-x-2">
          <button 
            onClick={() => setFilter('all')} 
            className={`px-4 py-2 rounded-md ${
              filter === 'all' 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } transition-colors`}
          >
            All
          </button>
          <button 
            onClick={() => setFilter('in progress')} 
            className={`px-4 py-2 rounded-md ${
              filter === 'in progress' 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } transition-colors`}
          >
            In Progress
          </button>
          <button 
            onClick={() => setFilter('completed')} 
            className={`px-4 py-2 rounded-md ${
              filter === 'completed' 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } transition-colors`}
          >
            Completed
          </button>
        </div>
      </div>
      
      <div className="space-y-4">
        {filteredCourses.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No courses found.</p>
          </div>
        ) : (
          filteredCourses.map(course => (
            <div key={course.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div>
                  <div className="flex items-center">
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-md text-sm mr-3">
                      {course.code}
                    </span>
                    <h3 className="font-semibold text-gray-800">{course.name}</h3>
                  </div>
                  <p className="text-gray-500 text-sm mt-1">Instructor: {course.instructor}</p>
                </div>
                <div className="flex items-center mt-3 md:mt-0">
                  <div className="flex items-center mr-4">
                    <div className="w-24 h-2 bg-gray-200 rounded-full mr-2">
                      <div 
                        className={`h-full rounded-full ${
                          course.progress === 100 
                            ? 'bg-green-500' 
                            : course.progress > 70 
                              ? 'bg-blue-500' 
                              : 'bg-amber-500'
                        }`}
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-gray-600 text-sm">{course.progress}%</span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    course.status === 'Completed' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    {course.status}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
};

// Academic Progress Tab Component
const ProgressTab: React.FC<{ user: User }> = ({ user }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Grade Summary */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Grade Summary</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-purple-50 p-4 rounded-lg text-center">
            <p className="text-gray-600 mb-1">Current GPA</p>
            <p className="text-3xl font-bold text-purple-700">3.8</p>
            <p className="text-gray-500 text-sm mt-1">out of 4.0</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <p className="text-gray-600 mb-1">Total Credits</p>
            <p className="text-3xl font-bold text-blue-700">48</p>
            <p className="text-gray-500 text-sm mt-1">of 120 required</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <p className="text-gray-600 mb-1">Courses Completed</p>
            <p className="text-3xl font-bold text-green-700">12</p>
            <p className="text-gray-500 text-sm mt-1">of 30 required</p>
          </div>
        </div>
      </div>
      
      {/* Semester Breakdown */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Semester Breakdown</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Semester
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Courses
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Credits
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  GPA
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">Fall 2023</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">4</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">12</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">3.7</div>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">Spring 2023</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">5</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">15</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">3.9</div>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">Fall 2022</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">4</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">12</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">3.8</div>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">Spring 2022</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">3</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">9</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">3.6</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Achievement Badges */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Achievements</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <div className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg">
            <div className="h-16 w-16 bg-yellow-100 rounded-full flex items-center justify-center mb-2">
              <GraduationCap className="text-yellow-600" size={24} />
            </div>
            <p className="text-sm font-medium text-gray-800 text-center">Dean's List</p>
            <p className="text-xs text-gray-500 text-center">Spring 2023</p>
          </div>
          <div className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg">
            <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-2">
              <BookOpen className="text-blue-600" size={24} />
            </div>
            <p className="text-sm font-medium text-gray-800 text-center">Course Excellence</p>
            <p className="text-xs text-gray-500 text-center">CS101</p>
          </div>
          <div className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg">
            <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-2">
              <BarChart2 className="text-green-600" size={24} />
            </div>
            <p className="text-sm font-medium text-gray-800 text-center">Perfect Attendance</p>
            <p className="text-xs text-gray-500 text-center">Fall 2022</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Notifications Tab Component
const NotificationsTab: React.FC<{ user: User }> = ({ user }) => {
  const [notifications, setNotifications] = useState([
    { 
      id: 1, 
      title: 'Assignment Grade Posted', 
      message: 'Your grade for Data Structures Assignment 2 has been posted.', 
      date: 'Today at 10:24 AM', 
      read: false, 
      type: 'grade' 
    },
    { 
      id: 2, 
      title: 'Course Registration Open', 
      message: 'Registration for Fall 2023 courses is now open. Register early to secure your spot!', 
      date: 'Yesterday at 2:15 PM', 
      read: true, 
      type: 'announcement' 
    },
    { 
      id: 3, 
      title: 'New Course Available', 
      message: 'A new course on Advanced Machine Learning (CS502) is now available for enrollment.', 
      date: 'May 10, 2023', 
      read: true, 
      type: 'course' 
    },
    { 
      id: 4, 
      title: 'Assignment Due Reminder', 
      message: 'Your Web Development Project is due in 3 days. Make sure to submit it on time!', 
      date: 'May 8, 2023', 
      read: false, 
      type: 'deadline' 
    },
    { 
      id: 5, 
      title: 'Account Update', 
      message: 'Your profile information has been updated successfully.', 
      date: 'May 5, 2023', 
      read: true, 
      type: 'account' 
    }
  ]);

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({ ...notification, read: true })));
  };

  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter(notification => notification.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl shadow-md p-6 border border-gray-100"
    >
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Notifications</h2>
          {unreadCount > 0 && (
            <p className="text-gray-600">You have {unreadCount} unread notifications</p>
          )}
        </div>
        {unreadCount > 0 && (
          <button 
            onClick={markAllAsRead}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          >
            Mark all as read
          </button>
        )}
      </div>
      
      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No notifications to display.</p>
          </div>
        ) : (
          notifications.map(notification => (
            <div 
              key={notification.id} 
              className={`border rounded-lg p-4 ${notification.read ? 'border-gray-200' : 'border-purple-300 bg-purple-50'}`}
            >
              <div className="flex justify-between">
                <h3 className={`font-semibold ${notification.read ? 'text-gray-800' : 'text-purple-700'}`}>
                  {notification.title}
                </h3>
                <div className="flex space-x-2">
                  {!notification.read && (
                    <button 
                      onClick={() => markAsRead(notification.id)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <span className="sr-only">Mark as read</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  )}
                  <button 
                    onClick={() => deleteNotification(notification.id)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <span className="sr-only">Delete</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
              <p className="text-gray-600 mt-2">{notification.message}</p>
              <div className="flex items-center justify-between mt-3">
                <span className="text-gray-500 text-sm">{notification.date}</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  notification.type === 'grade' ? 'bg-blue-100 text-blue-700' :
                  notification.type === 'announcement' ? 'bg-purple-100 text-purple-700' :
                  notification.type === 'course' ? 'bg-green-100 text-green-700' :
                  notification.type === 'deadline' ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
};

export default Dashboard; 