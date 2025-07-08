import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { appointmentService } from '../services/appointmentService';

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

export interface AppointmentForm {
  doctorName: string;
  date: string;
  time: string;
  type: Appointment['type'];
  hospital: string;
  specialty: string;
  notes: string;
}

export const useAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();



  // Fetch appointments
  const fetchAppointments = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      setIsLoading(true);
      setError(null);

      const appointmentsData = await appointmentService.getAppointments();
      setAppointments(appointmentsData);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch appointments');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Book new appointment
  const bookAppointment = useCallback(async (appointmentData: AppointmentForm): Promise<Appointment> => {
    try {
      const newAppointment = await appointmentService.addAppointment({
        ...appointmentData,
        patientName: 'Current User', // This should come from user context
        status: 'scheduled',
      });

      setAppointments(prev => [newAppointment, ...prev]);
      return newAppointment;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to book appointment';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Update appointment
  const updateAppointment = useCallback(async (id: string, updates: Partial<Appointment>): Promise<Appointment> => {
    try {
      const updatedAppointment = await appointmentService.updateAppointment(id, updates);
      setAppointments(prev => prev.map(apt => apt.id === id ? updatedAppointment : apt));
      return updatedAppointment;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to update appointment';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Cancel appointment
  const cancelAppointment = useCallback(async (id: string): Promise<void> => {
    try {
      // TODO: Replace with real API call
      // await api.put(`/appointments/${id}/cancel`);
      
      await updateAppointment(id, { status: 'cancelled' });
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to cancel appointment';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [updateAppointment]);

  // Get upcoming appointments
  const getUpcomingAppointments = useCallback(() => {
    const now = new Date();
    return appointments.filter(apt => {
      const appointmentDate = new Date(`${apt.date} ${apt.time}`);
      return appointmentDate > now && (apt.status === 'scheduled' || apt.status === 'confirmed');
    }).sort((a, b) => new Date(`${a.date} ${a.time}`).getTime() - new Date(`${b.date} ${b.time}`).getTime());
  }, [appointments]);

  // Get appointments by status
  const getAppointmentsByStatus = useCallback((status: Appointment['status']) => {
    return appointments.filter(apt => apt.status === status);
  }, [appointments]);

  // Initialize appointments on mount
  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  return {
    appointments,
    isLoading,
    error,
    bookAppointment,
    updateAppointment,
    cancelAppointment,
    getUpcomingAppointments,
    getAppointmentsByStatus,
    refetch: fetchAppointments,
  };
};
