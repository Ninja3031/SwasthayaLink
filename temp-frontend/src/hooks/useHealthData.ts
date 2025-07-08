import { useState, useEffect, useCallback } from 'react';
import { healthDataService, type HealthDataEntry, type HealthDataResponse } from '../services';

export const useHealthData = () => {
  const [healthData, setHealthData] = useState<HealthDataResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all health data
  const fetchHealthData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await healthDataService.getHealthData();
      setHealthData(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch health data');
      console.error('Error fetching health data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Add new health data entry
  const addHealthData = useCallback(async (entry: HealthDataEntry) => {
    try {
      const newEntry = await healthDataService.addHealthData(entry);
      setHealthData(prev => [newEntry, ...prev]);
      return newEntry;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to add health data';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Get health data by type
  const getHealthDataByType = useCallback((type: string) => {
    return healthData.filter(entry => entry.type === type);
  }, [healthData]);

  // Get latest reading for a specific type
  const getLatestReading = useCallback((type: string) => {
    const readings = getHealthDataByType(type);
    return readings.length > 0 ? readings[0] : null;
  }, [getHealthDataByType]);

  // Delete health data entry
  const deleteHealthData = useCallback(async (id: string) => {
    try {
      await healthDataService.deleteHealthData(id);
      setHealthData(prev => prev.filter(entry => entry.id !== id));
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to delete health data';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Initialize data on mount
  useEffect(() => {
    fetchHealthData();
  }, [fetchHealthData]);

  return {
    healthData,
    isLoading,
    error,
    addHealthData,
    getHealthDataByType,
    getLatestReading,
    deleteHealthData,
    refetch: fetchHealthData,
  };
};
