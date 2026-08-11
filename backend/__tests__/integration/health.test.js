const request = require('supertest');
const { app } = require('../../server');

describe('Health Check Endpoints', () => {
  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.status).toBe('alive');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('GET /api/docs', () => {
    it('should return API documentation info', async () => {
      const response = await request(app)
        .get('/api/docs')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('GreenDye for Training and Consultancy API');
      expect(response.body.version).toBe('2.0.0');
      expect(response.body).toHaveProperty('endpoints');
      expect(response.body.endpoints).toHaveProperty('auth');
      expect(response.body.endpoints).toHaveProperty('consulting');
    });
  });

  describe('404 Handler', () => {
    it('should return 404 for unknown routes', async () => {
      const response = await request(app)
        .get('/api/nonexistent-route')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Route not found');
    });
  });
});
