const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../../server');
const User = require('../../models/User');
const Course = require('../../models/Course');
const Section = require('../../models/Section');
const Lesson = require('../../models/Lesson');

describe('Section Management', () => {
  let adminToken;
  let adminUser;
  let course;
  let section1;
  let section2;
  let lesson1;

  beforeAll(async () => {
    // Create admin user
    adminUser = await User.create({
      name: 'Admin User',
      email: 'section-admin@test.com',
      password: 'password123',
      role: 'admin',
    });

    // Login to get token
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'section-admin@test.com',
        password: 'password123',
      });

    adminToken = loginRes.body.token;

    // Create a test course
    course = await Course.create({
      title: { en: 'Test Course for Sections' },
      description: { en: 'Test Description' },
      instructor: adminUser._id,
      category: 'technology',
      level: 'beginner',
      duration: 10,
      price: 99,
    });
  });

  afterAll(async () => {
    await User.deleteMany({ email: 'section-admin@test.com' });
    await Course.deleteMany({ title: { en: 'Test Course for Sections' } });
    await Section.deleteMany({});
    await Lesson.deleteMany({});
    await mongoose.connection.close();
  });

  describe('POST /api/sections', () => {
    it('should create a new section', async () => {
      const sectionData = {
        course: course._id,
        title: { en: 'Introduction' },
        description: { en: 'Introduction to the course' },
        order: 0,
      };

      const res = await request(app)
        .post('/api/sections')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(sectionData);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title.en).toBe('Introduction');
      expect(res.body.data.order).toBe(0);

      section1 = res.body.data;
    });

    it('should create another section', async () => {
      const sectionData = {
        course: course._id,
        title: { en: 'Advanced Topics' },
        description: { en: 'Deep dive into advanced concepts' },
        order: 1,
      };

      const res = await request(app)
        .post('/api/sections')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(sectionData);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title.en).toBe('Advanced Topics');

      section2 = res.body.data;
    });
  });

  describe('GET /api/sections/course/:courseId', () => {
    it('should get all sections for a course', async () => {
      const res = await request(app)
        .get(`/api/sections/course/${course._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('GET /api/sections/:id', () => {
    it('should get a single section', async () => {
      const res = await request(app)
        .get(`/api/sections/${section1._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title.en).toBe('Introduction');
    });
  });

  describe('PUT /api/sections/:id', () => {
    it('should update a section', async () => {
      const updateData = {
        title: { en: 'Introduction Updated' },
        description: { en: 'Updated description' },
      };

      const res = await request(app)
        .put(`/api/sections/${section1._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title.en).toBe('Introduction Updated');
    });
  });

  describe('Section with Lessons', () => {
    it('should create a lesson and add it to a section', async () => {
      // First create a lesson
      const lessonData = {
        course: course._id,
        title: { en: 'Test Lesson' },
        description: { en: 'Test lesson description' },
        type: 'video',
        order: 0,
        duration: 30,
      };

      const lessonRes = await request(app)
        .post('/api/lessons')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(lessonData);

      expect(lessonRes.statusCode).toBe(201);
      lesson1 = lessonRes.body.data;

      // Add lesson to section
      const addRes = await request(app)
        .put(`/api/sections/${section1._id}/lessons/${lesson1._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(addRes.statusCode).toBe(200);
      expect(addRes.body.success).toBe(true);
    });

    it('should get section with lessons', async () => {
      const res = await request(app)
        .get(`/api/sections/${section1._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.lessons.length).toBeGreaterThan(0);
    });
  });

  describe('PUT /api/sections/reorder', () => {
    it('should reorder sections', async () => {
      const reorderData = {
        courseId: course._id,
        sections: [
          { _id: section2._id, order: 0 },
          { _id: section1._id, order: 1 },
        ],
      };

      const res = await request(app)
        .put('/api/sections/reorder')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(reorderData);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('DELETE /api/sections/:id', () => {
    it('should delete a section', async () => {
      const res = await request(app)
        .delete(`/api/sections/${section2._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 404 for deleted section', async () => {
      const res = await request(app)
        .get(`/api/sections/${section2._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(404);
    });
  });
});
