import { apiClient } from './apiClient';
import { Medicine, MedicineCreate, MedicineUpdate, MedicineSchedule, MedicineScheduleCreate, MedicineScheduleUpdate } from '../types/health';

export const healthService = {
  getMedicines: () => apiClient.get<Medicine[]>('/api/Medicines'),
  getMedicineById: (id: number) => apiClient.get<Medicine>(`/api/Medicines/${id}`),
  createMedicine: (data: MedicineCreate) => apiClient.post<Medicine>('/api/Medicines', data),
  updateMedicine: (id: number, data: MedicineUpdate) => apiClient.put<Medicine>(`/api/Medicines/${id}`, data),
  deleteMedicine: (id: number) => apiClient.delete(`/api/Medicines/${id}`),

  getSchedules: () => apiClient.get<MedicineSchedule[]>('/api/MedicineSchedules'),
  getScheduleById: (id: number) => apiClient.get<MedicineSchedule>(`/api/MedicineSchedules/${id}`),
  createSchedule: (data: MedicineScheduleCreate) => apiClient.post<MedicineSchedule>('/api/MedicineSchedules', data),
  updateSchedule: (id: number, data: MedicineScheduleUpdate) => apiClient.put<MedicineSchedule>(`/api/MedicineSchedules/${id}`, data),
  deleteSchedule: (id: number) => apiClient.delete(`/api/MedicineSchedules/${id}`)
};
