import multer from 'multer';
import path from 'path';

// Use memory storage so files are held in RAM (Buffer) — works in serverless environments
const storage = multer.memoryStorage();

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
  limits: { fileSize: 16 * 1024 * 1024 }, // 16MB max (MongoDB BSON document limit)
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  }
});

export default uploadPdf;
