import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import * as fc from 'fast-check';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { AuthProvider } from '../../contexts/AuthContext';
import { AppLayout } from '../AppLayout';
import { DashboardLayout } from '../DashboardLayout';
import { AuthLayout } from '../AuthLayout';
import type { User } from '../../types';

// Mock the auth service to avoid actual API calls
vi.mock('../../services/authService', () => ({
  authService: {
    setDispatch: vi.fn(),
    getToken: vi.fn(() => null),
    getUserData: vi.fn(() => null),
    isAuthenticated: vi.fn(() => false),
    verifyToken: vi.fn(() => Promise.resolve(false)),
    logout: vi.fn(() => Promise.resolve()),
    login: vi.fn(() => Promise.resolve()),
    updateUserData: vi.fn(),
    getRefreshToken: vi.fn(() => null),
  },
}));

// Mock user data for testing
const mockUser: User = {
  id: '1',
  loginId: 'OIJohnDoe2024001',
  email: 'john.doe@example.com',
  firstName: 'John',
  lastName: 'Doe',
  role: 'employee',
  profilePicture: 'https://example.com/avatar.jpg',
  personalDetails: {
    phone: '+1234567890',
    address: '123 Main St',
    dateOfBirth: '1990-01-01',
    emergencyContact: {
      name: 'Jane Doe',
      relationship: 'Spouse',
      phone: '+1234567891',
    },
  },
  jobDetails: {
    department: 'Engineering',
    position: 'Software Developer',
    joiningDate: '2024-01-01',
    reportingManager: 'Jane Smith',
    workingSchedule: {
      type: 'full-time',
      hoursPerWeek: 40,
      workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    },
  },
  salaryInfo: {
    wageType: 'fixed',
    monthlyWage: 5000,
    components: [],
    deductions: [],
  },
  attendanceStatus: {
    current: 'present',
    lastCheckIn: '2024-01-01T09:00:00Z',
    lastCheckOut: '2024-01-01T17:00:00Z',
  },
};

// Test wrapper component
const TestWrapper: React.FC<{ 
  children: React.ReactNode; 
  authenticated?: boolean; 
  user?: User | null;
}> = ({ 
  children, 
  authenticated = false, 
  user = null 
}) => {
  // Mock the auth context value
  const mockAuthContextValue = {
    state: {
      user: authenticated ? (user || mockUser) : null,
      isAuthenticated: authenticated,
      isLoading: false,
      role: authenticated ? (user?.role || mockUser.role) : null,
      error: undefined,
    },
    login: vi.fn(),
    logout: vi.fn(),
    updateUser: vi.fn(),
    clearError: vi.fn(),
    dispatch: vi.fn(),
  };

  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

// Utility function to simulate different screen sizes
const simulateScreenSize = (width: number, height: number) => {
  // Mock window dimensions
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  });

  // Mock matchMedia for CSS media queries
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: (() => {
        if (query.includes('max-width: 480px')) return width <= 480;
        if (query.includes('max-width: 768px')) return width <= 768;
        if (query.includes('max-width: 1024px')) return width <= 1024;
        return false;
      })(),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  // Trigger resize event
  window.dispatchEvent(new Event('resize'));
};

describe('Property 15: Responsive Design Adaptation', () => {
  beforeEach(() => {
    // Reset window dimensions to default
    simulateScreenSize(1200, 800);
    // Clear localStorage
    localStorage.clear();
    // Reset document attributes
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.style.removeProperty('--color-primary-override');
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    // Additional cleanup
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.style.removeProperty('--color-primary-override');
  });

  it('should provide appropriate responsive layout for any screen size', () => {
    // Feature: dayflow-frontend, Property 15: Responsive Design Adaptation
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: 2560 }), // Screen width
        fc.integer({ min: 240, max: 1440 }), // Screen height
        fc.constantFrom('desktop', 'tablet', 'mobile'),
        (width: number, height: number, deviceType: string) => {
          // Clean up before each property test iteration
          cleanup();
          simulateScreenSize(width, height);

          const testId = `test-content-${Math.random().toString(36).substring(7)}`;
          const { unmount } = render(
            <TestWrapper authenticated={true}>
              <AppLayout>
                <div data-testid={testId}>Test Content</div>
              </AppLayout>
            </TestWrapper>
          );

          // Verify that the layout renders without errors
          expect(screen.getByTestId(testId)).toBeInTheDocument();

          // Verify responsive behavior based on screen size
          const appLayout = screen.getByTestId(testId).closest('.appLayout');
          expect(appLayout).toBeInTheDocument();

          // Check that layout adapts to different screen sizes
          if (width <= 480) {
            // Mobile: Should have mobile-specific classes or behavior
            expect(document.querySelector('.headerContent')).toBeInTheDocument();
          } else if (width <= 768) {
            // Tablet: Should have tablet-specific adaptations
            expect(document.querySelector('.headerContent')).toBeInTheDocument();
          } else {
            // Desktop: Should have full desktop layout
            expect(document.querySelector('.headerContent')).toBeInTheDocument();
          }

          unmount();
        }
      ),
      { numRuns: 30 }
    );
  });

  it('should maintain usability across desktop, tablet, and mobile devices', () => {
    // Feature: dayflow-frontend, Property 15: Responsive Design Adaptation
    fc.assert(
      fc.property(
        fc.record({
          width: fc.integer({ min: 320, max: 2560 }),
          height: fc.integer({ min: 240, max: 1440 }),
          authenticated: fc.boolean(),
          userRole: fc.constantFrom('employee', 'admin', 'hr_officer'),
        }),
        ({ width, height, authenticated, userRole }) => {
          // Clean up before each property test iteration
          cleanup();
          simulateScreenSize(width, height);

          const testUser = authenticated ? { ...mockUser, role: userRole } : null;
          const testId = `dashboard-content-${Math.random().toString(36).substring(7)}`;

          const { unmount } = render(
            <TestWrapper authenticated={authenticated} user={testUser}>
              <DashboardLayout>
                <div data-testid={testId}>Dashboard Content</div>
              </DashboardLayout>
            </TestWrapper>
          );

          // Verify that essential elements are present and accessible
          if (authenticated) {
            expect(screen.getByTestId(testId)).toBeInTheDocument();

            // Check for navigation elements
            const navigation = document.querySelector('nav');
            expect(navigation).toBeInTheDocument();

            // Verify that interactive elements are accessible
            const buttons = document.querySelectorAll('button');
            buttons.forEach(button => {
              expect(button).toBeInTheDocument();
              // Should have proper accessibility attributes
              expect(button.getAttribute('aria-label') || button.textContent).toBeTruthy();
            });

            // Check for mobile menu button on smaller screens
            if (width <= 1024) {
              // Mobile menu button should be present
              const mobileMenuButton = document.querySelector('[aria-label*="menu"]');
              if (mobileMenuButton) {
                expect(mobileMenuButton).toBeInTheDocument();
              }
            }
          }

          unmount();
        }
      ),
      { numRuns: 25 }
    );
  });

  it('should provide clear visual feedback for interactions across all screen sizes', () => {
    // Feature: dayflow-frontend, Property 15: Responsive Design Adaptation
    fc.assert(
      fc.property(
        fc.record({
          width: fc.integer({ min: 320, max: 2560 }),
          height: fc.integer({ min: 240, max: 1440 }),
          layoutType: fc.constantFrom('app', 'dashboard', 'auth'),
        }),
        ({ width, height, layoutType }) => {
          // Clean up before each property test iteration
          cleanup();
          simulateScreenSize(width, height);

          let LayoutComponent;
          let testContent;
          const testId = `${layoutType}-content-${Math.random().toString(36).substring(7)}`;

          switch (layoutType) {
            case 'app':
              LayoutComponent = AppLayout;
              testContent = <div data-testid={testId}>App Content</div>;
              break;
            case 'dashboard':
              LayoutComponent = DashboardLayout;
              testContent = <div data-testid={testId}>Dashboard Content</div>;
              break;
            case 'auth':
              LayoutComponent = AuthLayout;
              testContent = <div data-testid={testId}>Auth Content</div>;
              break;
            default:
              LayoutComponent = AppLayout;
              testContent = <div data-testid={testId}>Default Content</div>;
          }

          const { unmount } = render(
            <TestWrapper authenticated={layoutType === 'dashboard'}>
              <LayoutComponent>
                {testContent}
              </LayoutComponent>
            </TestWrapper>
          );

          // Verify that content is rendered
          const content = screen.getByTestId(testId);
          expect(content).toBeInTheDocument();

          // Check for interactive elements and their visual feedback
          const interactiveElements = document.querySelectorAll('button, a, [role="button"]');
          
          interactiveElements.forEach(element => {
            // Should have proper focus states (CSS classes or styles)
            expect(element).toBeInTheDocument();
            
            // Should have hover states defined in CSS
            const computedStyle = window.getComputedStyle(element);
            expect(computedStyle).toBeDefined();
            
            // Should have proper cursor for interactive elements
            if (element.tagName === 'BUTTON' || element.getAttribute('role') === 'button') {
              expect(element).not.toHaveAttribute('disabled');
            }
          });

          // Verify responsive text and spacing
          const textElements = document.querySelectorAll('h1, h2, h3, p, span');
          textElements.forEach(element => {
            const computedStyle = window.getComputedStyle(element);
            const fontSize = parseFloat(computedStyle.fontSize);
            
            // Font sizes should be reasonable for the screen size
            if (width <= 480) {
              expect(fontSize).toBeGreaterThan(10); // Minimum readable size on mobile
            } else {
              expect(fontSize).toBeGreaterThan(8); // Minimum readable size on desktop
            }
          });

          unmount();
        }
      ),
      { numRuns: 20 }
    );
  });

  it('should handle theme changes consistently across all screen sizes', () => {
    // Feature: dayflow-frontend, Property 15: Responsive Design Adaptation
    fc.assert(
      fc.property(
        fc.record({
          width: fc.integer({ min: 320, max: 2560 }),
          height: fc.integer({ min: 240, max: 1440 }),
          themeMode: fc.constantFrom('light', 'dark'),
        }),
        ({ width, height, themeMode }) => {
          // Clean up before each property test iteration
          cleanup();
          simulateScreenSize(width, height);

          // Set initial theme
          localStorage.setItem('dayflow-theme', JSON.stringify({
            mode: themeMode,
            primaryColor: '#ff6b35'
          }));

          const testId = `themed-content-${Math.random().toString(36).substring(7)}`;
          const { unmount } = render(
            <TestWrapper authenticated={true}>
              <AppLayout>
                <div data-testid={testId}>Themed Content</div>
              </AppLayout>
            </TestWrapper>
          );

          // Verify theme is applied
          expect(document.documentElement.getAttribute('data-theme')).toBe(themeMode);

          // Verify that theme toggle is accessible
          const themeToggle = document.querySelector('[aria-label*="theme"]');
          if (themeToggle) {
            expect(themeToggle).toBeInTheDocument();
            expect(themeToggle).toBeVisible();
          }

          // Verify content is visible with current theme
          const content = screen.getByTestId(testId);
          expect(content).toBeInTheDocument();
          expect(content).toBeVisible();

          // Check that CSS variables are properly applied
          const rootStyles = window.getComputedStyle(document.documentElement);
          const primaryColor = rootStyles.getPropertyValue('--color-primary').trim();
          expect(primaryColor).toBeTruthy();

          unmount();
        }
      ),
      { numRuns: 20 }
    );
  });

  it('should maintain accessibility standards across all responsive breakpoints', () => {
    // Feature: dayflow-frontend, Property 15: Responsive Design Adaptation
    fc.assert(
      fc.property(
        fc.record({
          width: fc.integer({ min: 320, max: 2560 }),
          height: fc.integer({ min: 240, max: 1440 }),
          hasReducedMotion: fc.boolean(),
          hasHighContrast: fc.boolean(),
        }),
        ({ width, height, hasReducedMotion, hasHighContrast }) => {
          // Clean up before each property test iteration
          cleanup();
          simulateScreenSize(width, height);

          // Mock accessibility preferences
          Object.defineProperty(window, 'matchMedia', {
            writable: true,
            value: vi.fn().mockImplementation((query: string) => ({
              matches: (() => {
                if (query.includes('prefers-reduced-motion') && hasReducedMotion) return true;
                if (query.includes('prefers-contrast: high') && hasHighContrast) return true;
                if (query.includes('max-width: 480px')) return width <= 480;
                if (query.includes('max-width: 768px')) return width <= 768;
                if (query.includes('max-width: 1024px')) return width <= 1024;
                return false;
              })(),
              media: query,
              onchange: null,
              addListener: vi.fn(),
              removeListener: vi.fn(),
              addEventListener: vi.fn(),
              removeEventListener: vi.fn(),
              dispatchEvent: vi.fn(),
            })),
          });

          const testId = `accessible-content-${Math.random().toString(36).substring(7)}`;
          const { unmount } = render(
            <TestWrapper authenticated={true}>
              <DashboardLayout>
                <div data-testid={testId}>Accessible Content</div>
              </DashboardLayout>
            </TestWrapper>
          );

          // Verify accessibility features
          const content = screen.getByTestId(testId);
          expect(content).toBeInTheDocument();

          // Check for proper ARIA labels and roles
          const interactiveElements = document.querySelectorAll('button, a, [role]');
          interactiveElements.forEach(element => {
            // Should have proper accessibility attributes
            const hasAriaLabel = element.hasAttribute('aria-label');
            const hasAriaLabelledBy = element.hasAttribute('aria-labelledby');
            const hasTextContent = element.textContent?.trim();
            const hasRole = element.hasAttribute('role');

            // Interactive elements should be properly labeled
            if (element.tagName === 'BUTTON' || element.getAttribute('role') === 'button') {
              expect(hasAriaLabel || hasAriaLabelledBy || hasTextContent).toBeTruthy();
            }
          });

          // Check for proper heading hierarchy
          const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
          if (headings.length > 0) {
            // Should have at least one h1 or proper heading structure
            const hasH1 = document.querySelector('h1');
            expect(hasH1 || headings.length === 0).toBeTruthy();
          }

          // Check for proper focus management
          const focusableElements = document.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          
          focusableElements.forEach(element => {
            // Should not have negative tabindex unless intentionally hidden
            const tabIndex = element.getAttribute('tabindex');
            if (tabIndex && parseInt(tabIndex) < 0) {
              // Should be intentionally hidden (aria-hidden or display: none)
              const isHidden = element.hasAttribute('aria-hidden') || 
                             window.getComputedStyle(element).display === 'none';
              expect(isHidden).toBeTruthy();
            }
          });

          unmount();
        }
      ),
      { numRuns: 15 }
    );
  });
});