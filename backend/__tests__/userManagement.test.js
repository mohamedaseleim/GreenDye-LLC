const request = require('supertest');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { app } = require('../server');
const User = require('../models/User');
const AuditTrail = require('../models/AuditTrail');
const { createAuthenticatedUser } = require('./utils/testHelpers');

describe('User Management API Tests', () => {
  let adminToken;
  let _adminUser;
  let testUser;
  let testUserToken;

  beforeEach(async () => {
    // Create admin user with token
    const adminAuth = await createAuthenticatedUser('admin');
    _adminUser = adminAuth.user;
    adminToken = adminAuth.token;

    // Create test user with token
    const testAuth = await createAuthenticatedUser('student');
    testUser = testAuth.user;
    testUserToken = testAuth.token;
  });

  describe('GET /api/users', () => {
    it('should get all users with pagination', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('page');
      expect(response.body).toHaveProperty('pages');
    });

    it('should filter users by role', async () => {
      const response = await request(app)
        .get('/api/users?role=student')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.forEach(user => {
        expect(user.role).toBe('student');
      });
    });

    it('should search users by name or email', async () => {
      const response = await request(app)
        .get('/api/users?search=Test')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should deny access to non-admin users', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${testUserToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should return all users when isActive filter is empty string', async () => {
      const response = await request(app)
        .get('/api/users?isActive=')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      // Should return both active and inactive users (at least 2 from setup)
      expect(response.body.data.length).toBeGreaterThanOrEqual(2);
    });

    it('should filter users by isActive when value is provided', async () => {
      const response = await request(app)
        .get('/api/users?isActive=true')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.forEach(user => {
        expect(user.isActive).toBe(true);
      });
    });
  });

  describe('PUT /api/users/:id/suspend', () => {
    it('should suspend a user', async () => {
      const response = await request(app)
        .put(`/api/users/${testUser._id}/suspend`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ reason: 'Policy violation' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('suspended');
      expect(response.body.data.isActive).toBe(false);

      // Verify audit trail was created
      const auditLog = await AuditTrail.findOne({
        action: 'SUSPEND_USER',
        targetId: testUser._id
      });
      expect(auditLog).toBeTruthy();
      expect(auditLog.metadata.reason).toBe('Policy violation');
    });

    it('should return 404 for non-existent user', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .put(`/api/users/${fakeId}/suspend`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ reason: 'Test' })
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/users/:id/activate', () => {
    it('should activate a suspended user', async () => {
      // First suspend the user
      await User.findByIdAndUpdate(testUser._id, {
        status: 'suspended',
        isActive: false
      });

      const response = await request(app)
        .put(`/api/users/${testUser._id}/activate`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('active');
      expect(response.body.data.isActive).toBe(true);

      // Verify audit trail was created
      const auditLog = await AuditTrail.findOne({
        action: 'ACTIVATE_USER',
        targetId: testUser._id
      });
      expect(auditLog).toBeTruthy();
    });
  });

  describe('GET /api/users/:id/activity', () => {
    it('should get user activity logs', async () => {
      // Create some activity logs
      await AuditTrail.create({
        user: testUser._id,
        action: 'LOGIN',
        details: 'User logged in',
        ipAddress: '127.0.0.1'
      });

      const response = await request(app)
        .get(`/api/users/${testUser._id}/activity`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body).toHaveProperty('total');
    });

    it('should paginate activity logs', async () => {
      const response = await request(app)
        .get(`/api/users/${testUser._id}/activity?page=1&limit=5`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.page).toBe(1);
      expect(response.body.data.length).toBeLessThanOrEqual(5);
    });
  });

  describe('POST /api/users/:id/reset-password', () => {
    it('should reset user password', async () => {
      const newPassword = 'newpassword123';
      const response = await request(app)
        .post(`/api/users/${testUser._id}/reset-password`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ newPassword })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('reset');

      // Verify audit trail was created
      const auditLog = await AuditTrail.findOne({
        action: 'RESET_PASSWORD',
        targetId: testUser._id
      });
      expect(auditLog).toBeTruthy();

      // Verify password was changed (by checking we can't use old password)
      const updatedUser = await User.findById(testUser._id).select('+password');
      const isMatch = await updatedUser.comparePassword('password123');
      expect(isMatch).toBe(false);
    });

    it('should reject password less than 6 characters', async () => {
      const response = await request(app)
        .post(`/api/users/${testUser._id}/reset-password`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ newPassword: '12345' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('6 characters');
    });
  });

  describe('POST /api/users/bulk-update', () => {
    let user1, user2;

    beforeEach(async () => {
      user1 = await User.create({
        name: 'Bulk User 1',
        email: `bulk1-${Date.now()}@test.com`,
        password: 'password123',
        role: 'student'
      });
      user2 = await User.create({
        name: 'Bulk User 2',
        email: `bulk2-${Date.now()}@test.com`,
        password: 'password123',
        role: 'student'
      });
    });

    it('should bulk update multiple users', async () => {
      const response = await request(app)
        .post('/api/users/bulk-update')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          userIds: [user1._id, user2._id],
          updates: { status: 'inactive' }
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.modifiedCount).toBe(2);

      // Verify users were updated
      const updatedUser1 = await User.findById(user1._id);
      const updatedUser2 = await User.findById(user2._id);
      expect(updatedUser1.status).toBe('inactive');
      expect(updatedUser2.status).toBe('inactive');

      // Verify audit trail
      const auditLog = await AuditTrail.findOne({
        action: 'BULK_UPDATE_USERS'
      });
      expect(auditLog).toBeTruthy();
    });

    it('should reject bulk update without user IDs', async () => {
      const response = await request(app)
        .post('/api/users/bulk-update')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          updates: { status: 'inactive' }
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should not allow updating sensitive fields', async () => {
      await request(app)
        .post('/api/users/bulk-update')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          userIds: [user1._id],
          updates: { 
            password: 'hacked',
            email: 'hacked@test.com'
          }
        })
        .expect(200);

      // Verify sensitive fields were not updated
      const user = await User.findById(user1._id).select('+password');
      expect(user.email).not.toBe('hacked@test.com');
    });
  });

  describe('POST /api/users/bulk-delete', () => {
    let user1, user2, adminUser2;

    beforeEach(async () => {
      user1 = await User.create({
        name: 'Delete User 1',
        email: `delete1-${Date.now()}@test.com`,
        password: 'password123',
        role: 'student'
      });
      user2 = await User.create({
        name: 'Delete User 2',
        email: `delete2-${Date.now()}@test.com`,
        password: 'password123',
        role: 'student'
      });
      adminUser2 = await User.create({
        name: 'Admin User 2',
        email: `admin2-${Date.now()}@test.com`,
        password: 'password123',
        role: 'admin'
      });
    });

    it('should bulk delete multiple users', async () => {
      const response = await request(app)
        .post('/api/users/bulk-delete')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          userIds: [user1._id, user2._id]
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.deletedCount).toBe(2);

      // Verify users were deleted
      const deletedUser1 = await User.findById(user1._id);
      const deletedUser2 = await User.findById(user2._id);
      expect(deletedUser1).toBeNull();
      expect(deletedUser2).toBeNull();

      // Verify audit trail
      const auditLog = await AuditTrail.findOne({
        action: 'BULK_DELETE_USERS'
      });
      expect(auditLog).toBeTruthy();
    });

    it('should prevent deleting admin users in bulk', async () => {
      const response = await request(app)
        .post('/api/users/bulk-delete')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          userIds: [adminUser2._id]
        })
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('admin');

      // Verify admin user was not deleted
      const stillExists = await User.findById(adminUser2._id);
      expect(stillExists).toBeTruthy();
    });

    it('should reject bulk delete without user IDs', async () => {
      const response = await request(app)
        .post('/api/users/bulk-delete')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/users/:id', () => {
    it('should update user details', async () => {
      const response = await request(app)
        .put(`/api/users/${testUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Updated Name',
          role: 'trainer'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Updated Name');
      expect(response.body.data.role).toBe('trainer');
    });

    it('should not allow password update via updateUser endpoint', async () => {
      const originalUser = await User.findById(testUser._id).select('+password');
      const originalPassword = originalUser.password;

      await request(app)
        .put(`/api/users/${testUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          password: 'newpassword123',
          name: 'Updated Name'
        })
        .expect(200);

      // Verify password was NOT changed
      const updatedUser = await User.findById(testUser._id).select('+password');
      expect(updatedUser.password).toBe(originalPassword);
      
      // Verify other fields were updated
      expect(updatedUser.name).toBe('Updated Name');
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should delete a user and create audit log', async () => {
      const userToDelete = await User.create({
        name: 'Delete Me',
        email: 'deleteme@test.com',
        password: 'password123',
        role: 'student'
      });

      const response = await request(app)
        .delete(`/api/users/${userToDelete._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify user was deleted
      const deleted = await User.findById(userToDelete._id);
      expect(deleted).toBeNull();

      // Verify audit trail
      const auditLog = await AuditTrail.findOne({
        action: 'DELETE_USER',
        targetId: userToDelete._id
      });
      expect(auditLog).toBeTruthy();
    });
  });

  describe('Security Tests', () => {
    it('should prevent unauthorized access to user management endpoints', async () => {
      // No token
      await request(app)
        .get('/api/users')
        .expect(401);

      // Student token
      const studentToken = jwt.sign({ id: testUser._id, role: testUser.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '1h' });
      await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(403);
    });

    it('should sanitize input to prevent NoSQL injection', async () => {
      const maliciousInput = {
        role: { $ne: null },
        status: { $gt: '' }
      };

      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .query(maliciousInput)
        .expect(200);

      // Should not crash and should return valid results
      expect(response.body.success).toBe(true);
    });
  });
});
