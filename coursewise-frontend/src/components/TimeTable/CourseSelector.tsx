import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Filter, Clock, Book, Users, Info } from 'lucide-react';
import { Course, mockCourses } from './mockData';

interface CourseSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCourse: (course: Course) => void;
  selectedCourses: Course[];
}

const CourseSelector: React.FC<CourseSelectorProps> = ({
  isOpen,
  onClose,
  onSelectCourse,
  selectedCourses
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('all');
  const [streamFilter, setStreamFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const filteredCourses = mockCourses.filter(course => {
    const matchesSearch = 
      course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSemester = semesterFilter === 'all' || course.semester.toString() === semesterFilter;
    const matchesStream = streamFilter === 'all' || course.stream.includes(streamFilter);
    const matchesType = typeFilter === 'all' || course.type === typeFilter;
    const isNotSelected = !selectedCourses.some(selected => selected.id === course.id);

    return matchesSearch && matchesSemester && matchesStream && matchesType && isNotSelected;
  });

  const uniqueStreams = Array.from(new Set(mockCourses.map(course => course.stream)));
  const semesters = Array.from(new Set(mockCourses.map(course => course.semester))).sort();

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden"
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Add Course to Timetable
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by course code, name, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div className="flex flex-wrap gap-4">
              <select
                value={semesterFilter}
                onChange={(e) => setSemesterFilter(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">All Semesters</option>
                {semesters.map(semester => (
                  <option key={semester} value={semester.toString()}>
                    Semester {semester}
                  </option>
                ))}
              </select>

              <select
                value={streamFilter}
                onChange={(e) => setStreamFilter(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">All Streams</option>
                {uniqueStreams.map(stream => (
                  <option key={stream} value={stream}>{stream}</option>
                ))}
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="lecture">Lecture</option>
                <option value="tutorial">Tutorial</option>
                <option value="lab">Lab</option>
              </select>
            </div>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto">
          <AnimatePresence>
            {filteredCourses.map(course => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                whileHover={{ scale: 1.02 }}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-all cursor-pointer group"
                onClick={() => onSelectCourse(course)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-lg">{course.code}</h3>
                    <p className="text-sm text-gray-600">{course.name}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium
                    ${course.type === 'lecture' ? 'bg-indigo-100 text-indigo-800' :
                      course.type === 'tutorial' ? 'bg-purple-100 text-purple-800' :
                      'bg-pink-100 text-pink-800'}`}
                  >
                    {course.type}
                  </span>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Book size={16} />
                    <span>Semester {course.semester}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={16} />
                    <span>{course.stream}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={16} />
                    <div className="space-y-1">
                      {course.schedule.map((slot, index) => (
                        <div key={index} className="text-xs">
                          {slot.day} • {slot.startTime} - {slot.endTime}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-start gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Info size={16} className="mt-0.5" />
                    <p className="text-xs">{course.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CourseSelector; 