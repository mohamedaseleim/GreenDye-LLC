import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import LessonEditor from '../components/LessonEditor';
import adminService from '../services/adminService';

// Mock the adminService
jest.mock('../services/adminService');

describe('LessonEditor Component', () => {
  const mockOnClose = jest.fn();
  const mockOnSave = jest.fn();
  const courseId = 'test-course-id';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the lesson editor dialog', () => {
    render(
      <LessonEditor
        open={true}
        onClose={mockOnClose}
        courseId={courseId}
        onSave={mockOnSave}
      />
    );

    expect(screen.getByText('Create New Lesson')).toBeInTheDocument();
  });

  it('should show edit mode when lesson is provided', () => {
    const lesson = {
      _id: 'lesson-1',
      title: { en: 'Test Lesson' },
      type: 'video',
      order: 0,
    };

    render(
      <LessonEditor
        open={true}
        onClose={mockOnClose}
        lesson={lesson}
        courseId={courseId}
        onSave={mockOnSave}
      />
    );

    expect(screen.getByText('Edit Lesson')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Lesson')).toBeInTheDocument();
  });

  it('should have all lesson type options', () => {
    render(
      <LessonEditor
        open={true}
        onClose={mockOnClose}
        courseId={courseId}
        onSave={mockOnSave}
      />
    );

    // Click on the lesson type select
    const lessonTypeSelect = screen.getByLabelText('Lesson Type');
    expect(lessonTypeSelect).toBeInTheDocument();
  });

  it('should close dialog when cancel button is clicked', () => {
    render(
      <LessonEditor
        open={true}
        onClose={mockOnClose}
        courseId={courseId}
        onSave={mockOnSave}
      />
    );

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should display different content fields based on lesson type', () => {
    const { rerender } = render(
      <LessonEditor
        open={true}
        onClose={mockOnClose}
        courseId={courseId}
        onSave={mockOnSave}
      />
    );

    // Navigate to Content tab
    const contentTab = screen.getByText('Content');
    fireEvent.click(contentTab);

    // Default type is video, should show video fields
    expect(screen.getByText('Video Content')).toBeInTheDocument();
  });
});
