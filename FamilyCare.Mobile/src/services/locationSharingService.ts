import { apiClient } from './apiClient';
import * as Location from 'expo-location';

export interface FamilyMemberLocation {
  familyMemberId: number;
  name: string;
  relationship: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  isSharing: boolean;
  updatedAt: string;
}

export interface MyLocationStatus {
  familyMemberId: number;
  latitude: number | null;
  longitude: number | null;
  isSharing: boolean;
  updatedAt: string | null;
}

export const locationSharingService = {
  getMyStatus: () => apiClient.get<MyLocationStatus>('/api/Location/my'),

  getFamilyLocations: () => apiClient.get<FamilyMemberLocation[]>('/api/Location/family'),

  updateLocation: (data: { latitude: number; longitude: number; accuracy?: number }) =>
    apiClient.post<{ success: boolean; updatedAt: string }>('/api/Location/update', data),

  toggleSharing: (isSharing: boolean) =>
    apiClient.post<{ isSharing: boolean; updatedAt: string }>('/api/Location/toggle-sharing', { isSharing }),

  // Device GPS permission & position helper
  async requestAndSendCurrentLocation(): Promise<{ latitude: number; longitude: number }> {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Location permission denied.');
    }

    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    const { latitude, longitude, accuracy } = position.coords;
    await this.updateLocation({ latitude, longitude, accuracy: accuracy || 10 });

    return { latitude, longitude };
  },
};
