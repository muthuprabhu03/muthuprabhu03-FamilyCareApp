export interface Reminder {
  id: number;
  familyMemberId: number;
  title: string;
  description?: string;
  reminderAt: string;
  isCompleted: boolean;
}

export type ReminderCreate = Omit<Reminder, 'id'>;
export type ReminderUpdate = Omit<Reminder, 'id' | 'familyMemberId'>;

export interface LocationHistory {
  id: number;
  familyMemberId: number;
  latitude: number;
  longitude: number;
  recordedAt: string;
}
