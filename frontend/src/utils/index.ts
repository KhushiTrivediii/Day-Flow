// Utility functions for Dayflow Frontend

import type { AttendanceStatus, UserRole } from '../types';

/**
 * Format a date string to a readable format
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Format a date string to a short format
 */
export const formatDateShort = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Format time string to readable format
 */
export const formatTime = (timeString: string): string => {
  const date = new Date(timeString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

/**
 * Calculate working hours between two timestamps
 */
export const calculateWorkingHours = (
  checkIn: string,
  checkOut: string,
  breakTime: number = 0
): number => {
  const checkInTime = new Date(checkIn).getTime();
  const checkOutTime = new Date(checkOut).getTime();
  const totalMinutes = (checkOutTime - checkInTime) / (1000 * 60);
  const workingMinutes = totalMinutes - breakTime;
  return Math.max(0, workingMinutes / 60);
};

/**
 * Generate employee login ID
 * Format: OI[FirstName][LastName][Year][SerialNumber]
 */
export const generateLoginId = (
  firstName: string,
  lastName: string,
  year: number,
  serialNumber: number
): string => {
  return `OI${firstName}${lastName}${year}${serialNumber.toString().padStart(3, '0')}`;
};

/**
 * Get status indicator emoji
 */
export const getStatusEmoji = (status: AttendanceStatus): string => {
  switch (status) {
    case 'present':
      return '🟢';
    case 'on-leave':
      return '✈️';
    case 'absent':
      return '🟡';
    default:
      return '⚪';
  }
};

/**
 * Get status label
 */
export const getStatusLabel = (status: AttendanceStatus): string => {
  switch (status) {
    case 'present':
      return 'Present';
    case 'on-leave':
      return 'On Leave';
    case 'absent':
      return 'Absent';
    default:
      return 'Unknown';
  }
};

/**
 * Check if user has admin privileges
 */
export const isAdmin = (role: UserRole): boolean => {
  return role === 'admin' || role === 'hr_officer';
};

/**
 * Get role display name
 */
export const getRoleDisplayName = (role: UserRole): string => {
  switch (role) {
    case 'admin':
      return 'Administrator';
    case 'hr_officer':
      return 'HR Officer';
    case 'employee':
      return 'Employee';
    default:
      return 'Unknown';
  }
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number format
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s\-()]{10,}$/;
  return phoneRegex.test(phone);
};

/**
 * Calculate salary component amount
 */
export const calculateComponentAmount = (
  computationType:
    | 'fixed_amount'
    | 'percentage_of_wage'
    | 'percentage_of_basic',
  value: number,
  monthlyWage: number,
  basicAmount?: number
): number => {
  switch (computationType) {
    case 'fixed_amount':
      return value;
    case 'percentage_of_wage':
      return (monthlyWage * value) / 100;
    case 'percentage_of_basic':
      return basicAmount ? (basicAmount * value) / 100 : 0;
    default:
      return 0;
  }
};

/**
 * Format currency amount
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Calculate leave days between two dates
 */
export const calculateLeaveDays = (
  startDate: string,
  endDate: string
): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const timeDiff = end.getTime() - start.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
  return Math.max(1, daysDiff + 1); // Include both start and end dates
};

/**
 * Get current month name
 */
export const getCurrentMonthName = (): string => {
  return new Date().toLocaleDateString('en-US', { month: 'long' });
};

/**
 * Get days in current month
 */
export const getDaysInCurrentMonth = (): number => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
};

/**
 * Debounce function
 */
export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Throttle function
 */
export const throttle = <T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Generate a random ID
 */
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 11);
};

/**
 * Deep clone an object
 */
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T;
  if (obj instanceof Array)
    return obj.map(item => deepClone(item)) as unknown as T;
  if (typeof obj === 'object') {
    const clonedObj = {} as T;
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
  return obj;
};

/**
 * Check if two objects are equal (shallow comparison)
 */
export const isEqual = (obj1: unknown, obj2: unknown): boolean => {
  if (obj1 === obj2) return true;
  if (obj1 == null || obj2 == null) return false;
  if (typeof obj1 !== typeof obj2) return false;

  if (typeof obj1 === 'object') {
    const keys1 = Object.keys(obj1 as object);
    const keys2 = Object.keys(obj2 as object);

    if (keys1.length !== keys2.length) return false;

    for (const key of keys1) {
      if (!keys2.includes(key)) return false;
      if (
        (obj1 as Record<string, unknown>)[key] !==
        (obj2 as Record<string, unknown>)[key]
      ) {
        return false;
      }
    }
    return true;
  }

  return false;
};

/**
 * Get initials from name
 */
export const getInitials = (firstName: string, lastName: string): string => {
  return `${firstName.charAt(0).toUpperCase()}${lastName.charAt(0).toUpperCase()}`;
};

/**
 * Get full name
 */
export const getFullName = (firstName: string, lastName: string): string => {
  return `${firstName} ${lastName}`;
};
