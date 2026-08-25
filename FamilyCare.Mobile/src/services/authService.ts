import { API_BASE_URL } from '../config/api';
import { LoginRequest, LoginResponse, User } from '../types/auth';

let memoryToken: string | null = null;
let memoryUser: User | null = null;

export const authService = {
  login: async (request: LoginRequest): Promise<LoginResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/Auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid email or password');
        } else if (response.status === 400) {
          throw new Error('Validation error. Please check your inputs.');
        } else if (response.status === 403) {
          throw new Error('Access forbidden.');
        } else if (response.status >= 500) {
          throw new Error('Server error. Please try again later.');
        }
        throw new Error('An unexpected error occurred during login');
      }

      const data: LoginResponse = await response.json();
      
      memoryToken = data.token;
      memoryUser = {
        userId: data.userId,
        email: data.email,
        role: data.role,
        familyMemberId: data.familyMemberId
      };

      return data;
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('Network')) {
        throw new Error('Network connection failed. Please check your connection and ensure the server is running.');
      }
      throw error;
    }
  },

  logout: async (): Promise<void> => {
    memoryToken = null;
    memoryUser = null;
  },

  getToken: async (): Promise<string | null> => {
    return memoryToken;
  },

  getUser: async (): Promise<User | null> => {
    return memoryUser;
  },

  isLoggedIn: async (): Promise<boolean> => {
    return memoryToken !== null;
  }
};