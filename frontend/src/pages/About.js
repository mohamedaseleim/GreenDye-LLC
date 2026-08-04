import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Grid, Card, CardContent, Paper, CircularProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { renderIcon, getCurrentLang } from '../utils/contentHelpers';

const About = () => {
  const { i18n } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState(null);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/admin/content-settings/public`);
      setContent(response.data.data);
    } catch (error) {
      console.error('Error fetching content:', error);
      // Fall back to default content if fetch fails
      setContent({
        aboutPage: {
          mission: {
            en: 'GreenDye Academy is committed to democratizing education by providing accessible, high-quality training and qualification programs to students and professionals across Africa, Asia, and the Middle East, with a primary focus on Egypt. We believe that education is a fundamental right and a powerful tool for personal and professional growth.',
            ar: 'تلتزم أكاديمية GreenDye بإضفاء الطابع الديمقراطي على التعليم من خلال توفير برامج تدريب وتأهيل عالية الجودة وسهلة المنال للطلاب والمهنيين في جميع أنحاء أفريقيا وآسيا والشرق الأوسط، مع التركيز الأساسي على مصر.',
            fr: 'GreenDye Academy s\'engage à démocratiser l\'éducation en fournissant des programmes de formation et de qualification accessibles et de haute qualité aux étudiants et professionnels à travers l\'Afrique, l\'Asie et le Moyen-Orient, avec un accent particulier sur l\'Égypte.',
          },
          vision: {
            en: 'To become the leading e-learning platform in the region, recognized for quality education, verified certifications, and excellent learning experiences. We envision a world where anyone, anywhere, can access world-class education and develop the skills they need to succeed in the modern economy.',
            ar: 'أن تصبح منصة التعليم الإلكتروني الرائدة في المنطقة، المعترف بها من أجل التعليم الجيد والشهادات الموثقة وتجارب التعلم الممتازة.',
            fr: 'Devenir la plateforme d\'apprentissage en ligne leader dans la région, reconnue pour son éducation de qualité, ses certifications vérifiées et ses excellentes expériences d\'apprentissage.',
          },
          features: [
            { icon: 'School', title: 'Quality Education', description: 'We provide world-class courses from expert trainers across multiple disciplines and industries.' },
            { icon: 'Verified', title: 'Verified Certificates', description: 'Earn verified certificates upon course completion with unique IDs and QR codes for authentication.' },
            { icon: 'Language', title: 'Multi-Language', description: 'Learn in your preferred language with full support for Arabic, English, and French.' },
            { icon: 'People', title: 'Expert Trainers', description: 'Learn from verified and accredited trainers with proven industry experience and qualifications.' },
            { icon: 'TrendingUp', title: 'Career Growth', description: 'Advance your career with practical skills and industry-recognized certifications.' },
            { icon: 'Security', title: 'Secure Platform', description: 'Your data is protected with industry-standard security measures and encryption.' },
          ],
        },
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  const currentLang = getCurrentLang(i18n);
  const mission = content?.aboutPage?.mission?.[currentLang] || '';
  const vision = content?.aboutPage?.vision?.[currentLang] || '';
  const features = content?.aboutPage?.features || [];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: 8,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h2" component="h1" gutterBottom>
            About GreenDye Academy
          </Typography>
          <Typography variant="h6" sx={{ mt: 2 }}>
            Empowering learners across Africa, Asia, and the Middle East with quality education
          </Typography>
        </Container>
      </Box>

      {/* Mission Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Grid container spacing={6}>
          <Grid item xs={12} md={6}>
            <Typography variant="h4" gutterBottom color="primary">
              Our Mission
            </Typography>
            <Typography variant="body1" paragraph style={{ whiteSpace: 'pre-line' }}>
              {mission}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h4" gutterBottom color="primary">
              Our Vision
            </Typography>
            <Typography variant="body1" paragraph style={{ whiteSpace: 'pre-line' }}>
              {vision}
            </Typography>
          </Grid>
        </Grid>
      </Container>

      {/* Features Section */}
      <Box sx={{ bgcolor: 'grey.50', py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" align="center" gutterBottom sx={{ mb: 6 }}>
            Why Choose Us
          </Typography>
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card sx={{ height: '100%', textAlign: 'center' }}>
                  <CardContent>
                    <Box sx={{ color: 'primary.main', mb: 2 }}>
                      {renderIcon(feature.icon)}
                    </Box>
                    <Typography variant="h6" gutterBottom>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Stats Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Grid container spacing={4} sx={{ textAlign: 'center' }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h3" color="primary" gutterBottom>
                1000+
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Students
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h3" color="primary" gutterBottom>
                100+
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Courses
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h3" color="primary" gutterBottom>
                50+
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Expert Trainers
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h3" color="primary" gutterBottom>
                3
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Languages
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default About;
