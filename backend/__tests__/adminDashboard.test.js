const request = require('supertest');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { app } = require('../server');
const User = require('../models/User');
const Media = require('../models/Media');
const Announcement = require('../models/Announcement');
const ForumPost = require('../models/Forum');
const AuditTrail = require('../models/AuditTrail');

describe('Admin Dashboard Features', () => {
  let adminToken;
  let adminUser;
  let testUserId;

  beforeAll(async () => {
    // Connect to test database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_TEST_URI || process.env.MONGODB_URI || process.env.MONGO_URI_TEST || process.env.MONGO_URI);
    }

    // Create admin user for testing
    adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@test.com',
      password: 'password123',
      role: 'admin',
      isVerified: true,
      isActive: true
    });

    adminToken = jwt.sign({ id: adminUser._id, role: adminUser.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '1h' });
    testUserId = adminUser._id;
  });

  afterAll(async () => {
    // Clean up test data
    await User.deleteMany({ email: /test\.com/ });
    await Media.deleteMany({ uploadedBy: testUserId });
    await Announcement.deleteMany({ author: testUserId });
    await ForumPost.deleteMany({ author: testUserId });
    await AuditTrail.deleteMany({ user: testUserId });
    await mongoose.connection.close();
  });

  describe('1. Media Management', () => {
    let mediaId;

    it('should allow admin to get all media', async () => {
      const response = await request(app)
        .get('/api/admin/cms/media')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should allow admin to filter media by type', async () => {
      const response = await request(app)
        .get('/api/admin/cms/media?type=image')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should allow admin to filter media by category', async () => {
      const response = await request(app)
        .get('/api/admin/cms/media?category=course')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should allow admin to search media by tags', async () => {
      // First create a media item with tags
      const media = await Media.create({
        filename: 'test-file.jpg',
        originalName: 'test.jpg',
        mimeType: 'image/jpeg',
        size: 1024,
        path: '/uploads/test/test-file.jpg',
        url: 'http://localhost:5000/uploads/test/test-file.jpg',
        type: 'image',
        category: 'general',
        uploadedBy: testUserId,
        tags: ['test', 'sample', 'demo']
      });

      mediaId = media._id;

      const response = await request(app)
        .get('/api/admin/cms/media?search=test')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should allow admin to update media metadata', async () => {
      if (!mediaId) {
        const media = await Media.create({
          filename: 'test-file2.jpg',
          originalName: 'test2.jpg',
          mimeType: 'image/jpeg',
          size: 1024,
          path: '/uploads/test/test-file2.jpg',
          url: 'http://localhost:5000/uploads/test/test-file2.jpg',
          type: 'image',
          category: 'general',
          uploadedBy: testUserId,
          tags: []
        });
        mediaId = media._id;
      }

      const response = await request(app)
        .put(`/api/admin/cms/media/${mediaId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          tags: ['updated', 'new-tag'],
          category: 'course'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('updated');
    });

    it('should deny non-admin access to media management', async () => {
      await request(app)
        .get('/api/admin/cms/media')
        .expect(401);
    });
  });

  describe('2. Announcement Management', () => {
    let announcementId;

    it('should allow admin to create announcement', async () => {
      const response = await request(app)
        .post('/api/admin/cms/announcements')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: { en: 'Test Announcement' },
          content: { en: 'This is a test announcement' },
          type: 'info',
          priority: 'medium',
          status: 'active',
          startDate: new Date(),
          targetAudience: ['all']
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('_id');
      announcementId = response.body.data._id;
    });

    it('should allow admin to get all announcements', async () => {
      const response = await request(app)
        .get('/api/admin/cms/announcements')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should allow admin to filter announcements by status', async () => {
      const response = await request(app)
        .get('/api/admin/cms/announcements?status=active')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should allow admin to update announcement', async () => {
      if (!announcementId) {
        const announcement = await Announcement.create({
          title: { en: 'Update Test' },
          content: { en: 'Content' },
          type: 'info',
          status: 'draft',
          startDate: new Date(),
          author: testUserId
        });
        announcementId = announcement._id;
      }

      const response = await request(app)
        .put(`/api/admin/cms/announcements/${announcementId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          priority: 'high',
          status: 'active'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should allow admin to delete announcement', async () => {
      if (announcementId) {
        const response = await request(app)
          .delete(`/api/admin/cms/announcements/${announcementId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
      }
    });

    it('should deny non-admin access to announcement management', async () => {
      await request(app)
        .get('/api/admin/cms/announcements')
        .expect(401);
    });
  });

  describe('3. Content Moderation (Forum Posts)', () => {
    let forumPostId;

    beforeAll(async () => {
      // Create a test forum post for moderation
      const post = await ForumPost.create({
        title: 'Test Forum Post',
        content: 'This is test content for moderation',
        author: testUserId,
        category: 'general',
        status: 'pending'
      });
      forumPostId = post._id;
    });

    it('should allow admin to get pending forum posts', async () => {
      const response = await request(app)
        .get('/api/admin/cms/moderation/forums?status=pending')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should allow admin to approve forum post', async () => {
      const response = await request(app)
        .put(`/api/admin/cms/moderation/forums/${forumPostId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'approved'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('approved');
    });

    it('should allow admin to reject forum post with reason', async () => {
      const response = await request(app)
        .put(`/api/admin/cms/moderation/forums/${forumPostId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'rejected',
          reason: 'Inappropriate content'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('rejected');
      expect(response.body.data.moderationReason).toBe('Inappropriate content');
    });

    it('should log moderation actions in audit trail', async () => {
      // Check if audit log was created
      const auditLog = await AuditTrail.findOne({
        action: 'moderate',
        resourceType: 'Forum',
        resourceId: forumPostId
      });

      expect(auditLog).toBeTruthy();
      expect(auditLog.user.toString()).toBe(testUserId.toString());
    });

    it('should deny non-admin access to moderation', async () => {
      await request(app)
        .get('/api/admin/cms/moderation/forums')
        .expect(401);
    });
  });

  describe('4. Role-Based Access Control', () => {
    let studentUser;
    let studentToken;
    let trainerUser;
    let trainerToken;

    beforeAll(async () => {
      // Create student user
      studentUser = await User.create({
        name: 'Student User',
        email: 'student@test.com',
        password: 'password123',
        role: 'student',
        isVerified: true,
        isActive: true
      });
      studentToken = jwt.sign({ id: studentUser._id, role: studentUser.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '1h' });

      // Create trainer user
      trainerUser = await User.create({
        name: 'Trainer User',
        email: 'trainer@test.com',
        password: 'password123',
        role: 'trainer',
        isVerified: true,
        isActive: true
      });
      trainerToken = jwt.sign({ id: trainerUser._id, role: trainerUser.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '1h' });
    });

    it('should allow admin to access admin routes', async () => {
      const response = await request(app)
        .get('/api/admin/cms/stats')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should deny student access to admin routes', async () => {
      const response = await request(app)
        .get('/api/admin/cms/stats')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not authorized');
    });

    it('should deny trainer access to admin routes', async () => {
      const response = await request(app)
        .get('/api/admin/cms/stats')
        .set('Authorization', `Bearer ${trainerToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not authorized');
    });

    it('should deny unauthenticated access to admin routes', async () => {
      const response = await request(app)
        .get('/api/admin/cms/stats')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('5. Audit Trail Logging', () => {
    it('should allow admin to view audit trail', async () => {
      const response = await request(app)
        .get('/api/admin/cms/audit-trail')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('page');
    });

    it('should allow admin to filter audit trail by action', async () => {
      const response = await request(app)
        .get('/api/admin/cms/audit-trail?action=create')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should allow admin to filter audit trail by resource type', async () => {
      const response = await request(app)
        .get('/api/admin/cms/audit-trail?resourceType=Media')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should allow admin to filter audit trail by date range', async () => {
      const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const endDate = new Date().toISOString();

      const response = await request(app)
        .get(`/api/admin/cms/audit-trail?startDate=${startDate}&endDate=${endDate}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should allow admin to view audit trail for specific resource', async () => {
      // Create a media item to track
      const media = await Media.create({
        filename: 'audit-test.jpg',
        originalName: 'audit.jpg',
        mimeType: 'image/jpeg',
        size: 1024,
        path: '/uploads/test/audit-test.jpg',
        url: 'http://localhost:5000/uploads/test/audit-test.jpg',
        type: 'image',
        category: 'general',
        uploadedBy: testUserId,
        tags: ['audit']
      });

      // Create audit log
      await AuditTrail.create({
        user: testUserId,
        action: 'create',
        resourceType: 'Media',
        resourceId: media._id,
        details: 'Created media for audit test',
        ipAddress: '127.0.0.1'
      });

      const response = await request(app)
        .get(`/api/admin/cms/audit-trail/resource/Media/${media._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should log all admin actions', async () => {
      // Perform an admin action
      const announcement = await Announcement.create({
        title: { en: 'Audit Test Announcement' },
        content: { en: 'Testing audit trail' },
        type: 'info',
        status: 'draft',
        startDate: new Date(),
        author: testUserId
      });

      // Check if audit log exists
      const auditLog = await AuditTrail.findOne({
        action: 'create',
        resourceType: 'Announcement',
        resourceId: announcement._id
      });

      expect(auditLog).toBeTruthy();
    });

    it('should deny non-admin access to audit trail', async () => {
      await request(app)
        .get('/api/admin/cms/audit-trail')
        .expect(401);
    });
  });

  describe('6. Dashboard Statistics', () => {
    it('should provide comprehensive dashboard statistics', async () => {
      const response = await request(app)
        .get('/api/admin/cms/stats')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('pages');
      expect(response.body.data).toHaveProperty('media');
      expect(response.body.data).toHaveProperty('announcements');
      expect(response.body.data).toHaveProperty('courses');
      expect(response.body.data).toHaveProperty('moderation');
      expect(response.body.data).toHaveProperty('users');
    });

    it('should include user role breakdown in stats', async () => {
      const response = await request(app)
        .get('/api/admin/cms/stats')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.data.users).toHaveProperty('total');
      expect(response.body.data.users).toHaveProperty('students');
      expect(response.body.data.users).toHaveProperty('trainers');
      expect(response.body.data.users).toHaveProperty('admins');
    });

    it('should include moderation queue count', async () => {
      const response = await request(app)
        .get('/api/admin/cms/stats')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.data.moderation).toHaveProperty('pendingForums');
      expect(typeof response.body.data.moderation.pendingForums).toBe('number');
    });
  });
});
