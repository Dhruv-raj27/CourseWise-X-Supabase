import { useState, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CourseReviewForm from './CourseReviewForm';
import CourseReviewList from './CourseReviewList';

interface CourseReviewsProps {
  currentUser: any;
}

const institutions = {
  active: [
    'Indraprastha Institute of Information Technology Delhi',
  ],
  comingSoon: [
    'Indian Institute of Technology Delhi',
    'Delhi Technological University',
    'Netaji Subhas University of Technology',
    'National Institute of Technology Delhi',
    'Jamia Millia Islamia',
    'Delhi University',
    'Guru Gobind Singh Indraprastha University',
    'Ambedkar University Delhi',
  ],
} as const;

const branches = {
  'Indraprastha Institute of Information Technology Delhi': [
    'All Branches',
    'Computer Science and Engineering',
    'Electronics and Communications Engineering',
    'Computational Biology',
    'Computer Science and Artificial Intelligence',
    'Computer Science and Design',
    'Computer Science and Social Sciences',
    'Computer Science and Biosciences',
    'Information Technology and Social Sciences',
  ],
  // Add more institutions and their branches here
};

// Memoize the institution selector component
const InstitutionSelector = memo(({ 
  selectedCollege, 
  selectedBranch, 
  onCollegeChange, 
  onBranchChange, 
  onContinue 
}: {
  selectedCollege: string;
  selectedBranch: string;
  onCollegeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onBranchChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onContinue: () => void;
}) => (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 py-8">
    <div className="container mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8 border border-gray-100"
      >
        <motion.h2 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2"
        >
          Select Your Institution
        </motion.h2>
        <p className="text-gray-600 mb-8">Choose your college and branch to view relevant course reviews</p>
        
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <label className="block text-sm font-medium text-gray-700 mb-2">
              College/University
            </label>
            <select
              value={selectedCollege}
              onChange={onCollegeChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-gray-50 hover:bg-white"
            >
              <option value="">Select your institution</option>
              <optgroup label="Available">
                {institutions.active.map(inst => (
                  <option key={inst} value={inst}>{inst}</option>
                ))}
              </optgroup>
              <optgroup label="Coming Soon">
                {institutions.comingSoon.map(inst => (
                  <option key={inst} value={inst} disabled>
                    {inst} (Coming Soon)
                  </option>
                ))}
              </optgroup>
            </select>
          </motion.div>

          {selectedCollege && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Branch
              </label>
              <select
                value={selectedBranch}
                onChange={onBranchChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-gray-50 hover:bg-white"
              >
                <option value="">Select your branch</option>
                {branches[selectedCollege as keyof typeof branches]?.map(branch => (
                  <option key={branch} value={branch}>{branch}</option>
                ))}
              </select>
            </motion.div>
          )}

          {selectedCollege && selectedBranch && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="pt-4"
            >
              <button
                onClick={onContinue}
                className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-indigo-200 transition-all"
              >
                Continue to Reviews
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  </div>
));

export default function CourseReviews({ currentUser }: CourseReviewsProps) {
  const [showForm, setShowForm] = useState(false);
  const [selectedCollege, setSelectedCollege] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [hasSelectedPreferences, setHasSelectedPreferences] = useState(false);

  const handleCollegeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedCollege(value);
    setSelectedBranch(''); // Reset branch when college changes
  }, []);

  const handleBranchChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedBranch(e.target.value);
  }, []);

  const handleContinue = useCallback(() => {
    if (selectedCollege && selectedBranch) {
      setHasSelectedPreferences(true);
    }
  }, [selectedCollege, selectedBranch]);

  const handleReviewSubmit = useCallback(async (reviewData: any) => {
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...reviewData,
          college: selectedCollege,
          branch: selectedBranch,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit review');
      }

      setShowForm(false);
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  }, [selectedCollege, selectedBranch]);

  const handleAddReview = useCallback(() => {
    setShowForm(true);
  }, []);

  const handleCancelReview = useCallback(() => {
    setShowForm(false);
  }, []);

  if (!hasSelectedPreferences) {
    return (
      <InstitutionSelector
        selectedCollege={selectedCollege}
        selectedBranch={selectedBranch}
        onCollegeChange={handleCollegeChange}
        onBranchChange={handleBranchChange}
        onContinue={handleContinue}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-2xl"
            >
              <CourseReviewForm
                onSubmit={handleReviewSubmit}
                onCancel={handleCancelReview}
                college={selectedCollege}
                branch={selectedBranch}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <CourseReviewList
        college={selectedCollege}
        branch={selectedBranch}
        onAddReview={handleAddReview}
        currentUser={currentUser}
      />
    </div>
  );
} 