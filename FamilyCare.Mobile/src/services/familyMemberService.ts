import { apiClient } from './apiClient';
import { FamilyMember, FamilyMemberCreate, FamilyMemberUpdate } from '../types/family';

export const familyMemberService = {
  getAll: () => apiClient.get<FamilyMember[]>('/api/FamilyMembers'),
  getById: (id: number) => apiClient.get<FamilyMember>(`/api/FamilyMembers/${id}`),
  create: (data: FamilyMemberCreate) => apiClient.post<FamilyMember>('/api/FamilyMembers', data),
  update: (id: number, data: FamilyMemberUpdate) => apiClient.put<FamilyMember>(`/api/FamilyMembers/${id}`, data),
  delete: (id: number) => apiClient.delete(`/api/FamilyMembers/${id}`)
};
