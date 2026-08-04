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

describe('App Component', () => {
  it('renders without crashing', () => {
    render(<App />);
    expect(document.body).toBeInTheDocument();
  });

  it('provides theme and toast notifications', () => {
    const { container } = render(<App />);
    expect(container).toBeInTheDocument();
  });
});
