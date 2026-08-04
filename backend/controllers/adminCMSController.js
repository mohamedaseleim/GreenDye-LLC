const Page = require('../models/Page');
const Media = require('../models/Media');
const Announcement = require('../models/Announcement');
const AuditTrail = require('../models/AuditTrail');
const Course = require('../models/Course');
const ForumPost = require('../models/Forum');
const path = require('path');
const fs = require('fs').promises;
const mongoSanitize = require('mongo-sanitize');

// ========== PAGE MANAGEMENT ==========

// @desc    Get all pages
// @route   GET /api/admin/cms/pages
// @access  Private/Admin
exports.getAllPages = async (req, res, next) => {
  try {
    const { status, template, search } = mongoSanitize(req.query);

    const query = {};
    if (status) query.status = status;
    if (template) query.template = template;
    if (search) {
      // Escape regex special characters to prevent regex injection
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { slug: { $regex: escapedSearch, $options: 'i' } },
        { 'title.en': { $regex: escapedSearch, $options: 'i' } },
        { 'title.ar': { $regex: escapedSearch, $options: 'i' } },
        { 'title.fr': { $regex: escapedSearch, $options: 'i' } }
      ];
    }

    const pages = await Page.find(query)
      .populate('author', 'name email')
      .populate('lastEditedBy', 'name email')
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: pages.length,
      data: pages
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single page
// @route   GET /api/admin/cms/pages/:id
// @access  Private/Admin
exports.getPage = async (req, res, next) => {
  try {
    const page = await Page.findById(req.params.id)
      .populate('author', 'name email')
      .populate('lastEditedBy', 'name email');

    if (!page) {
      return res.status(404).json({
        success: false,
        message: 'Page not found'
      });
    }

    res.status(200).json({
      success: true,
      data: page
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new page
// @route   POST /api/admin/cms/pages
// @access  Private/Admin
exports.createPage = async (req, res, next) => {
  try {
    const sanitizedBody = mongoSanitize(req.body);
    const pageData = {
      ...sanitizedBody,
      author: req.user.id,
      lastEditedBy: req.user.id
    };

    const page = await Page.create(pageData);

    // Audit log
    await AuditTrail.create({
      user: req.user.id,
      action: 'create',
      resourceType: 'Page',
      resourceId: page._id,
      details: `Created page: ${page.slug}`,
      ipAddress: req.ip
    });

    res.status(201).json({
      success: true,
      message: 'Page created successfully',
      data: page
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update page
// @route   PUT /api/admin/cms/pages/:id
// @access  Private/Admin
exports.updatePage = async (req, res, next) => {
  try {
    const page = await Page.findById(req.params.id);

    if (!page) {
      return res.status(404).json({
        success: false,
        message: 'Page not found'
      });
    }

    // Sanitize input to prevent MongoDB injection
    const sanitizedBody = mongoSanitize(req.body);

    // Update fields
    Object.keys(sanitizedBody).forEach(key => {
      if (key !== '_id' && key !== 'author') {
        page[key] = sanitizedBody[key];
      }
    });

    page.lastEditedBy = req.user.id;
    page.version += 1;

    await page.save();

    // Audit log
    await AuditTrail.create({
      user: req.user.id,
      action: 'update',
      resourceType: 'Page',
      resourceId: page._id,
      details: `Updated page: ${page.slug}`,
      ipAddress: req.ip
    });

    res.status(200).json({
      success: true,
      message: 'Page updated successfully',
      data: page
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete page
// @route   DELETE /api/admin/cms/pages/:id
// @access  Private/Admin
exports.deletePage = async (req, res, next) => {
  try {
    const page = await Page.findById(req.params.id);

    if (!page) {
      return res.status(404).json({
        success: false,
        message: 'Page not found'
      });
    }

    // Audit log
    await AuditTrail.create({
      user: req.user.id,
      action: 'delete',
      resourceType: 'Page',
      resourceId: page._id,
      details: `Deleted page: ${page.slug}`,
      ipAddress: req.ip
    });

    await page.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Page deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Publish page
// @route   PUT /api/admin/cms/pages/:id/publish
// @access  Private/Admin
exports.publishPage = async (req, res, next) => {
  try {
    const page = await Page.findById(req.params.id);

    if (!page) {
      return res.status(404).json({
        success: false,
        message: 'Page not found'
      });
    }

    page.status = 'published';
    page.publishedAt = Date.now();
    await page.save();

    // Audit log
    await AuditTrail.create({
      user: req.user.id,
      action: 'publish',
      resourceType: 'Page',
      resourceId: page._id,
      details: `Published page: ${page.slug}`,
      ipAddress: req.ip
    });

    res.status(200).json({
      success: true,
      message: 'Page published successfully',
      data: page
    });
  } catch (error) {
    next(error);
  }
};

// ========== MEDIA MANAGEMENT ==========

// @desc    Get all media
// @route   GET /api/admin/cms/media
// @access  Private/Admin
exports.getAllMedia = async (req, res, next) => {
  try {
    const { type, category, search, page = 1, limit = 20 } = mongoSanitize(req.query);

    const query = {};
    if (type) query.type = type;
    if (category) query.category = category;
    if (search) {
      // Escape regex special characters to prevent regex injection
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { originalName: { $regex: escapedSearch, $options: 'i' } },
        { 'title.en': { $regex: escapedSearch, $options: 'i' } },
        { tags: { $in: [new RegExp(escapedSearch, 'i')] } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const media = await Media.find(query)
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Media.countDocuments(query);

    res.status(200).json({
      success: true,
      count: media.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: media
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single media item
// @route   GET /api/admin/cms/media/:id
// @access  Private/Admin
exports.getMedia = async (req, res, next) => {
  try {
    const media = await Media.findById(req.params.id)
      .populate('uploadedBy', 'name email');

    if (!media) {
      return res.status(404).json({
        success: false,
        message: 'Media not found'
      });
    }

    res.status(200).json({
      success: true,
      data: media
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update media metadata
// @route   PUT /api/admin/cms/media/:id
// @access  Private/Admin
exports.updateMedia = async (req, res, next) => {
  try {
    const media = await Media.findById(req.params.id);

    if (!media) {
      return res.status(404).json({
        success: false,
        message: 'Media not found'
      });
    }

    // Sanitize input to prevent MongoDB injection
    const sanitizedBody = mongoSanitize(req.body);
    const { title, description, altText, tags, category } = sanitizedBody;

    if (title) media.title = title;
    if (description) media.description = description;
    if (altText) media.altText = altText;
    if (tags) media.tags = tags;
    if (category) media.category = category;

    await media.save();

    // Audit log
    await AuditTrail.create({
      user: req.user.id,
      action: 'update',
      resourceType: 'Media',
      resourceId: media._id,
      details: `Updated media: ${media.originalName}`,
      ipAddress: req.ip
    });

    res.status(200).json({
      success: true,
      message: 'Media updated successfully',
      data: media
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete media
// @route   DELETE /api/admin/cms/media/:id
// @access  Private/Admin
exports.deleteMedia = async (req, res, next) => {
  try {
    const media = await Media.findById(req.params.id);

    if (!media) {
      return res.status(404).json({
        success: false,
        message: 'Media not found'
      });
    }

    // Delete file from filesystem with path traversal protection
    try {
      const uploadsDir = path.join(__dirname, '..', 'uploads');
      const filePath = path.join(__dirname, '..', media.path);
      
      // Ensure the resolved path is within the uploads directory (prevent path traversal)
      const resolvedPath = path.resolve(filePath);
      const resolvedUploadsDir = path.resolve(uploadsDir);
      
      // Use path.relative for more robust cross-platform path traversal detection
      const relativePath = path.relative(resolvedUploadsDir, resolvedPath);
      
      // If relative path starts with '..' or is absolute, it's outside uploads directory
      if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
        throw new Error('Invalid file path detected');
      }
      
      await fs.unlink(resolvedPath);
    } catch (err) {
      // File may already be deleted or not exist, or invalid path
      // Log only generic message to prevent information disclosure
      // eslint-disable-next-line no-console
      console.warn('Failed to delete media file during cleanup operation');
    }

    // Audit log
    await AuditTrail.create({
      user: req.user.id,
      action: 'delete',
      resourceType: 'Media',
      resourceId: media._id,
      details: `Deleted media: ${media.originalName}`,
      ipAddress: req.ip
    });

    await media.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Media deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// ========== ANNOUNCEMENT MANAGEMENT ==========

// @desc    Get all announcements
// @route   GET /api/admin/cms/announcements
// @access  Private/Admin
exports.getAllAnnouncements = async (req, res, next) => {
  try {
    const { status, priority, type } = mongoSanitize(req.query);

    const query = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (type) query.type = type;

    const announcements = await Announcement.find(query)
      .populate('author', 'name email')
      .sort({ startDate: -1 });

    res.status(200).json({
      success: true,
      count: announcements.length,
      data: announcements
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create announcement
// @route   POST /api/admin/cms/announcements
// @access  Private/Admin
exports.createAnnouncement = async (req, res, next) => {
  try {
    // Sanitize input to prevent MongoDB injection
    const sanitizedBody = mongoSanitize(req.body);
    const announcementData = {
      ...sanitizedBody,
      author: req.user.id
    };

    const announcement = await Announcement.create(announcementData);

    // Audit log
    await AuditTrail.create({
      user: req.user.id,
      action: 'create',
      resourceType: 'Announcement',
      resourceId: announcement._id,
      details: `Created announcement`,
      ipAddress: req.ip
    });

    res.status(201).json({
      success: true,
      message: 'Announcement created successfully',
      data: announcement
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update announcement
// @route   PUT /api/admin/cms/announcements/:id
// @access  Private/Admin
exports.updateAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    // Sanitize input to prevent MongoDB injection
    const sanitizedBody = mongoSanitize(req.body);

    Object.keys(sanitizedBody).forEach(key => {
      if (key !== '_id' && key !== 'author') {
        announcement[key] = sanitizedBody[key];
      }
    });

    await announcement.save();

    // Audit log
    await AuditTrail.create({
      user: req.user.id,
      action: 'update',
      resourceType: 'Announcement',
      resourceId: announcement._id,
      details: `Updated announcement`,
      ipAddress: req.ip
    });

    res.status(200).json({
      success: true,
      message: 'Announcement updated successfully',
      data: announcement
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete announcement
// @route   DELETE /api/admin/cms/announcements/:id
// @access  Private/Admin
exports.deleteAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    // Audit log
    await AuditTrail.create({
      user: req.user.id,
      action: 'delete',
      resourceType: 'Announcement',
      resourceId: announcement._id,
      details: `Deleted announcement`,
      ipAddress: req.ip
    });

    await announcement.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Announcement deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// ========== CONTENT MODERATION ==========

// @desc    Get pending forum posts for moderation
// @route   GET /api/admin/cms/moderation/forums
// @access  Private/Admin
exports.getPendingForumPosts = async (req, res, next) => {
  try {
    const { status = 'pending' } = mongoSanitize(req.query);

    const posts = await ForumPost.find({ status })
      .populate('author', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: posts.length,
      data: posts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve/Reject forum post
// @route   PUT /api/admin/cms/moderation/forums/:id
// @access  Private/Admin
exports.moderateForumPost = async (req, res, next) => {
  try {
    // Sanitize input to prevent MongoDB injection
    const sanitizedBody = mongoSanitize(req.body);
    const { status, reason } = sanitizedBody;

    // Validate status
    const validStatuses = ['pending', 'approved', 'rejected'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const post = await ForumPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Forum post not found'
      });
    }

    post.status = status;
    if (reason) {
      post.moderationReason = reason;
    }
    post.moderatedBy = req.user.id;
    post.moderatedAt = Date.now();

    await post.save();

    // Audit log
    await AuditTrail.create({
      user: req.user.id,
      action: 'moderate',
      resourceType: 'Forum',
      resourceId: post._id,
      details: `Moderated forum post: ${status}`,
      ipAddress: req.ip
    });

    res.status(200).json({
      success: true,
      message: 'Forum post moderated successfully',
      data: post
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard statistics
// @route   GET /api/admin/cms/stats
// @access  Private/Admin
exports.getDashboardStats = async (req, res, next) => {
  try {
    const User = require('../models/User');
    
    const [
      totalPages,
      publishedPages,
      totalMedia,
      activeAnnouncements,
      totalCourses,
      pendingForums,
      totalUsers,
      studentUsers,
      trainerUsers,
      adminUsers
    ] = await Promise.all([
      Page.countDocuments(),
      Page.countDocuments({ status: 'published' }),
      Media.countDocuments(),
      Announcement.countDocuments({ status: 'active' }),
      Course.countDocuments(),
      ForumPost.countDocuments({ status: 'pending' }),
      User.countDocuments(),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'trainer' }),
      User.countDocuments({ role: 'admin' })
    ]);

    res.status(200).json({
      success: true,
      data: {
        pages: {
          total: totalPages,
          published: publishedPages,
          draft: totalPages - publishedPages
        },
        media: {
          total: totalMedia
        },
        announcements: {
          active: activeAnnouncements
        },
        courses: {
          total: totalCourses
        },
        moderation: {
          pendingForums
        },
        users: {
          total: totalUsers,
          students: studentUsers,
          trainers: trainerUsers,
          admins: adminUsers
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// ========== AUDIT TRAIL ==========

// @desc    Get audit trail logs
// @route   GET /api/admin/cms/audit-trail
// @access  Private/Admin
exports.getAuditTrail = async (req, res, next) => {
  try {
    const { 
      action, 
      resourceType, 
      userId, 
      page = 1, 
      limit = 50,
      startDate,
      endDate 
    } = mongoSanitize(req.query);

    const query = {};
    if (action) query.action = action;
    if (resourceType) query.resourceType = resourceType;
    if (userId) query.user = userId;
    
    // Date filtering
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const auditLogs = await AuditTrail.find(query)
      .populate('user', 'name email role')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await AuditTrail.countDocuments(query);

    res.status(200).json({
      success: true,
      count: auditLogs.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: auditLogs
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get audit trail for specific resource
// @route   GET /api/admin/cms/audit-trail/resource/:resourceType/:resourceId
// @access  Private/Admin
exports.getResourceAuditTrail = async (req, res, next) => {
  try {
    const { resourceType, resourceId } = req.params;
    const { page = 1, limit = 20 } = mongoSanitize(req.query);

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const auditLogs = await AuditTrail.find({
      resourceType,
      resourceId
    })
      .populate('user', 'name email role')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await AuditTrail.countDocuments({
      resourceType,
      resourceId
    });

    res.status(200).json({
      success: true,
      count: auditLogs.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: auditLogs
    });
  } catch (error) {
    next(error);
  }
};
