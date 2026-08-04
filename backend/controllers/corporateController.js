const { Organization, TeamEnrollment } = require('../models/Corporate');
const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

// @desc    Create organization
// @route   POST /api/corporate/organizations
// @access  Private
exports.createOrganization = async (req, res, next) => {
  try {
    const organizationData = {
      ...req.body,
      admin: req.user.id,
    };

    const organization = await Organization.create(organizationData);

    res.status(201).json({
      success: true,
      data: organization,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all organizations (Admin only)
// @route   GET /api/corporate/organizations
// @access  Private/Admin
exports.getAllOrganizations = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const query = {};
    if (status) query['subscription.status'] = status;

    const organizations = await Organization.find(query)
      .populate('admin', 'name email')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort('-createdAt');

    const total = await Organization.countDocuments(query);

    res.status(200).json({
      success: true,
      count: organizations.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: organizations,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single organization
// @route   GET /api/corporate/organizations/:id
// @access  Private
exports.getOrganization = async (req, res, next) => {
  try {
    const organization = await Organization.findById(req.params.id)
      .populate('admin', 'name email')
      .populate('members.user', 'name email avatar');

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found',
      });
    }

    // Check if user has access
    const isMember = organization.members.some((m) => m.user._id.toString() === req.user.id);
    const isAdmin = organization.admin._id.toString() === req.user.id;
    const isSuperAdmin = req.user.role === 'admin';

    if (!isAdmin && !isMember && !isSuperAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this organization',
      });
    }

    res.status(200).json({
      success: true,
      data: organization,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update organization
// @route   PUT /api/corporate/organizations/:id
// @access  Private/OrgAdmin
exports.updateOrganization = async (req, res, next) => {
  try {
    let organization = await Organization.findById(req.params.id);

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found',
      });
    }

    // Check if user is org admin or super admin
    if (organization.admin.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this organization',
      });
    }

    organization = await Organization.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: organization,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add member to organization
// @route   POST /api/corporate/organizations/:id/members
// @access  Private/OrgAdmin
exports.addMember = async (req, res, next) => {
  try {
    const { userId, role = 'member', department } = req.body;

    const organization = await Organization.findById(req.params.id);

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found',
      });
    }

    // Check authorization
    if (organization.admin.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add members',
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check if already a member
    const isMember = organization.members.some((m) => m.user.toString() === userId);
    if (isMember) {
      return res.status(400).json({
        success: false,
        message: 'User is already a member',
      });
    }

    // Check subscription limits
    if (organization.members.length >= organization.subscription.maxUsers) {
      return res.status(400).json({
        success: false,
        message: 'Organization has reached maximum user limit',
      });
    }

    organization.members.push({
      user: userId,
      role,
      department,
    });

    await organization.save();

    res.status(200).json({
      success: true,
      data: organization,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove member from organization
// @route   DELETE /api/corporate/organizations/:id/members/:memberId
// @access  Private/OrgAdmin
exports.removeMember = async (req, res, next) => {
  try {
    const organization = await Organization.findById(req.params.id);

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found',
      });
    }

    // Check authorization
    if (organization.admin.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to remove members',
      });
    }

    organization.members = organization.members.filter(
      (m) => m.user.toString() !== req.params.memberId
    );

    await organization.save();

    res.status(200).json({
      success: true,
      data: organization,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create team enrollment
// @route   POST /api/corporate/team-enrollments
// @access  Private/OrgAdmin
exports.createTeamEnrollment = async (req, res, next) => {
  try {
    const { organizationId, courseId, memberIds, deadline } = req.body;

    const organization = await Organization.findById(organizationId);
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found',
      });
    }

    // Check authorization
    const isOrgAdmin = organization.admin.toString() === req.user.id;
    const isOrgManager = organization.members.some(
      (m) =>
        m.user.toString() === req.user.id &&
        (m.role === 'admin' || m.role === 'manager')
    );
    if (!isOrgAdmin && !isOrgManager && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to create team enrollments',
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    // Create team enrollment
    const members = memberIds.map((userId) => ({
      user: userId,
      status: 'enrolled',
    }));

    const teamEnrollment = await TeamEnrollment.create({
      organization: organizationId,
      course: courseId,
      members,
      manager: req.user.id,
      deadline,
      purchaseInfo: {
        quantity: memberIds.length,
        pricePerSeat: course.price,
        totalAmount: course.price * memberIds.length,
        // persist the currency of the course at the time of purchase
        currency: course.currency,
      },
    });

    // Create individual enrollments
    for (const userId of memberIds) {
      const existingEnrollment = await Enrollment.findOne({
        user: userId,
        course: courseId,
      });
      if (!existingEnrollment) {
        await Enrollment.create({
          user: userId,
          course: courseId,
          enrolledAt: new Date(),
        });
      }
    }

    const populated = await teamEnrollment
      .populate('course')
      .populate('members.user', 'name email')
      .populate('manager', 'name email');

    res.status(201).json({
      success: true,
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get team enrollments
// @route   GET /api/corporate/team-enrollments
// @access  Private
exports.getTeamEnrollments = async (req, res, next) => {
  try {
    const { organizationId } = req.query;
    const query = {};
    if (organizationId) query.organization = organizationId;

    const teamEnrollments = await TeamEnrollment.find(query)
      .populate('organization')
      .populate('course')
      .populate('members.user', 'name email avatar')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: teamEnrollments.length,
      data: teamEnrollments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get team enrollment stats
// @route   GET /api/corporate/team-enrollments/:id/stats
// @access  Private
exports.getTeamEnrollmentStats = async (req, res, next) => {
  try {
    const teamEnrollment = await TeamEnrollment.findById(req.params.id).populate(
      'members.user',
      'name email'
    );
    if (!teamEnrollment) {
      return res.status(404).json({
        success: false,
        message: 'Team enrollment not found',
      });
    }
    const stats = {
      totalMembers: teamEnrollment.members.length,
      enrolled: teamEnrollment.members.filter((m) => m.status === 'enrolled')
        .length,
      inProgress: teamEnrollment.members.filter(
        (m) => m.status === 'in_progress'
      ).length,
      completed: teamEnrollment.members.filter(
        (m) => m.status === 'completed'
      ).length,
      dropped: teamEnrollment.members.filter((m) => m.status === 'dropped')
        .length,
      averageProgress:
        teamEnrollment.members.reduce((sum, m) => sum + m.progress, 0) /
        teamEnrollment.members.length,
    };

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = exports;
