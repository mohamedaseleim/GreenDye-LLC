import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function TrainerRoute({ children }) {
  const { user } = useAuth() || {};
  if (!user) return <Navigate to="/login" replace />;
  const role = user?.role;
  if (role === 'trainer' || role === 'admin') return children;
  return <Navigate to="/dashboard" replace />;
}
