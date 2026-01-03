import { useContext } from 'react';
import ThemeContext from '../contexts/ThemeContext';

/**
 * Custom hook to access theme context
 * @returns Theme context with current theme state and methods to update it
 * @throws Error if used outside of ThemeProvider
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
};

export default useTheme;