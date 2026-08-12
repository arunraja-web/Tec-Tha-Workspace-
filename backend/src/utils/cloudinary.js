const cloudinary = require('cloudinary').v2;
const { Readable } = require('stream');

/**
 * Configure Cloudinary dynamically from environment variables
 */
const configureCloudinary = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });

  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    throw new Error('Cloudinary environment variables are missing');
  }
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
        resource_type: 'raw',
        format: 'xlsx',
        overwrite: true,
        invalidate: true
      },
      (error, result) => {
        if (error) {
          return reject(new Error(`Cloudinary upload failed: ${error.message}`));
        }

        if (!result || !result.secure_url) {
          return reject(new Error('Cloudinary upload returned invalid response'));
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
    const isImage = mimetype.startsWith('image/');
    const resourceType = isImage ? 'image' : 'raw';
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
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
          return reject(new Error(`Cloudinary upload failed: ${error.message}`));
        }

        if (!result || !result.secure_url) {
          return reject(new Error('Cloudinary upload returned invalid response'));
        }

        return resolve({
          fileName,
          fileUrl: result.secure_url,
          publicId: result.public_id,
          fileType: isImage ? 'image' : 'file',
          fileSize: buffer.length
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
      // Fallback response if environment variables are not set during local testing
      if (process.env.NODE_ENV === 'test') {
        const ext = fileName.split('.').pop().toLowerCase();
        const mockPublicId = `company-workspace/tasks/${Date.now()}_${fileName}`;
        return resolve({
          fileName,
          fileUrl: `https://res.cloudinary.com/demo/image/upload/v1/${mockPublicId}`,
          publicId: mockPublicId,
          fileType: mimetype.startsWith('image/') ? 'image' : ext,
          fileSize: buffer ? buffer.length : 0
        });
      }
      return reject(err);
    }

    const folder = 'company-workspace/tasks';
    const isImage = mimetype.startsWith('image/');
    const resourceType = isImage ? 'image' : 'raw';
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
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
          return reject(new Error(`Cloudinary upload failed: ${error.message}`));
        }

        if (!result || !result.secure_url) {
          return reject(new Error('Cloudinary upload returned invalid response'));
        }

        const ext = fileName.split('.').pop().toLowerCase();
        return resolve({
          fileName,
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
      if (process.env.NODE_ENV === 'test') {
        const ext = fileName.split('.').pop().toLowerCase();
        const mockPublicId = `company-workspace/work-reports/${year}/${month}/${Date.now()}_${fileName}`;
        return resolve({
          fileName,
          fileUrl: `https://res.cloudinary.com/demo/image/upload/v1/${mockPublicId}`,
          publicId: mockPublicId,
          fileType: mimetype.startsWith('image/') ? 'image' : ext,
          fileSize: buffer ? buffer.length : 0
        });
      }
      return reject(err);
    }

    const folder = `company-workspace/work-reports/${year}/${month}`;
    const isImage = mimetype.startsWith('image/');
    const resourceType = isImage ? 'image' : 'raw';
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
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
          return reject(new Error(`Cloudinary upload failed: ${error.message}`));
        }

        if (!result || !result.secure_url) {
          return reject(new Error('Cloudinary upload returned invalid response'));
        }

        const ext = fileName.split('.').pop().toLowerCase();
        return resolve({
          fileName,
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
const deleteCloudinaryAsset = async (publicId, resourceType = 'raw') => {
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
