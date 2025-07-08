import { api } from './api';

export interface Appointment {
  id: string;
  doctorName: string;
  doctorId?: string;
  patientName: string;
  date: string;
  time: string;
  type: 'consultation' | 'follow-up' | 'routine' | 'emergency';
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  hospital?: string;
  specialty?: string;
  consultationFee?: number;
  estimatedDuration?: number;
  symptoms?: string;
  diagnosis?: string;
  prescription?: string;
  notes?: string;
}

export const appointmentService = {
  // Get all appointments for the current user
  getAppointments: async (): Promise<Appointment[]> => {
    const response = await api.get('/appointments');
    return response.data.map((apt: any) => ({
      ...apt,
      id: apt._id,
    }));
  },

  // Get upcoming appointments
  getUpcomingAppointments: async (): Promise<Appointment[]> => {
    const response = await api.get('/appointments/upcoming');
    return response.data.map((apt: any) => ({
      ...apt,
      id: apt._id,
    }));
  },

  // Add a new appointment
  addAppointment: async (appointmentData: Omit<Appointment, 'id'>): Promise<Appointment> => {
    const response = await api.post('/appointments', appointmentData);
    return {
      ...response.data,
      id: response.data._id,
    };
  },

  // Update appointment
  updateAppointment: async (id: string, appointmentData: Partial<Appointment>): Promise<Appointment> => {
    const response = await api.put(`/appointments/${id}`, appointmentData);
    return {
      ...response.data,
      id: response.data._id,
    };
  },

  // Delete appointment
  deleteAppointment: async (id: string): Promise<void> => {
    await api.delete(`/appointments/${id}`);
  },
};
