import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Set the notification handler for foreground notifications
if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export interface MedicineReminderParams {
  medicineId: number;
  medicineName: string;
  dosage?: string;
  instructions?: string;
  familyMemberName?: string;
  hour: number;
  minute: number;
  repeat?: 'daily' | 'weekly' | 'none';
}

export interface GeneralReminderParams {
  reminderId: number;
  title: string;
  description?: string;
  targetDate: Date;
  familyMemberName?: string;
}

class NotificationService {
  private isInitialized = false;
  private webTimers = new Map<string, any>();

  public async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('familycare-reminders', {
        name: 'FamilyCare Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#667eea',
        sound: 'default',
        enableVibrate: true,
      });

      await Notifications.setNotificationChannelAsync('familycare-medicines', {
        name: 'FamilyCare Medicine Alerts',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 500, 250, 500],
        lightColor: '#10b981',
        sound: 'default',
        enableVibrate: true,
      });
    } else if (Platform.OS === 'web' && typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        try {
          await Notification.requestPermission();
        } catch (e) {}
      }
    }

    this.isInitialized = true;
    return true;
  }

  public async requestPermissions(): Promise<boolean> {
    await this.initialize();

    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'granted') return true;
        const res = await Notification.requestPermission();
        return res === 'granted';
      }
      return true; // fallback to in-browser alerts
    }

    const settings = await Notifications.getPermissionsAsync();
    let granted = settings.granted || settings.ios?.status === Notifications.IosAuthorizationStatus.AUTHORIZED;

    if (!granted) {
      const request = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
        },
      });
      granted = request.granted || request.ios?.status === Notifications.IosAuthorizationStatus.AUTHORIZED;
    }

    return granted;
  }

  /**
   * Schedule a recurring or one-time Medicine Reminder
   */
  public async scheduleMedicineReminder(params: MedicineReminderParams): Promise<string | null> {
    const identifier = `medicine-${params.medicineId}`;
    await this.cancelNotification(identifier);

    const title = `💊 Medicine Reminder${params.familyMemberName ? ` for ${params.familyMemberName}` : ''}`;
    let body = `Time to take ${params.medicineName}`;
    if (params.dosage) body += ` (${params.dosage})`;
    if (params.instructions) body += ` - ${params.instructions}`;

    // PC / Web Browser Handling
    if (Platform.OS === 'web') {
      const now = new Date();
      const target = new Date();
      target.setHours(params.hour, params.minute, 0, 0);
      if (target.getTime() <= now.getTime()) {
        target.setDate(target.getDate() + 1);
      }
      const delayMs = target.getTime() - now.getTime();

      const timerId = setTimeout(() => {
        this.triggerWebNotification(title, body);
      }, delayMs);

      this.webTimers.set(identifier, timerId);
      return identifier;
    }

    // Native Mobile Handling
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) return null;

    try {
      return await Notifications.scheduleNotificationAsync({
        identifier,
        content: {
          title,
          body,
          sound: 'default',
          data: {
            type: 'medicine',
            medicineId: params.medicineId,
            url: '/(app)/health',
          },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: params.hour,
          minute: params.minute,
          channelId: 'familycare-medicines',
        },
      });
    } catch (error) {
      console.warn('Failed to schedule medicine notification:', error);
      return null;
    }
  }

  /**
   * Schedule a Medical Checkup or General Reminder
   */
  public async scheduleReminder(params: GeneralReminderParams): Promise<string | null> {
    const identifier = `reminder-${params.reminderId}`;
    await this.cancelNotification(identifier);

    const delayMs = params.targetDate.getTime() - Date.now();
    if (delayMs <= 0) return null;

    const isCheckup = params.title.toLowerCase().includes('doctor') ||
      params.title.toLowerCase().includes('checkup') ||
      params.title.toLowerCase().includes('hospital') ||
      params.title.toLowerCase().includes('clinic') ||
      params.title.toLowerCase().includes('appointment');

    const icon = isCheckup ? '🏥' : '⏰';
    const notifTitle = `${icon} ${params.title}${params.familyMemberName ? ` (${params.familyMemberName})` : ''}`;
    const notifBody = params.description || `Scheduled for ${params.targetDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    // PC / Web Browser Handling
    if (Platform.OS === 'web') {
      const timerId = setTimeout(() => {
        this.triggerWebNotification(notifTitle, notifBody);
      }, delayMs);

      this.webTimers.set(identifier, timerId);
      return identifier;
    }

    // Native Mobile Handling
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) return null;

    try {
      return await Notifications.scheduleNotificationAsync({
        identifier,
        content: {
          title: notifTitle,
          body: notifBody,
          sound: 'default',
          data: {
            type: isCheckup ? 'checkup' : 'reminder',
            reminderId: params.reminderId,
            url: '/(app)/more/reminders',
          },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: params.targetDate,
          channelId: 'familycare-reminders',
        },
      });
    } catch (error) {
      console.warn('Failed to schedule reminder notification:', error);
      return null;
    }
  }

  /**
   * Helper to trigger notification on PC Browser (Native Web Notification + Sound + Visual Alert)
   */
  private triggerWebNotification(title: string, body: string) {
    if (typeof window !== 'undefined') {
      // 1. Play browser chime / alert sound
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.value = 587.33; // D5 tone
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.8);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.8);
      } catch (e) {}

      // 2. Windows / Chrome Native Notification Popup
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
          body,
          icon: '/assets/images/icon.png',
        });
      } else {
        // 3. In-Browser Pop-up Alert
        window.alert(`${title}\n\n${body}`);
      }
    }
  }

  public async cancelNotification(identifier: string): Promise<void> {
    if (Platform.OS === 'web') {
      if (this.webTimers.has(identifier)) {
        clearTimeout(this.webTimers.get(identifier));
        this.webTimers.delete(identifier);
      }
      return;
    }

    try {
      await Notifications.cancelScheduledNotificationAsync(identifier);
    } catch (e) {}
  }

  public async cancelAllNotifications(): Promise<void> {
    if (Platform.OS === 'web') {
      this.webTimers.forEach((timer) => clearTimeout(timer));
      this.webTimers.clear();
      return;
    }

    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (e) {}
  }
}

export const notificationService = new NotificationService();
