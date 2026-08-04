import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import QuizBuilder from '../components/QuizBuilder';

describe('QuizBuilder Component', () => {
  const mockOnClose = jest.fn();
  const mockOnSave = jest.fn();
  const courseId = 'test-course-id';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the quiz builder dialog', () => {
    render(
      <QuizBuilder
        open={true}
        onClose={mockOnClose}
        courseId={courseId}
        onSave={mockOnSave}
      />
    );

    expect(screen.getByText('Create New Quiz')).toBeInTheDocument();
  });

  it('should show edit mode when quiz is provided', () => {
    const quiz = {
      _id: 'quiz-1',
      title: { en: 'Test Quiz' },
      questions: [],
      passingScore: 70,
    };

    render(
      <QuizBuilder
        open={true}
        onClose={mockOnClose}
        quiz={quiz}
        courseId={courseId}
        onSave={mockOnSave}
      />
    );

    expect(screen.getByText('Edit Quiz')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Quiz')).toBeInTheDocument();
  });

  it('should display add question button', () => {
    render(
      <QuizBuilder
        open={true}
        onClose={mockOnClose}
        courseId={courseId}
        onSave={mockOnSave}
      />
    );

    expect(screen.getByText('Add Question')).toBeInTheDocument();
  });

  it('should add a new question when add button is clicked', () => {
    render(
      <QuizBuilder
        open={true}
        onClose={mockOnClose}
        courseId={courseId}
        onSave={mockOnSave}
      />
    );

    const addButton = screen.getByText('Add Question');
    fireEvent.click(addButton);

    expect(screen.getByText('Question 1')).toBeInTheDocument();
  });

  it('should close dialog when cancel button is clicked', () => {
    render(
      <QuizBuilder
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

  it('should display quiz configuration options', () => {
    render(
      <QuizBuilder
        open={true}
        onClose={mockOnClose}
        courseId={courseId}
        onSave={mockOnSave}
      />
    );

    expect(screen.getByLabelText('Passing Score (%)')).toBeInTheDocument();
    expect(screen.getByLabelText('Time Limit (minutes)')).toBeInTheDocument();
    expect(screen.getByLabelText('Attempts Allowed')).toBeInTheDocument();
    expect(screen.getByLabelText('Shuffle Questions')).toBeInTheDocument();
    expect(screen.getByLabelText('Shuffle Options')).toBeInTheDocument();
  });
});
