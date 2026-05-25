import multer from 'multer';
import path from 'path';

// Use memory storage so files are held in RAM (Buffer) — works in serverless environments
const storage = multer.memoryStorage();

// Check file type
function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|webp/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Images Only (jpeg, jpg, png, webp)!');
  }
}

// Init upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  }
});

export default upload;
