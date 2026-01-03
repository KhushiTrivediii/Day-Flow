import React from 'react';
import { User, EmployeeCardProps } from '../types';
import styles from './EmployeeCard.module.css';

export const EmployeeCard: React.FC<EmployeeCardProps> = ({
  employee,
  onClick,
  showStatus = true,
  className = ''
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick(employee);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return '🟢';
      case 'on-leave':
        return '✈️';
      case 'absent':
      default:
        return '🟡';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'present':
        return 'Present';
      case 'on-leave':
        return 'On Leave';
      case 'absent':
      default:
        return 'Absent';
    }
  };

  const fullName = `${employee.firstName} ${employee.lastName}`;
  const statusIcon = getStatusIcon(employee.attendanceStatus.current);
  const statusLabel = getStatusLabel(employee.attendanceStatus.current);

  return (
    <div
      className={`${styles.employeeCard} ${className} ${onClick ? styles.clickable : ''}`}
      onClick={onClick ? handleClick : undefined}
      onKeyDown={onClick ? handleKeyDown : undefined}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? 'button' : undefined}
      aria-label={onClick ? `View details for ${fullName}` : undefined}
    >
      <div className={styles.profileSection}>
        <div className={styles.profilePictureContainer}>
          {employee.profilePicture ? (
            <img
              src={employee.profilePicture}
              alt={`${fullName} profile picture`}
              className={styles.profilePicture}
            />
          ) : (
            <div className={styles.profilePicturePlaceholder}>
              <span className={styles.initials}>
                {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
              </span>
            </div>
          )}
          {showStatus && (
            <div
              className={styles.statusIndicator}
              aria-label={`Status: ${statusLabel}`}
              title={statusLabel}
            >
              {statusIcon}
            </div>
          )}
        </div>
      </div>

      <div className={styles.infoSection}>
        <h3 className={styles.employeeName}>{fullName}</h3>
        <p className={styles.employeeId}>{employee.loginId}</p>
        <p className={styles.position}>{employee.jobDetails.position}</p>
        <p className={styles.department}>{employee.jobDetails.department}</p>
      </div>

      {onClick && (
        <div className={styles.actionIndicator}>
          <span className={styles.arrow}>→</span>
        </div>
      )}
    </div>
  );
};

export default EmployeeCard;