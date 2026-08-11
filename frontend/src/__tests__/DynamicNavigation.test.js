import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import Footer from '../components/Footer';

jest.mock('../contexts/LanguageContext', () => ({ useLanguage: () => ({ language: 'en' }) }));

describe('Dynamic footer navigation', () => {
  it('renders published footer pages returned by the API', async () => {
    axios.get.mockResolvedValueOnce({ data: { data: [{ _id: '1', slug: 'privacy', title: { en: 'Privacy' } }] } });
    render(<MemoryRouter><Footer /></MemoryRouter>);
    await waitFor(() => expect(screen.getByRole('link', { name: 'Privacy' })).toHaveAttribute('href', '/privacy'));
  });

  it('continues rendering core links when the API fails', async () => {
    axios.get.mockRejectedValueOnce(new Error('offline'));
    render(<MemoryRouter><Footer /></MemoryRouter>);
    await waitFor(() => expect(screen.getByRole('link', { name: /services/i })).toBeInTheDocument());
  });
});
