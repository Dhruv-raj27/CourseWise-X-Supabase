import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import { GoogleOAuthProvider } from '@react-oauth/google';
import ProtectedRoute from './components/ProtectedRoute';
import CompleteProfile from './components/CompleteProfile';
import CourseQuestionnaire from './pages/CourseQuestionnaire';
import UserInput from './pages/UserInput';
import RecommendationChoice from './pages/RecommendationChoice';
import CourseReviews from './components/CourseReviews';

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
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <Router>
        <div className="min-h-screen bg-gray-100">
          <Navbar user={user} onLogout={handleLogout} />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route 
              path="/login" 
              element={
                user ? <Navigate to="/dashboard" replace /> : <LoginPage onLogin={handleLogin} />
              } 
            />
            <Route 
              path="/signup" 
              element={
                user ? <Navigate to="/dashboard" replace /> : <SignupPage onSignup={handleSignup} />
              } 
            />
            <Route 
              path="/complete-profile" 
              element={
                <ProtectedRoute>
                  <CompleteProfile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardPage user={user} />
                </ProtectedRoute>
              } 
            />
            <Route path="/courses" element={<CourseFeatures />} />
            <Route 
              path="/courses/clash-checker" 
              element={
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
              }
            />
            <Route 
              path="/courses/recommendations" 
              element={
                <div className="container mx-auto px-4 py-8">
                  {userPreferences ? (
                    <CourseQuestionnaire userPreferences={userPreferences} />
                  ) : (
                    <RecommendationChoice
                      hasPreviousRecommendations={!isFirstTimeUser && previousRecommendations.length > 0}
                      onViewPrevious={handleViewPreviousRecommendations}
                      onStartNew={handleStartNewRecommendations}
                    />
                  )}
                </div>
              }
            />
            <Route 
              path="/courses/recommendations/new" 
              element={
                <div className="container mx-auto px-4 py-8">
                  <UserInput onComplete={handleFormComplete} />
                </div>
              }
            />
            <Route path="/courses/reviews" element={<CourseReviews currentUser={user} />} />
            <Route path="/courses/timetable" element={<ComingSoon />} />
          </Routes>
        </div>
      </Router>
    </GoogleOAuthProvider>
  );
};

export default App;
