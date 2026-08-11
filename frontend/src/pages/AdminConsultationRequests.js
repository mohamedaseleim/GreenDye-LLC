import { getAccessToken } from '../services/tokenStore';
import React, { useEffect, useState } from 'react';
import apiClient from '../services/apiClient';
import { Container, Typography, Paper, Stack, Chip, Select, MenuItem, Alert } from '@mui/material';
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const config = () => ({ headers: { Authorization: `Bearer ${getAccessToken()}` } });
export default function AdminConsultationRequests() {
  const [items, setItems] = useState([]); const [error, setError] = useState('');
  const load = async () => { try { const r = await apiClient.get(`${BASE_URL}/api/consulting/admin/requests`, config()); setItems(r.data.data || []); } catch (e) { setError(e.response?.data?.message || 'Unable to load requests'); } };
  useEffect(() => { load(); }, []);
  const update = async (id, status) => { await apiClient.put(`${BASE_URL}/api/consulting/admin/requests/${id}/status`, { status }, config()); load(); };
  const statuses = ['submitted','under_review','more_information_required','assigned','proposal_sent','awaiting_client','contracting','active','final_review','completed','rejected','cancelled','on_hold','disputed'];
  return <Container sx={{ py: 5 }}><Typography variant="h3">طلبات الاستشارة</Typography>{error && <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>}<Stack spacing={2} sx={{ mt: 3 }}>{items.map(x => <Paper key={x._id} sx={{ p: 3 }}><Typography variant="h6">{x.title}</Typography><Typography>{x.requestNumber} · {x.client?.name || x.organizationName || 'Client'}</Typography><Typography sx={{ my: 1 }}>{x.challenge}</Typography><Stack direction="row" spacing={2} alignItems="center"><Chip label={x.clientType} /><Select size="small" value={x.status} onChange={e => update(x._id, e.target.value)}>{statuses.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}</Select></Stack></Paper>)}</Stack></Container>;
}
