import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Header from '../components/Header';

const mockAuth = jest.fn();
jest.mock('../contexts/AuthContext', () => ({ useAuth: () => mockAuth() }));
jest.mock('../contexts/LanguageContext', () => ({ useLanguage: () => ({ language: 'en', changeLanguage: jest.fn() }) }));

describe('Header role navigation', () => {
  it('links administrators to the administration dashboard', () => {
    mockAuth.mockReturnValue({ isAuthenticated: true, user: { role: 'super_admin' }, logout: jest.fn() });
    render(<MemoryRouter><Header /></MemoryRouter>);
    expect(screen.getByRole('link', { name: /dashboard/i })).toHaveAttribute('href', '/admin/dashboard');
  });

  it('shows login for anonymous visitors', () => {
    mockAuth.mockReturnValue({ isAuthenticated: false, user: null, logout: jest.fn() });
    render(<MemoryRouter><Header /></MemoryRouter>);
    expect(screen.getByRole('link', { name: /login/i })).toHaveAttribute('href', '/login');
  });
});
