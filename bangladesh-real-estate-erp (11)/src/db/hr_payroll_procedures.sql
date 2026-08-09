-- ============================================================================
-- AL KASWA HOLDINGS ERP - HR, PAYROLL & COMMISSION ENGINE (PHASE 1E)
-- DBMS: PostgreSQL (v12+)
-- Architecture: Tenant Isolation, Soft Delete, Relational Constraints, Double-Entry Integration
-- ============================================================================

-- Enable required extensions (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. DATABASE TABLES (DDL)
-- ============================================================================

-- 1.1. DEPARTMENTS
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL,
    code VARCHAR(50) NOT NULL,
    name_en VARCHAR(150) NOT NULL,
    name_bn VARCHAR(150) NOT NULL,
    manager_id UUID, -- References employees(id) later via foreign key
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uq_company_dept_code UNIQUE (company_id, code)
);

-- 1.2. DESIGNATIONS
CREATE TABLE IF NOT EXISTS designations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL,
    title_en VARCHAR(150) NOT NULL,
    title_bn VARCHAR(150) NOT NULL,
    grade VARCHAR(50), -- Grade scale (e.g., 'Grade-1', 'Grade-2')
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uq_company_desig_title UNIQUE (company_id, title_en)
);

-- 1.3. EMPLOYEE MASTER EXTENSION
-- Let's ensure the employees table has designations, departments and payroll attributes.
-- If employees table already exists, we will define these columns or make sure our procedures
-- handle them gracefully. Here we declare columns in an EXTENSION style or fresh schema:
ALTER TABLE employees ADD COLUMN IF NOT EXISTS department_id UUID;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS designation_id UUID;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS joining_date DATE;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Active' CHECK (status IN ('Active', 'Suspended', 'Terminated', 'Resigned'));
ALTER TABLE employees ADD COLUMN IF NOT EXISTS emergency_contact VARCHAR(50);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS bank_name VARCHAR(150);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS bank_acc_no VARCHAR(100);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS tin_no VARCHAR(50);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS house_rent_allowance DECIMAL(15,2) DEFAULT 0.00 NOT NULL;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS medical_allowance DECIMAL(15,2) DEFAULT 0.00 NOT NULL;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS transport_allowance DECIMAL(15,2) DEFAULT 0.00 NOT NULL;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS pf_contribution_percent DECIMAL(5,2) DEFAULT 0.00 NOT NULL; -- Employee PF %
ALTER TABLE employees ADD COLUMN IF NOT EXISTS tax_deduction_percent DECIMAL(5,2) DEFAULT 0.00 NOT NULL; -- Tax %

-- 1.4. ATTENDANCE SYSTEM
CREATE TABLE IF NOT EXISTS attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL,
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

-- 1.5. LEAVE REQUESTS & WORKFLOW
CREATE TABLE IF NOT EXISTS leave_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    leave_type VARCHAR(50) NOT NULL CHECK (leave_type IN ('Casual Leave', 'Sick Leave', 'Annual Leave', 'Maternity Leave', 'Unpaid Leave')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days INT NOT NULL CHECK (total_days > 0),
    reason TEXT,
    manager_approval_by UUID, -- Employee ID of manager
    manager_approval_status VARCHAR(50) DEFAULT 'Pending' CHECK (manager_approval_status IN ('Pending', 'Approved', 'Rejected')),
    hr_approval_by UUID, -- Employee ID of HR manager
    hr_approval_status VARCHAR(50) DEFAULT 'Pending' CHECK (hr_approval_status IN ('Pending', 'Approved', 'Rejected')),
    status VARCHAR(50) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
    payroll_impact VARCHAR(50) DEFAULT 'Paid' CHECK (payroll_impact IN ('Paid', 'Unpaid')),
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT chk_leave_dates CHECK (end_date >= start_date)
);

-- 1.6. LOAN ENGINE
CREATE TABLE IF NOT EXISTS employee_loans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL,
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

-- 1.7. ADVANCE SALARY ENGINE
CREATE TABLE IF NOT EXISTS advance_salaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
    deduction_month VARCHAR(7) NOT NULL, -- Format: 'YYYY-MM'
    approved_by UUID,
    status VARCHAR(50) DEFAULT 'Approved' CHECK (status IN ('Pending', 'Approved', 'Deducted', 'Cancelled')),
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 1.8. PROVIDENT FUND TRACKING
CREATE TABLE IF NOT EXISTS provident_funds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    salary_month VARCHAR(7) NOT NULL, -- Format: 'YYYY-MM'
    employee_contribution DECIMAL(15,2) NOT NULL CHECK (employee_contribution >= 0),
    company_contribution DECIMAL(15,2) NOT NULL CHECK (company_contribution >= 0),
    cumulative_balance DECIMAL(15,2) NOT NULL CHECK (cumulative_balance >= 0),
    status VARCHAR(50) DEFAULT 'Active' NOT NULL, -- 'Active', 'Withdrawn'
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uq_emp_pf_month UNIQUE (employee_id, salary_month)
);

-- 1.9. BONUS & INCENTIVES
CREATE TABLE IF NOT EXISTS bonus_incentives (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('Festive Bonus', 'Performance Incentive', 'Project Incentive', 'Special Allowance')),
    amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
    description TEXT,
    effective_month VARCHAR(7) NOT NULL, -- Format: 'YYYY-MM'
    status VARCHAR(50) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Disbursed', 'Cancelled')),
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 1.10. COMMISSION ENGINE
CREATE TABLE IF NOT EXISTS employee_commissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    commission_type VARCHAR(50) NOT NULL CHECK (commission_type IN ('Fixed', 'Percentage', 'Project Based')),
    base_amount DECIMAL(15,2) NOT NULL CHECK (base_amount >= 0),
    commission_rate DECIMAL(5,2) DEFAULT 0.00 NOT NULL,
    calculated_amount DECIMAL(15,2) NOT NULL CHECK (calculated_amount >= 0),
    approval_status VARCHAR(50) DEFAULT 'Pending' CHECK (approval_status IN ('Pending', 'Approved', 'Rejected')),
    approved_by UUID,
    payroll_posted BOOLEAN DEFAULT FALSE NOT NULL,
    payroll_month VARCHAR(7), -- Month in which commission gets integrated (Format: 'YYYY-MM')
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 1.11. EMPLOYEE LEDGER (AUDITABLE SUB-LEDGER)
CREATE TABLE IF NOT EXISTS employee_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    entry_date DATE NOT NULL,
    description_en TEXT NOT NULL,
    description_bn TEXT NOT NULL,
    debit DECIMAL(15,2) DEFAULT 0.00 NOT NULL, -- Deductions / Advances / Loan releases
    credit DECIMAL(15,2) DEFAULT 0.00 NOT NULL, -- Salary earned / Commission earned / Bonus
    running_balance DECIMAL(15,2) DEFAULT 0.00 NOT NULL,
    reference_type VARCHAR(100), -- 'Payroll', 'Commission', 'Loan', 'Advance', 'Bonus'
    reference_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Indexes for maximum performance
CREATE INDEX IF NOT EXISTS idx_attendance_employee ON attendance(employee_id, attendance_date);
CREATE INDEX IF NOT EXISTS idx_leave_employee ON leave_requests(employee_id, status);
CREATE INDEX IF NOT EXISTS idx_loans_employee ON employee_loans(employee_id, status);
CREATE INDEX IF NOT EXISTS idx_advance_salary_employee ON advance_salaries(employee_id, status);
CREATE INDEX IF NOT EXISTS idx_provident_funds_employee ON provident_funds(employee_id, salary_month);
CREATE INDEX IF NOT EXISTS idx_commissions_employee ON employee_commissions(employee_id, approval_status);
CREATE INDEX IF NOT EXISTS idx_employee_ledger_emp ON employee_ledger(employee_id, entry_date);

-- ============================================================================
-- 2. CORE ENGINES & PROCEDURES
-- ============================================================================

-- 2.1. ATTENDANCE ENGINE (METRIC CALCULATOR)
-- Compiles late count, working days, overtime, absent deductions
CREATE OR REPLACE FUNCTION get_monthly_attendance_metrics(
    p_employee_id UUID,
    p_month VARCHAR(7) -- Format: 'YYYY-MM'
)
RETURNS TABLE (
    total_days INT,
    present_days INT,
    late_days INT,
    absent_days INT,
    leave_days INT,
    overtime_hours DECIMAL(6,2),
    late_minutes_total INT
) AS $$
DECLARE
    v_start_date DATE;
    v_end_date DATE;
BEGIN
    v_start_date := (p_month || '-01')::DATE;
    v_end_date := (v_start_date + INTERVAL '1 month' - INTERVAL '1 day')::DATE;

    RETURN QUERY
    SELECT 
        COALESCE(COUNT(*)::INT, 0) as total_days,
        COALESCE(SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END)::INT, 0) as present_days,
        COALESCE(SUM(CASE WHEN status = 'Late' THEN 1 ELSE 0 END)::INT, 0) as late_days,
        COALESCE(SUM(CASE WHEN status = 'Absent' THEN 1 ELSE 0 END)::INT, 0) as absent_days,
        COALESCE(SUM(CASE WHEN status = 'Leave' THEN 1 ELSE 0 END)::INT, 0) as leave_days,
        COALESCE(SUM(overtime_hours)::DECIMAL(6,2), 0.00) as overtime_hours,
        COALESCE(SUM(late_minutes)::INT, 0) as late_minutes_total
    FROM attendance
    WHERE employee_id = p_employee_id 
      AND attendance_date BETWEEN v_start_date AND v_end_date
      AND is_deleted = FALSE;
END;
$$ LANGUAGE plpgsql;

-- 2.2. PAYROLL engine - COMPILE MONTHLY SALARY SUMMARY
CREATE OR REPLACE FUNCTION compile_monthly_payroll_summary(
    p_company_id UUID,
    p_employee_id UUID,
    p_month VARCHAR(7) -- Format: 'YYYY-MM'
)
RETURNS JSONB AS $$
DECLARE
    v_basic DECIMAL(15,2);
    v_house_rent DECIMAL(15,2);
    v_medical DECIMAL(15,2);
    v_transport DECIMAL(15,2);
    v_pf_pct DECIMAL(5,2);
    v_tax_pct DECIMAL(5,2);
    
    -- Compiled metrics
    v_att RECORD;
    v_overtime_rate DECIMAL(15,2);
    v_overtime_pay DECIMAL(15,2);
    v_bonus DECIMAL(15,2) := 0.00;
    v_incentive DECIMAL(15,2) := 0.00;
    v_commission DECIMAL(15,2) := 0.00;
    
    -- Deductions
    v_pf_employee_deduct DECIMAL(15,2);
    v_pf_company_match DECIMAL(15,2);
    v_tax_deduct DECIMAL(15,2);
    v_loan_deduct DECIMAL(15,2) := 0.00;
    v_advance_deduct DECIMAL(15,2) := 0.00;
    v_absent_deduct DECIMAL(15,2) := 0.00;
    
    -- Totals
    v_gross_pay DECIMAL(15,2);
    v_total_deductions DECIMAL(15,2);
    v_net_payable DECIMAL(15,2);
BEGIN
    -- 1. Load Employee Base Salary Structure
    SELECT 
        basic_salary, house_rent_allowance, medical_allowance, transport_allowance,
        pf_contribution_percent, tax_deduction_percent
    INTO 
        v_basic, v_house_rent, v_medical, v_transport,
        v_pf_pct, v_tax_pct
    FROM employees
    WHERE id = p_employee_id AND company_id = p_company_id AND is_deleted = FALSE;

    IF v_basic IS NULL THEN
        RAISE EXCEPTION 'Employee record not found or tenant company mismatch.';
    END IF;

    -- 2. Load Attendance metrics
    SELECT * INTO v_att FROM get_monthly_attendance_metrics(p_employee_id, p_month);

    -- 3. Calculate Overtime Hours Pay (Overtime rate = (Basic / 208 working hours in standard month) * 1.5)
    v_overtime_rate := ROUND((v_basic / 208.00) * 1.5, 2);
    v_overtime_pay := ROUND(COALESCE(v_att.overtime_hours, 0.00) * v_overtime_rate, 2);

    -- 4. Gather Approved Bonuses & Incentives for this month
    SELECT COALESCE(SUM(amount), 0.00) INTO v_bonus
    FROM bonus_incentives
    WHERE employee_id = p_employee_id 
      AND company_id = p_company_id 
      AND effective_month = p_month 
      AND type = 'Festive Bonus'
      AND status = 'Pending'
      AND is_deleted = FALSE;

    SELECT COALESCE(SUM(amount), 0.00) INTO v_incentive
    FROM bonus_incentives
    WHERE employee_id = p_employee_id 
      AND company_id = p_company_id 
      AND effective_month = p_month 
      AND type IN ('Performance Incentive', 'Project Incentive', 'Special Allowance')
      AND status = 'Pending'
      AND is_deleted = FALSE;

    -- 5. Gather Approved Commissions
    SELECT COALESCE(SUM(calculated_amount), 0.00) INTO v_commission
    FROM employee_commissions
    WHERE employee_id = p_employee_id 
      AND company_id = p_company_id 
      AND payroll_month = p_month 
      AND approval_status = 'Approved'
      AND payroll_posted = FALSE
      AND is_deleted = FALSE;

    -- 6. Calculate Provident Fund Contributions
    v_pf_employee_deduct := ROUND((v_basic * COALESCE(v_pf_pct, 0.00) / 100.00), 2);
    v_pf_company_match := v_pf_employee_deduct; -- Match 1:1

    -- 7. Calculate Tax Deductions
    v_tax_deduct := ROUND((v_basic * COALESCE(v_tax_pct, 0.00) / 100.00), 2);

    -- 8. Apply active loan deduction
    SELECT COALESCE(SUM(monthly_deduction), 0.00) INTO v_loan_deduct
    FROM employee_loans
    WHERE employee_id = p_employee_id 
      AND company_id = p_company_id 
      AND status = 'Active'
      AND outstanding_balance > 0
      AND is_deleted = FALSE;

    -- Loan limit check
    IF v_loan_deduct > 0 THEN
        -- Adjust if the remaining loan outstanding is less than standard monthly installment
        SELECT MIN(ARRAY[v_loan_deduct, outstanding_balance]) INTO v_loan_deduct
        FROM employee_loans
        WHERE employee_id = p_employee_id AND company_id = p_company_id AND status = 'Active';
    END IF;

    -- 9. Apply active salary advance deduction
    SELECT COALESCE(SUM(amount), 0.00) INTO v_advance_deduct
    FROM advance_salaries
    WHERE employee_id = p_employee_id 
      AND company_id = p_company_id 
      AND deduction_month = p_month 
      AND status = 'Approved'
      AND is_deleted = FALSE;

    -- 10. Absent Deduction (Absent Deduction = (Basic / 30 days) * Absent Days)
    v_absent_deduct := ROUND((v_basic / 30.00) * COALESCE(v_att.absent_days, 0), 2);

    -- 11. Compile Totals
    v_gross_pay := v_basic + v_house_rent + v_medical + v_transport + v_overtime_pay + v_bonus + v_incentive + v_commission;
    v_total_deductions := v_pf_employee_deduct + v_tax_deduct + v_loan_deduct + v_advance_deduct + v_absent_deduct;
    v_net_payable := v_gross_pay - v_total_deductions;

    IF v_net_payable < 0 THEN
        v_net_payable := 0.00;
    END IF;

    -- Return full summary as JSONB
    RETURN jsonb_build_object(
        'basic_salary', v_basic,
        'house_rent', v_house_rent,
        'medical', v_medical,
        'transport', v_transport,
        'overtime_hours', COALESCE(v_att.overtime_hours, 0),
        'overtime_pay', v_overtime_pay,
        'bonus', v_bonus,
        'incentive', v_incentive,
        'commission', v_commission,
        'gross_pay', v_gross_pay,
        'provident_fund_employee', v_pf_employee_deduct,
        'provident_fund_company', v_pf_company_match,
        'tax', v_tax_deduct,
        'loan_deduction', v_loan_deduct,
        'advance_deduction', v_advance_deduct,
        'absent_deduction', v_absent_deduct,
        'total_deductions', v_total_deductions,
        'net_payable', v_net_payable,
        'attendance_metrics', jsonb_build_object(
            'present', COALESCE(v_att.present_days, 0),
            'late', COALESCE(v_att.late_days, 0),
            'absent', COALESCE(v_att.absent_days, 0),
            'leave', COALESCE(v_att.leave_days, 0)
        )
    );
END;
$$ LANGUAGE plpgsql;

-- 2.3. GENERAL LEDGER AUTOMATED POSTING PROCEDURE FOR PAYROLL SHEET
-- Creates balanced General Ledger journal and posts to chart of accounts
CREATE OR REPLACE FUNCTION post_monthly_payroll_journal(
    p_company_id UUID,
    p_payroll_month VARCHAR(7), -- Format: 'YYYY-MM'
    p_issued_by UUID, -- User ID
    p_payroll_json JSONB -- Array of compiled employee details
)
RETURNS UUID AS $$
DECLARE
    v_voucher_id UUID;
    v_voucher_no VARCHAR(50);
    v_record RECORD;
    v_total_salary_expense DECIMAL(18,2) := 0.00;
    v_total_pf_expense DECIMAL(18,2) := 0.00;
    v_total_pf_liability DECIMAL(18,2) := 0.00;
    v_total_salary_payable DECIMAL(18,2) := 0.00;
    v_total_tax_liability DECIMAL(18,2) := 0.00;
    v_total_loan_repayment DECIMAL(18,2) := 0.00;
    v_total_advance_repayment DECIMAL(18,2) := 0.00;
    
    -- Chart of Accounts mappings for tenant company
    v_salary_expense_acc UUID;
    v_pf_expense_acc UUID;
    v_pf_liability_acc UUID;
    v_salary_payable_acc UUID;
    v_tax_liability_acc UUID;
    v_loan_receivable_acc UUID;
    v_advance_salary_acc UUID;
    
    v_ledger_lines JSONB := '[]'::JSONB;
    v_emp_ledger_balance DECIMAL(15,2);
BEGIN
    -- 1. Fetch Tenant Chart of Account IDs (or select default matching accounts by code/name)
    SELECT id INTO v_salary_expense_acc FROM chart_of_accounts WHERE company_id = p_company_id AND (account_code = 'EXP-SAL' OR name_en ILIKE '%Salary Expense%') AND is_deleted = FALSE LIMIT 1;
    SELECT id INTO v_pf_expense_acc FROM chart_of_accounts WHERE company_id = p_company_id AND (account_code = 'EXP-PF' OR name_en ILIKE '%Provident Fund Expense%') AND is_deleted = FALSE LIMIT 1;
    SELECT id INTO v_pf_liability_acc FROM chart_of_accounts WHERE company_id = p_company_id AND (account_code = 'LIA-PF' OR name_en ILIKE '%Provident Fund Payable%' OR name_en ILIKE '%Provident Fund Liability%') AND is_deleted = FALSE LIMIT 1;
    SELECT id INTO v_salary_payable_acc FROM chart_of_accounts WHERE company_id = p_company_id AND (account_code = 'LIA-SAL' OR name_en ILIKE '%Salary Payable%') AND is_deleted = FALSE LIMIT 1;
    SELECT id INTO v_tax_liability_acc FROM chart_of_accounts WHERE company_id = p_company_id AND (account_code = 'LIA-TAX' OR name_en ILIKE '%Tax Payable%') AND is_deleted = FALSE LIMIT 1;
    SELECT id INTO v_loan_receivable_acc FROM chart_of_accounts WHERE company_id = p_company_id AND (account_code = 'AST-LON' OR name_en ILIKE '%Employee Loans%') AND is_deleted = FALSE LIMIT 1;
    SELECT id INTO v_advance_salary_acc FROM chart_of_accounts WHERE company_id = p_company_id AND (account_code = 'AST-ADV' OR name_en ILIKE '%Advance Salary%') AND is_deleted = FALSE LIMIT 1;

    -- Create default accounts if missing for trial balance compliance
    IF v_salary_expense_acc IS NULL THEN
        INSERT INTO chart_of_accounts (id, company_id, account_code, name_en, name_bn, account_type)
        VALUES (uuid_generate_v4(), p_company_id, 'EXP-SAL', 'Employee Salary Expense', 'কর্মচারী বেতন খরচ', 'Expense') RETURNING id INTO v_salary_expense_acc;
    END IF;
    IF v_pf_expense_acc IS NULL THEN
        INSERT INTO chart_of_accounts (id, company_id, account_code, name_en, name_bn, account_type)
        VALUES (uuid_generate_v4(), p_company_id, 'EXP-PF', 'Provident Fund Company Contribution Expense', 'প্রভিডেন্ট ফান্ড কোম্পানি অনুদান খরচ', 'Expense') RETURNING id INTO v_pf_expense_acc;
    END IF;
    IF v_pf_liability_acc IS NULL THEN
        INSERT INTO chart_of_accounts (id, company_id, account_code, name_en, name_bn, account_type)
        VALUES (uuid_generate_v4(), p_company_id, 'LIA-PF', 'Provident Fund Trust Liabilities', 'প্রভিডেন্ট ফান্ড ট্রাস্ট দায়', 'Liability') RETURNING id INTO v_pf_liability_acc;
    END IF;
    IF v_salary_payable_acc IS NULL THEN
        INSERT INTO chart_of_accounts (id, company_id, account_code, name_en, name_bn, account_type)
        VALUES (uuid_generate_v4(), p_company_id, 'LIA-SAL', 'Accrued Salaries Payable', 'প্রদেয় সঞ্চিত বেতন', 'Liability') RETURNING id INTO v_salary_payable_acc;
    END IF;
    IF v_tax_liability_acc IS NULL THEN
        INSERT INTO chart_of_accounts (id, company_id, account_code, name_en, name_bn, account_type)
        VALUES (uuid_generate_v4(), p_company_id, 'LIA-TAX', 'Withholding Income Tax Payable', 'উত্সে কর কর্তন প্রদেয়', 'Liability') RETURNING id INTO v_tax_liability_acc;
    END IF;
    IF v_loan_receivable_acc IS NULL THEN
        INSERT INTO chart_of_accounts (id, company_id, account_code, name_en, name_bn, account_type)
        VALUES (uuid_generate_v4(), p_company_id, 'AST-LON', 'Employee Loans Receivable', 'কর্মচারী ঋণ প্রাপ্য', 'Asset') RETURNING id INTO v_loan_receivable_acc;
    END IF;
    IF v_advance_salary_acc IS NULL THEN
        INSERT INTO chart_of_accounts (id, company_id, account_code, name_en, name_bn, account_type)
        VALUES (uuid_generate_v4(), p_company_id, 'AST-ADV', 'Advances Against Salaries', 'বেতনের বিপরীতে অগ্রিম', 'Asset') RETURNING id INTO v_advance_salary_acc;
    END IF;

    -- Generate a unique payroll voucher number
    v_voucher_no := 'PAY-' || p_payroll_month || '-' || SUBSTR(uuid_generate_v4()::VARCHAR, 1, 6);

    -- 2. Loop and Aggregate Payroll calculations
    FOR v_record IN SELECT * FROM jsonb_to_recordset(p_payroll_json)
        AS x(
            employee_id UUID, 
            basic_salary DECIMAL(15,2), 
            house_rent DECIMAL(15,2), 
            medical DECIMAL(15,2), 
            transport DECIMAL(15,2), 
            overtime_pay DECIMAL(15,2), 
            bonus DECIMAL(15,2), 
            incentive DECIMAL(15,2), 
            commission DECIMAL(15,2), 
            provident_fund_employee DECIMAL(15,2), 
            provident_fund_company DECIMAL(15,2), 
            tax DECIMAL(15,2), 
            loan_deduction DECIMAL(15,2), 
            advance_deduction DECIMAL(15,2), 
            absent_deduction DECIMAL(15,2), 
            net_payable DECIMAL(15,2)
        )
    LOOP
        -- Calculate total gross expense (Salary & allowances minus absent deductions)
        v_total_salary_expense := v_total_salary_expense + (v_record.basic_salary + v_record.house_rent + v_record.medical + v_record.transport + v_record.overtime_pay + v_record.bonus + v_record.incentive + v_record.commission - v_record.absent_deduction);
        v_total_pf_expense := v_total_pf_expense + v_record.provident_fund_company;
        v_total_pf_liability := v_total_pf_liability + (v_record.provident_fund_employee + v_record.provident_fund_company);
        v_total_tax_liability := v_total_tax_liability + v_record.tax;
        v_total_loan_repayment := v_total_loan_repayment + v_record.loan_deduction;
        v_total_advance_repayment := v_total_advance_repayment + v_record.advance_deduction;
        v_total_salary_payable := v_total_salary_payable + v_record.net_payable;

        -- 3. Update Employee Loan Outstanding Balances (Apply deductions)
        IF v_record.loan_deduction > 0.00 THEN
            UPDATE employee_loans
            SET outstanding_balance = outstanding_balance - v_record.loan_deduction,
                status = CASE WHEN (outstanding_balance - v_record.loan_deduction) <= 0 THEN 'Settled' ELSE 'Active' END,
                updated_at = CURRENT_TIMESTAMP
            WHERE employee_id = v_record.employee_id AND status = 'Active';
        END IF;

        -- 4. Update Advance Salary status
        IF v_record.advance_deduction > 0.00 THEN
            UPDATE advance_salaries
            SET status = 'Deducted',
                updated_at = CURRENT_TIMESTAMP
            WHERE employee_id = v_record.employee_id AND deduction_month = p_payroll_month AND status = 'Approved';
        END IF;

        -- 5. Track Provident Fund Cumulative Balance
        IF (v_record.provident_fund_employee + v_record.provident_fund_company) > 0.00 THEN
            INSERT INTO provident_funds (company_id, employee_id, salary_month, employee_contribution, company_contribution, cumulative_balance)
            VALUES (
                p_company_id, v_record.employee_id, p_payroll_month, 
                v_record.provident_fund_employee, v_record.provident_fund_company,
                COALESCE((SELECT cumulative_balance FROM provident_funds WHERE employee_id = v_record.employee_id ORDER BY created_at DESC LIMIT 1), 0.00) 
                + v_record.provident_fund_employee + v_record.provident_fund_company
            );
        END IF;

        -- 6. Clean and Close pending Bonuses, Incentives, and Commissions
        UPDATE bonus_incentives 
        SET status = 'Disbursed', updated_at = CURRENT_TIMESTAMP
        WHERE employee_id = v_record.employee_id AND effective_month = p_payroll_month AND status = 'Pending';

        UPDATE employee_commissions
        SET payroll_posted = TRUE, updated_at = CURRENT_TIMESTAMP
        WHERE employee_id = v_record.employee_id AND payroll_month = p_payroll_month AND approval_status = 'Approved';

        -- 7. Add details to the Employee Sub-Ledger
        -- Fetch current running balance
        SELECT COALESCE((SELECT running_balance FROM employee_ledger WHERE employee_id = v_record.employee_id ORDER BY created_at DESC LIMIT 1), 0.00) INTO v_emp_ledger_balance;
        v_emp_ledger_balance := v_emp_ledger_balance + v_record.net_payable;

        INSERT INTO employee_ledger (company_id, employee_id, entry_date, description_en, description_bn, debit, credit, running_balance, reference_type)
        VALUES (
            p_company_id, v_record.employee_id, CURRENT_DATE,
            'Monthly Salary credit for ' || p_payroll_month,
            p_payroll_month || ' মাসের জন্য মাসিক বেতন ক্রেডিট',
            0.00, v_record.net_payable, v_emp_ledger_balance, 'Payroll'
        );
    END LOOP;

    -- 8. Build Journal Voucher Ledger Lines array
    -- Dr Salary Expense
    IF v_total_salary_expense > 0.00 THEN
        v_ledger_lines := v_ledger_lines || jsonb_build_object(
            'account_id', v_salary_expense_acc,
            'debit', v_total_salary_expense,
            'credit', 0.00,
            'narration_en', 'Aggregate Salary Expense for ' || p_payroll_month,
            'narration_bn', p_payroll_month || ' মাসের জন্য মোট বেতন খরচ'
        );
    END IF;

    -- Dr PF Expense (Company Match)
    IF v_total_pf_expense > 0.00 THEN
        v_ledger_lines := v_ledger_lines || jsonb_build_object(
            'account_id', v_pf_expense_acc,
            'debit', v_total_pf_expense,
            'credit', 0.00,
            'narration_en', 'Company Provident Fund Matching Contribution Expense for ' || p_payroll_month,
            'narration_bn', p_payroll_month || ' মাসের জন্য প্রভিডেন্ট ফান্ডে কোম্পানি ম্যাচিং অনুদান খরচ'
        );
    END IF;

    -- Cr Salaries Payable
    IF v_total_salary_payable > 0.00 THEN
        v_ledger_lines := v_ledger_lines || jsonb_build_object(
            'account_id', v_salary_payable_acc,
            'debit', 0.00,
            'credit', v_total_salary_payable,
            'narration_en', 'Net Salaries Accrued Payable for ' || p_payroll_month,
            'narration_bn', p_payroll_month || ' মাসের জন্য মোট নিট বকেয়া বেতন প্রদেয়'
        );
    END IF;

    -- Cr Provident Fund Liability (Employee + Company share combined)
    IF v_total_pf_liability > 0.00 THEN
        v_ledger_lines := v_ledger_lines || jsonb_build_object(
            'account_id', v_pf_liability_acc,
            'debit', 0.00,
            'credit', v_total_pf_liability,
            'narration_en', 'Provident Fund Accrued Trust Liability for ' || p_payroll_month,
            'narration_bn', p_payroll_month || ' মাসের জন্য সঞ্চিত প্রভিডেন্ট ফান্ড ট্রাস্ট দায়'
        );
    END IF;

    -- Cr Withholding Income Tax Payable
    IF v_total_tax_liability > 0.00 THEN
        v_ledger_lines := v_ledger_lines || jsonb_build_object(
            'account_id', v_tax_liability_acc,
            'debit', 0.00,
            'credit', v_total_tax_liability,
            'narration_en', 'Employee Withholding Tax Payable for ' || p_payroll_month,
            'narration_bn', p_payroll_month || ' মাসের জন্য কর্মচারী উইথহোল্ডিং ট্যাক্স প্রদেয়'
        );
    END IF;

    -- Cr Employee Loans Receivable (Repayments applied)
    IF v_total_loan_repayment > 0.00 THEN
        v_ledger_lines := v_ledger_lines || jsonb_build_object(
            'account_id', v_loan_receivable_acc,
            'debit', 0.00,
            'credit', v_total_loan_repayment,
            'narration_en', 'Loan Repayment Adjustments for ' || p_payroll_month,
            'narration_bn', p_payroll_month || ' মাসের জন্য ঋণ পরিশোধ সমন্বয়'
        );
    END IF;

    -- Cr Advances Against Salaries (Repayments applied)
    IF v_total_advance_repayment > 0.00 THEN
        v_ledger_lines := v_ledger_lines || jsonb_build_object(
            'account_id', v_advance_salary_acc,
            'debit', 0.00,
            'credit', v_total_advance_repayment,
            'narration_en', 'Salary Advance Adjustment Recovery for ' || p_payroll_month,
            'narration_bn', p_payroll_month || ' মাসের জন্য বেতন অগ্রিম পুনরুদ্ধার সমন্বয়'
        );
    END IF;

    -- 9. Complete General Ledger Record Insertion
    -- Call the global Balanced Stored Procedure if available, or simulate double entry journal creation
    -- We can call the post_journal_voucher function defined in accounting_procedures:
    SELECT post_journal_voucher(
        p_company_id, v_voucher_no, CURRENT_DATE, 'JV',
        'Accrued Payroll Ledger Posting for Month: ' || p_payroll_month,
        p_payroll_month || ' মাসের জন্য সঞ্চিত বেতন লেজার পোস্টিং',
        p_issued_by, v_ledger_lines
    ) INTO v_voucher_id;

    RETURN v_voucher_id;
END;
$$ LANGUAGE plpgsql;

-- 2.4. SALARY PAYMENT DISBURSEMENT RECORDING
CREATE OR REPLACE FUNCTION process_salary_disbursement(
    p_company_id UUID,
    p_employee_id UUID,
    p_month VARCHAR(7),
    p_paid_amount DECIMAL(15,2),
    p_payment_mode VARCHAR(50), -- 'Cash' | 'Bank Transfer' | 'Cheque'
    p_cash_or_bank_acc UUID, -- COA Account ID
    p_issued_by UUID
)
RETURNS UUID AS $$
DECLARE
    v_voucher_id UUID;
    v_voucher_no VARCHAR(50);
    v_salary_payable_acc UUID;
    v_emp_ledger_balance DECIMAL(15,2);
    v_ledger_lines JSONB := '[]'::JSONB;
BEGIN
    -- Locate Salary Payable Account
    SELECT id INTO v_salary_payable_acc FROM chart_of_accounts WHERE company_id = p_company_id AND (account_code = 'LIA-SAL' OR name_en ILIKE '%Salary Payable%') AND is_deleted = FALSE LIMIT 1;
    
    IF v_salary_payable_acc IS NULL THEN
        RAISE EXCEPTION 'Configuration Error: Salaries Payable account is not initialized.';
    END IF;

    -- Generate payment voucher
    v_voucher_no := 'SAL-PAY-' || p_month || '-' || SUBSTR(uuid_generate_v4()::VARCHAR, 1, 6);

    -- Dr Salaries Payable
    v_ledger_lines := v_ledger_lines || jsonb_build_object(
        'account_id', v_salary_payable_acc,
        'debit', p_paid_amount,
        'credit', 0.00,
        'narration_en', 'Salary payment disbursement to Employee ' || p_employee_id || ' for ' || p_month,
        'narration_bn', p_month || ' মাসের জন্য কর্মচারী ' || p_employee_id || '-কে বেতন পরিশোধ'
    );

    -- Cr Cash/Bank Asset Account
    v_ledger_lines := v_ledger_lines || jsonb_build_object(
        'account_id', p_cash_or_bank_acc,
        'debit', 0.00,
        'credit', p_paid_amount,
        'narration_en', 'Disbursed via ' || p_payment_mode || ' for employee salary payment',
        'narration_bn', 'কর্মচারী বেতন পরিশোধের জন্য ' || p_payment_mode || '-এর মাধ্যমে পরিশোধ করা হয়েছে'
    );

    -- Call post voucher
    SELECT post_journal_voucher(
        p_company_id, v_voucher_no, CURRENT_DATE, 'CPV',
        'Salary payment disbursement for Month: ' || p_month,
        p_month || ' মাসের জন্য বেতন পরিশোধ বিতরণ',
        p_issued_by, v_ledger_lines
    ) INTO v_voucher_id;

    -- Adjust Employee Ledger (Debit payment)
    SELECT COALESCE((SELECT running_balance FROM employee_ledger WHERE employee_id = p_employee_id ORDER BY created_at DESC LIMIT 1), 0.00) INTO v_emp_ledger_balance;
    v_emp_ledger_balance := v_emp_ledger_balance - p_paid_amount;

    INSERT INTO employee_ledger (company_id, employee_id, entry_date, description_en, description_bn, debit, credit, running_balance, reference_type)
    VALUES (
        p_company_id, p_employee_id, CURRENT_DATE,
        'Salary paid for ' || p_month || ' via ' || p_payment_mode,
        p_month || ' মাসের জন্য ' || p_payment_mode || '-এর মাধ্যমে বেতন পরিশোধ',
        p_paid_amount, 0.00, v_emp_ledger_balance, 'Payroll'
    );

    RETURN v_voucher_id;
END;
$$ LANGUAGE plpgsql;

-- 2.5. LOAN ISSUANCE RECORDING & LEDGER INTEGRATION
CREATE OR REPLACE FUNCTION issue_employee_loan(
    p_company_id UUID,
    p_employee_id UUID,
    p_loan_amount DECIMAL(15,2),
    p_installments INT,
    p_monthly_deduct DECIMAL(15,2),
    p_cash_or_bank_acc UUID, -- COA Account ID
    p_issued_by UUID
)
RETURNS UUID AS $$
DECLARE
    v_loan_id UUID;
    v_voucher_id UUID;
    v_voucher_no VARCHAR(50);
    v_loan_receivable_acc UUID;
    v_ledger_lines JSONB := '[]'::JSONB;
    v_emp_ledger_balance DECIMAL(15,2);
BEGIN
    -- Create Loan outstanding registration record
    INSERT INTO employee_loans (company_id, employee_id, loan_amount, installment_count, monthly_deduction, outstanding_balance, approved_by, status)
    VALUES (p_company_id, p_employee_id, p_loan_amount, p_installments, p_monthly_deduct, p_loan_amount, p_issued_by, 'Active')
    RETURNING id INTO v_loan_id;

    -- Locate Loan receivable chart of accounts
    SELECT id INTO v_loan_receivable_acc FROM chart_of_accounts WHERE company_id = p_company_id AND (account_code = 'AST-LON' OR name_en ILIKE '%Employee Loans%') AND is_deleted = FALSE LIMIT 1;
    
    IF v_loan_receivable_acc IS NULL THEN
        RAISE EXCEPTION 'Configuration Error: Employee Loans Receivable asset account is not initialized.';
    END IF;

    -- Create loan disbursement journal voucher
    v_voucher_no := 'LON-DIS-' || SUBSTR(uuid_generate_v4()::VARCHAR, 1, 8);

    -- Dr Loan Receivable (Asset increase)
    v_ledger_lines := v_ledger_lines || jsonb_build_object(
        'account_id', v_loan_receivable_acc,
        'debit', p_loan_amount,
        'credit', 0.00,
        'narration_en', 'Employee Loan Disbursed to ID: ' || p_employee_id,
        'narration_bn', 'কর্মচারী ঋণ আইডি: ' || p_employee_id || '-কে বিতরণ করা হয়েছে'
    );

    -- Cr Cash/Bank (Asset decrease)
    v_ledger_lines := v_ledger_lines || jsonb_build_object(
        'account_id', p_cash_or_bank_acc,
        'debit', 0.00,
        'credit', p_loan_amount,
        'narration_en', 'Disbursed employee loan amount via Bank/Cash',
        'narration_bn', 'ব্যাংক/ক্যাশের মাধ্যমে কর্মচারীর ঋণের অর্থ বিতরণ করা হয়েছে'
    );

    -- Post balanced journal entry
    SELECT post_journal_voucher(
        p_company_id, v_voucher_no, CURRENT_DATE, 'CPV',
        'Employee Loan Disbursed: ৳' || p_loan_amount,
        'কর্মচারী ঋণ বিতরণ: ৳' || p_loan_amount,
        p_issued_by, v_ledger_lines
    ) INTO v_voucher_id;

    -- Log to Employee Sub-Ledger (Loan balance debit)
    SELECT COALESCE((SELECT running_balance FROM employee_ledger WHERE employee_id = p_employee_id ORDER BY created_at DESC LIMIT 1), 0.00) INTO v_emp_ledger_balance;
    v_emp_ledger_balance := v_emp_ledger_balance - p_loan_amount;

    INSERT INTO employee_ledger (company_id, employee_id, entry_date, description_en, description_bn, debit, credit, running_balance, reference_type, reference_id)
    VALUES (
        p_company_id, p_employee_id, CURRENT_DATE,
        'Employee Loan Disbursed - principal amount of ' || p_loan_amount,
        'কর্মচারী ঋণ বিতরণ - মূল অর্থ ' || p_loan_amount,
        p_loan_amount, 0.00, v_emp_ledger_balance, 'Loan', v_loan_id
    );

    RETURN v_loan_id;
END;
$$ LANGUAGE plpgsql;

-- 2.6. AUTOMATED COMMISSION ACCRUED GENERAL LEDGER POSTING
CREATE OR REPLACE FUNCTION post_approved_commission_journal(
    p_company_id UUID,
    p_commission_id UUID,
    p_issued_by UUID
)
RETURNS UUID AS $$
DECLARE
    v_voucher_id UUID;
    v_voucher_no VARCHAR(50);
    v_employee_id UUID;
    v_amount DECIMAL(15,2);
    v_booking_id UUID;
    
    v_comm_expense_acc UUID;
    v_comm_payable_acc UUID;
    v_ledger_lines JSONB := '[]'::JSONB;
    v_emp_ledger_balance DECIMAL(15,2);
BEGIN
    -- Fetch approved commission specifics
    SELECT employee_id, calculated_amount, booking_id 
    INTO v_employee_id, v_amount, v_booking_id
    FROM employee_commissions
    WHERE id = p_commission_id AND company_id = p_company_id AND approval_status = 'Approved' AND payroll_posted = FALSE AND is_deleted = FALSE;

    IF v_employee_id IS NULL THEN
        RAISE EXCEPTION 'Approved commission record not found, or already processed.';
    END IF;

    -- Fetch accounts
    SELECT id INTO v_comm_expense_acc FROM chart_of_accounts WHERE company_id = p_company_id AND (account_code = 'EXP-COM' OR name_en ILIKE '%Commission Expense%') AND is_deleted = FALSE LIMIT 1;
    SELECT id INTO v_comm_payable_acc FROM chart_of_accounts WHERE company_id = p_company_id AND (account_code = 'LIA-COM' OR name_en ILIKE '%Commission Payable%') AND is_deleted = FALSE LIMIT 1;

    IF v_comm_expense_acc IS NULL THEN
        INSERT INTO chart_of_accounts (id, company_id, account_code, name_en, name_bn, account_type)
        VALUES (uuid_generate_v4(), p_company_id, 'EXP-COM', 'Sales Agent Commissions Expense', 'বিক্রয় প্রতিনিধি কমিশন খরচ', 'Expense') RETURNING id INTO v_comm_expense_acc;
    END IF;
    IF v_comm_payable_acc IS NULL THEN
        INSERT INTO chart_of_accounts (id, company_id, account_code, name_en, name_bn, account_type)
        VALUES (uuid_generate_v4(), p_company_id, 'LIA-COM', 'Accrued Commissions Payable', 'সঞ্চিত কমিশন প্রদেয়', 'Liability') RETURNING id INTO v_comm_payable_acc;
    END IF;

    v_voucher_no := 'COM-ACR-' || SUBSTR(uuid_generate_v4()::VARCHAR, 1, 8);

    -- Dr Commission Expense
    v_ledger_lines := v_ledger_lines || jsonb_build_object(
        'account_id', v_comm_expense_acc,
        'debit', v_amount,
        'credit', 0.00,
        'narration_en', 'Commission Accrued for sales booking ID: ' || v_booking_id,
        'narration_bn', 'সেলস বুকিং আইডি ' || v_booking_id || '-এর জন্য সঞ্চিত কমিশন'
    );

    -- Cr Commission Payable
    v_ledger_lines := v_ledger_lines || jsonb_build_object(
        'account_id', v_comm_payable_acc,
        'debit', 0.00,
        'credit', v_amount,
        'narration_en', 'Accrued sales commission payable to employee: ' || v_employee_id,
        'narration_bn', 'কর্মচারী: ' || v_employee_id || '-এর সঞ্চিত সেলস কমিশন প্রদেয়'
    );

    -- Post balanced journal entry
    SELECT post_journal_voucher(
        p_company_id, v_voucher_no, CURRENT_DATE, 'JV',
        'Sales commission accrued: ৳' || v_amount,
        'বিক্রয় কমিশন সঞ্চিত: ৳' || v_amount,
        p_issued_by, v_ledger_lines
    ) INTO v_voucher_id;

    -- Adjust Employee Ledger (Credit earnings increase)
    SELECT COALESCE((SELECT running_balance FROM employee_ledger WHERE employee_id = v_employee_id ORDER BY created_at DESC LIMIT 1), 0.00) INTO v_emp_ledger_balance;
    v_emp_ledger_balance := v_emp_ledger_balance + v_amount;

    INSERT INTO employee_ledger (company_id, employee_id, entry_date, description_en, description_bn, debit, credit, running_balance, reference_type, reference_id)
    VALUES (
        p_company_id, v_employee_id, CURRENT_DATE,
        'Sales commission credit - Booking ref: ' || v_booking_id,
        'বিক্রয় কমিশন ক্রেডিট - বুকিং রেফারেন্স: ' || v_booking_id,
        0.00, v_amount, v_emp_ledger_balance, 'Commission', p_commission_id
    );

    RETURN v_voucher_id;
END;
$$ LANGUAGE plpgsql;
