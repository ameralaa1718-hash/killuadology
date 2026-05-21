import express from 'express';
import { getPublishedCourses, getCoursesBySubject, getCourseLessons, submitQuiz, getMyQuizSubmission } from '../controllers/courseController.js';
import { optionalAuth, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getPublishedCourses);
router.get('/subjects', getCoursesBySubject);
router.get('/:id/lessons', optionalAuth, getCourseLessons);
router.post('/:courseId/lessons/:lessonId/quiz/submit', protect, submitQuiz);
router.get('/:courseId/lessons/:lessonId/quiz/my-submission', protect, getMyQuizSubmission);

export default router;
