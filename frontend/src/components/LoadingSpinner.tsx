import React from 'react';
import { LoadingSpinnerProps } from '../types';
import styles from './LoadingSpinner.module.css';

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className = ''
}) => {
  const sizeClass = styles[size];

  return (
    <div
      className={`${styles.spinnerContainer} ${sizeClass} ${className}`}
      role="status"
      aria-label="Loading"
    >
      <div className={styles.spinner} aria-hidden="true">
        <div className={styles.spinnerInner}></div>
      </div>
      <span className={styles.srOnly}>Loading...</span>
    </div>
  );
};

export default LoadingSpinner;