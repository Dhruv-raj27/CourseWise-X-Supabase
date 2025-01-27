import * as dotenv from 'dotenv';
import mongoose from 'mongoose';
import Course from '../models/Course';

dotenv.config();

const testDBConnection = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('Connected to MongoDB successfully!');

    // Create a test course
    const testCourse = new Course({
      code: 'TEST101',
      name: 'Test Course',
      credits: 4,
      stream: 'Computer Science and Engineering',
      semester: 1,
      prerequisites: [],
      description: 'Test course for database connection',
      schedule: [{
        day: 'Monday',
        startTime: '09:00',
        endTime: '10:30'
      }]
    });

    await testCourse.save();
    console.log('Test course created successfully!');

    // Clean up
    await Course.deleteOne({ code: 'TEST101' });
    console.log('Test course cleaned up successfully!');

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
  }
};

testDBConnection(); 