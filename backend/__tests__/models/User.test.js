// eslint-disable-next-line no-unused-vars
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../../models/User');

describe('User Model', () => {
  describe('Schema Validation', () => {
    it('should create a user with valid data', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'student',
        language: 'en'
      };

      const user = await User.create(userData);

      expect(user.name).toBe(userData.name);
      expect(user.email).toBe(userData.email);
      expect(user.role).toBe(userData.role);
      expect(user.language).toBe(userData.language);
      expect(user._id).toBeDefined();
    });

    it('should fail without required name', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123'
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    it('should fail without required email', async () => {
      const userData = {
        name: 'Test User',
        password: 'password123'
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    it('should fail without required password', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com'
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    it('should fail with invalid email format', async () => {
      const userData = {
        name: 'Test User',
        email: 'invalid-email',
        password: 'password123'
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    it('should fail with duplicate email', async () => {
      const userData = {
        name: 'Test User',
        email: 'duplicate@example.com',
        password: 'password123'
      };

      await User.create(userData);
      await expect(User.create(userData)).rejects.toThrow();
    });

    it('should default role to student', async () => {
      const userData = {
        name: 'Test User',
        email: 'default@example.com',
        password: 'password123'
      };

      const user = await User.create(userData);
      expect(user.role).toBe('student');
    });

    it('should hash password before saving', async () => {
      const userData = {
        name: 'Test User',
        email: 'hash@example.com',
        password: 'password123'
      };

      const user = await User.create(userData);
      
      // Fetch user with password field
      const userWithPassword = await User.findById(user._id).select('+password');
      expect(userWithPassword.password).not.toBe(userData.password);
      expect(userWithPassword.password).toMatch(/^\$2[aby]\$/); // bcrypt hash pattern
    });
  });

  describe('Methods', () => {
    it('should generate JWT token', async () => {
      const user = await User.create({
        name: 'Test User',
        email: 'token@example.com',
        password: 'password123'
      });

      const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '1h' });
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    });

    it('should match password correctly', async () => {
      const password = 'password123';
      const user = await User.create({
        name: 'Test User',
        email: 'match@example.com',
        password
      });

      const userWithPassword = await User.findById(user._id).select('+password');
      const isMatch = await userWithPassword.comparePassword(password);
      expect(isMatch).toBe(true);
    });

    it('should not match incorrect password', async () => {
      const user = await User.create({
        name: 'Test User',
        email: 'nomatch@example.com',
        password: 'password123'
      });

      const userWithPassword = await User.findById(user._id).select('+password');
      const isMatch = await userWithPassword.comparePassword('wrongpassword');
      expect(isMatch).toBe(false);
    });
  });

  describe('Field Constraints', () => {
    it('should enforce valid role values', async () => {
      const userData = {
        name: 'Test User',
        email: 'role@example.com',
        password: 'password123',
        role: 'invalid-role'
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    it('should enforce valid language values', async () => {
      const userData = {
        name: 'Test User',
        email: 'lang@example.com',
        password: 'password123',
        language: 'invalid-lang'
      };

      await expect(User.create(userData)).rejects.toThrow();
    });
  });
});
