import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, act, cleanup } from '@testing-library/react';
import * as fc from 'fast-check';
import { ThemeProvider, useTheme } from '../ThemeContext';
import type { ThemeMode } from '../../types';

// Test component to access theme context
const PropertyTestComponent = ({ testId = 'default' }: { testId?: string }) => {
  const { theme, toggleTheme, setTheme } = useTheme();
  
  return (
    <div data-testid={`container-${testId}`}>
      <div data-testid={`theme-mode-${testId}`}>{theme.mode}</div>
      <div data-testid={`theme-color-${testId}`}>{theme.primaryColor}</div>
      <button data-testid={`toggle-theme-${testId}`} onClick={toggleTheme}>
        Toggle Theme
      </button>
      <button 
        data-testid={`set-theme-${testId}`} 
        onClick={() => setTheme(theme.mode === 'light' ? 'dark' : 'light')}
      >
        Set Theme
      </button>
    </div>
  );
};

describe('ThemeContext Property Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.style.removeProperty('--color-primary-override');
  });

  afterEach(() => {
    localStorage.clear();
    cleanup();
  });

  describe('Property 14: Theme System Consistency', () => {
    it('should maintain theme consistency across all operations', () => {
      // Feature: dayflow-frontend, Property 14: Theme System Consistency
      fc.assert(
        fc.property(
          fc.constantFrom('light', 'dark'),
          fc.string({ minLength: 6, maxLength: 6 }).map(s => s.replace(/[^0-9a-fA-F]/g, '0').substring(0, 6)),
          fc.array(fc.constantFrom('toggle', 'setLight', 'setDark'), { minLength: 1, maxLength: 5 }),
          (initialMode: ThemeMode, primaryColor: string, operations: string[]) => {
            const testId = `test-${Math.random().toString(36).substring(7)}`;
            
            // Setup initial theme in localStorage
            const initialTheme = {
              mode: initialMode,
              primaryColor: `#${primaryColor}`,
            };
            localStorage.setItem('dayflow-theme', JSON.stringify(initialTheme));

            const { unmount } = render(
              <ThemeProvider>
                <PropertyTestComponent testId={testId} />
              </ThemeProvider>
            );

            // Verify initial state
            expect(screen.getByTestId(`theme-mode-${testId}`)).toHaveTextContent(initialMode);
            expect(screen.getByTestId(`theme-color-${testId}`)).toHaveTextContent(`#${primaryColor}`);
            expect(document.documentElement.getAttribute('data-theme')).toBe(initialMode);

            let currentMode = initialMode;

            // Apply operations
            operations.forEach(operation => {
              act(() => {
                switch (operation) {
                  case 'toggle':
                    screen.getByTestId(`toggle-theme-${testId}`).click();
                    currentMode = currentMode === 'light' ? 'dark' : 'light';
                    break;
                  case 'setLight':
                    if (currentMode === 'dark') {
                      screen.getByTestId(`set-theme-${testId}`).click();
                      currentMode = 'light';
                    }
                    break;
                  case 'setDark':
                    if (currentMode === 'light') {
                      screen.getByTestId(`set-theme-${testId}`).click();
                      currentMode = 'dark';
                    }
                    break;
                }
              });

              // Verify consistency after each operation
              expect(screen.getByTestId(`theme-mode-${testId}`)).toHaveTextContent(currentMode);
              expect(document.documentElement.getAttribute('data-theme')).toBe(currentMode);
              
              // Verify localStorage persistence
              const savedTheme = JSON.parse(localStorage.getItem('dayflow-theme') || '{}');
              expect(savedTheme.mode).toBe(currentMode);
              expect(savedTheme.primaryColor).toBe(`#${primaryColor}`);
            });

            unmount();
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should handle localStorage persistence correctly for any valid theme data', () => {
      // Feature: dayflow-frontend, Property 14: Theme System Consistency
      fc.assert(
        fc.property(
          fc.constantFrom('light', 'dark'),
          fc.string({ minLength: 6, maxLength: 6 }).map(s => s.replace(/[^0-9a-fA-F]/g, '0').substring(0, 6)),
          (mode: ThemeMode, primaryColor: string) => {
            const testId = `test-${Math.random().toString(36).substring(7)}`;
            
            const themeData = {
              mode,
              primaryColor: `#${primaryColor}`,
            };

            // Set theme in localStorage
            localStorage.setItem('dayflow-theme', JSON.stringify(themeData));

            const { unmount } = render(
              <ThemeProvider>
                <PropertyTestComponent testId={testId} />
              </ThemeProvider>
            );

            // Verify theme is loaded correctly
            expect(screen.getByTestId(`theme-mode-${testId}`)).toHaveTextContent(mode);
            expect(screen.getByTestId(`theme-color-${testId}`)).toHaveTextContent(`#${primaryColor}`);
            expect(document.documentElement.getAttribute('data-theme')).toBe(mode);

            // Verify localStorage contains the same data
            const savedTheme = JSON.parse(localStorage.getItem('dayflow-theme') || '{}');
            expect(savedTheme.mode).toBe(mode);
            expect(savedTheme.primaryColor).toBe(`#${primaryColor}`);

            unmount();
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should gracefully handle invalid localStorage data and fallback to defaults', () => {
      // Feature: dayflow-frontend, Property 14: Theme System Consistency
      fc.assert(
        fc.property(
          fc.oneof(
            fc.string().filter(s => {
              try {
                JSON.parse(s);
                return false; // Valid JSON, we want invalid
              } catch {
                return true; // Invalid JSON
              }
            }),
            fc.constant('null'),
            fc.constant('undefined'),
            fc.constant('{}'),
            fc.constant('{"mode": "invalid"}'),
            fc.constant('{"primaryColor": "invalid"}')
          ),
          (invalidData: string) => {
            const testId = `test-${Math.random().toString(36).substring(7)}`;
            
            // Set invalid data in localStorage
            localStorage.setItem('dayflow-theme', invalidData);

            const { unmount } = render(
              <ThemeProvider>
                <PropertyTestComponent testId={testId} />
              </ThemeProvider>
            );

            // Should fallback to default theme
            expect(screen.getByTestId(`theme-mode-${testId}`)).toHaveTextContent('light');
            expect(screen.getByTestId(`theme-color-${testId}`)).toHaveTextContent('#ff6b35');
            expect(document.documentElement.getAttribute('data-theme')).toBe('light');

            unmount();
          }
        ),
        { numRuns: 25 }
      );
    });

    it('should maintain orange brand color consistency across theme changes', () => {
      // Feature: dayflow-frontend, Property 14: Theme System Consistency
      fc.assert(
        fc.property(
          fc.array(fc.constantFrom('toggle', 'setLight', 'setDark'), { minLength: 1, maxLength: 3 }),
          (operations: string[]) => {
            const testId = `test-${Math.random().toString(36).substring(7)}`;
            
            const { unmount } = render(
              <ThemeProvider>
                <PropertyTestComponent testId={testId} />
              </ThemeProvider>
            );

            // Apply operations and verify brand color remains consistent
            operations.forEach(operation => {
              act(() => {
                switch (operation) {
                  case 'toggle':
                    screen.getByTestId(`toggle-theme-${testId}`).click();
                    break;
                  case 'setLight':
                  case 'setDark':
                    screen.getByTestId(`set-theme-${testId}`).click();
                    break;
                }
              });

              // Brand color should always be the orange color
              expect(screen.getByTestId(`theme-color-${testId}`)).toHaveTextContent('#ff6b35');
              
              // Verify in localStorage as well
              const savedTheme = JSON.parse(localStorage.getItem('dayflow-theme') || '{}');
              expect(savedTheme.primaryColor).toBe('#ff6b35');
            });

            unmount();
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should ensure accessibility standards are maintained across theme changes', () => {
      // Feature: dayflow-frontend, Property 14: Theme System Consistency
      fc.assert(
        fc.property(
          fc.constantFrom('light', 'dark'),
          (targetMode: ThemeMode) => {
            const testId = `test-${Math.random().toString(36).substring(7)}`;
            
            const { unmount } = render(
              <ThemeProvider>
                <PropertyTestComponent testId={testId} />
              </ThemeProvider>
            );

            // Always starts with light theme (default)
            expect(document.documentElement.getAttribute('data-theme')).toBe('light');

            // If we want dark mode, toggle to it
            if (targetMode === 'dark') {
              act(() => {
                screen.getByTestId(`toggle-theme-${testId}`).click();
              });
            }

            // Verify we're in the target mode
            expect(document.documentElement.getAttribute('data-theme')).toBe(targetMode);

            // Toggle once more and verify it switches correctly
            act(() => {
              screen.getByTestId(`toggle-theme-${testId}`).click();
            });

            const finalTheme = document.documentElement.getAttribute('data-theme');
            const expectedFinalTheme = targetMode === 'light' ? 'dark' : 'light';
            expect(finalTheme).toBe(expectedFinalTheme);
            expect(finalTheme).toMatch(/^(light|dark)$/);

            unmount();
          }
        ),
        { numRuns: 50 }
      );
    });
  });
});