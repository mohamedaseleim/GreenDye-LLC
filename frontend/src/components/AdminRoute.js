import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function AdminRoute({ children }) {
  const { user } = useAuth() || {};
  if (!user) return <Navigate to="/login" replace />;
  const role = user?.role;
  if (role === 'admin' || role === 'trainer') return children;
  return <Navigate to="/dashboard" replace />;
}
