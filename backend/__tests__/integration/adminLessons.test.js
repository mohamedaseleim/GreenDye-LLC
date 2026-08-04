const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../../server');
const User = require('../../models/User');
const Course = require('../../models/Course');
const Lesson = require('../../models/Lesson');
const Quiz = require('../../models/Quiz');

describe('Admin Lesson Management', () => {
  let adminToken;
  let adminUser;
  let course;

  beforeAll(async () => {
    // Create admin user
    adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@test.com',
      password: 'password123',
      role: 'admin',
    });

    // Login to get token
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@test.com',
        password: 'password123',
      });

    adminToken = loginRes.body.token;

    // Create a test course
    course = await Course.create({
      title: { en: 'Test Course' },
      description: { en: 'Test Description' },
      trainer: adminUser._id,
      category: 'technology',
      level: 'Beginner',
      price: 99,
      isApproved: true,
    });
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Course.deleteMany({});
    await Lesson.deleteMany({});
    await Quiz.deleteMany({});
    await mongoose.connection.close();
  });

  describe('POST /api/lessons', () => {
    it('should create a new lesson', async () => {
      const lessonData = {
        course: course._id,
        title: { en: 'Introduction to Programming' },
        description: { en: 'Learn the basics' },
        type: 'video',
        order: 0,
        isFree: false,
        isPublished: true,
        duration: 30,
        content: {
          video: {
            url: 'https://example.com/video.mp4',
            duration: 1800,
            thumbnail: 'https://example.com/thumb.jpg',
          },
        },
      };

      const res = await request(app)
        .post('/api/lessons')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(lessonData);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title.en).toBe('Introduction to Programming');
      expect(res.body.data.type).toBe('video');
    });

    it('should create a text lesson', async () => {
      const lessonData = {
        course: course._id,
        title: { en: 'Programming Concepts' },
        description: { en: 'Understanding core concepts' },
        type: 'text',
        order: 1,
        isPublished: true,
        content: {
          text: {
            en: 'This is the lesson content...',
          },
        },
      };

      const res = await request(app)
        .post('/api/lessons')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(lessonData);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.type).toBe('text');
      expect(res.body.data.content.text.en).toBe('This is the lesson content...');
    });

    it('should create a document lesson', async () => {
      const lessonData = {
        course: course._id,
        title: { en: 'Course Materials' },
        type: 'document',
        order: 2,
        isPublished: true,
        content: {
          document: {
            url: 'https://example.com/document.pdf',
            type: 'pdf',
            name: 'Course Materials.pdf',
          },
        },
      };

      const res = await request(app)
        .post('/api/lessons')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(lessonData);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.type).toBe('document');
    });
  });

  describe('GET /api/lessons', () => {
    it('should get all lessons for a course', async () => {
      const res = await request(app).get(`/api/lessons?courseId=${course._id}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('PUT /api/lessons/:id', () => {
    it('should update a lesson', async () => {
      const lesson = await Lesson.findOne({ course: course._id });

      const updateData = {
        title: { en: 'Updated Lesson Title' },
        description: { en: 'Updated description' },
      };

      const res = await request(app)
        .put(`/api/lessons/${lesson._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title.en).toBe('Updated Lesson Title');
    });
  });

  describe('DELETE /api/lessons/:id', () => {
    it('should delete a lesson', async () => {
      const lesson = await Lesson.findOne({ course: course._id });

      const res = await request(app)
        .delete(`/api/lessons/${lesson._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);

      const deletedLesson = await Lesson.findById(lesson._id);
      expect(deletedLesson).toBeNull();
    });
  });
});

describe('Admin Quiz Management', () => {
  let adminToken;
  let adminUser;
  let course;
  let lesson;

  beforeAll(async () => {
    // Create admin user
    adminUser = await User.findOne({ email: 'admin@test.com' });
    if (!adminUser) {
      adminUser = await User.create({
        name: 'Admin User',
        email: 'admin@test.com',
        password: 'password123',
        role: 'admin',
      });
    }

    // Login to get token
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@test.com',
        password: 'password123',
      });

    adminToken = loginRes.body.token;

    // Create test course and lesson
    course = await Course.findOne({}) || await Course.create({
      title: { en: 'Test Course' },
      description: { en: 'Test Description' },
      trainer: adminUser._id,
      category: 'technology',
      level: 'Beginner',
      price: 99,
      isApproved: true,
    });

    lesson = await Lesson.create({
      course: course._id,
      title: { en: 'Test Lesson' },
      type: 'quiz',
      order: 0,
      isPublished: true,
    });
  });

  afterAll(async () => {
    await Quiz.deleteMany({});
  });

  describe('POST /api/quizzes', () => {
    it('should create a new quiz', async () => {
      const quizData = {
        course: course._id,
        lesson: lesson._id,
        title: { en: 'Programming Basics Quiz' },
        description: { en: 'Test your knowledge' },
        questions: [
          {
            question: { en: 'What is JavaScript?' },
            type: 'multiple-choice',
            options: [
              { text: { en: 'A programming language' }, isCorrect: true },
              { text: { en: 'A coffee brand' }, isCorrect: false },
              { text: { en: 'A type of tea' }, isCorrect: false },
            ],
            points: 1,
            difficulty: 'easy',
          },
          {
            question: { en: 'Is Python compiled or interpreted?' },
            type: 'multiple-choice',
            options: [
              { text: { en: 'Compiled' }, isCorrect: false },
              { text: { en: 'Interpreted' }, isCorrect: true },
            ],
            points: 1,
            difficulty: 'medium',
          },
        ],
        passingScore: 70,
        timeLimit: 30,
        attemptsAllowed: 3,
        shuffleQuestions: false,
        shuffleOptions: false,
        showResults: 'after-submission',
        isRequired: false,
        isPublished: true,
      };

      const res = await request(app)
        .post('/api/quizzes')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(quizData);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title.en).toBe('Programming Basics Quiz');
      expect(res.body.data.questions.length).toBe(2);
      expect(res.body.data.totalPoints).toBe(2);
    });
  });

  describe('GET /api/quizzes', () => {
    it('should get all quizzes for a course', async () => {
      const res = await request(app)
        .get(`/api/quizzes?courseId=${course._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should get quizzes for a specific lesson', async () => {
      const res = await request(app)
        .get(`/api/quizzes?courseId=${course._id}&lessonId=${lesson._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('PUT /api/quizzes/:id', () => {
    it('should update a quiz', async () => {
      const quiz = await Quiz.findOne({ course: course._id });

      const updateData = {
        title: { en: 'Updated Quiz Title' },
        passingScore: 80,
      };

      const res = await request(app)
        .put(`/api/quizzes/${quiz._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title.en).toBe('Updated Quiz Title');
      expect(res.body.data.passingScore).toBe(80);
    });
  });

  describe('DELETE /api/quizzes/:id', () => {
    it('should delete a quiz', async () => {
      const quiz = await Quiz.findOne({ course: course._id });

      const res = await request(app)
        .delete(`/api/quizzes/${quiz._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);

      const deletedQuiz = await Quiz.findById(quiz._id);
      expect(deletedQuiz).toBeNull();
    });
  });
});
