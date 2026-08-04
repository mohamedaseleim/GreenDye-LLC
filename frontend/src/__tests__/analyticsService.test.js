import axios from 'axios';
import { trackEvent, trackPageView, trackVideoProgress, trackQuizEvent } from '../services/analyticsService';

jest.mock('axios');

describe('analyticsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('trackEvent', () => {
    it('should not make API call when user is not authenticated', async () => {
      // No token in localStorage
      await trackEvent('test_event', { some: 'data' });

      expect(axios.post).not.toHaveBeenCalled();
    });

    it('should make API call when user is authenticated', async () => {
      localStorage.setItem('token', 'test-token');
      axios.post.mockResolvedValue({ data: { success: true } });

      await trackEvent('test_event', { some: 'data' });

      expect(axios.post).toHaveBeenCalledWith('http://localhost:5000/api/analytics/track', {
        eventType: 'test_event',
        some: 'data'
      });
    });

    it('should handle API errors gracefully', async () => {
      localStorage.setItem('token', 'test-token');
      const consoleError = jest.spyOn(console, 'error').mockImplementation();
      axios.post.mockRejectedValue(new Error('API Error'));

      await trackEvent('test_event', { some: 'data' });

      expect(consoleError).toHaveBeenCalledWith('Error tracking event:', expect.any(Error));
      consoleError.mockRestore();
    });
  });

  describe('trackPageView', () => {
    it('should not track page view when user is not authenticated', async () => {
      await trackPageView('/test-page', 'user123', 'course123');

      expect(axios.post).not.toHaveBeenCalled();
    });

    it('should track page view when user is authenticated', async () => {
      localStorage.setItem('token', 'test-token');
      axios.post.mockResolvedValue({ data: { success: true } });

      await trackPageView('/test-page', 'user123', 'course123');

      expect(axios.post).toHaveBeenCalledWith('http://localhost:5000/api/analytics/track', {
        eventType: 'page_view',
        page: '/test-page',
        userId: 'user123',
        courseId: 'course123'
      });
    });
  });

  describe('trackVideoProgress', () => {
    it('should not track video progress when user is not authenticated', async () => {
      await trackVideoProgress('course123', 'lesson123', 'user123', 50);

      expect(axios.post).not.toHaveBeenCalled();
    });

    it('should track video progress when user is authenticated', async () => {
      localStorage.setItem('token', 'test-token');
      axios.post.mockResolvedValue({ data: { success: true } });

      await trackVideoProgress('course123', 'lesson123', 'user123', 75);

      expect(axios.post).toHaveBeenCalledWith('http://localhost:5000/api/analytics/track', {
        eventType: 'video_progress',
        courseId: 'course123',
        lessonId: 'lesson123',
        userId: 'user123',
        metadata: { progressPercentage: 75 }
      });
    });
  });

  describe('trackQuizEvent', () => {
    it('should not track quiz event when user is not authenticated', async () => {
      await trackQuizEvent('quiz_complete', 'course123', 'lesson123', 'user123', { score: 90 });

      expect(axios.post).not.toHaveBeenCalled();
    });

    it('should track quiz event when user is authenticated', async () => {
      localStorage.setItem('token', 'test-token');
      axios.post.mockResolvedValue({ data: { success: true } });

      await trackQuizEvent('quiz_complete', 'course123', 'lesson123', 'user123', { score: 85 });

      expect(axios.post).toHaveBeenCalledWith('http://localhost:5000/api/analytics/track', {
        eventType: 'quiz_complete',
        courseId: 'course123',
        lessonId: 'lesson123',
        userId: 'user123',
        metadata: { score: 85 }
      });
    });
  });
});
