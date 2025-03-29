import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface RecommendationChoiceProps {
  hasPreviousRecommendations: boolean;
  onViewPrevious: () => void;
  onStartNew: () => void;
}

const RecommendationChoice: React.FC<RecommendationChoiceProps> = ({
  hasPreviousRecommendations,
  onViewPrevious,
  onStartNew,
}) => {
  const navigate = useNavigate();

  // For first-time users, automatically redirect to new recommendations
  useEffect(() => {
    if (!hasPreviousRecommendations) {
      handleStartNew();
    }
  }, [hasPreviousRecommendations]);

  const handleStartNew = () => {
    onStartNew();
    navigate('/courses/recommendations/new');
  };

  const handleViewPrevious = () => {
    onViewPrevious();
    navigate('/courses/recommendations/results');
  };

  // If it's a first-time user, show loading state
  if (!hasPreviousRecommendations) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-gray-600"
          >
            Preparing your recommendation form...
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white backdrop-blur-lg bg-opacity-90 p-8 rounded-2xl shadow-xl"
        >
          <h1 className="text-3xl font-bold text-center mb-8">
            Course Recommendations
          </h1>
          
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-green-50 p-6 rounded-xl"
            >
              <h2 className="text-xl font-semibold mb-4">Start Fresh</h2>
              <p className="text-gray-600 mb-6">
                Would you like to start a new recommendation process? We'll ask you a few questions to understand your preferences better.
              </p>
              <button
                onClick={handleStartNew}
                className="w-full bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors duration-200 flex items-center justify-center group"
              >
                Start New Recommendations
                <svg 
                  className="ml-2 w-5 h-5 transform group-hover:translate-x-1 transition-transform" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </motion.div>

            {hasPreviousRecommendations && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-blue-50 p-6 rounded-xl"
              >
                <h2 className="text-xl font-semibold mb-4">Previous Recommendations</h2>
                <p className="text-gray-600 mb-6">
                  We found your previous course recommendations. Would you like to view them again?
                </p>
                <button
                  onClick={handleViewPrevious}
                  className="w-full bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center justify-center group"
                >
                  View Previous Recommendations
                  <svg 
                    className="ml-2 w-5 h-5 transform group-hover:translate-x-1 transition-transform" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RecommendationChoice; 