const request = require('supertest');
const { app } = require('../server');
const ContentSettings = require('../models/ContentSettings');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

describe('Content Settings API', () => {
  let adminToken;
  let adminUser;

  beforeEach(async () => {
    // Create an admin user and get token
    adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@test.com',
      password: 'Password123!',
      role: 'admin',
      isActive: true,
    });

    adminToken = jwt.sign(
      { id: adminUser._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );
  });

  describe('GET /api/admin/content-settings/public', () => {
    it('should return default content settings when none exist', async () => {
      const res = await request(app).get('/api/admin/content-settings/public');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.homePage).toBeDefined();
      expect(res.body.data.aboutPage).toBeDefined();
      expect(res.body.data.contactPage).toBeDefined();
      expect(res.body.data.socialMedia).toBeDefined();
    });

    it('should return existing content settings', async () => {
      // Create settings first
      await ContentSettings.create({
        homePage: {
          heroTitle: {
            en: 'Custom Title',
            ar: 'عنوان مخصص',
            fr: 'Titre personnalisé',
          },
          heroSubtitle: {
            en: 'Custom Subtitle',
            ar: 'عنوان فرعي مخصص',
            fr: 'Sous-titre personnalisé',
          },
          features: [
            { icon: 'School', title: 'Test Feature', description: 'Test Description' },
          ],
        },
      });

      const res = await request(app).get('/api/admin/content-settings/public');

      expect(res.statusCode).toBe(200);
      expect(res.body.data.homePage.heroTitle.en).toBe('Custom Title');
    });
  });

  describe('GET /api/admin/content-settings', () => {
    it('should require authentication', async () => {
      const res = await request(app).get('/api/admin/content-settings');

      expect(res.statusCode).toBe(401);
    });

    it('should require admin role', async () => {
      // Create a student user
      const student = await User.create({
        name: 'Student User',
        email: 'student@test.com',
        password: 'Password123!',
        role: 'student',
        isActive: true,
      });

      const studentToken = jwt.sign(
        { id: student._id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
      );

      const res = await request(app)
        .get('/api/admin/content-settings')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.statusCode).toBe(403);
    });

    it('should return content settings for admin', async () => {
      const res = await request(app)
        .get('/api/admin/content-settings')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });
  });

  describe('PUT /api/admin/content-settings/home', () => {
    it('should update home page content', async () => {
      const updateData = {
        heroTitle: {
          en: 'Updated Title',
          ar: 'عنوان محدث',
          fr: 'Titre mis à jour',
        },
        heroSubtitle: {
          en: 'Updated Subtitle',
          ar: 'عنوان فرعي محدث',
          fr: 'Sous-titre mis à jour',
        },
        features: [
          { icon: 'School', title: 'New Feature', description: 'New Description' },
        ],
      };

      const res = await request(app)
        .put('/api/admin/content-settings/home')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.heroTitle.en).toBe('Updated Title');
      expect(res.body.data.features).toHaveLength(1);
      expect(res.body.data.features[0].title).toBe('New Feature');
    });
  });

  describe('PUT /api/admin/content-settings/about', () => {
    it('should update about page content', async () => {
      const updateData = {
        mission: {
          en: 'Updated Mission',
          ar: 'مهمة محدثة',
          fr: 'Mission mise à jour',
        },
        vision: {
          en: 'Updated Vision',
          ar: 'رؤية محدثة',
          fr: 'Vision mise à jour',
        },
        features: [
          { icon: 'Verified', title: 'About Feature', description: 'About Description' },
        ],
      };

      const res = await request(app)
        .put('/api/admin/content-settings/about')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.mission.en).toBe('Updated Mission');
      expect(res.body.data.vision.en).toBe('Updated Vision');
    });
  });

  describe('PUT /api/admin/content-settings/contact', () => {
    it('should update contact page content', async () => {
      const updateData = {
        email: 'contact@test.com',
        phone: '+1234567890',
        address: 'Test Address',
        officeHours: {
          en: 'Mon-Fri: 9-5',
          ar: 'الإثنين-الجمعة: 9-5',
          fr: 'Lun-Ven: 9-17',
        },
        socialMedia: {
          facebook: 'https://facebook.com/test',
          twitter: 'https://twitter.com/test',
          linkedin: 'https://linkedin.com/test',
          instagram: 'https://instagram.com/test',
          youtube: 'https://youtube.com/test',
        },
      };

      const res = await request(app)
        .put('/api/admin/content-settings/contact')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.contactPage.email).toBe('contact@test.com');
      expect(res.body.data.socialMedia.facebook).toBe('https://facebook.com/test');
    });
  });
});
