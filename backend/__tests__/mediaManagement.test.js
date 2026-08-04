const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs').promises;
const User = require('../models/User');
const Media = require('../models/Media');
const AuditTrail = require('../models/AuditTrail');
const { getAllMedia, updateMedia, deleteMedia } = require('../controllers/adminCMSController');
const { uploadMedia } = require('../controllers/adminMediaController');

describe('Media Management Security Tests', () => {
  let adminUser;
  let testMediaId;

  beforeAll(async () => {
    // Connect to test database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/greendye-test', {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
    }

    // Create admin user
    adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@test.com',
      password: 'password123',
      role: 'admin'
    });
  });

  afterAll(async () => {
    // Cleanup
    await User.deleteMany({});
    await Media.deleteMany({});
    await AuditTrail.deleteMany({});
    await mongoose.connection.close();
  });

  describe('uploadMedia function', () => {
    beforeEach(async () => {
      await Media.deleteMany({});
    });

    it('should reject upload without files', async () => {
      const req = {
        files: [],
        user: { id: adminUser._id },
        body: {}
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      await uploadMedia(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'No files uploaded'
        })
      );
    });

    it('should handle file upload errors and cleanup', async () => {
      // Create a test file
      const uploadDir = path.join(__dirname, '..', 'uploads', 'test');
      await fs.mkdir(uploadDir, { recursive: true });
      const testFilePath = path.join(uploadDir, 'test-image.jpg');
      await fs.writeFile(testFilePath, 'fake image content');

      const req = {
        files: [{
          filename: 'test-image.jpg',
          originalname: 'test.jpg',
          mimetype: 'image/jpeg',
          size: 1024,
          path: testFilePath
        }],
        user: { id: adminUser._id },
        body: { category: 'test' },
        protocol: 'http',
        get: () => 'localhost:5000',
        ip: '127.0.0.1'
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      // Mock Media.create to fail
      const originalCreate = Media.create;
      Media.create = jest.fn().mockRejectedValue(new Error('Database error'));

      await uploadMedia(req, res, next);

      expect(next).toHaveBeenCalled();
      
      // Verify file was cleaned up
      const fileExists = await fs.access(testFilePath).then(() => true).catch(() => false);
      expect(fileExists).toBe(false);

      // Restore original function
      Media.create = originalCreate;

      // Cleanup
      await fs.rm(uploadDir, { recursive: true, force: true }).catch(() => {});
    });
  });

  describe('deleteMedia function', () => {
    beforeEach(async () => {
      // Create test media
      const media = await Media.create({
        filename: 'test-file.jpg',
        originalName: 'test.jpg',
        mimeType: 'image/jpeg',
        size: 1024,
        path: '/uploads/general/test-file.jpg',
        url: 'http://localhost:5000/uploads/general/test-file.jpg',
        type: 'image',
        category: 'general',
        uploadedBy: adminUser._id
      });
      testMediaId = media._id;
    });

    it('should delete media and create audit trail', async () => {
      const req = {
        params: { id: testMediaId },
        user: { id: adminUser._id },
        ip: '127.0.0.1'
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      await deleteMedia(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Media deleted successfully'
        })
      );

      // Verify media is deleted
      const media = await Media.findById(testMediaId);
      expect(media).toBeNull();

      // Verify audit trail created
      const auditLog = await AuditTrail.findOne({
        resourceType: 'Media',
        resourceId: testMediaId,
        action: 'delete'
      });
      expect(auditLog).toBeTruthy();
    });

    it('should prevent path traversal attacks', async () => {
      // Create media with malicious path
      const maliciousMedia = await Media.create({
        filename: 'test-file.jpg',
        originalName: 'test.jpg',
        mimeType: 'image/jpeg',
        size: 1024,
        path: '/../../../etc/passwd', // Path traversal attempt
        url: 'http://localhost:5000/uploads/general/test-file.jpg',
        type: 'image',
        category: 'general',
        uploadedBy: adminUser._id
      });

      const req = {
        params: { id: maliciousMedia._id },
        user: { id: adminUser._id },
        ip: '127.0.0.1'
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      await deleteMedia(req, res, next);

      // Should still succeed but not delete system files
      expect(res.status).toHaveBeenCalledWith(200);

      // Verify the malicious media record is deleted from DB
      const media = await Media.findById(maliciousMedia._id);
      expect(media).toBeNull();
    });

    it('should handle non-existent media gracefully', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const req = {
        params: { id: fakeId },
        user: { id: adminUser._id },
        ip: '127.0.0.1'
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      await deleteMedia(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Media not found'
        })
      );
    });
  });

  describe('getAllMedia function', () => {
    beforeEach(async () => {
      await Media.deleteMany({});
      
      // Create test media
      await Media.create([
        {
          filename: 'image1.jpg',
          originalName: 'image1.jpg',
          mimeType: 'image/jpeg',
          size: 1024,
          path: '/uploads/course/image1.jpg',
          url: 'http://localhost:5000/uploads/course/image1.jpg',
          type: 'image',
          category: 'course',
          uploadedBy: adminUser._id
        },
        {
          filename: 'video1.mp4',
          originalName: 'video1.mp4',
          mimeType: 'video/mp4',
          size: 2048,
          path: '/uploads/general/video1.mp4',
          url: 'http://localhost:5000/uploads/general/video1.mp4',
          type: 'video',
          category: 'general',
          uploadedBy: adminUser._id
        }
      ]);
    });

    it('should get all media with pagination', async () => {
      const req = {
        query: {}
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      await getAllMedia(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          total: 2
        })
      );
    });

    it('should filter media by type', async () => {
      const req = {
        query: { type: 'image' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      await getAllMedia(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      const responseData = res.json.mock.calls[0][0];
      expect(responseData.data.length).toBe(1);
      expect(responseData.data[0].type).toBe('image');
    });

    it('should filter media by category', async () => {
      const req = {
        query: { category: 'course' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      await getAllMedia(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      const responseData = res.json.mock.calls[0][0];
      expect(responseData.data.length).toBe(1);
      expect(responseData.data[0].category).toBe('course');
    });

    it('should search media by name', async () => {
      const req = {
        query: { search: 'video' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      await getAllMedia(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      const responseData = res.json.mock.calls[0][0];
      expect(responseData.data.length).toBeGreaterThan(0);
    });

    it('should prevent regex injection in search', async () => {
      // Attempt regex injection
      const req = {
        query: { search: '.*' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      await getAllMedia(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      // Search for ".*" literally, not as regex - should match nothing
      const responseData = res.json.mock.calls[0][0];
      expect(responseData.total).toBe(0);
    });
  });

  describe('updateMedia function', () => {
    let mediaId;

    beforeEach(async () => {
      const media = await Media.create({
        filename: 'test.jpg',
        originalName: 'test.jpg',
        mimeType: 'image/jpeg',
        size: 1024,
        path: '/uploads/general/test.jpg',
        url: 'http://localhost:5000/uploads/general/test.jpg',
        type: 'image',
        category: 'general',
        uploadedBy: adminUser._id
      });
      mediaId = media._id;
    });

    it('should update media metadata', async () => {
      const req = {
        params: { id: mediaId },
        body: {
          title: { en: 'Updated Title' },
          description: { en: 'Updated Description' },
          tags: ['test', 'updated']
        },
        user: { id: adminUser._id },
        ip: '127.0.0.1'
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      await updateMedia(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      const responseData = res.json.mock.calls[0][0];
      expect(responseData.data.title.get('en')).toBe('Updated Title');
      expect(responseData.data.tags).toContain('updated');
    });

    it('should create audit trail on update', async () => {
      const req = {
        params: { id: mediaId },
        body: { tags: ['updated'] },
        user: { id: adminUser._id },
        ip: '127.0.0.1'
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      await updateMedia(req, res, next);

      const auditLog = await AuditTrail.findOne({
        resourceType: 'Media',
        resourceId: mediaId,
        action: 'update'
      });

      expect(auditLog).toBeTruthy();
    });
  });
});
