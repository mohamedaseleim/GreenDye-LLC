const mongoose = require('mongoose');
const Assignment = require('../../models/Assignment');
const AssignmentSubmission = require('../../models/AssignmentSubmission');
const Course = require('../../models/Course');
const Lesson = require('../../models/Lesson');
const User = require('../../models/User');

describe('Assignment Model', () => {
  let course, lesson, trainer, student;

  beforeEach(async () => {
    trainer = await User.create({
      name: 'Test Trainer',
      email: 'trainer@example.com',
      password: 'password123',
      role: 'trainer'
    });

    student = await User.create({
      name: 'Test Student',
      email: 'student@example.com',
      password: 'password123',
      role: 'student'
    });

    course = await Course.create({
      title: { en: 'Test Course' },
      description: { en: 'Test description' },
      instructor: trainer._id,
      category: 'technology',
      level: 'beginner',
      duration: 10
    });

    lesson = await Lesson.create({
      course: course._id,
      title: { en: 'Test Lesson' },
      type: 'video',
      order: 1
    });
  });

  describe('Schema Validation', () => {
    it('should create an assignment with valid data', async () => {
      const assignmentData = {
        course: course._id,
        lesson: lesson._id,
        title: { en: 'Test Assignment' },
        description: { en: 'Complete this assignment' },
        maxPoints: 100,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      };

      const assignment = await Assignment.create(assignmentData);

      expect(assignment.title.get('en')).toBe(assignmentData.title.en);
      expect(assignment.course.toString()).toBe(course._id.toString());
      expect(assignment.lesson.toString()).toBe(lesson._id.toString());
      expect(assignment.maxPoints).toBe(100);
    });

    it('should fail without required course', async () => {
      const assignmentData = {
        lesson: lesson._id,
        title: { en: 'Test Assignment' },
        description: { en: 'Complete this assignment' }
      };

      await expect(Assignment.create(assignmentData)).rejects.toThrow();
    });

    it('should fail without required lesson', async () => {
      const assignmentData = {
        course: course._id,
        title: { en: 'Test Assignment' },
        description: { en: 'Complete this assignment' }
      };

      await expect(Assignment.create(assignmentData)).rejects.toThrow();
    });

    it('should fail without required title', async () => {
      const assignmentData = {
        course: course._id,
        lesson: lesson._id,
        description: { en: 'Complete this assignment' }
      };

      await expect(Assignment.create(assignmentData)).rejects.toThrow();
    });
  });

  describe('Default Values', () => {
    it('should default maxPoints to 100', async () => {
      const assignmentData = {
        course: course._id,
        lesson: lesson._id,
        title: { en: 'Test Assignment' },
        description: { en: 'Complete this assignment' }
      };

      const assignment = await Assignment.create(assignmentData);
      expect(assignment.maxPoints).toBe(100);
    });

    it('should default isRequired to true', async () => {
      const assignmentData = {
        course: course._id,
        lesson: lesson._id,
        title: { en: 'Test Assignment' },
        description: { en: 'Complete this assignment' }
      };

      const assignment = await Assignment.create(assignmentData);
      expect(assignment.isRequired).toBe(true);
    });

    it('should default allowLateSubmission to false', async () => {
      const assignmentData = {
        course: course._id,
        lesson: lesson._id,
        title: { en: 'Test Assignment' },
        description: { en: 'Complete this assignment' }
      };

      const assignment = await Assignment.create(assignmentData);
      expect(assignment.allowLateSubmission).toBe(false);
    });

    it('should default isPublished to false', async () => {
      const assignmentData = {
        course: course._id,
        lesson: lesson._id,
        title: { en: 'Test Assignment' },
        description: { en: 'Complete this assignment' }
      };

      const assignment = await Assignment.create(assignmentData);
      expect(assignment.isPublished).toBe(false);
    });
  });

  describe('Submission Type Validation', () => {
    it('should accept valid submission types', async () => {
      const assignmentData = {
        course: course._id,
        lesson: lesson._id,
        title: { en: 'Test Assignment' },
        description: { en: 'Complete this assignment' },
        submissionType: ['file', 'text', 'url']
      };

      const assignment = await Assignment.create(assignmentData);
      expect(assignment.submissionType).toContain('file');
      expect(assignment.submissionType).toContain('text');
      expect(assignment.submissionType).toContain('url');
    });

    it('should reject invalid submission types', async () => {
      const assignmentData = {
        course: course._id,
        lesson: lesson._id,
        title: { en: 'Test Assignment' },
        description: { en: 'Complete this assignment' },
        submissionType: ['invalid-type']
      };

      await expect(Assignment.create(assignmentData)).rejects.toThrow();
    });
  });

  describe('Attachments', () => {
    it('should allow multiple attachments', async () => {
      const assignmentData = {
        course: course._id,
        lesson: lesson._id,
        title: { en: 'Test Assignment' },
        description: { en: 'Complete this assignment' },
        attachments: [
          { name: 'file1.pdf', url: '/uploads/file1.pdf', type: 'pdf', size: 1024 },
          { name: 'file2.pdf', url: '/uploads/file2.pdf', type: 'pdf', size: 2048 }
        ]
      };

      const assignment = await Assignment.create(assignmentData);
      expect(assignment.attachments).toHaveLength(2);
      expect(assignment.attachments[0].name).toBe('file1.pdf');
    });
  });
});

describe('AssignmentSubmission Model', () => {
  let course, lesson, assignment, student;

  beforeEach(async () => {
    const trainer = await User.create({
      name: 'Test Trainer',
      email: 'trainer@example.com',
      password: 'password123',
      role: 'trainer'
    });

    student = await User.create({
      name: 'Test Student',
      email: 'student@example.com',
      password: 'password123',
      role: 'student'
    });

    course = await Course.create({
      title: { en: 'Test Course' },
      description: { en: 'Test description' },
      instructor: trainer._id,
      category: 'technology',
      level: 'beginner',
      duration: 10
    });

    lesson = await Lesson.create({
      course: course._id,
      title: { en: 'Test Lesson' },
      type: 'assignment',
      order: 1
    });

    assignment = await Assignment.create({
      course: course._id,
      lesson: lesson._id,
      title: { en: 'Test Assignment' },
      description: { en: 'Complete this assignment' },
      maxPoints: 100
    });
  });

  describe('Schema Validation', () => {
    it('should create a submission with valid data', async () => {
      const submissionData = {
        assignment: assignment._id,
        user: student._id,
        course: course._id,
        submissionType: 'text',
        content: {
          text: 'This is my submission text'
        },
        status: 'submitted'
      };

      const submission = await AssignmentSubmission.create(submissionData);

      expect(submission.assignment.toString()).toBe(assignment._id.toString());
      expect(submission.user.toString()).toBe(student._id.toString());
      expect(submission.submissionType).toBe('text');
      expect(submission.status).toBe('submitted');
    });

    it('should fail without required assignment', async () => {
      const submissionData = {
        user: student._id,
        course: course._id,
        submissionType: 'text',
        content: { text: 'Test' }
      };

      await expect(AssignmentSubmission.create(submissionData)).rejects.toThrow();
    });

    it('should fail without required user', async () => {
      const submissionData = {
        assignment: assignment._id,
        course: course._id,
        submissionType: 'text',
        content: { text: 'Test' }
      };

      await expect(AssignmentSubmission.create(submissionData)).rejects.toThrow();
    });
  });

  describe('Default Values', () => {
    it('should default status to draft', async () => {
      const submissionData = {
        assignment: assignment._id,
        user: student._id,
        course: course._id,
        submissionType: 'text',
        content: { text: 'Test' }
      };

      const submission = await AssignmentSubmission.create(submissionData);
      expect(submission.status).toBe('draft');
    });

    it('should default attempt to 1', async () => {
      const submissionData = {
        assignment: assignment._id,
        user: student._id,
        course: course._id,
        submissionType: 'text',
        content: { text: 'Test' }
      };

      const submission = await AssignmentSubmission.create(submissionData);
      expect(submission.attempt).toBe(1);
    });

    it('should default isLate to false', async () => {
      const submissionData = {
        assignment: assignment._id,
        user: student._id,
        course: course._id,
        submissionType: 'text',
        content: { text: 'Test' }
      };

      const submission = await AssignmentSubmission.create(submissionData);
      expect(submission.isLate).toBe(false);
    });
  });

  describe('Status Updates', () => {
    it('should set submittedAt when status changes to submitted', async () => {
      const submissionData = {
        assignment: assignment._id,
        user: student._id,
        course: course._id,
        submissionType: 'text',
        content: { text: 'Test' }
      };

      const submission = await AssignmentSubmission.create(submissionData);
      expect(submission.submittedAt).toBeUndefined();

      submission.status = 'submitted';
      await submission.save();
      
      expect(submission.submittedAt).toBeDefined();
    });

    it('should set gradedAt when status changes to graded', async () => {
      const submissionData = {
        assignment: assignment._id,
        user: student._id,
        course: course._id,
        submissionType: 'text',
        content: { text: 'Test' },
        status: 'submitted'
      };

      const submission = await AssignmentSubmission.create(submissionData);
      expect(submission.gradedAt).toBeUndefined();

      submission.status = 'graded';
      submission.score = 85;
      await submission.save();
      
      expect(submission.gradedAt).toBeDefined();
    });
  });

  describe('Submission Types', () => {
    it('should support file submission', async () => {
      const submissionData = {
        assignment: assignment._id,
        user: student._id,
        course: course._id,
        submissionType: 'file',
        content: {
          files: [
            { name: 'submission.pdf', url: '/uploads/submission.pdf', type: 'pdf', size: 1024 }
          ]
        }
      };

      const submission = await AssignmentSubmission.create(submissionData);
      expect(submission.content.files).toHaveLength(1);
      expect(submission.content.files[0].name).toBe('submission.pdf');
    });

    it('should support text submission', async () => {
      const submissionData = {
        assignment: assignment._id,
        user: student._id,
        course: course._id,
        submissionType: 'text',
        content: {
          text: 'This is my submission text'
        }
      };

      const submission = await AssignmentSubmission.create(submissionData);
      expect(submission.content.text).toBe('This is my submission text');
    });

    it('should support url submission', async () => {
      const submissionData = {
        assignment: assignment._id,
        user: student._id,
        course: course._id,
        submissionType: 'url',
        content: {
          url: 'https://github.com/student/project'
        }
      };

      const submission = await AssignmentSubmission.create(submissionData);
      expect(submission.content.url).toBe('https://github.com/student/project');
    });
  });
});
