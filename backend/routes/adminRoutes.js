import express from 'express';
import { 
  getAdminCourses, 
  createCourse, 
  updateCourse, 
  deleteCourse, 
  getAdminStats, 
  getAdminPurchases, 
  updatePurchaseStatus, 
  deletePurchase, 
  getCourseLessonsAdmin, 
  createLesson, 
  updateLesson, 
  deleteLesson,
  getAdminUsers,
  resetUserPassword,
  deleteUser,
  getQuizSubmissionsAdmin
} from '../controllers/adminController.js';
import { getSettings, updateSettings } from '../controllers/settingsController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import uploadPdf from '../middleware/pdfUploadMiddleware.js';

const router = express.Router();

// All routes here are protected and require admin role
router.use(protect, admin);

router.route('/settings')
  .get(getSettings)
  .put(updateSettings);

// Upload PDF route
router.post('/upload-pdf', uploadPdf.single('pdf'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'يرجى اختيار ملف PDF للرفع' });
  }
  const fileUrl = `/uploads/pdfs/${req.file.filename}`;
  res.json({ url: fileUrl });
});

router.get('/stats', getAdminStats);

router.route('/users')
  .get(getAdminUsers);

router.route('/users/:id')
  .delete(deleteUser);

router.route('/users/:id/password')
  .put(resetUserPassword);

router.route('/courses')
  .get(getAdminCourses)
  .post(createCourse);

router.route('/courses/:id')
  .put(updateCourse)
  .delete(deleteCourse);

// Lesson routes
router.route('/courses/:id/lessons')
  .get(getCourseLessonsAdmin)
  .post(createLesson);

router.route('/lessons/:lessonId')
  .put(updateLesson)
  .delete(deleteLesson);

router.route('/purchases')
  .get(getAdminPurchases);

router.route('/purchases/:id')
  .put(updatePurchaseStatus)
  .delete(deletePurchase);

router.route('/quiz-submissions')
  .get(getQuizSubmissionsAdmin);

export default router;
