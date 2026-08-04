import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Footer from '../components/Footer';

// Mock LanguageContext to avoid initializing real i18n
jest.mock('../contexts/LanguageContext', () => ({
  useLanguage: () => ({
    language: 'en',
    changeLanguage: jest.fn()
  })
}));

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => {
      const translations = {
        courses: 'Courses',
        about: 'About',
        contact: 'Contact',
        verifyCertificate: 'Verify Certificate',
        verifyTrainer: 'Verify Trainer',
        footerText: '© 2024 GreenDye Academy. All rights reserved.'
      };
      return translations[key] || key;
    }
  })
}));

describe('Footer Component', () => {
  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );
    expect(screen.getByText('GreenDye Academy')).toBeInTheDocument();
  });

  it('renders Quick Links section', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );
    expect(screen.getByText('Quick Links')).toBeInTheDocument();
  });

  it('renders all Quick Links with correct router links', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );
    
    const coursesLink = screen.getByText('Courses');
    const aboutLink = screen.getByText('About');
    const contactLink = screen.getByText('Contact');
    
    expect(coursesLink).toBeInTheDocument();
    expect(aboutLink).toBeInTheDocument();
    expect(contactLink).toBeInTheDocument();
    
    // Verify React Router has correctly set the href attributes for client-side navigation
    expect(coursesLink.closest('a')).toHaveAttribute('href', '/courses');
    expect(aboutLink.closest('a')).toHaveAttribute('href', '/about');
    expect(contactLink.closest('a')).toHaveAttribute('href', '/contact');
  });

  it('renders Verification section', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );
    expect(screen.getByText('Verification')).toBeInTheDocument();
  });

  it('renders verification links with correct router links', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );
    
    const verifyCertLink = screen.getByText('Verify Certificate');
    const verifyTrainerLink = screen.getByText('Verify Trainer');
    
    expect(verifyCertLink).toBeInTheDocument();
    expect(verifyTrainerLink).toBeInTheDocument();
    
    // Verify React Router has correctly set the href attributes for client-side navigation
    expect(verifyCertLink.closest('a')).toHaveAttribute('href', '/verify/certificate');
    expect(verifyTrainerLink.closest('a')).toHaveAttribute('href', '/verify/trainer');
  });

  it('renders footer text', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );
    expect(screen.getByText('© 2024 GreenDye Academy. All rights reserved.')).toBeInTheDocument();
  });
});
