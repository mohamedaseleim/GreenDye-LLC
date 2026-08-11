import React, { useEffect, useState } from 'react';
import { Container, Typography, Grid, Paper, Stack, Chip, Alert, CircularProgress } from '@mui/material';
import adminService from '../services/adminService';
export default function AdminPayments() {
  const [items,setItems]=useState([]); const [stats,setStats]=useState(null); const [error,setError]=useState(''); const [loading,setLoading]=useState(true);
  useEffect(()=>{Promise.all([adminService.getAllTransactions(),adminService.getPaymentStats()]).then(([a,b])=>{setItems(a.data||[]);setStats(b.data);}).catch(e=>setError(e.response?.data?.message||e.message)).finally(()=>setLoading(false));},[]);
  return <Container sx={{py:5}}><Typography variant="h3" gutterBottom>المدفوعات الاستشارية</Typography>{error&&<Alert severity="error">{error}</Alert>}{loading?<CircularProgress/>:<><Grid container spacing={2}>{(stats?.invoices||[]).map(x=><Grid item xs={12} md={4} key={x._id}><Paper sx={{p:3}}><Typography>{x._id}</Typography><Typography variant="h5">{x.paid||0} مدفوع</Typography><Typography>{(x.invoiced||0)-(x.paid||0)} مستحق · {x.overdue||0} متأخر</Typography></Paper></Grid>)}</Grid><Stack spacing={2} sx={{mt:3}}>{items.map(x=><Paper key={x._id} sx={{p:3}}><Typography variant="h6">{x.paymentNumber}</Typography><Typography>{x.client?.name||'Client'} · {x.project?.projectNumber||'Project'} · {x.invoice?.invoiceNumber||'Invoice'}</Typography><Stack direction="row" spacing={1} sx={{mt:1}}><Chip label={x.status}/><Chip label={`${x.amount} ${x.currency}`}/><Chip label={x.gateway}/></Stack></Paper>)}</Stack></>}</Container>;
}
