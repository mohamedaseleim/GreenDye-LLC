const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../../server');
const User = require('../../models/User');
const Course = require('../../models/Course');
const Enrollment = require('../../models/Enrollment');
const Review = require('../../models/Review');

describe('Admin Review Moderation', () => {
  let adminToken;
  let adminUser;
  let studentUser;
  let course;
  let enrollment;
  let review;

  beforeAll(async () => {
    // Create admin user
    adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@reviewtest.com',
      password: 'password123',
      role: 'admin'
    });
    
    // Get admin token by login
    const adminLoginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@reviewtest.com', password: 'password123' });
    adminToken = adminLoginRes.body.data.token;

    // Create student user
    studentUser = await User.create({
      name: 'Student User',
      email: 'student@reviewtest.com',
      password: 'password123',
      role: 'student'
    });

    // Create course
    course = await Course.create({
      title: { en: 'Test Course', ar: 'دورة تجريبية' },
      description: { en: 'Test Description', ar: 'وصف تجريبي' },
      category: 'technology',
      level: 'beginner',
      duration: 10,
      instructor: adminUser._id,
      price: 99.99
    });

    // Create enrollment
    enrollment = await Enrollment.create({
      user: studentUser._id,
      course: course._id,
      status: 'active'
    });

    // Create review
    review = await Review.create({
      enrollment: enrollment._id,
      user: studentUser._id,
      course: course._id,
      rating: 4,
      reviewText: 'Great course!',
      status: 'pending'
    });
  });

  afterAll(async () => {
    // Clean up test data
    await User.deleteMany({ email: { $regex: '@reviewtest.com' } });
    await Course.deleteMany({ 'title.en': 'Test Course' });
    await Enrollment.deleteMany({});
    await Review.deleteMany({});
    await mongoose.connection.close();
  });

  describe('GET /api/admin/reviews', () => {
    it('should get all reviews with admin token', async () => {
      const res = await request(app)
        .get('/api/admin/reviews')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should filter reviews by status', async () => {
      const res = await request(app)
        .get('/api/admin/reviews?status=pending')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.every(r => r.status === 'pending')).toBe(true);
    });

    it('should reject request without admin token', async () => {
      const res = await request(app)
        .get('/api/admin/reviews');
      
      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/admin/reviews/:id', () => {
    it('should get review details with admin token', async () => {
      const res = await request(app)
        .get(`/api/admin/reviews/${review._id}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data._id.toString()).toBe(review._id.toString());
    });

    it('should return 404 for non-existent review', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/api/admin/reviews/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.statusCode).toBe(404);
    });
  });

  describe('PUT /api/admin/reviews/:id/approve', () => {
    it('should approve a review', async () => {
      const res = await request(app)
        .put(`/api/admin/reviews/${review._id}/approve`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ reason: 'Approved by admin' });
      
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('approved');
      expect(res.body.data.isVisible).toBe(true);

      // Verify moderation history
      const updatedReview = await Review.findById(review._id);
      expect(updatedReview.moderationHistory.length).toBeGreaterThan(0);
      expect(updatedReview.moderationHistory[0].action).toBe('approved');
    });
  });

  describe('PUT /api/admin/reviews/:id/reject', () => {
    let rejectReview;

    beforeEach(async () => {
      rejectReview = await Review.create({
        enrollment: enrollment._id,
        user: studentUser._id,
        course: course._id,
        rating: 3,
        reviewText: 'Test review for rejection',
        status: 'pending'
      });
    });

    afterEach(async () => {
      await Review.findByIdAndDelete(rejectReview._id);
    });

    it('should reject a review with reason', async () => {
      const res = await request(app)
        .put(`/api/admin/reviews/${rejectReview._id}/reject`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ reason: 'Inappropriate content' });
      
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('rejected');
      expect(res.body.data.isVisible).toBe(false);
    });

    it('should require reason for rejection', async () => {
      const res = await request(app)
        .put(`/api/admin/reviews/${rejectReview._id}/reject`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});
      
      expect(res.statusCode).toBe(400);
    });
  });

  describe('PUT /api/admin/reviews/:id/flag', () => {
    let flagReview;

    beforeEach(async () => {
      flagReview = await Review.create({
        enrollment: enrollment._id,
        user: studentUser._id,
        course: course._id,
        rating: 1,
        reviewText: 'Test review for flagging',
        status: 'pending'
      });
    });

    afterEach(async () => {
      await Review.findByIdAndDelete(flagReview._id);
    });

    it('should flag a review with valid reason', async () => {
      const res = await request(app)
        .put(`/api/admin/reviews/${flagReview._id}/flag`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ 
          reason: 'spam',
          description: 'This looks like spam'
        });
      
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('flagged');
      expect(res.body.data.flags.length).toBeGreaterThan(0);
    });

    it('should require flag reason', async () => {
      const res = await request(app)
        .put(`/api/admin/reviews/${flagReview._id}/flag`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});
      
      expect(res.statusCode).toBe(400);
    });

    it('should validate flag reason', async () => {
      const res = await request(app)
        .put(`/api/admin/reviews/${flagReview._id}/flag`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ reason: 'invalid_reason' });
      
      expect(res.statusCode).toBe(400);
    });
  });

  describe('DELETE /api/admin/reviews/:id', () => {
    let deleteReview;

    beforeEach(async () => {
      deleteReview = await Review.create({
        enrollment: enrollment._id,
        user: studentUser._id,
        course: course._id,
        rating: 2,
        reviewText: 'Test review for deletion',
        status: 'pending'
      });
    });

    it('should remove a review', async () => {
      const res = await request(app)
        .delete(`/api/admin/reviews/${deleteReview._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ reason: 'Inappropriate content' });
      
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify review is deleted
      const deletedReview = await Review.findById(deleteReview._id);
      expect(deletedReview).toBeNull();
    });
  });

  describe('PUT /api/admin/reviews/:id/respond', () => {
    it('should add admin response to review', async () => {
      const res = await request(app)
        .put(`/api/admin/reviews/${review._id}/respond`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ response: 'Thank you for your feedback!' });
      
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.adminResponse).toBeDefined();
      expect(res.body.data.adminResponse.text).toBe('Thank you for your feedback!');
    });

    it('should require response text', async () => {
      const res = await request(app)
        .put(`/api/admin/reviews/${review._id}/respond`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ response: '' });
      
      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /api/admin/reviews/analytics/stats', () => {
    it('should get review statistics', async () => {
      const res = await request(app)
        .get('/api/admin/reviews/analytics/stats')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('totalReviews');
      expect(res.body.data).toHaveProperty('reviewsByStatus');
      expect(res.body.data).toHaveProperty('avgRating');
      expect(res.body.data).toHaveProperty('flaggedCount');
      expect(res.body.data).toHaveProperty('pendingCount');
    });

    it('should filter stats by course', async () => {
      const res = await request(app)
        .get(`/api/admin/reviews/analytics/stats?courseId=${course._id}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
