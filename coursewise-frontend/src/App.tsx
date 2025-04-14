import { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Box, Flex, Spinner } from '@chakra-ui/react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ChakraProvider } from '@chakra-ui/react';
//import Navbar from './components/Navbar';
//import { FormData } from './types/formData';
//import ProtectedRoute from './components/ProtectedRoute';
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
//const HomePage = lazy(() => import('./components/HomePage'));
//const AboutPage = lazy(() => import('./pages/AboutPage'));
//const CourseFeatures = lazy(() => import('./components/CourseFeatures'));
//const CompleteProfile = lazy(() => import('./components/CompleteProfile'));

interface SavedRecommendation {
  preferences: FormData;
  timestamp: number;
}

const AppContent = () => {
  // We'll implement new auth state management here later
  const [user, setUser] = useState(null);

  return (
    <Box>
      <Suspense fallback={
        <Flex height="100vh" align="center" justify="center">
          <Spinner size="xl" />
        </Flex>
      }>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={null} />
          <Route path="/about" element={null} />

          {/* Protected User Routes */}
          <Route path="/complete-profile" element={null} />
          <Route path="/courses/*" element={null} />

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
          <Route path="/admin/courses/my-courses" element={
            <ProtectedAdminRoute>
              <MyCourses />
            </ProtectedAdminRoute>
          } />
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
