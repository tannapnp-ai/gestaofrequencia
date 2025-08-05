export interface Employee {
  id: string;
  name: string;
  team: string;
  role?: string;
  workSchedule?: string;
 career?: string;
}

export type AbsenceType = 'FE' | 'BH' | 'L' | 'FP' | 'FO' | 'OA' | 'AI' | 'S' | 'F' | 'PF';

export interface AbsenceRecord {
  employeeId: string;
  date: string;
  type: AbsenceType;
}

export interface AbsenceTypeInfo {
  code: AbsenceType;
  name: string;
  color: string;
  bgColor: string;
}

export interface VacationValidation {
  type: 'FE' | 'FP';
  isValid: boolean;
  message?: string;
}

export interface TeamInfo {
  id: string;
  name: string;
}

export type AccessLevel = 'super_admin' | 'admin' | 'user';

export interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  access_level: AccessLevel;
  created_at: string;
  updated_at: string;
}

export interface AuthUser {
  id: string;
  email: string;
  profile?: UserProfile;
}