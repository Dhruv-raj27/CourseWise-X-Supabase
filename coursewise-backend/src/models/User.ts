import mongoose, { Document, Types } from 'mongoose';

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  profilePicture?: string;
  googleId?: string;
  institution?: string;
  branch?: string;
  semester?: number;
  isVerified: boolean;
  verificationToken?: string;
  verificationTokenExpires?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  selectedCourses?: string[];
  createdAt?: Date;
}

const userSchema = new mongoose.Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false },
  profilePicture: String,
  googleId: String,
  institution: String,
  branch: String,
  semester: Number,
  isVerified: { type: Boolean, default: false },
  verificationToken: String,
  verificationTokenExpires: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  selectedCourses: [String],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IUser>('User', userSchema); 