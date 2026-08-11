import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const theme = createTheme({ palette: { primary: { main: '#2e7d32' }, secondary: { main: '#ff9800' } } });

const AllProviders = ({ children, initialEntries = ['/'] }) => (
  <MemoryRouter initialEntries={initialEntries}>
    <ThemeProvider theme={theme}>{children}</ThemeProvider>
  </MemoryRouter>
);

const customRender = (ui, { initialEntries, ...options } = {}) => render(ui, {
  wrapper: props => <AllProviders {...props} initialEntries={initialEntries} />,
  ...options,
});

export * from '@testing-library/react';
export { customRender as render };
