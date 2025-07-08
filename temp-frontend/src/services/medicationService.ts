import { api } from './api';

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  timeOfDay: string[];
  instructions?: string;
  taken: boolean;
  lastTaken?: string;
  prescribedBy?: string;
  pharmacyStatus: 'pending' | 'ready' | 'delivered';
  refillsRemaining: number;
  isActive: boolean;
}

export const medicationService = {
  // Get all medications for the current user
  getMedications: async (): Promise<Medication[]> => {
    const response = await api.get('/medications');
    return response.data.map((med: any) => ({
      ...med,
      id: med._id,
    }));
  },

  // Add a new medication
  addMedication: async (medicationData: Omit<Medication, 'id' | 'taken' | 'isActive'>): Promise<Medication> => {
    const response = await api.post('/medications', medicationData);
    return {
      ...response.data,
      id: response.data._id,
    };
  },

  // Update medication
  updateMedication: async (id: string, medicationData: Partial<Medication>): Promise<Medication> => {
    const response = await api.put(`/medications/${id}`, medicationData);
    return {
      ...response.data,
      id: response.data._id,
    };
  },

  // Delete medication
  deleteMedication: async (id: string): Promise<void> => {
    await api.delete(`/medications/${id}`);
  },

  // Mark medication as taken
  markMedicationTaken: async (id: string): Promise<Medication> => {
    const response = await api.put(`/medications/${id}/taken`);
    return {
      ...response.data,
      id: response.data._id,
    };
  },
};
