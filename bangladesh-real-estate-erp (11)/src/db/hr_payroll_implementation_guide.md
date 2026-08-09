# AL KASWA HOLDINGS ERP - HR, PAYROLL & COMMISSION ENGINE ARCHITECTURAL GUIDE (PHASE 1E)
**Author:** Chief Enterprise Architect & Lead Database Engineer  
**Version:** 1.0.0 (Production Release)  
**DBMS:** PostgreSQL (v12+)  
**Backend Framework:** NestJS (TypeScript with Drizzle/Node-Postgres)

---

## 1. Architectural Blueprint & Relational Schema

Phase 1E implements a dual-layered HR and Accounting ledger system. It ensures that every transaction—whether it is a daily attendance, an approved sick leave, a salary disbursement, or a sales agent commission—is recorded with precise, double-entry, multi-tenant audited ledger records.

```
       [Employee Master Setup] 
                  ↓
       [Department / Designation]
                  ↓
      [Daily Attendance System] ──► [Leave Workflows] 
                  ↓                        │
      [Compile Payroll Earnings] ◄─────────┘
      (Overtime + PF + Bonus)
                  ↓
      [Loan / Advance Deduction]
                  ↓
     [Balance Journal Voucher Posting] ──► [Audit Log Trails]
                  ↓
     [Disbursed Salaries Clearing] ──► [General Ledger Settled]
```

### 1.1. Schema DDL Definitions & Relational Constraints

```sql
-- 1. DEPARTMENTS TABLE
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    name_en VARCHAR(150) NOT NULL,
    name_bn VARCHAR(150) NOT NULL,
    manager_id UUID, -- Foreign Key self-mapped after Employees Setup
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uq_company_dept_code UNIQUE (company_id, code)
);

-- 2. DESIGNATIONS TABLE
CREATE TABLE designations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    title_en VARCHAR(150) NOT NULL,
    title_bn VARCHAR(150) NOT NULL,
    grade VARCHAR(50),
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uq_company_desig_title UNIQUE (company_id, title_en)
);

-- 3. ATTENDANCE TABLE
CREATE TABLE attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    attendance_date DATE NOT NULL,
    check_in_time TIME,
    check_out_time TIME,
    status VARCHAR(50) NOT NULL CHECK (status IN ('Present', 'Late', 'Absent', 'Half-Day', 'Leave')),
    late_minutes INT DEFAULT 0 NOT NULL,
    overtime_hours DECIMAL(4,2) DEFAULT 0.00 NOT NULL,
    remarks TEXT,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uq_emp_attendance_date UNIQUE (employee_id, attendance_date)
);

-- 4. LEAVE REQUESTS TABLE
CREATE TABLE leave_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    leave_type VARCHAR(50) NOT NULL CHECK (leave_type IN ('Casual Leave', 'Sick Leave', 'Annual Leave', 'Maternity Leave', 'Unpaid Leave')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days INT NOT NULL CHECK (total_days > 0),
    reason TEXT,
    manager_approval_by UUID,
    manager_approval_status VARCHAR(50) DEFAULT 'Pending' CHECK (manager_approval_status IN ('Pending', 'Approved', 'Rejected')),
    hr_approval_by UUID,
    hr_approval_status VARCHAR(50) DEFAULT 'Pending' CHECK (hr_approval_status IN ('Pending', 'Approved', 'Rejected')),
    status VARCHAR(50) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
    payroll_impact VARCHAR(50) DEFAULT 'Paid' CHECK (payroll_impact IN ('Paid', 'Unpaid')),
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT chk_leave_dates CHECK (end_date >= start_date)
);

-- 5. EMPLOYEE LOANS TABLE
CREATE TABLE employee_loans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    loan_amount DECIMAL(15,2) NOT NULL CHECK (loan_amount > 0),
    installment_count INT NOT NULL CHECK (installment_count > 0),
    monthly_deduction DECIMAL(15,2) NOT NULL CHECK (monthly_deduction > 0),
    outstanding_balance DECIMAL(15,2) NOT NULL CHECK (outstanding_balance >= 0),
    approved_by UUID,
    status VARCHAR(50) DEFAULT 'Active' CHECK (status IN ('Active', 'Settled', 'Cancelled')),
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 6. EMPLOYEE COMMISSIONS TABLE
CREATE TABLE employee_commissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    commission_type VARCHAR(50) NOT NULL CHECK (commission_type IN ('Fixed', 'Percentage', 'Project Based')),
    base_amount DECIMAL(15,2) NOT NULL CHECK (base_amount >= 0),
    commission_rate DECIMAL(5,2) DEFAULT 0.00 NOT NULL,
    calculated_amount DECIMAL(15,2) NOT NULL CHECK (calculated_amount >= 0),
    approval_status VARCHAR(50) DEFAULT 'Pending' CHECK (approval_status IN ('Pending', 'Approved', 'Rejected')),
    approved_by UUID,
    payroll_posted BOOLEAN DEFAULT FALSE NOT NULL,
    payroll_month VARCHAR(7),
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 7. AUDITABLE EMPLOYEE LEDGER TABLE
CREATE TABLE employee_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    entry_date DATE NOT NULL,
    description_en TEXT NOT NULL,
    description_bn TEXT NOT NULL,
    debit DECIMAL(15,2) DEFAULT 0.00 NOT NULL,
    credit DECIMAL(15,2) DEFAULT 0.00 NOT NULL,
    running_balance DECIMAL(15,2) DEFAULT 0.00 NOT NULL,
    reference_type VARCHAR(100),
    reference_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);
```

---

## 2. NestJS Module & Service Architecture

### 2.1. Module Configuration (`hr-payroll.module.ts`)

Encapsulates all repositories, computational engines, and controller mappings under a clean modular boundaries structure.

```typescript
import { Module } from '@nestjs/common';
import { HRPayrollController } from './hr-payroll.controller';
import { 
  AttendanceEngineService, 
  LeaveWorkflowService, 
  PayrollCalculationEngineService, 
  PayrollGeneralLedgerPostingService 
} from '/src/db/hr_payroll_commission_engine';
import { 
  DepartmentRepository, 
  DesignationRepository, 
  AttendanceRepository, 
  LeaveRequestRepository,
  LoanRepository,
  AdvanceSalaryRepository,
  BonusIncentiveRepository,
  CommissionRepository,
  EmployeeLedgerRepository
} from '/src/db/hr_payroll_commission_engine';

@Module({
  controllers: [HRPayrollController],
  providers: [
    AttendanceEngineService,
    LeaveWorkflowService,
    PayrollCalculationEngineService,
    PayrollGeneralLedgerPostingService,
    {
      provide: 'DEPT_REPO',
      useClass: DepartmentRepository,
    },
    {
      provide: 'DESIG_REPO',
      useClass: DesignationRepository,
    },
    {
      provide: 'ATTENDANCE_REPO',
      useClass: AttendanceRepository,
    },
    {
      provide: 'LEAVE_REPO',
      useClass: LeaveRequestRepository,
    },
    {
      provide: 'LOAN_REPO',
      useClass: LoanRepository,
    },
    {
      provide: 'ADVANCE_REPO',
      useClass: AdvanceSalaryRepository,
    },
    {
      provide: 'BONUS_REPO',
      useClass: BonusIncentiveRepository,
    },
    {
      provide: 'COMMISSION_REPO',
      useClass: CommissionRepository,
    },
    {
      provide: 'LEDGER_REPO',
      useClass: EmployeeLedgerRepository,
    },
  ],
  exports: [
    PayrollGeneralLedgerPostingService,
    AttendanceEngineService
  ]
})
export class HRPayrollModule {}
```

---

## 3. Rest API Endpoint Mapping

The HR & Payroll engine endpoints are guarded with tenancy checks:

### 3.1. Employee Inventory & Sourcing
*   `POST /api/hr/departments`
    *   Creates a new corporate department.
    *   *Payload:* `CreateDepartmentDto`
*   `POST /api/hr/designations`
    *   Adds employee designations with graded scales.
    *   *Payload:* `CreateDesignationDto`

### 3.2. Attendance & Late Tracking
*   `POST /api/hr/attendance/log`
    *   Logs clock-in / clock-out times, automatically calculating late parameters and overtime thresholds.
    *   *Payload:* `RegisterAttendanceDto`
*   `GET /api/hr/attendance/employee/:id/metrics?month=YYYY-MM`
    *   Fetches tabulated monthly attendance metrics.

### 3.3. Leave Request Workflow
*   `POST /api/hr/leaves/apply`
    *   Files a leave request. Paid/unpaid status gets automatically mapped based on the category.
    *   *Payload:* `CreateLeaveRequestDto`
*   `PATCH /api/hr/leaves/approve`
    *   Enforces multi-stage signoff. Once HR approves, dates are automatically populated in the attendance engine ledger as 'Leave' entries.
    *   *Payload:* `ApproveLeaveDto`

### 3.4. Loans & Advance Salary
*   `POST /api/hr/loans/issue`
    *   Registers employee loan and releases bank funds. Automatically adds outstanding ledger debt.
    *   *Payload:* `CreateLoanDto`

### 3.5. Automated Payroll Processing
*   `POST /api/hr/payroll/post`
    *   Aggregates basic salaries, overtime, bonuses, incentives, and commissions. Subtracts taxes, PF contributions, loan and salary advances, generating an accrued payroll voucher and posting to the General Ledger.
    *   *Payload:* `PostPayrollDto`
*   `POST /api/hr/payroll/disburse`
    *   Settles accrued liabilities by paying an employee via Cash, Cheque, or Bank Transfer, creating offsetting cash vouchers.
    *   *Payload:* `PaySalaryDto`

---

## 4. Double-Entry Accounting Matrix & Flow

The Payroll Engine translates calculations directly into balanced General Ledger postings:

### 4.1. Payroll Accrual Entry
Automatically posted when `postMonthlyPayroll` executes:
*   **Dr** `Employee Salary Expense` (Total basic salary, allowances, overtime, commissions, festive bonus, incentives)
*   **Dr** `Provident Fund Company Contribution Expense` (Matching contribution part)
*   **Cr** `Accrued Salaries Payable` (Net pay credited to employees)
*   **Cr** `Provident Fund Trust Liabilities` (Employee share + Company share matching)
*   **Cr** `Withholding Income Tax Payable` (Employee taxes retained)
*   **Cr** `Employee Loans Receivable` (Installment deduction applied)
*   **Cr** `Advances Against Salaries` (Advance salary recovered)

### 4.2. Payroll Disbursement Entry
Automatically posted when `disburseSalary` executes:
*   **Dr** `Accrued Salaries Payable` (Settles salary liability)
*   **Cr** `Cash / Bank Asset` (Payments made)

---

## 5. Audit Trail & Sub-Ledger Integrations

To track employee balances and ensure ledger history, every entry generates an `employee_ledger` transaction record. Each transaction tracks localized Bangla and English narration descriptions alongside a running balance calculation.

Audit activities are recorded using the ERP's core log module:
```typescript
async auditActivity(tx: any, companyId: string, userId: string, action: string, refId: string, details: any) {
  await tx.query(
    `INSERT INTO audit_logs (company_id, user_id, action, table_name, record_id, new_values, created_at)
     VALUES ($1, $2, $3, 'hr_payroll_module', $4, $5, CURRENT_TIMESTAMP)`,
    [companyId, userId, action, refId, JSON.stringify(details)]
  );
}
```

---

## 6. Step-by-Step Production Execution Order

To guarantee complete ledger consistency, execute the tasks in this sequence:

### Step 1: Run Database Tables and Alterations
Log in to your PostgreSQL database cluster and run the DDL schema code inside `/src/db/hr_payroll_procedures.sql`:
```bash
psql -h <host> -U <user> -d <database> -f /src/db/hr_payroll_procedures.sql
```

### Step 2: Configure Chart of Accounts (COA) Mappings
Ensure the following standard accounts are registered in the Chart of Accounts table:
1.  `EXP-SAL` (Employee Salary Expense)
2.  `EXP-PF` (Provident Fund Matching Contribution Expense)
3.  `LIA-SAL` (Accrued Salaries Payable)
4.  `LIA-PF` (Provident Fund trust liability)
5.  `LIA-TAX` (Withholding Tax Payable)
6.  `AST-LON` (Employee Loans Receivable)
7.  `AST-ADV` (Advances Against Salaries)

### Step 3: Run Unit Integration Tests
1.  **Attendance Rules Verification:** Create a log with an in-time of `09:30 AM` and out-time of `06:00 PM`. Confirm the late minutes are calculated as `30` and overtime hours as `1.0`.
2.  **Leave Approval Validation:** Apply for sickness leave from July 5th to July 6th. Approve it with Manager and HR sign-offs. Confirm that attendance registers for those dates are automatically created as `Leave`.
3.  **Loan Outstanding Test:** Release a loan of `৳1,20,000` with `12` installments of `৳10,000` per month. Process monthly payroll. Verify that `৳10,000` is deducted from net pay, and loan outstanding balance drops to `৳1,10,000` in the sub-ledger.
4.  **Commission FIFO Settlement:** Trigger a successful plot booking commission approval. Approve it and confirm the accrued commission journal posts correctly, updating the agent sub-ledger.
