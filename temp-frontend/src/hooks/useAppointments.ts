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

      console.log('fetchAppointments: Fetching appointments...');
      const appointmentsData = await appointmentService.getAppointments();
      console.log('fetchAppointments: Received appointments:', appointmentsData);
      setAppointments(appointmentsData);
    } catch (err: any) {
      console.error('fetchAppointments: Error:', err);
      setError(err.message || 'Failed to fetch appointments');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Book new appointment
  const bookAppointment = useCallback(async (appointmentData: AppointmentForm): Promise<Appointment> => {
    try {
      console.log('useAppointments: Booking appointment with data:', appointmentData);
      const appointmentPayload = {
        ...appointmentData,
        status: 'scheduled' as const,
      };
      console.log('useAppointments: Sending payload:', appointmentPayload);

      const newAppointment = await appointmentService.addAppointment(appointmentPayload);
      console.log('useAppointments: Received response:', newAppointment);

      setAppointments(prev => [newAppointment, ...prev]);

      // Refetch appointments to ensure we have the latest data
      setTimeout(() => {
        fetchAppointments();
      }, 100);

      return newAppointment;
    } catch (err: any) {
      console.error('useAppointments: Error booking appointment:', err);
      console.error('useAppointments: Error response:', err.response?.data);
      const errorMessage = err.response?.data?.error || 'Failed to book appointment';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [fetchAppointments]);

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
    console.log('getUpcomingAppointments: All appointments:', appointments);
    const now = new Date();
    console.log('getUpcomingAppointments: Current time:', now);

    const filtered = appointments.filter(apt => {
      console.log('getUpcomingAppointments: Checking appointment:', apt);
      console.log('getUpcomingAppointments: Raw date:', apt.date, 'Raw time:', apt.time);
      console.log('getUpcomingAppointments: Date type:', typeof apt.date, 'Time type:', typeof apt.time);

      // Try different date parsing approaches
      let appointmentDate;

      // Try parsing as ISO string first
      appointmentDate = new Date(apt.date);
      if (isNaN(appointmentDate.getTime())) {
        // If that fails, try combining date and time
        appointmentDate = new Date(`${apt.date} ${apt.time}`);
        if (isNaN(appointmentDate.getTime())) {
          // Try with different format
          appointmentDate = new Date(`${apt.date}T${apt.time}`);
        }
      }

      console.log('getUpcomingAppointments: Parsed appointment date:', appointmentDate);
      const isUpcoming = appointmentDate > now && !isNaN(appointmentDate.getTime());
      const isValidStatus = apt.status === 'scheduled' || apt.status === 'confirmed';
      console.log('getUpcomingAppointments: Is upcoming?', isUpcoming, 'Valid status?', isValidStatus);
      return isUpcoming && isValidStatus;
    });

    console.log('getUpcomingAppointments: Filtered appointments:', filtered);

    const sorted = filtered.sort((a, b) => new Date(`${a.date} ${a.time}`).getTime() - new Date(`${b.date} ${b.time}`).getTime());
    console.log('getUpcomingAppointments: Sorted appointments:', sorted);

    return sorted;
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
