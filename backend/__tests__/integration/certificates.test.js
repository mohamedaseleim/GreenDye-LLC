const request = require('supertest');
const { app } = require('../../server');
const User = require('../../models/User');
const Course = require('../../models/Course');
const Certificate = require('../../models/Certificate');
const Enrollment = require('../../models/Enrollment');

describe('Certificate API Endpoints', () => {
  let studentToken;
  let adminToken;
  let trainerId;
  let studentId;
  let courseId;
  let _enrollmentId;

  beforeEach(async () => {
    // Create a trainer/instructor user
    const trainer = await User.create({
      name: 'Trainer User',
      email: 'trainer@example.com',
      password: 'password123',
      role: 'trainer',
      language: 'en'
    });
    trainerId = trainer._id;

    // Create an admin user
    const _admin = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin',
      language: 'en'
    });

    // Create a student user
    const student = await User.create({
      name: 'Student User',
      email: 'student@example.com',
      password: 'password123',
      role: 'student',
      language: 'en'
    });
    studentId = student._id;

    // Get tokens
    const studentResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: 'student@example.com', password: 'password123' });
    studentToken = studentResponse.body.data.token;

    const adminResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@example.com', password: 'password123' });
    adminToken = adminResponse.body.data.token;

    // Create a course with Map structure for title
    const course = await Course.create({
      title: new Map([
        ['en', 'Test Course'],
        ['ar', 'دورة تجريبية'],
        ['fr', 'Cours de test']
      ]),
      description: new Map([
        ['en', 'Test description'],
        ['ar', 'وصف تجريبي'],
        ['fr', 'Description du test']
      ]),
      instructor: trainerId,
      category: 'technology',
      level: 'beginner',
      price: 100,
      duration: 10,
      language: 'en',
      isPublished: true
    });
    courseId = course._id;

    // Create a completed enrollment
    const enrollment = await Enrollment.create({
      user: studentId,
      course: courseId,
      status: 'completed',
      progress: 100
    });
    _enrollmentId = enrollment._id;
  });

  describe('POST /api/certificates/generate', () => {
    it('should generate a certificate for completed course (admin)', async () => {
      const response = await request(app)
        .post('/api/certificates/generate')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          userId: studentId,
          courseId: courseId,
          grade: 'A',
          score: 95
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('certificateId');
      expect(response.body.data).toHaveProperty('userName', 'Student User');
      expect(response.body.data).toHaveProperty('grade', 'A');
      expect(response.body.data).toHaveProperty('score', 95);
      expect(response.body.data).toHaveProperty('verificationUrl');
      expect(response.body.data).toHaveProperty('qrCode');

      // Verify courseName is properly stored as a Map
      const certificate = await Certificate.findById(response.body.data._id);
      expect(certificate.courseName).toBeInstanceOf(Map);
      expect(certificate.courseName.get('en')).toBe('Test Course');
    });

    it('should fail if enrollment is not completed', async () => {
      // Create a new student without completed enrollment
      const newStudent = await User.create({
        name: 'New Student',
        email: 'newstudent@example.com',
        password: 'password123',
        role: 'student',
        language: 'en'
      });

      const response = await request(app)
        .post('/api/certificates/generate')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          userId: newStudent._id,
          courseId: courseId,
          grade: 'A',
          score: 95
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not completed');
    });

    it('should fail if certificate already exists', async () => {
      // First generation
      await request(app)
        .post('/api/certificates/generate')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          userId: studentId,
          courseId: courseId,
          grade: 'A',
          score: 95
        })
        .expect(201);

      // Second generation should fail
      const response = await request(app)
        .post('/api/certificates/generate')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          userId: studentId,
          courseId: courseId,
          grade: 'A',
          score: 95
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });
  });

  describe('GET /api/certificates', () => {
    it('should get all certificates for current user', async () => {
      // Generate a certificate first
      await request(app)
        .post('/api/certificates/generate')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          userId: studentId,
          courseId: courseId,
          grade: 'A',
          score: 95
        });

      const response = await request(app)
        .get('/api/certificates')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(1);
      expect(response.body.data[0]).toHaveProperty('certificateId');
    });
  });

  describe('GET /api/certificates/:id', () => {
    it('should get a specific certificate', async () => {
      // Generate a certificate first
      const genResponse = await request(app)
        .post('/api/certificates/generate')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          userId: studentId,
          courseId: courseId,
          grade: 'A',
          score: 95
        });

      const certificateId = genResponse.body.data._id;

      const response = await request(app)
        .get(`/api/certificates/${certificateId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('_id', certificateId);
    });
  });

  describe('PUT /api/certificates/:id/revoke', () => {
    it('should revoke a certificate (admin only)', async () => {
      // Generate a certificate first
      const genResponse = await request(app)
        .post('/api/certificates/generate')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          userId: studentId,
          courseId: courseId,
          grade: 'A',
          score: 95
        });

      const certificateId = genResponse.body.data._id;

      const response = await request(app)
        .put(`/api/certificates/${certificateId}/revoke`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          reason: 'Test revocation'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.isRevoked).toBe(true);
      expect(response.body.data.isValid).toBe(false);
      expect(response.body.data.revokedReason).toBe('Test revocation');
    });
  });

  describe('GET /api/certificates/:id/download', () => {
    it('should download certificate as PDF', async () => {
      // Generate a certificate first
      const genResponse = await request(app)
        .post('/api/certificates/generate')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          userId: studentId,
          courseId: courseId,
          grade: 'A',
          score: 95
        });

      const certificateId = genResponse.body.data._id;

      const response = await request(app)
        .get(`/api/certificates/${certificateId}/download`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(response.headers['content-type']).toBe('application/pdf');
      expect(response.headers['content-disposition']).toContain('attachment');
    });

    it('should fail to download revoked certificate', async () => {
      // Generate and revoke a certificate
      const genResponse = await request(app)
        .post('/api/certificates/generate')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          userId: studentId,
          courseId: courseId,
          grade: 'A',
          score: 95
        });

      const certificateId = genResponse.body.data._id;

      await request(app)
        .put(`/api/certificates/${certificateId}/revoke`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ reason: 'Test' });

      const response = await request(app)
        .get(`/api/certificates/${certificateId}/download`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(410);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('revoked');
    });
  });
});
