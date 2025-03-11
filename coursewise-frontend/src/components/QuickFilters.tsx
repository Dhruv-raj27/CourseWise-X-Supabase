import { useState } from 'react';
import { motion } from 'framer-motion';

interface QuickFiltersProps {
  onFilterChange: (filters: {
    difficulty: string;
    timeCommitment: string;
    credits: string;
  }) => void;
}

export default function QuickFilters({ onFilterChange }: QuickFiltersProps) {
  const [filters, setFilters] = useState({
    difficulty: 'All Levels',
    timeCommitment: 'Any Time',
    credits: 'Any Credits'
  });

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const filterOptions = {
    difficulty: ['All Levels', 'Beginner', 'Intermediate', 'Advanced'],
    timeCommitment: ['Any Time', '1-3 hours/week', '4-6 hours/week', '7+ hours/week'],
    credits: ['Any Credits', '2', '3', '4']
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-xl shadow-md"
    >
      <h3 className="text-lg font-semibold mb-4">Quick Filters</h3>
      <div className="space-y-4">
        {/* Difficulty Filter */}
        <div>
          <label className="text-sm text-gray-600 mb-2 block">Difficulty Level</label>
          <div className="flex flex-wrap gap-2">
            {filterOptions.difficulty.map((option) => (
              <button
                key={option}
                onClick={() => handleFilterChange('difficulty', option)}
                className={`px-3 py-1 rounded-full text-sm ${
                  filters.difficulty === option
                    ? 'bg-indigo-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Time Commitment Filter */}
        <div>
          <label className="text-sm text-gray-600 mb-2 block">Time Commitment</label>
          <div className="flex flex-wrap gap-2">
            {filterOptions.timeCommitment.map((option) => (
              <button
                key={option}
                onClick={() => handleFilterChange('timeCommitment', option)}
                className={`px-3 py-1 rounded-full text-sm ${
                  filters.timeCommitment === option
                    ? 'bg-indigo-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Credits Filter */}
        <div>
          <label className="text-sm text-gray-600 mb-2 block">Credits</label>
          <div className="flex flex-wrap gap-2">
            {filterOptions.credits.map((option) => (
              <button
                key={option}
                onClick={() => handleFilterChange('credits', option)}
                className={`px-3 py-1 rounded-full text-sm ${
                  filters.credits === option
                    ? 'bg-indigo-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
} 