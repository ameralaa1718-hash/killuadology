import express from 'express';
import { createPurchase, getMyPurchases } from '../controllers/purchaseController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, upload.single('receipt'), createPurchase);

router.route('/my-purchases')
  .get(protect, getMyPurchases);

export default router;
