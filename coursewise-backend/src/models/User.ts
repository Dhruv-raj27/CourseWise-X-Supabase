import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  googleId?: string;
  profilePicture?: string;
  isVerified: boolean;
  verificationToken?: string;
  verificationTokenExpires?: Date;
  institution?: string;
  branch?: string;
  semester?: number;
  selectedCourses: string[];
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  phone: { type: String },
  googleId: { type: String },
  profilePicture: { type: String },
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String },
  verificationTokenExpires: { type: Date },
  institution: { type: String },
  branch: { type: String },
  semester: { type: Number },
  selectedCourses: [{ type: Schema.Types.ObjectId, ref: 'Course' }]
}, {
  timestamps: true
});

export default mongoose.model<IUser>('User', userSchema); 