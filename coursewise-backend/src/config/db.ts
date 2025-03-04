// import mongoose from 'mongoose';
// import dotenv from 'dotenv';

// dotenv.config();

// const connectDB = async () => {
//   try {
//     const conn = await mongoose.connect(process.env.MONGODB_URI!);
//     console.log(`MongoDB Connected: ${conn.connection.host}`);
//   } catch (error) {
//     console.error('MongoDB connection error:', error);
//     process.exit(1);
//   }
// };

// export default connectDB; 

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI as string);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error}`);
    process.exit(1);
  }
};

export default connectDB;
