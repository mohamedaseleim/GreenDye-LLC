const request = require('supertest');
const { app } = require('../server');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

describe('Content Settings Validation Tests', () => {
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

  describe('PUT /api/admin/content-settings/home - Validation', () => {
    it('should accept valid home page content', async () => {
      const validData = {
        heroTitle: {
          en: 'Valid Title',
          ar: 'عنوان صحيح',
          fr: 'Titre valide',
        },
        heroSubtitle: {
          en: 'Valid Subtitle',
          ar: 'عنوان فرعي صحيح',
          fr: 'Sous-titre valide',
        },
        features: [
          { icon: 'School', title: 'Feature 1', description: 'Description 1' },
        ],
      };

      const res = await request(app)
        .put('/api/admin/content-settings/home')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(validData);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should reject excessively long hero title', async () => {
      const invalidData = {
        heroTitle: {
          en: 'a'.repeat(1001), // Exceeds max length
        },
      };

      const res = await request(app)
        .put('/api/admin/content-settings/home')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidData);

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Validation failed');
    });

    it('should escape HTML tags in hero title', async () => {
      const maliciousData = {
        heroTitle: {
          en: 'Title with <script>alert("XSS")</script> tags',
        },
      };

      const res = await request(app)
        .put('/api/admin/content-settings/home')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(maliciousData);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      // HTML should be escaped (< becomes &lt;, > becomes &gt;)
      expect(res.body.data.heroTitle.en).not.toContain('<script>');
      expect(res.body.data.heroTitle.en).toContain('&lt;');
    });
  });

  describe('PUT /api/admin/content-settings/about - Validation', () => {
    it('should accept valid about page content', async () => {
      const validData = {
        mission: {
          en: 'Our mission is to provide quality education',
          ar: 'مهمتنا هي توفير تعليم عالي الجودة',
          fr: 'Notre mission est de fournir une éducation de qualité',
        },
        vision: {
          en: 'To be the leading platform',
          ar: 'أن نكون المنصة الرائدة',
          fr: 'Être la plateforme leader',
        },
      };

      const res = await request(app)
        .put('/api/admin/content-settings/about')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(validData);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should escape HTML tags in mission', async () => {
      const maliciousData = {
        mission: {
          en: 'Mission with <iframe src="evil.com"></iframe> content',
        },
      };

      const res = await request(app)
        .put('/api/admin/content-settings/about')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(maliciousData);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      // HTML should be escaped
      expect(res.body.data.mission.en).not.toContain('<iframe>');
      expect(res.body.data.mission.en).toContain('&lt;');
    });
  });

  describe('PUT /api/admin/content-settings/contact - Validation', () => {
    it('should accept valid contact page content', async () => {
      const validData = {
        email: 'contact@example.com',
        phone: '+20 123 456 7890',
        address: '123 Main St, Cairo, Egypt',
        officeHours: {
          en: 'Mon-Fri: 9AM-5PM',
          ar: 'الإثنين-الجمعة: 9ص-5م',
          fr: 'Lun-Ven: 9h-17h',
        },
        socialMedia: {
          facebook: 'https://facebook.com/greendye',
          twitter: 'https://twitter.com/greendye',
          linkedin: 'https://linkedin.com/company/greendye',
          instagram: 'https://instagram.com/greendye',
          youtube: 'https://youtube.com/greendye',
        },
      };

      const res = await request(app)
        .put('/api/admin/content-settings/contact')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(validData);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should reject invalid email format', async () => {
      const invalidData = {
        email: 'not-an-email',
      };

      const res = await request(app)
        .put('/api/admin/content-settings/contact')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidData);

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors).toBeDefined();
    });

    it('should reject invalid phone format', async () => {
      const invalidData = {
        phone: 'abc-def-ghij', // Contains letters
      };

      const res = await request(app)
        .put('/api/admin/content-settings/contact')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidData);

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject invalid Facebook URL', async () => {
      const invalidData = {
        socialMedia: {
          facebook: 'https://twitter.com/notfacebook',
        },
      };

      const res = await request(app)
        .put('/api/admin/content-settings/contact')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidData);

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject invalid Twitter URL', async () => {
      const invalidData = {
        socialMedia: {
          twitter: 'https://facebook.com/nottwitter',
        },
      };

      const res = await request(app)
        .put('/api/admin/content-settings/contact')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidData);

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject invalid LinkedIn URL', async () => {
      const invalidData = {
        socialMedia: {
          linkedin: 'https://facebook.com/notlinkedin',
        },
      };

      const res = await request(app)
        .put('/api/admin/content-settings/contact')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidData);

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should accept empty social media URLs', async () => {
      const validData = {
        socialMedia: {
          facebook: '',
          twitter: '',
          linkedin: '',
          instagram: '',
          youtube: '',
        },
      };

      const res = await request(app)
        .put('/api/admin/content-settings/contact')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(validData);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should accept x.com URLs for Twitter', async () => {
      const validData = {
        socialMedia: {
          twitter: 'https://x.com/greendye',
        },
      };

      const res = await request(app)
        .put('/api/admin/content-settings/contact')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(validData);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should escape HTML in address field', async () => {
      const maliciousData = {
        address: 'Address with <script>alert("XSS")</script> tags',
      };

      const res = await request(app)
        .put('/api/admin/content-settings/contact')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(maliciousData);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      // HTML should be escaped
      expect(res.body.data.contactPage.address).not.toContain('<script>');
      expect(res.body.data.contactPage.address).toContain('&lt;');
    });
  });

  describe('Feature Validation', () => {
    it('should accept features with valid icon, title, and description', async () => {
      const validData = {
        features: [
          { icon: 'School', title: 'Quality Education', description: 'Access world-class courses' },
          { icon: 'Verified', title: 'Certified', description: 'Get verified certificates' },
        ],
      };

      const res = await request(app)
        .put('/api/admin/content-settings/home')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(validData);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.features).toHaveLength(2);
    });

    it('should escape HTML tags in feature fields', async () => {
      const maliciousData = {
        features: [
          {
            icon: 'School',
            title: 'Title <script>alert("XSS")</script>',
            description: 'Description with <iframe src="evil.com"></iframe>',
          },
        ],
      };

      const res = await request(app)
        .put('/api/admin/content-settings/home')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(maliciousData);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      // HTML should be escaped
      expect(res.body.data.features[0].title).not.toContain('<script>');
      expect(res.body.data.features[0].title).toContain('&lt;');
      expect(res.body.data.features[0].description).not.toContain('<iframe>');
      expect(res.body.data.features[0].description).toContain('&lt;');
    });
  });
});
