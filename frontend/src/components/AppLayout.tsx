import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { ThemeToggle } from './ThemeToggle';
import styles from './AppLayout.module.css';

interface AppLayoutProps {
  children?: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { state: authState, logout } = useAuth();
  const { theme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const isAuthenticated = authState.isAuthenticated;
  const user = authState.user;

  return (
    <div className={styles.appLayout}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <Link to={isAuthenticated ? '/dashboard' : '/'} className={styles.logo}>
              <h1 className={styles.logoText}>Dayflow</h1>
              <span className={styles.logoSubtext}>HRMS</span>
            </Link>
          </div>

          <div className={styles.headerRight}>
            <ThemeToggle size="sm" />
            
            {isAuthenticated && user && (
              <div className={styles.userSection}>
                <button
                  className={styles.profileButton}
                  onClick={handleProfileClick}
                  aria-label="Open profile menu"
                >
                  {user.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt={`${user.firstName} ${user.lastName}`}
                      className={styles.profileImage}
                    />
                  ) : (
                    <div className={styles.profilePlaceholder}>
                      {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                    </div>
                  )}
                  <span className={styles.userName}>
                    {user.firstName} {user.lastName}
                  </span>
                </button>
                
                <button
                  className={styles.logoutButton}
                  onClick={handleLogout}
                  aria-label="Logout"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <polyline
                      points="16,17 21,12 16,7"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <line
                      x1="21"
                      y1="12"
                      x2="9"
                      y2="12"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className={styles.logoutText}>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className={styles.main}>
        {children || <Outlet />}
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <p>&copy; 2024 Dayflow HRMS. All rights reserved.</p>
          <div className={styles.footerLinks}>
            <a href="#privacy" className={styles.footerLink}>Privacy Policy</a>
            <a href="#terms" className={styles.footerLink}>Terms of Service</a>
            <a href="#support" className={styles.footerLink}>Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AppLayout;