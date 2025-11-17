import api from '../config/api';

export interface SingleWorkoutPreferences {
  timeChoice: 'quick' | 'classic' | 'long';
  trainingType: 'lifting' | 'gymnastics' | 'cardio' | 'mixed';
  goalType: 'strength' | 'conditioning' | 'skill' | 'balanced';
  gearType: 'bodyweight' | 'dumbbells' | 'fullgym';
}

export const workoutService = {
  // Generate single workout based on preferences
  generateSingleWorkout: async (preferences: SingleWorkoutPreferences, telegramId?: string) => {
    const response = await api.post('/workouts/generate-single', {
      ...preferences,
      telegramId,
    });
    return response.data;
  },

  // Generate workout plan
  generatePlan: async (telegramId: string, weeksCount: number = 2) => {
    const response = await api.post(`/workouts/${telegramId}/generate`, { weeksCount });
    return response.data;
  },

  // Get all plans for user
  getUserPlans: async (telegramId: string) => {
    const response = await api.get(`/workouts/${telegramId}/plans`);
    return response.data;
  },

  // Get active plan
  getActivePlan: async (telegramId: string) => {
    const response = await api.get(`/workouts/${telegramId}/active`);
    return response.data;
  },

  // Get upcoming workouts
  getUpcomingWorkouts: async (telegramId: string) => {
    const response = await api.get(`/workouts/${telegramId}/upcoming`);
    return response.data;
  },
};


