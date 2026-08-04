const EmailCampaign = require('../models/EmailCampaign');
const EmailNewsletter = require('../models/EmailNewsletter');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const { sendBulkEmails, sendNewsletter, createEmailTemplate } = require('../services/emailService');
const logger = require('../utils/logger');
const mongoSanitize = require('mongo-sanitize');

// @desc    Get all email campaigns
// @route   GET /api/admin/email-marketing/campaigns
// @access  Private/Admin
exports.getAllCampaigns = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = mongoSanitize(req.query);
    
    const query = {};
    if (status) query.status = status;
    
    const campaigns = await EmailCampaign.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    const total = await EmailCampaign.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: campaigns.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: campaigns
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single campaign
// @route   GET /api/admin/email-marketing/campaigns/:id
// @access  Private/Admin
exports.getCampaign = async (req, res, next) => {
  try {
    const campaign = await EmailCampaign.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('customRecipients', 'name email');
    
    if (!campaign) {
      return next(new ErrorResponse('Campaign not found', 404));
    }
    
    res.status(200).json({
      success: true,
      data: campaign
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new campaign
// @route   POST /api/admin/email-marketing/campaigns
// @access  Private/Admin
exports.createCampaign = async (req, res, next) => {
  try {
    const sanitizedBody = mongoSanitize(req.body);
    sanitizedBody.createdBy = req.user.id;
    
    const campaign = await EmailCampaign.create(sanitizedBody);
    
    res.status(201).json({
      success: true,
      data: campaign
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update campaign
// @route   PUT /api/admin/email-marketing/campaigns/:id
// @access  Private/Admin
exports.updateCampaign = async (req, res, next) => {
  try {
    let campaign = await EmailCampaign.findById(req.params.id);
    
    if (!campaign) {
      return next(new ErrorResponse('Campaign not found', 404));
    }
    
    if (campaign.status === 'sent') {
      return next(new ErrorResponse('Cannot update a sent campaign', 400));
    }
    
    const sanitizedBody = mongoSanitize(req.body);
    campaign = await EmailCampaign.findByIdAndUpdate(
      req.params.id,
      sanitizedBody,
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      data: campaign
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete campaign
// @route   DELETE /api/admin/email-marketing/campaigns/:id
// @access  Private/Admin
exports.deleteCampaign = async (req, res, next) => {
  try {
    const campaign = await EmailCampaign.findById(req.params.id);
    
    if (!campaign) {
      return next(new ErrorResponse('Campaign not found', 404));
    }
    
    if (campaign.status === 'sending') {
      return next(new ErrorResponse('Cannot delete a campaign that is currently being sent', 400));
    }
    
    await campaign.deleteOne();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send campaign
// @route   POST /api/admin/email-marketing/campaigns/:id/send
// @access  Private/Admin
exports.sendCampaign = async (req, res, next) => {
  try {
    const campaign = await EmailCampaign.findById(req.params.id);
    
    if (!campaign) {
      return next(new ErrorResponse('Campaign not found', 404));
    }
    
    if (campaign.status === 'sent') {
      return next(new ErrorResponse('Campaign has already been sent', 400));
    }
    
    campaign.status = 'sending';
    await campaign.save();
    
    try {
      let recipients = [];
      
      if (campaign.recipientType === 'all') {
        recipients = await User.find({ isActive: true }).select('name email');
      } else if (campaign.recipientType === 'custom') {
        recipients = await User.find({
          _id: { $in: campaign.customRecipients },
          isActive: true
        }).select('name email');
      } else {
        // Filter by role (students, trainers, admins)
        const roleMap = {
          'students': 'student',
          'trainers': 'trainer',
          'admins': 'admin'
        };
        recipients = await User.find({
          role: roleMap[campaign.recipientType] || 'student',
          isActive: true
        }).select('name email');
      }
      
      const emailContent = createEmailTemplate(campaign.content, {
        title: campaign.subject
      });
      
      const results = await sendBulkEmails(
        recipients.map(r => ({ name: r.name, email: r.email })),
        campaign.subject,
        emailContent
      );
      
      campaign.status = results.failed === results.total ? 'failed' : 'sent';
      campaign.sentAt = new Date();
      campaign.totalRecipients = results.total;
      campaign.successfulSends = results.successful;
      campaign.failedSends = results.failed;
      await campaign.save();
      
      res.status(200).json({
        success: true,
        data: {
          campaign,
          results
        }
      });
    } catch (error) {
      campaign.status = 'failed';
      await campaign.save();
      logger.error('Error sending campaign:', error);
      return next(new ErrorResponse('Failed to send campaign', 500));
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get campaign statistics
// @route   GET /api/admin/email-marketing/campaigns/:id/stats
// @access  Private/Admin
exports.getCampaignStats = async (req, res, next) => {
  try {
    const campaign = await EmailCampaign.findById(req.params.id);
    
    if (!campaign) {
      return next(new ErrorResponse('Campaign not found', 404));
    }
    
    const stats = {
      totalRecipients: campaign.totalRecipients,
      successfulSends: campaign.successfulSends,
      failedSends: campaign.failedSends,
      successRate: campaign.totalRecipients > 0 
        ? ((campaign.successfulSends / campaign.totalRecipients) * 100).toFixed(2)
        : 0,
      openRate: campaign.openRate,
      clickRate: campaign.clickRate,
      status: campaign.status,
      sentAt: campaign.sentAt
    };
    
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all newsletters
// @route   GET /api/admin/email-marketing/newsletters
// @access  Private/Admin
exports.getAllNewsletters = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = mongoSanitize(req.query);
    
    const query = {};
    if (status) query.status = status;
    
    const newsletters = await EmailNewsletter.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    const total = await EmailNewsletter.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: newsletters.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: newsletters
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single newsletter
// @route   GET /api/admin/email-marketing/newsletters/:id
// @access  Private/Admin
exports.getNewsletter = async (req, res, next) => {
  try {
    const newsletter = await EmailNewsletter.findById(req.params.id)
      .populate('createdBy', 'name email');
    
    if (!newsletter) {
      return next(new ErrorResponse('Newsletter not found', 404));
    }
    
    res.status(200).json({
      success: true,
      data: newsletter
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create newsletter
// @route   POST /api/admin/email-marketing/newsletters
// @access  Private/Admin
exports.createNewsletter = async (req, res, next) => {
  try {
    const sanitizedBody = mongoSanitize(req.body);
    sanitizedBody.createdBy = req.user.id;
    
    const newsletter = await EmailNewsletter.create(sanitizedBody);
    
    res.status(201).json({
      success: true,
      data: newsletter
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update newsletter
// @route   PUT /api/admin/email-marketing/newsletters/:id
// @access  Private/Admin
exports.updateNewsletter = async (req, res, next) => {
  try {
    let newsletter = await EmailNewsletter.findById(req.params.id);
    
    if (!newsletter) {
      return next(new ErrorResponse('Newsletter not found', 404));
    }
    
    const sanitizedBody = mongoSanitize(req.body);
    newsletter = await EmailNewsletter.findByIdAndUpdate(
      req.params.id,
      sanitizedBody,
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      data: newsletter
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete newsletter
// @route   DELETE /api/admin/email-marketing/newsletters/:id
// @access  Private/Admin
exports.deleteNewsletter = async (req, res, next) => {
  try {
    const newsletter = await EmailNewsletter.findById(req.params.id);
    
    if (!newsletter) {
      return next(new ErrorResponse('Newsletter not found', 404));
    }
    
    await newsletter.deleteOne();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Publish newsletter
// @route   POST /api/admin/email-marketing/newsletters/:id/publish
// @access  Private/Admin
exports.publishNewsletter = async (req, res, next) => {
  try {
    const newsletter = await EmailNewsletter.findById(req.params.id);
    
    if (!newsletter) {
      return next(new ErrorResponse('Newsletter not found', 404));
    }
    
    if (newsletter.status === 'published') {
      return next(new ErrorResponse('Newsletter has already been published', 400));
    }
    
    try {
      const subscribers = await User.find({ isActive: true }).select('name email');
      
      const emailContent = createEmailTemplate(newsletter.content, {
        title: newsletter.title
      });
      
      const results = await sendNewsletter(
        subscribers.map(s => ({ name: s.name, email: s.email })),
        { subject: newsletter.subject, content: emailContent }
      );
      
      newsletter.status = 'published';
      newsletter.publishedAt = new Date();
      newsletter.totalSubscribers = results.total;
      newsletter.sentCount = results.successful;
      await newsletter.save();
      
      res.status(200).json({
        success: true,
        data: {
          newsletter,
          results
        }
      });
    } catch (error) {
      logger.error('Error publishing newsletter:', error);
      return next(new ErrorResponse('Failed to publish newsletter', 500));
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get email marketing dashboard stats
// @route   GET /api/admin/email-marketing/stats
// @access  Private/Admin
exports.getEmailMarketingStats = async (req, res, next) => {
  try {
    const totalCampaigns = await EmailCampaign.countDocuments();
    const sentCampaigns = await EmailCampaign.countDocuments({ status: 'sent' });
    const draftCampaigns = await EmailCampaign.countDocuments({ status: 'draft' });
    const failedCampaigns = await EmailCampaign.countDocuments({ status: 'failed' });
    
    const totalNewsletters = await EmailNewsletter.countDocuments();
    const publishedNewsletters = await EmailNewsletter.countDocuments({ status: 'published' });
    const draftNewsletters = await EmailNewsletter.countDocuments({ status: 'draft' });
    
    const campaignStats = await EmailCampaign.aggregate([
      { $match: { status: 'sent' } },
      {
        $group: {
          _id: null,
          totalSent: { $sum: '$successfulSends' },
          totalFailed: { $sum: '$failedSends' }
        }
      }
    ]);
    
    const newsletterStats = await EmailNewsletter.aggregate([
      { $match: { status: 'published' } },
      {
        $group: {
          _id: null,
          totalSent: { $sum: '$sentCount' }
        }
      }
    ]);
    
    const stats = {
      campaigns: {
        total: totalCampaigns,
        sent: sentCampaigns,
        draft: draftCampaigns,
        failed: failedCampaigns
      },
      newsletters: {
        total: totalNewsletters,
        published: publishedNewsletters,
        draft: draftNewsletters
      },
      emailsSent: {
        campaigns: campaignStats[0]?.totalSent || 0,
        newsletters: newsletterStats[0]?.totalSent || 0,
        total: (campaignStats[0]?.totalSent || 0) + (newsletterStats[0]?.totalSent || 0)
      },
      failedEmails: campaignStats[0]?.totalFailed || 0
    };
    
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};
