import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure the directory exists
const uploadDir = 'uploads/pdfs';
try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
} catch (err) {
  console.warn('Warning: Could not create upload directory on startup:', err.message);
}

// Set storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, `pdf-${Date.now()}${path.extname(file.originalname)}`);
  }
});

// Check file type
function checkFileType(file, cb) {
  const filetypes = /pdf/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('خطأ: يسمح فقط برفع ملفات PDF!'));
  }
}

// Init upload
const uploadPdf = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max limit for PDF documents
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  }
});

export default uploadPdf;
