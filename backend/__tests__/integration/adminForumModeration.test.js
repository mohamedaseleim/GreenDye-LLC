const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../../server');
const User = require('../../models/User');
const Course = require('../../models/Course');
const ForumPost = require('../../models/Forum');
const AuditTrail = require('../../models/AuditTrail');

describe('Admin Forum Moderation', () => {
  let adminToken;
  let adminUser;
  let studentUser;
  let course;

  beforeAll(async () => {
    // Create admin user
    adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@forumtest.com',
      password: 'password123',
      role: 'admin'
    });
    
    // Get admin token by login
    const adminLoginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@forumtest.com', password: 'password123' });
    adminToken = adminLoginRes.body.data.token;

    // Create student user
    studentUser = await User.create({
      name: 'Student User',
      email: 'student@forumtest.com',
      password: 'password123',
      role: 'student'
    });

    // Create course
    course = await Course.create({
      title: { en: 'Test Forum Course', ar: 'دورة منتدى تجريبية' },
      description: { en: 'Test Description', ar: 'وصف تجريبي' },
      category: 'technology',
      level: 'beginner',
      duration: 10,
      instructor: adminUser._id,
      price: 99.99
    });

    // Create forum post
    await ForumPost.create({
      title: 'Test Forum Post',
      content: 'This is test content for moderation',
      author: studentUser._id,
      course: course._id,
      category: 'question',
      status: 'pending'
    });
  });

  afterAll(async () => {
    // Clean up test data
    await User.deleteMany({ email: { $regex: '@forumtest.com' } });
    await Course.deleteMany({ 'title.en': 'Test Forum Course' });
    await ForumPost.deleteMany({});
    await AuditTrail.deleteMany({ resourceType: 'Forum' });
    await mongoose.connection.close();
  });

  describe('GET /api/admin/cms/moderation/forums', () => {
    it('should get pending forum posts with admin token', async () => {
      const res = await request(app)
        .get('/api/admin/cms/moderation/forums')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should filter by status', async () => {
      const res = await request(app)
        .get('/api/admin/cms/moderation/forums?status=pending')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.every(post => post.status === 'pending')).toBe(true);
    });

    it('should reject request without admin token', async () => {
      const res = await request(app)
        .get('/api/admin/cms/moderation/forums');
      
      expect(res.statusCode).toBe(401);
    });
  });

  describe('PUT /api/admin/cms/moderation/forums/:id', () => {
    let testPost;

    beforeEach(async () => {
      testPost = await ForumPost.create({
        title: 'Test Post for Moderation',
        content: 'Test content',
        author: studentUser._id,
        course: course._id,
        category: 'discussion',
        status: 'pending'
      });
    });

    afterEach(async () => {
      await ForumPost.findByIdAndDelete(testPost._id);
      await AuditTrail.deleteMany({ resourceId: testPost._id });
    });

    it('should approve a forum post', async () => {
      const res = await request(app)
        .put(`/api/admin/cms/moderation/forums/${testPost._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ 
          status: 'approved',
          reason: 'Content is appropriate'
        });
      
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('approved');
      expect(res.body.data.moderatedBy.toString()).toBe(adminUser._id.toString());
      expect(res.body.data.moderatedAt).toBeDefined();

      // Verify audit trail was created
      const auditLog = await AuditTrail.findOne({ 
        resourceType: 'Forum',
        resourceId: testPost._id 
      });
      expect(auditLog).toBeDefined();
      expect(auditLog.action).toBe('moderate');
    });

    it('should reject a forum post', async () => {
      const res = await request(app)
        .put(`/api/admin/cms/moderation/forums/${testPost._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ 
          status: 'rejected',
          reason: 'Inappropriate content'
        });
      
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('rejected');
      expect(res.body.data.moderationReason).toBe('Inappropriate content');
    });

    it('should require valid status', async () => {
      const res = await request(app)
        .put(`/api/admin/cms/moderation/forums/${testPost._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ 
          status: 'invalid_status'
        });
      
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid status');
    });

    it('should require status field', async () => {
      const res = await request(app)
        .put(`/api/admin/cms/moderation/forums/${testPost._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ 
          reason: 'Some reason'
        });
      
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 404 for non-existent forum post', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/api/admin/cms/moderation/forums/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ 
          status: 'approved'
        });
      
      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('Forum post not found');
    });

    it('should sanitize input to prevent MongoDB injection', async () => {
      const res = await request(app)
        .put(`/api/admin/cms/moderation/forums/${testPost._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ 
          status: 'approved',
          reason: { $ne: null }  // Injection attempt
        });
      
      expect(res.statusCode).toBe(200);
      // Verify reason was sanitized (should be string representation)
      const updatedPost = await ForumPost.findById(testPost._id);
      expect(typeof updatedPost.moderationReason).toBe('string');
    });

    it('should reject request without admin authorization', async () => {
      const res = await request(app)
        .put(`/api/admin/cms/moderation/forums/${testPost._id}`)
        .send({ 
          status: 'approved'
        });
      
      expect(res.statusCode).toBe(401);
    });
  });

  describe('Moderation audit trail', () => {
    let testPost;

    beforeEach(async () => {
      testPost = await ForumPost.create({
        title: 'Audit Test Post',
        content: 'Test content for audit',
        author: studentUser._id,
        course: course._id,
        category: 'discussion',
        status: 'pending'
      });
    });

    afterEach(async () => {
      await ForumPost.findByIdAndDelete(testPost._id);
      await AuditTrail.deleteMany({ resourceId: testPost._id });
    });

    it('should create audit trail with IP address', async () => {
      await request(app)
        .put(`/api/admin/cms/moderation/forums/${testPost._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ 
          status: 'approved',
          reason: 'Test approval'
        });

      const auditLog = await AuditTrail.findOne({ 
        resourceType: 'Forum',
        resourceId: testPost._id 
      });

      expect(auditLog).toBeDefined();
      expect(auditLog.user.toString()).toBe(adminUser._id.toString());
      expect(auditLog.action).toBe('moderate');
      expect(auditLog.details).toContain('approved');
      expect(auditLog.ipAddress).toBeDefined();
    });

    it('should track multiple moderation actions', async () => {
      // First action - approve
      await request(app)
        .put(`/api/admin/cms/moderation/forums/${testPost._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'approved' });

      // Second action - reject
      await request(app)
        .put(`/api/admin/cms/moderation/forums/${testPost._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'rejected', reason: 'Changed decision' });

      const auditLogs = await AuditTrail.find({ 
        resourceType: 'Forum',
        resourceId: testPost._id 
      }).sort({ timestamp: 1 });

      expect(auditLogs.length).toBe(2);
      expect(auditLogs[0].details).toContain('approved');
      expect(auditLogs[1].details).toContain('rejected');
    });
  });
});
