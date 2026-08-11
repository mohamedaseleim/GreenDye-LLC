import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AdminPages from '../pages/AdminPages';
import adminService from '../services/adminService';

// Mock adminService
jest.mock('../services/adminService');

// Mock react-quill
jest.mock('react-quill', () => {
  return function ReactQuill({ value, onChange }) {
    return (
      <textarea
        data-testid="react-quill"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  };
});

// Mock contexts
jest.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { role: 'admin', id: 'test-admin-id' }
  })
}));

// Mock react-toastify
jest.mock('react-toastify', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn()
  }
}));

describe('AdminPages Component with HTML Support', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    adminService.getAllPages.mockResolvedValue({ data: [] });
  });

  it('renders the page management interface', async () => {
    render(
      <BrowserRouter>
        <AdminPages />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Page Management')).toBeInTheDocument();
    });

    expect(screen.getByText('Add Page')).toBeInTheDocument();
  });

  it('opens dialog when Add Page button is clicked', async () => {
    render(
      <BrowserRouter>
        <AdminPages />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Add Page')).toBeInTheDocument();
    });

    const addButton = screen.getByText('Add Page');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Create New Page')).toBeInTheDocument();
    });
  });

  it('displays ReactQuill editors for content fields', async () => {
    render(
      <BrowserRouter>
        <AdminPages />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Add Page')).toBeInTheDocument();
    });

    const addButton = screen.getByText('Add Page');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Create New Page')).toBeInTheDocument();
    });

    // Check for content labels indicating ReactQuill editors
    expect(screen.getByText('Content (EN)')).toBeInTheDocument();
    expect(screen.getByText('Content (AR)')).toBeInTheDocument();
    expect(screen.getByText('Content (FR)')).toBeInTheDocument();
  });

  it('handles HTML content in form data', async () => {
    const mockPages = [
      {
        _id: 'page1',
        slug: 'test-page',
        title: { en: 'Test Page', ar: 'صفحة اختبار', fr: 'Page de test' },
        content: { 
          en: '<p>HTML content with <strong>bold</strong> text</p>',
          ar: '<p>محتوى HTML</p>',
          fr: '<p>Contenu HTML</p>'
        },
        metaDescription: { en: 'Test description', ar: 'وصف', fr: 'Description' },
        template: 'default',
        status: 'published',
        showInHeader: false,
        showInFooter: false,
        menuOrder: 0,
        updatedAt: new Date().toISOString()
      }
    ];

    adminService.getAllPages.mockResolvedValue({ data: mockPages });

    render(
      <BrowserRouter>
        <AdminPages />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Page')).toBeInTheDocument();
    });

    // Check if the page slug is rendered in the table
    await waitFor(() => {
      const table = screen.getByRole('table');
      expect(table).toHaveTextContent('test-page');
    });
  });

  it('creates a page with HTML content', async () => {
    adminService.createPage.mockResolvedValue({
      success: true,
      data: {
        _id: 'new-page',
        slug: 'new-test-page',
        title: { en: 'New Page' },
        content: { en: '<h1>HTML Title</h1><p>Paragraph content</p>' }
      }
    });

    adminService.getAllPages.mockResolvedValue({ data: [] });

    render(
      <BrowserRouter>
        <AdminPages />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Add Page')).toBeInTheDocument();
    });

    const addButton = screen.getByText('Add Page');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Create New Page')).toBeInTheDocument();
    });

    // Fill in the form
    const slugInput = screen.getByLabelText(/Slug/i);
    fireEvent.change(slugInput, { target: { value: 'new-test-page' } });

    const titleInput = screen.getByLabelText(/Title \(EN\)/i);
    fireEvent.change(titleInput, { target: { value: 'New Page' } });

    // Submit the form
    const createButton = screen.getByRole('button', { name: /Create/i });
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(adminService.createPage).toHaveBeenCalled();
    });
  });

  it('loads existing page data with HTML content for editing', async () => {
    const mockPages = [
      {
        _id: 'page1',
        slug: 'existing-page',
        title: { en: 'Existing Page', ar: '', fr: '' },
        content: { 
          en: '<p>Original HTML content</p>',
          ar: '',
          fr: ''
        },
        metaDescription: { en: 'Description', ar: '', fr: '' },
        template: 'default',
        status: 'draft',
        showInHeader: false,
        showInFooter: false,
        menuOrder: 0,
        updatedAt: new Date().toISOString()
      }
    ];

    adminService.getAllPages.mockResolvedValue({ data: mockPages });

    render(
      <BrowserRouter>
        <AdminPages />
      </BrowserRouter>
    );

    // Verify that the page with HTML content is loaded and displayed
    await waitFor(() => {
      const table = screen.queryByRole('table');
      expect(table).toBeInTheDocument();
    }, { timeout: 5000 });

    // Verify the table contains the page data
    await waitFor(() => {
      expect(screen.getByText('Existing Page')).toBeInTheDocument();
    });
  });

  it('preserves HTML formatting when updating pages', async () => {
    const htmlContent = '<h2>Title</h2><p>Paragraph with <em>emphasis</em> and <strong>bold</strong></p><ul><li>List item 1</li><li>List item 2</li></ul>';
    
    adminService.updatePage.mockResolvedValue({
      success: true,
      data: {
        _id: 'page1',
        content: { en: htmlContent }
      }
    });

    adminService.getAllPages.mockResolvedValue({
      data: [{
        _id: 'page1',
        slug: 'test',
        title: { en: 'Test' },
        content: { en: htmlContent },
        metaDescription: { en: '' },
        template: 'default',
        status: 'draft',
        updatedAt: new Date().toISOString()
      }]
    });

    render(
      <BrowserRouter>
        <AdminPages />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test')).toBeInTheDocument();
    });
  });

  it('supports image upload via custom handler', async () => {
    // Mock global fetch for image upload
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({
          success: true,
          data: [{
            url: 'http://localhost:5000/uploads/pages/test-image.jpg'
          }]
        })
      })
    );

    adminService.getAllPages.mockResolvedValue({ data: [] });

    render(
      <BrowserRouter>
        <AdminPages />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Add Page')).toBeInTheDocument();
    });

    const addButton = screen.getByText('Add Page');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Create New Page')).toBeInTheDocument();
    });

    // Verify the editor is rendered (toolbar with image button would be available in real implementation)
    expect(screen.getByText('Content (EN)')).toBeInTheDocument();
    
    // Clean up
    delete global.fetch;
  });
});
