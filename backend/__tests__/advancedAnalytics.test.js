const request = require('supertest');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { app } = require('../server');
const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Payment = require('../models/Payment');
const Analytics = require('../models/Analytics');

describe('Advanced Analytics API Tests', () => {
  let adminToken;
  let adminUser;
  let testUser;
  let testCourse;
  
  beforeAll(async () => {
    // Connect to test database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_TEST_URI || process.env.MONGODB_URI || process.env.MONGO_URI_TEST || process.env.MONGO_URI);
    }

    // Create admin user
    adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@test.com',
      password: 'password123',
      role: 'admin',
      country: 'USA'
    });

    // Generate admin token
    adminToken = jwt.sign({ id: adminUser._id, role: adminUser.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '1h' });

    // Create test user
    testUser = await User.create({
      name: 'Test Student',
      email: 'student@test.com',
      password: 'password123',
      role: 'student',
      country: 'USA'
    });

    // Create test course
    testCourse = await Course.create({
      title: 'Test Course',
      description: 'Test Description',
      instructor: adminUser._id,
      price: 99.99,
      level: 'beginner',
      language: 'en'
    });

    // Create test data
    await Enrollment.create({
      user: testUser._id,
      course: testCourse._id,
      status: 'active',
      progress: 50
    });

    await Payment.create({
      user: testUser._id,
      course: testCourse._id,
      amount: 99.99,
      currency: 'USD',
      paymentMethod: 'stripe',
      status: 'completed',
      metadata: {
        country: 'USA'
      }
    });

    await Analytics.create({
      user: testUser._id,
      course: testCourse._id,
      eventType: 'course_view',
      deviceType: 'desktop',
      browser: 'Chrome',
      os: 'Windows'
    });
  });

  afterAll(async () => {
    // Clean up test data
    await User.deleteMany({ email: { $in: ['admin@test.com', 'student@test.com'] } });
    await Course.deleteMany({ title: 'Test Course' });
    await Enrollment.deleteMany({ course: testCourse._id });
    await Payment.deleteMany({ course: testCourse._id });
    await Analytics.deleteMany({ user: testUser._id });
    
    // Close connection
    await mongoose.connection.close();
  });

  describe('GET /api/analytics/user-growth', () => {
    it('should require admin authentication', async () => {
      const response = await request(app)
        .get('/api/analytics/user-growth')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should return user growth data with monthly period', async () => {
      const response = await request(app)
        .get('/api/analytics/user-growth?period=monthly')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('period', 'monthly');
      expect(response.body.data).toHaveProperty('growth');
      expect(Array.isArray(response.body.data.growth)).toBe(true);
    });

    it('should support different time periods', async () => {
      const periods = ['hourly', 'daily', 'weekly', 'monthly'];
      
      for (const period of periods) {
        const response = await request(app)
          .get(`/api/analytics/user-growth?period=${period}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.period).toBe(period);
      }
    });

    it('should include cumulative growth data', async () => {
      const response = await request(app)
        .get('/api/analytics/user-growth?period=monthly')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      if (response.body.data.growth.length > 0) {
        expect(response.body.data.growth[0]).toHaveProperty('cumulative');
      }
    });
  });

  describe('GET /api/analytics/revenue-trends', () => {
    it('should require admin authentication', async () => {
      const response = await request(app)
        .get('/api/analytics/revenue-trends')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should return revenue trends data', async () => {
      const response = await request(app)
        .get('/api/analytics/revenue-trends?period=monthly')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('period', 'monthly');
      expect(response.body.data).toHaveProperty('trends');
      expect(Array.isArray(response.body.data.trends)).toBe(true);
    });

    it('should include revenue metrics', async () => {
      const response = await request(app)
        .get('/api/analytics/revenue-trends?period=monthly')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      if (response.body.data.trends.length > 0) {
        const trend = response.body.data.trends[0];
        expect(trend).toHaveProperty('revenue');
        expect(trend).toHaveProperty('transactions');
        expect(trend).toHaveProperty('avgTransactionValue');
        expect(trend).toHaveProperty('cumulativeRevenue');
      }
    });
  });

  describe('GET /api/analytics/course-popularity', () => {
    it('should require admin authentication', async () => {
      const response = await request(app)
        .get('/api/analytics/course-popularity')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should return course popularity metrics', async () => {
      const response = await request(app)
        .get('/api/analytics/course-popularity')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('courseMetrics');
      expect(response.body.data).toHaveProperty('enrollmentTrends');
      expect(Array.isArray(response.body.data.courseMetrics)).toBe(true);
    });

    it('should respect limit parameter', async () => {
      const response = await request(app)
        .get('/api/analytics/course-popularity?limit=5')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.data.courseMetrics.length).toBeLessThanOrEqual(5);
    });

    it('should include completion metrics', async () => {
      const response = await request(app)
        .get('/api/analytics/course-popularity')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      if (response.body.data.courseMetrics.length > 0) {
        const metric = response.body.data.courseMetrics[0];
        expect(metric).toHaveProperty('totalEnrollments');
        expect(metric).toHaveProperty('completedEnrollments');
        expect(metric).toHaveProperty('completionRate');
        expect(metric).toHaveProperty('avgProgress');
      }
    });
  });

  describe('GET /api/analytics/geographic-distribution', () => {
    it('should require admin authentication', async () => {
      const response = await request(app)
        .get('/api/analytics/geographic-distribution')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should return geographic distribution data', async () => {
      const response = await request(app)
        .get('/api/analytics/geographic-distribution')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('userDistribution');
      expect(response.body.data).toHaveProperty('revenueDistribution');
      expect(response.body.data).toHaveProperty('enrollmentDistribution');
      expect(Array.isArray(response.body.data.userDistribution)).toBe(true);
    });

    it('should include country-level metrics', async () => {
      const response = await request(app)
        .get('/api/analytics/geographic-distribution')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      if (response.body.data.userDistribution.length > 0) {
        const distribution = response.body.data.userDistribution[0];
        expect(distribution).toHaveProperty('_id'); // country
        expect(distribution).toHaveProperty('totalUsers');
      }
    });
  });

  describe('GET /api/analytics/peak-usage-times', () => {
    it('should require admin authentication', async () => {
      const response = await request(app)
        .get('/api/analytics/peak-usage-times')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should return peak usage times data', async () => {
      const response = await request(app)
        .get('/api/analytics/peak-usage-times')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('hourlyActivity');
      expect(response.body.data).toHaveProperty('dailyActivity');
      expect(response.body.data).toHaveProperty('eventTypeActivity');
    });

    it('should include hourly breakdown', async () => {
      const response = await request(app)
        .get('/api/analytics/peak-usage-times')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      if (response.body.data.hourlyActivity.length > 0) {
        const hourly = response.body.data.hourlyActivity[0];
        expect(hourly).toHaveProperty('hour');
        expect(hourly).toHaveProperty('totalEvents');
        expect(hourly).toHaveProperty('uniqueUsers');
      }
    });

    it('should include daily breakdown with day names', async () => {
      const response = await request(app)
        .get('/api/analytics/peak-usage-times')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      if (response.body.data.dailyActivity.length > 0) {
        const daily = response.body.data.dailyActivity[0];
        expect(daily).toHaveProperty('dayOfWeek');
        expect(daily).toHaveProperty('dayName');
        expect(daily).toHaveProperty('totalEvents');
      }
    });
  });

  describe('GET /api/analytics/conversion-funnel', () => {
    it('should require admin authentication', async () => {
      const response = await request(app)
        .get('/api/analytics/conversion-funnel')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should return conversion funnel data', async () => {
      const response = await request(app)
        .get('/api/analytics/conversion-funnel')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('funnel');
      expect(response.body.data).toHaveProperty('overallConversionRate');
      expect(Array.isArray(response.body.data.funnel)).toBe(true);
    });

    it('should have correct funnel stages', async () => {
      const response = await request(app)
        .get('/api/analytics/conversion-funnel')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const expectedStages = [
        'Visitors',
        'Signups',
        'Course Viewers',
        'Enrollments',
        'Active Learners',
        'Course Completers',
        'Certificate Earners'
      ];

      expect(response.body.data.funnel.length).toBe(expectedStages.length);
      
      response.body.data.funnel.forEach((stage, index) => {
        expect(stage.stage).toBe(expectedStages[index]);
        expect(stage).toHaveProperty('count');
        expect(stage).toHaveProperty('percentage');
        expect(stage).toHaveProperty('dropOff');
      });
    });

    it('should calculate conversion rates correctly', async () => {
      const response = await request(app)
        .get('/api/analytics/conversion-funnel')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // First stage should always be 100%
      expect(response.body.data.funnel[0].percentage).toBe(100);
      
      // All percentages should be between 0 and 100
      response.body.data.funnel.forEach(stage => {
        expect(parseFloat(stage.percentage)).toBeGreaterThanOrEqual(0);
        expect(parseFloat(stage.percentage)).toBeLessThanOrEqual(100);
      });
    });
  });

  describe('Date filtering', () => {
    it('should support date range filtering for user growth', async () => {
      const startDate = new Date('2023-01-01').toISOString();
      const endDate = new Date('2023-12-31').toISOString();

      const response = await request(app)
        .get(`/api/analytics/user-growth?startDate=${startDate}&endDate=${endDate}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should support date range filtering for revenue trends', async () => {
      const startDate = new Date('2023-01-01').toISOString();
      const endDate = new Date('2023-12-31').toISOString();

      const response = await request(app)
        .get(`/api/analytics/revenue-trends?startDate=${startDate}&endDate=${endDate}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('Error handling', () => {
    it('should handle invalid period parameter gracefully', async () => {
      const response = await request(app)
        .get('/api/analytics/user-growth?period=invalid')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // Should default to monthly
      expect(response.body.success).toBe(true);
    });

    it('should handle database errors gracefully', async () => {
      // This test would require mocking database errors
      // For now, verify that endpoints exist and are accessible
      const response = await request(app)
        .get('/api/analytics/user-growth')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success');
    });
  });
});
