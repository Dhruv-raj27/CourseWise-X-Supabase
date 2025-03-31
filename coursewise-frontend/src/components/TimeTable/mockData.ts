import { Course } from '../../types';

export const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const timeSlots = Array.from({ length: 14 }, (_, i) => {
  const hour = i + 8; // Starting from 8 AM
  return `${hour.toString().padStart(2, '0')}:00`;
});

export const formatTimeSlot = (time: string) => {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

export const to24Hour = (time: string) => {
  const [timeStr, period] = time.split(' ');
  const [hours, minutes] = timeStr.split(':');
  let hour = parseInt(hours);
  if (period === 'PM' && hour !== 12) hour += 12;
  if (period === 'AM' && hour === 12) hour = 0;
  return `${hour.toString().padStart(2, '0')}:${minutes}`;
};

export const mockCourses: Course[] = [
  {
    id: '1',
    code: 'CS101',
    name: 'Introduction to Programming',
    description: 'Basic programming concepts',
    credits: 4,
    semester: 1,
    stream: 'Computer Science',
    prerequisites: [],
    antiRequisites: [],
    schedule: [
      { day: 'Monday', startTime: '09:00', endTime: '10:30' },
      { day: 'Wednesday', startTime: '09:00', endTime: '10:30' }
    ],
    duration: '1.5 hours',
    instructor: 'Dr. Smith',
    tags: ['programming', 'basics'],
    difficulty: 'easy'
  },
  {
    id: '2',
    code: 'CS102',
    name: 'Data Structures',
    description: 'Basic data structures and algorithms',
    credits: 4,
    semester: 2,
    stream: 'Computer Science',
    prerequisites: ['CS101'],
    antiRequisites: [],
    schedule: [
      { day: 'Tuesday', startTime: '11:00', endTime: '12:30' },
      { day: 'Thursday', startTime: '11:00', endTime: '12:30' }
    ],
    duration: '1.5 hours',
    instructor: 'Dr. Johnson',
    tags: ['data structures', 'algorithms'],
    difficulty: 'medium'
  }
];

export const checkTimeClash = (course1: Course, course2: Course): boolean => {
  for (const slot1 of course1.schedule) {
    for (const slot2 of course2.schedule) {
      if (slot1.day === slot2.day) {
        const start1 = new Date(`1970-01-01T${slot1.startTime}`);
        const end1 = new Date(`1970-01-01T${slot1.endTime}`);
        const start2 = new Date(`1970-01-01T${slot2.startTime}`);
        const end2 = new Date(`1970-01-01T${slot2.endTime}`);

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