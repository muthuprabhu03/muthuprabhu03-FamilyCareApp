import { Platform } from 'react-native';

// Production API URL configured via EXPO_PUBLIC_API_URL environment variable
// e.g. EXPO_PUBLIC_API_URL=https://familycare-api.yourdomain.com
const envApiUrl = process.env.EXPO_PUBLIC_API_URL;

export const API_BASE_URL = envApiUrl
  ? envApiUrl.replace(/\/$/, '')
  : Platform.OS === 'android'
  ? 'http://10.0.2.2:5093'
  : 'http://localhost:5093';
