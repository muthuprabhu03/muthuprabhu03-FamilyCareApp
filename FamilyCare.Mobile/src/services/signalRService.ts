import * as signalR from '@microsoft/signalr';
import { authService } from './authService';
import { API_BASE_URL } from '../config/api';

export interface FamilyLocationPayload {
  familyMemberId: number;
  name: string;
  relationship: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  isSharing: boolean;
  updatedAt: string;
}

export interface LocationSharingChangePayload {
  familyMemberId: number;
  name: string;
  isSharing: boolean;
}

type LocationUpdateCallback = (payload: FamilyLocationPayload) => void;
type SharingChangeCallback = (payload: LocationSharingChangePayload) => void;

class SignalRService {
  private hubConnection: signalR.HubConnection | null = null;
  private locationUpdateListeners: LocationUpdateCallback[] = [];
  private sharingChangeListeners: SharingChangeCallback[] = [];
  private isConnecting = false;

  public async startConnection(): Promise<void> {
    if (this.hubConnection?.state === signalR.HubConnectionState.Connected) {
      return;
    }

    if (this.isConnecting) return;
    this.isConnecting = true;

    try {
      const token = await authService.getToken();
      if (!token) {
        this.isConnecting = false;
        return;
      }

      const hubUrl = `${API_BASE_URL}/hubs/location`;

      this.hubConnection = new signalR.HubConnectionBuilder()
        .withUrl(hubUrl, {
          accessTokenFactory: async () => {
            const currentToken = await authService.getToken();
            return currentToken || '';
          },
          transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling,
        })
        .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
        .configureLogging(signalR.LogLevel.None)
        .build();

      this.hubConnection.on('LocationUpdated', (data: FamilyLocationPayload) => {
        this.locationUpdateListeners.forEach((cb) => cb(data));
      });

      this.hubConnection.on('LocationSharingChanged', (data: LocationSharingChangePayload) => {
        this.sharingChangeListeners.forEach((cb) => cb(data));
      });

      await this.hubConnection.start();
    } catch {
      // Gracefully handle server restarts/reconnection attempts
    } finally {
      this.isConnecting = false;
    }
  }

  public async stopConnection(): Promise<void> {
    if (this.hubConnection) {
      try {
        await this.hubConnection.stop();
      } catch (e) {
        // Ignore stop error
      }
      this.hubConnection = null;
    }
  }

  public onLocationUpdated(callback: LocationUpdateCallback): () => void {
    this.locationUpdateListeners.push(callback);
    return () => {
      this.locationUpdateListeners = this.locationUpdateListeners.filter((cb) => cb !== callback);
    };
  }

  public onLocationSharingChanged(callback: SharingChangeCallback): () => void {
    this.sharingChangeListeners.push(callback);
    return () => {
      this.sharingChangeListeners = this.sharingChangeListeners.filter((cb) => cb !== callback);
    };
  }

  public isConnected(): boolean {
    return this.hubConnection?.state === signalR.HubConnectionState.Connected;
  }
}

export const signalRService = new SignalRService();
