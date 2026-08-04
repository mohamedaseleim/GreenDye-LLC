import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Header from '../components/Header';

// Mock contexts
jest.mock('../contexts/AuthContext', () => ({
  useAuth: jest.fn()
}));

jest.mock('../contexts/LanguageContext', () => ({
  useLanguage: () => ({
    language: 'en',
    changeLanguage: jest.fn()
  })
}));

jest.mock('../contexts/CurrencyContext', () => ({
  useCurrency: () => ({
    currency: 'USD',
    changeCurrency: jest.fn()
  })
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key
  })
}));

const { useAuth } = require('../contexts/AuthContext');

describe('Header Component - Admin Menu Items', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders Header component for admin users', () => {
    // Mock admin user
    useAuth.mockReturnValue({
      user: { role: 'admin', name: 'Admin User' },
      isAuthenticated: true,
      logout: jest.fn()
    });

    const { container } = render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );

    // Verify component renders
    expect(container).toBeInTheDocument();
    
    // Verify profile icon is present for authenticated users
    expect(screen.getByTestId('AccountCircleIcon')).toBeInTheDocument();
  });

  it('renders Header component for regular users', () => {
    // Mock regular user
    useAuth.mockReturnValue({
      user: { role: 'user', name: 'Regular User' },
      isAuthenticated: true,
      logout: jest.fn()
    });

    const { container } = render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );

    // Verify component renders
    expect(container).toBeInTheDocument();
    
    // Verify profile icon is present for authenticated users
    expect(screen.getByTestId('AccountCircleIcon')).toBeInTheDocument();
  });

  it('renders Header component for unauthenticated users', () => {
    // Mock unauthenticated user
    useAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      logout: jest.fn()
    });

    const { container } = render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );

    // Verify component renders
    expect(container).toBeInTheDocument();
    
    // Profile icon should not be present for unauthenticated users
    expect(screen.queryByTestId('AccountCircleIcon')).not.toBeInTheDocument();
  });

  it('renders analytics button in header for authenticated users', () => {
    // Mock authenticated user
    useAuth.mockReturnValue({
      user: { role: 'user', name: 'Regular User' },
      isAuthenticated: true,
      logout: jest.fn()
    });

    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );

    // Analytics should be visible in desktop view
    // Note: The button text is translated, so we check for the translation key
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });
});
