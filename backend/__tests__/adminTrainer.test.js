const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../server');
const User = require('../models/User');
const Trainer = require('../models/Trainer');
const TrainerPayout = require('../models/TrainerPayout');

describe('Admin Trainer Management API Tests', () => {
  let adminToken;
  let testTrainer;
  let testUser;

  beforeAll(async () => {
    // Connect to test database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_TEST_URI || process.env.MONGODB_URI || process.env.MONGO_URI_TEST || process.env.MONGO_URI);
    }

    // Create admin user
    await User.create({
      name: 'Admin User',
      email: 'admin@test.com',
      password: 'password123',
      role: 'admin'
    });

    // Login as admin
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@test.com',
        password: 'password123'
      });

    adminToken = loginResponse.body.token;

    // Create a test user for trainer
    testUser = await User.create({
      name: 'Test Trainer',
      email: 'trainer@test.com',
      password: 'password123',
      role: 'student'
    });

    // Create a test trainer
    testTrainer = await Trainer.create({
      user: testUser._id,
      fullName: testUser.name,
      expertise: ['JavaScript', 'React'],
      applicationStatus: 'pending',
      commissionRate: 20
    });
  });

  afterAll(async () => {
    // Clean up test data
    await User.deleteMany({ email: { $in: ['admin@test.com', 'trainer@test.com'] } });
    await Trainer.deleteMany({ user: testUser._id });
    await TrainerPayout.deleteMany({});
    await mongoose.connection.close();
  });

  describe('GET /api/admin/trainers', () => {
    it('should get all trainers with admin token', async () => {
      const response = await request(app)
        .get('/api/admin/trainers')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should deny access without admin role', async () => {
      const response = await request(app)
        .get('/api/admin/trainers')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should filter trainers by application status', async () => {
      const response = await request(app)
        .get('/api/admin/trainers?applicationStatus=pending')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      if (response.body.data.length > 0) {
        expect(response.body.data[0].applicationStatus).toBe('pending');
      }
    });
  });

  describe('GET /api/admin/trainers/:id', () => {
    it('should get a single trainer by ID', async () => {
      const response = await request(app)
        .get(`/api/admin/trainers/${testTrainer._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(testTrainer._id.toString());
      expect(response.body.data.fullName).toBe(testUser.name);
    });

    it('should return 404 for non-existent trainer', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/admin/trainers/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/admin/trainers/:id/approve', () => {
    it('should approve a pending trainer application', async () => {
      const response = await request(app)
        .put(`/api/admin/trainers/${testTrainer._id}/approve`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ notes: 'Approved for good qualifications' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.applicationStatus).toBe('approved');
      expect(response.body.data.isVerified).toBe(true);

      // Verify user role was updated
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.role).toBe('trainer');
    });
  });

  describe('PUT /api/admin/trainers/:id/reject', () => {
    it('should reject a trainer application', async () => {
      // First reset the trainer to pending
      await Trainer.findByIdAndUpdate(testTrainer._id, {
        applicationStatus: 'pending',
        isVerified: false
      });

      const response = await request(app)
        .put(`/api/admin/trainers/${testTrainer._id}/reject`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ notes: 'Insufficient qualifications' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.applicationStatus).toBe('rejected');
      expect(response.body.data.isVerified).toBe(false);
    });
  });

  describe('GET /api/admin/trainers/applications/pending', () => {
    it('should get all pending applications', async () => {
      // Reset trainer to pending
      await Trainer.findByIdAndUpdate(testTrainer._id, {
        applicationStatus: 'pending'
      });

      const response = await request(app)
        .get('/api/admin/trainers/applications/pending')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('PUT /api/admin/trainers/:id/verification', () => {
    it('should update verification status', async () => {
      const response = await request(app)
        .put(`/api/admin/trainers/${testTrainer._id}/verification`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isVerified: true, notes: 'Manual verification completed' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.isVerified).toBe(true);
    });
  });

  describe('GET /api/admin/trainers/:id/metrics', () => {
    it('should get trainer performance metrics', async () => {
      const response = await request(app)
        .get(`/api/admin/trainers/${testTrainer._id}/metrics`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('trainer');
      expect(response.body.data).toHaveProperty('courses');
      expect(response.body.data).toHaveProperty('students');
      expect(response.body.data).toHaveProperty('revenue');
      expect(response.body.data).toHaveProperty('performance');
    });
  });

  describe('POST /api/admin/trainers/:id/payouts', () => {
    it('should create a payout for trainer', async () => {
      // First set some pending payout balance
      await Trainer.findByIdAndUpdate(testTrainer._id, {
        pendingPayout: 100
      });

      const response = await request(app)
        .post(`/api/admin/trainers/${testTrainer._id}/payouts`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          amount: 50,
          payoutMethod: 'bank_transfer',
          notes: 'Test payout'
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.amount).toBe(50);
      expect(response.body.data.status).toBe('completed');

      // Verify trainer balances were updated
      const updatedTrainer = await Trainer.findById(testTrainer._id);
      expect(updatedTrainer.pendingPayout).toBe(50);
      expect(updatedTrainer.totalPaidOut).toBe(50);
    });

    it('should not allow payout exceeding pending balance', async () => {
      const response = await request(app)
        .post(`/api/admin/trainers/${testTrainer._id}/payouts`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          amount: 1000,
          payoutMethod: 'bank_transfer'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/admin/trainers/:id/payouts', () => {
    it('should get trainer payout history', async () => {
      const response = await request(app)
        .get(`/api/admin/trainers/${testTrainer._id}/payouts`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('PUT /api/admin/trainers/:id', () => {
    it('should update trainer profile', async () => {
      const response = await request(app)
        .put(`/api/admin/trainers/${testTrainer._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          commissionRate: 25,
          expertise: ['JavaScript', 'React', 'Node.js']
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.commissionRate).toBe(25);
      expect(response.body.data.expertise).toContain('Node.js');
    });
  });

  describe('DELETE /api/admin/trainers/:id', () => {
    it('should delete a trainer profile', async () => {
      const response = await request(app)
        .delete(`/api/admin/trainers/${testTrainer._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify trainer was deleted
      const deletedTrainer = await Trainer.findById(testTrainer._id);
      expect(deletedTrainer).toBeNull();
    });
  });
});
