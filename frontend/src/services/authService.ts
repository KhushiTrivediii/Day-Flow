import { api } from '../api';
import { LoginCredentials, AuthResponse, User } from '../types';
import { AuthAction } from '../contexts/AuthContext';

// Token storage keys
const TOKEN_KEY = 'dayflow-auth-token';
const REFRESH_TOKEN_KEY = 'dayflow-refresh-token';
const USER_DATA_KEY = 'dayflow-user-data';

// Token refresh threshold (5 minutes before expiration)
const REFRESH_THRESHOLD = 5 * 60 * 1000;

export class AuthService {
  private refreshTimer: NodeJS.Timeout | null = null;
  private dispatch: React.Dispatch<AuthAction> | null = null;

  constructor() {
    this.setupTokenRefresh();
  }

  // Set the dispatch function from AuthContext
  setDispatch(dispatch: React.Dispatch<AuthAction>) {
    this.dispatch = dispatch;
  }

  // Login method
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      if (!this.dispatch) {
        throw new Error('Auth service not properly initialized');
      }

      this.dispatch({ type: 'LOGIN_START' });

      const response = await api.auth.login(credentials);
      
      // Store tokens securely
      this.storeTokens(response.token, response.refreshToken);
      
      // Store user data
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(response.user));

      // Dispatch success action
      this.dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: response.user,
          token: response.token,
          refreshToken: response.refreshToken,
        },
      });

      // Setup automatic token refresh
      this.scheduleTokenRefresh(response.token);

      return response;
    } catch (error) {
      if (this.dispatch) {
        this.dispatch({
          type: 'LOGIN_FAILURE',
          payload: {
            error: error instanceof Error ? error.message : 'Login failed',
          },
        });
      }
      throw error;
    }
  }

  // Logout method
  async logout(): Promise<void> {
    try {
      // Call API logout if available
      await api.auth.logout();
    } catch (error) {
      console.warn('API logout failed:', error);
    } finally {
      // Clear all stored data
      this.clearTokens();
      
      // Clear refresh timer
      if (this.refreshTimer) {
        clearTimeout(this.refreshTimer);
        this.refreshTimer = null;
      }

      // Dispatch logout action
      if (this.dispatch) {
        this.dispatch({ type: 'LOGOUT' });
      }
    }
  }

  // Get current user
  async getCurrentUser(): Promise<User | null> {
    try {
      const token = this.getToken();
      if (!token) {
        return null;
      }

      // Verify token is still valid
      const isValid = await this.verifyToken(token);
      if (!isValid) {
        await this.logout();
        return null;
      }

      return await api.auth.getCurrentUser();
    } catch (error) {
      console.error('Failed to get current user:', error);
      await this.logout();
      return null;
    }
  }

  // Refresh token
  async refreshToken(): Promise<string | null> {
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await api.auth.refreshToken();
      
      // Store new tokens
      this.storeTokens(response.token, response.refreshToken);
      
      // Update user data if provided
      if (response.user) {
        localStorage.setItem(USER_DATA_KEY, JSON.stringify(response.user));
        
        if (this.dispatch) {
          this.dispatch({
            type: 'UPDATE_USER',
            payload: { user: response.user },
          });
        }
      }

      // Schedule next refresh
      this.scheduleTokenRefresh(response.token);

      return response.token;
    } catch (error) {
      console.error('Token refresh failed:', error);
      await this.logout();
      return null;
    }
  }

  // Verify token validity
  async verifyToken(token: string): Promise<boolean> {
    try {
      return await api.auth.verifyToken(token);
    } catch (error) {
      console.error('Token verification failed:', error);
      return false;
    }
  }

  // Get stored token
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  // Get stored refresh token
  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      // Basic JWT expiration check
      const payload = JSON.parse(atob(token.split('.')[1]));
      const isExpired = payload.exp * 1000 < Date.now();
      return !isExpired;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return false;
    }
  }

  // Store tokens securely
  private storeTokens(token: string, refreshToken: string): void {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }

  // Clear all stored tokens and data
  private clearTokens(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_DATA_KEY);
  }

  // Setup automatic token refresh
  private setupTokenRefresh(): void {
    const token = this.getToken();
    if (token && this.isAuthenticated()) {
      this.scheduleTokenRefresh(token);
    }
  }

  // Schedule token refresh before expiration
  private scheduleTokenRefresh(token: string): void {
    try {
      // Clear existing timer
      if (this.refreshTimer) {
        clearTimeout(this.refreshTimer);
      }

      // Parse token to get expiration
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = payload.exp * 1000;
      const currentTime = Date.now();
      const timeUntilRefresh = expirationTime - currentTime - REFRESH_THRESHOLD;

      // Only schedule if we have enough time
      if (timeUntilRefresh > 0) {
        this.refreshTimer = setTimeout(() => {
          this.refreshToken();
        }, timeUntilRefresh);
      } else {
        // Token is about to expire or already expired, refresh immediately
        this.refreshToken();
      }
    } catch (error) {
      console.error('Error scheduling token refresh:', error);
    }
  }

  // Get user data from localStorage
  getUserData(): User | null {
    try {
      const userData = localStorage.getItem(USER_DATA_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }

  // Update stored user data
  updateUserData(user: Partial<User>): void {
    try {
      const currentUser = this.getUserData();
      if (currentUser) {
        const updatedUser = { ...currentUser, ...user };
        localStorage.setItem(USER_DATA_KEY, JSON.stringify(updatedUser));
        
        if (this.dispatch) {
          this.dispatch({
            type: 'UPDATE_USER',
            payload: { user: updatedUser },
          });
        }
      }
    } catch (error) {
      console.error('Error updating user data:', error);
    }
  }
}

// Create singleton instance
export const authService = new AuthService();

// Export default
export default authService;