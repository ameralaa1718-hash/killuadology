import User from '../models/User.js';
import Purchase from '../models/Purchase.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// Generate JWT Token
const generateToken = (id, sessionId) => {
  return jwt.sign({ id, sessionId }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  const { fullName, email, phoneNumber, password } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const sessionId = crypto.randomBytes(16).toString('hex');

    const isFirstAccount = (await User.countDocuments({})) === 0;
    const role = (email === 'ameralaa1718@gmail.com' || isFirstAccount) ? 'admin' : 'student';

    const user = await User.create({
      fullName,
      email,
      phoneNumber,
      password,
      role,
      activeSessions: [sessionId],
      activeSessionId: sessionId
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        token: generateToken(user._id, sessionId),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      const newSessionId = crypto.randomBytes(16).toString('hex');
      
      // Initialize activeSessions array if not present
      if (!user.activeSessions) {
        user.activeSessions = [];
      }
      
      // Backward compatibility: import legacy activeSessionId if activeSessions is empty
      if (user.activeSessions.length === 0 && user.activeSessionId) {
        user.activeSessions.push(user.activeSessionId);
      }
      
      user.activeSessions.push(newSessionId);
      if (user.activeSessions.length > 1) {
        user.activeSessions.shift(); // Remove oldest session
      }
      
      user.activeSessionId = newSessionId;
      await user.save();

      res.json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        token: generateToken(user._id, newSessionId),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logoutUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      if (user.activeSessions && req.currentSessionId) {
        user.activeSessions = user.activeSessions.filter(id => id !== req.currentSessionId);
      } else {
        user.activeSessions = [];
      }
      user.activeSessionId = user.activeSessions[user.activeSessions.length - 1] || null;
      await user.save();
      res.json({ message: 'Logged out successfully' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.fullName = req.body.fullName || user.fullName;
      user.email = req.body.email || user.email;
      user.phoneNumber = req.body.phoneNumber || user.phoneNumber;

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        phoneNumber: updatedUser.phoneNumber,
        role: updatedUser.role,
        token: req.headers.authorization.split(' ')[1], // Keep existing token
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's purchased courses
// @route   GET /api/auth/my-courses
// @access  Private
export const getMyCourses = async (req, res) => {
  try {
    // Find all approved purchases for this student and populate the course details
    const purchases = await Purchase.find({ student: req.user._id, status: 'approved' }).populate('course');
    const courses = purchases.map(p => p.course).filter(c => c != null);
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
