import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LoginCredentials } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import styles from './LoginPage.module.css';

interface LocationState {
  from?: {
    pathname: string;
  };
}

interface ValidationErrors {
  email?: string;
  password?: string;
  general?: string;
}

interface TouchedFields {
  email?: boolean;
  password?: boolean;
}

export const LoginPage: React.FC = () => {
  const { state: authState, login, clearError } = useAuth();
  const location = useLocation();
  const locationState = location.state as LocationState;
  
  // Form state
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: '',
  });
  
  // Form validation state
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<TouchedFields>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Clear errors when component mounts or when user starts typing
  useEffect(() => {
    clearError();
  }, [clearError]);

  // Clear auth errors when user starts typing
  useEffect(() => {
    if (authState.error) {
      clearError();
      setErrors(prev => ({ ...prev, general: undefined }));
    }
  }, [credentials, clearError, authState.error]);

  // Redirect if already authenticated
  if (authState.isAuthenticated) {
    const from = locationState?.from?.pathname || '/dashboard';
    return <Navigate to={from} replace />;
  }

  // Enhanced form validation
  const validateField = (name: keyof LoginCredentials, value: string): string => {
    switch (name) {
      case 'email':
        if (!value.trim()) {
          return 'Email is required';
        }
        // More comprehensive email validation
        const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        if (!emailRegex.test(value.trim())) {
          return 'Please enter a valid email address';
        }
        if (value.length > 254) {
          return 'Email address is too long';
        }
        return '';
      
      case 'password':
        if (!value) {
          return 'Password is required';
        }
        if (value.length < 6) {
          return 'Password must be at least 6 characters';
        }
        if (value.length > 128) {
          return 'Password is too long';
        }
        return '';
      
      default:
        return '';
    }
  };

  // Validate all fields
  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};
    let isValid = true;

    (Object.keys(credentials) as Array<keyof LoginCredentials>).forEach((key) => {
      const error = validateField(key, credentials[key]);
      if (error) {
        newErrors[key] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  // Handle input change with real-time validation
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const fieldName = name as keyof LoginCredentials;
    
    setCredentials(prev => ({
      ...prev,
      [fieldName]: value,
    }));

    // Clear field error when user starts typing
    if (errors[fieldName]) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: undefined,
      }));
    }

    // Real-time validation for touched fields
    if (touched[fieldName]) {
      const error = validateField(fieldName, value);
      setErrors(prev => ({
        ...prev,
        [fieldName]: error || undefined,
      }));
    }
  };

  // Handle input blur
  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const fieldName = name as keyof LoginCredentials;
    
    setTouched(prev => ({
      ...prev,
      [fieldName]: true,
    }));

    // Validate field on blur
    const error = validateField(fieldName, value);
    setErrors(prev => ({
      ...prev,
      [fieldName]: error || undefined,
    }));
  };

  // Enhanced form submission with better error handling
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent double submission
    if (isSubmitting || authState.isLoading) {
      return;
    }

    // Mark all fields as touched
    setTouched({
      email: true,
      password: true,
    });

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await login(credentials);
      // Navigation will be handled by the redirect logic above
    } catch (error) {
      // Enhanced error handling
      let errorMessage = 'Login failed. Please try again.';
      
      if (error instanceof Error) {
        // Handle specific error types
        if (error.message.includes('Invalid credentials')) {
          errorMessage = 'Invalid email or password. Please check your credentials and try again.';
        } else if (error.message.includes('Account locked')) {
          errorMessage = 'Your account has been temporarily locked. Please contact support.';
        } else if (error.message.includes('Network')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else if (error.message.includes('Server')) {
          errorMessage = 'Server error. Please try again in a few moments.';
        } else {
          errorMessage = error.message;
        }
      }

      setErrors(prev => ({
        ...prev,
        general: errorMessage,
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if field has error and is touched
  const getFieldError = (field: keyof LoginCredentials): string => {
    return touched[field] && errors[field] ? errors[field]! : '';
  };

  // Check if field is invalid
  const isFieldInvalid = (field: keyof LoginCredentials): boolean => {
    return Boolean(touched[field] && errors[field]);
  };

  // Check if form is loading
  const isLoading = authState.isLoading || isSubmitting;

  // Get display error (prioritize general errors from validation over auth errors)
  const displayError = errors.general || authState.error;

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginCard}>
        <div className={styles.loginHeader}>
          <h1 className={styles.loginTitle}>Welcome Back</h1>
          <p className={styles.loginSubtitle}>
            Sign in to your Dayflow account to continue
          </p>
        </div>

        <form className={styles.loginForm} onSubmit={handleSubmit} noValidate>
          {/* Email Field */}
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.formLabel}>
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={credentials.email}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              className={`${styles.formInput} ${
                isFieldInvalid('email') ? styles.formInputError : ''
              }`}
              placeholder="Enter your email address"
              autoComplete="email"
              disabled={isLoading}
              aria-describedby={getFieldError('email') ? 'email-error' : undefined}
              aria-invalid={isFieldInvalid('email')}
            />
            {getFieldError('email') && (
              <div id="email-error" className={styles.formError} role="alert">
                {getFieldError('email')}
              </div>
            )}
          </div>

          {/* Password Field */}
          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.formLabel}>
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              className={`${styles.formInput} ${
                isFieldInvalid('password') ? styles.formInputError : ''
              }`}
              placeholder="Enter your password"
              autoComplete="current-password"
              disabled={isLoading}
              aria-describedby={getFieldError('password') ? 'password-error' : undefined}
              aria-invalid={isFieldInvalid('password')}
            />
            {getFieldError('password') && (
              <div id="password-error" className={styles.formError} role="alert">
                {getFieldError('password')}
              </div>
            )}
          </div>

          {/* Authentication Error */}
          {displayError && (
            <div className={styles.authError} role="alert">
              <svg
                className={styles.errorIcon}
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
                <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              {displayError}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className={styles.buttonContent}>
                <LoadingSpinner size="sm" />
                <span>Signing In...</span>
              </div>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Additional Links */}
        <div className={styles.loginFooter}>
          <p className={styles.footerText}>
            Need help accessing your account?{' '}
            <a href="#support" className={styles.footerLink}>
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;