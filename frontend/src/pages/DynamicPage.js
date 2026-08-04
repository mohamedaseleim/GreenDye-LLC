import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  CircularProgress,
  Paper
} from '@mui/material';
import { useLanguage } from '../contexts/LanguageContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const DynamicPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  useEffect(() => {
    // Update document title and meta tags when page data is loaded
    if (page) {
      const title = getContent(page.title);
      const metaDescription = getContent(page.metaDescription);
      
      document.title = `${title} - GreenDye Academy`;
      
      // Update meta description
      let metaDescTag = document.querySelector('meta[name="description"]');
      if (!metaDescTag) {
        metaDescTag = document.createElement('meta');
        metaDescTag.setAttribute('name', 'description');
        document.head.appendChild(metaDescTag);
      }
      if (metaDescription) {
        metaDescTag.setAttribute('content', metaDescription);
      }
      
      // Update meta keywords
      if (page.metaKeywords && page.metaKeywords.length > 0) {
        let metaKeywordsTag = document.querySelector('meta[name="keywords"]');
        if (!metaKeywordsTag) {
          metaKeywordsTag = document.createElement('meta');
          metaKeywordsTag.setAttribute('name', 'keywords');
          document.head.appendChild(metaKeywordsTag);
        }
        metaKeywordsTag.setAttribute('content', page.metaKeywords.join(', '));
      }
    }
    
    // Cleanup: reset title when component unmounts
    return () => {
      document.title = 'GreenDye Academy';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, language]);

  const fetchPage = async () => {
    try {
      setLoading(true);
      setError(false);
      const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/pages/${slug}`);
      
      if (response.data.success) {
        setPage(response.data.data);
      } else {
        setError(true);
      }
    } catch (err) {
      console.error('Error fetching page:', err);
      setError(true);
      
      // Only show toast for non-404 errors
      if (err.response?.status !== 404) {
        toast.error('Failed to load page');
      }
    } finally {
      setLoading(false);
    }
  };

  // Get content in current language, fallback to English
  const getContent = (field) => {
    if (!page || !field) return '';
    return field[language] || field.en || '';
  };

  const renderTemplateContent = () => {
    const title = getContent(page.title);
    const content = getContent(page.content);
    const metaDescription = getContent(page.metaDescription);

    switch (page.template) {
      case 'hero':
        return (
          <Box>
            <Box
              sx={{
                background: 'linear-gradient(135deg, #2e7d32 0%, #60ad5e 100%)',
                color: 'white',
                py: 8,
                px: 3,
                textAlign: 'center',
                borderRadius: 2,
                mb: 4
              }}
            >
              <Typography variant="h2" component="h1" gutterBottom>
                {title}
              </Typography>
              {metaDescription && (
                <Typography variant="h5" sx={{ opacity: 0.9 }}>
                  {metaDescription}
                </Typography>
              )}
            </Box>
            <Box dangerouslySetInnerHTML={{ __html: content }} />
          </Box>
        );

      case 'about':
        return (
          <Box>
            <Typography variant="h3" component="h1" gutterBottom color="primary">
              {title}
            </Typography>
            <Box sx={{ mt: 3 }} dangerouslySetInnerHTML={{ __html: content }} />
          </Box>
        );

      case 'contact':
        return (
          <Paper elevation={3} sx={{ p: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom color="primary">
              {title}
            </Typography>
            <Box sx={{ mt: 3 }} dangerouslySetInnerHTML={{ __html: content }} />
          </Paper>
        );

      case 'faq':
        return (
          <Box>
            <Typography variant="h3" component="h1" gutterBottom color="primary">
              {title}
            </Typography>
            <Box sx={{ mt: 3 }} dangerouslySetInnerHTML={{ __html: content }} />
          </Box>
        );

      case 'terms':
      case 'privacy':
        return (
          <Paper elevation={1} sx={{ p: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              {title}
            </Typography>
            <Box 
              sx={{ 
                mt: 3,
                '& h1, & h2, & h3': { mt: 3, mb: 2, color: 'primary.main' },
                '& p': { mb: 2, lineHeight: 1.7 },
                '& ul, & ol': { mb: 2, pl: 3 }
              }} 
              dangerouslySetInnerHTML={{ __html: content }} 
            />
          </Paper>
        );

      case 'default':
      default:
        return (
          <Box>
            <Typography variant="h3" component="h1" gutterBottom color="primary">
              {title}
            </Typography>
            <Box 
              sx={{ 
                mt: 3,
                '& h1, & h2, & h3': { mt: 3, mb: 2 },
                '& p': { mb: 2, lineHeight: 1.7 },
                '& ul, & ol': { mb: 2, pl: 3 },
                '& img': { maxWidth: '100%', height: 'auto' }
              }} 
              dangerouslySetInnerHTML={{ __html: content }} 
            />
          </Box>
        );
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Loading page...
        </Typography>
      </Container>
    );
  }

  if (error || !page) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Page Not Found
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          The page you are looking for does not exist or has been removed.
        </Typography>
        <Box>
          <button 
            onClick={() => navigate('/')}
            style={{
              padding: '10px 20px',
              backgroundColor: '#2e7d32',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Go to Home
          </button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {renderTemplateContent()}
    </Container>
  );
};

export default DynamicPage;
