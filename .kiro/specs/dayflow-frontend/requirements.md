# Requirements Document

## Introduction

Dayflow is a Human Resource Management System (HRMS) frontend application that provides a modern, responsive web interface for managing HR operations. The frontend will be built using Vite + React and will communicate with a backend API through a structured API layer.

## Glossary

- **Employee**: Regular user with limited access to personal information
- **Admin**: User with management privileges for all employees
- **HR_Officer**: User with employee management and approval privileges
- **Time_Off**: Leave requests including paid, sick, and unpaid leave
- **Attendance**: Daily check-in/check-out records with status tracking
- **Login_ID**: Auto-generated employee identifier in format OI[FirstName][LastName][Year][SerialNumber]
- **API_Layer**: Abstraction layer (api.ts) for backend communication with mock implementation
- **Dashboard**: Main interface showing role-specific information and quick actions

## Requirements

### Requirement 1: Authentication System

**User Story:** As a user, I want to securely log into the system, so that I can access my HR information and perform authorized actions.

#### Acceptance Criteria

1. WHEN a user enters valid credentials THEN the system SHALL authenticate and redirect to the appropriate dashboard
2. WHEN a user enters invalid credentials THEN the system SHALL display clear error messages
3. WHEN a user successfully logs in THEN the system SHALL store authentication state securely
4. WHEN a user clicks logout THEN the system SHALL clear authentication state and redirect to login
5. THE system SHALL support role-based access control for Employee, Admin, and HR_Officer roles

### Requirement 2: Employee Dashboard Interface

**User Story:** As an employee, I want a personalized dashboard, so that I can quickly access my profile, attendance, and leave information.

#### Acceptance Criteria

1. WHEN an employee logs in THEN the system SHALL display quick-access cards for Profile, Attendance, Leave Requests, and Logout
2. WHEN displaying employee cards THEN the system SHALL show profile picture and basic information
3. WHEN showing attendance status THEN the system SHALL display appropriate status indicators (🟢 present, ✈️ on leave, 🟡 absent)
4. WHEN an employee clicks a card THEN the system SHALL navigate to the corresponding feature
5. THE system SHALL show recent activity and alerts relevant to the employee

### Requirement 3: Admin Dashboard Interface

**User Story:** As an admin or HR officer, I want a management dashboard, so that I can oversee employee information, attendance, and leave approvals.

#### Acceptance Criteria

1. WHEN an admin logs in THEN the system SHALL display employee list, attendance records, and leave approvals
2. WHEN viewing employee cards THEN the system SHALL make them clickable to open employee information in view-only mode
3. WHEN displaying employee status THEN the system SHALL show real-time attendance indicators
4. WHEN an admin needs to switch contexts THEN the system SHALL provide ability to view different employee records
5. THE system SHALL provide administrative controls for employee management

### Requirement 4: Employee Profile Management

**User Story:** As a user, I want to view and manage employee profiles, so that I can maintain accurate personal and job information.

#### Acceptance Criteria

1. WHEN clicking "My Profile" THEN the system SHALL open the employee's profile in form view
2. WHEN clicking the profile picture THEN the system SHALL open a dropdown menu with "My Profile" and "Log Out" options
3. WHEN an employee views their profile THEN the system SHALL display personal details, job details, salary structure, documents, and profile picture
4. WHEN an employee edits their profile THEN the system SHALL allow modification of limited fields (address, phone, profile picture)
5. WHEN an admin edits employee profiles THEN the system SHALL allow modification of all employee details

### Requirement 5: Attendance Management Interface

**User Story:** As a user, I want to track and view attendance information, so that I can monitor work hours and attendance patterns.

#### Acceptance Criteria

1. WHEN an employee uses Check In/Check Out THEN the system SHALL update attendance status and change status indicators
2. WHEN viewing attendance THEN the system SHALL display day-wise attendance for the current month by default
3. WHEN an employee views attendance THEN the system SHALL show only their own attendance records
4. WHEN an admin views attendance THEN the system SHALL show attendance for all employees present on the current day
5. WHEN displaying attendance THEN the system SHALL include working time details and break information

### Requirement 6: Leave Management Interface

**User Story:** As a user, I want to manage leave requests, so that I can apply for time off and track approval status.

#### Acceptance Criteria

1. WHEN an employee applies for leave THEN the system SHALL provide options to select leave type, date range, and add remarks
2. WHEN displaying leave requests THEN the system SHALL show status as Pending, Approved, or Rejected
3. WHEN an employee views leave records THEN the system SHALL display only their own time off records
4. WHEN an admin views leave records THEN the system SHALL display time off records for all employees with approve/reject options
5. WHEN leave status changes THEN the system SHALL reflect updates immediately in employee records

### Requirement 7: Salary Information Display

**User Story:** As a user, I want to view salary information, so that I can understand compensation structure and components.

#### Acceptance Criteria

1. WHEN viewing salary information THEN the system SHALL display wage type, working schedule, and salary components
2. WHEN showing salary components THEN the system SHALL include Basic, HRA, Standard Allowance, Performance Bonus, LTA, and Fixed Allowance
3. WHEN displaying component calculations THEN the system SHALL show computation type and percentage values
4. WHEN wage amounts change THEN the system SHALL auto-update salary component values
5. THE system SHALL ensure total components do not exceed defined wage and display calculations clearly

### Requirement 8: API Integration Layer

**User Story:** As a developer, I want a structured API layer, so that I can easily switch between mock and real backend implementations.

#### Acceptance Criteria

1. THE system SHALL implement an API abstraction layer (api.ts) for all backend communication
2. WHEN in development mode THEN the system SHALL use mock implementations that simulate real API responses
3. WHEN switching to production THEN the system SHALL easily replace mock implementations with actual backend calls
4. THE API layer SHALL handle authentication, error handling, and response formatting consistently
5. THE system SHALL structure mock data to match expected backend response formats

### Requirement 9: Responsive Design and User Experience

**User Story:** As a user, I want a responsive and intuitive interface, so that I can use the system effectively on different devices.

#### Acceptance Criteria

1. THE system SHALL provide responsive design that works on desktop, tablet, and mobile devices
2. WHEN users interact with the interface THEN the system SHALL provide clear visual feedback and loading states
3. THE system SHALL maintain consistent styling and branding with orange as the primary brand color
4. THE system SHALL support both dark mode and light mode themes with user preference persistence
5. WHEN users switch themes THEN the system SHALL apply the selected theme across all components and maintain accessibility standards
6. WHEN errors occur THEN the system SHALL display user-friendly error messages with clear next steps
7. THE system SHALL provide intuitive navigation and clear information hierarchy

### Requirement 10: Real-time Status Updates

**User Story:** As a user, I want real-time status updates, so that I can see current attendance and leave status accurately.

#### Acceptance Criteria

1. WHEN an employee checks in THEN the system SHALL immediately change the red status dot to green
2. WHEN attendance status changes THEN the system SHALL update status indicators across all relevant views
3. WHEN leave requests are approved/rejected THEN the system SHALL update status in real-time
4. THE system SHALL maintain status consistency across dashboard cards and detailed views
5. THE system SHALL handle status updates gracefully with appropriate loading states