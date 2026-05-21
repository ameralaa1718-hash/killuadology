import Course from '../models/Course.js';
import Lesson from '../models/Lesson.js';
import User from '../models/User.js';
import Purchase from '../models/Purchase.js';
import QuizSubmission from '../models/QuizSubmission.js';

// @desc    Get all courses (Admin)
// @route   GET /api/admin/courses
export const getAdminCourses = async (req, res) => {
  try {
    const courses = await Course.find({}).sort({ createdAt: -1 });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new course
// @route   POST /api/admin/courses
export const createCourse = async (req, res) => {
  const { title, description, subject, semester, price, isPublished, faculty } = req.body;
  try {
    const course = new Course({ title, description, subject, semester, price, isPublished, faculty });
    const createdCourse = await course.save();
    res.status(201).json(createdCourse);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a course
// @route   PUT /api/admin/courses/:id
export const updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (course) {
      course.title = req.body.title || course.title;
      course.description = req.body.description || course.description;
      course.subject = req.body.subject || course.subject;
      course.semester = req.body.semester !== undefined ? req.body.semester : course.semester;
      course.faculty = req.body.faculty || course.faculty;
      course.price = req.body.price !== undefined ? req.body.price : course.price;
      course.isPublished = req.body.isPublished !== undefined ? req.body.isPublished : course.isPublished;
      const updatedCourse = await course.save();
      res.json(updatedCourse);
    } else {
      res.status(404).json({ message: 'Course not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a course and all its lessons
// @route   DELETE /api/admin/courses/:id
export const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (course) {
      await Lesson.deleteMany({ course: req.params.id });
      await course.deleteOne();
      res.json({ message: 'Course and its lessons deleted' });
    } else {
      res.status(404).json({ message: 'Course not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get lessons for a course (Admin view)
// @route   GET /api/admin/courses/:id/lessons
export const getCourseLessonsAdmin = async (req, res) => {
  try {
    const lessons = await Lesson.find({ course: req.params.id }).sort({ order: 1 });
    res.json(lessons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a lesson for a course
// @route   POST /api/admin/courses/:id/lessons
export const createLesson = async (req, res) => {
  const { title, description, order, bunnyVideoId, bunnyLibraryId, pdfUrl, isFreePreview, price, quiz } = req.body;
  try {
    const lesson = new Lesson({
      course: req.params.id,
      title,
      description: description || '',
      order,
      bunnyVideoId: bunnyVideoId || '',
      bunnyLibraryId: bunnyLibraryId || '',
      pdfUrl: pdfUrl || '',
      isFreePreview: isFreePreview || false,
      price: price !== undefined ? price : 0,
      quiz: quiz || undefined
    });
    const created = await lesson.save();
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a lesson
// @route   PUT /api/admin/lessons/:lessonId
export const updateLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.lessonId);
    if (lesson) {
      if (req.body.title !== undefined) lesson.title = req.body.title;
      if (req.body.description !== undefined) lesson.description = req.body.description;
      if (req.body.order !== undefined) lesson.order = req.body.order;
      if (req.body.bunnyVideoId !== undefined) lesson.bunnyVideoId = req.body.bunnyVideoId;
      if (req.body.bunnyLibraryId !== undefined) lesson.bunnyLibraryId = req.body.bunnyLibraryId;
      if (req.body.pdfUrl !== undefined) lesson.pdfUrl = req.body.pdfUrl;
      if (req.body.isFreePreview !== undefined) lesson.isFreePreview = req.body.isFreePreview;
      if (req.body.price !== undefined) lesson.price = req.body.price;
      if (req.body.quiz !== undefined) lesson.quiz = req.body.quiz;
      const updated = await lesson.save();
      res.json(updated);
    } else {
      res.status(404).json({ message: 'Lesson not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a lesson
// @route   DELETE /api/admin/lessons/:lessonId
export const deleteLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.lessonId);
    if (lesson) {
      await lesson.deleteOne();
      res.json({ message: 'Lesson deleted' });
    } else {
      res.status(404).json({ message: 'Lesson not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all purchases (Admin)
// @route   GET /api/admin/purchases
export const getAdminPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.find({})
      .populate('student', 'fullName email')
      .populate('course', 'title')
      .populate('lesson', 'title')
      .sort({ createdAt: -1 });
    res.json(purchases);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update purchase status
// @route   PUT /api/admin/purchases/:id
export const updatePurchaseStatus = async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id);
    if (purchase) {
      purchase.status = req.body.status;
      await purchase.save();
      res.json({ message: 'Status updated' });
    } else {
      res.status(404).json({ message: 'Purchase not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a purchase entirely
// @route   DELETE /api/admin/purchases/:id
export const deletePurchase = async (req, res) => {
  try {
    const deleted = await Purchase.findByIdAndDelete(req.params.id);
    if (deleted) {
      res.json({ message: 'Purchase deleted completely' });
    } else {
      res.status(404).json({ message: 'Purchase not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get admin stats
// @route   GET /api/admin/stats
export const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'student' });
    const totalCourses = await Course.countDocuments();
    const totalPurchases = await Purchase.countDocuments({ status: 'approved' });
    const purchases = await Purchase.find({ status: 'approved' });
    const revenue = purchases.reduce((acc, curr) => acc + curr.amountPaid, 0);

    res.json({ totalUsers, totalCourses, totalPurchases, revenue });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users (Admin)
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAdminUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reset user password (Admin)
// @route   PUT /api/admin/users/:id/password
// @access  Private/Admin
export const resetUserPassword = async (req, res) => {
  const { newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' });
  }
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'المستخدم غير موجود' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ message: 'تم تحديث كلمة المرور بنجاح' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user (Admin)
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'المستخدم غير موجود' });
    }
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'لا يمكنك حذف حسابك الخاص' });
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'تم حذف الحساب بنجاح' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all student quiz submissions
// @route   GET /api/admin/quiz-submissions
// @access  Private/Admin
export const getQuizSubmissionsAdmin = async (req, res) => {
  try {
    const submissions = await QuizSubmission.find({})
      .populate('student', 'fullName email phoneNumber')
      .populate('lesson', 'title')
      .populate('course', 'title')
      .sort({ createdAt: -1 });
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server Error fetching quiz submissions' });
  }
};
