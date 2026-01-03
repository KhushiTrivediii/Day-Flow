/**
 * Property-Based Tests for Database Operations
 * Feature: dayflow-backend, Property 13: Database Operations Integrity
 * Validates: Requirements 1.2, 1.4, 1.5, 12.4
 */

import { PrismaClient } from '@prisma/client';
import * as fc from 'fast-check';

describe('Database Operations Integrity Properties', () => {
  let prisma: PrismaClient;

  beforeAll(async () => {
    // Use the configured PostgreSQL database for testing
    prisma = new PrismaClient();

    // Note: In a real environment, you would use a separate test database
    // For this test, we'll use the main database but clean up after ourselves
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean up database before each test
    try {
      await prisma.salaryComponent.deleteMany();
      await prisma.leaveRequest.deleteMany();
      await prisma.attendanceRecord.deleteMany();
      await prisma.employee.deleteMany();
    } catch (error) {
      // If database is not available, skip the cleanup
      console.warn(
        'Database cleanup failed, possibly database not available:',
        error
      );
    }
  });

  /**
   * Property 13: Database Operations Integrity
   * For any valid employee data, creating and retrieving should maintain data consistency
   */
  test('Property 13: Database Operations Integrity - Employee CRUD operations maintain data consistency', async () => {
    // Skip test if database is not available
    try {
      await prisma.$connect();
    } catch (error) {
      console.warn('Database not available, skipping test');
      return;
    }

    await fc.assert(
      fc.asyncProperty(
        // Generate valid employee data
        fc.record({
          loginId: fc
            .string({ minLength: 8, maxLength: 20 })
            .filter(s => /^[A-Z0-9]+$/.test(s)),
          email: fc.emailAddress(),
          firstName: fc
            .string({ minLength: 2, maxLength: 50 })
            .filter(s => /^[A-Za-z]+$/.test(s)),
          lastName: fc
            .string({ minLength: 2, maxLength: 50 })
            .filter(s => /^[A-Za-z]+$/.test(s)),
          department: fc.constantFrom(
            'Engineering',
            'HR',
            'Finance',
            'Marketing'
          ),
          position: fc.string({ minLength: 3, maxLength: 50 }),
          monthlyWage: fc.float({ min: 10000, max: 200000 }),
        }),
        async employeeData => {
          try {
            // Create employee
            const createdEmployee = await prisma.employee.create({
              data: {
                ...employeeData,
                passwordHash: 'hashed_password',
                joiningDate: new Date(),
                workingSchedule: { hours: 8, days: 5 },
              },
            });

            // Verify creation
            expect(createdEmployee).toBeDefined();
            expect(createdEmployee.loginId).toBe(employeeData.loginId);
            expect(createdEmployee.email).toBe(employeeData.email);
            expect(createdEmployee.firstName).toBe(employeeData.firstName);
            expect(createdEmployee.lastName).toBe(employeeData.lastName);

            // Retrieve employee
            const retrievedEmployee = await prisma.employee.findUnique({
              where: { id: createdEmployee.id },
            });

            // Verify retrieval maintains data integrity
            expect(retrievedEmployee).toBeDefined();
            expect(retrievedEmployee?.loginId).toBe(employeeData.loginId);
            expect(retrievedEmployee?.email).toBe(employeeData.email);
            expect(retrievedEmployee?.department).toBe(employeeData.department);
            expect(retrievedEmployee?.monthlyWage.toNumber()).toBe(
              employeeData.monthlyWage
            );

            // Update employee
            const updatedData = {
              department: 'Updated Department',
              position: 'Updated Position',
            };

            const updatedEmployee = await prisma.employee.update({
              where: { id: createdEmployee.id },
              data: updatedData,
            });

            // Verify update maintains other fields
            expect(updatedEmployee.loginId).toBe(employeeData.loginId);
            expect(updatedEmployee.email).toBe(employeeData.email);
            expect(updatedEmployee.department).toBe(updatedData.department);
            expect(updatedEmployee.position).toBe(updatedData.position);

            // Delete employee
            await prisma.employee.delete({
              where: { id: createdEmployee.id },
            });

            // Verify deletion
            const deletedEmployee = await prisma.employee.findUnique({
              where: { id: createdEmployee.id },
            });
            expect(deletedEmployee).toBeNull();
          } catch (error) {
            // Clean up on error
            if (
              error instanceof Error &&
              !error.message.includes('Record to delete does not exist')
            ) {
              throw error;
            }
          }
        }
      ),
      { numRuns: 10 } // Reduced runs for database testing
    );
  });

  /**
   * Property 13: Database Operations Integrity - Relationship constraints
   * For any employee with related records, foreign key constraints should be maintained
   */
  test('Property 13: Database Operations Integrity - Foreign key constraints are enforced', async () => {
    // Skip test if database is not available
    try {
      await prisma.$connect();
    } catch (error) {
      console.warn('Database not available, skipping test');
      return;
    }

    await fc.assert(
      fc.asyncProperty(
        fc.record({
          loginId: fc
            .string({ minLength: 8, maxLength: 20 })
            .filter(s => /^[A-Z0-9]+$/.test(s)),
          email: fc.emailAddress(),
          firstName: fc
            .string({ minLength: 2, maxLength: 50 })
            .filter(s => /^[A-Za-z]+$/.test(s)),
          lastName: fc
            .string({ minLength: 2, maxLength: 50 })
            .filter(s => /^[A-Za-z]+$/.test(s)),
          department: fc.constantFrom('Engineering', 'HR', 'Finance'),
          position: fc.string({ minLength: 3, maxLength: 50 }),
          monthlyWage: fc.float({ min: 10000, max: 200000 }),
        }),
        async employeeData => {
          let employee, attendanceRecord, leaveRequest;

          try {
            // Create employee
            employee = await prisma.employee.create({
              data: {
                ...employeeData,
                passwordHash: 'hashed_password',
                joiningDate: new Date(),
                workingSchedule: { hours: 8, days: 5 },
              },
            });

            // Create attendance record
            attendanceRecord = await prisma.attendanceRecord.create({
              data: {
                employeeId: employee.id,
                date: new Date(),
                checkIn: new Date(),
                workingHours: 8,
                status: 'PRESENT',
              },
            });

            // Verify relationship exists
            const employeeWithAttendance = await prisma.employee.findUnique({
              where: { id: employee.id },
              include: { attendanceRecords: true },
            });

            expect(employeeWithAttendance?.attendanceRecords).toHaveLength(1);
            expect(employeeWithAttendance?.attendanceRecords[0].id).toBe(
              attendanceRecord.id
            );

            // Create leave request
            leaveRequest = await prisma.leaveRequest.create({
              data: {
                employeeId: employee.id,
                type: 'PAID',
                startDate: new Date(),
                endDate: new Date(),
                days: 1,
                reason: 'Test leave',
                status: 'PENDING',
              },
            });

            // Verify multiple relationships
            const employeeWithRelations = await prisma.employee.findUnique({
              where: { id: employee.id },
              include: {
                attendanceRecords: true,
                leaveRequests: true,
              },
            });

            expect(employeeWithRelations?.attendanceRecords).toHaveLength(1);
            expect(employeeWithRelations?.leaveRequests).toHaveLength(1);
            expect(employeeWithRelations?.leaveRequests[0].id).toBe(
              leaveRequest.id
            );
          } finally {
            // Cleanup in reverse order due to foreign key constraints
            if (attendanceRecord) {
              await prisma.attendanceRecord
                .delete({ where: { id: attendanceRecord.id } })
                .catch(() => {});
            }
            if (leaveRequest) {
              await prisma.leaveRequest
                .delete({ where: { id: leaveRequest.id } })
                .catch(() => {});
            }
            if (employee) {
              await prisma.employee
                .delete({ where: { id: employee.id } })
                .catch(() => {});
            }
          }
        }
      ),
      { numRuns: 5 } // Reduced runs for database testing
    );
  });

  /**
   * Property 13: Database Operations Integrity - Unique constraints
   * For any duplicate unique field values, database should enforce uniqueness
   */
  test('Property 13: Database Operations Integrity - Unique constraints are enforced', async () => {
    // Skip test if database is not available
    try {
      await prisma.$connect();
    } catch (error) {
      console.warn('Database not available, skipping test');
      return;
    }

    await fc.assert(
      fc.asyncProperty(
        fc.record({
          loginId: fc
            .string({ minLength: 8, maxLength: 20 })
            .filter(s => /^[A-Z0-9]+$/.test(s)),
          email: fc.emailAddress(),
          firstName: fc
            .string({ minLength: 2, maxLength: 50 })
            .filter(s => /^[A-Za-z]+$/.test(s)),
          lastName: fc
            .string({ minLength: 2, maxLength: 50 })
            .filter(s => /^[A-Za-z]+$/.test(s)),
          department: fc.constantFrom('Engineering', 'HR', 'Finance'),
          position: fc.string({ minLength: 3, maxLength: 50 }),
          monthlyWage: fc.float({ min: 10000, max: 200000 }),
        }),
        async employeeData => {
          let employee1;

          try {
            // Create first employee
            employee1 = await prisma.employee.create({
              data: {
                ...employeeData,
                passwordHash: 'hashed_password',
                joiningDate: new Date(),
                workingSchedule: { hours: 8, days: 5 },
              },
            });

            // Attempt to create second employee with same loginId should fail
            await expect(
              prisma.employee.create({
                data: {
                  ...employeeData,
                  email: 'different@email.com', // Different email
                  passwordHash: 'hashed_password',
                  joiningDate: new Date(),
                  workingSchedule: { hours: 8, days: 5 },
                },
              })
            ).rejects.toThrow();

            // Attempt to create second employee with same email should fail
            await expect(
              prisma.employee.create({
                data: {
                  ...employeeData,
                  loginId: 'DIFFERENT123', // Different loginId
                  passwordHash: 'hashed_password',
                  joiningDate: new Date(),
                  workingSchedule: { hours: 8, days: 5 },
                },
              })
            ).rejects.toThrow();
          } finally {
            // Cleanup
            if (employee1) {
              await prisma.employee
                .delete({ where: { id: employee1.id } })
                .catch(() => {});
            }
          }
        }
      ),
      { numRuns: 5 } // Reduced runs for database testing
    );
  });
});
