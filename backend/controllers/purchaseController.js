import Purchase from '../models/Purchase.js';
import File from '../models/File.js';
import path from 'path';

// @desc    Create a new purchase request
// @route   POST /api/purchases
// @access  Private
export const createPurchase = async (req, res) => {
  try {
    const { courseId, lessonId, subject, faculty, semester, amountPaid, paymentMethod } = req.body;
    const studentId = req.user._id;

    if (!req.file) {
      return res.status(400).json({ message: 'Receipt image is required' });
    }

    // Save receipt image to MongoDB
    const dbFile = await File.create({
      filename: `receipt-${Date.now()}${path.extname(req.file.originalname) || '.jpg'}`,
      contentType: req.file.mimetype,
      data: req.file.buffer
    });

    const receiptImage = `/uploads/receipts/${dbFile._id}`;

    const purchaseData = {
      student: studentId,
      amountPaid,
      paymentMethod,
      receiptImage,
      status: 'pending'
    };

    if (courseId) purchaseData.course = courseId;
    if (lessonId) purchaseData.lesson = lessonId;
    if (subject) {
      purchaseData.subject = subject;
      purchaseData.faculty = faculty;
      purchaseData.semester = Number(semester);
    }

    const purchase = new Purchase(purchaseData);
    const createdPurchase = await purchase.save();
    res.status(201).json(createdPurchase);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server Error creating purchase request' });
  }
};

// @desc    Get user's own purchases
// @route   GET /api/purchases/my-purchases
// @access  Private
export const getMyPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.find({ student: req.user._id })
      .populate('course', 'title coverImage price')
      .populate('lesson', 'title price')
      .sort({ createdAt: -1 });
    res.json(purchases);
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching purchases' });
  }
};
