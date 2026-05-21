import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  semester: {
    type: Number,
    required: true, // e.g., 1, 2, 3...
  },
  faculty: {
    type: String,
    enum: ['buc', 'aastmt', 'premed', 'bsu', 'fbsu', 'bnu'],
    default: 'buc'
  },
  price: {
    type: Number,
    required: true,
    default: 0,
  },
  coverImage: {
    type: String,
  },
  isPublished: {
    type: Boolean,
    default: false,
  }
}, { timestamps: true });

const Course = mongoose.model('Course', courseSchema);
export default Course;
