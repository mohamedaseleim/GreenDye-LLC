// eslint-disable-next-line no-unused-vars
const mongoose = require('mongoose');
const Course = require('../../models/Course');
const User = require('../../models/User');

describe('Course Model', () => {
  let trainer;

  beforeEach(async () => {
    trainer = await User.create({
      name: 'Test Trainer',
      email: 'trainer@example.com',
      password: 'password123',
      role: 'trainer'
    });
  });

  describe('Schema Validation', () => {
    it('should create a course with valid data', async () => {
      const courseData = {
        title: {
          en: 'Test Course',
          ar: 'دورة تجريبية',
          fr: 'Cours de test'
        },
        description: {
          en: 'Test description',
          ar: 'وصف تجريبي',
          fr: 'Description du test'
        },
        instructor: trainer._id,
        category: 'technology',
        level: 'beginner',
        price: 99.99,
        duration: 10,
        language: 'en'
      };

      const course = await Course.create(courseData);

      expect(course.title.get('en')).toBe(courseData.title.en);
      expect(course.instructor.toString()).toBe(trainer._id.toString());
      expect(course.category).toBe(courseData.category);
      expect(course.level).toBe(courseData.level);
      expect(course.price).toBe(courseData.price);
    });

    it('should fail without required title', async () => {
      const courseData = {
        description: { en: 'Test description' },
        instructor: trainer._id,
        category: 'technology',
        level: 'beginner',
        duration: 10
      };

      await expect(Course.create(courseData)).rejects.toThrow();
    });

    it('should fail without required instructor', async () => {
      const courseData = {
        title: { en: 'Test Course' },
        description: { en: 'Test description' },
        category: 'technology',
        level: 'beginner',
        duration: 10
      };

      await expect(Course.create(courseData)).rejects.toThrow();
    });

    it('should default isPublished to false', async () => {
      const courseData = {
        title: { en: 'Test Course' },
        description: { en: 'Test description' },
        instructor: trainer._id,
        category: 'technology',
        level: 'beginner',
        duration: 10
      };

      const course = await Course.create(courseData);
      expect(course.isPublished).toBe(false);
    });

    it('should default enrollmentCount to 0', async () => {
      const courseData = {
        title: { en: 'Test Course' },
        description: { en: 'Test description' },
        instructor: trainer._id,
        category: 'technology',
        level: 'beginner',
        duration: 10
      };

      const course = await Course.create(courseData);
      expect(course.enrolled).toBe(0);
    });
  });

  describe('Field Constraints', () => {
    it('should enforce valid category values', async () => {
      const courseData = {
        title: { en: 'Test Course' },
        description: { en: 'Test description' },
        instructor: trainer._id,
        category: 'invalid-category'
      };

      await expect(Course.create(courseData)).rejects.toThrow();
    });

    it('should enforce valid level values', async () => {
      const courseData = {
        title: { en: 'Test Course' },
        description: { en: 'Test description' },
        instructor: trainer._id,
        category: 'technology',
        level: 'invalid-level'
      };

      await expect(Course.create(courseData)).rejects.toThrow();
    });

    it('should enforce minimum price of 0', async () => {
      const courseData = {
        title: { en: 'Test Course' },
        description: { en: 'Test description' },
        instructor: trainer._id,
        category: 'technology',
        price: -10
      };

      await expect(Course.create(courseData)).rejects.toThrow();
    });

    it('should enforce rating between 0 and 5', async () => {
      const courseData = {
        title: { en: 'Test Course' },
        description: { en: 'Test description' },
        instructor: trainer._id,
        category: 'technology',
        rating: 6
      };

      await expect(Course.create(courseData)).rejects.toThrow();
    });
  });

  describe('Optional Fields', () => {
    it('should allow course without price (free course)', async () => {
      const courseData = {
        title: { en: 'Free Course' },
        description: { en: 'Test description' },
        instructor: trainer._id,
        category: 'technology',
        level: 'beginner',
        duration: 10
      };

      const course = await Course.create(courseData);
      expect(course.price).toBe(0);
    });

    it('should allow course with thumbnail', async () => {
      const courseData = {
        title: { en: 'Test Course' },
        description: { en: 'Test description' },
        instructor: trainer._id,
        category: 'technology',
        level: 'beginner',
        duration: 10,
        thumbnail: '/uploads/thumbnails/test.jpg'
      };

      const course = await Course.create(courseData);
      expect(course.thumbnail).toBe(courseData.thumbnail);
    });
  });
});
