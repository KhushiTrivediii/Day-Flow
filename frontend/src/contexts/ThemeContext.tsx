import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { ThemeMode, ThemeState } from '../types';

interface ThemeContextType {
  theme: ThemeState;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

const THEME_STORAGE_KEY = 'dayflow-theme';

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Initialize theme from localStorage or default to light mode
  const [theme, setThemeState] = useState<ThemeState>(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved) {
        const parsedTheme = JSON.parse(saved);
        // Validate the parsed theme
        if (parsedTheme && typeof parsedTheme === 'object' && 
            (parsedTheme.mode === 'light' || parsedTheme.mode === 'dark') &&
            typeof parsedTheme.primaryColor === 'string') {
          return parsedTheme;
        }
      }
    } catch (error) {
      console.warn('Failed to parse theme from localStorage:', error);
    }
    
    // Default theme
    return {
      mode: 'light' as ThemeMode,
      primaryColor: '#ff6b35',
    };
  });

  // Apply theme to document on mount and when theme changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme.mode);
    
    // Also set the primary color as a CSS custom property if needed
    document.documentElement.style.setProperty('--color-primary-override', theme.primaryColor);
  }, [theme]);

  // Save theme to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(theme));
    } catch (error) {
      console.warn('Failed to save theme to localStorage:', error);
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setThemeState(prevTheme => ({
      ...prevTheme,
      mode: prevTheme.mode === 'light' ? 'dark' : 'light',
    }));
  }, []);

  const setTheme = useCallback((mode: ThemeMode) => {
    setThemeState(prevTheme => ({
      ...prevTheme,
      mode,
    }));
  }, []);

  const contextValue: ThemeContextType = {
    theme,
    toggleTheme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;