import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  credits: { type: Number, required: true },
  stream: { type: String, required: true, index: true },
  semester: { type: Number, required: true, index: true },
  prerequisites: [{ type: String }],
  description: { type: String },
  schedule: [{
    day: { type: String },
    startTime: { type: String },
    endTime: { type: String }
  }]
});

export default mongoose.model('Course', courseSchema); 