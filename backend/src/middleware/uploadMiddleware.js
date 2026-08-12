const multer = require('multer');

// Configure memory storage
const storage = multer.memoryStorage();

// Allowed MIME types and extensions
const allowedMimeTypes = [
  'image/jpeg',
  'image/png',
  'image/jpg',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation'
];

const fileFilter = (req, file, cb) => {
  const ext = file.originalname.split('.').pop().toLowerCase();
  const allowedExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'jpg', 'jpeg', 'png'];

  if (allowedMimeTypes.includes(file.mimetype) || allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    const error = new Error('Invalid file type. Only PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, JPG, JPEG, and PNG files are allowed.');
    error.statusCode = 400;
    cb(error, false);
  }
};

// 10 MB Max File Size Limit
const uploadChatFile = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter
}).single('file');

const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size exceeds maximum limit of 10MB.'
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message
    });
  } else if (err) {
    return res.status(err.statusCode || 400).json({
      success: false,
      message: err.message
    });
  }
  next();
};

const uploadTaskFile = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter
}).single('file');

const uploadWorkReportFile = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter
}).single('file');

module.exports = {
  uploadChatFile,
  uploadTaskFile,
  uploadWorkReportFile,
  handleUploadError
};
