import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { User } from '@supabase/supabase-js';
import { Course } from './types';
import { FormData } from './types/formData';
import Navbar from './components/Navbar';
import HomePage from './components/HomePage';
import CourseList from './components/CourseList';
import SelectedCourses from './components/SelectedCourses';
import LoginPage from './components/LoginPage';
import AboutPage from './components/AboutPage';
import SignupPage from './components/SignupPage';
import DashboardPage from './components/DashboardPage';
import CourseFeatures from './components/CourseFeatures';
import ComingSoon from './components/ComingSoon';
import CourseFilterForm from './components/CourseFilterForm';
import { IIITDCourses } from './data/courseData';
import ProtectedRoute from './components/ProtectedRoute';
import CompleteProfile from './components/CompleteProfile';
import CourseQuestionnaire from './pages/CourseQuestionnaire';
import UserInput from './pages/UserInput';
import RecommendationChoice from './pages/RecommendationChoice';
import CourseReviews from './components/CourseReviews';
import TimeTable from './components/TimeTable';
import AuthCallback from './pages/AuthCallback';
import VerificationSuccess from './pages/VerificationSuccess';

interface SavedRecommendation {
  preferences: FormData;
  timestamp: number;
}

const App = () => {
  // Supabase authentication state
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Course management state
  const [selectedCourses, setSelectedCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [currentFilters, setCurrentFilters] = useState({
    institution: '',
    branch: '',
    semester: 1
  });

  // User preferences state
  const [userPreferences, setUserPreferences] = useState<FormData | null>(() => {
    const savedPreferences = localStorage.getItem('userFormData');
    return savedPreferences ? JSON.parse(savedPreferences) : null;
  });
  const [previousRecommendations, setPreviousRecommendations] = useState<SavedRecommendation[]>([]);
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(true);

  // Supabase authentication effect
  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSupabaseUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSupabaseUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load previous recommendations effect
  useEffect(() => {
    const savedRecommendations = localStorage.getItem('previousRecommendations');
    if (savedRecommendations) {
      const recommendations = JSON.parse(savedRecommendations);
      setPreviousRecommendations(recommendations);
      setIsFirstTimeUser(recommendations.length === 0);
    }

    // Check if there are current recommendations
    const savedPreferences = localStorage.getItem('userFormData');
    if (savedPreferences) {
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
        const savedPreferences = localStorage.getItem('userFormData');
        if (savedPreferences) {
          setUserPreferences(JSON.parse(savedPreferences));
        }
      }
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
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
      localStorage.setItem('currentRecommendations', 'true');
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

  // Transform Supabase user to Navbar user format
  const navbarUser = supabaseUser ? { name: supabaseUser.email?.split('@')[0] || 'User' } : null;

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <Router>
        <div className="min-h-screen bg-gray-100">
          <Navbar user={navbarUser} onLogout={handleLogout} />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/verification-success" element={<VerificationSuccess />} />
            <Route 
              path="/login" 
              element={
                supabaseUser ? <Navigate to="/dashboard" replace /> : <LoginPage onLogin={async (user) => {
                  setSupabaseUser(user);
                  return true;
                }} />
              } 
            />
            <Route 
              path="/signup" 
              element={
                supabaseUser ? <Navigate to="/dashboard" replace /> : <SignupPage />
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } 
            />
            <Route path="/courses" element={<CourseFeatures />} />
            <Route 
              path="/courses/clash-checker" 
              element={
                <ProtectedRoute>
                  <div className="container mx-auto px-4 py-8">
                    <h1 className="text-3xl font-bold mb-8 text-center">Course Schedule Planner</h1>
                    <div className="grid lg:grid-cols-[300px,1fr,400px] gap-6">
                      {/* Filters Panel */}
                      <div className="lg:sticky lg:top-4 h-fit">
                        <CourseFilterForm 
                          onSubmit={handleFilterSubmit}
                          currentFilters={currentFilters}
                          onInstitutionChange={handleInstitutionChange}
                        />
                      </div>

                      {/* Course List */}
                      <div>
                        <CourseList 
                          courses={filteredCourses}
                          selectedCourses={selectedCourses}
                          onCourseSelect={handleCourseSelect}
                        />
                      </div>

                      {/* Selected Courses Panel - Now wider */}
                      <div className="lg:sticky lg:top-4 h-fit">
                        <SelectedCourses 
                          courses={selectedCourses} 
                          onRemoveCourse={(course) => {
                            setSelectedCourses(selectedCourses.filter(c => c.id !== course.id));
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/courses/timetable" 
              element={
                <ProtectedRoute>
                  <TimeTable />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/courses/reviews" 
              element={
                <ProtectedRoute>
                  <CourseReviews currentUser={supabaseUser} />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/courses/recommendations" 
              element={
                <ProtectedRoute>
                  <RecommendationChoice
                    hasPreviousRecommendations={previousRecommendations.length > 0}
                    onViewPrevious={handleViewPreviousRecommendations}
                    onStartNew={handleStartNewRecommendations}
                  />
                </ProtectedRoute>
              } 
            />
            <Route
              path="/courses/recommendations/new"
              element={
                <ProtectedRoute>
                  <UserInput onComplete={handleFormComplete} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/courses/recommendations/results"
              element={
                <ProtectedRoute>
                  {userPreferences ? (
                    <CourseQuestionnaire userPreferences={userPreferences} />
                  ) : (
                    <Navigate to="/courses/recommendations" replace />
                  )}
                </ProtectedRoute>
              }
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <CompleteProfile />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </GoogleOAuthProvider>
  );
};

export default App;
