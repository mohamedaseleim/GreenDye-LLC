const jwt = require('jsonwebtoken');
const User = require('../../models/User');

/**
 * Create a test user
 */
const createTestUser = async (overrides = {}) => {
  const defaultUser = {
    name: 'Test User',
    email: `test${Date.now()}@example.com`,
    password: 'password123',
    role: 'student',
    language: 'en',
    isVerified: true,
    isActive: true
  };

  const user = await User.create({ ...defaultUser, ...overrides });
  return user;
};

/**
 * Generate JWT token for test user
 */
const generateTestToken = (userId, role = 'student') => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

/**
 * Create authenticated test user with token
 */
const createAuthenticatedUser = async (role = 'student') => {
  const user = await createTestUser({ role });
  const token = generateTestToken(user._id, role);
  return { user, token };
};

module.exports = {
  createTestUser,
  generateTestToken,
  createAuthenticatedUser
};
