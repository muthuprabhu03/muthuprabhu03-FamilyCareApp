import { apiClient } from './apiClient';
import { Reminder, ReminderCreate, ReminderUpdate, LocationHistory } from '../types/reminder';

export const reminderService = {
  getReminders: () => apiClient.get<Reminder[]>('/api/Reminders'),
  getReminderById: (id: number) => apiClient.get<Reminder>(`/api/Reminders/${id}`),
  createReminder: (data: ReminderCreate) => apiClient.post<Reminder>('/api/Reminders', data),
  updateReminder: (id: number, data: ReminderUpdate) => apiClient.put<Reminder>(`/api/Reminders/${id}`, data),
  deleteReminder: (id: number) => apiClient.delete(`/api/Reminders/${id}`)
};

export const locationService = {
  getLocations: () => apiClient.get<LocationHistory[]>('/api/LocationHistory'),
  createLocation: (data: { familyMemberId: number; latitude: number; longitude: number; accuracy?: number; recordedAt?: string }) =>
    apiClient.post<LocationHistory>('/api/LocationHistory', data),
};
