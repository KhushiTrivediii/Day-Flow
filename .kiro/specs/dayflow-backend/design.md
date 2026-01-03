# Design Document: Dayflow Backend

## Overview

The Dayflow Backend is a RESTful API service built with Express.js, TypeScript, and Prisma ORM that provides comprehensive HR management functionality. The system follows a layered architecture with clear separation of concerns, implementing secure authentication, role-based authorization, and comprehensive data management for employee information, attendance tracking, leave management, and payroll calculations.

## Architecture

### High-Level Architecture

```mermaid
graph TB
    A[Client Applications] --> B[Express.js API Server]
    B --> C[Authentication Middleware]
    B --> D[Validation Middleware]
    B --> E[Route Controllers]
    E --> F[Service Layer]
    F --> G[Prisma Client]
    G --> H[PostgreSQL Database]
    B --> I[Email Service]
    I --> J[Nodemailer]
    K[Docker Container] --> H
```

### Technology Stack

- **Runtime**: Node.js with TypeScript for type safety
- **Framework**: Express.js for HTTP server and routing
- **Database**: PostgreSQL with Docker containerization
- **ORM**: Prisma for database schema management and queries
- **Authentication**: JWT tokens with bcrypt password hashing
- **Email**: Nodemailer for email notifications
- **Validation**: Joi or Zod for request validation
- **Testing**: Jest for unit testing, Supertest for API testing

### Layered Architecture

#### 1. API Layer (Controllers)
- Handle HTTP requests and responses
- Input validation and sanitization
- Authentication and authorization checks
- Error handling and response formatting

#### 2. Service Layer (Business Logic)
- Core business logic implementation
- Data transformation and validation
- Integration between different domains
- Email notifications and external service calls

#### 3. Data Access Layer (Prisma)
- Database operations and queries
- Transaction management
- Data model relationships
- Query optimization

#### 4. Database Layer (PostgreSQL)
- Data persistence and storage
- Referential integrity constraints
- Indexing for performance
- Backup and recovery

## Components and Interfaces

### Core Modules

#### Authentication Module
```typescript
interface AuthService {
  login(credentials: LoginCredentials): Promise<AuthResponse>;
  register(employeeData: CreateEmployeeRequest): Promise<Employee>;
  refreshToken(token: string): Promise<AuthResponse>;
  resetPassword(email: string): Promise<void>;
  changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void>;
}

interface AuthResponse {
  token: string;
  refreshToken: string;
  user: UserProfile;
  expiresIn: number;
}
```

#### Employee Management Module
```typescript
interface EmployeeService {
  createEmployee(data: CreateEmployeeRequest): Promise<Employee>;
  getEmployee(id: string): Promise<Employee>;
  updateEmployee(id: string, data: UpdateEmployeeRequest): Promise<Employee>;
  getEmployees(filters: EmployeeFilters): Promise<PaginatedResponse<Employee>>;
  generateLoginId(firstName: string, lastName: string, joiningYear: number): Promise<string>;
}

interface CreateEmployeeRequest {
  firstName: string;
  lastName: string;
  email: string;
  personalDetails: PersonalDetails;
  jobDetails: JobDetails;
  salaryInfo: SalaryInfo;
}
```

#### Attendance Module
```typescript
interface AttendanceService {
  checkIn(employeeId: string): Promise<AttendanceRecord>;
  checkOut(employeeId: string): Promise<AttendanceRecord>;
  getAttendance(employeeId: string, filters: AttendanceFilters): Promise<AttendanceRecord[]>;
  getAttendanceReport(filters: ReportFilters): Promise<AttendanceReport>;
  calculateWorkingHours(checkIn: Date, checkOut: Date, breaks: Break[]): number;
}

interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: Date;
  checkIn?: Date;
  checkOut?: Date;
  workingHours: number;
  breakTime: number;
  status: AttendanceStatus;
  remarks?: string;
}
```

#### Leave Management Module
```typescript
interface LeaveService {
  applyLeave(employeeId: string, request: LeaveRequest): Promise<Leave>;
  approveLeave(leaveId: string, approverId: string, comments?: string): Promise<Leave>;
  rejectLeave(leaveId: string, approverId: string, comments: string): Promise<Leave>;
  getLeaveRequests(filters: LeaveFilters): Promise<PaginatedResponse<Leave>>;
  getLeaveBalance(employeeId: string, year: number): Promise<LeaveBalance>;
}

interface LeaveRequest {
  type: LeaveType;
  startDate: Date;
  endDate: Date;
  reason: string;
  halfDay?: boolean;
}
```

#### Salary Management Module
```typescript
interface SalaryService {
  calculateSalary(employeeId: string): Promise<SalaryCalculation>;
  updateSalaryStructure(employeeId: string, structure: SalaryStructure): Promise<Employee>;
  generatePayslip(employeeId: string, month: number, year: number): Promise<Payslip>;
  getSalaryComponents(): Promise<SalaryComponent[]>;
}

interface SalaryCalculation {
  basicSalary: number;
  allowances: Allowance[];
  deductions: Deduction[];
  grossSalary: number;
  netSalary: number;
}
```

### Middleware Components

#### Authentication Middleware
```typescript
interface AuthMiddleware {
  authenticate(req: Request, res: Response, next: NextFunction): void;
  authorize(roles: UserRole[]): (req: Request, res: Response, next: NextFunction) => void;
  validateToken(token: string): Promise<JWTPayload>;
}
```

#### Validation Middleware
```typescript
interface ValidationMiddleware {
  validateRequest(schema: ValidationSchema): (req: Request, res: Response, next: NextFunction) => void;
  sanitizeInput(req: Request, res: Response, next: NextFunction): void;
}
```

#### Error Handling Middleware
```typescript
interface ErrorHandler {
  handleError(error: Error, req: Request, res: Response, next: NextFunction): void;
  handleNotFound(req: Request, res: Response, next: NextFunction): void;
  formatErrorResponse(error: Error): ErrorResponse;
}
```

## Data Models

### Database Schema Design

#### User/Employee Model
```prisma
model Employee {
  id                String    @id @default(cuid())
  loginId           String    @unique
  email             String    @unique
  passwordHash      String
  firstName         String
  lastName          String
  role              UserRole  @default(EMPLOYEE)
  isActive          Boolean   @default(true)
  profilePicture    String?
  
  // Personal Details
  phone             String?
  address           String?
  dateOfBirth       DateTime?
  emergencyContact  Json?
  
  // Job Details
  department        String
  position          String
  joiningDate       DateTime
  reportingManager  String?
  workingSchedule   Json
  
  // Salary Information
  monthlyWage       Decimal
  salaryComponents  SalaryComponent[]
  
  // Relationships
  attendanceRecords AttendanceRecord[]
  leaveRequests     LeaveRequest[]
  
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  @@map("employees")
}
```

#### Attendance Model
```prisma
model AttendanceRecord {
  id            String            @id @default(cuid())
  employeeId    String
  employee      Employee          @relation(fields: [employeeId], references: [id])
  date          DateTime          @db.Date
  checkIn       DateTime?
  checkOut      DateTime?
  workingHours  Decimal           @default(0)
  breakTime     Int               @default(0) // minutes
  status        AttendanceStatus  @default(ABSENT)
  remarks       String?
  
  createdAt     DateTime          @default(now())
  updatedAt     DateTime          @updatedAt
  
  @@unique([employeeId, date])
  @@map("attendance_records")
}

enum AttendanceStatus {
  PRESENT
  ABSENT
  HALF_DAY
  LEAVE
}
```

#### Leave Management Model
```prisma
model LeaveRequest {
  id          String      @id @default(cuid())
  employeeId  String
  employee    Employee    @relation(fields: [employeeId], references: [id])
  type        LeaveType
  startDate   DateTime    @db.Date
  endDate     DateTime    @db.Date
  days        Int
  reason      String
  status      LeaveStatus @default(PENDING)
  appliedDate DateTime    @default(now())
  approvedBy  String?
  approvedDate DateTime?
  comments    String?
  
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  
  @@map("leave_requests")
}

enum LeaveType {
  PAID
  SICK
  UNPAID
  CASUAL
  MATERNITY
  PATERNITY
}

enum LeaveStatus {
  PENDING
  APPROVED
  REJECTED
}
```

#### Salary Component Model
```prisma
model SalaryComponent {
  id              String            @id @default(cuid())
  employeeId      String
  employee        Employee          @relation(fields: [employeeId], references: [id])
  name            ComponentType
  displayName     String
  computationType ComputationType
  value           Decimal           // percentage or fixed amount
  calculatedAmount Decimal          @default(0)
  isActive        Boolean           @default(true)
  
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt
  
  @@map("salary_components")
}

enum ComponentType {
  BASIC
  HRA
  STANDARD_ALLOWANCE
  PERFORMANCE_BONUS
  LTA
  FIXED_ALLOWANCE
  PF_DEDUCTION
  PROFESSIONAL_TAX
}

enum ComputationType {
  FIXED_AMOUNT
  PERCENTAGE_OF_WAGE
  PERCENTAGE_OF_BASIC
}
```

### API Response Models

#### Standard Response Format
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: ValidationError[];
  pagination?: PaginationInfo;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface ValidationError {
  field: string;
  message: string;
  code: string;
}
```

## Authentication and Security Design

### JWT Token Strategy

#### Token Structure
```typescript
interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  loginId: string;
  iat: number;
  exp: number;
}

interface TokenPair {
  accessToken: string;  // 15 minutes expiry
  refreshToken: string; // 7 days expiry
}
```

#### Password Security
- **Hashing**: bcrypt with salt rounds of 12
- **Password Policy**: Minimum 8 characters, mixed case, numbers, special characters
- **Reset Mechanism**: Secure token-based password reset with email verification
- **Temporary Passwords**: Auto-generated secure passwords for new employees

### Role-Based Access Control

```typescript
enum UserRole {
  EMPLOYEE = 'employee',
  HR_OFFICER = 'hr_officer',
  ADMIN = 'admin'
}

interface RolePermissions {
  [UserRole.EMPLOYEE]: {
    attendance: ['read:own', 'create:own'];
    profile: ['read:own', 'update:limited'];
    leave: ['read:own', 'create:own'];
    salary: ['read:own'];
  };
  [UserRole.HR_OFFICER]: {
    attendance: ['read:all', 'update:all'];
    profile: ['read:all', 'update:all', 'create'];
    leave: ['read:all', 'approve', 'reject'];
    salary: ['read:all', 'update:all'];
  };
  [UserRole.ADMIN]: {
    attendance: ['read:all', 'update:all', 'delete:all'];
    profile: ['read:all', 'update:all', 'create', 'delete'];
    leave: ['read:all', 'approve', 'reject', 'delete'];
    salary: ['read:all', 'update:all', 'create', 'delete'];
  };
}
```

## API Endpoint Design

### Authentication Endpoints
```
POST   /api/auth/login
POST   /api/auth/refresh
POST   /api/auth/logout
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
POST   /api/auth/change-password
```

### Employee Management Endpoints
```
GET    /api/employees              # List employees (admin/hr)
POST   /api/employees              # Create employee (admin/hr)
GET    /api/employees/:id          # Get employee details
PUT    /api/employees/:id          # Update employee
DELETE /api/employees/:id          # Deactivate employee (admin)
GET    /api/employees/me           # Get current user profile
PUT    /api/employees/me           # Update current user profile
```

### Attendance Endpoints
```
GET    /api/attendance             # Get attendance records
POST   /api/attendance/checkin     # Check in
POST   /api/attendance/checkout    # Check out
GET    /api/attendance/status      # Get current status
GET    /api/attendance/report      # Generate attendance report (admin/hr)
```

### Leave Management Endpoints
```
GET    /api/leaves                 # Get leave requests
POST   /api/leaves                 # Apply for leave
PUT    /api/leaves/:id/approve     # Approve leave (admin/hr)
PUT    /api/leaves/:id/reject      # Reject leave (admin/hr)
GET    /api/leaves/balance         # Get leave balance
```

### Salary Endpoints
```
GET    /api/salary/structure       # Get salary structure
PUT    /api/salary/structure       # Update salary structure (admin/hr)
GET    /api/salary/payslip/:month/:year  # Get payslip
GET    /api/salary/components      # Get salary components
```

## Email Service Design

### Email Templates and Notifications

#### Welcome Email Template
```typescript
interface WelcomeEmailData {
  employeeName: string;
  loginId: string;
  temporaryPassword: string;
  loginUrl: string;
  companyName: string;
}
```

#### Leave Notification Template
```typescript
interface LeaveNotificationData {
  employeeName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  status: 'approved' | 'rejected';
  comments?: string;
  approverName: string;
}
```

### Email Service Implementation
```typescript
interface EmailService {
  sendWelcomeEmail(employee: Employee, temporaryPassword: string): Promise<void>;
  sendPasswordResetEmail(email: string, resetToken: string): Promise<void>;
  sendLeaveNotification(leave: LeaveRequest, status: LeaveStatus): Promise<void>;
  sendPayslipEmail(employee: Employee, payslip: Payslip): Promise<void>;
}
```

## Business Logic Implementation

### Login ID Generation Algorithm

```typescript
class LoginIdGenerator {
  async generateLoginId(firstName: string, lastName: string, joiningYear: number): Promise<string> {
    const prefix = 'OI';
    const nameCode = (firstName.substring(0, 2) + lastName.substring(0, 2)).toUpperCase();
    const year = joiningYear.toString();
    
    // Find the next serial number for the year
    const lastEmployee = await this.findLastEmployeeByYear(joiningYear);
    const serialNumber = this.getNextSerialNumber(lastEmployee?.loginId, year);
    
    return `${prefix}${nameCode}${year}${serialNumber}`;
  }
  
  private getNextSerialNumber(lastLoginId: string | undefined, year: string): string {
    if (!lastLoginId || !lastLoginId.includes(year)) {
      return '0001';
    }
    
    const lastSerial = parseInt(lastLoginId.slice(-4));
    return (lastSerial + 1).toString().padStart(4, '0');
  }
}
```

### Salary Calculation Engine

```typescript
class SalaryCalculator {
  calculateSalaryComponents(monthlyWage: number): SalaryComponent[] {
    const basic = monthlyWage * 0.5; // 50% of wage
    const hra = basic * 0.5; // 50% of basic
    const standardAllowance = 4167; // Fixed amount
    const performanceBonus = monthlyWage * 0.0833; // 8.33% of wage
    const lta = monthlyWage * 0.08333; // 8.333% of wage
    
    const totalAllowances = basic + hra + standardAllowance + performanceBonus + lta;
    const fixedAllowance = monthlyWage - totalAllowances;
    
    return [
      { name: 'BASIC', amount: basic, type: 'PERCENTAGE_OF_WAGE', value: 50 },
      { name: 'HRA', amount: hra, type: 'PERCENTAGE_OF_BASIC', value: 50 },
      { name: 'STANDARD_ALLOWANCE', amount: standardAllowance, type: 'FIXED_AMOUNT', value: 4167 },
      { name: 'PERFORMANCE_BONUS', amount: performanceBonus, type: 'PERCENTAGE_OF_WAGE', value: 8.33 },
      { name: 'LTA', amount: lta, type: 'PERCENTAGE_OF_WAGE', value: 8.333 },
      { name: 'FIXED_ALLOWANCE', amount: fixedAllowance, type: 'FIXED_AMOUNT', value: fixedAllowance }
    ];
  }
  
  calculateDeductions(basicSalary: number): Deduction[] {
    const pf = basicSalary * 0.12; // 12% of basic
    const professionalTax = 200; // Fixed amount
    
    return [
      { name: 'PF_DEDUCTION', amount: pf, rate: 12 },
      { name: 'PROFESSIONAL_TAX', amount: professionalTax, rate: 0 }
    ];
  }
}
```

### Attendance Working Hours Calculation

```typescript
class AttendanceCalculator {
  calculateWorkingHours(checkIn: Date, checkOut: Date, breaks: Break[] = []): number {
    const totalMinutes = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60);
    const breakMinutes = breaks.reduce((total, break) => total + break.duration, 0);
    const workingMinutes = totalMinutes - breakMinutes;
    
    return Math.max(0, workingMinutes / 60); // Convert to hours
  }
  
  determineAttendanceStatus(workingHours: number): AttendanceStatus {
    if (workingHours >= 8) return AttendanceStatus.PRESENT;
    if (workingHours >= 4) return AttendanceStatus.HALF_DAY;
    return AttendanceStatus.ABSENT;
  }
}
```

Now I need to use the prework tool to analyze the acceptance criteria before writing the correctness properties:

<function_calls>
<invoke name="prework">
<parameter name="featureName">dayflow-backend
## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

Based on the prework analysis, I've identified several properties that can be consolidated for comprehensive testing while eliminating redundancy:

### Property Reflection

After reviewing all testable criteria from the prework analysis, I've identified areas where properties can be consolidated:
- Database operations (1.2, 1.4, 1.5) can be combined into database integrity testing
- Employee management (2.1-2.5) can be consolidated into employee lifecycle testing
- Authentication properties (3.1-3.5) can be unified into comprehensive auth testing
- Profile management (4.1-4.5) can be combined into profile access control testing
- Attendance operations (5.1-5.5) can be consolidated into attendance workflow testing
- Leave management (6.1-6.5) can be unified into leave lifecycle testing
- Salary calculations (7.1-7.5) can be combined into salary computation testing
- Email notifications (8.1-8.5) can be consolidated into notification system testing
- Security measures (9.1-9.5) can be unified into security compliance testing
- Error handling (10.1-10.5) can be combined into error management testing
- Performance aspects (11.1-11.5) can be consolidated into performance requirements testing

### Core Properties

**Property 1: Login ID Generation Uniqueness**
*For any* set of employee creation requests with the same joining year, the system should generate unique Login IDs following the format OI[FirstName][LastName][Year][SerialNumber] with incrementing serial numbers.
**Validates: Requirements 2.1, 2.2**

**Property 2: Employee Data Completeness**
*For any* employee creation or update operation, the system should store all required information fields and generate secure temporary passwords that meet security requirements.
**Validates: Requirements 2.3, 2.4**

**Property 3: Authentication Token Integrity**
*For any* valid login credentials, the system should generate valid JWT tokens with proper expiration, support token refresh functionality, and hash passwords using bcrypt with appropriate salt rounds.
**Validates: Requirements 3.1, 3.4, 3.5**

**Property 4: Authentication Error Security**
*For any* invalid authentication attempt, the system should return appropriate error messages without revealing sensitive information while maintaining security.
**Validates: Requirements 3.2**

**Property 5: Role-Based Access Control**
*For any* API endpoint access attempt, the system should enforce role-based permissions ensuring employees, admins, and HR officers can only access authorized resources.
**Validates: Requirements 3.3**

**Property 6: Profile Access Permissions**
*For any* profile access or modification request, the system should enforce field-level permissions allowing employees limited access while admins have full access, with proper validation and audit logging.
**Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5**

**Property 7: Attendance Workflow Integrity**
*For any* attendance operation (check-in, check-out), the system should record accurate timestamps, calculate working hours correctly, and enforce data access permissions based on user roles.
**Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5**

**Property 8: Leave Management Workflow**
*For any* leave request operation, the system should validate date ranges and balances, maintain proper status transitions, enforce role-based access, and calculate leave balances accurately.
**Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5**

**Property 9: Salary Calculation Accuracy**
*For any* salary calculation operation, the system should compute components according to defined rules (Basic 50%, HRA 50% of Basic, etc.), ensure totals don't exceed wages, include proper deductions, and recalculate when wages change.
**Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5**

**Property 10: Email Notification System**
*For any* triggering event (employee creation, password reset, leave approval), the system should send appropriate emails using Nodemailer with consistent templates and proper error handling.
**Validates: Requirements 8.1, 8.2, 8.3, 8.4, 8.5**

**Property 11: API Security Compliance**
*For any* API request, the system should enforce JWT authentication on protected endpoints, validate and sanitize inputs, implement rate limiting, and use HTTPS in production.
**Validates: Requirements 9.1, 9.2, 9.3, 9.4, 9.5**

**Property 12: Error Handling Consistency**
*For any* error condition, the system should return appropriate HTTP status codes with descriptive messages, log errors with sufficient context, handle database errors gracefully, and provide structured JSON responses.
**Validates: Requirements 10.1, 10.2, 10.3, 10.4, 10.5**

**Property 13: Database Operations Integrity**
*For any* database operation, the system should use Prisma ORM consistently, maintain proper indexing for performance, support migrations, and enforce foreign key constraints for data integrity.
**Validates: Requirements 1.2, 1.4, 1.5, 12.4**

**Property 14: Performance Requirements Compliance**
*For any* system load, the API should maintain response times under 500ms for standard operations, use connection pooling, implement pagination for large datasets, and support stateless horizontal scaling.
**Validates: Requirements 11.1, 11.2, 11.3, 11.4, 11.5**

**Property 15: Transaction Management Integrity**
*For any* multi-step operation, the system should implement proper transaction rollback for failed operations and maintain data consistency throughout the process.
**Validates: Requirements 12.3**

## Error Handling Strategy

### Error Categories and Response Patterns

**Authentication Errors (401)**
```typescript
interface AuthError {
  code: 'AUTH_INVALID_CREDENTIALS' | 'AUTH_TOKEN_EXPIRED' | 'AUTH_TOKEN_INVALID';
  message: string;
  statusCode: 401;
}
```

**Authorization Errors (403)**
```typescript
interface AuthorizationError {
  code: 'FORBIDDEN_INSUFFICIENT_PERMISSIONS' | 'FORBIDDEN_RESOURCE_ACCESS';
  message: string;
  statusCode: 403;
}
```

**Validation Errors (400)**
```typescript
interface ValidationError {
  code: 'VALIDATION_FAILED';
  message: string;
  statusCode: 400;
  details: FieldError[];
}

interface FieldError {
  field: string;
  message: string;
  value?: any;
}
```

**Database Errors (500)**
```typescript
interface DatabaseError {
  code: 'DB_CONNECTION_ERROR' | 'DB_QUERY_ERROR' | 'DB_CONSTRAINT_VIOLATION';
  message: string;
  statusCode: 500;
  internal?: string; // Only in development
}
```

### Error Handling Middleware

```typescript
class ErrorHandler {
  static handle(error: Error, req: Request, res: Response, next: NextFunction) {
    const errorResponse = this.formatError(error);
    
    // Log error with context
    logger.error('API Error', {
      error: error.message,
      stack: error.stack,
      url: req.url,
      method: req.method,
      userId: req.user?.id,
      timestamp: new Date().toISOString()
    });
    
    res.status(errorResponse.statusCode).json(errorResponse);
  }
  
  private static formatError(error: Error): ErrorResponse {
    if (error instanceof ValidationError) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_FAILED',
          message: 'Validation failed',
          details: error.details
        }
      };
    }
    
    if (error instanceof AuthenticationError) {
      return {
        success: false,
        error: {
          code: 'AUTH_FAILED',
          message: 'Authentication failed'
        }
      };
    }
    
    // Default server error
    return {
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred'
      }
    };
  }
}
```

## Performance Optimization Strategy

### Database Optimization

#### Indexing Strategy
```sql
-- Employee table indexes
CREATE INDEX idx_employees_login_id ON employees(login_id);
CREATE INDEX idx_employees_email ON employees(email);
CREATE INDEX idx_employees_department ON employees(department);
CREATE INDEX idx_employees_joining_date ON employees(joining_date);

-- Attendance table indexes
CREATE INDEX idx_attendance_employee_date ON attendance_records(employee_id, date);
CREATE INDEX idx_attendance_date ON attendance_records(date);
CREATE INDEX idx_attendance_status ON attendance_records(status);

-- Leave requests indexes
CREATE INDEX idx_leave_employee_id ON leave_requests(employee_id);
CREATE INDEX idx_leave_status ON leave_requests(status);
CREATE INDEX idx_leave_dates ON leave_requests(start_date, end_date);
```

#### Connection Pooling Configuration
```typescript
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: ['query', 'info', 'warn', 'error'],
});

// Connection pool settings in DATABASE_URL
// postgresql://user:password@localhost:5432/dayflow?connection_limit=20&pool_timeout=20
```

### API Response Optimization

#### Pagination Implementation
```typescript
interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

class PaginationService {
  static async paginate<T>(
    model: any,
    options: PaginationOptions,
    where?: any
  ): Promise<PaginatedResponse<T>> {
    const { page, limit, sortBy = 'createdAt', sortOrder = 'desc' } = options;
    const skip = (page - 1) * limit;
    
    const [data, total] = await Promise.all([
      model.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder }
      }),
      model.count({ where })
    ]);
    
    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
}
```

### Caching Strategy

#### Redis Integration for Session Management
```typescript
interface CacheService {
  set(key: string, value: any, ttl?: number): Promise<void>;
  get(key: string): Promise<any>;
  del(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
}

class RedisCacheService implements CacheService {
  private redis: Redis;
  
  constructor() {
    this.redis = new Redis(process.env.REDIS_URL);
  }
  
  async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    await this.redis.setex(key, ttl, JSON.stringify(value));
  }
  
  async get(key: string): Promise<any> {
    const value = await this.redis.get(key);
    return value ? JSON.parse(value) : null;
  }
}
```

## Testing Strategy

### Dual Testing Approach

The backend will implement comprehensive testing covering both specific functionality and universal properties:

**Unit Tests**
- Test individual functions and methods with specific inputs
- Verify business logic correctness with known examples
- Test error conditions and edge cases
- Mock external dependencies for isolated testing

**Property-Based Tests**
- Verify universal properties across generated inputs
- Test API endpoints with various valid and invalid data
- Validate business rules across different scenarios
- Ensure data consistency and integrity

**Integration Tests**
- Test complete API workflows end-to-end
- Verify database operations and transactions
- Test email service integration
- Validate authentication and authorization flows

### Testing Framework Configuration

**Testing Stack**
- **Unit Testing**: Jest with TypeScript support
- **Property-Based Testing**: fast-check for JavaScript/TypeScript
- **API Testing**: Supertest for HTTP endpoint testing
- **Database Testing**: In-memory SQLite for fast test execution
- **Mocking**: Jest mocks for external services

**Property Test Configuration**
- Minimum 100 iterations per property test
- Each property test references its design document property
- Tag format: **Feature: dayflow-backend, Property {number}: {property_text}**

**Test Organization**
```
src/
├── controllers/
│   ├── __tests__/
│   │   ├── auth.controller.test.ts
│   │   └── auth.controller.property.test.ts
├── services/
│   ├── __tests__/
│   │   ├── employee.service.test.ts
│   │   └── employee.service.property.test.ts
├── utils/
│   ├── __tests__/
│   │   ├── loginId.generator.test.ts
│   │   └── salary.calculator.property.test.ts
└── integration/
    ├── auth.integration.test.ts
    └── employee.integration.test.ts
```

### Property Test Examples

```typescript
// Example property test for Login ID generation
describe('Property 1: Login ID Generation Uniqueness', () => {
  it('should generate unique Login IDs for employees in the same year', () => {
    fc.assert(fc.property(
      fc.array(fc.record({
        firstName: fc.string({ minLength: 2 }),
        lastName: fc.string({ minLength: 2 }),
        joiningYear: fc.integer({ min: 2020, max: 2030 })
      }), { minLength: 2, maxLength: 10 }),
      async (employees) => {
        // Feature: dayflow-backend, Property 1: Login ID Generation Uniqueness
        const loginIds = await Promise.all(
          employees.map(emp => loginIdGenerator.generate(emp.firstName, emp.lastName, emp.joiningYear))
        );
        
        const uniqueIds = new Set(loginIds);
        expect(uniqueIds.size).toBe(loginIds.length);
        
        loginIds.forEach(id => {
          expect(id).toMatch(/^OI[A-Z]{4}\d{4}\d{4}$/);
        });
      }
    ), { numRuns: 100 });
  });
});

// Example property test for salary calculations
describe('Property 9: Salary Calculation Accuracy', () => {
  it('should calculate salary components correctly for any wage amount', () => {
    fc.assert(fc.property(
      fc.integer({ min: 10000, max: 200000 }),
      (monthlyWage) => {
        // Feature: dayflow-backend, Property 9: Salary Calculation Accuracy
        const components = salaryCalculator.calculateComponents(monthlyWage);
        
        const basic = components.find(c => c.name === 'BASIC');
        const hra = components.find(c => c.name === 'HRA');
        
        expect(basic?.amount).toBe(monthlyWage * 0.5);
        expect(hra?.amount).toBe(basic!.amount * 0.5);
        
        const totalComponents = components.reduce((sum, c) => sum + c.amount, 0);
        expect(totalComponents).toBeLessThanOrEqual(monthlyWage);
      }
    ), { numRuns: 100 });
  });
});
```

### Testing Coverage Goals

- **Unit Test Coverage**: Minimum 85% code coverage
- **Property Test Coverage**: All 15 correctness properties implemented
- **Integration Test Coverage**: All API endpoints and critical workflows
- **Performance Testing**: Response time validation for all endpoints
- **Security Testing**: Authentication, authorization, and input validation

The testing strategy ensures comprehensive validation of both specific functionality and universal system properties, providing confidence in the API's correctness, security, and performance.