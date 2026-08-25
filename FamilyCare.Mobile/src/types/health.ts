export interface Medicine {
  id: number;
  familyMemberId: number;
  name: string;
  dosage?: string;
  instructions?: string;
  startDate?: string;
  endDate?: string;
}

export type MedicineCreate = Omit<Medicine, 'id'>;
export type MedicineUpdate = Omit<Medicine, 'id' | 'familyMemberId'>;

export interface MedicineSchedule {
  id: number;
  medicineId: number;
  time: string; // TimeSpan in .NET is a string like "14:30:00" in JSON
  instructions?: string;
  isActive: boolean;
}

export type MedicineScheduleCreate = Omit<MedicineSchedule, 'id'>;
export type MedicineScheduleUpdate = Omit<MedicineSchedule, 'id' | 'medicineId'>;
