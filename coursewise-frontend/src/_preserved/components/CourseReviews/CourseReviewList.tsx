import React from 'react';
import { Star, ThumbsUp, Filter, Search, User, TrendingUp, MessageSquare, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { mockReviews } from '../../data/mockReviews';

interface Review {
  _id: string;
  courseName: string;
  courseCode: string;
  professorName: string;
  rating: number;
  difficulty: number;
  review: string;
  semester: string;
  helpfulCount: number;
  createdAt: string;
  anonymous: boolean;
  userId: {
    username: string;
    avatarUrl?: string;
  };
}

interface CourseReviewListProps {
  college: string;
  branch: string;
  onAddReview: () => void;
  currentUser: any;
}

// Pre-compute unique values
const UNIQUE_PROFESSORS = Array.from(new Set(mockReviews.map(r => r.professorName))).sort();
const UNIQUE_COURSES = Array.from(new Set(mockReviews.map(r => r.courseName))).sort();

// Memoized Stats Card
const StatsCard = React.memo(({ label, value, icon: Icon }: { label: string; value: string | number; icon: any }) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-xl shadow-md border border-gray-100 hover:border-indigo-100 transition-all duration-300"
  >
    <div className="flex items-center gap-3 mb-2">
      <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg">
        <Icon className="w-5 h-5 text-white" />
      </div>
      <p className="text-sm text-gray-600">{label}</p>
    </div>
    <p className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{value}</p>
  </motion.div>
));

// Memoized Star Rating
const StarRating = React.memo(({ rating }: { rating: number }) => (
  <div className="flex">
    {[...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`}
      />
    ))}
  </div>
));

// Memoized User Avatar
const UserAvatar = React.memo(({ review }: { review: Review }) => (
  <>
    {review.anonymous ? (
      <User className="w-4 h-4" />
    ) : (
      review.userId.avatarUrl ? (
        <img
          src={review.userId.avatarUrl}
          alt={review.userId.username}
          className="w-6 h-6 rounded-full"
          loading="lazy"
        />
      ) : (
        <User className="w-4 h-4" />
      )
    )}
  </>
));

// Memoized Review Card
const ReviewCard = React.memo(({ 
  review, 
  onHelpful, 
  isHelpful, 
  currentUser 
}: { 
  review: Review;
  onHelpful: (id: string) => void;
  isHelpful: boolean;
  currentUser: any;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -5 }}
    className="group bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:border-indigo-100 transition-all duration-300 relative overflow-hidden"
  >
    {/* Gradient overlay on hover */}
    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
    
    <div className="relative z-10">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">{review.courseName}</h3>
          <p className="text-sm text-gray-500">{review.courseCode}</p>
        </div>
        <StarRating rating={review.rating} />
      </div>

      <p className="text-gray-600 mb-4 line-clamp-3 group-hover:text-gray-700 transition-colors">{review.review}</p>

      <div className="flex justify-between items-center text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-gray-100 rounded-full">
            <UserAvatar review={review} />
          </div>
          <span className="font-medium">{review.anonymous ? 'Anonymous' : review.userId.username}</span>
          <span>•</span>
          <span>Sem {review.semester}</span>
          <span>•</span>
          <span className="truncate max-w-[150px]">Prof. {review.professorName}</span>
        </div>

        <button
          onClick={() => onHelpful(review._id)}
          disabled={!currentUser || isHelpful}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full transition-all duration-300 ${
            isHelpful 
              ? 'bg-indigo-100 text-indigo-600' 
              : 'hover:bg-gray-100 hover:text-indigo-600'
          }`}
        >
          <ThumbsUp className="w-4 h-4" />
          <span>{review.helpfulCount}</span>
        </button>
      </div>
    </div>
  </motion.div>
));

// Memoized Filter Section
const FilterSection = React.memo(({ 
  filters, 
  onFilterChange 
}: { 
  filters: { professor: string; course: string; sortBy: string; };
  onFilterChange: (key: string, value: string) => void;
}) => (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="bg-white p-6 rounded-xl shadow-md border border-gray-100"
  >
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Professor</label>
        <select
          aria-label="Filter by professor"
          value={filters.professor}
          onChange={(e) => onFilterChange('professor', e.target.value)}
          className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
        >
          <option value="">All Professors</option>
          {UNIQUE_PROFESSORS.map(prof => (
            <option key={prof} value={prof}>{prof}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
        <select
          aria-label="Filter by course"
          value={filters.course}
          onChange={(e) => onFilterChange('course', e.target.value)}
          className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
        >
          <option value="">All Courses</option>
          {UNIQUE_COURSES.map(course => (
            <option key={course} value={course}>{course}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
        <select
          aria-label="Sort reviews by"
          value={filters.sortBy}
          onChange={(e) => onFilterChange('sortBy', e.target.value)}
          className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
        >
          <option value="recent">Most Recent</option>
          <option value="helpful">Most Helpful</option>
          <option value="rating">Highest Rated</option>
        </select>
      </div>
    </div>
  </motion.div>
));

export default function CourseReviewList({ college, branch, onAddReview, currentUser }: CourseReviewListProps) {
  // Simplified state
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filters, setFilters] = React.useState({ professor: '', course: '', sortBy: 'recent' });
  const [showFilters, setShowFilters] = React.useState(false);
  const [helpfulReviews, setHelpfulReviews] = React.useState<Set<string>>(new Set());

  // Optimized filtering with useCallback
  const getFilteredReviews = React.useCallback(() => {
    const searchLower = searchTerm.toLowerCase();
    return mockReviews.filter(review => {
      if (searchTerm && !review.courseName.toLowerCase().includes(searchLower) && 
          !review.courseCode.toLowerCase().includes(searchLower) && 
          !review.professorName.toLowerCase().includes(searchLower)) {
        return false;
      }
      if (filters.professor && review.professorName !== filters.professor) return false;
      if (filters.course && review.courseName !== filters.course) return false;
      return true;
    });
  }, [searchTerm, filters.professor, filters.course]);

  // Memoized filtered and sorted reviews
  const filteredAndSortedReviews = React.useMemo(() => {
    const filtered = getFilteredReviews();
    switch (filters.sortBy) {
      case 'recent':
        return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case 'helpful':
        return filtered.sort((a, b) => b.helpfulCount - a.helpfulCount);
      default:
        return filtered.sort((a, b) => b.rating - a.rating);
    }
  }, [getFilteredReviews, filters.sortBy]);

  // Memoized stats calculation
  const stats = React.useMemo(() => {
    const total = filteredAndSortedReviews.length;
    return {
      avgRating: total ? (filteredAndSortedReviews.reduce((acc, rev) => acc + rev.rating, 0) / total).toFixed(1) : '0.0',
      totalReviews: total,
      recentReviews: filteredAndSortedReviews.filter(rev => 
        Date.now() - new Date(rev.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000
      ).length
    };
  }, [filteredAndSortedReviews]);

  // Optimized handlers
  const handleFilterChange = React.useCallback((key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleHelpful = React.useCallback((reviewId: string) => {
    if (!currentUser) return;
    setHelpfulReviews(prev => new Set(prev).add(reviewId));
  }, [currentUser]);

  const handleSearchChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">Course Reviews</h1>
          <p className="text-gray-600">Discover what your peers think about different courses</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onAddReview}
          className={`px-6 py-3 rounded-lg transition-all duration-300 ${
            currentUser
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
          disabled={!currentUser}
        >
          {currentUser ? 'Write a Review' : 'Login to Review'}
        </motion.button>
      </motion.div>

      {/* Stats */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
      >
        <StatsCard label="Average Rating" value={stats.avgRating} icon={Star} />
        <StatsCard label="Total Reviews" value={stats.totalReviews} icon={MessageSquare} />
        <StatsCard label="Recent Reviews" value={stats.recentReviews} icon={Clock} />
      </motion.div>

      {/* Search and Filters */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4 mb-8"
      >
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search reviews..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowFilters(prev => !prev)}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-lg hover:border-indigo-200 hover:bg-gray-50 transition-all"
          >
            <Filter className="w-5 h-5" />
            <span>Filters</span>
          </motion.button>
        </div>

        <AnimatePresence>
          {showFilters && <FilterSection filters={filters} onFilterChange={handleFilterChange} />}
        </AnimatePresence>
      </motion.div>

      {/* Reviews List */}
      {filteredAndSortedReviews.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16 bg-white rounded-xl border border-gray-100"
        >
          <p className="text-gray-600 text-lg">No reviews found. Be the first to write one!</p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {filteredAndSortedReviews.map((review, index) => (
            <motion.div
              key={review._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <ReviewCard
                review={review}
                onHelpful={handleHelpful}
                isHelpful={helpfulReviews.has(review._id)}
                currentUser={currentUser}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
} 