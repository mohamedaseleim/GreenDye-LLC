const request = require('supertest');
const { app } = require('../../server');
const User = require('../../models/User');
const Course = require('../../models/Course');
const Certificate = require('../../models/Certificate');

describe('Admin Certificate API Endpoints', () => {
  let adminToken;
  let studentId;
  let courseId;
  let trainerId;

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

    // Get admin token
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
  });

  describe('POST /api/admin/certificates', () => {
    it('should create a certificate manually with all new fields (admin)', async () => {
      const response = await request(app)
        .post('/api/admin/certificates')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          userId: studentId,
          courseId: courseId,
          traineeName: 'Test Trainee',
          courseTitle: 'Advanced Testing Course',
          certificateLevel: 'Professional',
          grade: 'A+',
          score: 98,
          tutorName: 'Dr. Test Tutor',
          scheme: 'Test Scheme',
          heldOn: '2024-01-15',
          duration: 40,
          heldIn: 'New York, USA',
          issuedBy: 'GreenDye Academy',
          issueDate: '2024-01-20',
          expiryDate: '2025-01-20'
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('certificateId');
      expect(response.body.data).toHaveProperty('traineeName', 'Test Trainee');
      expect(response.body.data).toHaveProperty('courseTitle', 'Advanced Testing Course');
      expect(response.body.data).toHaveProperty('certificateLevel', 'Professional');
      expect(response.body.data).toHaveProperty('grade', 'A+');
      expect(response.body.data).toHaveProperty('score', 98);
      expect(response.body.data).toHaveProperty('verificationUrl');
      expect(response.body.data).toHaveProperty('qrCode');

      // Verify metadata fields
      const certificate = await Certificate.findById(response.body.data._id);
      expect(certificate.metadata.instructor).toBe('Dr. Test Tutor');
      expect(certificate.metadata.scheme).toBe('Test Scheme');
      expect(certificate.metadata.duration).toBe(40);
      expect(certificate.metadata.heldIn).toBe('New York, USA');
      expect(certificate.metadata.issuedBy).toBe('GreenDye Academy');
    });

    it('should create a certificate with minimal fields (userId and courseId optional)', async () => {
      const response = await request(app)
        .post('/api/admin/certificates')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          traineeName: 'Manual Trainee',
          courseTitle: 'Manual Course'
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('certificateId');
      expect(response.body.data).toHaveProperty('traineeName', 'Manual Trainee');
      expect(response.body.data).toHaveProperty('courseTitle', 'Manual Course');
    });

    it('should create a certificate with backward compatibility fields', async () => {
      const response = await request(app)
        .post('/api/admin/certificates')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          userId: studentId,
          courseId: courseId,
          grade: 'A+',
          score: 98
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('certificateId');
      expect(response.body.data).toHaveProperty('userName', 'Student User');
      expect(response.body.data).toHaveProperty('grade', 'A+');
      expect(response.body.data).toHaveProperty('score', 98);
      expect(response.body.data).toHaveProperty('verificationUrl');
      expect(response.body.data).toHaveProperty('qrCode');

      // Verify courseName is properly stored as a Map
      const certificate = await Certificate.findById(response.body.data._id);
      expect(certificate.courseName).toBeInstanceOf(Map);
      expect(certificate.courseName.get('en')).toBe('Test Course');
    });

    it('should fail to create duplicate certificate only when both userId and courseId are provided', async () => {
      // First creation with userId and courseId
      await request(app)
        .post('/api/admin/certificates')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          userId: studentId,
          courseId: courseId,
          grade: 'A',
          score: 95
        })
        .expect(201);

      // Second creation with same userId and courseId should fail
      const response = await request(app)
        .post('/api/admin/certificates')
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

      // But creating with only manual fields should succeed
      const manualResponse = await request(app)
        .post('/api/admin/certificates')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          traineeName: 'Another Trainee',
          courseTitle: 'Another Course'
        })
        .expect(201);

      expect(manualResponse.body.success).toBe(true);
    });
  });

  describe('GET /api/admin/certificates', () => {
    it('should get all certificates with filters', async () => {
      // Create a couple of certificates
      await request(app)
        .post('/api/admin/certificates')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          userId: studentId,
          courseId: courseId,
          grade: 'A',
          score: 95
        });

      const response = await request(app)
        .get('/api/admin/certificates')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBeGreaterThan(0);
      expect(response.body.data[0]).toHaveProperty('certificateId');
    });

    it('should show newly created certificate in list immediately', async () => {
      // Get count of certificates before creation
      const beforeResponse = await request(app)
        .get('/api/admin/certificates?page=1&limit=20')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const beforeCount = beforeResponse.body.total;

      // Create a new certificate
      const createResponse = await request(app)
        .post('/api/admin/certificates')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          userId: studentId,
          courseId: courseId,
          traineeName: 'New Test Trainee',
          courseTitle: 'New Test Course',
          grade: 'A',
          score: 95
        })
        .expect(201);

      const newCertificateId = createResponse.body.data.certificateId;

      // Immediately fetch the first page (where new certificates should appear)
      const afterResponse = await request(app)
        .get('/api/admin/certificates?page=1&limit=20')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(afterResponse.body.success).toBe(true);
      expect(afterResponse.body.total).toBe(beforeCount + 1);
      
      // Verify the new certificate appears in the first page
      // (certificates are sorted by issueDate desc, so newest should be first)
      const firstCertificate = afterResponse.body.data[0];
      expect(firstCertificate.certificateId).toBe(newCertificateId);
      expect(firstCertificate.traineeName).toBe('New Test Trainee');
      expect(firstCertificate.courseTitle).toBe('New Test Course');
    });

    it('should filter certificates by validity', async () => {
      // Create and revoke a certificate
      const createResponse = await request(app)
        .post('/api/admin/certificates')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          userId: studentId,
          courseId: courseId,
          grade: 'A',
          score: 95
        });

      const certificateId = createResponse.body.data._id;

      await request(app)
        .put(`/api/admin/certificates/${certificateId}/revoke`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ reason: 'Test' });

      // Filter for revoked certificates
      const response = await request(app)
        .get('/api/admin/certificates?isRevoked=true')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.every(cert => cert.isRevoked)).toBe(true);
    });
  });

  describe('PUT /api/admin/certificates/:id', () => {
    it('should update certificate details with new fields', async () => {
      // Create a certificate
      const createResponse = await request(app)
        .post('/api/admin/certificates')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          userId: studentId,
          courseId: courseId,
          grade: 'A',
          score: 95
        });

      const certificateId = createResponse.body.data._id;

      // Update it with new fields
      const response = await request(app)
        .put(`/api/admin/certificates/${certificateId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          traineeName: 'Updated Trainee Name',
          courseTitle: 'Updated Course Title',
          certificateLevel: 'Advanced',
          grade: 'A+',
          score: 98,
          tutorName: 'Updated Tutor',
          scheme: 'Updated Scheme',
          duration: 50,
          issuedBy: 'Updated Academy'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.traineeName).toBe('Updated Trainee Name');
      expect(response.body.data.courseTitle).toBe('Updated Course Title');
      expect(response.body.data.certificateLevel).toBe('Advanced');
      expect(response.body.data.grade).toBe('A+');
      expect(response.body.data.score).toBe(98);
      
      // Verify metadata fields
      const certificate = await Certificate.findById(certificateId);
      expect(certificate.metadata.instructor).toBe('Updated Tutor');
      expect(certificate.metadata.scheme).toBe('Updated Scheme');
      expect(certificate.metadata.duration).toBe(50);
      expect(certificate.metadata.issuedBy).toBe('Updated Academy');
    });
  });

  describe('POST /api/admin/certificates/bulk', () => {
    it('should bulk upload certificates', async () => {
      // Create another student
      const _student2 = await User.create({
        name: 'Student Two',
        email: 'student2@example.com',
        password: 'password123',
        role: 'student',
        language: 'en'
      });

      const response = await request(app)
        .post('/api/admin/certificates/bulk')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          certificates: [
            {
              userEmail: 'student@example.com',
              courseId: courseId,
              grade: 'A',
              score: 95
            },
            {
              userEmail: 'student2@example.com',
              courseId: courseId,
              grade: 'B+',
              score: 85
            }
          ]
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.success.length).toBe(2);
      expect(response.body.data.failed.length).toBe(0);

      // Verify courseName is properly stored as a Map for bulk certificates
      const certificates = await Certificate.find({ course: courseId });
      certificates.forEach(cert => {
        expect(cert.courseName).toBeInstanceOf(Map);
        expect(cert.courseName.get('en')).toBe('Test Course');
      });
    });

    it('should handle partial failures in bulk upload', async () => {
      const response = await request(app)
        .post('/api/admin/certificates/bulk')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          certificates: [
            {
              userEmail: 'student@example.com',
              courseId: courseId,
              grade: 'A',
              score: 95
            },
            {
              userEmail: 'nonexistent@example.com', // This will fail
              courseId: courseId,
              grade: 'B+',
              score: 85
            }
          ]
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.success.length).toBe(1);
      expect(response.body.data.failed.length).toBe(1);
      expect(response.body.data.failed[0].error).toContain('not found');
    });
  });

  describe('GET /api/admin/certificates/export', () => {
    it('should export certificates as JSON', async () => {
      // Create a certificate
      await request(app)
        .post('/api/admin/certificates')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          userId: studentId,
          courseId: courseId,
          grade: 'A',
          score: 95
        });

      const response = await request(app)
        .get('/api/admin/certificates/export?format=json')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBeGreaterThan(0);
      expect(response.body.data[0]).toHaveProperty('certificateId');
      expect(response.body.data[0]).toHaveProperty('userName');
      expect(response.body.data[0]).toHaveProperty('courseName');
    });

    it('should export certificates as CSV', async () => {
      // Create a certificate
      await request(app)
        .post('/api/admin/certificates')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          userId: studentId,
          courseId: courseId,
          grade: 'A',
          score: 95
        });

      const response = await request(app)
        .get('/api/admin/certificates/export?format=csv')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.headers['content-type']).toBe('text/csv; charset=utf-8');
      expect(response.headers['content-disposition']).toContain('attachment');
      expect(response.text).toContain('certificateId');
      expect(response.text).toContain('userName');
    });
  });

  describe('PUT /api/admin/certificates/:id/revoke', () => {
    it('should revoke a certificate', async () => {
      // Create a certificate
      const createResponse = await request(app)
        .post('/api/admin/certificates')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          userId: studentId,
          courseId: courseId,
          grade: 'A',
          score: 95
        });

      const certificateId = createResponse.body.data._id;

      const response = await request(app)
        .put(`/api/admin/certificates/${certificateId}/revoke`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          reason: 'Policy violation'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.isRevoked).toBe(true);
      expect(response.body.data.isValid).toBe(false);
      expect(response.body.data.revokedReason).toBe('Policy violation');
    });
  });

  describe('PUT /api/admin/certificates/:id/restore', () => {
    it('should restore a revoked certificate', async () => {
      // Create and revoke a certificate
      const createResponse = await request(app)
        .post('/api/admin/certificates')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          userId: studentId,
          courseId: courseId,
          grade: 'A',
          score: 95
        });

      const certificateId = createResponse.body.data._id;

      await request(app)
        .put(`/api/admin/certificates/${certificateId}/revoke`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ reason: 'Test' });

      // Restore it
      const response = await request(app)
        .put(`/api/admin/certificates/${certificateId}/restore`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.isRevoked).toBe(false);
      expect(response.body.data.isValid).toBe(true);
    });
  });

  describe('POST /api/admin/certificates/:id/regenerate', () => {
    it('should regenerate certificate verification token', async () => {
      // Create a certificate
      const createResponse = await request(app)
        .post('/api/admin/certificates')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          userId: studentId,
          courseId: courseId,
          grade: 'A',
          score: 95
        });

      const certificateId = createResponse.body.data._id;
      const oldToken = createResponse.body.data.verificationToken;
      const oldUrl = createResponse.body.data.verificationUrl;

      const response = await request(app)
        .post(`/api/admin/certificates/${certificateId}/regenerate`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.verificationToken).not.toBe(oldToken);
      expect(response.body.data.verificationUrl).not.toBe(oldUrl);
      expect(response.body.data.qrCode).toBeDefined();
    });
  });

  describe('DELETE /api/admin/certificates/:id', () => {
    it('should delete a certificate', async () => {
      // Create a certificate
      const createResponse = await request(app)
        .post('/api/admin/certificates')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          userId: studentId,
          courseId: courseId,
          grade: 'A',
          score: 95
        });

      const certificateId = createResponse.body.data._id;

      const response = await request(app)
        .delete(`/api/admin/certificates/${certificateId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify it's deleted
      const certificate = await Certificate.findById(certificateId);
      expect(certificate).toBeNull();
    });
  });
});
