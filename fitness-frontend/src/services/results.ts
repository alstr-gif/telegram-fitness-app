import api from '../config/api';

export interface LogResultData {
  workoutName: string;
  workoutType: string;
  timeSeconds?: number;
  rounds?: number;
  reps?: number;
  weight?: number;
  additionalData?: {
    movements?: string[];
    repScheme?: string;
    rxOrScaled?: 'RX' | 'Scaled' | 'Beginner';
    notes?: string;
  };
  liked?: boolean;
  userNotes?: string;
  fullWorkoutData?: any;
}

export const resultsService = {
  // Log workout result
  logResult: async (telegramId: string, data: LogResultData) => {
    const response = await api.post(`/results/${telegramId}/log`, data);
    return response.data;
  },

  // Update like/dislike
  updateFeedback: async (resultId: string, liked: boolean) => {
    const response = await api.patch(`/results/${resultId}/feedback`, { liked });
    return response.data;
  },

  // Get user's workout history
  getUserResults: async (telegramId: string) => {
    const response = await api.get(`/results/${telegramId}`);
    return response.data;
  },

  // Get history for specific workout
  getWorkoutHistory: async (telegramId: string, workoutName: string) => {
    const response = await api.get(`/results/${telegramId}/workout/${encodeURIComponent(workoutName)}`);
    return response.data;
  },

  // Get statistics for specific workout
  getWorkoutStats: async (telegramId: string, workoutName: string) => {
    const response = await api.get(`/results/${telegramId}/stats/${encodeURIComponent(workoutName)}`);
    return response.data;
  },

  // Get benchmark WOD results
  getBenchmarkResults: async (telegramId: string) => {
    const response = await api.get(`/results/${telegramId}/benchmarks`);
    return response.data;
  },
};


