import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ChakraProvider, Box, Flex, Spinner } from '@chakra-ui/react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { BookOpen, AlertTriangle, Star, Calendar } from 'lucide-react';

// Admin imports
import AdminDashboard from './features/admin/AdminDashboard';
import AdminLogin from './features/admin/AdminLogin';
import ProtectedAdminRoute from './features/admin/components/ProtectedAdminRoute';

// Import auth components directly to avoid lazy loading issues
import EnhancedLogin from './features/auth/components/EnhancedLogin';
import AuthCallback from './features/auth/components/AuthCallback';
import ProtectedRoute from './features/auth/components/ProtectedRoute';
import HomePage from './features/home/HomePage';



// Lazy load other components
const AcademicTools = lazy(() => import('./features/academic/AcademicTools'));
const AddCourse = lazy(() => import('./features/admin/AddCourse'));
const BulkCourseUpload = lazy(() => import('./features/admin/BulkCourseUpload'));
const MyCourses = lazy(() => import('./features/admin/MyCourses'));
const EditCourse = lazy(() => import('./features/admin/EditCourse'));
const StreamManagement = lazy(() => import('./features/admin/StreamManagement'));

const LoadingSpinner = () => (
  <Flex height="100vh" align="center" justify="center">
    <Spinner size="xl" color="purple.500" />
  </Flex>
);

const AppContent = () => {
  return (
    <Box minH="100vh">
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<EnhancedLogin />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/academic-tools" element={<AcademicTools />} />

          {/* Protected User Routes
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } /> */}

          {/* Course Feature Routes */}
          <Route path="/course-recommendation" element={
            <ProtectedRoute>
              <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-2xl w-full text-center">
                  <BookOpen className="w-16 h-16 mx-auto mb-4 text-indigo-500" />
                  <h1 className="text-3xl font-bold mb-4 text-gray-800">Course Recommendations</h1>
                  <p className="text-gray-600 mb-6">We're building something amazing for you. This feature will be available soon!</p>
                  <button 
                    onClick={() => window.history.back()} 
                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Go Back
                  </button>
                </div>
              </div>
            </ProtectedRoute>
          } />
          <Route path="/tt-clash-checker" element={
            <ProtectedRoute>
              <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-2xl w-full text-center">
                  <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-rose-500" />
                  <h1 className="text-3xl font-bold mb-4 text-gray-800">Timetable Clash Checker</h1>
                  <p className="text-gray-600 mb-6">We're building something amazing for you. This feature will be available soon!</p>
                  <button 
                    onClick={() => window.history.back()} 
                    className="px-6 py-3 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
                  >
                    Go Back
                  </button>
                </div>
              </div>
            </ProtectedRoute>
          } />
          <Route path="/course-reviews" element={
            <ProtectedRoute>
              <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-2xl w-full text-center">
                  <Star className="w-16 h-16 mx-auto mb-4 text-amber-500" />
                  <h1 className="text-3xl font-bold mb-4 text-gray-800">Course Reviews</h1>
                  <p className="text-gray-600 mb-6">We're building something amazing for you. This feature will be available soon!</p>
                  <button 
                    onClick={() => window.history.back()} 
                    className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                  >
                    Go Back
                  </button>
                </div>
              </div>
            </ProtectedRoute>
          } />
          <Route path="/timetable-maker" element={
            <ProtectedRoute>
              <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-2xl w-full text-center">
                  <Calendar className="w-16 h-16 mx-auto mb-4 text-green-500" />
                  <h1 className="text-3xl font-bold mb-4 text-gray-800">Timetable Maker</h1>
                  <p className="text-gray-600 mb-6">We're building something amazing for you. This feature will be available soon!</p>
                  <button 
                    onClick={() => window.history.back()} 
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Go Back
                  </button>
                </div>
              </div>
            </ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <ProtectedAdminRoute>
                <AdminDashboard />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/streams"
            element={
              <ProtectedAdminRoute>
                <StreamManagement />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/courses/add"
            element={
              <ProtectedAdminRoute>
                <AddCourse />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/courses/bulk-upload"
            element={
              <ProtectedAdminRoute>
                <BulkCourseUpload />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/courses/edit/:id"
            element={
              <ProtectedAdminRoute>
                <EditCourse />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/courses/my-courses"
            element={
              <ProtectedAdminRoute>
                <MyCourses />
              </ProtectedAdminRoute>
            }
          />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Box>
  );
};

const App = () => {
  // @ts-ignore - Vite environment variables
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  
  return (
    <ChakraProvider>
      <GoogleOAuthProvider clientId={clientId}>
        <Router>
          <AppContent />
        </Router>
      </GoogleOAuthProvider>
    </ChakraProvider>
  );
};

export default App; 