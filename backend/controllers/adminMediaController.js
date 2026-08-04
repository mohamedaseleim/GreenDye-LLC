const Media = require('../models/Media');
const AuditTrail = require('../models/AuditTrail');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');

// Configure multer storage
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const category = req.body.category || 'general';
    const uploadPath = path.join(__dirname, '..', 'uploads', category);
    
    try {
      await fs.mkdir(uploadPath, { recursive: true });
      cb(null, uploadPath);
    } catch (error) {
      cb(error, null);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${uuidv4()}`;
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  }
});

// Allowed file types (extracted as constants for reuse)
const ALLOWED_IMAGE_TYPES = /jpeg|jpg|png|gif|webp|svg/;
const ALLOWED_VIDEO_TYPES = /mp4|webm|ogg|avi|mov/;
const ALLOWED_DOC_TYPES = /pdf|doc|docx|xls|xlsx|ppt|pptx|txt|csv/;

// File filter
const fileFilter = (req, file, cb) => {
  const extname = path.extname(file.originalname).toLowerCase().replace('.', '');
  
  // Check if file type is allowed
  if (
    ALLOWED_IMAGE_TYPES.test(extname) ||
    ALLOWED_VIDEO_TYPES.test(extname) ||
    ALLOWED_DOC_TYPES.test(extname)
  ) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images, videos, and documents are allowed.'));
  }
};

// Multer upload configuration
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: fileFilter
});

// Helper to determine media type
const getMediaType = (mimetype) => {
  if (mimetype.startsWith('image/')) return 'image';
  if (mimetype.startsWith('video/')) return 'video';
  if (mimetype.startsWith('application/') || mimetype.startsWith('text/')) return 'document';
  return 'other';
};

// @desc    Upload media file(s)
// @route   POST /api/admin/cms/media/upload
// @access  Private/Admin
exports.uploadMedia = async (req, res, next) => {
  const uploadedFiles = [];
  
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const uploadedMedia = [];

    for (const file of req.files) {
      uploadedFiles.push(file.path); // Track for cleanup on error
      
      const category = req.body.category || 'general';
      const mediaType = getMediaType(file.mimetype);
      
      // Validate MIME type matches file extension
      const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
      const isValidImage = mediaType === 'image' && ALLOWED_IMAGE_TYPES.test(ext);
      const isValidVideo = mediaType === 'video' && ALLOWED_VIDEO_TYPES.test(ext);
      const isValidDoc = mediaType === 'document' && ALLOWED_DOC_TYPES.test(ext);
      
      // Reject files that don't pass validation - no 'other' bypass allowed
      if (!isValidImage && !isValidVideo && !isValidDoc) {
        // Don't expose filename in error to prevent information disclosure
        throw new Error('File type mismatch: MIME type does not match file extension');
      }
      
      const mediaData = {
        filename: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        path: `/uploads/${category}/${file.filename}`,
        url: `${req.protocol}://${req.get('host')}/uploads/${category}/${file.filename}`,
        type: mediaType,
        category: category,
        uploadedBy: req.user.id,
        metadata: {
          format: ext
        }
      };

      const media = await Media.create(mediaData);
      uploadedMedia.push(media);

      // Audit log
      await AuditTrail.create({
        user: req.user.id,
        action: 'upload',
        resourceType: 'Media',
        resourceId: media._id,
        details: `Uploaded media: ${media.originalName}`,
        ipAddress: req.ip
      });
    }

    res.status(201).json({
      success: true,
      message: 'Media uploaded successfully',
      count: uploadedMedia.length,
      data: uploadedMedia
    });
  } catch (error) {
    // Clean up uploaded files on error
    for (const filePath of uploadedFiles) {
      try {
        await fs.unlink(filePath);
      } catch (cleanupError) {
        // Log cleanup errors but don't throw - we want to report the original error
        // Don't log full path to avoid potential information disclosure
        // eslint-disable-next-line no-console
        console.error('Failed to clean up uploaded file during error recovery:', cleanupError.message);
      }
    }
    next(error);
  }
};

// Export multer upload middleware
exports.upload = upload;
