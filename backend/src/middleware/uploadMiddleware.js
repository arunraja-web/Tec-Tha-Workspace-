const multer = require('multer');

// Configure memory storage
const storage = multer.memoryStorage();

const dangerousExtensions = ['exe', 'bat', 'cmd', 'sh', 'msi', 'dll', 'vbs', 'ps1', 'com', 'scr'];

const fileFilter = (req, file, cb) => {
  const ext = file.originalname ? file.originalname.split('.').pop().toLowerCase() : '';
  if (dangerousExtensions.includes(ext)) {
    const error = new Error('Executable and script files are not allowed for security reasons.');
    error.statusCode = 400;
    return cb(error, false);
  }
  cb(null, true);
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
