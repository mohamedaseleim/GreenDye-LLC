import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { hasRole } from '../utils/roles';

export default function TrainerRoute({ children }) {
  const { user } = useAuth() || {};
  if (!user) return <Navigate to="/login" replace />;
  return hasRole(user, 'trainer', 'admin', 'super_admin')
    ? children
    : <Navigate to="/dashboard" replace />;
}
