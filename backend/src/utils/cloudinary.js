const cloudinary = require('cloudinary').v2;
const { Readable } = require('stream');

/**
 * Configure Cloudinary dynamically from environment variables
 */
const configureCloudinary = () => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret || cloudName === 'your_cloud_name') {
    console.error('CLOUDINARY ERROR: Environment variables (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) are missing or set to defaults.');
    throw new Error('Cloudinary environment variables are missing or unconfigured');
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true
  });
};

const cloudinaryUploadError = (message, originalError = null) => {
  const error = new Error(message);
  error.statusCode = 502;
  if (originalError) {
    error.cloudinaryError = originalError;
  }
  return error;
};

/**
 * Upload a Buffer (e.g. Excel spreadsheet) to Cloudinary
 */
const uploadExcelToCloudinary = (buffer, month, fileName) => {
  return new Promise((resolve, reject) => {
    try {
      configureCloudinary();
    } catch (err) {
      return reject(err);
    }

    const folder = `company-workspace/attendance-reports/${month}`;
    const publicIdWithFolder = `${folder}/${fileName.replace(/\.xlsx$/i, '')}`;

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: fileName.replace(/\.xlsx$/i, ''),
        resource_type: 'auto',
        overwrite: true,
        invalidate: true
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary Excel Upload Failure Details:', {
            message: error.message,
            http_code: error.http_code,
            details: error
          });
          return reject(cloudinaryUploadError(`Cloudinary Excel upload failed: ${error.message}`, error));
        }

        if (!result || !result.secure_url) {
          return reject(cloudinaryUploadError('Cloudinary Excel upload returned no secure URL'));
        }

        return resolve({
          publicId: result.public_id || publicIdWithFolder,
          secureUrl: result.secure_url
        });
      }
    );

    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);
    stream.pipe(uploadStream);
  });
};

/**
 * Upload chat attachment buffer to Cloudinary (folder: company-workspace/chat/)
 * @param {Buffer} buffer - File buffer
 * @param {string} fileName - Original file name
 * @param {string} mimetype - File MIME type
 * @returns {Promise<{ fileName: string, fileUrl: string, publicId: string, fileType: string, fileSize: number }>}
 */
const uploadChatAttachmentToCloudinary = (buffer, fileName, mimetype) => {
  return new Promise((resolve, reject) => {
    try {
      configureCloudinary();
    } catch (err) {
      return reject(err);
    }

    const folder = 'company-workspace/chat';
    const isImage = mimetype ? mimetype.startsWith('image/') : false;
    const resourceType = isImage ? 'image' : 'auto';
    const sanitizedFileName = (fileName || 'file').replace(/[^a-zA-Z0-9._-]/g, '_');
    const publicId = `${Date.now()}_${sanitizedFileName}`;

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: publicId,
        resource_type: resourceType,
        overwrite: true
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary Chat Upload Failure Details:', {
            message: error.message,
            http_code: error.http_code,
            details: error
          });
          return reject(cloudinaryUploadError(`Cloudinary chat upload failed: ${error.message}`, error));
        }

        if (!result || !result.secure_url) {
          return reject(cloudinaryUploadError('Cloudinary chat upload returned no secure URL'));
        }

        return resolve({
          fileName: fileName || 'file',
          originalName: fileName || 'file',
          fileUrl: result.secure_url,
          url: result.secure_url,
          publicId: result.public_id,
          fileType: isImage ? 'image' : 'file',
          fileSize: buffer ? buffer.length : 0
        });
      }
    );

    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);
    stream.pipe(uploadStream);
  });
};

/**
 * Upload task attachment buffer to Cloudinary (folder: company-workspace/tasks/)
 * @param {Buffer} buffer - File buffer
 * @param {string} fileName - Original file name
 * @param {string} mimetype - File MIME type
 * @returns {Promise<{ fileName: string, fileUrl: string, publicId: string, fileType: string, fileSize: number }>}
 */
const uploadTaskAttachmentToCloudinary = (buffer, fileName, mimetype) => {
  return new Promise((resolve, reject) => {
    try {
      configureCloudinary();
    } catch (err) {
      return reject(err);
    }

    const ext = fileName ? fileName.split('.').pop().toLowerCase() : 'file';
    const isImage = mimetype ? mimetype.startsWith('image/') : false;
    const folder = 'company-workspace/tasks';
    const resourceType = isImage ? 'image' : 'auto';
    const sanitizedFileName = (fileName || 'file').replace(/[^a-zA-Z0-9._-]/g, '_');
    if (!buffer) {
      return reject(cloudinaryUploadError('Cannot upload an empty task attachment'));
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: `${Date.now()}_${sanitizedFileName}`,
        resource_type: resourceType,
        overwrite: true
      },
      (error, result) => {
        if (error || !result || !result.secure_url) {
          if (error) {
            console.error('Cloudinary Task Attachment Upload Failure Details:', {
              message: error.message,
              http_code: error.http_code,
              name: error.name,
              details: error
            });
          }
          return reject(cloudinaryUploadError(
            `Cloudinary task attachment upload failed: ${error ? error.message : 'no secure URL returned'}`,
            error
          ));
        }

        return resolve({
          fileName: fileName || 'file',
          fileUrl: result.secure_url,
          publicId: result.public_id,
          fileType: isImage ? 'image' : ext,
          fileSize: buffer ? buffer.length : 0
        });
      }
    );

    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);
    stream.pipe(uploadStream);
  });
};

/**
 * Upload work report attachment buffer to Cloudinary (folder: company-workspace/work-reports/YYYY/MM)
 * @param {Buffer} buffer - File buffer
 * @param {string} fileName - Original file name
 * @param {string} mimetype - File MIME type
 * @param {string} [yearStr] - Year string (e.g. 2026)
 * @param {string} [monthStr] - Month string (e.g. 08)
 * @returns {Promise<{ fileName: string, fileUrl: string, publicId: string, fileType: string, fileSize: number }>}
 */
const uploadWorkReportAttachmentToCloudinary = (buffer, fileName, mimetype, yearStr, monthStr) => {
  return new Promise((resolve, reject) => {
    const now = new Date();
    const year = yearStr || String(now.getFullYear());
    const month = monthStr || String(now.getMonth() + 1).padStart(2, '0');

    try {
      configureCloudinary();
    } catch (err) {
      return reject(err);
    }

    const ext = fileName ? fileName.split('.').pop().toLowerCase() : 'file';
    const isImage = mimetype ? mimetype.startsWith('image/') : false;
    const folder = `company-workspace/work-reports/${year}/${month}`;
    const resourceType = isImage ? 'image' : 'auto';
    const sanitizedFileName = (fileName || 'file').replace(/[^a-zA-Z0-9._-]/g, '_');
    if (!buffer) {
      return reject(cloudinaryUploadError('Cannot upload an empty work report attachment'));
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: `${Date.now()}_${sanitizedFileName}`,
        resource_type: resourceType,
        overwrite: true
      },
      (error, result) => {
        if (error || !result || !result.secure_url) {
          if (error) {
            console.error('Cloudinary Work Report Upload Failure Details:', {
              message: error.message,
              http_code: error.http_code,
              details: error
            });
          }
          return reject(cloudinaryUploadError(
            `Cloudinary work report attachment upload failed: ${error ? error.message : 'no secure URL returned'}`,
            error
          ));
        }

        return resolve({
          fileName: fileName || 'file',
          fileUrl: result.secure_url,
          publicId: result.public_id,
          fileType: isImage ? 'image' : ext,
          fileSize: buffer ? buffer.length : 0
        });
      }
    );

    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);
    stream.pipe(uploadStream);
  });
};

/**
 * Delete an asset from Cloudinary by publicId
 */
const deleteCloudinaryAsset = async (publicId, resourceType = 'auto') => {
  try {
    configureCloudinary();
    return await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (err) {
    console.warn(`Cloudinary deletion warning for ${publicId}:`, err.message);
    return null;
  }
};

module.exports = {
  cloudinary,
  uploadExcelToCloudinary,
  uploadChatAttachmentToCloudinary,
  uploadTaskAttachmentToCloudinary,
  uploadWorkReportAttachmentToCloudinary,
  deleteCloudinaryAsset
};
