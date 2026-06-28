const { app, connectDB, gracefulShutdown } = require('../server');
const request = require('supertest');
const mongoose = require('mongoose');
const User = require('./models/user');
const jwt = require('jsonwebtoken');

const TEST_PORT = 4001;
const TEST_DB_URI = process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/yourdb_test';
const TEST_JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

const createTestUser = async (userData = {}) => {
  return await User.create({
    email: 'test@example.com',
    password: 'password123',
    ...userData
  });
};

const getAuthToken = (userId) => {
  return jwt.sign({ id: userId }, TEST_JWT_SECRET, { expiresIn: '1h' });
};

let server;

describe('Route Tests', () => {
  beforeAll(async () => {
    process.env.MONGO_URI = TEST_DB_URI;
    await connectDB();
    await mongoose.connection.db.dropDatabase();
    server = app.listen(TEST_PORT);
  });

  afterEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany();
    }
  });

  afterAll(async () => {
    await mongoose.connection.close();
    await gracefulShutdown('TEST_COMPLETE');
  });

  describe('API Health & Security', () => {
    it('should return API health status', async () => {
      const res = await request(server).get('/api/health');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('status', 'healthy');
    });

    it('should return 404 for unknown routes', async () => {
      const res = await request(server).get('/nonexistent-route');
      expect(res.statusCode).toBe(404);
    });
  });

  describe('User Authentication', () => {
    it('should register a new user', async () => {
      const res = await request(server).post('/api/users/register').send({
        email: 'newuser@example.com',
        password: 'securePassword123!'
      });
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('token');
    });

    it('should reject weak passwords', async () => {
      const res = await request(server).post('/api/users/register').send({
        email: 'weakpass@example.com', password: '123'
      });
      expect(res.statusCode).toBe(400);
    });
  });

  describe('Protected Routes', () => {
    let authToken;

    beforeEach(async () => {
      const testUser = await createTestUser();
      authToken = getAuthToken(testUser._id);
    });

    it('should allow access with valid token', async () => {
      const res = await request(server).get('/api/protected-route').set('Authorization', `Bearer ${authToken}`);
      expect(res.statusCode).toBe(200);
    });

    it('should reject access without token', async () => {
      const res = await request(server).get('/api/protected-route');
      expect(res.statusCode).toBe(401);
    });
  });
});
