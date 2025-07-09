import { useState, useEffect, useCallback } from 'react';
import { glucoseTargetService, GlucoseTarget, GlucoseAnalysisResponse } from '../services/glucoseTargetService';

export const useGlucoseTargets = () => {
  const [targets, setTargets] = useState<GlucoseTarget | null>(null);
  const [analysis, setAnalysis] = useState<GlucoseAnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTargets = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await glucoseTargetService.getGlucoseTargets();
      setTargets(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch glucose targets');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchAnalysis = useCallback(async (days: number = 30) => {
    try {
      setError(null);
      const data = await glucoseTargetService.getGlucoseAnalysis(days);
      setAnalysis(data);
      return data;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch glucose analysis');
      throw err;
    }
  }, []);

  const updateTargets = useCallback(async (targetData: Partial<GlucoseTarget>) => {
    try {
      setError(null);
      const response = await glucoseTargetService.updateGlucoseTargets(targetData);
      setTargets(response.targets);
      return response;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update glucose targets');
      throw err;
    }
  }, []);

  const updateReminderSettings = useCallback(async (reminderData: {
    reminderEnabled: boolean;
    reminderTimes?: GlucoseTarget['reminderTimes'];
    reminderDays?: string[];
  }) => {
    try {
      setError(null);
      const response = await glucoseTargetService.updateReminderSettings(reminderData);
      setTargets(response.targets);
      return response;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update reminder settings');
      throw err;
    }
  }, []);

  // Helper methods
  const isWithinTarget = useCallback((value: number, type: 'fasting' | 'post_meal' | 'random'): boolean => {
    if (!targets) return false;
    return glucoseTargetService.isWithinTarget(value, type, targets);
  }, [targets]);

  const getTargetRange = useCallback((type: 'fasting' | 'post_meal' | 'random'): { min: number; max: number } => {
    if (!targets) return { min: 0, max: 0 };
    return glucoseTargetService.getTargetRange(type, targets);
  }, [targets]);

  const getStatusColor = useCallback((value: number, type: 'fasting' | 'post_meal' | 'random'): string => {
    if (!targets) return 'text-gray-600';
    return glucoseTargetService.getStatusColor(value, type, targets);
  }, [targets]);

  const getStatusText = useCallback((value: number, type: 'fasting' | 'post_meal' | 'random'): string => {
    if (!targets) return 'Unknown';
    return glucoseTargetService.getStatusText(value, type, targets);
  }, [targets]);

  useEffect(() => {
    fetchTargets();
  }, [fetchTargets]);

  return {
    targets,
    analysis,
    isLoading,
    error,
    fetchTargets,
    fetchAnalysis,
    updateTargets,
    updateReminderSettings,
    isWithinTarget,
    getTargetRange,
    getStatusColor,
    getStatusText,
  };
};
