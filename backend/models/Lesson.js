import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  order: {
    type: Number,
    required: true
  },
  videoType: {
    type: String,
    enum: ['bunny', 'youtube', 'telegram', 'external'],
    default: 'bunny'
  },
  bunnyVideoId: {
    type: String,
    default: '' // Bunny Stream Video ID (optional until uploaded)
  },
  bunnyLibraryId: {
    type: String,
    default: '' // Bunny Stream Library ID (optional)
  },
  videoUrl: {
    type: String,
    default: '' // YouTube, Telegram, or External video URL
  },
  fileType: {
    type: String,
    enum: ['pdf', 'drive', 'external'],
    default: 'pdf'
  },
  pdfUrl: {
    type: String,
    default: ''
  },
  fileUrl: {
    type: String,
    default: '' // Google Drive or external file URL
  },
  isFreePreview: {
    type: Boolean,
    default: false
  },
  price: {
    type: Number,
    required: true,
    default: 0
  },
  quiz: {
    title: { type: String, default: '' },
    isRequired: { type: Boolean, default: false },
    passPercentage: { type: Number, default: 50 },
    questions: [{
      questionText: { type: String, required: true },
      options: [{ type: String, required: true }],
      correctAnswer: { type: Number, required: true } // Index of the correct option (0, 1, 2...)
    }]
  }
}, { timestamps: true });

const Lesson = mongoose.model('Lesson', lessonSchema);
export default Lesson;
