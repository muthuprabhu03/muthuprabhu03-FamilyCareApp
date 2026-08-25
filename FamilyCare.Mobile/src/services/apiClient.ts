import { authService } from './authService';
import { API_BASE_URL } from '../config/api';
import { router } from 'expo-router';

export const apiClient = {
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  },

  async post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async put<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(endpoint: string): Promise<void> {
    await this.request<any>(endpoint, { method: 'DELETE' });
  },

  async request<T>(endpoint: string, options: RequestInit): Promise<T> {
    const token = await authService.getToken();
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        await authService.logout();
        router.replace('/login');
        throw new Error('Session expired. Please log in again.');
      }
      if (response.status === 403) {
        throw new Error('You do not have permission to access this resource.');
      }
      
      let errorMsg = 'An error occurred while processing your request.';
      try {
        const errData = await response.json();
        if (errData.title) errorMsg = errData.title;
      } catch (e) {
        // Ignore json parse error
      }
      throw new Error(errorMsg);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return await response.json();
  }
};
