import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { LoginPage } from '../LoginPage';
import { AuthProvider } from '../../contexts/AuthContext';
import { ThemeProvider } from '../../contexts/ThemeContext';
import * as authService from '../../services/authService';

// Mock the auth service
vi.mock('../../services/authService', () => ({
  authService: {
    login: vi.fn(),
    logout: vi.fn(),
    setDispatch: vi.fn(),
    getToken: vi.fn(),
    getUserData: vi.fn(),
    isAuthenticated: vi.fn(),
    verifyToken: vi.fn(),
  },
}));

// Mock the API
vi.mock('../../api', () => ({
  api: {
    auth: {
      login: vi.fn(),
      logout: vi.fn(),
      getCurrentUser: vi.fn(),
      refreshToken: vi.fn(),
      verifyToken: vi.fn(),
    },
  },
}));

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>
    <ThemeProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </ThemeProvider>
  </BrowserRouter>
);

describe('LoginPage', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
    
    // Reset localStorage
    localStorage.clear();
    
    // Mock auth service methods to return default values
    vi.mocked(authService.authService.getToken).mockReturnValue(null);
    vi.mocked(authService.authService.getUserData).mockReturnValue(null);
    vi.mocked(authService.authService.isAuthenticated).mockReturnValue(false);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Form Rendering', () => {
    it('should render login form with all required fields', () => {
      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      // Check for form elements
      expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('should render form with proper accessibility attributes', () => {
      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);

      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toHaveAttribute('autoComplete', 'email');
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(passwordInput).toHaveAttribute('autoComplete', 'current-password');
    });

    it('should have proper form structure and novalidate attribute', () => {
      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      const form = screen.getByRole('form', { hidden: true });
      expect(form).toHaveAttribute('novalidate');
    });
  });

  describe('Form Validation', () => {
    it('should show email required error when email is empty and field is blurred', async () => {
      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText(/email address/i);
      
      // Focus and blur without entering text
      await user.click(emailInput);
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      });
    });

    it('should show invalid email error for malformed email', async () => {
      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText(/email address/i);
      
      await user.type(emailInput, 'invalid-email');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
      });
    });

    it('should show password required error when password is empty and field is blurred', async () => {
      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      const passwordInput = screen.getByLabelText(/password/i);
      
      await user.click(passwordInput);
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      });
    });

    it('should show password length error for short passwords', async () => {
      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      const passwordInput = screen.getByLabelText(/password/i);
      
      await user.type(passwordInput, '123');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument();
      });
    });

    it('should clear field errors when user starts typing', async () => {
      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText(/email address/i);
      
      // Trigger error
      await user.click(emailInput);
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      });

      // Start typing to clear error
      await user.type(emailInput, 'test@example.com');

      await waitFor(() => {
        expect(screen.queryByText(/email is required/i)).not.toBeInTheDocument();
      });
    });

    it('should validate form on submission and show all errors', async () => {
      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('should call login service with correct credentials on valid form submission', async () => {
      const mockLogin = vi.mocked(authService.authService.login);
      mockLogin.mockResolvedValue({
        user: {
          id: '1',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          role: 'employee',
        } as any,
        token: 'mock-token',
        refreshToken: 'mock-refresh-token',
      });

      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
        });
      });
    });

    it('should show loading state during form submission', async () => {
      const mockLogin = vi.mocked(authService.authService.login);
      mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      // Check loading state
      expect(screen.getByText(/signing in/i)).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
      expect(emailInput).toBeDisabled();
      expect(passwordInput).toBeDisabled();
    });

    it('should not submit form with invalid data', async () => {
      const mockLogin = vi.mocked(authService.authService.login);

      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'invalid-email');
      await user.type(passwordInput, '123');
      await user.click(submitButton);

      // Should show validation errors and not call login
      await waitFor(() => {
        expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
        expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument();
      });

      expect(mockLogin).not.toHaveBeenCalled();
    });

    it('should prevent double submission', async () => {
      const mockLogin = vi.mocked(authService.authService.login);
      mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      
      // Click submit button multiple times quickly
      await user.click(submitButton);
      await user.click(submitButton);
      await user.click(submitButton);

      // Should only call login once
      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Error Handling', () => {
    it('should display authentication error from auth service', async () => {
      const mockLogin = vi.mocked(authService.authService.login);
      mockLogin.mockRejectedValue(new Error('Invalid credentials'));

      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'wrongpassword');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
      });
    });

    it('should display network error message', async () => {
      const mockLogin = vi.mocked(authService.authService.login);
      mockLogin.mockRejectedValue(new Error('Network error'));

      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      });
    });

    it('should display server error message', async () => {
      const mockLogin = vi.mocked(authService.authService.login);
      mockLogin.mockRejectedValue(new Error('Server error'));

      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/server error/i)).toBeInTheDocument();
      });
    });

    it('should clear errors when user starts typing after error', async () => {
      const mockLogin = vi.mocked(authService.authService.login);
      mockLogin.mockRejectedValue(new Error('Invalid credentials'));

      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'wrongpassword');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
      });

      // Start typing to clear error
      await user.type(emailInput, 'a');

      await waitFor(() => {
        expect(screen.queryByText(/invalid email or password/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long email addresses', async () => {
      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText(/email address/i);
      const longEmail = 'a'.repeat(250) + '@example.com';
      
      await user.type(emailInput, longEmail);
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/email address is too long/i)).toBeInTheDocument();
      });
    });

    it('should handle very long passwords', async () => {
      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      const passwordInput = screen.getByLabelText(/password/i);
      const longPassword = 'a'.repeat(130);
      
      await user.type(passwordInput, longPassword);
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/password is too long/i)).toBeInTheDocument();
      });
    });

    it('should handle whitespace-only email', async () => {
      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText(/email address/i);
      
      await user.type(emailInput, '   ');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      });
    });

    it('should validate complex email formats', async () => {
      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText(/email address/i);
      
      // Test valid complex email
      await user.clear(emailInput);
      await user.type(emailInput, 'test.email+tag@example.co.uk');
      await user.tab();

      await waitFor(() => {
        expect(screen.queryByText(/please enter a valid email address/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes for error states', async () => {
      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText(/email address/i);
      
      await user.click(emailInput);
      await user.tab();

      await waitFor(() => {
        expect(emailInput).toHaveAttribute('aria-invalid', 'true');
        expect(emailInput).toHaveAttribute('aria-describedby', 'email-error');
      });
    });

    it('should have proper role attributes for error messages', async () => {
      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText(/email address/i);
      
      await user.click(emailInput);
      await user.tab();

      await waitFor(() => {
        const errorMessage = screen.getByText(/email is required/i);
        expect(errorMessage).toHaveAttribute('role', 'alert');
      });
    });

    it('should maintain focus management during loading states', async () => {
      const mockLogin = vi.mocked(authService.authService.login);
      mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      // Button should still be focusable but disabled
      expect(submitButton).toBeDisabled();
      expect(submitButton).toHaveAttribute('type', 'submit');
    });
  });
});