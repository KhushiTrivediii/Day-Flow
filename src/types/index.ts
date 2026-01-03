export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: ValidationError[];
  pagination?: PaginationInfo;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

export enum UserRole {
  EMPLOYEE = 'employee',
  HR_OFFICER = 'hr_officer',
  ADMIN = 'admin',
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  loginId: string;
  iat: number;
  exp: number;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: UserProfile;
  expiresIn: number;
}

export interface UserProfile {
  id: string;
  loginId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  profilePicture?: string;
}

export interface LoginCredentials {
  loginId: string;
  password: string;
}

// Request types
export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationInfo;
}
