import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { ThemeProvider, useTheme } from '../ThemeContext';

// Test component to access theme context
const TestComponent = () => {
  const { theme, toggleTheme, setTheme } = useTheme();
  
  return (
    <div>
      <div data-testid="theme-mode">{theme.mode}</div>
      <div data-testid="theme-color">{theme.primaryColor}</div>
      <button data-testid="toggle-theme" onClick={toggleTheme}>
        Toggle Theme
      </button>
      <button data-testid="set-light" onClick={() => setTheme('light')}>
        Set Light
      </button>
      <button data-testid="set-dark" onClick={() => setTheme('dark')}>
        Set Dark
      </button>
    </div>
  );
};

describe('ThemeContext', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Reset document attributes
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.style.removeProperty('--color-primary-override');
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Unit Tests', () => {
    it('should provide default theme when no localStorage data exists', () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId('theme-mode')).toHaveTextContent('light');
      expect(screen.getByTestId('theme-color')).toHaveTextContent('#ff6b35');
    });

    it('should load theme from localStorage if valid data exists', () => {
      const savedTheme = {
        mode: 'dark',
        primaryColor: '#ff6b35',
      };
      localStorage.setItem('dayflow-theme', JSON.stringify(savedTheme));

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId('theme-mode')).toHaveTextContent('dark');
      expect(screen.getByTestId('theme-color')).toHaveTextContent('#ff6b35');
    });

    it('should use default theme when localStorage contains invalid data', () => {
      localStorage.setItem('dayflow-theme', 'invalid-json');

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId('theme-mode')).toHaveTextContent('light');
      expect(screen.getByTestId('theme-color')).toHaveTextContent('#ff6b35');
    });

    it('should toggle theme between light and dark', () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      const toggleButton = screen.getByTestId('toggle-theme');
      const themeMode = screen.getByTestId('theme-mode');

      expect(themeMode).toHaveTextContent('light');

      act(() => {
        toggleButton.click();
      });

      expect(themeMode).toHaveTextContent('dark');

      act(() => {
        toggleButton.click();
      });

      expect(themeMode).toHaveTextContent('light');
    });

    it('should set specific theme mode', () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      const setDarkButton = screen.getByTestId('set-dark');
      const setLightButton = screen.getByTestId('set-light');
      const themeMode = screen.getByTestId('theme-mode');

      act(() => {
        setDarkButton.click();
      });

      expect(themeMode).toHaveTextContent('dark');

      act(() => {
        setLightButton.click();
      });

      expect(themeMode).toHaveTextContent('light');
    });

    it('should persist theme changes to localStorage', () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      const toggleButton = screen.getByTestId('toggle-theme');

      act(() => {
        toggleButton.click();
      });

      const savedTheme = JSON.parse(localStorage.getItem('dayflow-theme') || '{}');
      expect(savedTheme.mode).toBe('dark');
      expect(savedTheme.primaryColor).toBe('#ff6b35');
    });

    it('should apply theme to document element', () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(document.documentElement.getAttribute('data-theme')).toBe('light');

      const toggleButton = screen.getByTestId('toggle-theme');

      act(() => {
        toggleButton.click();
      });

      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('should throw error when useTheme is used outside ThemeProvider', () => {
      // Suppress console.error for this test
      const originalError = console.error;
      console.error = () => {};

      expect(() => {
        render(<TestComponent />);
      }).toThrow('useTheme must be used within a ThemeProvider');

      console.error = originalError;
    });
  });
});