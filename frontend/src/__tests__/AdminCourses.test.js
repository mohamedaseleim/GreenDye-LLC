import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AdminCourses from '../pages/AdminCourses';
import adminService from '../services/adminService';
import { toast } from 'react-toastify';

// Mock contexts
jest.mock('../contexts/AuthContext', () => ({
  useAuth: jest.fn()
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn()
}));

// Mock services
jest.mock('../services/adminService');
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

// Mock courseUtils
jest.mock('../utils/courseUtils', () => ({
  COURSE_CATEGORIES: [
    { value: 'programming', label: 'Programming' },
    { value: 'design', label: 'Design' }
  ],
  getCourseTitle: (course) => course.title?.en || 'Untitled',
  getApprovalStatusColor: (status) => 'default'
}));

const { useAuth } = require('../contexts/AuthContext');
const { useNavigate } = require('react-router-dom');

describe('AdminCourses Component - Create Course Functionality', () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock admin user
    useAuth.mockReturnValue({
      user: { role: 'admin', name: 'Admin User' },
      isAuthenticated: true
    });

    // Mock navigate
    useNavigate.mockReturnValue(mockNavigate);

    // Mock API responses
    adminService.getAdminCourses.mockResolvedValue({
      data: [],
      total: 0
    });

    adminService.getCourseStatistics.mockResolvedValue({
      data: {
        overview: {
          total: 0,
          published: 0,
          pendingApproval: 0
        },
        totalEnrollments: 0
      }
    });

    adminService.getCourseCategories.mockResolvedValue({
      data: []
    });

    adminService.getCourseTags.mockResolvedValue({
      data: []
    });
  });

  it('renders AdminCourses component with Add Course button', async () => {
    render(
      <BrowserRouter>
        <AdminCourses />
      </BrowserRouter>
    );

    // Wait for initial data to load
    await waitFor(() => {
      expect(screen.getByText('Course Management')).toBeInTheDocument();
    });

    // Check for Add Course button
    const addButton = screen.getByRole('button', { name: /add course/i });
    expect(addButton).toBeInTheDocument();
  });

  it('opens Create Course dialog when Add Course button is clicked', async () => {
    render(
      <BrowserRouter>
        <AdminCourses />
      </BrowserRouter>
    );

    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText('Course Management')).toBeInTheDocument();
    });

    // Click Add Course button
    const addButton = screen.getByRole('button', { name: /add course/i });
    fireEvent.click(addButton);

    // Check if dialog opens
    await waitFor(() => {
      expect(screen.getByText('Create New Course')).toBeInTheDocument();
    });

    // Check for form fields
    expect(screen.getByLabelText(/title \(english\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/title \(arabic\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description \(english\)/i)).toBeInTheDocument();
  });

  it('creates a course when form is submitted with valid data', async () => {
    adminService.createAdminCourse.mockResolvedValue({
      success: true,
      data: { _id: '123', title: { en: 'Test Course' } }
    });

    render(
      <BrowserRouter>
        <AdminCourses />
      </BrowserRouter>
    );

    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText('Course Management')).toBeInTheDocument();
    });

    // Open dialog
    const addButton = screen.getByRole('button', { name: /add course/i });
    fireEvent.click(addButton);

    // Wait for dialog to open
    await waitFor(() => {
      expect(screen.getByText('Create New Course')).toBeInTheDocument();
    });

    // Fill in form fields
    const titleInput = screen.getByLabelText(/title \(english\)/i);
    fireEvent.change(titleInput, { target: { value: 'Test Course' } });

    const descInput = screen.getByLabelText(/description \(english\)/i);
    fireEvent.change(descInput, { target: { value: 'Test Description' } });

    // Submit form
    const createButton = screen.getByRole('button', { name: /create course/i });
    fireEvent.click(createButton);

    // Check if API was called
    await waitFor(() => {
      expect(adminService.createAdminCourse).toHaveBeenCalledWith(
        expect.objectContaining({
          title: expect.objectContaining({
            en: 'Test Course'
          }),
          description: expect.objectContaining({
            en: 'Test Description'
          })
        })
      );
    });

    // Check if success toast was shown
    expect(toast.success).toHaveBeenCalledWith('Course created successfully');
  });

  it('closes Create Course dialog when Cancel button is clicked', async () => {
    render(
      <BrowserRouter>
        <AdminCourses />
      </BrowserRouter>
    );

    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText('Course Management')).toBeInTheDocument();
    });

    // Open dialog
    const addButton = screen.getByRole('button', { name: /add course/i });
    fireEvent.click(addButton);

    // Wait for dialog to open
    await waitFor(() => {
      expect(screen.getByText('Create New Course')).toBeInTheDocument();
    });

    // Click Cancel button
    const cancelButtons = screen.getAllByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButtons[cancelButtons.length - 1]); // Get the last cancel button (from create dialog)

    // Dialog should close
    await waitFor(() => {
      expect(screen.queryByText('Create New Course')).not.toBeInTheDocument();
    });
  });

  it('shows error toast when course creation fails', async () => {
    adminService.createAdminCourse.mockRejectedValue(new Error('Failed to create'));

    render(
      <BrowserRouter>
        <AdminCourses />
      </BrowserRouter>
    );

    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText('Course Management')).toBeInTheDocument();
    });

    // Open dialog
    const addButton = screen.getByRole('button', { name: /add course/i });
    fireEvent.click(addButton);

    // Wait for dialog to open
    await waitFor(() => {
      expect(screen.getByText('Create New Course')).toBeInTheDocument();
    });

    // Fill in minimal form data
    const titleInput = screen.getByLabelText(/title \(english\)/i);
    fireEvent.change(titleInput, { target: { value: 'Test Course' } });

    // Submit form
    const createButton = screen.getByRole('button', { name: /create course/i });
    fireEvent.click(createButton);

    // Check if error toast was shown
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to create course');
    });
  });

  it('redirects trainer to trainer dashboard after successful course creation', async () => {
    // Mock trainer user
    useAuth.mockReturnValue({
      user: { role: 'trainer', name: 'Trainer User' },
      isAuthenticated: true
    });

    adminService.createAdminCourse.mockResolvedValue({
      success: true,
      data: { _id: '123', title: { en: 'Test Course' } }
    });

    adminService.getAllTrainers.mockResolvedValue({
      data: []
    });

    render(
      <BrowserRouter>
        <AdminCourses />
      </BrowserRouter>
    );

    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText('Course Management')).toBeInTheDocument();
    });

    // Open dialog
    const addButton = screen.getByRole('button', { name: /add course/i });
    fireEvent.click(addButton);

    // Wait for dialog to open
    await waitFor(() => {
      expect(screen.getByText('Create New Course')).toBeInTheDocument();
    });

    // Fill in form fields
    const titleInput = screen.getByLabelText(/title \(english\)/i);
    fireEvent.change(titleInput, { target: { value: 'Test Course' } });

    const descInput = screen.getByLabelText(/description \(english\)/i);
    fireEvent.change(descInput, { target: { value: 'Test Description' } });

    // Submit form
    const createButton = screen.getByRole('button', { name: /create course/i });
    fireEvent.click(createButton);

    // Check if navigate was called with trainer dashboard route
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/trainer/dashboard');
    });

    // Check if success toast was shown
    expect(toast.success).toHaveBeenCalledWith('Course created successfully');
  });

  it('does not redirect admin after successful course creation', async () => {
    // Keep admin user (from beforeEach)
    adminService.createAdminCourse.mockResolvedValue({
      success: true,
      data: { _id: '123', title: { en: 'Test Course' } }
    });

    render(
      <BrowserRouter>
        <AdminCourses />
      </BrowserRouter>
    );

    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText('Course Management')).toBeInTheDocument();
    });

    // Open dialog
    const addButton = screen.getByRole('button', { name: /add course/i });
    fireEvent.click(addButton);

    // Wait for dialog to open
    await waitFor(() => {
      expect(screen.getByText('Create New Course')).toBeInTheDocument();
    });

    // Fill in form fields
    const titleInput = screen.getByLabelText(/title \(english\)/i);
    fireEvent.change(titleInput, { target: { value: 'Test Course' } });

    const descInput = screen.getByLabelText(/description \(english\)/i);
    fireEvent.change(descInput, { target: { value: 'Test Description' } });

    // Submit form
    const createButton = screen.getByRole('button', { name: /create course/i });
    fireEvent.click(createButton);

    // Wait for API call to complete
    await waitFor(() => {
      expect(adminService.createAdminCourse).toHaveBeenCalled();
    });

    // Check that navigate was NOT called for admin
    expect(mockNavigate).not.toHaveBeenCalledWith('/trainer/dashboard');

    // Check if success toast was shown
    expect(toast.success).toHaveBeenCalledWith('Course created successfully');
  });
});
