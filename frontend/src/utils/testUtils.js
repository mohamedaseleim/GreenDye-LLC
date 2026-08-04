import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2e7d32',
    },
    secondary: {
      main: '#ff9800',
    },
  },
});

// Mock AuthContext
const MockAuthProvider = ({ children, value = {} }) => {
  const defaultValue = {
    user: null,
    loading: false,
    login: jest.fn(),
    logout: jest.fn(),
    register: jest.fn(),
    ...value
  };
  
  return <div data-testid="auth-provider">{children}</div>;
};

// Mock LanguageContext
const MockLanguageProvider = ({ children, value = {} }) => {
  const defaultValue = {
    language: 'en',
    changeLanguage: jest.fn(),
    t: (key) => key,
    ...value
  };
  
  return <div data-testid="language-provider">{children}</div>;
};

const AllTheProviders = ({ children, authValue, languageValue }) => {
  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <MockAuthProvider value={authValue}>
          <MockLanguageProvider value={languageValue}>
            {children}
          </MockLanguageProvider>
        </MockAuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

const customRender = (ui, options = {}) =>
  render(ui, { 
    wrapper: (props) => <AllTheProviders {...props} {...options} />, 
    ...options 
  });

// re-export everything
export * from '@testing-library/react';

// override render method
export { customRender as render };
