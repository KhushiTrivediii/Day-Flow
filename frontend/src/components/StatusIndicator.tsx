import React from 'react';
import { AttendanceStatus, StatusIndicatorProps } from '../types';
import styles from './StatusIndicator.module.css';

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  size = 'md',
  showLabel = false
}) => {
  const getStatusConfig = (status: AttendanceStatus) => {
    switch (status) {
      case 'present':
        return {
          icon: '🟢',
          label: 'Present',
          className: styles.present,
          ariaLabel: 'Employee is present'
        };
      case 'on-leave':
        return {
          icon: '✈️',
          label: 'On Leave',
          className: styles.onLeave,
          ariaLabel: 'Employee is on leave'
        };
      case 'absent':
      default:
        return {
          icon: '🟡',
          label: 'Absent',
          className: styles.absent,
          ariaLabel: 'Employee is absent'
        };
    }
  };

  const statusConfig = getStatusConfig(status);
  const sizeClass = styles[size];

  return (
    <div
      className={`${styles.statusIndicator} ${sizeClass} ${statusConfig.className}`}
      role="img"
      aria-label={statusConfig.ariaLabel}
      title={statusConfig.label}
    >
      <span className={styles.icon} aria-hidden="true">
        {statusConfig.icon}
      </span>
      {showLabel && (
        <span className={styles.label}>
          {statusConfig.label}
        </span>
      )}
    </div>
  );
};

export default StatusIndicator;