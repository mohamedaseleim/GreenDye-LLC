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
  Chip
} from '@mui/material';
import { useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const VerifyCertificate = () => {
  const { certificateId: urlCertificateId } = useParams();
  const [searchParams] = useSearchParams();
  const qrCertificateId = searchParams.get('id');
  
  const [certificateId, setCertificateId] = useState(urlCertificateId || qrCertificateId || '');
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verified, setVerified] = useState(null);

  // Auto-verify if certificate ID is provided in URL or query params
  useEffect(() => {
    if (urlCertificateId || qrCertificateId) {
      handleVerify();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlCertificateId, qrCertificateId]);

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    
    if (!certificateId.trim()) {
      setError('Please enter a certificate ID');
      return;
    }

    setLoading(true);
    setError('');
    setCertificate(null);
    setVerified(null);

    try {
      // Get verification token from URL query parameters if available
      const token = searchParams.get('t');
      
      // Build the verification URL with token if present
      let verificationUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/verify/certificate/${certificateId}`;
      if (token) {
        verificationUrl += `?t=${token}`;
      }
      
      const response = await axios.get(verificationUrl);
      
      setCertificate(response.data.data);
      setVerified(response.data.verified);
      
      if (!response.data.verified) {
        setError(response.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Certificate not found or verification failed');
      setVerified(false);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'valid':
        return 'success';
      case 'revoked':
        return 'error';
      case 'invalid':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getCourseTitle = (courseTitle) => {
    if (typeof courseTitle === 'object' && courseTitle !== null) {
      return courseTitle.en || courseTitle.ar || courseTitle.fr || 'N/A';
    }
    return courseTitle || 'N/A';
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Typography variant="h3" gutterBottom align="center">
          Certificate Verification
        </Typography>
        <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
          Enter a Certificate ID or scan a QR code to verify a certificate
        </Typography>

        {/* Search Form */}
        <Box component="form" onSubmit={handleVerify} sx={{ mb: 4 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={9}>
              <TextField
                fullWidth
                label="Certificate ID"
                placeholder="e.g., CERT-ABC123"
                value={certificateId}
                onChange={(e) => setCertificateId(e.target.value)}
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
              >
                {loading ? <CircularProgress size={24} /> : 'Verify'}
              </Button>
            </Grid>
          </Grid>
        </Box>

        {/* Error Message */}
        {error && verified === false && (
          <Alert severity={certificate ? 'warning' : 'error'} sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Certificate Details */}
        {certificate && (
          <Card elevation={3}>
            <CardContent>
              <Box sx={{ mb: 3, textAlign: 'center' }}>
                <Chip 
                  label={certificate.status || 'Unknown'} 
                  color={getStatusColor(certificate.status)}
                  size="large"
                  sx={{ fontSize: '1.1rem', py: 2, px: 3 }}
                />
              </Box>

              <Grid container spacing={3}>
                {/* Certificate ID */}
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Certificate ID
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {certificate.certificateId || 'N/A'}
                  </Typography>
                </Grid>

                {/* Trainee Name */}
                {certificate.traineeName && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Trainee Name
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {certificate.traineeName}
                    </Typography>
                  </Grid>
                )}

                {/* Course Title */}
                {certificate.courseTitle && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Course Title
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {getCourseTitle(certificate.courseTitle)}
                    </Typography>
                  </Grid>
                )}

                {/* Certificate Level */}
                {certificate.certificateLevel && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Certificate Level
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {certificate.certificateLevel}
                    </Typography>
                  </Grid>
                )}

                {/* Grade */}
                {certificate.grade && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Grade
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {certificate.grade}
                    </Typography>
                  </Grid>
                )}

                {/* Score */}
                {certificate.score != null && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Score
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {certificate.score}%
                    </Typography>
                  </Grid>
                )}

                {/* Status */}
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Status
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {certificate.status || 'N/A'}
                  </Typography>
                </Grid>

                {/* Tutor Name */}
                {certificate.tutorName && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Tutor Name
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {certificate.tutorName}
                    </Typography>
                  </Grid>
                )}

                {/* Scheme */}
                {certificate.scheme && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Scheme
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {certificate.scheme}
                    </Typography>
                  </Grid>
                )}

                {/* Held On */}
                {certificate.heldOn && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Held On
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {formatDate(certificate.heldOn)}
                    </Typography>
                  </Grid>
                )}

                {/* Duration */}
                {certificate.duration && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Duration
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {certificate.duration} hours
                    </Typography>
                  </Grid>
                )}

                {/* Held in */}
                {certificate.heldIn && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Held in
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {certificate.heldIn}
                    </Typography>
                  </Grid>
                )}

                {/* Completion Date */}
                {certificate.completionDate && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Completion Date
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {formatDate(certificate.completionDate)}
                    </Typography>
                  </Grid>
                )}

                {/* Issue Date */}
                {certificate.issueDate && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Issue Date
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {formatDate(certificate.issueDate)}
                    </Typography>
                  </Grid>
                )}

                {/* Expiry Date */}
                {certificate.expiryDate && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Expiry Date
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {formatDate(certificate.expiryDate)}
                    </Typography>
                  </Grid>
                )}

                {/* Issued By */}
                {certificate.issuedBy && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Issued by
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {certificate.issuedBy}
                    </Typography>
                  </Grid>
                )}

                {/* Revoked Information */}
                {certificate.isRevoked && (
                  <>
                    <Grid item xs={12}>
                      <Alert severity="error">
                        This certificate has been revoked
                        {certificate.revokedDate && ` on ${formatDate(certificate.revokedDate)}`}
                        {certificate.revokedReason && `. Reason: ${certificate.revokedReason}`}
                      </Alert>
                    </Grid>
                  </>
                )}
              </Grid>

              {/* QR Code Display */}
              {certificate.qrCode && verified && (
                <Box sx={{ mt: 3, textAlign: 'center' }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Certificate QR Code
                  </Typography>
                  <img 
                    src={certificate.qrCode} 
                    alt="Certificate QR Code" 
                    style={{ maxWidth: '200px', height: 'auto' }}
                  />
                </Box>
              )}
            </CardContent>
          </Card>
        )}
      </Box>
    </Container>
  );
};

export default VerifyCertificate;
