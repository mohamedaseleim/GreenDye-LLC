import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Grid,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import { useParams, useSearchParams } from 'react-router-dom';
import { Search, Person, Verified, School } from '@mui/icons-material';
import axios from 'axios';

const VerifyTrainer = () => {
  const { trainerId: urlTrainerId } = useParams();
  const [searchParams] = useSearchParams();
  const qrTrainerId = searchParams.get('id');
  
  const [trainerId, setTrainerId] = useState(urlTrainerId || qrTrainerId || '');
  const [trainer, setTrainer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verified, setVerified] = useState(null);

  // Auto-verify if trainer ID is provided in URL or query params
  useEffect(() => {
    if (urlTrainerId || qrTrainerId) {
      handleVerify();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlTrainerId, qrTrainerId]);

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    
    if (!trainerId.trim()) {
      setError('Please enter a trainer ID');
      return;
    }

    setLoading(true);
    setError('');
    setTrainer(null);
    setVerified(null);

    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/verify/trainer/${trainerId}`
      );
      
      setTrainer(response.data.data);
      setVerified(response.data.verified);
      
      if (!response.data.verified) {
        setError(response.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Trainer not found or verification failed');
      setVerified(false);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
      case 'verified':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getTitle = (title) => {
    if (typeof title === 'object' && title !== null) {
      return title.en || title.ar || title.fr || 'Professional Trainer';
    }
    return title || 'Professional Trainer';
  };

  const getBio = (bio) => {
    if (typeof bio === 'object' && bio !== null) {
      return bio.en || bio.ar || bio.fr || '';
    }
    return bio || '';
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Typography variant="h3" gutterBottom align="center">
          Trainer Verification
        </Typography>
        <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
          Enter a Trainer ID or scan a QR code to verify a trainer's credentials
        </Typography>

        {/* Search Form */}
        <Box component="form" onSubmit={handleVerify} sx={{ mb: 4 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={9}>
              <TextField
                fullWidth
                label="Trainer ID"
                placeholder="e.g., TR-ABC123"
                value={trainerId}
                onChange={(e) => setTrainerId(e.target.value)}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <Button
                fullWidth
                variant="contained"
                type="submit"
                disabled={loading}
                sx={{ height: '56px' }}
                startIcon={loading ? <CircularProgress size={20} /> : <Search />}
              >
                Verify
              </Button>
            </Grid>
          </Grid>
        </Box>

        {/* Error Message */}
        {error && verified === false && (
          <Alert severity={trainer ? 'warning' : 'error'} sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Trainer Details */}
        {trainer && (
          <Card elevation={3}>
            <CardContent>
              {/* Header with Status */}
              <Box sx={{ mb: 3, textAlign: 'center' }}>
                <Avatar
                  sx={{
                    width: 100,
                    height: 100,
                    mx: 'auto',
                    mb: 2,
                    bgcolor: 'primary.main',
                    fontSize: '3rem',
                  }}
                >
                  {trainer.verificationStatus === 'approved' ? (
                    <Verified sx={{ fontSize: 60 }} />
                  ) : (
                    <Person sx={{ fontSize: 60 }} />
                  )}
                </Avatar>
                <Chip
                  label={trainer.verificationStatus || 'Unknown'}
                  color={getStatusColor(trainer.verificationStatus)}
                  size="large"
                  sx={{ fontSize: '1.1rem', py: 2, px: 3 }}
                />
              </Box>

              <Divider sx={{ my: 3 }} />

              <Grid container spacing={3}>
                {/* Trainer ID */}
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Trainer ID
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {trainer.trainerId || 'N/A'}
                  </Typography>
                </Grid>

                {/* Full Name */}
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Full Name
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {trainer.fullName || 'N/A'}
                  </Typography>
                </Grid>

                {/* Title */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Professional Title
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {getTitle(trainer.title)}
                  </Typography>
                </Grid>

                {/* Bio */}
                {getBio(trainer.bio) && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Biography
                    </Typography>
                    <Typography variant="body1" paragraph>
                      {getBio(trainer.bio)}
                    </Typography>
                  </Grid>
                )}

                {/* Expertise */}
                {trainer.expertise && trainer.expertise.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Areas of Expertise
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {trainer.expertise.map((exp, index) => (
                        <Chip key={index} label={exp} color="primary" variant="outlined" />
                      ))}
                    </Box>
                  </Grid>
                )}

                {/* Experience */}
                {trainer.experience && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Years of Experience
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {trainer.experience} years
                    </Typography>
                  </Grid>
                )}

                {/* Verification Date */}
                {trainer.verificationDate && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Verified On
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {new Date(trainer.verificationDate).toLocaleDateString()}
                    </Typography>
                  </Grid>
                )}

                {/* Qualifications */}
                {trainer.qualifications && trainer.qualifications.length > 0 && (
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <School color="primary" />
                      <Typography variant="subtitle1" fontWeight="medium">
                        Qualifications
                      </Typography>
                    </Box>
                    <List>
                      {trainer.qualifications.map((qual, index) => (
                        <ListItem key={index} sx={{ py: 1 }}>
                          <ListItemText
                            primary={qual.degree || qual.name}
                            secondary={`${qual.institution || qual.organization} ${
                              qual.year ? `(${qual.year})` : ''
                            }`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Grid>
                )}

                {/* Certifications */}
                {trainer.certifications && trainer.certifications.length > 0 && (
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Verified color="primary" />
                      <Typography variant="subtitle1" fontWeight="medium">
                        Certifications
                      </Typography>
                    </Box>
                    <List>
                      {trainer.certifications.map((cert, index) => (
                        <ListItem key={index} sx={{ py: 1 }}>
                          <ListItemText
                            primary={cert.name}
                            secondary={`${cert.organization} ${
                              cert.year ? `(${cert.year})` : ''
                            }`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Grid>
                )}

                {/* Languages */}
                {trainer.languages && trainer.languages.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Languages
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {trainer.languages.map((lang, index) => (
                        <Chip
                          key={index}
                          label={
                            typeof lang === 'object'
                              ? `${lang.language} (${lang.proficiency})`
                              : lang
                          }
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </Grid>
                )}
              </Grid>

              {/* Verification Badge */}
              {verified && trainer.verificationStatus === 'approved' && (
                <Box
                  sx={{
                    mt: 4,
                    p: 2,
                    bgcolor: 'success.light',
                    borderRadius: 1,
                    textAlign: 'center',
                  }}
                >
                  <Verified sx={{ color: 'success.dark', fontSize: 40, mb: 1 }} />
                  <Typography variant="h6" color="success.dark">
                    Verified Trainer
                  </Typography>
                  <Typography variant="body2" color="success.dark">
                    This trainer has been verified and approved by GreenDye Academy
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        )}
      </Box>
    </Container>
  );
};

export default VerifyTrainer;
