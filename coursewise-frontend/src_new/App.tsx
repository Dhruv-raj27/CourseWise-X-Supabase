import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ChakraProvider, Box, Flex, Spinner } from '@chakra-ui/react';
import { GoogleOAuthProvider } from '@react-oauth/google';

// Admin imports
import AdminDashboard from './features/admin/AdminDashboard';
import AdminLogin from './features/admin/AdminLogin';
import ProtectedAdminRoute from './features/admin/components/ProtectedAdminRoute';

// Lazy loaded admin components
const AddCourse = lazy(() => import('./features/admin/AddCourse'));
const BulkCourseUpload = lazy(() => import('./features/admin/BulkCourseUpload'));
const MyCourses = lazy(() => import('./features/admin/MyCourses'));
const EditCourse = lazy(() => import('./features/admin/EditCourse'));
const StreamManagement = lazy(() => import('./features/admin/StreamManagement'));

// Lazy loaded auth components
const EnhancedLogin = lazy(() => import('./features/auth/components/EnhancedLogin'));
const AuthCallback = lazy(() => import('./features/auth/components/AuthCallback'));
const Dashboard = lazy(() => import('./features/dashboard/Dashboard'));

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
          {/* Root redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Public Routes */}
          <Route path="/login" element={<EnhancedLogin />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/dashboard" element={<Dashboard />} />

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
        </Routes>
      </Suspense>
    </Box>
  );
};

const App = () => {
  return (
    <ChakraProvider>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <Router>
          <AppContent />
        </Router>
      </GoogleOAuthProvider>
    </ChakraProvider>
  );
};

export default App; 