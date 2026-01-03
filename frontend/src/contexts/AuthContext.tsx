import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User, UserRole, AuthState, LoginCredentials } from '../types';
import { authService } from '../services';

// Auth Action Types
export type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string; refreshToken: string } }
  | { type: 'LOGIN_FAILURE'; payload: { error: string } }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: { user: Partial<User> } }
  | { type: 'SET_LOADING'; payload: { isLoading: boolean } }
  | { type: 'CLEAR_ERROR' };

// Auth Context Type
export interface AuthContextType {
  state: AuthState;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  clearError: () => void;
  dispatch: React.Dispatch<AuthAction>;
}

// Initial Auth State
const initialAuthState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  role: null,
  error: undefined,
};

// Auth Reducer
export const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
        error: undefined,
      };

    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload.user,
        role: action.payload.user.role,
        error: undefined,
      };

    case 'LOGIN_FAILURE':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        role: null,
        error: action.payload.error,
      };

    case 'LOGOUT':
      return {
        ...initialAuthState,
      };

    case 'UPDATE_USER':
      if (!state.user) return state;
      
      const updatedUser = { ...state.user, ...action.payload.user };
      return {
        ...state,
        user: updatedUser,
        role: updatedUser.role,
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload.isLoading,
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: undefined,
      };

    default:
      return state;
  }
};

// Create Auth Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider Props
interface AuthProviderProps {
  children: ReactNode;
}

// Auth Provider Component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);

  // Initialize auth service with dispatch
  useEffect(() => {
    authService.setDispatch(dispatch);
  }, []);

  // Load authentication state from localStorage on mount
  useEffect(() => {
    const loadAuthState = async () => {
      try {
        const token = authService.getToken();
        const userData = authService.getUserData();

        if (token && userData && authService.isAuthenticated()) {
          // Verify token with backend
          const isValid = await authService.verifyToken(token);
          
          if (isValid) {
            dispatch({
              type: 'LOGIN_SUCCESS',
              payload: { 
                user: userData, 
                token, 
                refreshToken: authService.getRefreshToken() || '' 
              }
            });
          } else {
            // Token is invalid, clear stored data
            await authService.logout();
          }
        }
      } catch (error) {
        console.error('Error loading auth state:', error);
        await authService.logout();
      }
    };

    loadAuthState();
  }, []);

  // Login function using auth service
  const login = async (credentials: LoginCredentials) => {
    try {
      await authService.login(credentials);
    } catch (error) {
      // Error is already handled by auth service
      throw error;
    }
  };

  // Logout function using auth service
  const logout = () => {
    authService.logout();
  };

  // Update user function
  const updateUser = (user: Partial<User>) => {
    authService.updateUserData(user);
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const contextValue: AuthContextType = {
    state,
    login,
    logout,
    updateUser,
    clearError,
    dispatch,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use Auth Context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;