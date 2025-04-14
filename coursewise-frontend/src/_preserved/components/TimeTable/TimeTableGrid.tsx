import React from 'react';
import { motion } from 'framer-motion';
import { Course, days, timeSlots, formatTimeSlot, to24Hour } from './mockData';
import { Info, Clock } from 'lucide-react';

interface TimeTableGridProps {
  courses: Course[];
}

const getTypeColor = (type: string) => {
  switch (type) {
    case 'lecture':
      return 'bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200 text-indigo-800 hover:from-indigo-100 hover:to-indigo-200 hover:border-indigo-300 hover:shadow-indigo-100';
    case 'tutorial':
      return 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 text-purple-800 hover:from-purple-100 hover:to-purple-200 hover:border-purple-300 hover:shadow-purple-100';
    case 'lab':
      return 'bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200 text-pink-800 hover:from-pink-100 hover:to-pink-200 hover:border-pink-300 hover:shadow-pink-100';
    default:
      return 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200 text-gray-800 hover:from-gray-100 hover:to-gray-200 hover:border-gray-300 hover:shadow-gray-100';
  }
};

const TimeTableGrid: React.FC<TimeTableGridProps> = ({ courses }) => {
  const grid = Array(days.length).fill(null).map(() => 
    Array(timeSlots.length - 1).fill(null)
  );

  // Fill the grid with courses
  courses.forEach(course => {
    course.schedule.forEach(slot => {
      const dayIndex = days.indexOf(slot.day);
      const startTime = to24Hour(slot.startTime);
      const endTime = to24Hour(slot.endTime);
      
      // Find start and end indices
      const startIndex = timeSlots.findIndex(time => time === startTime);
      const endIndex = timeSlots.findIndex(time => time === endTime) - 1;
      
      if (dayIndex !== -1 && startIndex !== -1 && endIndex >= 0) {
        for (let i = startIndex; i <= endIndex; i++) {
          grid[dayIndex][i] = {
            ...course,
            isStart: i === startIndex,
            isEnd: i === endIndex,
            duration: endIndex - startIndex + 1
          };
        }
      }
    });
  });

  return (
    <div className="w-full bg-white rounded-xl shadow-lg border border-gray-200 my-6">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gradient-to-r from-indigo-600 to-purple-600">
            <th className="p-4 border-r border-white/10 w-32 text-white font-medium">
              Day / Time
            </th>
            {timeSlots.map((time, index) => (
              index < timeSlots.length - 1 && (
                <th key={time} className="p-2 text-white font-medium border-r border-white/10 last:border-r-0">
                  <div className="text-sm whitespace-nowrap">{formatTimeSlot(time)}</div>
                  <div className="text-xs text-white/70 whitespace-nowrap">
                    - {formatTimeSlot(timeSlots[index + 1])}
                  </div>
                </th>
              )
            ))}
          </tr>
        </thead>
        <tbody>
          {days.map((day, dayIndex) => (
            <tr key={day} className="border-b border-gray-200 last:border-b-0">
              <td className="p-4 border-r border-gray-200 bg-gray-50 font-medium text-gray-600">
                {day}
              </td>
              {grid[dayIndex].map((cell, timeIndex) => {
                if (!cell || !cell.isStart) return (
                  <td key={`${day}-${timeIndex}`} className="border-r border-gray-200 last:border-r-0 p-1 h-24" />
                );

                return (
                  <td
                    key={`${day}-${timeIndex}`}
                    className="border-r border-gray-200 last:border-r-0 p-1 h-24"
                    colSpan={cell.duration}
                  >
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      transition={{ duration: 0.2 }}
                      className={`h-full p-2 rounded-lg border ${getTypeColor(cell.type || 'lecture')} 
                        transition-all duration-200 cursor-pointer group shadow-sm hover:shadow-md flex flex-col`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-sm truncate">{cell.code}</div>
                          <div className="text-xs truncate">{cell.name}</div>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap
                          ${cell.type === 'lecture' ? 'bg-indigo-100/50 text-indigo-800' :
                            cell.type === 'tutorial' ? 'bg-purple-100/50 text-purple-800' :
                            'bg-pink-100/50 text-pink-800'}`}
                        >
                          {cell.type}
                        </span>
                      </div>
                      
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                        className="mt-1 text-xs space-y-1 flex-1 flex flex-col justify-end"
                      >
                        <div className="flex items-center gap-1 text-gray-600">
                          <Clock size={12} />
                          <span>{cell.schedule[0].startTime} - {cell.schedule[0].endTime}</span>
                        </div>
                        <div className="flex items-start gap-1 text-gray-600">
                          <Info size={12} className="mt-0.5 flex-shrink-0" />
                          <p className="line-clamp-2">{cell.description}</p>
                        </div>
                      </motion.div>
                    </motion.div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TimeTableGrid; 