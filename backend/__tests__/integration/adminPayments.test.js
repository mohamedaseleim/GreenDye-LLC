const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../../server');
const User = require('../../models/User');
const Payment = require('../../models/Payment');
const Course = require('../../models/Course');
const RefundRequest = require('../../models/RefundRequest');

describe('Admin Payment Management', () => {
  let adminToken;
  let adminUser;
  let studentUser;
  let course;
  let _payment1;
  let _payment2;

  beforeAll(async () => {
    // Create admin user
    adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@test.com',
      password: 'password123',
      role: 'admin'
    });
    
    // Get admin token by login
    const adminLoginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.com', password: 'password123' });
    adminToken = adminLoginRes.body.data.token;

    // Create student user
    studentUser = await User.create({
      name: 'Student User',
      email: 'student@test.com',
      password: 'password123',
      role: 'student'
    });

    // Create course
    course = await Course.create({
      title: 'Test Course',
      description: 'Test Description',
      instructor: adminUser._id,
      price: { USD: 100, EUR: 90, EGP: 1500 },
      category: 'technology',
      duration: 10
    });

    // Create completed payment
    _payment1 = await Payment.create({
      user: studentUser._id,
      course: course._id,
      amount: 100,
      currency: 'USD',
      paymentMethod: 'stripe',
      status: 'completed',
      transactionId: 'test_txn_001',
      completedAt: new Date()
    });

    // Create pending payment
    _payment2 = await Payment.create({
      user: studentUser._id,
      course: course._id,
      amount: 90,
      currency: 'EUR',
      paymentMethod: 'paypal',
      status: 'pending'
    });
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Payment.deleteMany({});
    await Course.deleteMany({});
    await RefundRequest.deleteMany({});
    await mongoose.connection.close();
  });

  describe('GET /api/admin/payments', () => {
    it('should get all transactions for admin', async () => {
      const res = await request(app)
        .get('/api/admin/payments')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.total).toBeGreaterThanOrEqual(2);
    });

    it('should filter transactions by status', async () => {
      const res = await request(app)
        .get('/api/admin/payments?status=completed')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      res.body.data.forEach(payment => {
        expect(payment.status).toBe('completed');
      });
    });

    it('should filter transactions by payment method', async () => {
      const res = await request(app)
        .get('/api/admin/payments?paymentMethod=stripe')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      res.body.data.forEach(payment => {
        expect(payment.paymentMethod).toBe('stripe');
      });
    });

    it('should paginate transactions', async () => {
      const res = await request(app)
        .get('/api/admin/payments?page=1&limit=1')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(1);
      expect(res.body.page).toBe(1);
    });

    it('should require admin authorization', async () => {
      const studentLoginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'student@test.com', password: 'password123' });
      const studentToken = studentLoginRes.body.data.token;
      
      const res = await request(app)
        .get('/api/admin/payments')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/admin/payments/stats', () => {
    it('should get payment statistics', async () => {
      const res = await request(app)
        .get('/api/admin/payments/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('payments');
      expect(res.body.data).toHaveProperty('revenue');
      expect(res.body.data).toHaveProperty('refunds');
      expect(res.body.data.payments).toHaveProperty('total');
      expect(res.body.data.payments).toHaveProperty('completed');
      expect(res.body.data.payments).toHaveProperty('pending');
    });
  });

  describe('GET /api/admin/payments/analytics/revenue', () => {
    it('should get revenue analytics', async () => {
      const res = await request(app)
        .get('/api/admin/payments/analytics/revenue')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('overall');
      expect(res.body.data).toHaveProperty('revenueByCurrency');
      expect(res.body.data).toHaveProperty('revenueOverTime');
      expect(res.body.data).toHaveProperty('revenueByMethod');
      expect(res.body.data).toHaveProperty('topCourses');
      expect(res.body.data).toHaveProperty('refunds');
    });

    it('should accept date range filters', async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      const endDate = new Date();

      const res = await request(app)
        .get(`/api/admin/payments/analytics/revenue?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should support different groupBy options', async () => {
      const res = await request(app)
        .get('/api/admin/payments/analytics/revenue?groupBy=day')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/admin/payments/gateway-config', () => {
    it('should get payment gateway configuration status', async () => {
      const res = await request(app)
        .get('/api/admin/payments/gateway-config')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('stripe');
      expect(res.body.data).toHaveProperty('paypal');
      expect(res.body.data).toHaveProperty('fawry');
      expect(res.body.data).toHaveProperty('paymob');
      
      // Each gateway should have enabled and configured properties
      Object.values(res.body.data).forEach(gateway => {
        expect(gateway).toHaveProperty('enabled');
        expect(gateway).toHaveProperty('configured');
      });
    });
  });

  describe('GET /api/admin/payments/export', () => {
    it('should export transactions as JSON', async () => {
      const res = await request(app)
        .get('/api/admin/payments/export')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
    });

    it('should export transactions as CSV', async () => {
      const res = await request(app)
        .get('/api/admin/payments/export?format=csv')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('text/csv');
    });

    it('should filter exported transactions by date', async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);

      const res = await request(app)
        .get(`/api/admin/payments/export?startDate=${startDate.toISOString()}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
    });
  });
});
