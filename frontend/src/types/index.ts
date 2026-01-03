// Core Types for Dayflow Frontend

export type UserRole = 'employee' | 'admin' | 'hr_officer';

export type AttendanceStatus = 'present' | 'absent' | 'on-leave';

export type LeaveStatus = 'pending' | 'approved' | 'rejected';

export type LeaveType = 'paid' | 'sick' | 'unpaid';

export type WageType = 'fixed';

export type SalaryComponentType =
  | 'basic'
  | 'hra'
  | 'standard_allowance'
  | 'performance_bonus'
  | 'lta'
  | 'fixed_allowance';

export type ComputationType =
  | 'fixed_amount'
  | 'percentage_of_wage'
  | 'percentage_of_basic';

export type DeductionType = 'pf' | 'professional_tax' | 'other';

export type ThemeMode = 'light' | 'dark';

// User and Profile Types
export interface User {
  id: string;
  loginId: string; // Format: OI[FirstName][LastName][Year][SerialNumber]
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  profilePicture?: string;
  personalDetails: PersonalDetails;
  jobDetails: JobDetails;
  salaryInfo: SalaryInfo;
  attendanceStatus: AttendanceStatusInfo;
}

export interface PersonalDetails {
  phone: string;
  address: string;
  dateOfBirth: string;
  emergencyContact: EmergencyContact;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface JobDetails {
  department: string;
  position: string;
  joiningDate: string;
  reportingManager: string;
  workingSchedule: WorkingSchedule;
}

export interface WorkingSchedule {
  type: 'full-time' | 'part-time';
  hoursPerWeek: number;
  workingDays: string[];
}

export interface SalaryInfo {
  wageType: WageType;
  monthlyWage: number;
  components: SalaryComponent[];
  deductions: Deduction[];
}

export interface SalaryComponent {
  id: string;
  name: SalaryComponentType;
  displayName: string;
  computationType: ComputationType;
  value: number; // percentage or fixed amount
  calculatedAmount: number;
}

export interface Deduction {
  id: string;
  name: DeductionType;
  displayName: string;
  rate: number; // percentage
  amount: number;
}

// Attendance Types
export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  breakTime: number; // minutes
  workingHours: number;
  status: 'present' | 'absent' | 'half-day' | 'leave';
  remarks?: string;
}

export interface AttendanceStatusInfo {
  current: AttendanceStatus;
  lastCheckIn?: string;
  lastCheckOut?: string;
}

// Leave Types
export interface LeaveRequest {
  id: string;
  employeeId: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: LeaveStatus;
  appliedDate: string;
  approvedBy?: string;
  approvedDate?: string;
  comments?: string;
}

export interface LeaveBalance {
  employeeId: string;
  paidLeave: number;
  sickLeave: number;
  totalUsed: number;
  year: number;
}

// Authentication Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  role: UserRole | null;
  error?: string;
}

// Theme Types
export interface ThemeState {
  mode: ThemeMode;
  primaryColor: string;
}

// API Types
export interface ApiError {
  message: string;
  code: string;
  details?: Record<string, unknown>;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

// Component Props Types
export interface EmployeeCardProps {
  employee: User;
  onClick?: (employee: User) => void;
  showStatus?: boolean;
  className?: string;
}

export interface StatusIndicatorProps {
  status: AttendanceStatus;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// Form Types
export interface CreateEmployeeRequest {
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  personalDetails: Partial<PersonalDetails>;
  jobDetails: Partial<JobDetails>;
}

export interface UpdateProfileRequest {
  personalDetails?: Partial<PersonalDetails>;
  profilePicture?: string;
}

export interface LeaveApplicationRequest {
  type: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
}

export interface AttendanceActionRequest {
  action: 'check-in' | 'check-out';
  timestamp: string;
  location?: string;
}

// Utility Types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
