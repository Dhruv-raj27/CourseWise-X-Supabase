import { Course } from '../types';

// Helper function to generate random time slots
const generateTimeSlots = () => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const startTimes = ['09:00', '10:30', '14:00', '15:30'];
  const endTimes = ['10:30', '12:00', '15:30', '17:00'];
  
  const numSlots = 1 + Math.floor(Math.random() * 2); // 1 or 2 slots per course
  const slots = [];
  
  for (let i = 0; i < numSlots; i++) {
    const timeIndex = Math.floor(Math.random() * startTimes.length);
    slots.push({
      day: days[Math.floor(Math.random() * days.length)],
      startTime: startTimes[timeIndex],
      endTime: endTimes[timeIndex]
    });
  }
  
  return slots;
};

export const courses: Course[] = [
  // First Year (UG - Semester II)
  {
    id: 'BIO102',
    name: 'Foundations of Biology I',
    code: 'BIO102',
    credits: 4,
    prerequisites: [],
    schedule: generateTimeSlots(),
    stream: 'Biology',
    semester: 2,
    description: 'Introduction to fundamental biological concepts and principles.'
  },
  {
    id: 'CSE102A',
    name: 'Data Structures and Algorithms (Sec A)',
    code: 'CSE102A',
    credits: 4,
    prerequisites: ['Programming Basics'],
    schedule: generateTimeSlots(),
    stream: 'Computer Science',
    semester: 2,
    description: 'Fundamental course covering various data structures and algorithmic techniques.'
  },
  {
    id: 'CSE102B',
    name: 'Data Structures and Algorithms (Sec B)',
    code: 'CSE102B',
    credits: 4,
    prerequisites: ['Programming Basics'],
    schedule: generateTimeSlots(),
    stream: 'Computer Science',
    semester: 2,
    description: 'Fundamental course covering various data structures and algorithmic techniques.'
  },
  // Add more first-year courses...

  // Second Year (UG - Semester IV)
  {
    id: 'CSE202A',
    name: 'Fundamentals of Database Systems (Sec A)',
    code: 'CSE202A',
    credits: 4,
    prerequisites: ['Data Structures'],
    schedule: generateTimeSlots(),
    stream: 'Computer Science',
    semester: 4,
    description: 'Introduction to database concepts, SQL, and database design.'
  },
  {
    id: 'CSE222A',
    name: 'Analysis and Design of Algorithms (Sec A)',
    code: 'CSE222A',
    credits: 4,
    prerequisites: ['Data Structures'],
    schedule: generateTimeSlots(),
    stream: 'Computer Science',
    semester: 4,
    description: 'Advanced algorithmic techniques and complexity analysis.'
  },
  // Add more second-year courses...

  // Third and Fourth Year Electives
  {
    id: 'CSE641',
    name: 'Deep Learning',
    code: 'CSE641',
    credits: 4,
    prerequisites: ['Machine Learning'],
    schedule: generateTimeSlots(),
    stream: 'Computer Science',
    semester: 6,
    description: 'Advanced deep learning concepts and applications.'
  },
  // Add more elective courses...
];

// Add more courses following the same pattern