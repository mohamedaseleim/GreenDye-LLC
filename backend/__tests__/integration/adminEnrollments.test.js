const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../../server');
const User = require('../../models/User');
const Course = require('../../models/Course');
const Enrollment = require('../../models/Enrollment');

describe('Admin Enrollment Management', () => {
  let adminToken;
  let adminUser;
  let studentUser1;
  let studentUser2;
  let course1;
  let course2;
  let enrollment1;

  beforeAll(async () => {
    // Create admin user
    adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@enrolltest.com',
      password: 'password123',
      role: 'admin'
    });
    
    // Get admin token by login
    const adminLoginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@enrolltest.com', password: 'password123' });
    adminToken = adminLoginRes.body.data.token;

    // Create student users
    studentUser1 = await User.create({
      name: 'Student One',
      email: 'student1@enrolltest.com',
      password: 'password123',
      role: 'student'
    });

    studentUser2 = await User.create({
      name: 'Student Two',
      email: 'student2@enrolltest.com',
      password: 'password123',
      role: 'student'
    });

    // Create courses
    course1 = await Course.create({
      title: 'Test Course 1',
      description: 'Test Description 1',
      instructor: adminUser._id,
      price: { USD: 100, EUR: 90, EGP: 1500 },
      category: 'technology',
      duration: 10
    });

    course2 = await Course.create({
      title: 'Test Course 2',
      description: 'Test Description 2',
      instructor: adminUser._id,
      price: { USD: 150, EUR: 130, EGP: 2000 },
      category: 'business',
      duration: 15
    });

    // Create an enrollment for testing
    enrollment1 = await Enrollment.create({
      user: studentUser1._id,
      course: course1._id,
      status: 'active',
      progress: 50
    });
  });

  afterAll(async () => {
    // Clean up test data
    await User.deleteMany({ email: { $regex: /@enrolltest\.com$/ } });
    await Course.deleteMany({ title: { $regex: /^Test Course/ } });
    await Enrollment.deleteMany({ user: { $in: [studentUser1._id, studentUser2._id] } });
    await mongoose.connection.close();
  });

  describe('GET /api/admin/enrollments', () => {
    it('should get all enrollments with pagination', async () => {
      const res = await request(app)
        .get('/api/admin/enrollments')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ page: 1, limit: 10 });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.totalCount).toBeDefined();
      expect(res.body.currentPage).toBe(1);
    });

    it('should filter enrollments by status', async () => {
      const res = await request(app)
        .get('/api/admin/enrollments')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ status: 'active' });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      if (res.body.data.length > 0) {
        expect(res.body.data[0].status).toBe('active');
      }
    });

    it('should filter enrollments by course', async () => {
      const res = await request(app)
        .get('/api/admin/enrollments')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ courseId: course1._id.toString() });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should deny access to non-admin users', async () => {
      // Login as student
      const studentLoginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'student1@enrolltest.com', password: 'password123' });
      const studentToken = studentLoginRes.body.data.token;

      const res = await request(app)
        .get('/api/admin/enrollments')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.statusCode).toBe(403);
    });
  });

  describe('GET /api/admin/enrollments/analytics', () => {
    it('should get enrollment analytics', async () => {
      const res = await request(app)
        .get('/api/admin/enrollments/analytics')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('totalEnrollments');
      expect(res.body.data).toHaveProperty('activeEnrollments');
      expect(res.body.data).toHaveProperty('completedEnrollments');
      expect(res.body.data).toHaveProperty('completionRate');
      expect(res.body.data).toHaveProperty('enrollmentsByStatus');
    });

    it('should filter analytics by date range', async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      
      const res = await request(app)
        .get('/api/admin/enrollments/analytics')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ startDate: startDate.toISOString() });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('POST /api/admin/enrollments', () => {
    it('should manually enroll a user in a course', async () => {
      const res = await request(app)
        .post('/api/admin/enrollments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          userId: studentUser2._id.toString(),
          courseId: course2._id.toString(),
          status: 'active',
          notes: 'Admin manual enrollment for testing'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user._id).toBe(studentUser2._id.toString());
      expect(res.body.data.course._id).toBe(course2._id.toString());
    });

    it('should not enroll if user already enrolled', async () => {
      const res = await request(app)
        .post('/api/admin/enrollments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          userId: studentUser1._id.toString(),
          courseId: course1._id.toString()
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('already enrolled');
    });

    it('should return 404 for non-existent user', async () => {
      const fakeUserId = new mongoose.Types.ObjectId();
      
      const res = await request(app)
        .post('/api/admin/enrollments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          userId: fakeUserId.toString(),
          courseId: course1._id.toString()
        });

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toContain('User not found');
    });

    it('should return 404 for non-existent course', async () => {
      const fakeCourseId = new mongoose.Types.ObjectId();
      
      const res = await request(app)
        .post('/api/admin/enrollments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          userId: studentUser1._id.toString(),
          courseId: fakeCourseId.toString()
        });

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toContain('Course not found');
    });
  });

  describe('GET /api/admin/enrollments/:id', () => {
    it('should get enrollment details', async () => {
      const res = await request(app)
        .get(`/api/admin/enrollments/${enrollment1._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.enrollment).toBeDefined();
      expect(res.body.data.enrollment._id).toBe(enrollment1._id.toString());
    });

    it('should return 404 for non-existent enrollment', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      const res = await request(app)
        .get(`/api/admin/enrollments/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(404);
    });
  });

  describe('PUT /api/admin/enrollments/:id/status', () => {
    it('should update enrollment status', async () => {
      const res = await request(app)
        .put(`/api/admin/enrollments/${enrollment1._id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'suspended' });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('suspended');
    });

    it('should reject invalid status', async () => {
      const res = await request(app)
        .put(`/api/admin/enrollments/${enrollment1._id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'invalid_status' });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('DELETE /api/admin/enrollments/:id', () => {
    it('should manually unenroll a user', async () => {
      // Create a test enrollment without payment
      const testEnrollment = await Enrollment.create({
        user: studentUser1._id,
        course: course2._id,
        status: 'active'
      });

      const res = await request(app)
        .delete(`/api/admin/enrollments/${testEnrollment._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ reason: 'Testing unenrollment' });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('unenrolled successfully');

      // Verify enrollment is deleted
      const deletedEnrollment = await Enrollment.findById(testEnrollment._id);
      expect(deletedEnrollment).toBeNull();
    });

    it('should return 404 for non-existent enrollment', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      const res = await request(app)
        .delete(`/api/admin/enrollments/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(404);
    });
  });
});
