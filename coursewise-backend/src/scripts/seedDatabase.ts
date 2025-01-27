import * as dotenv from 'dotenv';
import mongoose from 'mongoose';
import Course from '../models/Course';

dotenv.config();

// Define the course data structure
interface ICourse {
  code: string;
  name: string;
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

// Sample course data
const sampleCourses: ICourse[] = [
  {
    code: 'CSE202A',
    name: 'Fundamentals of Database Systems (Sec A)',
    credits: 4,
    stream: 'Computer Science and Engineering',
    semester: 4,
    prerequisites: ['CSE102A', 'CSE102B'],
    description: 'Introduction to database concepts and design',
    schedule: [{ day: 'Tuesday', startTime: '09:00', endTime: '10:30' }]
  },
  {
    code: 'CSE222A',
    name: 'Analysis and Design of Algorithms (Sec A)',
    credits: 4,
    stream: 'Computer Science and Engineering',
    semester: 4,
    prerequisites: ['CSE102A', 'CSE102B'],
    description: 'Advanced algorithmic techniques',
    schedule: [{ day: 'Wednesday', startTime: '09:00', endTime: '10:30' }]
  }
  // Add more courses as needed
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('Connected to MongoDB');

    // Clear existing courses
    await Course.deleteMany({});
    console.log('Cleared existing courses');

    // Insert courses
    await Course.insertMany(sampleCourses);
    console.log('Courses seeded successfully');

    await mongoose.disconnect();
    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

seedDatabase(); 