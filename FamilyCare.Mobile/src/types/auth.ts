export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  userId: number;
  email: string;
  role: string;
  familyMemberId: number;
  token: string;
}

export interface User {
  userId: number;
  email: string;
  role: string;
  familyMemberId: number;
}
