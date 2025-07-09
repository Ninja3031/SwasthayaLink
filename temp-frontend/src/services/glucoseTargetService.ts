import api from './api';

export interface GlucoseTarget {
  _id?: string;
  user: string;
  fastingMin: number;
  fastingMax: number;
  postMealMin: number;
  postMealMax: number;
  randomMin: number;
  randomMax: number;
  unit: 'mg/dL' | 'mmol/L';
  reminderEnabled: boolean;
  reminderTimes: {
    time: string;
    type: 'fasting' | 'post_meal' | 'random';
    enabled: boolean;
  }[];
  reminderDays: string[];
  notes?: string;
  setByDoctor: boolean;
  doctorId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GlucoseAnalysis {
  totalReadings: number;
  withinTarget: number;
  aboveTarget: number;
  belowTarget: number;
  averageGlucose: number;
  readingsByType: {
    fasting: { total: number; withinTarget: number; average: number };
    post_meal: { total: number; withinTarget: number; average: number };
    random: { total: number; withinTarget: number; average: number };
  };
  recentTrend: 'improving' | 'worsening' | 'stable';
  recommendations: string[];
}

export interface GlucoseAnalysisResponse {
  targets: GlucoseTarget;
  analysis: GlucoseAnalysis;
  period: string;
}

export const glucoseTargetService = {
  // Get glucose targets
  getGlucoseTargets: async (): Promise<GlucoseTarget> => {
    const response = await api.get('/glucose-targets');
    return response.data;
  },

  // Update glucose targets
  updateGlucoseTargets: async (targetData: Partial<GlucoseTarget>): Promise<{ message: string; targets: GlucoseTarget }> => {
    const response = await api.put('/glucose-targets', targetData);
    return response.data;
  },

  // Get glucose analysis with target comparison
  getGlucoseAnalysis: async (days: number = 30): Promise<GlucoseAnalysisResponse> => {
    const response = await api.get(`/glucose-targets/analysis?days=${days}`);
    return response.data;
  },

  // Update reminder settings
  updateReminderSettings: async (reminderData: {
    reminderEnabled: boolean;
    reminderTimes?: GlucoseTarget['reminderTimes'];
    reminderDays?: string[];
  }): Promise<{ message: string; targets: GlucoseTarget }> => {
    const response = await api.put('/glucose-targets/reminders', reminderData);
    return response.data;
  },

  // Helper method to check if a value is within target
  isWithinTarget: (value: number, type: 'fasting' | 'post_meal' | 'random', targets: GlucoseTarget): boolean => {
    switch (type) {
      case 'fasting':
        return value >= targets.fastingMin && value <= targets.fastingMax;
      case 'post_meal':
        return value >= targets.postMealMin && value <= targets.postMealMax;
      case 'random':
        return value >= targets.randomMin && value <= targets.randomMax;
      default:
        return false;
    }
  },

  // Helper method to get target range
  getTargetRange: (type: 'fasting' | 'post_meal' | 'random', targets: GlucoseTarget): { min: number; max: number } => {
    switch (type) {
      case 'fasting':
        return { min: targets.fastingMin, max: targets.fastingMax };
      case 'post_meal':
        return { min: targets.postMealMin, max: targets.postMealMax };
      case 'random':
        return { min: targets.randomMin, max: targets.randomMax };
      default:
        return { min: 0, max: 0 };
    }
  },

  // Helper method to get status color based on target
  getStatusColor: (value: number, type: 'fasting' | 'post_meal' | 'random', targets: GlucoseTarget): string => {
    if (glucoseTargetService.isWithinTarget(value, type, targets)) {
      return 'text-green-600';
    }
    
    const range = glucoseTargetService.getTargetRange(type, targets);
    if (value > range.max) {
      return 'text-red-600';
    } else {
      return 'text-yellow-600';
    }
  },

  // Helper method to get status text
  getStatusText: (value: number, type: 'fasting' | 'post_meal' | 'random', targets: GlucoseTarget): string => {
    if (glucoseTargetService.isWithinTarget(value, type, targets)) {
      return 'Within Target';
    }
    
    const range = glucoseTargetService.getTargetRange(type, targets);
    if (value > range.max) {
      return 'Above Target';
    } else {
      return 'Below Target';
    }
  }
};
