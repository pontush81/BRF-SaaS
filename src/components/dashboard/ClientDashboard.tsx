'use client';

import { useEffect } from 'react';
import AuthDebug from '../auth/AuthDebug';
import { useAuth } from '@/contexts/AuthContext';

export default function ClientDashboard() {
  const { user, isLoading } = useAuth();
  
  // Log auth state for debugging
  useEffect(() => {
    console.log('ClientDashboard auth state:', { 
      isAuthenticated: !!user, 
      isLoading, 
      userEmail: user?.email 
    });
  }, [user, isLoading]);
  
  return (
    <>
      <AuthDebug />
    </>
  );
} 