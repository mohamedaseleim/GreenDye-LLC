import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import axios from 'axios';
import DynamicPage from '../pages/DynamicPage';

// Mock axios
jest.mock('axios');

// Mock contexts
jest.mock('../contexts/LanguageContext', () => ({
  useLanguage: () => ({
    language: 'en',
    changeLanguage: jest.fn(),
    isRTL: false
  })
}));

// Mock react-toastify
jest.mock('react-toastify', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn()
  }
}));

describe('DynamicPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    axios.get.mockImplementation(() => new Promise(() => {})); // Never resolves
    
    render(
      <MemoryRouter initialEntries={['/test-page']}>
        <Routes>
          <Route path="/:slug" element={<DynamicPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/loading page/i)).toBeInTheDocument();
  });

  it('renders page content when data is fetched successfully', async () => {
    const mockPage = {
      slug: 'test-page',
      title: { en: 'Test Page' },
      content: { en: '<p>Test content</p>' },
      metaDescription: { en: 'Test description' },
      template: 'default',
      status: 'published'
    };

    axios.get.mockResolvedValueOnce({
      data: {
        success: true,
        data: mockPage
      }
    });

    render(
      <MemoryRouter initialEntries={['/test-page']}>
        <Routes>
          <Route path="/:slug" element={<DynamicPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Page')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText(/test content/i)).toBeInTheDocument();
    });
  });

  it('renders 404 when page is not found', async () => {
    axios.get.mockRejectedValueOnce({
      response: {
        status: 404,
        data: {
          success: false,
          message: 'Page not found'
        }
      }
    });

    render(
      <MemoryRouter initialEntries={['/non-existent']}>
        <Routes>
          <Route path="/:slug" element={<DynamicPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/page not found/i)).toBeInTheDocument();
    });
  });

  it('uses correct API endpoint with slug', async () => {
    const mockPage = {
      slug: 'about-us',
      title: { en: 'About Us' },
      content: { en: '<p>About content</p>' },
      template: 'about',
      status: 'published'
    };

    axios.get.mockResolvedValueOnce({
      data: {
        success: true,
        data: mockPage
      }
    });

    render(
      <MemoryRouter initialEntries={['/about-us']}>
        <Routes>
          <Route path="/:slug" element={<DynamicPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('http://localhost:5000/api/pages/about-us');
    });
  });

  it('renders hero template correctly', async () => {
    const mockPage = {
      slug: 'hero-page',
      title: { en: 'Hero Page' },
      content: { en: '<p>Hero content</p>' },
      metaDescription: { en: 'Hero description' },
      template: 'hero',
      status: 'published'
    };

    axios.get.mockResolvedValueOnce({
      data: {
        success: true,
        data: mockPage
      }
    });

    render(
      <MemoryRouter initialEntries={['/hero-page']}>
        <Routes>
          <Route path="/:slug" element={<DynamicPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Hero Page')).toBeInTheDocument();
    });
  });

  it('falls back to English when content not available in current language', async () => {
    const mockPage = {
      slug: 'test-page',
      title: { en: 'Test Page', ar: 'صفحة اختبار' },
      content: { en: '<p>English content</p>' },
      template: 'default',
      status: 'published'
    };

    axios.get.mockResolvedValueOnce({
      data: {
        success: true,
        data: mockPage
      }
    });

    render(
      <MemoryRouter initialEntries={['/test-page']}>
        <Routes>
          <Route path="/:slug" element={<DynamicPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Page')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText(/english content/i)).toBeInTheDocument();
    });
  });
});
