import api from '../config/api';

export interface LoginData {
  telegramId: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  photoUrl?: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    telegramId: string;
    username?: string;
    firstName?: string;
    lastName?: string;
  };
}

export const authService = {
  // Login with Telegram credentials
  login: async (data: LoginData): Promise<AuthResponse> => {
    try {
      const response = await api.post('/auth/login', data);
      return response.data;
    } catch (error: any) {
      if (error.code === 'ECONNREFUSED' || error.message?.includes('Network Error')) {
        throw new Error('Backend server is not running. Please start the backend server on port 3000.');
      }
      throw error;
    }
  },

  // Verify token
  verifyToken: async (): Promise<any> => {
    try {
      const response = await api.get('/auth/verify');
      return response.data;
    } catch (error: any) {
      if (error.code === 'ECONNREFUSED' || error.message?.includes('Network Error')) {
        throw new Error('Backend server is not running. Please start the backend server on port 3000.');
      }
      throw error;
    }
  },

  // Save token
  saveToken: (token: string) => {
    localStorage.setItem('authToken', token);
  },

  // Get token
  getToken: (): string | null => {
    return localStorage.getItem('authToken');
  },

  // Remove token
  logout: () => {
    localStorage.removeItem('authToken');
  },
};



