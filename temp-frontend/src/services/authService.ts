import api from './api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  abhaId?: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    userType: string;
    abhaId?: string;
  };
}

export const authService = {
  // Login user
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  // Register user
  register: async (userData: RegisterData): Promise<AuthResponse> => {
    const response = await api.post('/auth/signup', userData);
    return response.data;
  },

  // Logout user
  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
    localStorage.removeItem('authToken');
  },

  // Get current user profile
  getCurrentUser: async () => {
    const response = await api.get('/user/profile');
    return response.data;
  },

  // Update user profile
  updateProfile: async (profileData: Partial<RegisterData>) => {
    const response = await api.put('/user/profile', profileData);
    return response.data;
  },

  // Link ABHA ID
  linkAbhaId: async (abhaId: string) => {
    const response = await api.put('/user/abha', { abhaId });
    return response.data;
  },
};
