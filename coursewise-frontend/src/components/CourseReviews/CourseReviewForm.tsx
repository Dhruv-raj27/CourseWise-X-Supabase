import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Loader2 } from 'lucide-react';

interface CourseReviewFormProps {
  onSubmit: (review: ReviewFormData) => Promise<void>;
  onCancel: () => void;
  college: string;
  branch: string;
}

interface ReviewFormData {
  courseName: string;
  courseCode: string;
  professorName: string;
  rating: number;
  difficulty: number;
  review: string;
  semester: string;
  anonymous: boolean;
}

export default function CourseReviewForm({ onSubmit, onCancel, college, branch }: CourseReviewFormProps) {
  const [formData, setFormData] = useState<ReviewFormData>({
    courseName: '',
    courseCode: '',
    professorName: '',
    rating: 0,
    difficulty: 0,
    review: '',
    semester: '',
    anonymous: false,
  });

  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [hoveredDifficulty, setHoveredDifficulty] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (
    count: number,
    hoveredCount: number | null,
    selectedCount: number,
    onSelect: (value: number) => void,
    onHover: (value: number | null) => void
  ) => {
    return Array.from({ length: count }, (_, i) => (
      <motion.button
        key={i}
        type="button"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => onSelect(i + 1)}
        onMouseEnter={() => onHover(i + 1)}
        onMouseLeave={() => onHover(null)}
        className="focus:outline-none"
      >
        <Star
          className={`w-8 h-8 ${
            (hoveredCount !== null ? i < hoveredCount : i < selectedCount)
              ? 'text-yellow-400 fill-yellow-400'
              : 'text-gray-300'
          } transition-colors duration-200`}
        />
      </motion.button>
    ));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-xl shadow-lg p-6 max-w-2xl mx-auto"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Write a Course Review
          </h2>
          <button
            type="button"
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Course Name
            </label>
            <input
              type="text"
              name="courseName"
              value={formData.courseName}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              placeholder="e.g., Data Structures"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Course Code
            </label>
            <input
              type="text"
              name="courseCode"
              value={formData.courseCode}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              placeholder="e.g., CS201"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Professor Name
          </label>
          <input
            type="text"
            name="professorName"
            value={formData.professorName}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            placeholder="e.g., Dr. John Doe"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Course Rating
          </label>
          <div className="flex space-x-2">
            {renderStars(
              5,
              hoveredRating,
              formData.rating,
              (value) => setFormData(prev => ({ ...prev, rating: value })),
              setHoveredRating
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Course Difficulty
          </label>
          <div className="flex space-x-2">
            {renderStars(
              5,
              hoveredDifficulty,
              formData.difficulty,
              (value) => setFormData(prev => ({ ...prev, difficulty: value })),
              setHoveredDifficulty
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Review
          </label>
          <textarea
            name="review"
            value={formData.review}
            onChange={handleChange}
            required
            rows={4}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            placeholder="Share your experience with this course..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Semester
          </label>
          <select
            name="semester"
            value={formData.semester}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          >
            <option value="">Select Semester</option>
            {Array.from({ length: 8 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                Semester {i + 1}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            name="anonymous"
            checked={formData.anonymous}
            onChange={handleChange}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label className="ml-2 text-sm text-gray-700">
            Post anonymously
          </label>
        </div>

        <div className="flex justify-end space-x-4">
          <motion.button
            type="button"
            onClick={onCancel}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </motion.button>
          <motion.button
            type="submit"
            disabled={isSubmitting}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Submitting...</span>
              </>
            ) : (
              <span>Submit Review</span>
            )}
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
} 