import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Decode token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Fetch user
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      // **Account Sharing Prevention Logic (Max 1 device)**
      const activeSessions = req.user.activeSessions || [];
      const hasValidSession = activeSessions.includes(decoded.sessionId) ||
                              (activeSessions.length === 0 && req.user.activeSessionId === decoded.sessionId);
      if (!hasValidSession) {
        return res.status(401).json({ 
          message: 'Session expired. Your account was logged in from another device.',
          code: 'CONCURRENT_LOGIN'
        });
      }

      req.currentSessionId = decoded.sessionId;

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

export const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};

export const optionalAuth = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      // Account Sharing Prevention Logic (Max 1 device)
      if (req.user) {
        const activeSessions = req.user.activeSessions || [];
        const hasValidSession = activeSessions.includes(decoded.sessionId) ||
                                (activeSessions.length === 0 && req.user.activeSessionId === decoded.sessionId);
        if (!hasValidSession) {
           req.user = null; // Session expired, treat as guest
        } else {
           req.currentSessionId = decoded.sessionId;
        }
      }
    } catch (error) {
      req.user = null;
    }
  }
  next();
};
