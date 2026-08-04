const request = require('supertest');
const { app } = require('../../server');
const Trainer = require('../../models/Trainer');
const User = require('../../models/User');

describe('Verify Controller', () => {
  let testUser;
  let testTrainer;

  beforeAll(async () => {
    // Create a test user
    testUser = await User.create({
      name: 'Test Trainer User',
      email: `test-trainer-${Date.now()}@example.com`,
      password: 'Password123!',
      role: 'trainer'
    });

    // Create a test trainer with all fields including admin-only ones
    testTrainer = await Trainer.create({
      user: testUser._id,
      fullName: 'Test Trainer',
      title: { en: 'Professional Trainer' },
      bio: { en: 'Experienced trainer with many years in the field' },
      expertise: ['JavaScript', 'React', 'Node.js'],
      experience: 10,
      qualifications: [
        {
          degree: 'MSc Computer Science',
          institution: 'Test University',
          year: 2015
        }
      ],
      certifications: [
        {
          name: 'AWS Certified',
          organization: 'Amazon',
          year: 2020
        }
      ],
      languages: [
        {
          language: 'en',
          proficiency: 'native'
        }
      ],
      // Admin-only fields that should NOT be exposed
      rating: 4.8,
      coursesCount: 15,
      studentsCount: 250,
      accreditations: [
        {
          organization: 'Test Accreditation Body',
          accreditationNumber: 'ACC-12345',
          issueDate: new Date('2020-01-01'),
          expiryDate: new Date('2025-01-01')
        }
      ],
      commissionRate: 25,
      isVerified: true,
      isActive: true,
      applicationStatus: 'approved',
      verificationDate: new Date('2023-01-01')
    });
  });

  afterAll(async () => {
    // Clean up test data
    if (testTrainer) {
      await Trainer.deleteOne({ _id: testTrainer._id });
    }
    if (testUser) {
      await User.deleteOne({ _id: testUser._id });
    }
  });

  describe('GET /api/verify/trainer/:trainerId', () => {
    it('should return trainer data without admin-only fields', async () => {
      const response = await request(app)
        .get(`/api/verify/trainer/${testTrainer.trainerId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.verified).toBe(true);
      expect(response.body.message).toBe('Trainer is verified and active');

      const trainerData = response.body.data;

      // Check that public fields are present
      expect(trainerData.trainerId).toBe(testTrainer.trainerId);
      expect(trainerData.fullName).toBe('Test Trainer');
      expect(trainerData.title).toBeDefined();
      expect(trainerData.bio).toBeDefined();
      expect(trainerData.expertise).toEqual(['JavaScript', 'React', 'Node.js']);
      expect(trainerData.experience).toBe(10);
      expect(trainerData.qualifications).toBeDefined();
      expect(trainerData.certifications).toBeDefined();
      expect(trainerData.languages).toBeDefined();
      expect(trainerData.verificationDate).toBeDefined();

      // Check that admin-only fields are NOT present
      expect(trainerData.rating).toBeUndefined();
      expect(trainerData.coursesCount).toBeUndefined();
      expect(trainerData.studentsCount).toBeUndefined();
      expect(trainerData.accreditations).toBeUndefined();
      expect(trainerData.commissionRate).toBeUndefined();
    });

    it('should return 404 for non-existent trainer', async () => {
      const response = await request(app)
        .get('/api/verify/trainer/TR-NONEXISTENT')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.verified).toBe(false);
      expect(response.body.message).toBe('Trainer not found');
    });

    it('should return unverified status for inactive trainer', async () => {
      // Temporarily deactivate the trainer
      testTrainer.isActive = false;
      await testTrainer.save();

      const response = await request(app)
        .get(`/api/verify/trainer/${testTrainer.trainerId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.verified).toBe(false);
      expect(response.body.message).toBe('Trainer account is not active');

      // Ensure admin-only fields are NOT present even in error case
      expect(response.body.data.rating).toBeUndefined();
      expect(response.body.data.coursesCount).toBeUndefined();
      expect(response.body.data.studentsCount).toBeUndefined();
      expect(response.body.data.accreditations).toBeUndefined();
      expect(response.body.data.commissionRate).toBeUndefined();

      // Reactivate for other tests
      testTrainer.isActive = true;
      await testTrainer.save();
    });

    it('should return unverified status for unverified trainer', async () => {
      // Temporarily unverify the trainer by changing applicationStatus
      const originalStatus = testTrainer.applicationStatus;
      testTrainer.applicationStatus = 'pending';
      await testTrainer.save();

      const response = await request(app)
        .get(`/api/verify/trainer/${testTrainer.trainerId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.verified).toBe(false);
      expect(response.body.message).toBe('Trainer is not verified');

      // Ensure admin-only fields are NOT present even in error case
      expect(response.body.data.rating).toBeUndefined();
      expect(response.body.data.coursesCount).toBeUndefined();
      expect(response.body.data.studentsCount).toBeUndefined();
      expect(response.body.data.accreditations).toBeUndefined();
      expect(response.body.data.commissionRate).toBeUndefined();

      // Restore original status for other tests
      testTrainer.applicationStatus = originalStatus;
      await testTrainer.save();
    });

    it('should return verified status for approved trainer even if isVerified is false', async () => {
      // Set isVerified to false but keep applicationStatus as approved
      testTrainer.isVerified = false;
      testTrainer.applicationStatus = 'approved';
      await testTrainer.save();

      const response = await request(app)
        .get(`/api/verify/trainer/${testTrainer.trainerId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.verified).toBe(true);
      expect(response.body.message).toBe('Trainer is verified and active');

      const trainerData = response.body.data;

      // Check that public fields are present
      expect(trainerData.trainerId).toBe(testTrainer.trainerId);
      expect(trainerData.fullName).toBe('Test Trainer');
      expect(trainerData.verificationStatus).toBe('Approved');

      // Ensure admin-only fields are NOT present
      expect(trainerData.rating).toBeUndefined();
      expect(trainerData.coursesCount).toBeUndefined();
      expect(trainerData.studentsCount).toBeUndefined();
      expect(trainerData.accreditations).toBeUndefined();
      expect(trainerData.commissionRate).toBeUndefined();

      // Restore isVerified for other tests
      testTrainer.isVerified = true;
      await testTrainer.save();
    });
  });
});
