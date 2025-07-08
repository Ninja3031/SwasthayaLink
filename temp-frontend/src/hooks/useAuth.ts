import { useState, useEffect, useCallback } from 'react';
import { authService, type LoginCredentials, type RegisterData, type AuthResponse } from '../services';

interface User {
  id: string;
  name: string;
  email: string;
  userType: string;
  abhaId?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  bloodGroup?: string;
  emergencyContact?: string;
  photo?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: localStorage.getItem('authToken'),
    isLoading: true,
    isAuthenticated: false,
  });

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const user = await authService.getCurrentUser();
          setAuthState({
            user,
            token,
            isLoading: false,
            isAuthenticated: true,
          });
        } catch (error) {
          // Token is invalid, remove it
          localStorage.removeItem('authToken');
          setAuthState({
            user: null,
            token: null,
            isLoading: false,
            isAuthenticated: false,
          });
        }
      } else {
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
        }));
      }
    };

    initializeAuth();
  }, []);

  const login = useCallback(async (credentials: LoginCredentials): Promise<void> => {
    try {
      const response: AuthResponse = await authService.login(credentials);
      localStorage.setItem('authToken', response.token);
      setAuthState({
        user: response.user,
        token: response.token,
        isLoading: false,
        isAuthenticated: true,
      });
    } catch (error) {
      throw error;
    }
  }, []);

  const register = useCallback(async (userData: RegisterData): Promise<void> => {
    try {
      const response: AuthResponse = await authService.register(userData);
      localStorage.setItem('authToken', response.token);
      setAuthState({
        user: response.user,
        token: response.token,
        isLoading: false,
        isAuthenticated: true,
      });
    } catch (error) {
      throw error;
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      await authService.logout();
    } catch (error) {
      // Even if logout fails on server, clear local state
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('authToken');
      setAuthState({
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  }, []);

  const updateUser = useCallback((updatedUser: User) => {
    setAuthState(prev => ({
      ...prev,
      user: updatedUser,
    }));
  }, []);

  return {
    ...authState,
    login,
    register,
    logout,
    updateUser,
  };
};
