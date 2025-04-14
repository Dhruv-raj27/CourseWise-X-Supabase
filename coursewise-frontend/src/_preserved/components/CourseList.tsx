import { Course } from '../database/courses_data/courseData';
import { Clock, BookOpen } from 'lucide-react';

interface CourseListProps {
  courses: Course[];
  selectedCourses: Course[];
  onCourseSelect: (course: Course) => void;
}

export default function CourseList({ courses, selectedCourses, onCourseSelect }: CourseListProps) {
  const isSelected = (course: Course) => selectedCourses.some(c => c.id === course.id);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-4 rounded-lg shadow-md">
        <div className="flex items-center justify-between">
          <div className="text-white">
            <h2 className="text-xl font-semibold">Available Courses</h2>
            <p className="text-sm opacity-90 mt-1">Select courses to add to your schedule</p>
          </div>
          <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {courses.map(course => (
          <div
            key={course.id}
            className={`p-4 rounded-lg border ${
              isSelected(course) ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 bg-white'
            }`}
            onClick={() => onCourseSelect(course)}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{course.name}</h3>
                <div className="flex items-center text-sm text-gray-600 mt-1">
                  <BookOpen className="w-4 h-4 mr-1" />
                  <span>{course.credits} Credits</span>
                  <span className="mx-2">•</span>
                  <Clock className="w-4 h-4 mr-1" />
                  <span>{course.schedule.length} Sessions</span>
                </div>
              </div>
              <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                {course.code}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}