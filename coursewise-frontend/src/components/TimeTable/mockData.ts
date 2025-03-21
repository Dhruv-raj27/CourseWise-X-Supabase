import { IIITDCourses } from '../../data/courseData';

export interface Course {
  id: string;
  code: string;
  name: string;
  professor?: string;
  type?: 'lecture' | 'tutorial' | 'lab';
  credits: number;
  stream: string;
  semester: number;
  prerequisites: string[];
  description: string;
  schedule: {
    day: string;
    startTime: string;
    endTime: string;
  }[];
}

// Helper function to determine course type based on code and name
const getCourseType = (code: string, name: string): 'lecture' | 'tutorial' | 'lab' => {
  if (name.toLowerCase().includes('lab') || code.toLowerCase().includes('lab')) {
    return 'lab';
  }
  if (name.toLowerCase().includes('tutorial') || code.toLowerCase().includes('tut')) {
    return 'tutorial';
  }
  return 'lecture';
};

// Process IIITD courses to add type
export const mockCourses: Course[] = IIITDCourses.map(course => ({
  ...course,
  type: getCourseType(course.code, course.name),
  professor: 'TBA' // We can update this when we have professor data
}));

export const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
export const timeSlots = [
  '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00',
  '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00'
];

// Helper function to format time slot for display
export const formatTimeSlot = (time: string): string => {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  if (hour > 12) {
    return `${hour - 12}:${minutes}`;
  }
  if (hour === 0) {
    return `12:${minutes}`;
  }
  return `${hour}:${minutes}`;
};

// Helper function to convert time to 24-hour format
export const to24Hour = (time: string): string => {
  if (time.includes(':')) return time;
  const [hour, period] = time.split(' ');
  const hourNum = parseInt(hour);
  if (period?.toLowerCase() === 'pm' && hourNum !== 12) {
    return `${hourNum + 12}:00`;
  }
  if (period?.toLowerCase() === 'am' && hourNum === 12) {
    return '00:00';
  }
  return `${hourNum.toString().padStart(2, '0')}:00`;
};

// Helper function to check for time clash
export const checkTimeClash = (course1: Course, course2: Course): boolean => {
  for (const slot1 of course1.schedule) {
    for (const slot2 of course2.schedule) {
      if (slot1.day === slot2.day) {
        const start1 = timeToMinutes(slot1.startTime);
        const end1 = timeToMinutes(slot1.endTime);
        const start2 = timeToMinutes(slot2.startTime);
        const end2 = timeToMinutes(slot2.endTime);

        if (
          (start1 >= start2 && start1 < end2) ||
          (end1 > start2 && end1 <= end2) ||
          (start2 >= start1 && start2 < end1) ||
          (end2 > start1 && end2 <= end1)
        ) {
          return true;
        }
      }
    }
  }
  return false;
};

// Helper function to convert time to minutes for easier comparison
const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + (minutes || 0);
}; 