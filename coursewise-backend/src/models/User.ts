import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  profilePicture: String,
  googleId: String,
  institution: String,
  branch: String,
  semester: Number,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('User', userSchema); 