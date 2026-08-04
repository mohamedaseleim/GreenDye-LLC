import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import axios from 'axios';
import VerifyTrainer from '../pages/VerifyTrainer';

// Mock axios
jest.mock('axios');

const mockTrainerData = {
  trainerId: 'TR-TEST123',
  fullName: 'John Doe',
  verificationStatus: 'Approved',
  title: { en: 'Senior Trainer' },
  bio: { en: 'Experienced professional trainer' },
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
  verificationDate: '2023-01-01T00:00:00.000Z'
  // Note: No admin-only fields (rating, coursesCount, studentsCount, accreditations, commissionRate)
};

describe('VerifyTrainer Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <VerifyTrainer />
      </MemoryRouter>
    );
    expect(screen.getByText('Trainer Verification')).toBeInTheDocument();
  });

  it('displays trainer information without admin-only fields', async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        success: true,
        verified: true,
        message: 'Trainer is verified and active',
        data: mockTrainerData
      }
    });

    render(
      <MemoryRouter initialEntries={['/verify/trainer/TR-TEST123']}>
        <Routes>
          <Route path="/verify/trainer/:trainerId" element={<VerifyTrainer />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('TR-TEST123')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Senior Trainer')).toBeInTheDocument();
      expect(screen.getByText('10 years')).toBeInTheDocument();
    });

    // Verify public fields are displayed
    expect(screen.getByText('Professional Title')).toBeInTheDocument();
    expect(screen.getByText('Areas of Expertise')).toBeInTheDocument();
    expect(screen.getByText('Years of Experience')).toBeInTheDocument();
    expect(screen.getByText('Qualifications')).toBeInTheDocument();
    expect(screen.getByText('Certifications')).toBeInTheDocument();
    expect(screen.getByText('Languages')).toBeInTheDocument();

    // Verify admin-only fields are NOT displayed
    expect(screen.queryByText('Rating')).not.toBeInTheDocument();
    expect(screen.queryByText('Courses Taught')).not.toBeInTheDocument();
    expect(screen.queryByText('Students Trained')).not.toBeInTheDocument();
    expect(screen.queryByText('Accreditations')).not.toBeInTheDocument();
  });

  it('allows manual verification by entering trainer ID', async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        success: true,
        verified: true,
        message: 'Trainer is verified and active',
        data: mockTrainerData
      }
    });

    render(
      <MemoryRouter>
        <VerifyTrainer />
      </MemoryRouter>
    );

    // Enter trainer ID
    const input = screen.getByLabelText('Trainer ID');
    fireEvent.change(input, { target: { value: 'TR-TEST123' } });

    // Click verify button
    const verifyButton = screen.getByRole('button', { name: /verify/i });
    fireEvent.click(verifyButton);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('http://localhost:5000/api/verify/trainer/TR-TEST123')
      );
      expect(screen.getByText('TR-TEST123')).toBeInTheDocument();
    });

    // Ensure no admin-only fields are displayed even after manual search
    expect(screen.queryByText('Rating')).not.toBeInTheDocument();
    expect(screen.queryByText(/⭐/)).not.toBeInTheDocument();
    expect(screen.queryByText('Courses Taught')).not.toBeInTheDocument();
    expect(screen.queryByText('Students Trained')).not.toBeInTheDocument();
    expect(screen.queryByText('Accreditations')).not.toBeInTheDocument();
  });

  it('handles trainer not found error', async () => {
    axios.get.mockRejectedValueOnce({
      response: {
        data: {
          message: 'Trainer not found'
        }
      }
    });

    render(
      <MemoryRouter>
        <VerifyTrainer />
      </MemoryRouter>
    );

    const input = screen.getByLabelText('Trainer ID');
    fireEvent.change(input, { target: { value: 'TR-INVALID' } });

    const verifyButton = screen.getByRole('button', { name: /verify/i });
    fireEvent.click(verifyButton);

    await waitFor(() => {
      expect(screen.getByText(/Trainer not found/i)).toBeInTheDocument();
    });
  });

  it('handles unverified trainer status', async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        success: true,
        verified: false,
        message: 'Trainer is not verified',
        data: {
          trainerId: 'TR-TEST123',
          fullName: 'John Doe',
          verificationStatus: 'Pending',
          isVerified: false,
          isActive: true
        }
      }
    });

    render(
      <MemoryRouter>
        <VerifyTrainer />
      </MemoryRouter>
    );

    const input = screen.getByLabelText('Trainer ID');
    fireEvent.change(input, { target: { value: 'TR-TEST123' } });

    const verifyButton = screen.getByRole('button', { name: /verify/i });
    fireEvent.click(verifyButton);

    await waitFor(() => {
      expect(screen.getByText(/Trainer is not verified/i)).toBeInTheDocument();
    });
  });

  it('does not render admin-only fields even if accidentally included in API response', async () => {
    // Simulate a case where the API accidentally includes admin-only fields
    const dataWithAdminFields = {
      ...mockTrainerData,
      rating: 4.8,
      coursesCount: 15,
      studentsCount: 250,
      accreditations: [
        {
          organization: 'Test Body',
          accreditationNumber: 'ACC-123'
        }
      ],
      commissionRate: 25
    };

    axios.get.mockResolvedValueOnce({
      data: {
        success: true,
        verified: true,
        message: 'Trainer is verified and active',
        data: dataWithAdminFields
      }
    });

    render(
      <MemoryRouter initialEntries={['/verify/trainer/TR-TEST123']}>
        <Routes>
          <Route path="/verify/trainer/:trainerId" element={<VerifyTrainer />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('TR-TEST123')).toBeInTheDocument();
    });

    // Even if the backend sends these fields, frontend should not display them
    expect(screen.queryByText('Rating')).not.toBeInTheDocument();
    expect(screen.queryByText('4.8')).not.toBeInTheDocument();
    expect(screen.queryByText('Courses Taught')).not.toBeInTheDocument();
    expect(screen.queryByText('15 Courses')).not.toBeInTheDocument();
    expect(screen.queryByText('Students Trained')).not.toBeInTheDocument();
    expect(screen.queryByText('250 Students')).not.toBeInTheDocument();
    expect(screen.queryByText('Accreditations')).not.toBeInTheDocument();
    expect(screen.queryByText('ACC-123')).not.toBeInTheDocument();
  });
});
