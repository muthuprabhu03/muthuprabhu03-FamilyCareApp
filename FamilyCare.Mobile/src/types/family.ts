export interface FamilyMember {
  id: number;
  name: string;
  relationship: string;
  age: number;
  phone?: string;
  email?: string;
  profileImageUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type FamilyMemberCreate = Omit<FamilyMember, 'id' | 'isActive' | 'createdAt' | 'updatedAt'>;
export type FamilyMemberUpdate = Omit<FamilyMember, 'id' | 'createdAt' | 'updatedAt'>;
