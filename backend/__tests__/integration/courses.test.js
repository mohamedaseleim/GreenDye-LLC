const request = require('supertest');
const { app } = require('../../server');
const { createAuthenticatedUser } = require('../utils/testHelpers');
const Course = require('../../models/Course');

describe('Course API Endpoints', () => {
  let studentAuth, trainerAuth, adminAuth;

  beforeEach(async () => {
    studentAuth = await createAuthenticatedUser('student');
    trainerAuth = await createAuthenticatedUser('trainer');
    adminAuth = await createAuthenticatedUser('admin');
  });

  describe('GET /api/courses', () => {
    it('should get all published courses', async () => {
      await Course.create({
        title: { en: 'Course 1' },
        description: { en: 'Description 1' },
        instructor: trainerAuth.user._id,
        category: 'technology',
        isPublished: true,
        approvalStatus: 'approved'
      });

      await Course.create({
        title: { en: 'Course 2' },
        description: { en: 'Description 2' },
        instructor: trainerAuth.user._id,
        category: 'design',
        isPublished: true,
        approvalStatus: 'approved'
      });

      const response = await request(app)
        .get('/api/courses')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });

    it('should not return unpublished courses to students', async () => {
      await Course.create({
        title: { en: 'Published Course' },
        description: { en: 'Description' },
        instructor: trainerAuth.user._id,
        category: 'technology',
        isPublished: true,
        approvalStatus: 'approved'
      });

      await Course.create({
        title: { en: 'Unpublished Course' },
        description: { en: 'Description' },
        instructor: trainerAuth.user._id,
        category: 'technology',
        isPublished: false
      });

      const response = await request(app)
        .get('/api/courses')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].title.en).toBe('Published Course');
    });

    it('should filter courses by category', async () => {
      await Course.create({
        title: { en: 'Programming Course' },
        description: { en: 'Description' },
        instructor: trainerAuth.user._id,
        category: 'technology',
        isPublished: true,
        approvalStatus: 'approved'
      });

      await Course.create({
        title: { en: 'Design Course' },
        description: { en: 'Description' },
        instructor: trainerAuth.user._id,
        category: 'design',
        isPublished: true,
        approvalStatus: 'approved'
      });

      const response = await request(app)
        .get('/api/courses?category=programming')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].category).toBe('programming');
    });

    it('should not return published but unapproved courses', async () => {
      await Course.create({
        title: { en: 'Published Approved Course' },
        description: { en: 'Description' },
        instructor: trainerAuth.user._id,
        category: 'technology',
        isPublished: true,
        approvalStatus: 'approved'
      });

      await Course.create({
        title: { en: 'Published Pending Course' },
        description: { en: 'Description' },
        instructor: trainerAuth.user._id,
        category: 'technology',
        isPublished: true,
        approvalStatus: 'pending'
      });

      await Course.create({
        title: { en: 'Published Draft Course' },
        description: { en: 'Description' },
        instructor: trainerAuth.user._id,
        category: 'technology',
        isPublished: true,
        approvalStatus: 'draft'
      });

      const response = await request(app)
        .get('/api/courses')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].title.en).toBe('Published Approved Course');
    });
  });

  describe('GET /api/courses/:id', () => {
    it('should get a course by id', async () => {
      const course = await Course.create({
        title: { en: 'Test Course' },
        description: { en: 'Test Description' },
        instructor: trainerAuth.user._id,
        category: 'technology',
        isPublished: true
      });

      const response = await request(app)
        .get(`/api/courses/${course._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title.en).toBe('Test Course');
    });

    it('should return 404 for non-existent course', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .get(`/api/courses/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/courses', () => {
    it('should create a course as trainer', async () => {
      const courseData = {
        title: { en: 'New Course', ar: 'دورة جديدة', fr: 'Nouveau cours' },
        description: { en: 'Description', ar: 'وصف', fr: 'Description' },
        category: 'technology',
        level: 'beginner',
        price: 99.99,
        duration: 10,
        language: 'en'
      };

      const response = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${trainerAuth.token}`)
        .send(courseData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title.en).toBe(courseData.title.en);
      expect(response.body.data.instructor.toString()).toBe(trainerAuth.user._id.toString());
    });

    it('should fail to create course as student', async () => {
      const courseData = {
        title: { en: 'New Course' },
        description: { en: 'Description' },
        category: 'technology'
      };

      const response = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${studentAuth.token}`)
        .send(courseData)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should fail without authentication', async () => {
      const courseData = {
        title: { en: 'New Course' },
        description: { en: 'Description' },
        category: 'technology'
      };

      const response = await request(app)
        .post('/api/courses')
        .send(courseData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/courses/:id', () => {
    it('should update own course as trainer', async () => {
      const course = await Course.create({
        title: { en: 'Original Title' },
        description: { en: 'Description' },
        instructor: trainerAuth.user._id,
        category: 'technology',
        isPublished: true
      });

      const updates = {
        title: { en: 'Updated Title' }
      };

      const response = await request(app)
        .put(`/api/courses/${course._id}`)
        .set('Authorization', `Bearer ${trainerAuth.token}`)
        .send(updates)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title.en).toBe('Updated Title');
    });

    it('should not update another trainer\'s course', async () => {
      const otherTrainer = await createAuthenticatedUser('trainer');
      
      const course = await Course.create({
        title: { en: 'Original Title' },
        description: { en: 'Description' },
        instructor: otherTrainer.user._id,
        category: 'technology'
      });

      const updates = {
        title: { en: 'Updated Title' }
      };

      const response = await request(app)
        .put(`/api/courses/${course._id}`)
        .set('Authorization', `Bearer ${trainerAuth.token}`)
        .send(updates)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/courses/:id', () => {
    it('should delete own course as trainer', async () => {
      const course = await Course.create({
        title: { en: 'Test Course' },
        description: { en: 'Description' },
        instructor: trainerAuth.user._id,
        category: 'technology'
      });

      const response = await request(app)
        .delete(`/api/courses/${course._id}`)
        .set('Authorization', `Bearer ${trainerAuth.token}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      const deletedCourse = await Course.findById(course._id);
      expect(deletedCourse).toBeNull();
    });

    it('should delete any course as admin', async () => {
      const course = await Course.create({
        title: { en: 'Test Course' },
        description: { en: 'Description' },
        instructor: trainerAuth.user._id,
        category: 'technology'
      });

      const response = await request(app)
        .delete(`/api/courses/${course._id}`)
        .set('Authorization', `Bearer ${adminAuth.token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should not delete course as student', async () => {
      const course = await Course.create({
        title: { en: 'Test Course' },
        description: { en: 'Description' },
        instructor: trainerAuth.user._id,
        category: 'technology'
      });

      const response = await request(app)
        .delete(`/api/courses/${course._id}`)
        .set('Authorization', `Bearer ${studentAuth.token}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });
});
