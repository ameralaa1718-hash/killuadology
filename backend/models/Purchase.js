import mongoose from 'mongoose';

const purchaseSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
  },
  lesson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson', // If buying a single lesson
  },
  subject: {
    type: String,
  },
  faculty: {
    type: String,
  },
  semester: {
    type: Number,
  },
  amountPaid: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['Vodafone Cash', 'InstaPay'],
    required: true
  },
  receiptImage: {
    type: String,
    required: true // Screenshot uploaded by student
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  }
}, { timestamps: true });

const Purchase = mongoose.model('Purchase', purchaseSchema);
export default Purchase;
