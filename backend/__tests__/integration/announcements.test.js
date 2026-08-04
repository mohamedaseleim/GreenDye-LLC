const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../../server');
const Announcement = require('../../models/Announcement');
const User = require('../../models/User');

describe('Public Announcement API', () => {
  let testUser;

  beforeAll(async () => {
    // Create a test user
    testUser = await User.create({
      name: 'Test User',
      email: 'testuser@example.com',
      password: 'password123',
      role: 'admin'
    });

    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const pastDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Create an active announcement
    await Announcement.create({
      title: {
        en: 'Active Announcement',
        ar: 'إعلان نشط',
        fr: 'Annonce active'
      },
      content: {
        en: 'This is an active announcement',
        ar: 'هذا إعلان نشط',
        fr: 'Ceci est une annonce active'
      },
      type: 'info',
      priority: 'high',
      targetAudience: ['all'],
      status: 'active',
      startDate: yesterday,
      endDate: tomorrow,
      author: testUser._id,
      dismissible: true
    });

    // Create a draft announcement (should not be returned)
    await Announcement.create({
      title: {
        en: 'Draft Announcement'
      },
      content: {
        en: 'This is a draft announcement'
      },
      type: 'info',
      priority: 'medium',
      targetAudience: ['all'],
      status: 'draft',
      startDate: yesterday,
      author: testUser._id
    });

    // Create an expired announcement (should not be returned)
    await Announcement.create({
      title: {
        en: 'Expired Announcement'
      },
      content: {
        en: 'This is an expired announcement'
      },
      type: 'info',
      priority: 'low',
      targetAudience: ['all'],
      status: 'active',
      startDate: pastDate,
      endDate: yesterday,
      author: testUser._id
    });
  });

  afterAll(async () => {
    // Clean up test data
    await Announcement.deleteMany({});
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  describe('GET /api/announcements/active', () => {
    it('should return only active announcements within date range', async () => {
      const res = await request(app)
        .get('/api/announcements/active')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.count).toBe(1);
      expect(res.body.data[0].title.en).toBe('Active Announcement');
      expect(res.body.data[0].status).toBe('active');
    });

    it('should not return draft announcements', async () => {
      const res = await request(app)
        .get('/api/announcements/active')
        .expect(200);

      const draftFound = res.body.data.some(
        announcement => announcement.title.en === 'Draft Announcement'
      );
      expect(draftFound).toBe(false);
    });

    it('should not return expired announcements', async () => {
      const res = await request(app)
        .get('/api/announcements/active')
        .expect(200);

      const expiredFound = res.body.data.some(
        announcement => announcement.title.en === 'Expired Announcement'
      );
      expect(expiredFound).toBe(false);
    });

    it('should sort announcements by priority and startDate', async () => {
      const now = new Date();
      // Create another active announcement with different priority
      const lowPriorityAnnouncement = await Announcement.create({
        title: {
          en: 'Low Priority Announcement'
        },
        content: {
          en: 'This is a low priority announcement'
        },
        type: 'info',
        priority: 'low',
        targetAudience: ['all'],
        status: 'active',
        startDate: new Date(now.getTime() - 1000),
        author: testUser._id,
        endDate: new Date(now.getTime() + 24 * 60 * 60 * 1000)
      });

      const res = await request(app)
        .get('/api/announcements/active')
        .expect(200);

      expect(res.body.count).toBe(2);
      // High priority should come first
      expect(res.body.data[0].priority).toBe('high');
      expect(res.body.data[1].priority).toBe('low');

      // Clean up
      await lowPriorityAnnouncement.deleteOne();
    });
  });
});
