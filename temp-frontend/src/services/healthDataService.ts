import api from './api';

export interface HealthDataEntry {
  type: string;
  value: number | string;
  unit?: string;
  date?: string;
}

export interface HealthDataResponse {
  id: string;
  user: string;
  type: string;
  value: number | string;
  unit?: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export const healthDataService = {
  // Add new health data entry
  addHealthData: async (data: HealthDataEntry): Promise<HealthDataResponse> => {
    const response = await api.post('/healthdata', data);
    return response.data.healthData;
  },

  // Get all health data for current user
  getHealthData: async (): Promise<HealthDataResponse[]> => {
    const response = await api.get('/healthdata');
    return response.data;
  },

  // Get health data by type
  getHealthDataByType: async (type: string): Promise<HealthDataResponse[]> => {
    const response = await api.get(`/healthdata?type=${type}`);
    return response.data;
  },

  // Update health data entry
  updateHealthData: async (id: string, data: Partial<HealthDataEntry>): Promise<HealthDataResponse> => {
    const response = await api.put(`/healthdata/${id}`, data);
    return response.data;
  },

  // Delete health data entry
  deleteHealthData: async (id: string): Promise<void> => {
    await api.delete(`/healthdata/${id}`);
  },
};
