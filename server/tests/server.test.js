const request = require('supertest');
const app = require('../server');

describe('URL Shortener API', () => {
  let testShortCode;

  describe('POST /shorten', () => {
    it('should create a short URL for valid long URL', async () => {
      const response = await request(app)
        .post('/shorten')
        .send({ longUrl: 'https://www.example.com' });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('shortUrl');
      expect(response.body).toHaveProperty('shortCode');
      expect(response.body.longUrl).toBe('https://www.example.com');
      
      // Store shortCode for other tests
      testShortCode = response.body.shortCode;
    });

    it('should return 400 for missing URL', async () => {
      const response = await request(app)
        .post('/shorten')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('URL is required');
    });

    it('should return 400 for invalid URL', async () => {
      const response = await request(app)
        .post('/shorten')
        .send({ longUrl: 'invalid-url' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid URL format');
    });

    it('should return existing short URL for duplicate long URL', async () => {
      const response = await request(app)
        .post('/shorten')
        .send({ longUrl: 'https://www.example.com' });

      expect(response.status).toBe(200);
      expect(response.body.shortCode).toBe(testShortCode);
    });
  });

  describe('GET /stats/:code', () => {
    it('should return stats for existing short code', async () => {
      if (testShortCode) {
        const response = await request(app)
          .get(`/stats/${testShortCode}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('shortCode');
        expect(response.body).toHaveProperty('longUrl');
        expect(response.body).toHaveProperty('clicks');
        expect(response.body).toHaveProperty('createdAt');
      }
    });

    it('should return 404 for non-existent code', async () => {
      const response = await request(app)
        .get('/stats/nonexistent');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Short URL not found');
    });
  });

  describe('GET /:code (redirect)', () => {
    it('should redirect to original URL for valid code', async () => {
      if (testShortCode) {
        const response = await request(app)
          .get(`/${testShortCode}`)
          .redirects(0); // Don't follow redirects

        expect(response.status).toBe(302);
        expect(response.headers.location).toBe('https://www.example.com');
      }
    });

    it('should return 404 for non-existent code', async () => {
      const response = await request(app)
        .get('/nonexistent')
        .redirects(0);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Short URL not found');
    });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('OK');
    });
  });
});