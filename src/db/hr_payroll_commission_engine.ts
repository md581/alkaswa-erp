/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// ============================================================================
// 1. DATA TRANSFER OBJECTS (DTOs)
// ============================================================================

export class CreateDepartmentDto {
  companyId!: string;
  code!: string;
  nameEn!: string;
  nameBn!: string;
  managerId?: string;
}

export class CreateDesignationDto {
  companyId!: string;
  titleEn!: string;
  titleBn!: string;
  grade?: string;
}

export class RegisterAttendanceDto {
  companyId!: string;
  employeeId!: string;
  attendanceDate!: string; // YYYY-MM-DD
  checkInTime?: string; // HH:MM:SS
  checkOutTime?: string; // HH:MM:SS
  status!: 'Present' | 'Late' | 'Absent' | 'Half-Day' | 'Leave';
  remarks?: string;
}

export class CreateLeaveRequestDto {
  companyId!: string;
  employeeId!: string;
  leaveType!: 'Casual Leave' | 'Sick Leave' | 'Annual Leave' | 'Maternity Leave' | 'Unpaid Leave';
  startDate!: string; // YYYY-MM-DD
  endDate!: string; // YYYY-MM-DD
  reason?: string;
}

export class ApproveLeaveDto {
  companyId!: string;
  leaveId!: string;
  approvedBy!: string; // Employee/Manager ID
  role!: 'Manager' | 'HR';
  action!: 'Approve' | 'Reject';
}

export class CreateLoanDto {
  companyId!: string;
  employeeId!: string;
  loanAmount!: number;
  installmentCount!: number;
  monthlyDeduction!: number;
  cashOrBankAccId!: string; // COA Account ID
  approvedBy!: string; // User ID
}

export class CreateAdvanceSalaryDto {
  companyId!: string;
  employeeId!: string;
  amount!: number;
  deductionMonth!: string; // YYYY-MM
  approvedBy!: string; // User ID
}

export class CreateBonusIncentiveDto {
  companyId!: string;
  employeeId!: string;
  type!: 'Festive Bonus' | 'Performance Incentive' | 'Project Incentive' | 'Special Allowance';
  amount!: number;
  description?: string;
  effectiveMonth!: string; // YYYY-MM
}

export class CreateCommissionDto {
  companyId!: string;
  employeeId!: string;
  bookingId!: string;
  commissionType!: 'Fixed' | 'Percentage' | 'Project Based';
  baseAmount!: number;
  commissionRate!: number; // Percentage rate
}

export class PostPayrollDto {
  companyId!: string;
  payrollMonth!: string; // YYYY-MM
  issuedBy!: string; // User ID
}

export class PaySalaryDto {
  companyId!: string;
  employeeId!: string;
  payrollMonth!: string; // YYYY-MM
  paidAmount!: number;
  paymentMode!: 'Cash' | 'Bank Transfer' | 'Cheque';
  cashOrBankAccId!: string; // COA Account ID
  issuedBy!: string; // User ID
}

// ============================================================================
// 2. REPOSITORY PATTERNS & PERSISTENCE ENTITIES
// ============================================================================

export interface IDepartmentRepository {
  save(dto: CreateDepartmentDto): Promise<any>;
  findById(id: string): Promise<any>;
  findAll(companyId: string): Promise<any[]>;
}

export interface IDesignationRepository {
  save(dto: CreateDesignationDto): Promise<any>;
  findById(id: string): Promise<any>;
  findAll(companyId: string): Promise<any[]>;
}

export interface IAttendanceRepository {
  save(dto: RegisterAttendanceDto): Promise<any>;
  findByEmployee(employeeId: string, month: string): Promise<any[]>;
  getMetrics(employeeId: string, month: string): Promise<any>;
}

export interface ILeaveRequestRepository {
  save(dto: CreateLeaveRequestDto): Promise<any>;
  updateApproval(dto: ApproveLeaveDto): Promise<void>;
  findById(id: string): Promise<any>;
  findAll(companyId: string): Promise<any[]>;
}

export interface ILoanRepository {
  save(dto: CreateLoanDto, manager?: any): Promise<string>;
  findById(id: string): Promise<any>;
  findByEmployee(employeeId: string): Promise<any[]>;
}

export interface IAdvanceSalaryRepository {
  save(dto: CreateAdvanceSalaryDto): Promise<any>;
  findByEmployee(employeeId: string, month: string): Promise<any[]>;
}

export interface IBonusIncentiveRepository {
  save(dto: CreateBonusIncentiveDto): Promise<any>;
  findByEmployee(employeeId: string, month: string): Promise<any[]>;
}

export interface ICommissionRepository {
  save(dto: CreateCommissionDto): Promise<any>;
  approveCommission(commissionId: string, companyId: string, approvedBy: string, manager?: any): Promise<void>;
  findAll(companyId: string): Promise<any[]>;
  findById(id: string): Promise<any>;
}

export interface IEmployeeLedgerRepository {
  findByEmployee(employeeId: string): Promise<any[]>;
}

// ============================================================================
// 3. REPOSITORY IMPLEMENTATIONS (POSTGRES / DRIZZLE ORM WRAPPER)
// ============================================================================

export class DepartmentRepository implements IDepartmentRepository {
  constructor(private readonly db: any) {}

  async save(dto: CreateDepartmentDto): Promise<any> {
    const result = await this.db.query(
      `INSERT INTO departments (id, company_id, code, name_en, name_bn, manager_id, is_deleted, created_at, updated_at)
       VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING *`,
      [dto.companyId, dto.code, dto.nameEn, dto.nameBn, dto.managerId || null]
    );
    return result.rows[0];
  }

  async findById(id: string): Promise<any> {
    const result = await this.db.query('SELECT * FROM departments WHERE id = $1 AND is_deleted = FALSE', [id]);
    return result.rows[0] || null;
  }

  async findAll(companyId: string): Promise<any[]> {
    const result = await this.db.query('SELECT * FROM departments WHERE company_id = $1 AND is_deleted = FALSE ORDER BY code', [companyId]);
    return result.rows;
  }
}

export class DesignationRepository implements IDesignationRepository {
  constructor(private readonly db: any) {}

  async save(dto: CreateDesignationDto): Promise<any> {
    const result = await this.db.query(
      `INSERT INTO designations (id, company_id, title_en, title_bn, grade, is_deleted, created_at, updated_at)
       VALUES (uuid_generate_v4(), $1, $2, $3, $4, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING *`,
      [dto.companyId, dto.titleEn, dto.titleBn, dto.grade || null]
    );
    return result.rows[0];
  }

  async findById(id: string): Promise<any> {
    const result = await this.db.query('SELECT * FROM designations WHERE id = $1 AND is_deleted = FALSE', [id]);
    return result.rows[0] || null;
  }

  async findAll(companyId: string): Promise<any[]> {
    const result = await this.db.query('SELECT * FROM designations WHERE company_id = $1 AND is_deleted = FALSE ORDER BY title_en', [companyId]);
    return result.rows;
  }
}

export class AttendanceRepository implements IAttendanceRepository {
  constructor(private readonly db: any) {}

  async save(dto: RegisterAttendanceDto): Promise<any> {
    // Determine Late Minutes and Overtime Hours (Simulation Logic)
    let lateMinutes = 0;
    let overtimeHours = 0;

    if (dto.checkInTime) {
      const [h, m] = dto.checkInTime.split(':').map(Number);
      const checkInMinutes = h * 60 + m;
      const expectedMinutes = 9 * 60; // 09:00 AM Expected check in
      if (checkInMinutes > expectedMinutes) {
        lateMinutes = checkInMinutes - expectedMinutes;
      }
    }

    if (dto.checkOutTime) {
      const [h, m] = dto.checkOutTime.split(':').map(Number);
      const checkOutMinutes = h * 60 + m;
      const standardMinutes = 17 * 60; // 05:00 PM Expected check out
      if (checkOutMinutes > standardMinutes) {
        overtimeHours = (checkOutMinutes - standardMinutes) / 60.0;
      }
    }

    const result = await this.db.query(
      `INSERT INTO attendance (id, company_id, employee_id, attendance_date, check_in_time, check_out_time, status, late_minutes, overtime_hours, remarks, is_deleted, created_at, updated_at)
       VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5, $6, $7, $8, $9, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       ON CONFLICT (employee_id, attendance_date) DO UPDATE 
       SET check_in_time = EXCLUDED.check_in_time, check_out_time = EXCLUDED.check_out_time, status = EXCLUDED.status, 
           late_minutes = EXCLUDED.late_minutes, overtime_hours = EXCLUDED.overtime_hours, remarks = EXCLUDED.remarks, updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [dto.companyId, dto.employeeId, dto.attendanceDate, dto.checkInTime || null, dto.checkOutTime || null, dto.status, lateMinutes, overtimeHours, dto.remarks || null]
    );
    return result.rows[0];
  }

  async findByEmployee(employeeId: string, month: string): Promise<any[]> {
    const start = `${month}-01`;
    const result = await this.db.query(
      `SELECT * FROM attendance 
       WHERE employee_id = $1 AND attendance_date >= $2 AND attendance_date <= ($2::DATE + INTERVAL '1 month' - INTERVAL '1 day')::DATE AND is_deleted = FALSE
       ORDER BY attendance_date`,
      [employeeId, start]
    );
    return result.rows;
  }

  async getMetrics(employeeId: string, month: string): Promise<any> {
    const result = await this.db.query('SELECT * FROM get_monthly_attendance_metrics($1::UUID, $2::VARCHAR)', [employeeId, month]);
    return result.rows[0] || { total_days: 0, present_days: 0, late_days: 0, absent_days: 0, leave_days: 0, overtime_hours: 0, late_minutes_total: 0 };
  }
}

export class LeaveRequestRepository implements ILeaveRequestRepository {
  constructor(private readonly db: any) {}

  async save(dto: CreateLeaveRequestDto): Promise<any> {
    // Calculate total leave days
    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);
    const diff = end.getTime() - start.getTime();
    const totalDays = Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;

    // Default payroll impact to Unpaid if leave type is 'Unpaid Leave', otherwise Paid
    const payrollImpact = dto.leaveType === 'Unpaid Leave' ? 'Unpaid' : 'Paid';

    const result = await this.db.query(
      `INSERT INTO leave_requests (id, company_id, employee_id, leave_type, start_date, end_date, total_days, reason, status, payroll_impact, is_deleted, created_at, updated_at)
       VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5, $6, $7, 'Pending', $8, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING *`,
      [dto.companyId, dto.employeeId, dto.leaveType, dto.startDate, dto.endDate, totalDays, dto.reason || '', payrollImpact]
    );
    return result.rows[0];
  }

  async updateApproval(dto: ApproveLeaveDto): Promise<void> {
    const request = await this.findById(dto.leaveId);
    if (!request) throw new Error('Leave request not found.');

    let query = '';
    let params: any[] = [];

    if (dto.role === 'Manager') {
      const managerStatus = dto.action === 'Approve' ? 'Approved' : 'Rejected';
      const overallStatus = dto.action === 'Reject' ? 'Rejected' : 'Pending';
      query = `UPDATE leave_requests 
               SET manager_approval_by = $1, manager_approval_status = $2, status = $3, updated_at = CURRENT_TIMESTAMP
               WHERE id = $4 AND company_id = $5`;
      params = [dto.approvedBy, managerStatus, overallStatus, dto.leaveId, dto.companyId];
    } else {
      // HR Approval
      const hrStatus = dto.action === 'Approve' ? 'Approved' : 'Rejected';
      const overallStatus = dto.action === 'Approve' ? 'Approved' : 'Rejected';
      query = `UPDATE leave_requests 
               SET hr_approval_by = $1, hr_approval_status = $2, status = $3, updated_at = CURRENT_TIMESTAMP
               WHERE id = $4 AND company_id = $5`;
      params = [dto.approvedBy, hrStatus, overallStatus, dto.leaveId, dto.companyId];
    }

    await this.db.query(query, params);

    // If fully approved, auto populate employee attendance as 'Leave' for those dates
    const updatedRequest = await this.findById(dto.leaveId);
    if (updatedRequest && updatedRequest.status === 'Approved') {
      const start = new Date(updatedRequest.start_date);
      const end = new Date(updatedRequest.end_date);
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        await this.db.query(
          `INSERT INTO attendance (id, company_id, employee_id, attendance_date, status, late_minutes, overtime_hours, remarks, is_deleted, created_at, updated_at)
           VALUES (uuid_generate_v4(), $1, $2, $3, 'Leave', 0, 0, $4, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
           ON CONFLICT (employee_id, attendance_date) DO UPDATE SET status = 'Leave', remarks = $4, updated_at = CURRENT_TIMESTAMP`,
          [dto.companyId, updatedRequest.employee_id, dateStr, `Approved Leave: ${updatedRequest.leave_type}`]
        );
      }
    }
  }

  async findById(id: string): Promise<any> {
    const result = await this.db.query('SELECT * FROM leave_requests WHERE id = $1 AND is_deleted = FALSE', [id]);
    return result.rows[0] || null;
  }

  async findAll(companyId: string): Promise<any[]> {
    const result = await this.db.query('SELECT * FROM leave_requests WHERE company_id = $1 AND is_deleted = FALSE ORDER BY start_date DESC', [companyId]);
    return result.rows;
  }
}

export class LoanRepository implements ILoanRepository {
  constructor(private readonly db: any) {}

  async save(dto: CreateLoanDto, manager?: any): Promise<string> {
    const client = manager || this.db;
    const result = await client.query(
      `SELECT issue_employee_loan($1::UUID, $2::UUID, $3::DECIMAL, $4::INT, $5::DECIMAL, $6::UUID, $7::UUID) as loan_id`,
      [dto.companyId, dto.employeeId, dto.loanAmount, dto.installmentCount, dto.monthlyDeduction, dto.cashOrBankAccId, dto.approvedBy]
    );
    return result.rows[0]?.loan_id;
  }

  async findById(id: string): Promise<any> {
    const result = await this.db.query('SELECT * FROM employee_loans WHERE id = $1 AND is_deleted = FALSE', [id]);
    return result.rows[0] || null;
  }

  async findByEmployee(employeeId: string): Promise<any[]> {
    const result = await this.db.query('SELECT * FROM employee_loans WHERE employee_id = $1 AND is_deleted = FALSE ORDER BY created_at DESC', [employeeId]);
    return result.rows;
  }
}

export class AdvanceSalaryRepository implements IAdvanceSalaryRepository {
  constructor(private readonly db: any) {}

  async save(dto: CreateAdvanceSalaryDto): Promise<any> {
    const result = await this.db.query(
      `INSERT INTO advance_salaries (id, company_id, employee_id, amount, deduction_month, approved_by, status, is_deleted, created_at, updated_at)
       VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5, 'Approved', FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING *`,
      [dto.companyId, dto.employeeId, dto.amount, dto.deductionMonth, dto.approvedBy]
    );
    return result.rows[0];
  }

  async findByEmployee(employeeId: string, month: string): Promise<any[]> {
    const result = await this.db.query(
      'SELECT * FROM advance_salaries WHERE employee_id = $1 AND deduction_month = $2 AND status = \'Approved\' AND is_deleted = FALSE',
      [employeeId, month]
    );
    return result.rows;
  }
}

export class BonusIncentiveRepository implements IBonusIncentiveRepository {
  constructor(private readonly db: any) {}

  async save(dto: CreateBonusIncentiveDto): Promise<any> {
    const result = await this.db.query(
      `INSERT INTO bonus_incentives (id, company_id, employee_id, type, amount, description, effective_month, status, is_deleted, created_at, updated_at)
       VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5, $6, 'Pending', FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING *`,
      [dto.companyId, dto.employeeId, dto.type, dto.amount, dto.description || '', dto.effectiveMonth]
    );
    return result.rows[0];
  }

  async findByEmployee(employeeId: string, month: string): Promise<any[]> {
    const result = await this.db.query(
      'SELECT * FROM bonus_incentives WHERE employee_id = $1 AND effective_month = $2 AND status = \'Pending\' AND is_deleted = FALSE',
      [employeeId, month]
    );
    return result.rows;
  }
}

export class CommissionRepository implements ICommissionRepository {
  constructor(private readonly db: any) {}

  async save(dto: CreateCommissionDto): Promise<any> {
    const calculatedAmount = Math.round(dto.baseAmount * (dto.commissionRate / 100.0) * 100) / 100;
    const result = await this.db.query(
      `INSERT INTO employee_commissions (id, company_id, employee_id, booking_id, commission_type, base_amount, commission_rate, calculated_amount, approval_status, payroll_posted, is_deleted, created_at, updated_at)
       VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5, $6, $7, 'Pending', FALSE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING *`,
      [dto.companyId, dto.employeeId, dto.bookingId, dto.commissionType, dto.baseAmount, dto.commissionRate, calculatedAmount]
    );
    return result.rows[0];
  }

  async approveCommission(commissionId: string, companyId: string, approvedBy: string, manager?: any): Promise<void> {
    const client = manager || this.db;
    
    // Set status
    await client.query(
      `UPDATE employee_commissions 
       SET approval_status = 'Approved', approved_by = $1, payroll_month = TO_CHAR(CURRENT_DATE, 'YYYY-MM'), updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND company_id = $3`,
      [approvedBy, commissionId, companyId]
    );

    // Call stored procedure to create Accrued General Ledger Voucher
    await client.query(
      `SELECT post_approved_commission_journal($1::UUID, $2::UUID, $3::UUID)`,
      [companyId, commissionId, approvedBy]
    );
  }

  async findAll(companyId: string): Promise<any[]> {
    const result = await this.db.query('SELECT * FROM employee_commissions WHERE company_id = $1 AND is_deleted = FALSE ORDER BY created_at DESC', [companyId]);
    return result.rows;
  }

  async findById(id: string): Promise<any> {
    const result = await this.db.query('SELECT * FROM employee_commissions WHERE id = $1 AND is_deleted = FALSE', [id]);
    return result.rows[0] || null;
  }
}

export class EmployeeLedgerRepository implements IEmployeeLedgerRepository {
  constructor(private readonly db: any) {}

  async findByEmployee(employeeId: string): Promise<any[]> {
    const result = await this.db.query(
      `SELECT * FROM employee_ledger 
       WHERE employee_id = $1 
       ORDER BY created_at ASC`,
      [employeeId]
    );
    return result.rows;
  }
}

// ============================================================================
// 4. BUSINESS CORE DOMAIN SERVICES
// ============================================================================

export class AttendanceEngineService {
  constructor(private readonly attendanceRepo: IAttendanceRepository) {}

  async checkInCheckOut(dto: RegisterAttendanceDto): Promise<any> {
    return await this.attendanceRepo.save(dto);
  }

  async getEmployeeMetrics(employeeId: string, month: string): Promise<any> {
    return await this.attendanceRepo.getMetrics(employeeId, month);
  }
}

export class LeaveWorkflowService {
  constructor(private readonly leaveRepo: ILeaveRequestRepository) {}

  async requestLeave(dto: CreateLeaveRequestDto): Promise<any> {
    return await this.leaveRepo.save(dto);
  }

  async processApproval(dto: ApproveLeaveDto): Promise<void> {
    await this.leaveRepo.updateApproval(dto);
  }

  async getRequests(companyId: string): Promise<any[]> {
    return await this.leaveRepo.findAll(companyId);
  }
}

export class PayrollCalculationEngineService {
  constructor(private readonly db: any) {}

  /**
   * Compiles temporary or preview payroll ledger sheet for an entire company or specific employee
   */
  async computePayroll(companyId: string, employeeId: string, month: string): Promise<any> {
    const result = await this.db.query(
      `SELECT compile_monthly_payroll_summary($1::UUID, $2::UUID, $3::VARCHAR) as summary`,
      [companyId, employeeId, month]
    );
    return result.rows[0]?.summary;
  }
}

export class PayrollGeneralLedgerPostingService {
  constructor(
    private readonly calcEngine: PayrollCalculationEngineService,
    private readonly db: any
  ) {}

  /**
   * Creates monthly payroll summary for all active employees, locks records, 
   * updates sub-ledgers, matches loan advances, and posts a balanced journal voucher
   */
  async postMonthlyPayroll(dto: PostPayrollDto): Promise<{ success: boolean; voucherId: string; message: string }> {
    return await this.db.transaction(async (tx: any) => {
      // 1. Get all active employees for this company
      const employeesRes = await tx.query(
        'SELECT id, name_en FROM employees WHERE company_id = $1 AND is_active = TRUE AND is_deleted = FALSE',
        [dto.companyId]
      );
      const employees = employeesRes.rows;

      if (employees.length === 0) {
        throw new Error('No active employees found to generate payroll.');
      }

      const payrollList: any[] = [];

      // 2. Compute individual payroll stats
      for (const emp of employees) {
        const summaryRes = await tx.query(
          `SELECT compile_monthly_payroll_summary($1::UUID, $2::UUID, $3::VARCHAR) as summary`,
          [dto.companyId, emp.id, dto.payrollMonth]
        );
        const summary = summaryRes.rows[0]?.summary;
        if (summary) {
          summary.employee_id = emp.id;
          payrollList.push(summary);
        }
      }

      // 3. Post to General Ledger and update tables
      const payrollJson = JSON.stringify(payrollList);
      const postResult = await tx.query(
        `SELECT post_monthly_payroll_journal($1::UUID, $2::VARCHAR, $3::UUID, $4::JSONB) as voucher_id`,
        [dto.companyId, dto.payrollMonth, dto.issuedBy, payrollJson]
      );

      const voucherId = postResult.rows[0]?.voucher_id;

      // 4. Save to payroll records main ledger to prevent double accrual
      for (const summary of payrollList) {
        await tx.query(
          `INSERT INTO payroll (id, company_id, employee_id, salary_month, basic_salary_paid, allowances_paid, commissions_paid, deductions, net_payable, payment_status, created_at, updated_at)
           VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5, $6, $7, $8, 'Unpaid', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          [
            dto.companyId, 
            summary.employee_id, 
            dto.payrollMonth, 
            summary.basic_salary, 
            summary.house_rent + summary.medical + summary.transport + summary.overtime_pay + summary.bonus + summary.incentive,
            summary.commission,
            summary.total_deductions,
            summary.net_payable
          ]
        );
      }

      return {
        success: true,
        voucherId,
        message: `Accrued Payroll journal voucher ${voucherId} successfully posted. Employee sub-ledgers created.`
      };
    });
  }

  /**
   * Records payment and cash disbursement to a single employee
   */
  async disburseSalary(dto: PaySalaryDto): Promise<{ success: boolean; voucherId: string; message: string }> {
    return await this.db.transaction(async (tx: any) => {
      // 1. Verify Unpaid payroll entry
      const checkRes = await tx.query(
        `SELECT id, net_payable FROM payroll 
         WHERE company_id = $1 AND employee_id = $2 AND salary_month = $3 AND payment_status = 'Unpaid' AND is_deleted = FALSE`,
        [dto.companyId, dto.employeeId, dto.payrollMonth]
      );

      const entry = checkRes.rows[0];
      if (!entry) {
        throw new Error(`Unpaid payroll sheet for month ${dto.payrollMonth} was not found or is already Paid.`);
      }

      // 2. Trigger procedural disbursement posting
      const disburseRes = await tx.query(
        `SELECT process_salary_disbursement($1::UUID, $2::UUID, $3::VARCHAR, $4::DECIMAL, $5::VARCHAR, $6::UUID, $7::UUID) as voucher_id`,
        [dto.companyId, dto.employeeId, dto.payrollMonth, dto.paidAmount, dto.paymentMode, dto.cashOrBankAccId, dto.issuedBy]
      );

      const voucherId = disburseRes.rows[0]?.voucher_id;

      // 3. Mark payroll record as Paid
      await tx.query(
        `UPDATE payroll 
         SET payment_status = 'Paid', payment_date = CURRENT_DATE, payment_mode = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2`,
        [dto.paymentMode, entry.id]
      );

      return {
        success: true,
        voucherId,
        message: 'Employee salary payment successfully completed. Financial ledgers settled.'
      };
    });
  }
}
