import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function AdminRoute({ children }) {
  const { user } = useAuth() || {};
  if (!user) return <Navigate to="/login" replace />;
  const roles = [user?.role, ...(user?.roles || [])].filter(Boolean);
  if (roles.includes('admin') || roles.includes('super_admin')) return children;
  return <Navigate to="/dashboard" replace />;
}
