import express from 'express';
import { getNotifications, createNotification, deleteNotification } from '../controllers/notificationController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getNotifications)
  .post(protect, admin, createNotification);

router.route('/:id')
  .delete(protect, admin, deleteNotification);

export default router;
