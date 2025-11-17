import api from '../config/api';

export interface UserProfile {
  fitnessLevel?: 'beginner' | 'intermediate' | 'advanced';
  primaryGoal?: 'lose_weight' | 'build_muscle' | 'increase_endurance' | 'strength_training' | 'general_fitness';
  preferredWorkoutDays?: string[];
  preferredDuration?: number;
  availableEquipment?: string[];
  injuries?: string;
  age?: number;
  weight?: number;
  height?: number;
}

export const userService = {
  // Get user profile
  getProfile: async (telegramId: string) => {
    const response = await api.get(`/users/${telegramId}`);
    return response.data;
  },

  // Update user profile
  updateProfile: async (telegramId: string, profile: UserProfile) => {
    const response = await api.put(`/users/${telegramId}`, profile);
    return response.data;
  },

  // Check if profile is complete
  checkProfileComplete: async (telegramId: string) => {
    const response = await api.get(`/users/${telegramId}/complete`);
    return response.data;
  },
};



