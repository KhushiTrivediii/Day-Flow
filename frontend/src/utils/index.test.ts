import { describe, it, expect } from 'vitest';
import {
  formatDate,
  formatTime,
  calculateWorkingHours,
  generateLoginId,
  getStatusEmoji,
  getStatusLabel,
  isAdmin,
  isValidEmail,
  calculateComponentAmount,
  formatCurrency,
  getInitials,
  getFullName,
} from './index';

describe('Utility Functions', () => {
  describe('formatDate', () => {
    it('should format date string correctly', () => {
      const result = formatDate('2024-01-15');
      expect(result).toBe('January 15, 2024');
    });
  });

  describe('formatTime', () => {
    it('should format time string correctly', () => {
      const result = formatTime('2024-01-15T09:30:00');
      expect(result).toBe('09:30 AM');
    });
  });

  describe('calculateWorkingHours', () => {
    it('should calculate working hours correctly', () => {
      const checkIn = '2024-01-15T09:00:00';
      const checkOut = '2024-01-15T17:30:00';
      const breakTime = 60; // 1 hour break
      const result = calculateWorkingHours(checkIn, checkOut, breakTime);
      expect(result).toBe(7.5);
    });

    it('should handle no break time', () => {
      const checkIn = '2024-01-15T09:00:00';
      const checkOut = '2024-01-15T17:00:00';
      const result = calculateWorkingHours(checkIn, checkOut);
      expect(result).toBe(8);
    });
  });

  describe('generateLoginId', () => {
    it('should generate login ID correctly', () => {
      const result = generateLoginId('John', 'Doe', 2024, 1);
      expect(result).toBe('OIJohnDoe2024001');
    });

    it('should pad serial number correctly', () => {
      const result = generateLoginId('Jane', 'Smith', 2024, 123);
      expect(result).toBe('OIJaneSmith2024123');
    });
  });

  describe('getStatusEmoji', () => {
    it('should return correct emoji for present status', () => {
      expect(getStatusEmoji('present')).toBe('🟢');
    });

    it('should return correct emoji for on-leave status', () => {
      expect(getStatusEmoji('on-leave')).toBe('✈️');
    });

    it('should return correct emoji for absent status', () => {
      expect(getStatusEmoji('absent')).toBe('🟡');
    });
  });

  describe('getStatusLabel', () => {
    it('should return correct label for present status', () => {
      expect(getStatusLabel('present')).toBe('Present');
    });

    it('should return correct label for on-leave status', () => {
      expect(getStatusLabel('on-leave')).toBe('On Leave');
    });

    it('should return correct label for absent status', () => {
      expect(getStatusLabel('absent')).toBe('Absent');
    });
  });

  describe('isAdmin', () => {
    it('should return true for admin role', () => {
      expect(isAdmin('admin')).toBe(true);
    });

    it('should return true for hr_officer role', () => {
      expect(isAdmin('hr_officer')).toBe(true);
    });

    it('should return false for employee role', () => {
      expect(isAdmin('employee')).toBe(false);
    });
  });

  describe('isValidEmail', () => {
    it('should validate correct email', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
    });

    it('should reject invalid email', () => {
      expect(isValidEmail('invalid-email')).toBe(false);
    });

    it('should reject email without domain', () => {
      expect(isValidEmail('test@')).toBe(false);
    });
  });

  describe('calculateComponentAmount', () => {
    it('should calculate fixed amount correctly', () => {
      const result = calculateComponentAmount('fixed_amount', 5000, 50000);
      expect(result).toBe(5000);
    });

    it('should calculate percentage of wage correctly', () => {
      const result = calculateComponentAmount('percentage_of_wage', 10, 50000);
      expect(result).toBe(5000);
    });

    it('should calculate percentage of basic correctly', () => {
      const result = calculateComponentAmount(
        'percentage_of_basic',
        20,
        50000,
        25000
      );
      expect(result).toBe(5000);
    });
  });

  describe('formatCurrency', () => {
    it('should format currency correctly', () => {
      const result = formatCurrency(50000);
      expect(result).toBe('₹50,000');
    });
  });

  describe('getInitials', () => {
    it('should return correct initials', () => {
      const result = getInitials('John', 'Doe');
      expect(result).toBe('JD');
    });
  });

  describe('getFullName', () => {
    it('should return correct full name', () => {
      const result = getFullName('John', 'Doe');
      expect(result).toBe('John Doe');
    });
  });
});
