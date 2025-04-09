import { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Box, Flex, Spinner } from '@chakra-ui/react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ChakraProvider } from '@chakra-ui/react';
import Navbar from './components/Navbar';
import { Course } from './types';
import { FormData } from './types/formData';
import { IIITDCourses } from './database/courses_data/courseData';
import ProtectedRoute from './components/ProtectedRoute';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminLogin from './pages/admin/AdminLogin';
const AddCourse = lazy(() => import('./pages/admin/AddCourse'));
import BulkCourseUpload from './pages/admin/BulkCourseUpload';
import MyCourses from './pages/admin/MyCourses';
import EditCourse from './pages/admin/EditCourse';
import StreamManagement from './pages/admin/StreamManagement';
import StreamCourses from './pages/admin/StreamCourses';

// Lazy load components
const HomePage = lazy(() => import('./components/HomePage'));
const LoginPage = lazy(() => import('./components/LoginPage'));
const SignupPage = lazy(() => import('./components/SignupPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const DashboardPage = lazy(() => import('./components/DashboardPage'));
const CourseFeatures = lazy(() => import('./components/CourseFeatures'));
const CompleteProfile = lazy(() => import('./components/CompleteProfile'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));

interface SavedRecommendation {
  preferences: FormData;
  timestamp: number;
}

const App = () => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [selectedCourses, setSelectedCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [currentFilters, setCurrentFilters] = useState({
    institution: '',
    branch: '',
    semester: 1
  });
  const [userPreferences, setUserPreferences] = useState<FormData | null>(() => {
    // Initialize userPreferences from localStorage
    const currentRecommendations = localStorage.getItem('currentRecommendations');
    const savedPreferences = localStorage.getItem('userFormData');
    return currentRecommendations && savedPreferences ? JSON.parse(savedPreferences) : null;
  });
  const [previousRecommendations, setPreviousRecommendations] = useState<SavedRecommendation[]>([]);
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(true);

  // Load previous recommendations from localStorage on component mount
  useEffect(() => {
    const savedRecommendations = localStorage.getItem('previousRecommendations');
    if (savedRecommendations) {
      const recommendations = JSON.parse(savedRecommendations);
      setPreviousRecommendations(recommendations);
      setIsFirstTimeUser(recommendations.length === 0);
    }

    // Check if there are current recommendations
    const currentRecommendations = localStorage.getItem('currentRecommendations');
    const savedPreferences = localStorage.getItem('userFormData');
    if (currentRecommendations && savedPreferences) {
      setUserPreferences(JSON.parse(savedPreferences));
      setIsFirstTimeUser(false);
    }
  }, []);

  // Reset userPreferences when navigating away from recommendations
  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname;
      if (!path.includes('/courses/recommendations')) {
        setUserPreferences(null);
        localStorage.removeItem('currentRecommendations');
      } else if (path === '/courses/recommendations') {
        // When returning to recommendations, check if we have current recommendations
        const currentRecommendations = localStorage.getItem('currentRecommendations');
        const savedPreferences = localStorage.getItem('userFormData');
        if (currentRecommendations && savedPreferences) {
          setUserPreferences(JSON.parse(savedPreferences));
        }
      }
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const handleLogin = async (userData: any) => {
    console.log("Setting user data:", userData);
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    return true;
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const handleCourseSelect = (course: Course) => {
    if (selectedCourses.some(c => c.id === course.id)) {
      setSelectedCourses(selectedCourses.filter(c => c.id !== course.id));
    } else {
      setSelectedCourses([...selectedCourses, course]);
    }
  };

  const handleInstitutionChange = () => {
    setSelectedCourses([]); // Clear selected courses when institution changes
    setFilteredCourses([]); // Clear filtered courses
  };

  const handleFilterSubmit = (filters: {
    institution: string;
    branch: string;
    semester: number;
  }) => {
    setCurrentFilters(filters);
    
    if (filters.institution === 'Indraprastha Institute of Information Technology Delhi') {
      const filtered = IIITDCourses.filter(course => 
        course.semester === filters.semester &&
        (filters.branch === 'All' || course.stream === filters.branch || course.stream === 'All')
      );
      setFilteredCourses(filtered);
    } else {
      setFilteredCourses([]); // Clear for other institutions
    }
  };

  const handleSignup = async (userData: any) => {
    console.log("Setting user data after signup:", userData);
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    return true;
  };

  const handleFormComplete = (preferences: FormData) => {
    try {
      setUserPreferences(preferences);
      setIsFirstTimeUser(false);
      
      // Save to previous recommendations
      const newRecommendation: SavedRecommendation = {
        preferences,
        timestamp: Date.now()
      };
      
      const updatedRecommendations = [...previousRecommendations, newRecommendation];
      setPreviousRecommendations(updatedRecommendations);
      localStorage.setItem('previousRecommendations', JSON.stringify(updatedRecommendations));
      localStorage.setItem('userFormData', JSON.stringify(preferences));

      // Fetch recommendations from backend
      fetch('http://localhost:5000/api/recommendations', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ preferences })
      });
    } catch (error) {
      console.error('Error handling form completion:', error);
    }
  };

  const handleViewPreviousRecommendations = () => {
    if (previousRecommendations.length > 0) {
      const mostRecent = previousRecommendations[previousRecommendations.length - 1];
      setUserPreferences(mostRecent.preferences);
      localStorage.setItem('userFormData', JSON.stringify(mostRecent.preferences));
    }
  };

  const handleStartNewRecommendations = () => {
    setUserPreferences(null);
    localStorage.removeItem('currentRecommendations');
    localStorage.removeItem('userFormData');
  };

  return (
    <ChakraProvider>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <Router>
          <Box minH="100vh" bg="gray.50">
            <Navbar />
            <Suspense fallback={
              <Flex height="100vh" align="center" justify="center">
                <Spinner
                  thickness="4px"
                  speed="0.65s"
                  emptyColor="gray.200"
                  color="purple.500"
                  size="xl"
                />
              </Flex>
            }>
          <Routes>
                {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                {/* Protected User Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/complete-profile" element={<CompleteProfile />} />
                  <Route path="/courses/*" element={<CourseFeatures />} />
                </Route>

                {/* Admin Routes */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={
                  <ProtectedAdminRoute>
                    <AdminDashboard />
                  </ProtectedAdminRoute>
                } />
                <Route path="/admin/streams" element={
                  <ProtectedAdminRoute>
                    <StreamManagement />
                  </ProtectedAdminRoute>
                } />
                <Route path="/admin/courses/add" element={
                  <ProtectedAdminRoute>
                    <AddCourse />
                  </ProtectedAdminRoute>
                } />
                <Route path="/admin/courses/bulk-upload" element={
                  <ProtectedAdminRoute>
                    <BulkCourseUpload />
                  </ProtectedAdminRoute>
                } />
                <Route path="/admin/courses/edit/:id" element={
                  <ProtectedAdminRoute>
                    <EditCourse />
                  </ProtectedAdminRoute>
                } />
                <Route path="/admin/courses" element={
                  <ProtectedAdminRoute>
                    <MyCourses />
                  </ProtectedAdminRoute>
                } />
                <Route path="/admin/courses/my-courses" element={
                  <ProtectedAdminRoute>
                    <MyCourses />
                  </ProtectedAdminRoute>
                } />
                <Route
                  path="/admin/stream-courses"
                  element={
                    <ProtectedAdminRoute>
                      <StreamCourses />
                    </ProtectedAdminRoute>
                  }
                />

                {/* Fallback Route */}
                <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
            </Suspense>
          </Box>
      </Router>
    </GoogleOAuthProvider>
    </ChakraProvider>
  );
};

export default App;
