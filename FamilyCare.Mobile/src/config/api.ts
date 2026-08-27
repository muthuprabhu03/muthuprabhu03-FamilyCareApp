import { Platform } from 'react-native';
import * as Device from 'expo-device';

/**
 * ============================================================================
 * FamilyCare API Base URL Configuration
 * ============================================================================
 * 
 * 1. Environment Variable (Recommended for builds / CI / Production):
 *    Set `EXPO_PUBLIC_API_URL` in `.env` or EAS Build Secrets:
 *    - Development Wi-Fi:   EXPO_PUBLIC_API_URL=http://192.168.1.113:5093
 *    - Production Domain:   EXPO_PUBLIC_API_URL=https://api.yourfamilycare.com
 * 
 * 2. Automatic Fallback Matrix (when EXPO_PUBLIC_API_URL is not set):
 *    - Physical Android Phone: http://<PC_LAN_IP>:5093 (over same Wi-Fi network)
 *    - Android Studio Emulator: http://10.0.2.2:5093 (host loopback)
 *    - iOS Simulator / Web:     http://localhost:5093
 *    - Physical iOS Device:     http://<PC_LAN_IP>:5093
 * ============================================================================
 */

export const DEV_PC_LAN_IP = '192.168.1.113';
export const DEV_API_PORT = 5093;

function resolveApiBaseUrl(): string {
  const envApiUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envApiUrl && envApiUrl.trim().length > 0) {
    return envApiUrl.trim().replace(/\/$/, '');
  }

  // Web Browser Development
  if (Platform.OS === 'web') {
    return `http://localhost:${DEV_API_PORT}`;
  }

  // Android: Differentiate between Physical Device and Emulator
  if (Platform.OS === 'android') {
    if (Device.isDevice) {
      // Physical Android phone connecting over Wi-Fi
      return `http://${DEV_PC_LAN_IP}:${DEV_API_PORT}`;
    }
    // Android Emulator loopback
    return `http://10.0.2.2:${DEV_API_PORT}`;
  }

  // iOS: Differentiate between Physical iPhone and Simulator
  if (Platform.OS === 'ios') {
    if (Device.isDevice) {
      return `http://${DEV_PC_LAN_IP}:${DEV_API_PORT}`;
    }
    return `http://localhost:${DEV_API_PORT}`;
  }

  return `http://localhost:${DEV_API_PORT}`;
}

export const API_BASE_URL = resolveApiBaseUrl();
