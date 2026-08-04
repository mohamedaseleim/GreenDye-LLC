import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';

// Mock contexts
jest.mock('../contexts/AuthContext', () => ({
  useAuth: jest.fn()
}));

jest.mock('../contexts/LanguageContext', () => ({
  useLanguage: jest.fn()
}));

jest.mock('../contexts/CurrencyContext', () => ({
  useCurrency: jest.fn()
}));

jest.mock('react-i18next', () => ({
  useTranslation: jest.fn()
}));

// Mock axios
jest.mock('axios');

const { useAuth } = require('../contexts/AuthContext');
const { useLanguage } = require('../contexts/LanguageContext');
const { useCurrency } = require('../contexts/CurrencyContext');
const { useTranslation } = require('react-i18next');

describe('Dynamic Navigation - Header and Footer', () => {
  const mockPages = [
    {
      _id: '1',
      slug: 'terms-of-service',
      title: {
        en: 'Terms of Service',
        ar: 'شروط الخدمة',
        fr: 'Conditions de service'
      },
      showInHeader: true,
      showInFooter: true,
      menuOrder: 1
    },
    {
      _id: '2',
      slug: 'privacy-policy',
      title: {
        en: 'Privacy Policy',
        ar: 'سياسة الخصوصية',
        fr: 'Politique de confidentialité'
      },
      showInHeader: false,
      showInFooter: true,
      menuOrder: 2
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock contexts
    useAuth.mockReturnValue({
      user: null,
      logout: jest.fn(),
      isAuthenticated: false
    });

    useLanguage.mockReturnValue({
      language: 'en',
      changeLanguage: jest.fn()
    });

    useCurrency.mockReturnValue({
      currency: 'USD',
      changeCurrency: jest.fn()
    });

    useTranslation.mockReturnValue({
      t: (key) => key,
      i18n: { language: 'en' }
    });
  });

  describe('Header Component', () => {
    it('should fetch and display dynamic pages in header', async () => {
      // Mock API response for header pages
      axios.get.mockResolvedValueOnce({
        data: {
          success: true,
          data: mockPages.filter(p => p.showInHeader)
        }
      });

      render(
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      );

      // Wait for API call
      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith('http://localhost:5000/api/pages', {
          params: { location: 'header' }
        });
      });

      // Check that dynamic page appears
      await waitFor(() => {
        expect(screen.getByText('Terms of Service')).toBeInTheDocument();
      });
    });

    it('should handle API errors gracefully', async () => {
      // Mock API error
      axios.get.mockRejectedValueOnce(new Error('Network error'));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      render(
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Error fetching pages:',
          expect.any(Error)
        );
      });

      consoleSpy.mockRestore();
    });

    it('should display page title in correct language', async () => {
      useLanguage.mockReturnValue({
        language: 'ar',
        changeLanguage: jest.fn()
      });

      axios.get.mockResolvedValueOnce({
        data: {
          success: true,
          data: mockPages.filter(p => p.showInHeader)
        }
      });

      render(
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('شروط الخدمة')).toBeInTheDocument();
      });
    });
  });

  describe('Footer Component', () => {
    it('should fetch and display dynamic pages in footer', async () => {
      // Mock API response for footer pages
      axios.get.mockResolvedValueOnce({
        data: {
          success: true,
          data: mockPages.filter(p => p.showInFooter)
        }
      });

      render(
        <BrowserRouter>
          <Footer />
        </BrowserRouter>
      );

      // Wait for API call
      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith('http://localhost:5000/api/pages', {
          params: { location: 'footer' }
        });
      });

      // Check that both dynamic pages appear (both have showInFooter: true)
      await waitFor(() => {
        expect(screen.getByText('Terms of Service')).toBeInTheDocument();
        expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
      });
    });

    it('should handle empty pages array', async () => {
      axios.get.mockResolvedValueOnce({
        data: {
          success: true,
          data: []
        }
      });

      render(
        <BrowserRouter>
          <Footer />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(axios.get).toHaveBeenCalled();
      });

      // Should still render static links
      expect(screen.getByText('courses')).toBeInTheDocument();
    });
  });
});
