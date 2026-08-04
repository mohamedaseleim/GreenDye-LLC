const request = require('supertest');
const { app } = require('../../server');
const Page = require('../../models/Page');
const User = require('../../models/User');

describe('Public Page API', () => {
  let testUser;
  let _publishedPage;
  let _draftPage;

  beforeAll(async () => {
    // Create a test user
    testUser = await User.create({
      name: 'Test User',
      email: 'testuser@example.com',
      password: 'password123',
      role: 'admin'
    });

    // Create a published page
    _publishedPage = await Page.create({
      slug: 'test-published-page',
      title: {
        en: 'Test Published Page',
        ar: 'صفحة اختبار منشورة',
        fr: 'Page de test publiée'
      },
      content: {
        en: '<p>This is test content</p>',
        ar: '<p>هذا محتوى اختبار</p>',
        fr: '<p>Ceci est un contenu de test</p>'
      },
      metaDescription: {
        en: 'Test page description',
        ar: 'وصف صفحة الاختبار',
        fr: 'Description de la page de test'
      },
      template: 'default',
      status: 'published',
      isActive: true,
      author: testUser._id
    });

    // Create a draft page (should not be accessible)
    _draftPage = await Page.create({
      slug: 'test-draft-page',
      title: {
        en: 'Test Draft Page'
      },
      content: {
        en: '<p>This is draft content</p>'
      },
      template: 'default',
      status: 'draft',
      isActive: true,
      author: testUser._id
    });
  });

  afterAll(async () => {
    // Clean up test data
    await Page.deleteMany({ author: testUser._id });
    await User.findByIdAndDelete(testUser._id);
  });

  describe('GET /api/pages/:slug', () => {
    it('should return a published page by slug', async () => {
      const response = await request(app)
        .get('/api/pages/test-published-page')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.slug).toBe('test-published-page');
      expect(response.body.data.title.en).toBe('Test Published Page');
      expect(response.body.data.status).toBe('published');
      
      // Ensure sensitive fields are not included
      expect(response.body.data.author).toBeUndefined();
      expect(response.body.data.lastEditedBy).toBeUndefined();
    });

    it('should return 404 for a draft page', async () => {
      const response = await request(app)
        .get('/api/pages/test-draft-page')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Page not found');
    });

    it('should return 404 for a non-existent page', async () => {
      const response = await request(app)
        .get('/api/pages/non-existent-page')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Page not found');
    });

    it('should handle multilingual content', async () => {
      const response = await request(app)
        .get('/api/pages/test-published-page')
        .expect(200);

      expect(response.body.data.title.en).toBeDefined();
      expect(response.body.data.title.ar).toBeDefined();
      expect(response.body.data.title.fr).toBeDefined();
      expect(response.body.data.content.en).toBeDefined();
      expect(response.body.data.content.ar).toBeDefined();
      expect(response.body.data.content.fr).toBeDefined();
    });
  });

  describe('GET /api/pages', () => {
    let headerPage;
    let footerPage;
    let bothPage;

    beforeAll(async () => {
      // Create pages with different navigation settings
      headerPage = await Page.create({
        slug: 'header-only-page',
        title: {
          en: 'Header Only Page'
        },
        content: {
          en: '<p>Header page content</p>'
        },
        template: 'default',
        status: 'published',
        isActive: true,
        showInHeader: true,
        showInFooter: false,
        menuOrder: 1,
        author: testUser._id
      });

      footerPage = await Page.create({
        slug: 'footer-only-page',
        title: {
          en: 'Footer Only Page'
        },
        content: {
          en: '<p>Footer page content</p>'
        },
        template: 'default',
        status: 'published',
        isActive: true,
        showInHeader: false,
        showInFooter: true,
        menuOrder: 2,
        author: testUser._id
      });

      bothPage = await Page.create({
        slug: 'both-page',
        title: {
          en: 'Both Header and Footer Page'
        },
        content: {
          en: '<p>Both locations content</p>'
        },
        template: 'default',
        status: 'published',
        isActive: true,
        showInHeader: true,
        showInFooter: true,
        menuOrder: 0,
        author: testUser._id
      });
    });

    afterAll(async () => {
      await Page.deleteMany({ 
        _id: { $in: [headerPage._id, footerPage._id, bothPage._id] } 
      });
    });

    it('should return all published pages when no location filter is provided', async () => {
      const response = await request(app)
        .get('/api/pages')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.count).toBeGreaterThan(0);
    });

    it('should return only header pages when location=header', async () => {
      const response = await request(app)
        .get('/api/pages?location=header')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      
      // All returned pages should have showInHeader: true
      response.body.data.forEach(page => {
        expect(page.showInHeader).toBe(true);
      });

      // Check that specific pages are included
      const slugs = response.body.data.map(p => p.slug);
      expect(slugs).toContain('header-only-page');
      expect(slugs).toContain('both-page');
      expect(slugs).not.toContain('footer-only-page');
    });

    it('should return only footer pages when location=footer', async () => {
      const response = await request(app)
        .get('/api/pages?location=footer')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      
      // All returned pages should have showInFooter: true
      response.body.data.forEach(page => {
        expect(page.showInFooter).toBe(true);
      });

      // Check that specific pages are included
      const slugs = response.body.data.map(p => p.slug);
      expect(slugs).toContain('footer-only-page');
      expect(slugs).toContain('both-page');
      expect(slugs).not.toContain('header-only-page');
    });

    it('should return pages sorted by menuOrder', async () => {
      const response = await request(app)
        .get('/api/pages?location=header')
        .expect(200);

      expect(response.body.success).toBe(true);
      
      // Check that pages are sorted by menuOrder (0, 1, 2...)
      const orders = response.body.data.map(p => p.menuOrder);
      for (let i = 0; i < orders.length - 1; i++) {
        expect(orders[i]).toBeLessThanOrEqual(orders[i + 1]);
      }
    });

    it('should return only essential fields (slug, title, menuOrder, navigation flags)', async () => {
      const response = await request(app)
        .get('/api/pages?location=header')
        .expect(200);

      expect(response.body.success).toBe(true);
      
      if (response.body.data.length > 0) {
        const page = response.body.data[0];
        expect(page.slug).toBeDefined();
        expect(page.title).toBeDefined();
        expect(page.menuOrder).toBeDefined();
        expect(page.showInHeader).toBeDefined();
        expect(page.showInFooter).toBeDefined();
        
        // Should not include full content
        expect(page.content).toBeUndefined();
        expect(page.author).toBeUndefined();
      }
    });

    it('should not return draft or inactive pages', async () => {
      const response = await request(app)
        .get('/api/pages')
        .expect(200);

      expect(response.body.success).toBe(true);
      
      // All returned pages should be published and active
      response.body.data.forEach(page => {
        expect(page.status || 'published').toBe('published');
        expect(page.isActive !== false).toBe(true);
      });
    });
  });
});
