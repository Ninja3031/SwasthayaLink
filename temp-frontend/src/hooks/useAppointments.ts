import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';

export interface Appointment {
  id: string;
  doctorName: string;
  date: string;
  time: string;
  type: 'consultation' | 'follow_up' | 'checkup' | 'emergency';
  hospital: string;
  specialty: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  notes?: string;
  createdAt: string;
  updatedAt: string;
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

  // Mock data for demonstration - replace with real API calls
  const mockAppointments: Appointment[] = [
    {
      id: '1',
      doctorName: 'Dr. Sarah Johnson',
      date: '2024-01-15',
      time: '10:00',
      type: 'consultation',
      hospital: 'City General Hospital',
      specialty: 'Cardiology',
      status: 'scheduled',
      notes: 'Regular checkup',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '2',
      doctorName: 'Dr. Michael Chen',
      date: '2024-01-20',
      time: '14:30',
      type: 'follow_up',
      hospital: 'Metro Medical Center',
      specialty: 'Endocrinology',
      status: 'scheduled',
      notes: 'Diabetes follow-up',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  // Fetch appointments
  const fetchAppointments = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Get from localStorage or use mock data
      const stored = localStorage.getItem('appointments');
      const appointmentsData = stored ? JSON.parse(stored) : mockAppointments;
      
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
      const newAppointment: Appointment = {
        id: Date.now().toString(),
        ...appointmentData,
        status: 'scheduled',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // TODO: Replace with real API call
      // const response = await api.post('/appointments', appointmentData);
      
      const updatedAppointments = [newAppointment, ...appointments];
      setAppointments(updatedAppointments);
      localStorage.setItem('appointments', JSON.stringify(updatedAppointments));
      
      return newAppointment;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to book appointment';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [appointments]);

  // Update appointment
  const updateAppointment = useCallback(async (id: string, updates: Partial<Appointment>): Promise<Appointment> => {
    try {
      // TODO: Replace with real API call
      // const response = await api.put(`/appointments/${id}`, updates);
      
      const updatedAppointments = appointments.map(apt => 
        apt.id === id 
          ? { ...apt, ...updates, updatedAt: new Date().toISOString() }
          : apt
      );
      
      setAppointments(updatedAppointments);
      localStorage.setItem('appointments', JSON.stringify(updatedAppointments));
      
      const updatedAppointment = updatedAppointments.find(apt => apt.id === id)!;
      return updatedAppointment;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to update appointment';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [appointments]);

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
      return appointmentDate > now && apt.status === 'scheduled';
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
