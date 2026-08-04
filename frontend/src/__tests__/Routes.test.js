import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../App';

// Mock contexts
jest.mock('../contexts/AuthContext', () => ({
  AuthProvider: ({ children }) => <div>{children}</div>,
  useAuth: () => ({
    user: null,
    loading: false,
    login: jest.fn(),
    logout: jest.fn(),
    register: jest.fn()
  })
}));

jest.mock('../contexts/LanguageContext', () => ({
  LanguageProvider: ({ children }) => <div>{children}</div>,
  useLanguage: () => ({
    language: 'en',
    changeLanguage: jest.fn(),
    t: (key) => key
  })
}));

jest.mock('../contexts/CurrencyContext', () => ({
  CurrencyProvider: ({ children }) => <div>{children}</div>,
  useCurrency: () => ({
    currency: 'USD',
    changeCurrency: jest.fn(),
    formatPrice: (price) => `$${price}`
  })
}));

// Mock analytics service
jest.mock('../services/analyticsService', () => ({
  trackPageView: jest.fn()
}));

// Mock axios
jest.mock('axios');

describe('Verification Routes', () => {
  it('renders VerifyCertificate page at /verify/certificate', () => {
    window.history.pushState({}, '', '/verify/certificate');
    render(<App />);
    // The page should render without 404
    expect(screen.getByText('Certificate Verification')).toBeInTheDocument();
  });

  it('renders VerifyCertificate page at /verify/certificate/:id', () => {
    window.history.pushState({}, '', '/verify/certificate/CERT-123');
    render(<App />);
    // The page should render without 404
    expect(screen.getByText('Certificate Verification')).toBeInTheDocument();
  });

  it('renders VerifyTrainer page at /verify/trainer', () => {
    window.history.pushState({}, '', '/verify/trainer');
    render(<App />);
    // The page should render without 404
    expect(screen.getByText('Trainer Verification')).toBeInTheDocument();
  });

  it('renders VerifyTrainer page at /verify/trainer/:id', () => {
    window.history.pushState({}, '', '/verify/trainer/TR-123');
    render(<App />);
    // The page should render without 404
    expect(screen.getByText('Trainer Verification')).toBeInTheDocument();
  });

  it('renders NotFound page for invalid routes', () => {
    window.history.pushState({}, '', '/invalid-route');
    render(<App />);
    // Should render 404 page
    expect(screen.queryByText('Certificate Verification')).not.toBeInTheDocument();
    expect(screen.queryByText('Trainer Verification')).not.toBeInTheDocument();
  });
});
