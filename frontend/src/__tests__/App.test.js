import React from 'react';
import { render } from '@testing-library/react';
import App from '../App';
jest.mock('../components/Footer', () => () => <footer>Footer</footer>);
jest.mock('../components/AnnouncementBanner', () => () => null);

jest.mock('../contexts/AuthContext', () => ({
  AuthProvider: ({ children }) => <>{children}</>,
  useAuth: () => ({ user: null, loading: false, isAuthenticated: false, logout: jest.fn() }),
}));
jest.mock('../contexts/LanguageContext', () => ({
  LanguageProvider: ({ children }) => <>{children}</>,
  useLanguage: () => ({ language: 'en', direction: 'ltr', isRTL: false, locale: 'en-US', changeLanguage: jest.fn() }),
}));
jest.mock('../contexts/CurrencyContext', () => ({ CurrencyProvider: ({ children }) => <>{children}</> }));

describe('App', () => {
  it('renders the consulting application shell', () => {
    const { container } = render(<App />);
    expect(container).toBeInTheDocument();
    expect(document.body).toBeInTheDocument();
  });
});
