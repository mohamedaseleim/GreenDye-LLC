const request = require('supertest');
const { app } = require('../../server');
const User = require('../../models/User');
const FailedLoginAttempt = require('../../models/FailedLoginAttempt');
const SecurityAlert = require('../../models/SecurityAlert');
const IPBlacklist = require('../../models/IPBlacklist');

describe('Admin Security API Endpoints', () => {
  let adminToken;
  let adminUser;

  beforeEach(async () => {
    // Create admin user
    adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin',
      isVerified: true,
      isActive: true
    });

    // Login to get token
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'password123'
      });

    adminToken = loginRes.body.data.token;
  });

  describe('GET /api/admin/security/dashboard', () => {
    it('should get security dashboard overview', async () => {
      const response = await request(app)
        .get('/api/admin/security/dashboard')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('overview');
      expect(response.body.data).toHaveProperty('recentActivities');
    });

    it('should fail without admin role', async () => {
      // Create student user
      await User.create({
        name: 'Student User',
        email: 'student@example.com',
        password: 'password123',
        role: 'student',
        isVerified: true,
        isActive: true
      });

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'student@example.com',
          password: 'password123'
        });

      const studentToken = loginRes.body.data.token;

      await request(app)
        .get('/api/admin/security/dashboard')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(403);
    });
  });

  describe('GET /api/admin/security/activity', () => {
    it('should get activity monitoring data', async () => {
      const response = await request(app)
        .get('/api/admin/security/activity')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('activities');
      expect(response.body.data).toHaveProperty('stats');
    });

    it('should filter activities by action type', async () => {
      const response = await request(app)
        .get('/api/admin/security/activity?actionType=login')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/admin/security/failed-logins', () => {
    beforeEach(async () => {
      // Create some failed login attempts
      await FailedLoginAttempt.create({
        email: 'test@example.com',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        reason: 'invalid_credentials'
      });
    });

    it('should get failed login attempts', async () => {
      const response = await request(app)
        .get('/api/admin/security/failed-logins')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('attempts');
      expect(response.body.data).toHaveProperty('topOffendingIPs');
    });

    it('should filter by IP address', async () => {
      const response = await request(app)
        .get('/api/admin/security/failed-logins?ipAddress=192.168.1.1')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/admin/security/alerts', () => {
    beforeEach(async () => {
      // Create a security alert
      await SecurityAlert.create({
        type: 'multiple_failed_logins',
        severity: 'high',
        ipAddress: '192.168.1.1',
        description: 'Test alert',
        status: 'open'
      });
    });

    it('should get security alerts', async () => {
      const response = await request(app)
        .get('/api/admin/security/alerts')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('alerts');
      expect(response.body.data.alerts.length).toBeGreaterThan(0);
    });

    it('should filter alerts by severity', async () => {
      const response = await request(app)
        .get('/api/admin/security/alerts?severity=high')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('PUT /api/admin/security/alerts/:id', () => {
    let alertId;

    beforeEach(async () => {
      const alert = await SecurityAlert.create({
        type: 'suspicious_ip',
        severity: 'medium',
        ipAddress: '192.168.1.2',
        description: 'Test alert',
        status: 'open'
      });
      alertId = alert._id;
    });

    it('should update security alert status', async () => {
      const response = await request(app)
        .put(`/api/admin/security/alerts/${alertId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'resolved',
          notes: 'False positive, legitimate user'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('resolved');
      expect(response.body.data.notes).toBe('False positive, legitimate user');
    });

    it('should fail with invalid alert ID', async () => {
      await request(app)
        .put('/api/admin/security/alerts/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'resolved' })
        .expect(404);
    });
  });

  describe('IP Blacklist Management', () => {
    describe('GET /api/admin/security/blacklist', () => {
      beforeEach(async () => {
        await IPBlacklist.create({
          ipAddress: '192.168.1.100',
          reason: 'manual_block',
          description: 'Test blacklist',
          addedBy: adminUser._id,
          isActive: true
        });
      });

      it('should get IP blacklist', async () => {
        const response = await request(app)
          .get('/api/admin/security/blacklist')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.length).toBeGreaterThan(0);
      });

      it('should filter by active status', async () => {
        const response = await request(app)
          .get('/api/admin/security/blacklist?isActive=true')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
      });
    });

    describe('POST /api/admin/security/blacklist', () => {
      it('should add IP to blacklist', async () => {
        const response = await request(app)
          .post('/api/admin/security/blacklist')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            ipAddress: '10.0.0.1',
            reason: 'manual_block',
            description: 'Suspicious activity detected'
          })
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.ipAddress).toBe('10.0.0.1');
        expect(response.body.data.isActive).toBe(true);
      });

      it('should fail without required fields', async () => {
        await request(app)
          .post('/api/admin/security/blacklist')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            ipAddress: '10.0.0.2'
          })
          .expect(400);
      });

      it('should fail with duplicate IP', async () => {
        const ipAddress = '10.0.0.3';
        
        await IPBlacklist.create({
          ipAddress,
          reason: 'manual_block',
          addedBy: adminUser._id,
          isActive: true
        });

        await request(app)
          .post('/api/admin/security/blacklist')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            ipAddress,
            reason: 'manual_block'
          })
          .expect(400);
      });
    });

    describe('DELETE /api/admin/security/blacklist/:id', () => {
      let blacklistId;

      beforeEach(async () => {
        const entry = await IPBlacklist.create({
          ipAddress: '192.168.1.200',
          reason: 'manual_block',
          addedBy: adminUser._id,
          isActive: true
        });
        blacklistId = entry._id;
      });

      it('should remove IP from blacklist', async () => {
        const response = await request(app)
          .delete(`/api/admin/security/blacklist/${blacklistId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.isActive).toBe(false);
      });

      it('should fail with invalid ID', async () => {
        await request(app)
          .delete('/api/admin/security/blacklist/507f1f77bcf86cd799439011')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(404);
      });
    });
  });

  describe('GET /api/admin/security/activity/stats', () => {
    it('should get activity statistics', async () => {
      const response = await request(app)
        .get('/api/admin/security/activity/stats')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('activityByType');
      expect(response.body.data).toHaveProperty('activityByStatus');
    });

    it('should get stats for different time periods', async () => {
      const response = await request(app)
        .get('/api/admin/security/activity/stats?period=7d')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.period).toBe('7d');
    });
  });
});
