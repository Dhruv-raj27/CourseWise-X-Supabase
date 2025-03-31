import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { courseService } from '../services/courseService';
import { Course } from '../types/course';
import { useAuth } from '../contexts/AuthContext';
import { FormData } from '../types/formData';

interface CourseGroup {
  id: string;
  title: string;
  description: string;
  courses: Course[];
  theme: {
    gradient: string;
    border: string;
    shadow: string;
  };
}

interface CourseQuestionnaireProps {
  userPreferences?: FormData;
}

const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
      className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full"
    />
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="text-gray-600 font-medium"
    >
      Generating your personalized recommendations...
    </motion.p>
  </div>
);

const CourseCard: React.FC<{ course: Course; onEnroll: () => void; enrolled: boolean }> = ({ course, onEnroll, enrolled }) => (
                  <motion.div
    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
    className="bg-gradient-to-br from-white to-gray-50 rounded-lg p-6 
      hover:shadow-xl transition-all duration-300 
      hover:-translate-y-1 border border-gray-100 
      hover:border-blue-100 relative group overflow-hidden"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-500 
      opacity-0 group-hover:opacity-5 transition-opacity duration-300" 
    />
    
    <div className="relative z-10">
      <div className="flex justify-between items-start">
        <div className="space-y-3">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h4 className="text-lg font-semibold text-gray-800">{course.name}</h4>
              <span className="text-sm px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-medium">
                {course.code}
              </span>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              {course.description}
                      </p>
                    </div>

          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {course.duration}
            </div>
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {course.instructor}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {course.tags.map((tag: string) => (
              <span 
                key={tag} 
                className="px-3 py-1 text-sm bg-white text-gray-700 rounded-full border border-gray-200"
              >
                {tag}
              </span>
            ))}
            <span className={`px-3 py-1 text-sm rounded-full font-medium ${
              course.difficulty === 'easy' ? 'bg-green-100 text-green-700 border border-green-200' :
              course.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
              'bg-red-100 text-red-700 border border-red-200'
            }`}>
              {course.difficulty.charAt(0).toUpperCase() + course.difficulty.slice(1)}
            </span>
              </div>
            </div>

        <button 
          onClick={onEnroll}
          disabled={enrolled}
          className={`bg-gradient-to-r from-indigo-500 to-purple-500 text-white 
            px-6 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 
            group font-medium ${
              enrolled 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:from-indigo-600 hover:to-purple-600'
            }`}
        >
          {enrolled ? 'Enrolled' : 'Enroll'}
          <svg 
            className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
              </div>
            </div>
          </motion.div>
        );

const CourseGroupHeader: React.FC<{ 
  group: CourseGroup;
  isActive: boolean;
  onClick: () => void;
}> = ({ group, isActive, onClick }) => (
  <motion.button
    onClick={onClick}
    className={`w-full text-left p-6 rounded-xl transition-all duration-300 ${
      isActive ? 'bg-white shadow-lg' : `${group.theme.gradient} ${group.theme.border} hover:shadow-md`
    }`}
  >
    <div className="flex justify-between items-center">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">{group.title}</h2>
        <p className="text-gray-700 text-sm">{group.description}</p>
      </div>
          <motion.div
        animate={{ rotate: isActive ? 180 : 0 }}
        transition={{ duration: 0.3 }}
        className="text-gray-500"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </motion.div>
    </div>
  </motion.button>
);

const QuickFilters: React.FC<{
  filters: any;
  onFilterChange: (type: string, value: string) => void;
}> = ({ filters, onFilterChange }) => (
  <div className="bg-white rounded-xl shadow-lg p-6 h-fit sticky top-4">
    <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Filters</h2>
    
              <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">Difficulty Level</h3>
        <select
          aria-label="Difficulty Level"
          className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm
            focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
          value={filters.difficulty}
          onChange={(e) => onFilterChange('difficulty', e.target.value)}
        >
          <option value="all">All Levels</option>
          <option value="easy">Beginner</option>
          <option value="medium">Intermediate</option>
          <option value="hard">Advanced</option>
        </select>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">Time Commitment</h3>
        <select
          aria-label="Time Commitment"
          className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm
            focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
          value={filters.timeCommitment}
          onChange={(e) => onFilterChange('timeCommitment', e.target.value)}
        >
          <option value="all">Any Time</option>
          <option value="short">Short (≤ 8 weeks)</option>
          <option value="medium">Medium (9-12 weeks)</option>
          <option value="long">Long (&gt; 12 weeks)</option>
        </select>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">Credits</h3>
        <select
          aria-label="Credits"
          className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm
            focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
          value={filters.credits}
          onChange={(e) => onFilterChange('credits', e.target.value)}
        >
          <option value="all">All Credits</option>
          <option value="2">2 Credits</option>
          <option value="4">4 Credits</option>
          <option value="6">6 Credits</option>
        </select>
              </div>

      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">Learning Progress</h3>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Core Courses</span>
              <span>2/5</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" style={{ width: '40%' }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Specialization</span>
              <span>1/3</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" style={{ width: '33%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const CourseBasket: React.FC<{
  enrolledCourses: Course[];
  onRemoveCourse: (courseId: string) => void;
  onProceedToRegistration: () => void;
}> = ({ enrolledCourses, onRemoveCourse, onProceedToRegistration }) => {
  if (enrolledCourses.length === 0) return null;

  const totalCredits = enrolledCourses.reduce((sum, course) => sum + course.credits, 0);

        return (
          <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-8 right-8 w-80 bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-100"
    >
      <div className="p-4 bg-gradient-to-r from-indigo-500 to-purple-500">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" 
              />
            </svg>
            <h3 className="text-white font-semibold">Selected Courses</h3>
              </div>
          <span className="text-white text-sm">{enrolledCourses.length} course{enrolledCourses.length !== 1 ? 's' : ''}</span>
            </div>
      </div>

      <div className="max-h-[300px] overflow-y-auto">
        <div className="p-4 space-y-3">
          {enrolledCourses.map(course => (
          <motion.div
              key={course.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex justify-between items-start p-3 bg-gray-50 rounded-lg group hover:bg-gray-100 transition-colors"
          >
            <div>
                <p className="text-sm font-medium text-gray-900">{course.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-500">{course.code}</span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-500">{course.credits} credits</span>
                </div>
              </div>
              <button
                aria-label="Remove course"
                onClick={() => onRemoveCourse(course.id)}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="p-4 border-t border-gray-100 bg-gray-50">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-gray-600">Total Credits:</span>
          <span className="text-sm font-semibold text-gray-900">{totalCredits}</span>
              </div>
        <button
          onClick={onProceedToRegistration}
          className="w-full py-2 px-4 bg-gradient-to-r from-indigo-500 to-purple-500 
            text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 
            transition-all duration-200 font-medium flex items-center justify-center gap-2"
        >
          Proceed to Registration
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
            </div>
          </motion.div>
        );
};

const YourPath: React.FC<{
  enrolledCourses: Course[];
}> = ({ enrolledCourses }) => (
  <div className="bg-white rounded-xl shadow-lg p-6 h-fit sticky top-4">
    <h2 className="text-xl font-bold text-gray-900 mb-6">Your Path</h2>
    
              <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">Current Focus</h3>
        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
          <p className="text-sm text-blue-700 font-medium">Complete your core courses first</p>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">Resources</h3>
        <div className="space-y-3">
          <div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
            <h4 className="text-sm font-medium text-gray-900">Course Planning</h4>
            <p className="text-xs text-gray-600 mt-1">Semester schedule tips</p>
              </div>
          <div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
            <h4 className="text-sm font-medium text-gray-900">Study Groups</h4>
            <p className="text-xs text-gray-600 mt-1">Connect with peers</p>
            </div>
        </div>
      </div>
    </div>
  </div>
);

const CourseQuestionnaire: React.FC<CourseQuestionnaireProps> = ({ userPreferences }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCourses, setSelectedCourses] = useState<Course[]>([]);
  const [currentSemester, setCurrentSemester] = useState<number>(1);
  const [currentStream, setCurrentStream] = useState<string>('All');
  const [filters, setFilters] = useState({
    difficulty: 'all',
    timeCommitment: 'all',
    credits: 'all'
  });
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);

  useEffect(() => {
    const loadCourses = async () => {
      try {
    setLoading(true);
        const allCourses = await courseService.getAllCourses();
        setCourses(allCourses);
        
        if (user) {
          const userSelections = await courseService.getUserSelectedCourses(user.id);
          setSelectedCourses(userSelections);
        }
      } catch (err) {
        setError('Failed to load courses. Please try again later.');
        console.error('Error loading courses:', err);
    } finally {
      setLoading(false);
    }
  };

    loadCourses();
  }, [user]);

  const handleCourseSelect = async (course: Course) => {
    if (!user) return;

    try {
      await courseService.selectCourse(user.id, course.id, currentSemester);
      setSelectedCourses([...selectedCourses, course]);
    } catch (err) {
      console.error('Error selecting course:', err);
      // Handle error (show notification, etc.)
    }
  };

  const handleCourseUnselect = async (course: Course) => {
    if (!user) return;

    try {
      await courseService.unselectCourse(user.id, course.id);
      setSelectedCourses(selectedCourses.filter(c => c.id !== course.id));
    } catch (err) {
      console.error('Error unselecting course:', err);
      // Handle error (show notification, etc.)
    }
  };

  const filteredCourses = courses.filter(course => {
    if (course.semester !== currentSemester) return false;
    if (currentStream !== 'All' && course.stream !== currentStream) return false;
    
    if (filters.difficulty !== 'all') {
      if (course.difficulty !== filters.difficulty) return false;
    }
    
    if (filters.credits !== 'all' && course.credits !== parseInt(filters.credits)) {
      return false;
    }
    
    return true;
  });

  const handleFilterChange = (filterType: string, value: string) => {
    setFilters({ ...filters, [filterType]: value });
  };

  const handleRemoveCourse = async (courseId: string) => {
    const course = selectedCourses.find(c => c.id === courseId);
    if (course) {
      await handleCourseUnselect(course);
    }
  };

  const handleProceedToRegistration = () => {
    // Add your registration logic here
    console.log('Proceeding to registration with courses:', selectedCourses);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

    return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
            <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Your Personalized Course Path
          </h1>
          <p className="text-gray-600 text-lg">
            Based on your responses, we've curated these course clusters to help you achieve your goals.
          </p>
            </div>

            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-12 lg:col-span-3">
            <QuickFilters filters={filters} onFilterChange={handleFilterChange} />
              </div>

          <div className="col-span-12 lg:col-span-6">
            {filteredCourses.map(course => (
                          <CourseCard
                            key={course.id} 
                            course={course}
                onEnroll={() => handleCourseSelect(course)}
                enrolled={selectedCourses.some(c => c.id === course.id)}
                          />
                        ))}
              </div>

              <div className="col-span-12 lg:col-span-3">
            <YourPath enrolledCourses={selectedCourses} />
              </div>
            </div>
        </div>

      <AnimatePresence>
        <CourseBasket
          enrolledCourses={selectedCourses}
          onRemoveCourse={handleRemoveCourse}
          onProceedToRegistration={handleProceedToRegistration}
        />
      </AnimatePresence>
      </div>
    );
};

export default CourseQuestionnaire;