import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Download, Trash2, AlertTriangle, X } from 'lucide-react';
import TimeTableGrid from './TimeTableGrid';
import CourseSelector from './CourseSelector';
import { Course, checkTimeClash } from './mockData';

const TimeTable: React.FC = () => {
  const [selectedCourses, setSelectedCourses] = useState<Course[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clashWarning, setClashWarning] = useState<{
    newCourse: Course;
    clashingCourses: Course[];
  } | null>(null);

  const handleAddCourse = (course: Course) => {
    // Check for clashes with existing courses
    const clashingCourses = selectedCourses.filter(existingCourse => 
      checkTimeClash(course, existingCourse)
    );

    if (clashingCourses.length > 0) {
      setClashWarning({ newCourse: course, clashingCourses });
      return;
    }

    setSelectedCourses(prev => [...prev, course]);
    setIsModalOpen(false);
  };

  const handleRemoveCourse = (courseId: string) => {
    setSelectedCourses(prev => prev.filter(course => course.id !== courseId));
  };

  const handleReplaceCourses = () => {
    if (clashWarning) {
      const { newCourse, clashingCourses } = clashWarning;
      setSelectedCourses(prev => [
        ...prev.filter(course => !clashingCourses.includes(course)),
        newCourse
      ]);
      setClashWarning(null);
      setIsModalOpen(false);
    }
  };

  const handleDownload = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Course Timetable</title>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
              
              body {
                font-family: 'Inter', system-ui, -apple-system, sans-serif;
                margin: 0;
                padding: 20px;
                background: #f9fafb;
              }
              
              .container {
                max-width: 1200px;
                margin: 0 auto;
                background: white;
                padding: 20px;
                border-radius: 12px;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
              }
              
              h1 {
                color: #1f2937;
                margin-bottom: 8px;
              }
              
              .subtitle {
                color: #6b7280;
                margin-bottom: 24px;
              }
              
              .course-list {
                margin-bottom: 24px;
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                gap: 16px;
              }
              
              .course-card {
                padding: 16px;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                background: #f9fafb;
              }
              
              .course-card h3 {
                margin: 0 0 4px 0;
                color: #1f2937;
              }
              
              .course-card p {
                margin: 0;
                color: #6b7280;
                font-size: 14px;
              }
              
              .schedule {
                margin-top: 8px;
                font-size: 14px;
                color: #4b5563;
              }
              
              table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 24px;
                background: white;
              }
              
              th, td {
                border: 1px solid #e5e7eb;
                padding: 12px;
                text-align: left;
              }
              
              th {
                background: #4f46e5;
                color: white;
                font-weight: 500;
              }
              
              .course-cell {
                padding: 8px;
                border-radius: 6px;
                margin: 4px;
              }
              
              .lecture { background-color: #e0e7ff; color: #3730a3; }
              .tutorial { background-color: #f3e8ff; color: #6b21a8; }
              .lab { background-color: #fce7f3; color: #9d174d; }
              
              @media print {
                body { background: white; }
                .container { box-shadow: none; }
                @page { size: landscape; }
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Course Timetable</h1>
              <div class="subtitle">Generated on ${new Date().toLocaleDateString()}</div>
              
              <div class="course-list">
                ${selectedCourses.map(course => `
                  <div class="course-card">
                    <h3>${course.code}</h3>
                    <p>${course.name}</p>
                    <div class="schedule">
                      ${course.schedule.map(slot => 
                        `${slot.day} • ${slot.startTime} - ${slot.endTime}`
                      ).join('<br>')}
                    </div>
                  </div>
                `).join('')}
              </div>
              
              <div id="timetable"></div>
            </div>
            <script>
              window.onload = () => window.print();
            </script>
          </body>
        </html>
      `);
      
      // Clone the timetable and add it to the print window
      const timetableElement = document.querySelector('.w-full.bg-white.rounded-xl');
      if (timetableElement) {
        const clone = timetableElement.cloneNode(true);
        printWindow.document.getElementById('timetable')?.appendChild(clone);
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Course Timetable</h1>
            <p className="text-gray-600 mt-2">
              Create and manage your course schedule
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus size={20} />
              Add Course
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Download size={20} />
              Download
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedCourses.map(course => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="p-4 border rounded-lg bg-white shadow-sm"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{course.code}</h3>
                    <p className="text-sm text-gray-600">{course.name}</p>
                    <p className="text-sm text-gray-500 mt-1">{course.professor}</p>
                  </div>
                  <button
                    onClick={() => handleRemoveCourse(course.id)}
                    className="p-1 hover:bg-red-50 rounded-full text-red-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                <div className="mt-2 space-y-1">
                  {course.schedule.map((slot, index) => (
                    <div key={index} className="text-xs text-gray-500">
                      {slot.day} • {slot.startTime} - {slot.endTime}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          <TimeTableGrid courses={selectedCourses} />
        </div>

        <CourseSelector
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSelectCourse={handleAddCourse}
          selectedCourses={selectedCourses}
        />

        {/* Clash Warning Dialog */}
        <AnimatePresence>
          {clashWarning && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-xl p-6 max-w-lg w-full mx-4 shadow-xl"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 text-amber-600">
                    <AlertTriangle size={24} />
                    <h3 className="text-lg font-semibold">Time Clash Detected</h3>
                  </div>
                  <button
                    onClick={() => setClashWarning(null)}
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="mt-4">
                  <p className="text-gray-600">
                    The course <span className="font-medium">{clashWarning.newCourse.code}</span> clashes with:
                  </p>
                  <ul className="mt-2 space-y-2">
                    {clashWarning.clashingCourses.map(course => (
                      <li key={course.id} className="flex items-start gap-2 bg-amber-50 p-3 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{course.code}</p>
                          <p className="text-sm text-gray-600">{course.name}</p>
                          <div className="mt-1 text-sm text-amber-700">
                            {course.schedule.map((slot, idx) => (
                              <div key={idx}>
                                {slot.day} • {slot.startTime} - {slot.endTime}
                              </div>
                            ))}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 flex gap-3 justify-end">
                  <button
                    onClick={() => setClashWarning(null)}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReplaceCourses}
                    className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                  >
                    Replace Clashing Courses
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default TimeTable; 