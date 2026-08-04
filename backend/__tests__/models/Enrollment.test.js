// eslint-disable-next-line no-unused-vars
const mongoose = require('mongoose');
const Enrollment = require('../../models/Enrollment');
const Course = require('../../models/Course');
const User = require('../../models/User');

describe('Enrollment Model', () => {
  let user;
  let course;

  beforeEach(async () => {
    // Create a test user
    user = await User.create({
      name: 'Test Student',
      email: 'student@example.com',
      password: 'password123',
      role: 'student'
    });

    // Create a test course
    const trainer = await User.create({
      name: 'Test Trainer',
      email: 'trainer@example.com',
      password: 'password123',
      role: 'trainer'
    });

    course = await Course.create({
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
      duration: 10
    });
  });

  describe('Schema Validation', () => {
    it('should create an enrollment with valid data', async () => {
      const enrollmentData = {
        user: user._id,
        course: course._id,
        status: 'active',
        progress: 0
      };

      const enrollment = await Enrollment.create(enrollmentData);

      expect(enrollment.user.toString()).toBe(user._id.toString());
      expect(enrollment.course.toString()).toBe(course._id.toString());
      expect(enrollment.status).toBe('active');
      expect(enrollment.progress).toBe(0);
    });

    it('should fail without required user', async () => {
      const enrollmentData = {
        course: course._id
      };

      await expect(Enrollment.create(enrollmentData)).rejects.toThrow();
    });

    it('should fail without required course', async () => {
      const enrollmentData = {
        user: user._id
      };

      await expect(Enrollment.create(enrollmentData)).rejects.toThrow();
    });

    it('should default status to active', async () => {
      const enrollmentData = {
        user: user._id,
        course: course._id
      };

      const enrollment = await Enrollment.create(enrollmentData);
      expect(enrollment.status).toBe('active');
    });

    it('should default progress to 0', async () => {
      const enrollmentData = {
        user: user._id,
        course: course._id
      };

      const enrollment = await Enrollment.create(enrollmentData);
      expect(enrollment.progress).toBe(0);
    });
  });

  describe('Virtual Field: completionStatus', () => {
    it('should map "active" status to "in_progress"', async () => {
      const enrollment = await Enrollment.create({
        user: user._id,
        course: course._id,
        status: 'active'
      });

      expect(enrollment.completionStatus).toBe('in_progress');
      
      // Verify it appears in JSON output
      const json = enrollment.toJSON();
      expect(json.completionStatus).toBe('in_progress');
    });

    it('should map "completed" status to "completed"', async () => {
      const enrollment = await Enrollment.create({
        user: user._id,
        course: course._id,
        status: 'completed',
        progress: 100
      });

      expect(enrollment.completionStatus).toBe('completed');
      
      // Verify it appears in JSON output
      const json = enrollment.toJSON();
      expect(json.completionStatus).toBe('completed');
    });

    it('should map "dropped" status to "in_progress"', async () => {
      const enrollment = await Enrollment.create({
        user: user._id,
        course: course._id,
        status: 'dropped'
      });

      expect(enrollment.completionStatus).toBe('in_progress');
      
      // Verify it appears in JSON output
      const json = enrollment.toJSON();
      expect(json.completionStatus).toBe('in_progress');
    });

    it('should map "suspended" status to "in_progress"', async () => {
      const enrollment = await Enrollment.create({
        user: user._id,
        course: course._id,
        status: 'suspended'
      });

      expect(enrollment.completionStatus).toBe('in_progress');
      
      // Verify it appears in JSON output
      const json = enrollment.toJSON();
      expect(json.completionStatus).toBe('in_progress');
    });
  });

  describe('Field Constraints', () => {
    it('should enforce valid status values', async () => {
      const enrollmentData = {
        user: user._id,
        course: course._id,
        status: 'invalid-status'
      };

      await expect(Enrollment.create(enrollmentData)).rejects.toThrow();
    });

    it('should enforce progress between 0 and 100', async () => {
      const enrollmentData = {
        user: user._id,
        course: course._id,
        progress: 150
      };

      await expect(Enrollment.create(enrollmentData)).rejects.toThrow();
    });

    it('should enforce minimum progress of 0', async () => {
      const enrollmentData = {
        user: user._id,
        course: course._id,
        progress: -10
      };

      await expect(Enrollment.create(enrollmentData)).rejects.toThrow();
    });
  });

  describe('Unique Constraint', () => {
    it('should prevent duplicate enrollments', async () => {
      await Enrollment.create({
        user: user._id,
        course: course._id
      });

      // Try to create duplicate enrollment
      await expect(
        Enrollment.create({
          user: user._id,
          course: course._id
        })
      ).rejects.toThrow();
    });
  });

  describe('Quiz Scores', () => {
    it('should allow adding quiz scores', async () => {
      const enrollment = await Enrollment.create({
        user: user._id,
        course: course._id,
        quizScores: [
          {
            quiz: new mongoose.Types.ObjectId(),
            score: 85,
            maxScore: 100,
            attempt: 1,
            completedAt: new Date()
          }
        ]
      });

      expect(enrollment.quizScores).toHaveLength(1);
      expect(enrollment.quizScores[0].score).toBe(85);
      expect(enrollment.quizScores[0].maxScore).toBe(100);
      expect(enrollment.quizScores[0].attempt).toBe(1);
    });

    it('should allow multiple quiz attempts', async () => {
      const quizId = new mongoose.Types.ObjectId();
      const enrollment = await Enrollment.create({
        user: user._id,
        course: course._id,
        quizScores: [
          {
            quiz: quizId,
            score: 75,
            maxScore: 100,
            attempt: 1,
            completedAt: new Date()
          },
          {
            quiz: quizId,
            score: 90,
            maxScore: 100,
            attempt: 2,
            completedAt: new Date()
          }
        ]
      });

      expect(enrollment.quizScores).toHaveLength(2);
      expect(enrollment.quizScores[0].attempt).toBe(1);
      expect(enrollment.quizScores[1].attempt).toBe(2);
      expect(enrollment.quizScores[1].score).toBeGreaterThan(enrollment.quizScores[0].score);
    });
  });
});
