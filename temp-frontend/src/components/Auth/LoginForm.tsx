import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { UnifiedAuth } from './UnifiedAuth';

export const LoginForm: React.FC = () => {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login, register } = useAuth();

  const handlePatientAuth = async (credentials: any) => {
    setError('');
    setIsLoading(true);

    try {
      if (credentials.role) {
        // This is registration
        await register(credentials);
      } else {
        // This is login
        await login(credentials);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'An error occurred');
      throw err; // Re-throw to let UnifiedAuth handle it
    } finally {
      setIsLoading(false);
    }
  };

  const handleDoctorAuth = async (credentials: any) => {
    setError('');
    setIsLoading(true);

    try {
      if (credentials.role) {
        // This is registration - redirect to doctor portal after registration
        await register(credentials);
        // After successful registration, redirect to doctor portal
        window.location.href = 'http://localhost:5176';
      } else {
        // This is login - redirect to doctor portal after login
        await login(credentials);
        // After successful login, redirect to doctor portal
        window.location.href = 'http://localhost:5176';
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'An error occurred');
      throw err; // Re-throw to let UnifiedAuth handle it
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <UnifiedAuth
      onPatientAuth={handlePatientAuth}
      onDoctorAuth={handleDoctorAuth}
      isLoading={isLoading}
      error={error}
    />
  );
};
