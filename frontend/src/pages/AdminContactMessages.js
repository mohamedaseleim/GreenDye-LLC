import { getAccessToken } from '../services/tokenStore';
import React, { useEffect, useState } from 'react';
import apiClient from '../services/apiClient';
import { Container, Typography, Paper, Stack, Chip, Button, Alert, CircularProgress } from '@mui/material';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const headers = () => ({ headers: { Authorization: `Bearer ${getAccessToken()}` } });

export default function AdminContactMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const load = async () => {
    try { const response = await apiClient.get(`${BASE_URL}/api/contact`, headers()); setMessages(response.data.data || []); }
    catch (e) { setError(e.response?.data?.message || 'Unable to load contact messages'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);
  const resolve = async (id) => { await apiClient.put(`${BASE_URL}/api/contact/${id}`, { status: 'resolved' }, headers()); load(); };
  return <Container sx={{ py: 5 }}><Typography variant="h3" gutterBottom>رسائل التواصل</Typography>
    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
    {loading ? <CircularProgress /> : <Stack spacing={2}>{messages.map(item => <Paper key={item._id} sx={{ p: 3 }}>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2}>
        <div><Typography variant="h6">{item.subject}</Typography><Typography>{item.name} · {item.email}</Typography><Typography sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>{item.message}</Typography></div>
        <Stack alignItems="flex-start" spacing={1}><Chip label={item.status} color={item.status === 'resolved' ? 'success' : 'warning'} />{item.status !== 'resolved' && <Button variant="contained" onClick={() => resolve(item._id)}>تحديد كمحلولة</Button>}</Stack>
      </Stack></Paper>)}</Stack>}
  </Container>;
}
