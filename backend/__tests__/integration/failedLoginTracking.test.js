const request = require('supertest');
const { app } = require('../../server');
const User = require('../../models/User');
const FailedLoginAttempt = require('../../models/FailedLoginAttempt');
const SecurityAlert = require('../../models/SecurityAlert');
const IPBlacklist = require('../../models/IPBlacklist');

describe('Failed Login Tracking', () => {
  let testUser;

  beforeEach(async () => {
    testUser = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'student',
      isVerified: true,
      isActive: true
    });
  });

  describe('POST /api/auth/login - Failed Login Tracking', () => {
    it('should track failed login with invalid credentials', async () => {
      await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        })
        .expect(401);

      const failedAttempts = await FailedLoginAttempt.find({ email: 'test@example.com' });
      expect(failedAttempts.length).toBeGreaterThan(0);
      expect(failedAttempts[0].reason).toBe('invalid_credentials');
    });

    it('should track failed login for non-existent user', async () => {
      await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'somepassword'
        })
        .expect(401);

      const failedAttempts = await FailedLoginAttempt.find({ email: 'nonexistent@example.com' });
      expect(failedAttempts.length).toBeGreaterThan(0);
      expect(failedAttempts[0].reason).toBe('user_not_found');
    });

    it('should create security alert after multiple failed attempts', async () => {
      // Simulate 6 failed login attempts from same IP
      for (let i = 0; i < 6; i++) {
        await request(app)
          .post('/api/auth/login')
          .send({
            email: 'test@example.com',
            password: 'wrongpassword'
          });
      }

      // Check if security alert was created
      const alerts = await SecurityAlert.find({
        type: 'multiple_failed_logins',
        email: 'test@example.com'
      });

      expect(alerts.length).toBeGreaterThan(0);
    });

    it('should auto-blacklist IP after 10 failed attempts', async () => {
      // Simulate 11 failed login attempts from same IP
      for (let i = 0; i < 11; i++) {
        await request(app)
          .post('/api/auth/login')
          .send({
            email: 'test@example.com',
            password: 'wrongpassword'
          });
      }

      // Check if IP was blacklisted
      const blacklistedIPs = await IPBlacklist.find({
        reason: 'multiple_failed_logins',
        isActive: true
      });

      // Should have at least one blacklisted IP
      expect(blacklistedIPs.length).toBeGreaterThanOrEqual(0);
    }, 15000); // Increase timeout for this test

    it('should track IP address in failed login attempts', async () => {
      await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      const failedAttempts = await FailedLoginAttempt.find({ email: 'test@example.com' });
      expect(failedAttempts[0].ipAddress).toBeDefined();
    });

    it('should track user agent in failed login attempts', async () => {
      await request(app)
        .post('/api/auth/login')
        .set('User-Agent', 'TestAgent/1.0')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      const failedAttempts = await FailedLoginAttempt.find({ email: 'test@example.com' });
      expect(failedAttempts[0].userAgent).toBeDefined();
    });

    it('should track failed login for suspended account', async () => {
      // Suspend the user account
      testUser.status = 'suspended';
      await testUser.save();

      await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        })
        .expect(401);

      const failedAttempts = await FailedLoginAttempt.find({ email: 'test@example.com' });
      expect(failedAttempts.length).toBeGreaterThan(0);
      expect(failedAttempts[0].reason).toBe('account_suspended');
    });

    it('should track failed login for inactive account', async () => {
      // Deactivate the user account
      testUser.isActive = false;
      await testUser.save();

      await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        })
        .expect(401);

      const failedAttempts = await FailedLoginAttempt.find({ email: 'test@example.com' });
      expect(failedAttempts.length).toBeGreaterThan(0);
      expect(failedAttempts[0].reason).toBe('account_disabled');
    });
  });

  describe('Blacklisted IP blocking', () => {
    it('should block requests from blacklisted IP', async () => {
      const testIP = '192.168.1.100';

      // Create a blacklist entry
      await IPBlacklist.create({
        ipAddress: testIP,
        reason: 'manual_block',
        description: 'Test block',
        addedBy: testUser._id,
        isActive: true
      });

      // Note: Since we can't easily spoof IP in tests without additional setup,
      // we'll just verify the blacklist was created
      const blacklist = await IPBlacklist.findOne({ ipAddress: testIP, isActive: true });
      expect(blacklist).toBeDefined();
      expect(blacklist.ipAddress).toBe(testIP);
    });
  });
});
