const ForumPost = require('../models/Forum');
const logger = require('../utils/logger');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

// @desc    Get forum posts
// @route   GET /api/forums
// @access  Public
exports.getForumPosts = async (req, res, _next) => {
  try {
    const {
      courseId,
      category,
      search,
      page = 1,
      limit = 20
    } = req.query;

    const query = {};
    
    if (courseId) query.course = courseId;
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    const posts = await ForumPost.find(query)
      .populate('author', 'name avatar')
      .populate('course', 'title')
      .sort({ isPinned: -1, lastActivityAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await ForumPost.countDocuments(query);

    res.status(200).json({
      success: true,
      count: posts.length,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      data: posts
    });
  } catch (error) {
    logger.error('Get forum posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching forum posts',
      error: error.message
    });
  }
};

// @desc    Get single forum post
// @route   GET /api/forums/:id
// @access  Public
exports.getForumPost = async (req, res, _next) => {
  try {
    const post = await ForumPost.findById(req.params.id)
      .populate('author', 'name avatar role')
      .populate('course', 'title')
      .populate('replies.user', 'name avatar role')
      .populate('resolvedBy', 'name');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Forum post not found'
      });
    }

    // Increment view count
    post.views += 1;
    await post.save();

    res.status(200).json({
      success: true,
      data: post
    });
  } catch (error) {
    logger.error('Get forum post error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching forum post',
      error: error.message
    });
  }
};

// @desc    Create forum post
// @route   POST /api/forums
// @access  Private
exports.createForumPost = async (req, res, _next) => {
  try {
    const { title, content, courseId, lessonId, category, tags } = req.body;

    // If course-specific, verify user is enrolled or is trainer/admin
    if (courseId) {
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }

      const isEnrolled = await Enrollment.findOne({
        user: req.user.id,
        course: courseId
      });

      const isInstructor = course.instructor.toString() === req.user.id;
      const isAdmin = req.user.role === 'admin';

      if (!isEnrolled && !isInstructor && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'You must be enrolled in the course to post'
        });
      }
    }

    const post = await ForumPost.create({
      title,
      content,
      author: req.user.id,
      course: courseId,
      lesson: lessonId,
      category: category || 'general',
      tags: tags || []
    });

    const populatedPost = await ForumPost.findById(post._id)
      .populate('author', 'name avatar')
      .populate('course', 'title');

    res.status(201).json({
      success: true,
      data: populatedPost
    });
  } catch (error) {
    logger.error('Create forum post error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating forum post',
      error: error.message
    });
  }
};

// @desc    Update forum post
// @route   PUT /api/forums/:id
// @access  Private
exports.updateForumPost = async (req, res, _next) => {
  try {
    let post = await ForumPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Forum post not found'
      });
    }

    // Check if user is author or admin
    if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this post'
      });
    }

    const { title, content, category, tags } = req.body;

    post.title = title || post.title;
    post.content = content || post.content;
    post.category = category || post.category;
    post.tags = tags || post.tags;
    post.updatedAt = Date.now();

    await post.save();

    post = await ForumPost.findById(post._id)
      .populate('author', 'name avatar')
      .populate('course', 'title');

    res.status(200).json({
      success: true,
      data: post
    });
  } catch (error) {
    logger.error('Update forum post error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating forum post',
      error: error.message
    });
  }
};

// @desc    Delete forum post
// @route   DELETE /api/forums/:id
// @access  Private
exports.deleteForumPost = async (req, res, _next) => {
  try {
    const post = await ForumPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Forum post not found'
      });
    }

    // Check if user is author or admin
    if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this post'
      });
    }

    await post.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Forum post deleted successfully'
    });
  } catch (error) {
    logger.error('Delete forum post error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting forum post',
      error: error.message
    });
  }
};

// @desc    Add reply to forum post
// @route   POST /api/forums/:id/replies
// @access  Private
exports.addReply = async (req, res, _next) => {
  try {
    const { content } = req.body;
    const post = await ForumPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Forum post not found'
      });
    }

    if (post.isClosed) {
      return res.status(400).json({
        success: false,
        message: 'This post is closed for replies'
      });
    }

    post.replies.push({
      user: req.user.id,
      content,
      createdAt: Date.now()
    });

    await post.save();

    const updatedPost = await ForumPost.findById(post._id)
      .populate('replies.user', 'name avatar role');

    res.status(201).json({
      success: true,
      data: updatedPost.replies[updatedPost.replies.length - 1]
    });
  } catch (error) {
    logger.error('Add reply error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding reply',
      error: error.message
    });
  }
};

// @desc    Like forum post
// @route   POST /api/forums/:id/like
// @access  Private
exports.likePost = async (req, res, _next) => {
  try {
    const post = await ForumPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Forum post not found'
      });
    }

    const alreadyLiked = post.likes.some(
      like => like.toString() === req.user.id
    );

    if (alreadyLiked) {
      // Unlike
      post.likes = post.likes.filter(
        like => like.toString() !== req.user.id
      );
    } else {
      // Like
      post.likes.push(req.user.id);
    }

    await post.save();

    res.status(200).json({
      success: true,
      data: {
        likes: post.likes.length,
        isLiked: !alreadyLiked
      }
    });
  } catch (error) {
    logger.error('Like post error:', error);
    res.status(500).json({
      success: false,
      message: 'Error liking post',
      error: error.message
    });
  }
};

// @desc    Mark post as resolved
// @route   POST /api/forums/:id/resolve
// @access  Private
exports.markAsResolved = async (req, res, _next) => {
  try {
    const post = await ForumPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Forum post not found'
      });
    }

    // Only author, trainer, or admin can mark as resolved
    const course = await Course.findById(post.course);
    const isAuthor = post.author.toString() === req.user.id;
    const isInstructor = course && course.instructor.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isAuthor && !isInstructor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to resolve this post'
      });
    }

    post.isResolved = !post.isResolved;
    post.resolvedBy = post.isResolved ? req.user.id : null;
    post.resolvedAt = post.isResolved ? Date.now() : null;

    await post.save();

    res.status(200).json({
      success: true,
      data: {
        isResolved: post.isResolved
      }
    });
  } catch (error) {
    logger.error('Mark as resolved error:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking post as resolved',
      error: error.message
    });
  }
};
