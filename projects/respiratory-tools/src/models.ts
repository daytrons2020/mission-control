/**
 * Data Models
 * 
 * TypeScript interfaces for all data entities in the respiratory tools system
 */

// ============================================================================
// STAFF SCHEDULING MODELS
// ============================================================================

export type StaffRole = 'RT' | 'RRT' | 'Lead' | 'Supervisor';
export type ShiftType = 'day' | 'evening' | 'night';
export type AssignmentStatus = 'scheduled' | 'confirmed' | 'swapped' | 'call-off';

export interface StaffMember {
  id: string;
  name: string;
  role: StaffRole;
  fte: number; // Full-time equivalent (0.5, 0.75, 1.0)
  hireDate: Date;
  email?: string;
  phone?: string;
  credentials: string[]; // Credentials (RRT, CRT, etc.)
  weekendTarget: number; // Target weekends per month
  maxHoursPerWeek: number;
  preferredShifts?: ShiftType[];
  restrictedShifts?: ShiftType[];
}

export interface ShiftTemplate {
  type: ShiftType;
  startTime: string; // HH:MM format
  endTime: string;   // HH:MM format
  duration: number;  // Hours
  requiredStaff: {
    day: number;
    evening: number;
    night: number;
  };
}

export interface Shift {
  id: string;
  date: Date;
  type: ShiftType;
  startTime: string;
  endTime: string;
  requiredStaff: number;
  assignedStaff: string[]; // Staff IDs
  status: 'open' | 'filled' | 'overage';
  isWeekend: boolean;
  isHoliday: boolean;
  notes?: string;
}

export interface DailyAvailability {
  day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
  date: Date;
  shifts: ShiftType[];
  unavailable?: boolean;
  preferred?: ShiftType;
}

export interface AvailabilitySubmission {
  id: string;
  staffId: string;
  weekStarting: Date;
  availability: DailyAvailability[];
  submittedAt: Date;
  notes?: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface ShiftAssignment {
  id: string;
  staffId: string;
  shiftId: string;
  date: Date;
  type: ShiftType;
  startTime: string;
  endTime: string;
  status: AssignmentStatus;
  assignedBy: 'auto' | 'manual';
  assignedAt: Date;
  confirmedAt?: Date;
}

export interface TimeOffRequest {
  id: string;
  staffId: string;
  startDate: Date;
  endDate: Date;
  type: 'vacation' | 'sick' | 'personal' | 'other';
  status: 'pending' | 'approved' | 'denied';
  requestedAt: Date;
  approvedBy?: string;
  approvedAt?: Date;
  notes?: string;
}

export interface ShiftSwap {
  id: string;
  requestorId: string;
  targetShiftId: string;
  proposedShiftId?: string; // Optional: specific shift to swap with
  targetStaffId?: string;   // Optional: specific staff to swap with
  status: 'pending' | 'approved' | 'denied' | 'completed';
  requestedAt: Date;
  approvedBy?: string;
}

// ============================================================================
// INVENTORY MODELS
// ============================================================================

export type ScanType = 'in' | 'out' | 'count' | 'order';
export type OrderStatus = 'pending' | 'ordered' | 'received' | 'cancelled';

export interface InventoryItem {
  lawsonNumber: string;      // Primary key - Lawson system ID
  name: string;
  description?: string;
  category: string;
  subcategory?: string;
  parLevel: number;          // Desired stock level
  currentCount: number;      // Actual count
  unitOfMeasure: string;     // 'each', 'box', 'case', 'pack'
  location: string;          // Storage location code
  supplier: string;
  manufacturer?: string;
  catalogNumber?: string;
  minOrderQty: number;
  reorderPoint: number;      // When to reorder (usually par * 0.25)
  lastOrdered?: Date;
  lastReceived?: Date;
  lastPrice?: number;
  qrCodeData: string;        // Pre-generated QR code string
}

export interface ScanRecord {
  id: string;
  lawsonNumber: string;
  scanType: ScanType;
  quantity: number;
  scannedBy: string;         // Staff ID
  scannedAt: Date;
  deviceId?: string;         // Mobile device identifier
  notes?: string;
  synced: boolean;
  syncedAt?: Date;
}

export interface OrderItem {
  id: string;
  lawsonNumber: string;
  quantity: number;
  status: OrderStatus;
  addedBy: string;
  addedAt: Date;
  orderedAt?: Date;
  receivedAt?: Date;
  poNumber?: string;
  notes?: string;
}

export interface InventoryCount {
  id: string;
  lawsonNumber: string;
  countedQty: number;
  expectedQty: number;
  variance: number;
  countedBy: string;
  countedAt: Date;
  notes?: string;
}

export interface UsageAnalytics {
  lawsonNumber: string;
  period: 'daily' | 'weekly' | 'monthly';
  periodStart: Date;
  totalUsed: number;
  avgDailyUse: number;
  daysUntilEmpty: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

// ============================================================================
// SYNC MODELS
// ============================================================================

export interface SyncRecord {
  id: string;
  deviceId: string;
  direction: 'upload' | 'download';
  recordType: 'availability' | 'scan' | 'assignment';
  recordsProcessed: number;
  recordsFailed: number;
  startedAt: Date;
  completedAt?: Date;
  errors: string[];
}

export interface PendingSync {
  availabilitySubmissions: AvailabilitySubmission[];
  scanRecords: ScanRecord[];
  lastSyncAt?: Date;
}

export interface SyncResult {
  success: boolean;
  recordsProcessed: number;
  recordsFailed: number;
  errors: string[];
  timestamp: Date;
}

// ============================================================================
// USER/AUTH MODELS
// ============================================================================

export interface UserSession {
  staffId: string;
  deviceId: string;
  loggedInAt: Date;
  lastActivityAt: Date;
  token: string;
}

export interface AppSettings {
  departmentName: string;
  syncInterval: number;      // Minutes
  autoSync: boolean;
  offlineMode: boolean;
  notificationsEnabled: boolean;
}

// ============================================================================
// API RESPONSE MODELS
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ScheduleGenerationResult {
  assignments: ShiftAssignment[];
  unfilledShifts: string[];
  conflicts: string[];
  stats: {
    totalShifts: number;
    filledShifts: number;
    totalHours: number;
    avgHoursPerStaff: number;
  };
}

export interface InventoryReport {
  totalItems: number;
  lowStockItems: InventoryItem[];
  outOfStockItems: InventoryItem[];
  recentScans: ScanRecord[];
  pendingOrders: OrderItem[];
}
