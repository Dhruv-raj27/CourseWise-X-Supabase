import { Course } from '../database/courses_data/courseData';
import { Clock, BookOpen, Trash2 } from 'lucide-react';

interface SelectedCoursesProps {
  courses: Course[];
  onRemoveCourse?: (course: Course) => void;
}

export default function SelectedCourses({ courses, onRemoveCourse }: SelectedCoursesProps) {
  const totalCredits = courses.reduce((sum, course) => sum + course.credits, 0);

  const checkTimeClash = () => {
    const clashes: [Course, Course][] = [];
    
    for (let i = 0; i < courses.length; i++) {
      for (let j = i + 1; j < courses.length; j++) {
        const course1 = courses[i];
        const course2 = courses[j];
        
        const hasClash = course1.schedule.some(time1 =>
          course2.schedule.some(time2 => {
            if (time1.day !== time2.day) return false;
            
            const start1 = new Date(`2000-01-01T${time1.startTime}`);
            const end1 = new Date(`2000-01-01T${time1.endTime}`);
            const start2 = new Date(`2000-01-01T${time2.startTime}`);
            const end2 = new Date(`2000-01-01T${time2.endTime}`);
            
            return (start1 < end2 && end1 > start2);
          })
        );
        
        if (hasClash) {
          clashes.push([course1, course2]);
        }
      }
    }
    
    if (clashes.length === 0) {
      alert('No time clashes found! Your schedule is compatible.');
    } else {
      const clashMessages = clashes.map(([c1, c2]) => 
        `${c1.code} and ${c2.code} have conflicting schedules`
      );
      alert('Time clashes found:\n\n' + clashMessages.join('\n'));
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">Selected Courses</h2>
        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="text-white">
              <p className="text-sm font-medium opacity-90">Total Credits</p>
              <p className="text-2xl font-bold">{totalCredits}</p>
            </div>
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {courses.map(course => (
          <div
            key={course.id}
            className="p-3 rounded-lg border border-gray-200 bg-white hover:border-indigo-200 hover:shadow-sm transition-all duration-200"
          >
            <div className="flex justify-between items-center">
              <div className="flex-1 mr-4">
                <div className="flex items-center justify-between mb-1.5">
                  <h3 className="font-medium text-base">{course.name}</h3>
                  <span className="text-sm font-mono bg-gray-100 px-2 py-0.5 rounded ml-2 flex-shrink-0">
                    {course.code}
                  </span>
                </div>
                
                <div className="flex items-center text-sm text-gray-600 gap-4">
                  <div className="flex items-center">
                    <BookOpen className="w-4 h-4 mr-1.5" />
                    <span>{course.credits} Credits</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1.5" />
                    <span>{course.schedule.length} Sessions</span>
                  </div>
                  <div className="text-gray-500">
                    {course.schedule[0].day} {course.schedule[0].startTime}-{course.schedule[0].endTime}
                  </div>
                </div>
              </div>
              
              {onRemoveCourse && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveCourse(course);
                  }}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all duration-200 flex-shrink-0"
                  title="Remove course"
                >
                  <Trash2 className="w-4.5 h-4.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {courses.length > 0 && (
        <button
          onClick={checkTimeClash}
          className="w-full mt-6 bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-2.5 px-4 rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 font-medium"
        >
          Check Time Clashes
        </button>
      )}
    </div>
  );
}