import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import axios from 'axios';

// Mock axios
jest.mock('axios');

// Mock contexts
jest.mock('../contexts/AuthContext', () => ({
  useAuth: jest.fn()
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key
  })
}));

const { useAuth } = require('../contexts/AuthContext');

describe('Dashboard Component - Trainer Dashboard Link', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders Dashboard component for student users without trainer link', async () => {
    // Mock student user
    useAuth.mockReturnValue({
      user: { role: 'student', name: 'Student User', email: 'student@test.com' },
      isAuthenticated: true
    });

    // Mock API response
    axios.get.mockResolvedValue({
      data: { data: [] }
    });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Welcome back/i)).toBeInTheDocument();
    });

    // Trainer dashboard alert should NOT be visible for students
    expect(screen.queryByText(/You have access to the Trainer Dashboard/i)).not.toBeInTheDocument();
  });

  it('renders Dashboard component for trainer users with trainer link', async () => {
    // Mock trainer user
    useAuth.mockReturnValue({
      user: { role: 'trainer', name: 'Trainer User', email: 'trainer@test.com' },
      isAuthenticated: true
    });

    // Mock API response
    axios.get.mockResolvedValue({
      data: { data: [] }
    });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Welcome back/i)).toBeInTheDocument();
    });

    // Trainer dashboard alert SHOULD be visible for trainers
    expect(screen.getByText(/You have access to the Trainer Dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/Manage your courses, view student progress, and track your earnings./i)).toBeInTheDocument();
    
    // Button should be present
    expect(screen.getByRole('button', { name: /Go to Trainer Dashboard/i })).toBeInTheDocument();
  });

  it('renders Dashboard component for admin users without trainer link', async () => {
    // Mock admin user (not trainer)
    useAuth.mockReturnValue({
      user: { role: 'admin', name: 'Admin User', email: 'admin@test.com' },
      isAuthenticated: true
    });

    // Mock API response
    axios.get.mockResolvedValue({
      data: { data: [] }
    });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Welcome back/i)).toBeInTheDocument();
    });

    // Trainer dashboard alert should NOT be visible for non-trainer admins
    expect(screen.queryByText(/You have access to the Trainer Dashboard/i)).not.toBeInTheDocument();
  });
});
