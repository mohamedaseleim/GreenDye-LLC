// eslint-disable-next-line no-unused-vars
const mongoose = require('mongoose');
const Payment = require('../../models/Payment');
const User = require('../../models/User');
const Course = require('../../models/Course');

describe('Payment Model', () => {
  let user, course;

  beforeEach(async () => {
    user = await User.create({
      name: 'Test User',
      email: 'payment@example.com',
      password: 'password123'
    });

    const trainer = await User.create({
      name: 'Test Trainer',
      email: 'trainer@example.com',
      password: 'password123',
      role: 'trainer'
    });

    course = await Course.create({
      title: { en: 'Test Course' },
      description: { en: 'Test Description' },
      instructor: trainer._id,
      category: 'technology',
      level: 'beginner',
      duration: 10,
      price: 99.99
    });
  });

  describe('Schema Validation', () => {
    it('should create a payment with valid data', async () => {
      const paymentData = {
        user: user._id,
        course: course._id,
        amount: 99.99,
        currency: 'USD',
        paymentMethod: 'stripe',
        status: 'pending'
      };

      const payment = await Payment.create(paymentData);

      expect(payment.user.toString()).toBe(user._id.toString());
      expect(payment.course.toString()).toBe(course._id.toString());
      expect(payment.amount).toBe(paymentData.amount);
      expect(payment.currency).toBe(paymentData.currency);
      expect(payment.paymentMethod).toBe(paymentData.paymentMethod);
      expect(payment.status).toBe(paymentData.status);
    });

    it('should fail without required user', async () => {
      const paymentData = {
        course: course._id,
        amount: 99.99,
        paymentMethod: 'stripe'
      };

      await expect(Payment.create(paymentData)).rejects.toThrow();
    });

    it('should fail without required course', async () => {
      const paymentData = {
        user: user._id,
        amount: 99.99,
        paymentMethod: 'stripe'
      };

      await expect(Payment.create(paymentData)).rejects.toThrow();
    });

    it('should fail without required amount', async () => {
      const paymentData = {
        user: user._id,
        course: course._id,
        paymentMethod: 'stripe'
      };

      await expect(Payment.create(paymentData)).rejects.toThrow();
    });

    it('should fail without required paymentMethod', async () => {
      const paymentData = {
        user: user._id,
        course: course._id,
        amount: 99.99
      };

      await expect(Payment.create(paymentData)).rejects.toThrow();
    });

    it('should default status to pending', async () => {
      const paymentData = {
        user: user._id,
        course: course._id,
        amount: 99.99,
        paymentMethod: 'stripe'
      };

      const payment = await Payment.create(paymentData);
      expect(payment.status).toBe('pending');
    });

    it('should default currency to USD', async () => {
      const paymentData = {
        user: user._id,
        course: course._id,
        amount: 99.99,
        paymentMethod: 'stripe'
      };

      const payment = await Payment.create(paymentData);
      expect(payment.currency).toBe('USD');
    });
  });

  describe('Field Constraints', () => {
    it('should enforce valid currency values', async () => {
      const paymentData = {
        user: user._id,
        course: course._id,
        amount: 99.99,
        paymentMethod: 'stripe',
        currency: 'INVALID'
      };

      await expect(Payment.create(paymentData)).rejects.toThrow();
    });

    it('should enforce valid paymentMethod values', async () => {
      const paymentData = {
        user: user._id,
        course: course._id,
        amount: 99.99,
        paymentMethod: 'invalid-method'
      };

      await expect(Payment.create(paymentData)).rejects.toThrow();
    });

    it('should enforce valid status values', async () => {
      const paymentData = {
        user: user._id,
        course: course._id,
        amount: 99.99,
        paymentMethod: 'stripe',
        status: 'invalid-status'
      };

      await expect(Payment.create(paymentData)).rejects.toThrow();
    });

    it('should enforce minimum amount of 0', async () => {
      const paymentData = {
        user: user._id,
        course: course._id,
        amount: -10,
        paymentMethod: 'stripe'
      };

      await expect(Payment.create(paymentData)).rejects.toThrow();
    });
  });

  describe('Optional Fields', () => {
    it('should allow payment with transactionId', async () => {
      const paymentData = {
        user: user._id,
        course: course._id,
        amount: 99.99,
        paymentMethod: 'stripe',
        transactionId: 'txn_123456789'
      };

      const payment = await Payment.create(paymentData);
      expect(payment.transactionId).toBe(paymentData.transactionId);
    });

    it('should allow payment with invoice data', async () => {
      const paymentData = {
        user: user._id,
        course: course._id,
        amount: 99.99,
        paymentMethod: 'stripe',
        invoice: {
          invoiceNumber: 'INV-001',
          invoiceUrl: '/uploads/invoices/inv-001.pdf'
        }
      };

      const payment = await Payment.create(paymentData);
      expect(payment.invoice.invoiceNumber).toBe('INV-001');
    });

    it('should allow refund data', async () => {
      const paymentData = {
        user: user._id,
        course: course._id,
        amount: 99.99,
        paymentMethod: 'stripe',
        status: 'refunded',
        refundReason: 'Customer request',
        refundedAmount: 50.00
      };

      const payment = await Payment.create(paymentData);
      expect(payment.refundReason).toBe('Customer request');
      expect(payment.refundedAmount).toBe(50.00);
    });
  });

  describe('Multiple Currency Support', () => {
    it('should accept USD currency', async () => {
      const payment = await Payment.create({
        user: user._id,
        course: course._id,
        amount: 99.99,
        paymentMethod: 'stripe',
        currency: 'USD'
      });

      expect(payment.currency).toBe('USD');
    });

    it('should accept EUR currency', async () => {
      const payment = await Payment.create({
        user: user._id,
        course: course._id,
        amount: 89.99,
        paymentMethod: 'stripe',
        currency: 'EUR'
      });

      expect(payment.currency).toBe('EUR');
    });

    it('should accept EGP currency', async () => {
      const payment = await Payment.create({
        user: user._id,
        course: course._id,
        amount: 1500,
        paymentMethod: 'fawry',
        currency: 'EGP'
      });

      expect(payment.currency).toBe('EGP');
    });
  });
});
