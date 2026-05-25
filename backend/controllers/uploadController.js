import File from '../models/File.js';
import path from 'path';
import fs from 'fs';
import mongoose from 'mongoose';

// @desc    Serve uploaded files from DB (with disk fallback for legacy files)
// @route   GET /uploads/:type/:filename
// @access  Public
export const serveUpload = async (req, res) => {
  const { type, filename } = req.params;

  // Check if filename looks like a MongoDB ObjectId (24 hex chars)
  const isObjectId = mongoose.Types.ObjectId.isValid(filename) && filename.length === 24;

  if (isObjectId) {
    // Serve from MongoDB
    try {
      const file = await File.findById(filename);
      if (!file) {
        return res.status(404).json({ message: 'File not found' });
      }
      res.set('Content-Type', file.contentType);
      res.set('Content-Disposition', `inline; filename="${file.filename}"`);
      return res.send(file.data);
    } catch (err) {
      console.error('Error serving file from DB:', err);
      return res.status(500).json({ message: 'Error retrieving file' });
    }
  }

  // Fallback: serve from local disk (for legacy files)
  const __dirname = path.resolve();
  const filePath = path.join(__dirname, 'uploads', type, filename);

  if (fs.existsSync(filePath)) {
    return res.sendFile(filePath);
  }

  return res.status(404).json({ message: 'File not found' });
};
