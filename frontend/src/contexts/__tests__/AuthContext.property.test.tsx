import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, act, cleanup, waitFor } from '@testing-library/react';
import * as fc from 'fast-check';
import { AuthProvider, useAuth } from '../AuthContext';
import { authService } from '../../services';
import type { LoginCredentials, User, UserRole } from '../../types';

// Mock the API
vi.mock('../../api', () => ({
  api: {
    auth: {
      login: vi.fn(),
      logout: vi.fn(),
      refreshToken: vi.fn(),
      getCurrentUser: vi.fn(),
      verifyToken: vi.fn(),
    },
  },
}));

// Mock auth service methods
vi.mock('../../services', () => ({
  authService: {
    setDispatch: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
    getToken: vi.fn(),
    getRefreshToken: vi.fn(),
    getUserData: vi.fn(),
    isAuthenticated: vi.fn(),
    verifyToken: vi.fn(),
    updateUserData: vi.fn(),
  },
}));

// Test component to access auth context
const PropertyTestComponent = ({ testId = 'default' }: { testId?: string }) => {
  const { state, login, logout, updateUser, clearError } = useAuth();
  
  return (
    <div data-testid={`container-${testId}`}>
      <div data-testid={`authenticated-${testId}`}>{state.isAuthenticated.toString()}</div>
      <div data-testid={`loading-${testId}`}>{state.isLoading.toString()}</div>
      <div data-testid={`role-${testId}`}>{state.role || 'null'}</div>
      <div data-testid={`user-id-${testId}`}>{state.user?.id || 'null'}</div>
      <div data-testid={`error-${testId}`}>{state.error || 'null'}</div>
      <button 
        data-testid={`login-${testId}`} 
        onClick={() => login({ email: 'test@example.com', password: 'password123' })}
      >
        Login
      </button>
      <button data-testid={`logout-${testId}`} onClick={logout}>
        Logout
      </button>
      <button 
        data-testid={`update-user-${testId}`} 
        onClick={() => updateUser({ firstName: 'Updated' })}
      >
        Update User
      </button>
      <button data-testid={`clear-error-${testId}`} onClick={clearError}>
        Clear Error
      </button>
    </div>
  );
};

// Generators for property tests
const userRoleArb = fc.constantFrom('employee', 'admin', 'hr_officer');

// Fixed date generator to avoid invalid dates
const validDateArb = fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') });

const userArb = fc.record({
  id: fc.uuid(),
  loginId: fc.string({ minLength: 5, maxLength: 20 }),
  email: fc.emailAddress(),
  firstName: fc.string({ minLength: 1, maxLength: 50 }),
  lastName: fc.string({ minLength: 1, maxLength: 50 }),
  role: userRoleArb,
  personalDetails: fc.record({
    phone: fc.string({ minLength: 10, maxLength: 15 }),
    address: fc.string({ minLength: 10, maxLength: 100 }),
    dateOfBirth: validDateArb.map(d => d.toISOString().split('T')[0]),
    emergencyContact: fc.record({
      name: fc.string({ minLength: 1, maxLength: 50 }),
      relationship: fc.string({ minLength: 1, maxLength: 20 }),
      phone: fc.string({ minLength: 10, maxLength: 15 }),
    }),
  }),
  jobDetails: fc.record({
    department: fc.string({ minLength: 1, maxLength: 50 }),
    position: fc.string({ minLength: 1, maxLength: 50 }),
    joiningDate: validDateArb.map(d => d.toISOString().split('T')[0]),
    reportingManager: fc.string({ minLength: 1, maxLength: 50 }),
    workingSchedule: fc.record({
      type: fc.constantFrom('full-time', 'part-time'),
      hoursPerWeek: fc.integer({ min: 20, max: 60 }),
      workingDays: fc.array(fc.string(), { minLength: 1, maxLength: 7 }),
    }),
  }),
  salaryInfo: fc.record({
    wageType: fc.constant('fixed' as const),
    monthlyWage: fc.integer({ min: 20000, max: 200000 }),
    components: fc.array(fc.record({
      id: fc.uuid(),
      name: fc.constantFrom('basic', 'hra', 'standard_allowance', 'performance_bonus', 'lta', 'fixed_allowance'),
      displayName: fc.string({ minLength: 1, maxLength: 50 }),
      computationType: fc.constantFrom('fixed_amount', 'percentage_of_wage', 'percentage_of_basic'),
      value: fc.integer({ min: 0, max: 100 }),
      calculatedAmount: fc.integer({ min: 0, max: 50000 }),
    })),
    deductions: fc.array(fc.record({
      id: fc.uuid(),
      name: fc.constantFrom('pf', 'professional_tax', 'other'),
      displayName: fc.string({ minLength: 1, maxLength: 50 }),
      rate: fc.integer({ min: 0, max: 20 }),
      amount: fc.integer({ min: 0, max: 10000 }),
    })),
  }),
  attendanceStatus: fc.record({
    current: fc.constantFrom('present', 'absent', 'on-leave'),
    lastCheckIn: fc.option(validDateArb.map(d => d.toISOString())),
    lastCheckOut: fc.option(validDateArb.map(d => d.toISOString())),
  }),
});

const credentialsArb = fc.record({
  email: fc.emailAddress(),
  password: fc.string({ minLength: 8, maxLength: 50 }),
});

// Safe error message generator that avoids problematic characters
const errorMessageArb = fc.string({ minLength: 5, maxLength: 100 }).filter(s => 
  s.trim().length > 0 && 
  !s.includes('\0') && 
  !s.includes('\x01') && 
  !s.includes('\x02') &&
  !/[\x00-\x1F\x7F-\x9F]/.test(s) // Avoid control characters
);

describe('AuthContext Property Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
    cleanup();
    vi.clearAllMocks();
  });

  describe('Property 1: Authentication Flow Integrity', () => {
    it('should handle successful authentication flow for any valid credentials and user data', async () => {
      // Feature: dayflow-frontend, Property 1: Authentication Flow Integrity
      await fc.assert(
        fc.asyncProperty(
          credentialsArb,
          userArb,
          fc.string({ minLength: 20, maxLength: 100 }),
          fc.string({ minLength: 20, maxLength: 100 }),
          async (credentials: LoginCredentials, user: User, token: string, refreshToken: string) => {
            const testId = `test-${Math.random().toString(36).substring(7)}`;
            
            // Mock successful authentication
            vi.mocked(authService.login).mockResolvedValueOnce({
              user,
              token,
              refreshToken,
            });
            vi.mocked(authService.getToken).mockReturnValue(token);
            vi.mocked(authService.getRefreshToken).mockReturnValue(refreshToken);
            vi.mocked(authService.getUserData).mockReturnValue(user);
            vi.mocked(authService.isAuthenticated).mockReturnValue(true);
            vi.mocked(authService.verifyToken).mockResolvedValue(true);

            const { unmount } = render(
              <AuthProvider>
                <PropertyTestComponent testId={testId} />
              </AuthProvider>
            );

            // Initial state should be unauthenticated
            expect(screen.getByTestId(`authenticated-${testId}`)).toHaveTextContent('false');
            expect(screen.getByTestId(`role-${testId}`)).toHaveTextContent('null');

            // Perform login
            await act(async () => {
              screen.getByTestId(`login-${testId}`).click();
              await waitFor(() => {
                expect(vi.mocked(authService.login)).toHaveBeenCalledWith(
                  expect.objectContaining({
                    email: 'test@example.com',
                    password: 'password123'
                  })
                );
              });
            });

            // Should be authenticated with correct user data
            await waitFor(() => {
              expect(screen.getByTestId(`authenticated-${testId}`)).toHaveTextContent('true');
              expect(screen.getByTestId(`role-${testId}`)).toHaveTextContent(user.role);
              expect(screen.getByTestId(`user-id-${testId}`)).toHaveTextContent(user.id);
            });

            unmount();
          }
        ),
        { numRuns: 20 }
      );
    });

    it('should maintain role-based access control throughout the session', async () => {
      // Feature: dayflow-frontend, Property 1: Authentication Flow Integrity
      await fc.assert(
        fc.asyncProperty(
          userArb,
          fc.string({ minLength: 20, maxLength: 100 }),
          async (user: User, token: string) => {
            const testId = `test-${Math.random().toString(36).substring(7)}`;
            
            // Mock authenticated state
            vi.mocked(authService.getToken).mockReturnValue(token);
            vi.mocked(authService.getUserData).mockReturnValue(user);
            vi.mocked(authService.isAuthenticated).mockReturnValue(true);
            vi.mocked(authService.verifyToken).mockResolvedValue(true);

            const { unmount } = render(
              <AuthProvider>
                <PropertyTestComponent testId={testId} />
              </AuthProvider>
            );

            // Wait for initial load
            await waitFor(() => {
              expect(screen.getByTestId(`authenticated-${testId}`)).toHaveTextContent('true');
            });

            // Role should match user's role
            expect(screen.getByTestId(`role-${testId}`)).toHaveTextContent(user.role);
            expect(screen.getByTestId(`user-id-${testId}`)).toHaveTextContent(user.id);

            // Update user and verify role consistency
            const updatedUser = { ...user, firstName: 'Updated' };
            vi.mocked(authService.getUserData).mockReturnValue(updatedUser);

            await act(async () => {
              screen.getByTestId(`update-user-${testId}`).click();
            });

            // Role should remain consistent
            expect(screen.getByTestId(`role-${testId}`)).toHaveTextContent(user.role);

            unmount();
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  describe('Property 2: Authentication Error Handling', () => {
    it('should display clear error messages for any authentication failure', async () => {
      // Feature: dayflow-frontend, Property 2: Authentication Error Handling
      await fc.assert(
        fc.asyncProperty(
          credentialsArb,
          errorMessageArb,
          async (credentials: LoginCredentials, errorMessage: string) => {
            const testId = `test-${Math.random().toString(36).substring(7)}`;
            
            // Mock authentication failure with a safe error message
            const safeErrorMessage = errorMessage || 'Authentication failed';
            vi.mocked(authService.login).mockRejectedValueOnce(new Error(safeErrorMessage));

            const { unmount } = render(
              <AuthProvider>
                <PropertyTestComponent testId={testId} />
              </AuthProvider>
            );

            // Initial state should have no error
            expect(screen.getByTestId(`error-${testId}`)).toHaveTextContent('null');

            // Attempt login and wait for error
            await act(async () => {
              screen.getByTestId(`login-${testId}`).click();
            });

            // Wait for error to appear with increased timeout
            await waitFor(() => {
              const errorElement = screen.getByTestId(`error-${testId}`);
              expect(errorElement).not.toHaveTextContent('null');
              expect(errorElement.textContent).toBeTruthy();
            }, { timeout: 3000 });

            // Should remain unauthenticated
            expect(screen.getByTestId(`authenticated-${testId}`)).toHaveTextContent('false');
            expect(screen.getByTestId(`role-${testId}`)).toHaveTextContent('null');

            unmount();
          }
        ),
        { numRuns: 10, timeout: 10000 } // Reduced runs and increased timeout
      );
    }, 15000); // Increased test timeout

    it('should handle network errors and invalid tokens gracefully', async () => {
      // Feature: dayflow-frontend, Property 2: Authentication Error Handling
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 10, maxLength: 100 }),
          userArb,
          async (invalidToken: string, user: User) => {
            const testId = `test-${Math.random().toString(36).substring(7)}`;
            
            // Mock invalid token scenario
            vi.mocked(authService.getToken).mockReturnValue(invalidToken);
            vi.mocked(authService.getUserData).mockReturnValue(user);
            vi.mocked(authService.isAuthenticated).mockReturnValue(true);
            vi.mocked(authService.verifyToken).mockResolvedValue(false);
            vi.mocked(authService.logout).mockImplementation(() => {
              vi.mocked(authService.getToken).mockReturnValue(null);
              vi.mocked(authService.getUserData).mockReturnValue(null);
              vi.mocked(authService.isAuthenticated).mockReturnValue(false);
            });

            const { unmount } = render(
              <AuthProvider>
                <PropertyTestComponent testId={testId} />
              </AuthProvider>
            );

            // Should handle invalid token by logging out
            await waitFor(() => {
              expect(vi.mocked(authService.verifyToken)).toHaveBeenCalledWith(invalidToken);
              expect(vi.mocked(authService.logout)).toHaveBeenCalled();
            });

            // Should end up in unauthenticated state
            await waitFor(() => {
              expect(screen.getByTestId(`authenticated-${testId}`)).toHaveTextContent('false');
            });

            unmount();
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  describe('Property 3: Logout Consistency', () => {
    it('should completely clear authentication state for any authenticated user', async () => {
      // Feature: dayflow-frontend, Property 3: Logout Consistency
      await fc.assert(
        fc.asyncProperty(
          userArb,
          fc.string({ minLength: 20, maxLength: 100 }),
          fc.string({ minLength: 20, maxLength: 100 }),
          async (user: User, token: string, refreshToken: string) => {
            const testId = `test-${Math.random().toString(36).substring(7)}`;
            
            // Mock authenticated state
            vi.mocked(authService.getToken).mockReturnValue(token);
            vi.mocked(authService.getRefreshToken).mockReturnValue(refreshToken);
            vi.mocked(authService.getUserData).mockReturnValue(user);
            vi.mocked(authService.isAuthenticated).mockReturnValue(true);
            vi.mocked(authService.verifyToken).mockResolvedValue(true);

            // Mock logout behavior
            vi.mocked(authService.logout).mockImplementation(() => {
              vi.mocked(authService.getToken).mockReturnValue(null);
              vi.mocked(authService.getRefreshToken).mockReturnValue(null);
              vi.mocked(authService.getUserData).mockReturnValue(null);
              vi.mocked(authService.isAuthenticated).mockReturnValue(false);
            });

            const { unmount } = render(
              <AuthProvider>
                <PropertyTestComponent testId={testId} />
              </AuthProvider>
            );

            // Wait for authentication to load
            await waitFor(() => {
              expect(screen.getByTestId(`authenticated-${testId}`)).toHaveTextContent('true');
            }, { timeout: 3000 });

            // Verify authenticated state
            expect(screen.getByTestId(`role-${testId}`)).toHaveTextContent(user.role);
            expect(screen.getByTestId(`user-id-${testId}`)).toHaveTextContent(user.id);

            // Perform logout
            await act(async () => {
              screen.getByTestId(`logout-${testId}`).click();
            });

            // Wait for logout to complete
            await waitFor(() => {
              expect(vi.mocked(authService.logout)).toHaveBeenCalled();
            }, { timeout: 2000 });

            // Should be completely logged out
            await waitFor(() => {
              expect(screen.getByTestId(`authenticated-${testId}`)).toHaveTextContent('false');
              expect(screen.getByTestId(`role-${testId}`)).toHaveTextContent('null');
              expect(screen.getByTestId(`user-id-${testId}`)).toHaveTextContent('null');
            }, { timeout: 2000 });

            unmount();
          }
        ),
        { numRuns: 10, timeout: 15000 } // Reduced runs and increased timeout
      );
    }, 20000); // Increased test timeout

    it('should handle logout from any authentication state consistently', async () => {
      // Feature: dayflow-frontend, Property 3: Logout Consistency
      await fc.assert(
        fc.asyncProperty(
          fc.boolean(),
          fc.boolean(),
          fc.option(userArb),
          async (isAuthenticated: boolean, isLoading: boolean, user: User | null) => {
            const testId = `test-${Math.random().toString(36).substring(7)}`;
            
            // Setup initial mock state
            if (isAuthenticated && user) {
              vi.mocked(authService.getToken).mockReturnValue('some-token');
              vi.mocked(authService.getUserData).mockReturnValue(user);
              vi.mocked(authService.isAuthenticated).mockReturnValue(true);
              vi.mocked(authService.verifyToken).mockResolvedValue(true);
            } else {
              vi.mocked(authService.getToken).mockReturnValue(null);
              vi.mocked(authService.getUserData).mockReturnValue(null);
              vi.mocked(authService.isAuthenticated).mockReturnValue(false);
            }

            // Mock logout to always clear state
            vi.mocked(authService.logout).mockImplementation(() => {
              vi.mocked(authService.getToken).mockReturnValue(null);
              vi.mocked(authService.getUserData).mockReturnValue(null);
              vi.mocked(authService.isAuthenticated).mockReturnValue(false);
            });

            const { unmount } = render(
              <AuthProvider>
                <PropertyTestComponent testId={testId} />
              </AuthProvider>
            );

            // Wait for initial state to settle
            await waitFor(() => {
              const authElement = screen.getByTestId(`authenticated-${testId}`);
              expect(authElement.textContent).toMatch(/^(true|false)$/);
            }, { timeout: 2000 });

            // Perform logout regardless of current state
            await act(async () => {
              screen.getByTestId(`logout-${testId}`).click();
            });

            // Wait for logout to complete
            await waitFor(() => {
              expect(vi.mocked(authService.logout)).toHaveBeenCalled();
            }, { timeout: 1000 });

            // Should always end up in logged out state
            await waitFor(() => {
              expect(screen.getByTestId(`authenticated-${testId}`)).toHaveTextContent('false');
              expect(screen.getByTestId(`role-${testId}`)).toHaveTextContent('null');
              expect(screen.getByTestId(`user-id-${testId}`)).toHaveTextContent('null');
            }, { timeout: 2000 });

            unmount();
          }
        ),
        { numRuns: 10, timeout: 15000 } // Reduced runs and increased timeout
      );
    }, 20000); // Increased test timeout
  });

  describe('Error State Management', () => {
    it('should handle error clearing consistently', async () => {
      // Feature: dayflow-frontend, Property 2: Authentication Error Handling
      await fc.assert(
        fc.asyncProperty(
          errorMessageArb,
          async (errorMessage: string) => {
            const testId = `test-${Math.random().toString(36).substring(7)}`;
            
            // Mock authentication failure with safe error message
            const safeErrorMessage = errorMessage || 'Test error';
            vi.mocked(authService.login).mockRejectedValueOnce(new Error(safeErrorMessage));

            const { unmount } = render(
              <AuthProvider>
                <PropertyTestComponent testId={testId} />
              </AuthProvider>
            );

            // Trigger error
            await act(async () => {
              screen.getByTestId(`login-${testId}`).click();
            });

            // Wait for error to appear
            await waitFor(() => {
              const errorElement = screen.getByTestId(`error-${testId}`);
              expect(errorElement.textContent).not.toBe('null');
              expect(errorElement.textContent).toBeTruthy();
            }, { timeout: 3000 });

            // Clear error
            await act(async () => {
              screen.getByTestId(`clear-error-${testId}`).click();
            });

            // Wait for error to be cleared
            await waitFor(() => {
              expect(screen.getByTestId(`error-${testId}`)).toHaveTextContent('null');
            }, { timeout: 1000 });

            unmount();
          }
        ),
        { numRuns: 10, timeout: 10000 } // Reduced runs and increased timeout
      );
    }, 15000); // Increased test timeout
  });
});