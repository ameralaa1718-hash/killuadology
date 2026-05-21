import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctOptionIndex: { type: Number, required: true },
  explanation: { type: String }
});

const examSchema = new mongoose.Schema({
  lesson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  questions: [questionSchema],
  passPercentage: {
    type: Number,
    default: 50
  }
}, { timestamps: true });

const Exam = mongoose.model('Exam', examSchema);
export default Exam;
