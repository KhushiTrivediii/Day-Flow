import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts';
import type { UserRole } from '../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: UserRole[];
  redirectTo?: string;
  requireAuth?: boolean;
}

/**
 * ProtectedRoute component that handles authentication and role-based access control
 * 
 * @param children - The component(s) to render if access is granted
 * @param roles - Optional array of roles that are allowed to access this route
 * @param redirectTo - Optional custom redirect path (defaults to /login for auth, /unauthorized for roles)
 * @param requireAuth - Whether authentication is required (defaults to true)
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  roles = [],
  redirectTo,
  requireAuth = true,
}) => {
  const { state } = useAuth();
  const location = useLocation();

  // If authentication is required but user is not authenticated
  if (requireAuth && !state.isAuthenticated) {
    const loginRedirect = redirectTo || '/login';
    
    // Preserve the attempted location for redirect after login
    return (
      <Navigate 
        to={loginRedirect} 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // If user is authenticated but still loading, show loading state
  if (requireAuth && state.isAuthenticated && state.isLoading) {
    return (
      <div className="protected-route-loading" data-testid="protected-route-loading">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  // If specific roles are required, check user's role
  if (roles.length > 0 && state.user && state.role) {
    const hasRequiredRole = roles.includes(state.role);
    
    if (!hasRequiredRole) {
      const unauthorizedRedirect = redirectTo || '/unauthorized';
      
      return (
        <Navigate 
          to={unauthorizedRedirect} 
          state={{ 
            from: location,
            requiredRoles: roles,
            userRole: state.role 
          }} 
          replace 
        />
      );
    }
  }

  // If we reach here, access is granted
  return <>{children}</>;
};

/**
 * Higher-order component version of ProtectedRoute for easier composition
 */
export const withProtectedRoute = (
  Component: React.ComponentType<any>,
  options: Omit<ProtectedRouteProps, 'children'> = {}
) => {
  return (props: any) => (
    <ProtectedRoute {...options}>
      <Component {...props} />
    </ProtectedRoute>
  );
};

/**
 * Hook to check if current user has access to specific roles
 */
export const useRoleAccess = (requiredRoles: UserRole[] = []) => {
  const { state } = useAuth();
  
  const hasAccess = React.useMemo(() => {
    if (!state.isAuthenticated || !state.role) {
      return false;
    }
    
    if (requiredRoles.length === 0) {
      return true; // No specific roles required, just authentication
    }
    
    return requiredRoles.includes(state.role);
  }, [state.isAuthenticated, state.role, requiredRoles]);
  
  return {
    hasAccess,
    isAuthenticated: state.isAuthenticated,
    userRole: state.role,
    isLoading: state.isLoading,
  };
};

/**
 * Component to conditionally render content based on user roles
 */
interface RoleGuardProps {
  children: React.ReactNode;
  roles: UserRole[];
  fallback?: React.ReactNode;
  requireAuth?: boolean;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  roles,
  fallback = null,
  requireAuth = true,
}) => {
  const { hasAccess, isAuthenticated } = useRoleAccess(roles);
  
  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return <>{fallback}</>;
  }
  
  // If user doesn't have required role access
  if (!hasAccess) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;