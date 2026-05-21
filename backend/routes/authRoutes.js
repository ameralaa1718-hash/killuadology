import express from 'express';
import { registerUser, loginUser, logoutUser, updateUserProfile, getMyCourses } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', protect, logoutUser);

// A simple protected route to get current user data
router.get('/me', protect, (req, res) => {
  res.json(req.user);
});

router.put('/profile', protect, updateUserProfile);
router.get('/my-courses', protect, getMyCourses);

export default router;
