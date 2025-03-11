import { motion } from 'framer-motion';
import { Target, BookOpen, Trophy } from 'lucide-react';

interface YourPathProps {
  currentFocus: string;
  completedCourses: number;
  totalCourses: number;
}

export default function YourPath({ currentFocus, completedCourses, totalCourses }: YourPathProps) {
  const progress = (completedCourses / totalCourses) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white p-6 rounded-xl shadow-md"
    >
      <h3 className="text-lg font-semibold mb-4">Your Path</h3>
      
      {/* Current Focus */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-indigo-600 mb-2">
          <Target className="w-5 h-5" />
          <span className="text-sm font-medium">Current Focus</span>
        </div>
        <p className="text-gray-800">{currentFocus}</p>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-indigo-600 mb-2">
          <BookOpen className="w-5 h-5" />
          <span className="text-sm font-medium">Course Progress</span>
        </div>
        <div className="relative pt-1">
          <div className="flex mb-2 items-center justify-between">
            <div>
              <span className="text-xs font-semibold inline-block text-indigo-600">
                {completedCourses} of {totalCourses} Courses
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold inline-block text-indigo-600">
                {Math.round(progress)}%
              </span>
            </div>
          </div>
          <div className="flex h-2 mb-4 overflow-hidden rounded bg-indigo-100">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="flex flex-col justify-center overflow-hidden bg-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div>
        <div className="flex items-center gap-2 text-indigo-600 mb-2">
          <Trophy className="w-5 h-5" />
          <span className="text-sm font-medium">Recent Achievements</span>
        </div>
        <div className="space-y-2">
          {completedCourses > 0 && (
            <div className="text-sm text-gray-600">
              • Completed {completedCourses} course{completedCourses !== 1 ? 's' : ''}
            </div>
          )}
          {progress >= 50 && (
            <div className="text-sm text-gray-600">
              • Reached 50% of your goal
            </div>
          )}
          {progress === 100 && (
            <div className="text-sm text-gray-600">
              • Completed all planned courses!
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
} 