export interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: 'RT' | 'Lead' | 'Supervisor';
  department: string;
  hireDate: string;
  maxHoursPerWeek: number;
  preferredShifts: ShiftType[];
  unavailableDays: string[];
  isActive: boolean;
}

export type ShiftType = 'day' | 'evening' | 'night' | 'weekend';

export interface AvailabilityEntry {
  id: string;
  staffId: string;
  date: string;
  isAvailable: boolean;
  shiftType: ShiftType | 'any';
  notes?: string;
}

export interface ScheduleShift {
  id: string;
  date: string;
  shiftType: ShiftType;
  staffId: string;
  department: string;
  notes?: string;
}

export interface ScheduleConstraints {
  minStaffPerShift: number;
  maxConsecutiveDays: number;
  minRestBetweenShifts: number;
  weekendRotation: boolean;
  holidayRotation: boolean;
}

export interface BalancerWeights {
  availabilityWeight: number;
  preferenceWeight: number;
  fairnessWeight: number;
  seniorityWeight: number;
}

export interface StaffingMetrics {
  totalStaff: number;
  activeStaff: number;
  shiftsThisWeek: number;
  coveragePercentage: number;
  overtimeHours: number;
  pendingRequests: number;
}

export interface ScheduleImport {
  staff: StaffMember[];
  availability: AvailabilityEntry[];
  importedAt: string;
  source: string;
}
