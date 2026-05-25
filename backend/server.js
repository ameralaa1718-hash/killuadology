import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import purchaseRoutes from './routes/purchaseRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import { serveUpload } from './controllers/uploadController.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection check middleware
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error('Database connection error:', error.message);
    res.status(500).json({
      message: 'Database connection failed. If you are running on Vercel, please make sure you have added MONGO_URI to your environment variables on the Vercel dashboard and whitelisted Vercel\'s IP addresses on MongoDB Atlas (0.0.0.0/0).',
      error: error.message
    });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/settings', settingsRoutes);

const __dirname = path.resolve();
app.get('/uploads/:type/:filename', serveUpload);

app.get('/', (req, res) => {
  res.send('Killuadology API is running...');
});

const PORT = process.env.PORT || 5000;

// Start the server only when running as a standalone Node app.
// In serverless environments like Vercel, the Express app is exported
// and the platform handles the request listener.
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
