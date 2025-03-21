import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { mockRecommendations } from '../data/mockRecommendations';
import { FormData } from '../types/formData';

interface Course {
  id: string;
  code: string;
  name: string;
  description: string;
  instructor: string;
  duration: string;
  difficulty: string;
  prerequisites: string[];
  antiRequisites: string[];
  semester: string;
  tags: string[];
  enrollmentStatus: string;
  credits: number;
}

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
  userPreferences: FormData;
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
    {/* Add gradient overlay on hover */}
    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-500 
      opacity-0 group-hover:opacity-5 transition-opacity duration-300" 
    />
    
    <div className="relative z-10">
      <div className="flex justify-between items-start">
        <div className="space-y-3">
          {/* Course Header */}
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

          {/* Course Details */}
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

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {course.tags.map(tag => (
              <span 
                key={tag} 
                className="px-3 py-1 text-sm bg-white text-gray-700 rounded-full border border-gray-200"
              >
                {tag}
              </span>
            ))}
            <span className={`px-3 py-1 text-sm rounded-full font-medium ${
              course.difficulty === 'beginner' ? 'bg-green-100 text-green-700 border border-green-200' :
              course.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
              'bg-red-100 text-red-700 border border-red-200'
            }`}>
              {course.difficulty.charAt(0).toUpperCase() + course.difficulty.slice(1)}
            </span>
              </div>
            </div>

        {/* Enroll Button */}
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
          className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm
            focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
          value={filters.difficulty}
          onChange={(e) => onFilterChange('difficulty', e.target.value)}
        >
          <option value="all">All Levels</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">Time Commitment</h3>
        <select
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
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<Course[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [filters, setFilters] = useState({
    difficulty: 'all',
    timeCommitment: 'all',
    credits: 'all'
  });
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);

  useEffect(() => {
    if (userPreferences) {
      generateRecommendations();
    } else {
      console.error('No user preferences found');
    }
  }, [userPreferences]);

  const generateRecommendations = async () => {
    setLoading(true);
    try {
      // Use mock recommendations directly
      setRecommendations(mockRecommendations);
      
      // Store in localStorage for persistence
      localStorage.setItem('currentRecommendations', JSON.stringify(mockRecommendations));
    } catch (error) {
      console.error('Error setting recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = (course: Course) => {
    if (!enrolledCourses.find(c => c.id === course.id)) {
      setEnrolledCourses([...enrolledCourses, course]);
    }
  };

  const handleFilterChange = (filterType: string, value: string) => {
    setFilters({ ...filters, [filterType]: value });
  };

  const filteredCourses = recommendations.filter(course => {
    if (filters.difficulty !== 'all' && course.difficulty.toLowerCase() !== filters.difficulty) {
      return false;
    }
    if (filters.timeCommitment !== 'all') {
      const weeks = parseInt(course.duration.split(' ')[0]);
      if (filters.timeCommitment === 'short' && weeks > 8) return false;
      if (filters.timeCommitment === 'medium' && (weeks <= 8 || weeks > 12)) return false;
      if (filters.timeCommitment === 'long' && weeks <= 12) return false;
    }
    if (filters.credits !== 'all' && course.credits !== parseInt(filters.credits)) {
      return false;
    }
    return true;
  });

  const handleRemoveCourse = (courseId: string) => {
    setEnrolledCourses(enrolledCourses.filter(course => course.id !== courseId));
  };

  const handleProceedToRegistration = () => {
    // Add your registration logic here
    console.log('Proceeding to registration with courses:', enrolledCourses);
  };

  // Add mock course groups
  const courseGroups: CourseGroup[] = [
    {
      id: 'core',
      title: 'Core Technical Foundation',
      description: 'Essential courses to build your technical foundation based on your interests in software development and AI.',
      theme: {
        gradient: 'bg-gradient-to-r from-blue-50 to-indigo-50',
        border: 'border border-blue-100',
        shadow: 'hover:shadow-blue-100'
      },
      courses: [
      {
        id: 'CSE101',
        code: 'CSE101',
        name: 'Introduction to Programming',
        description: 'Master programming fundamentals using Python. Covers basic syntax, data structures, algorithms, and problem-solving techniques.',
          instructor: 'Dr. Sarah Johnson',
          duration: '8 weeks',
          difficulty: 'beginner',
        credits: 4,
          tags: ['Programming', 'Python', 'Fundamentals'],
          enrollmentStatus: 'open',
          prerequisites: [],
          antiRequisites: [],
          semester: 'Fall 2024'
      },
      {
        id: 'CSE102',
        code: 'CSE102',
        name: 'Data Structures and Algorithms',
        description: 'Learn fundamental data structures and algorithms. Includes arrays, linked lists, trees, graphs, sorting, and searching algorithms.',
          instructor: 'Prof. Michael Chen',
          duration: '12 weeks',
          difficulty: 'intermediate',
        credits: 4,
        tags: ['DSA', 'Algorithms', 'Core'],
          enrollmentStatus: 'open',
          prerequisites: ['CSE101'],
          antiRequisites: [],
          semester: 'Fall 2024'
      },
      {
        id: 'CSE103',
        code: 'CSE103',
        name: 'Object-Oriented Programming',
        description: 'Deep dive into OOP concepts using Java. Learn inheritance, polymorphism, encapsulation, and design patterns.',
          instructor: 'Dr. Emma Wilson',
          duration: '10 weeks',
          difficulty: 'intermediate',
        credits: 4,
        tags: ['Java', 'OOP', 'Design Patterns'],
          enrollmentStatus: 'open',
          prerequisites: ['CSE101'],
          antiRequisites: [],
          semester: 'Fall 2024'
      },
      {
        id: 'CSE104',
        code: 'CSE104',
        name: 'Database Systems',
        description: 'Understanding database design, SQL, normalization, and transaction management.',
          instructor: 'Prof. David Lee',
          duration: '10 weeks',
          difficulty: 'intermediate',
        credits: 4,
        tags: ['SQL', 'Database', 'Core'],
          enrollmentStatus: 'open',
          prerequisites: ['CSE102'],
          antiRequisites: [],
          semester: 'Fall 2024'
      },
      {
        id: 'CSE105',
        code: 'CSE105',
        name: 'Computer Networks',
        description: 'Fundamentals of computer networking, protocols, and network security.',
          instructor: 'Dr. Robert Kim',
          duration: '12 weeks',
          difficulty: 'intermediate',
        credits: 4,
        tags: ['Networking', 'Security', 'Protocols'],
          enrollmentStatus: 'open',
          prerequisites: ['CSE101'],
          antiRequisites: [],
          semester: 'Fall 2024'
        }
      ]
    },
    {
      id: 'ai-ml',
      title: 'AI & Machine Learning Path',
      description: 'Specialized courses focusing on artificial intelligence and machine learning concepts.',
      theme: {
        gradient: 'bg-gradient-to-r from-purple-50 to-pink-50',
        border: 'border border-purple-100',
        shadow: 'hover:shadow-purple-100'
      },
      courses: [
        {
          id: 'AI101',
          code: 'AI101',
          name: 'Introduction to Artificial Intelligence',
          description: 'Fundamental concepts of AI, including search algorithms, knowledge representation, and expert systems.',
          instructor: 'Dr. Lisa Chen',
          duration: '12 weeks',
          difficulty: 'intermediate',
          credits: 4,
          tags: ['AI', 'Machine Learning', 'Fundamentals'],
          enrollmentStatus: 'open',
          prerequisites: ['CSE101', 'CSE102'],
          antiRequisites: [],
          semester: 'Fall 2024'
        },
        {
          id: 'ML201',
          code: 'ML201',
          name: 'Machine Learning Foundations',
          description: 'Core machine learning algorithms, including supervised and unsupervised learning techniques.',
          instructor: 'Prof. James Wilson',
          duration: '14 weeks',
          difficulty: 'advanced',
          credits: 4,
          tags: ['Machine Learning', 'Statistics', 'Python'],
          enrollmentStatus: 'open',
          prerequisites: ['AI101'],
          antiRequisites: [],
          semester: 'Fall 2024'
        },
        {
          id: 'DL301',
          code: 'DL301',
          name: 'Deep Learning',
          description: 'Neural networks, deep learning architectures, and their applications.',
          instructor: 'Dr. Sarah Martinez',
          duration: '12 weeks',
          difficulty: 'advanced',
          credits: 4,
          tags: ['Deep Learning', 'Neural Networks', 'AI'],
          enrollmentStatus: 'open',
          prerequisites: ['ML201'],
          antiRequisites: [],
          semester: 'Fall 2024'
        },
        {
          id: 'CV401',
          code: 'CV401',
          name: 'Computer Vision',
          description: 'Image processing, object detection, and visual recognition systems.',
          instructor: 'Prof. Alex Thompson',
          duration: '10 weeks',
          difficulty: 'advanced',
          credits: 4,
          tags: ['Computer Vision', 'Deep Learning', 'Image Processing'],
          enrollmentStatus: 'open',
          prerequisites: ['DL301'],
          antiRequisites: [],
          semester: 'Fall 2024'
        },
        {
          id: 'NLP401',
          code: 'NLP401',
          name: 'Natural Language Processing',
          description: 'Text processing, language modeling, and sentiment analysis.',
          instructor: 'Dr. Emily Brown',
          duration: '12 weeks',
          difficulty: 'advanced',
          credits: 4,
          tags: ['NLP', 'Text Processing', 'AI'],
          enrollmentStatus: 'open',
          prerequisites: ['DL301'],
          antiRequisites: [],
          semester: 'Fall 2024'
        }
      ]
    },
    {
      id: 'industry',
      title: 'Industry-Ready Skills',
      description: 'Practical courses focused on industry-relevant technologies and practices.',
      theme: {
        gradient: 'bg-gradient-to-r from-emerald-50 to-teal-50',
        border: 'border border-emerald-100',
        shadow: 'hover:shadow-emerald-100'
      },
      courses: [
        {
          id: 'WEB301',
          code: 'WEB301',
          name: 'Full Stack Web Development',
          description: 'Modern web development using React, Node.js, and related technologies.',
          instructor: 'Prof. Mark Johnson',
          duration: '16 weeks',
          difficulty: 'intermediate',
          credits: 6,
          tags: ['Web Development', 'React', 'Node.js'],
          enrollmentStatus: 'open',
          prerequisites: ['CSE101', 'CSE103'],
          antiRequisites: [],
          semester: 'Fall 2024'
        },
        {
          id: 'MOB301',
          code: 'MOB301',
          name: 'Mobile App Development',
          description: 'Cross-platform mobile app development using React Native.',
          instructor: 'Dr. Rachel Kim',
          duration: '14 weeks',
          difficulty: 'intermediate',
          credits: 4,
          tags: ['Mobile Development', 'React Native', 'Cross-platform'],
          enrollmentStatus: 'open',
          prerequisites: ['WEB301'],
          antiRequisites: [],
          semester: 'Fall 2024'
        },
        {
          id: 'CLOUD301',
          code: 'CLOUD301',
          name: 'Cloud Computing',
          description: 'Cloud services, deployment, and scalable architecture design.',
          instructor: 'Prof. David Clark',
          duration: '12 weeks',
          difficulty: 'intermediate',
          credits: 4,
          tags: ['Cloud', 'AWS', 'DevOps'],
          enrollmentStatus: 'open',
          prerequisites: ['CSE105'],
          antiRequisites: [],
          semester: 'Fall 2024'
        },
        {
          id: 'SEC401',
          code: 'SEC401',
          name: 'Cybersecurity Fundamentals',
          description: 'Security principles, threat detection, and protection strategies.',
          instructor: 'Dr. Michael Lee',
          duration: '12 weeks',
          difficulty: 'advanced',
          credits: 4,
          tags: ['Security', 'Networking', 'Cryptography'],
          enrollmentStatus: 'open',
          prerequisites: ['CSE105'],
          antiRequisites: [],
          semester: 'Fall 2024'
        },
        {
          id: 'PROJ401',
          code: 'PROJ401',
          name: 'Capstone Project',
          description: 'Industry-sponsored project implementing real-world solutions.',
          instructor: 'Prof. Jennifer White',
          duration: '16 weeks',
          difficulty: 'advanced',
          credits: 6,
          tags: ['Project', 'Industry', 'Team Work'],
          enrollmentStatus: 'open',
          prerequisites: ['WEB301', 'CLOUD301'],
          antiRequisites: [],
          semester: 'Fall 2024'
        }
      ]
    }
  ];

  if (loading) {
    return <LoadingSpinner />;
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
          {/* Quick Filters - Left Sidebar */}
              <div className="col-span-12 lg:col-span-3">
            <QuickFilters filters={filters} onFilterChange={handleFilterChange} />
              </div>

          {/* Main Content - Course Groups */}
          <div className="col-span-12 lg:col-span-6 space-y-4">
            {courseGroups.map(group => (
              <div key={group.id}>
                <CourseGroupHeader
                  group={group}
                  isActive={activeGroupId === group.id}
                  onClick={() => setActiveGroupId(activeGroupId === group.id ? null : group.id)}
                />
                <AnimatePresence>
                  {activeGroupId === group.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 space-y-4 p-4 bg-white rounded-xl shadow-lg">
                        {group.courses.map((course) => (
                          <CourseCard
                            key={course.id} 
                            course={course}
                            onEnroll={() => handleEnroll(course)}
                            enrolled={enrolledCourses.some(c => c.id === course.id)}
                          />
                        ))}
                                  </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                          </div>
                        ))}
              </div>

          {/* Your Path - Right Sidebar */}
              <div className="col-span-12 lg:col-span-3">
            <YourPath enrolledCourses={enrolledCourses} />
              </div>
            </div>
        </div>

      {/* Floating Course Basket */}
      <AnimatePresence>
        <CourseBasket
          enrolledCourses={enrolledCourses}
          onRemoveCourse={handleRemoveCourse}
          onProceedToRegistration={handleProceedToRegistration}
        />
      </AnimatePresence>
      </div>
    );
};

export default CourseQuestionnaire;