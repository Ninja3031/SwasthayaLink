import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'medication' | 'appointment' | 'report' | 'prescription' | 'general';
  read: boolean;
  createdAt: string;
  priority: 'low' | 'medium' | 'high';
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  // For now, we'll use mock data since there's no notification API endpoint yet
  // This can be easily replaced with real API calls when the backend is ready
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock notifications - replace with real API call
      const mockNotifications: Notification[] = [
        {
          id: '1',
          title: 'Medication Reminder',
          message: 'Time to take your Metformin (500mg)',
          type: 'medication',
          read: false,
          createdAt: new Date().toISOString(),
          priority: 'high',
        },
        {
          id: '2',
          title: 'Appointment Reminder',
          message: 'You have an appointment tomorrow at 10:00 AM',
          type: 'appointment',
          read: false,
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          priority: 'medium',
        },
        {
          id: '3',
          title: 'Lab Report Ready',
          message: 'Your blood test report is now available',
          type: 'report',
          read: true,
          createdAt: new Date(Date.now() - 7200000).toISOString(),
          priority: 'medium',
        },
      ];
      
      setNotifications(mockNotifications);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch notifications');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      // TODO: Replace with real API call
      // await api.put(`/notifications/${notificationId}/read`);
      
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (err: any) {
      setError(err.message || 'Failed to mark notification as read');
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      // TODO: Replace with real API call
      // await api.put('/notifications/mark-all-read');
      
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
    } catch (err: any) {
      setError(err.message || 'Failed to mark all notifications as read');
    }
  }, []);

  // Get unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  // Get notifications by type
  const getNotificationsByType = useCallback((type: Notification['type']) => {
    return notifications.filter(n => n.type === type);
  }, [notifications]);

  // Initialize notifications on mount
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    getNotificationsByType,
    refetch: fetchNotifications,
  };
};
