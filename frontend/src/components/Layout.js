import React from 'react';
import { Box } from '@mui/material';
import Header from './Header';
import Footer from './Footer';
import AnnouncementBanner from './AnnouncementBanner';
import { useAuth } from '../contexts/AuthContext';

const Layout = ({ children }) => {
  const { user } = useAuth();
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <AnnouncementBanner userRole={user?.role || 'all'} />
      <Box component="main" sx={{ flexGrow: 1, py: 3 }}>
        {children}
      </Box>
      <Footer />
    </Box>
  );
};

export default Layout;
