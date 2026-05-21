import Course from '../models/Course.js';
import Lesson from '../models/Lesson.js';
import Purchase from '../models/Purchase.js';
import QuizSubmission from '../models/QuizSubmission.js';

// @desc    Get all PUBLISHED courses (for students)
// @route   GET /api/courses
// @access  Public
export const getPublishedCourses = async (req, res) => {
  try {
    const courses = await Course.find({ isPublished: true }).sort({ subject: 1, semester: 1 });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get courses grouped by subject
// @route   GET /api/courses/subjects
// @access  Public
export const getCoursesBySubject = async (req, res) => {
  try {
    const { faculty, semester } = req.query;
    const query = { isPublished: true };
    if (faculty) query.faculty = faculty;
    if (semester) query.semester = Number(semester);

    const courses = await Course.find(query).sort({ semester: 1 });
    
    // Group courses by subject (case-insensitive and trimmed)
    const grouped = {};
    courses.forEach(course => {
      const sub = (course.subject || 'Other').trim();
      // Find if there is an existing key matching case-insensitively
      const existingKey = Object.keys(grouped).find(
        key => key.toLowerCase() === sub.toLowerCase()
      );
      if (existingKey) {
        grouped[existingKey].push(course);
      } else {
        grouped[sub] = [course];
      }
    });

    res.json(grouped);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get lessons for a specific course
// @route   GET /api/courses/:id/lessons
// @access  Public (free lessons) / Private (paid)
export const getCourseLessons = async (req, res) => {
  try {
    const lessons = await Lesson.find({ course: req.params.id }).sort({ order: 1 });
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    let coursePurchased = course.price === 0;
    let subjectPurchased = false;
    let approvedLessons = [];

    // Check access
    if (req.user) {
      if (req.user.role === 'admin') {
        coursePurchased = true;
      } else {
        // 1. Check Course purchase
        if (!coursePurchased) {
          const coursePurchase = await Purchase.findOne({
            student: req.user._id,
            course: req.params.id,
            status: 'approved'
          });
          if (coursePurchase) {
            coursePurchased = true;
          }
        }

        // 2. Check Subject purchase
        if (!coursePurchased) {
          const subjectPurchase = await Purchase.findOne({
            student: req.user._id,
            subject: course.subject,
            faculty: course.faculty,
            semester: course.semester,
            status: 'approved'
          });
          if (subjectPurchase) {
            subjectPurchased = true;
          }
        }

        // 3. Check individual Lesson purchases
        if (!coursePurchased && !subjectPurchased) {
          const lessonPurchases = await Purchase.find({
            student: req.user._id,
            lesson: { $in: lessons.map(l => l._id) },
            status: 'approved'
          });
          approvedLessons = lessonPurchases.map(p => p.lesson.toString());
        }
      }
    }

    // Filter lessons to hide secure content if no access
    const filteredLessons = lessons.map(lesson => {
      const hasAccess = coursePurchased || subjectPurchased || approvedLessons.includes(lesson._id.toString()) || lesson.isFreePreview || (req.user && req.user.role === 'admin');
      const lessonObj = lesson.toObject();
      lessonObj.hasAccess = hasAccess;

      if (hasAccess) {
        // Hide correct answers from student view to prevent client-side inspection cheats
        if (lessonObj.quiz && lessonObj.quiz.questions && (!req.user || req.user.role !== 'admin')) {
          lessonObj.quiz.questions = lessonObj.quiz.questions.map(q => {
            const qObj = { ...q };
            delete qObj.correctAnswer;
            return qObj;
          });
        }
        return lessonObj;
      } else {
        // Hide sensitive info
        delete lessonObj.bunnyVideoId;
        delete lessonObj.bunnyLibraryId;
        delete lessonObj.pdfUrl;
        delete lessonObj.quiz;
        return lessonObj;
      }
    });

    res.json(filteredLessons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit quiz answers and calculate score
// @route   POST /api/courses/:courseId/lessons/:lessonId/quiz/submit
// @access  Private
export const submitQuiz = async (req, res) => {
  try {
    const { answers } = req.body; // array of { questionIndex, selectedOption }
    const { lessonId, courseId } = req.params;
    const studentId = req.user._id;

    // 1. Check if user already submitted
    const existingSubmission = await QuizSubmission.findOne({ student: studentId, lesson: lessonId });
    if (existingSubmission) {
      return res.status(400).json({ message: 'لقد قمت بتسليم هذا الاختبار بالفعل ولا يمكن إعادته.' });
    }

    // 2. Fetch full lesson with correct answers from DB
    const lesson = await Lesson.findById(lessonId);
    if (!lesson || !lesson.quiz || !lesson.quiz.questions || lesson.quiz.questions.length === 0) {
      return res.status(404).json({ message: 'لا يوجد اختبار لهذه المحاضرة' });
    }

    const questions = lesson.quiz.questions;
    let score = 0;

    // 3. Grade the submissions
    answers.forEach(ans => {
      const question = questions[ans.questionIndex];
      if (question && question.correctAnswer === ans.selectedOption) {
        score += 1;
      }
    });

    const totalQuestions = questions.length;
    const percentage = Math.round((score / totalQuestions) * 100);

    // 4. Save submission
    const submission = new QuizSubmission({
      student: studentId,
      lesson: lessonId,
      course: courseId,
      answers,
      score,
      totalQuestions,
      percentage
    });

    await submission.save();

    res.status(201).json({
      score,
      totalQuestions,
      percentage
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'خطأ أثناء تسليم الاختبار' });
  }
};

// @desc    Get student's own quiz submission score
// @route   GET /api/courses/:courseId/lessons/:lessonId/quiz/my-submission
// @access  Private
export const getMyQuizSubmission = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const studentId = req.user._id;

    const submission = await QuizSubmission.findOne({ student: studentId, lesson: lessonId })
      .select('score totalQuestions percentage createdAt');

    res.json(submission); // Returns submission or null
  } catch (error) {
    res.status(500).json({ message: error.message || 'خطأ أثناء جلب نتيجة الاختبار' });
  }
};
