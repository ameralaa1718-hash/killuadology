import File from '../models/File.js';
import path from 'path';
import fs from 'fs';
import mongoose from 'mongoose';

// @desc    Serve uploaded files from DB (with disk fallback for legacy files)
// @route   GET /uploads/:type/:filename
// @access  Public
export const serveUpload = async (req, res) => {
  const { type, filename } = req.params;

  console.log(`serveUpload requested: type=${type}, filename=${filename}`);

  // Extract ID if there is an extension (e.g. "6a143e049ef822adbac9649a.pdf" -> "6a143e049ef822adbac9649a")
  const ext = path.extname(filename);
  const idWithoutExt = ext ? filename.slice(0, -ext.length) : filename;

  // Check if filename looks like a MongoDB ObjectId (24 hex chars)
  const isObjectId = mongoose.Types.ObjectId.isValid(idWithoutExt) && idWithoutExt.length === 24;

  if (isObjectId) {
    // Serve from MongoDB
    try {
      const file = await File.findById(idWithoutExt);
      if (!file) {
        console.log(`File with ID ${idWithoutExt} not found in DB`);
        return res.status(404).json({ message: 'File not found in database' });
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

  console.log(`Fallback check: looking for local file at ${filePath}`);

  if (fs.existsSync(filePath)) {
    return res.sendFile(filePath);
  }

  return res.status(404).json({ message: 'File not found on disk or database' });
};
