import { Router } from 'express';
import {
  EmployeeController,
  employeeValidationSchemas,
} from '../controllers/employeeController';
import { authenticate, authorize } from '../middleware/auth';
import {
  validateRequest,
  sanitizeInput,
  validatePagination,
} from '../middleware/validation';
import { UserRole } from '../types';

const router = Router();

/**
 * Employee Management Routes
 */

// Apply authentication and input sanitization to all routes
router.use(authenticate);
router.use(sanitizeInput);

/**
 * GET /api/employees/me
 * Get current user's profile
 */
router.get('/me', EmployeeController.getCurrentUserProfile);

/**
 * PUT /api/employees/me
 * Update current user's profile (limited fields for employees)
 */
router.put(
  '/me',
  validateRequest({
    body: employeeValidationSchemas.updateEmployee,
  }),
  EmployeeController.updateCurrentUserProfile
);

/**
 * GET /api/employees
 * Get employees with filtering and pagination
 * Requires HR_OFFICER or ADMIN role
 */
router.get(
  '/',
  authorize([UserRole.HR_OFFICER, UserRole.ADMIN]),
  validatePagination,
  validateRequest({
    query: employeeValidationSchemas.employeeFilters,
  }),
  EmployeeController.getEmployees
);

/**
 * POST /api/employees
 * Create a new employee
 * Requires HR_OFFICER or ADMIN role
 */
router.post(
  '/',
  authorize([UserRole.HR_OFFICER, UserRole.ADMIN]),
  validateRequest({
    body: employeeValidationSchemas.createEmployee,
  }),
  EmployeeController.createEmployee
);

/**
 * GET /api/employees/:id
 * Get employee by ID
 * Access control handled in service layer
 */
router.get(
  '/:id',
  validateRequest({
    params: employeeValidationSchemas.employeeId,
  }),
  EmployeeController.getEmployee
);

/**
 * PUT /api/employees/:id
 * Update employee by ID
 * Access control handled in service layer
 */
router.put(
  '/:id',
  validateRequest({
    params: employeeValidationSchemas.employeeId,
    body: employeeValidationSchemas.updateEmployee,
  }),
  EmployeeController.updateEmployee
);

export default router;
