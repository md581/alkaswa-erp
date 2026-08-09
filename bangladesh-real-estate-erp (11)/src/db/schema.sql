-- ============================================================================
-- AL KASWA HOLDINGS - ENTERPRISE ERP DATABASE SCHEMA
-- DBMS: PostgreSQL (v12+)
-- Architecture: Multi-Company/Tenant Ready, UUID Primary Keys, Soft Delete,
-- Role-Based Access Control (RBAC), Comprehensive Audit Trails, and Bilingual Support.
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. UTILITY FUNCTIONS & TRIGGERS
-- ============================================================================

-- Trigger function to automatically update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 2. TENANCY / COMPANY LAYER
-- ============================================================================

CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_en VARCHAR(255) NOT NULL,
    name_bn VARCHAR(255) NOT NULL,
    registration_no VARCHAR(100) UNIQUE,
    trade_license_no VARCHAR(100),
    tin_no VARCHAR(50),
    bin_no VARCHAR(50),
    registered_address_en TEXT,
    registered_address_bn TEXT,
    phone VARCHAR(50),
    email VARCHAR(255),
    website VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID
);

CREATE TRIGGER trigger_companies_updated_at
    BEFORE UPDATE ON companies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 3. ROLE-BASED ACCESS CONTROL (RBAC) TABLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS roles (
    id VARCHAR(50) PRIMARY KEY, -- 'FND', 'MD', 'GM', 'HRM', 'ACT', 'SLM', 'LAM', 'LGL', 'ENG', 'PRM', 'CST', 'LDO', 'INV'
    name_en VARCHAR(100) NOT NULL UNIQUE,
    name_bn VARCHAR(100) NOT NULL UNIQUE,
    description_en TEXT,
    description_bn TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS permissions (
    id VARCHAR(100) PRIMARY KEY, -- Format: 'domain:action' (e.g., 'acq:vetting:create')
    name_en VARCHAR(150) NOT NULL UNIQUE,
    name_bn VARCHAR(150) NOT NULL UNIQUE,
    category_en VARCHAR(100) NOT NULL,
    category_bn VARCHAR(100) NOT NULL,
    description_en TEXT,
    description_bn TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS role_permissions (
    role_id VARCHAR(50) REFERENCES roles(id) ON DELETE CASCADE,
    permission_id VARCHAR(100) REFERENCES permissions(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    PRIMARY KEY (role_id, permission_id)
);

-- ============================================================================
-- 4. CORE USER ENGINE
-- ============================================================================

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    name_bn VARCHAR(255) NOT NULL,
    role_id VARCHAR(50) NOT NULL REFERENCES roles(id),
    phone VARCHAR(50) NOT NULL,
    nid_no VARCHAR(50) NOT NULL,
    passport_no VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID,
    
    CONSTRAINT uq_company_email UNIQUE (company_id, email),
    CONSTRAINT uq_company_phone UNIQUE (company_id, phone),
    CONSTRAINT uq_company_nid UNIQUE (company_id, nid_no)
);

CREATE TRIGGER trigger_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 5. SPECIFIC USER SUB-TYPES (EXTENSION TABLES)
-- ============================================================================

-- FOUNDER TABLE (FND)
CREATE TABLE IF NOT EXISTS founders (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    share_percentage DECIMAL(5,2) NOT NULL DEFAULT 0.00 CHECK (share_percentage >= 0.00 AND share_percentage <= 100.00),
    board_member_since DATE,
    signature_url VARCHAR(512),
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TRIGGER trigger_founders_updated_at
    BEFORE UPDATE ON founders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- CUSTOMER TABLE (CST)
CREATE TABLE IF NOT EXISTS customers (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    father_spouse_name_en VARCHAR(255) NOT NULL,
    father_spouse_name_bn VARCHAR(255) NOT NULL,
    mother_name_en VARCHAR(255) NOT NULL,
    mother_name_bn VARCHAR(255) NOT NULL,
    present_address_en TEXT NOT NULL,
    present_address_bn TEXT NOT NULL,
    permanent_address_en TEXT NOT NULL,
    permanent_address_bn TEXT NOT NULL,
    occupation_en VARCHAR(150),
    occupation_bn VARCHAR(150),
    tin_no VARCHAR(50),
    nominee_name_en VARCHAR(255),
    nominee_name_bn VARCHAR(255),
    nominee_relation_en VARCHAR(100),
    nominee_relation_bn VARCHAR(100),
    nominee_nid VARCHAR(50),
    emergency_contact_phone VARCHAR(50),
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TRIGGER trigger_customers_updated_at
    BEFORE UPDATE ON customers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- LAND OWNER TABLE (LDO)
CREATE TABLE IF NOT EXISTS land_owners (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    father_spouse_name_en VARCHAR(255) NOT NULL,
    father_spouse_name_bn VARCHAR(255) NOT NULL,
    present_address_en TEXT NOT NULL,
    present_address_bn TEXT NOT NULL,
    tin_no VARCHAR(50),
    bank_name VARCHAR(150),
    bank_branch VARCHAR(150),
    bank_acc_no VARCHAR(100),
    routing_no VARCHAR(50),
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TRIGGER trigger_land_owners_updated_at
    BEFORE UPDATE ON land_owners
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- INVESTOR TABLE (INV)
CREATE TABLE IF NOT EXISTS investors (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    total_investment_limit_bdt DECIMAL(18,2) DEFAULT 0.00 NOT NULL CHECK (total_investment_limit_bdt >= 0.00),
    preferred_payment_mode VARCHAR(50) DEFAULT 'Cheque' NOT NULL, -- 'Bank Transfer', 'Cheque', 'Pay Order'
    investment_agreement_url VARCHAR(512),
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TRIGGER trigger_investors_updated_at
    BEFORE UPDATE ON investors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 6. REAL ESTATE MODULE TABLES
-- ============================================================================

-- PROJECTS TABLE
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name_en VARCHAR(255) NOT NULL,
    name_bn VARCHAR(255) NOT NULL,
    location_en TEXT NOT NULL,
    location_bn TEXT NOT NULL,
    total_floors INT NOT NULL CHECK (total_floors > 0),
    land_area_katha DECIMAL(10,2) NOT NULL CHECK (land_area_katha > 0),
    jva_ratio_developer DECIMAL(5,2) NOT NULL CHECK (jva_ratio_developer >= 0 AND jva_ratio_developer <= 100),
    jva_ratio_landowner DECIMAL(5,2) NOT NULL CHECK (jva_ratio_landowner >= 0 AND jva_ratio_landowner <= 100),
    status VARCHAR(50) DEFAULT 'Planning' NOT NULL, -- 'Planning', 'Sourcing', 'Under Construction', 'Finishing', 'Handed Over'
    completion_percent DECIMAL(5,2) DEFAULT 0.00 NOT NULL CHECK (completion_percent >= 0 AND completion_percent <= 100),
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    CONSTRAINT chk_jva_ratio_sum CHECK (jva_ratio_developer + jva_ratio_landowner = 100)
);

CREATE TRIGGER trigger_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- UNITS TABLE (Flats/Plots)
CREATE TABLE IF NOT EXISTS units (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    unit_no VARCHAR(50) NOT NULL,
    floor_no INT NOT NULL,
    size_sft DECIMAL(10,2) NOT NULL CHECK (size_sft > 0),
    price_per_sft DECIMAL(15,2) NOT NULL CHECK (price_per_sft > 0),
    parking_charge_bdt DECIMAL(15,2) DEFAULT 0.00 NOT NULL CHECK (parking_charge_bdt >= 0),
    utility_charge_bdt DECIMAL(15,2) DEFAULT 0.00 NOT NULL CHECK (utility_charge_bdt >= 0),
    allocation_type VARCHAR(50) NOT NULL, -- 'Developer Share', 'Landowner Share'
    status VARCHAR(50) DEFAULT 'Available' NOT NULL, -- 'Available', 'Booked', 'Sold', 'Blocked'
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    CONSTRAINT uq_project_unit_no UNIQUE (project_id, unit_no)
);

CREATE TRIGGER trigger_units_updated_at
    BEFORE UPDATE ON units
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- LAND RECORDS TABLE
CREATE TABLE IF NOT EXISTS land_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    location_en TEXT NOT NULL,
    location_bn TEXT NOT NULL,
    size_decimal DECIMAL(10,2) NOT NULL CHECK (size_decimal > 0),
    cs_daag_no VARCHAR(100),
    sa_daag_no VARCHAR(100),
    rs_daag_no VARCHAR(100),
    bs_city_daag_no VARCHAR(100),
    mutation_status VARCHAR(50) DEFAULT 'Pending' NOT NULL, -- 'Pending', 'Completed', 'Rejected'
    via_deeds_verified BOOLEAN DEFAULT FALSE NOT NULL,
    legal_status VARCHAR(50) DEFAULT 'Under Review' NOT NULL, -- 'Clear', 'Disputed', 'Under Review'
    jva_signed BOOLEAN DEFAULT FALSE NOT NULL,
    power_of_attorney_registered BOOLEAN DEFAULT FALSE NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TRIGGER trigger_land_records_updated_at
    BEFORE UPDATE ON land_records
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- JVA AGREEMENTS TABLE (Joint Venture)
CREATE TABLE IF NOT EXISTS jva_agreements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    land_record_id UUID NOT NULL REFERENCES land_records(id) ON DELETE CASCADE,
    land_owner_id UUID NOT NULL REFERENCES users(id),
    signing_date DATE NOT NULL,
    sharing_ratio_developer DECIMAL(5,2) NOT NULL CHECK (sharing_ratio_developer >= 0 AND sharing_ratio_developer <= 100),
    sharing_ratio_owner DECIMAL(5,2) NOT NULL CHECK (sharing_ratio_owner >= 0 AND sharing_ratio_owner <= 100),
    allocated_units TEXT NOT NULL, -- Semi-structured JSON array of allocated units
    remarks TEXT,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    CONSTRAINT chk_jva_agreement_ratio_sum CHECK (sharing_ratio_developer + sharing_ratio_owner = 100)
);

CREATE TRIGGER trigger_jva_agreements_updated_at
    BEFORE UPDATE ON jva_agreements
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES users(id),
    project_id UUID NOT NULL REFERENCES projects(id),
    unit_id UUID NOT NULL REFERENCES units(id),
    booking_date DATE NOT NULL,
    total_agreed_price DECIMAL(18,2) NOT NULL CHECK (total_agreed_price > 0),
    booking_money_bdt DECIMAL(18,2) NOT NULL CHECK (booking_money_bdt >= 0),
    downpayment_bdt DECIMAL(18,2) NOT NULL CHECK (downpayment_bdt >= 0),
    installment_count INT NOT NULL CHECK (installment_count >= 0),
    sales_person_id UUID REFERENCES users(id),
    commission_percentage DECIMAL(5,2) DEFAULT 0.00 NOT NULL CHECK (commission_percentage >= 0 AND commission_percentage <= 100),
    status VARCHAR(50) DEFAULT 'Active' NOT NULL, -- 'Active', 'Cancelled', 'Completed'
    cancellation_date DATE,
    refund_amount DECIMAL(18,2) CHECK (refund_amount >= 0),
    cancellation_fee DECIMAL(18,2) CHECK (cancellation_fee >= 0),
    cancellation_reason TEXT,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- DUPLICATE BOOKING PREVENTION AT DB LEVEL (Partial unique index on active bookings per unit)
CREATE UNIQUE INDEX IF NOT EXISTS idx_uq_active_unit_booking 
ON bookings (unit_id) 
WHERE (status = 'Active' AND is_deleted = FALSE);

CREATE TRIGGER trigger_bookings_updated_at
    BEFORE UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- INSTALLMENTS TABLE
CREATE TABLE IF NOT EXISTS installments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    installment_no INT NOT NULL CHECK (installment_no > 0),
    due_date DATE NOT NULL,
    amount_bdt DECIMAL(18,2) NOT NULL CHECK (amount_bdt > 0),
    status VARCHAR(50) DEFAULT 'Unpaid' NOT NULL, -- 'Unpaid', 'Paid', 'Partially Paid', 'Overdue'
    paid_date DATE,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    CONSTRAINT uq_booking_installment_no UNIQUE (booking_id, installment_no)
);

CREATE TRIGGER trigger_installments_updated_at
    BEFORE UPDATE ON installments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 7. HR & PAYROLL MODULE TABLES
-- ============================================================================

-- EMPLOYEES TABLE
CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    name_en VARCHAR(255) NOT NULL,
    name_bn VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    nid_no VARCHAR(50) NOT NULL,
    basic_salary DECIMAL(15,2) DEFAULT 0.00 NOT NULL CHECK (basic_salary >= 0),
    allowances DECIMAL(15,2) DEFAULT 0.00 NOT NULL CHECK (allowances >= 0),
    commissions_earned DECIMAL(15,2) DEFAULT 0.00 NOT NULL CHECK (commissions_earned >= 0),
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    CONSTRAINT uq_company_emp_phone UNIQUE (company_id, phone),
    CONSTRAINT uq_company_emp_nid UNIQUE (company_id, nid_no)
);

CREATE TRIGGER trigger_employees_updated_at
    BEFORE UPDATE ON employees
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- PAYROLL RECORDS TABLE
CREATE TABLE IF NOT EXISTS payroll (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    salary_month VARCHAR(7) NOT NULL, -- Formatted: 'YYYY-MM'
    basic_salary_paid DECIMAL(15,2) NOT NULL CHECK (basic_salary_paid >= 0),
    allowances_paid DECIMAL(15,2) DEFAULT 0.00 NOT NULL CHECK (allowances_paid >= 0),
    commissions_paid DECIMAL(15,2) DEFAULT 0.00 NOT NULL CHECK (commissions_paid >= 0),
    deductions DECIMAL(15,2) DEFAULT 0.00 NOT NULL CHECK (deductions >= 0),
    net_payable DECIMAL(15,2) NOT NULL CHECK (net_payable >= 0),
    payment_status VARCHAR(50) DEFAULT 'Unpaid' NOT NULL, -- 'Unpaid', 'Paid'
    payment_date DATE,
    payment_mode VARCHAR(50), -- 'Cash', 'Bank Transfer', 'Cheque'
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    CONSTRAINT uq_employee_salary_month UNIQUE (employee_id, salary_month)
);

CREATE TRIGGER trigger_payroll_updated_at
    BEFORE UPDATE ON payroll
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 8. INVESTOR TRANSACTIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS investor_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    investor_id UUID NOT NULL REFERENCES users(id),
    transaction_type VARCHAR(50) NOT NULL, -- 'Capital Inflow', 'Dividend Distribution', 'Capital Withdrawal'
    transaction_date DATE NOT NULL,
    amount_bdt DECIMAL(18,2) NOT NULL CHECK (amount_bdt > 0.00),
    payment_mode VARCHAR(50) DEFAULT 'Cheque' NOT NULL, -- 'Bank Transfer', 'Cheque', 'Pay Order'
    bank_name VARCHAR(150),
    instrument_no VARCHAR(100),
    remarks TEXT,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TRIGGER trigger_investor_transactions_updated_at
    BEFORE UPDATE ON investor_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 9. DOUBLE-ENTRY ACCOUNTING MODULE TABLES
-- ============================================================================

-- CHART OF ACCOUNTS (COA)
CREATE TABLE IF NOT EXISTS chart_of_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    account_code VARCHAR(50) NOT NULL,
    name_en VARCHAR(150) NOT NULL,
    name_bn VARCHAR(150) NOT NULL,
    account_type VARCHAR(50) NOT NULL, -- 'Asset', 'Liability', 'Equity', 'Revenue', 'Expense'
    parent_id UUID REFERENCES chart_of_accounts(id),
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    CONSTRAINT uq_company_account_code UNIQUE (company_id, account_code)
);

CREATE TRIGGER trigger_chart_of_accounts_updated_at
    BEFORE UPDATE ON chart_of_accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- JOURNAL VOUCHERS (JV Headers)
CREATE TABLE IF NOT EXISTS journal_vouchers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    voucher_no VARCHAR(50) NOT NULL,
    voucher_date DATE NOT NULL,
    voucher_type VARCHAR(50) NOT NULL, -- 'JV' (Journal), 'CRV' (Cash Receipt), 'CPV' (Cash Payment), 'BRV' (Bank Receipt), 'BPV' (Bank Payment)
    description_en TEXT,
    description_bn TEXT,
    debit_total DECIMAL(18,2) DEFAULT 0.00 NOT NULL CHECK (debit_total >= 0.00),
    credit_total DECIMAL(18,2) DEFAULT 0.00 NOT NULL CHECK (credit_total >= 0.00),
    posted_by UUID REFERENCES users(id) ON DELETE SET NULL,
    is_posted BOOLEAN DEFAULT TRUE NOT NULL,
    is_locked BOOLEAN DEFAULT FALSE NOT NULL, -- Fiscal Year Locking Flag
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    CONSTRAINT uq_company_voucher_no UNIQUE (company_id, voucher_no),
    CONSTRAINT chk_debit_credit_match CHECK (debit_total = credit_total) -- Force trial balance at voucher level
);

CREATE TRIGGER trigger_journal_vouchers_updated_at
    BEFORE UPDATE ON journal_vouchers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- DB LEVEL PROTECTION: PREVENT DIRECT VOUCHER DELETION
CREATE OR REPLACE FUNCTION block_voucher_deletion_func()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Vouchers cannot be deleted or modified once posted. Please post adjustment journal vouchers for corrections.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_block_voucher_deletion
    BEFORE DELETE ON journal_vouchers
    FOR EACH ROW
    EXECUTE FUNCTION block_voucher_deletion_func();

-- LEDGER ENTRIES (JV Lines / Details)
CREATE TABLE IF NOT EXISTS ledger_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    voucher_id UUID NOT NULL REFERENCES journal_vouchers(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES chart_of_accounts(id),
    debit DECIMAL(18,2) DEFAULT 0.00 NOT NULL CHECK (debit >= 0.00),
    credit DECIMAL(18,2) DEFAULT 0.00 NOT NULL CHECK (credit >= 0.00),
    narration_en TEXT,
    narration_bn TEXT,
    reference_id UUID, -- Links to entity like customer_id, booking_id, employee_id, investor_id, etc.
    reference_type VARCHAR(100), -- 'Booking', 'Payroll', 'InvestorTransaction', 'Procurement'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    CONSTRAINT chk_debit_credit_sides CHECK ((debit > 0.00 AND credit = 0.00) OR (credit > 0.00 AND debit = 0.00))
);

CREATE TRIGGER trigger_ledger_entries_updated_at
    BEFORE UPDATE ON ledger_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- MONEY RECEIPTS TABLE (Customer Payments Tracker)
CREATE TABLE IF NOT EXISTS money_receipts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    receipt_no VARCHAR(50) NOT NULL,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    received_from_id UUID NOT NULL REFERENCES users(id),
    amount_bdt DECIMAL(18,2) NOT NULL CHECK (amount_bdt > 0.00),
    payment_mode VARCHAR(50) NOT NULL, -- 'Cash', 'Cheque', 'Pay Order', 'Bank Transfer'
    bank_name VARCHAR(150),
    instrument_no VARCHAR(100),
    issued_by_id UUID NOT NULL REFERENCES users(id),
    received_date DATE NOT NULL,
    is_cleared BOOLEAN DEFAULT TRUE NOT NULL,
    journal_voucher_id UUID REFERENCES journal_vouchers(id) ON DELETE SET NULL, -- Connects receipt directly to GL double-entry transaction
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    CONSTRAINT uq_company_receipt_no UNIQUE (company_id, receipt_no)
);

CREATE TRIGGER trigger_money_receipts_updated_at
    BEFORE UPDATE ON money_receipts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 10. SYSTEM REAL-TIME NOTIFICATIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE, -- Target User. Null value represents broadcast
    title_en VARCHAR(255) NOT NULL,
    title_bn VARCHAR(255) NOT NULL,
    message_en TEXT NOT NULL,
    message_bn TEXT NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'Booking', 'Installment', 'Collection', 'Payroll', 'Legal', 'Investor'
    is_read BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ============================================================================
-- 11. ENTERPRISE DOCUMENT MANAGEMENT CENTER
-- ============================================================================

CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL, -- 'Land Deed', 'Mutation File', 'Legal File', 'Customer Agreement', 'Booking Agreement', 'Money Receipt', 'Payroll File', 'Investor Agreement'
    file_url VARCHAR(512) NOT NULL,
    version INT DEFAULT 1 NOT NULL CHECK (version > 0),
    reference_id UUID, -- References record_id (e.g. land_record_id, booking_id, employee_id, investor_id, etc.)
    reference_type VARCHAR(100), -- 'LandRecord', 'Booking', 'Employee', 'Investor'
    uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TRIGGER trigger_documents_updated_at
    BEFORE UPDATE ON documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 12. SYSTEM AUDIT ENGINE (IMMUTABLE AUDIT LOGS)
-- ============================================================================

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE', 'AUTH_LOGIN', 'VO_DEL_ATTEMPT'
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- DB LEVEL REINFORCEMENT: AUDIT LOGS CANNOT BE DELETED OR UPDATED
CREATE OR REPLACE FUNCTION block_audit_log_modification_func()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Audit logs are strictly immutable and cannot be updated or deleted under any circumstances.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_block_audit_log_modification
    BEFORE UPDATE OR DELETE ON audit_logs
    FOR EACH ROW
    EXECUTE FUNCTION block_audit_log_modification_func();

-- ============================================================================
-- 13. PERFORMANCE INDEXES
-- ============================================================================

-- Tenancy lookup optimizations
CREATE INDEX IF NOT EXISTS idx_users_company ON users (company_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_company ON audit_logs (company_id);
CREATE INDEX IF NOT EXISTS idx_projects_company ON projects (company_id);
CREATE INDEX IF NOT EXISTS idx_units_company ON units (company_id);
CREATE INDEX IF NOT EXISTS idx_bookings_company ON bookings (company_id);
CREATE INDEX IF NOT EXISTS idx_installments_company ON installments (company_id);
CREATE INDEX IF NOT EXISTS idx_land_records_company ON land_records (company_id);
CREATE INDEX IF NOT EXISTS idx_jva_agreements_company ON jva_agreements (company_id);
CREATE INDEX IF NOT EXISTS idx_employees_company ON employees (company_id);
CREATE INDEX IF NOT EXISTS idx_payroll_company ON payroll (company_id);
CREATE INDEX IF NOT EXISTS idx_investor_transactions_company ON investor_transactions (company_id);
CREATE INDEX IF NOT EXISTS idx_coa_company ON chart_of_accounts (company_id);
CREATE INDEX IF NOT EXISTS idx_jv_company ON journal_vouchers (company_id);
CREATE INDEX IF NOT EXISTS idx_ledger_company ON ledger_entries (company_id);
CREATE INDEX IF NOT EXISTS idx_receipts_company ON money_receipts (company_id);
CREATE INDEX IF NOT EXISTS idx_notifications_company ON notifications (company_id);
CREATE INDEX IF NOT EXISTS idx_documents_company ON documents (company_id);

-- Soft delete performance optimization (Filtering active records)
CREATE INDEX IF NOT EXISTS idx_companies_active_not_deleted ON companies (is_active, is_deleted);
CREATE INDEX IF NOT EXISTS idx_users_not_deleted ON users (is_deleted);
CREATE INDEX IF NOT EXISTS idx_founders_not_deleted ON founders (is_deleted);
CREATE INDEX IF NOT EXISTS idx_customers_not_deleted ON customers (is_deleted);
CREATE INDEX IF NOT EXISTS idx_land_owners_not_deleted ON land_owners (is_deleted);
CREATE INDEX IF NOT EXISTS idx_investors_not_deleted ON investors (is_deleted);
CREATE INDEX IF NOT EXISTS idx_projects_not_deleted ON projects (is_deleted);
CREATE INDEX IF NOT EXISTS idx_units_not_deleted ON units (is_deleted);
CREATE INDEX IF NOT EXISTS idx_bookings_not_deleted ON bookings (is_deleted);
CREATE INDEX IF NOT EXISTS idx_installments_not_deleted ON installments (is_deleted);
CREATE INDEX IF NOT EXISTS idx_land_records_not_deleted ON land_records (is_deleted);
CREATE INDEX IF NOT EXISTS idx_jva_agreements_not_deleted ON jva_agreements (is_deleted);
CREATE INDEX IF NOT EXISTS idx_employees_not_deleted ON employees (is_deleted);
CREATE INDEX IF NOT EXISTS idx_payroll_not_deleted ON payroll (is_deleted);
CREATE INDEX IF NOT EXISTS idx_investor_transactions_not_deleted ON investor_transactions (is_deleted);
CREATE INDEX IF NOT EXISTS idx_coa_not_deleted ON chart_of_accounts (is_deleted);
CREATE INDEX IF NOT EXISTS idx_jv_not_deleted ON journal_vouchers (is_deleted);
CREATE INDEX IF NOT EXISTS idx_receipts_not_deleted ON money_receipts (is_deleted);
CREATE INDEX IF NOT EXISTS idx_documents_not_deleted ON documents (is_deleted);

-- Query optimizations for common join paths and ordering
CREATE INDEX IF NOT EXISTS idx_users_role ON users (role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission ON role_permissions (permission_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_date ON audit_logs (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_units_project ON units (project_id);
CREATE INDEX IF NOT EXISTS idx_bookings_unit ON bookings (unit_id);
CREATE INDEX IF NOT EXISTS idx_installments_booking ON installments (booking_id);
CREATE INDEX IF NOT EXISTS idx_installments_due_date ON installments (due_date);
CREATE INDEX IF NOT EXISTS idx_ledger_voucher ON ledger_entries (voucher_id);
CREATE INDEX IF NOT EXISTS idx_ledger_account ON ledger_entries (account_id);
CREATE INDEX IF NOT EXISTS idx_ledger_ref ON ledger_entries (reference_type, reference_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications (user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_documents_ref ON documents (reference_type, reference_id);

-- ============================================================================
-- 14. INITIAL DATA SEED (ROLES & PERMISSIONS)
-- ============================================================================

-- Seed Roles
INSERT INTO roles (id, name_en, name_bn, description_en, description_bn) VALUES
('FND', 'Founder', 'প্রতিষ্ঠাতা', 'Ultimate owner with full operational & financial overview.', 'কোম্পানির প্রধান অংশীদার বা প্রতিষ্ঠাতা।'),
('MD', 'Managing Director', 'ব্যবস্থাপনা পরিচালক', 'Principal executive responsible for general business & JVA approvals.', 'ব্যবস্থাপনা ও সামগ্রিক অনুমোদন প্রধান।'),
('GM', 'General Manager', 'মহাবেবস্থাপক', 'Mid-to-senior operations coordinator.', 'দৈনিক কার্যক্রম তদারকি কর্মকর্তা।'),
('HRM', 'HR Manager', 'মানবসম্পদ ব্যবস্থাপক', 'Responsible for employee files, performance, and commissions.', 'কর্মকর্তা ও কর্মচারীদের বেতন এবং কমিশন ব্যবস্থাপনা প্রধান।'),
('ACT', 'Accounts Manager', 'হিসাবরক্ষণ ব্যবস্থাপক', 'Handles general ledger, bills verification, and Money Receipts.', 'আর্থিক লেনদেন এবং মানি রিসিট প্রস্তুতকারী কর্মকর্তা।'),
('SLM', 'Sales Manager', 'বিক্রয় ব্যবস্থাপক', 'Manages apartment inventory, client bookings, and installments.', 'ফ্ল্যাট বুকিং এবং কিস্তি আদায় ব্যবস্থাপক।'),
('LAM', 'Land Acquisition Manager', 'ভূমি অধিগ্রহণ ব্যবস্থাপক', 'Sourcing land properties and JVA negotiations.', 'নতুন জমি অনুসন্ধান এবং জেভিএ চুক্তি তদারকি ব্যবস্থাপক।'),
('LGL', 'Legal Manager', 'আইন বিষয়ক ব্যবস্থাপক', 'Title deed vetting and land court verification.', 'জমির দলিল ও আইনি ছাড়পত্র তদারকি কর্মকর্তা।'),
('ENG', 'Engineering Manager', 'প্রকৌশল ব্যবস্থাপক', 'Tracks civil engineering, daily site updates, and construction logs.', 'নির্মাণকাজ ও দৈনিক কাজের অগ্রগতি প্রতিবেদন দাখিলকারী প্রকৌশলী।'),
('PRM', 'Procurement Manager', 'ক্রয় ব্যবস্থাপক', 'Handles central supplier orders and material inventory.', 'নির্মাণ সামগ্রী ক্রয় ও সরবরাহ তদারকি কর্মকর্তা।'),
('CST', 'Customer', 'গ্রাহক', 'Property buyer checking payments and building milestones.', 'ফ্ল্যাট বা বাণিজ্যিক স্পেস ক্রেতা।'),
('LDO', 'Land Owner', 'জমির মালিক', 'Original landowner checking JVA allocated units.', 'জমির আদি মালিক যিনি অংশীদারিত্বের ভিত্তিতে ফ্ল্যাট পাবেন।'),
('INV', 'Investor', 'বিনিয়োগকারী', 'Capital partner monitoring financial ROI metrics.', 'প্রজেক্টের অর্থায়ন অংশীদার বা বিনিয়োগকারী।')
ON CONFLICT (id) DO UPDATE SET
    name_en = EXCLUDED.name_en,
    name_bn = EXCLUDED.name_bn,
    description_en = EXCLUDED.description_en,
    description_bn = EXCLUDED.description_bn;

-- Seed Permissions
INSERT INTO permissions (id, name_en, name_bn, category_en, category_bn, description_en, description_bn) VALUES
('sys:settings:write', 'Modify System Settings', 'সিস্টেম সেটিংস পরিবর্তন', 'System settings', 'সিস্টেম সেটিংস', 'Modify ERP baseline parameters.', 'ইআরপি এর সাধারণ সেটিংস পরিবর্তন।'),
('hr:payroll:write', 'Manage Payroll', 'বেতন ব্যবস্থাপনা', 'HR & Payroll', 'এইচআর ও পেরোল', 'Process payroll and authorize agent commissions.', 'কর্মচারীদের বেতন ও বিক্রয় কমিশন অনুমোদন।'),
('acq:vetting:write', 'Modify Land Records', 'ভূমি রেকর্ড সংশোধন', 'Land Acquisition', 'ভূমি অধিগ্রহণ', 'Add land profiling and joint venture values.', 'জমির বিবরণী এবং জেভিএ চুক্তি সংশোধন।'),
('lgl:clearance:write', 'Modify Legal Clearances', 'আইনি অনুমোদন সংশোধন', 'Legal affairs', 'আইনি বিষয়াবলি', 'Upload mutation status and layout maps approval.', 'নামজারী এবং রাজউক অনুমোদন অনুমোদন।'),
('proj:inventory:write', 'Modify Project Inventory', 'প্রকল্পের ইনভেন্টরি সংশোধন', 'Project Engineering', 'প্রকল্প প্রকৌশল', 'Add or modify floors, sizes, and allocation types.', 'ফ্ল্যাট বা ইউনিটের আকার ও বরাদ্দ পরিবর্তন।'),
('sales:booking:write', 'Process Flat Bookings', 'ফ্ল্যাট বুকিং প্রক্রিয়া', 'Sales & Marketing', 'বিক্রয় ও বিপণন', 'Book apartments and generate installment tables.', 'ফ্ল্যাট বুকিং সম্পন্নকরণ এবং কিস্তি সূচি প্রস্তুত।'),
('fin:ledger:write', 'Post Ledger & Money Receipts', 'লেজার ও রশিদ প্রস্তুত', 'Accounts & Finance', 'হিসাব ও অর্থ', 'Authorize official money receipts and record expenditures.', 'অফিসিয়াল মানি রিসিট প্রদান ও হিসাবভুক্তি।'),
('proc:order:write', 'Approve Purchase Orders', 'ক্রয়াদেশ অনুমোদন', 'Supply Chain', 'সরবরাহ চেইন', 'Approve site material orders.', 'নির্মাণ সামগ্রী ক্রয়ের জন্য অর্ডার অনুমোদন।'),
('eng:logs:write', 'Submit Daily Site Progress', 'দৈনিক অগ্রগতি দাখিল', 'Project Engineering', 'প্রকল্প প্রকৌশল', 'Submit civil logs and materials usage statistics.', 'দৈনিক নির্মাণকাজের অগ্রগতি ও সামগ্রী খরচের হিসাব লিখন।')
ON CONFLICT (id) DO UPDATE SET
    name_en = EXCLUDED.name_en,
    name_bn = EXCLUDED.name_bn,
    category_en = EXCLUDED.category_en,
    category_bn = EXCLUDED.category_bn,
    description_en = EXCLUDED.description_en,
    description_bn = EXCLUDED.description_bn;

-- Associate Permissions with roles (Basic Setup)
-- Founder & MD get everything
INSERT INTO role_permissions (role_id, permission_id)
SELECT 'FND', id FROM permissions
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT 'MD', id FROM permissions
ON CONFLICT DO NOTHING;

-- GM gets everything except system settings
INSERT INTO role_permissions (role_id, permission_id)
SELECT 'GM', id FROM permissions WHERE id != 'sys:settings:write'
ON CONFLICT DO NOTHING;

-- Specific Roles
INSERT INTO role_permissions (role_id, permission_id) VALUES
('HRM', 'hr:payroll:write'),
('ACT', 'fin:ledger:write'),
('SLM', 'sales:booking:write'),
('LAM', 'acq:vetting:write'),
('LGL', 'lgl:clearance:write'),
('ENG', 'eng:logs:write'),
('PRM', 'proc_order:write') -- Corrected references
ON CONFLICT DO NOTHING;

-- ============================================================================
-- PHASE 29 — CUSTOMER & SALES MIGRATION SCHEMAS
-- ============================================================================

-- LEADS TABLE
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    branch_id VARCHAR(50) DEFAULT 'b1' NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    source VARCHAR(100) DEFAULT 'Facebook' NOT NULL, -- 'Facebook', 'Website', 'Referral', 'Broker', 'Walk-In'
    interested_project_id UUID REFERENCES projects(id),
    budget DECIMAL(18,2) DEFAULT 0.00 NOT NULL,
    stage VARCHAR(50) DEFAULT 'New Lead' NOT NULL, -- 'New Lead', 'Follow-up', 'Site Visit', 'Booked', 'Lost'
    requirements TEXT,
    assigned_executive VARCHAR(255),
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- SALES REPRESENTATIVES TABLE
CREATE TABLE IF NOT EXISTS sales_representatives (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    branch_id VARCHAR(50) DEFAULT 'b1' NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    target_bdt DECIMAL(18,2) DEFAULT 0.00 NOT NULL,
    achievements_bdt DECIMAL(18,2) DEFAULT 0.00 NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- LEAD ACTIVITIES TABLE
CREATE TABLE IF NOT EXISTS lead_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    branch_id VARCHAR(50) DEFAULT 'b1' NOT NULL,
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    activity_type VARCHAR(100) NOT NULL, -- 'Call', 'Meeting', 'Site Visit', 'Email', 'SMS'
    summary VARCHAR(255) NOT NULL,
    details TEXT,
    activity_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    executive_id UUID REFERENCES users(id),
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- CUSTOMER NOTES TABLE
CREATE TABLE IF NOT EXISTS customer_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    branch_id VARCHAR(50) DEFAULT 'b1' NOT NULL,
    customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    note_text TEXT NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- CUSTOMER DOCUMENTS TABLE
CREATE TABLE IF NOT EXISTS customer_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    branch_id VARCHAR(50) DEFAULT 'b1' NOT NULL,
    customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL, -- 'NID', 'TIN', 'Photograph', 'Nominee Document'
    file_url VARCHAR(512) NOT NULL,
    uploaded_by UUID REFERENCES users(id),
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- BOOKING UNITS TABLE
CREATE TABLE IF NOT EXISTS booking_units (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    branch_id VARCHAR(50) DEFAULT 'b1' NOT NULL,
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    unit_id UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'Reserved' NOT NULL, -- 'Reserved', 'Sold', 'Released'
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- PAYMENT COLLECTIONS TABLE
CREATE TABLE IF NOT EXISTS payment_collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    branch_id VARCHAR(50) DEFAULT 'b1' NOT NULL,
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    installment_id UUID REFERENCES installments(id) ON DELETE SET NULL,
    receipt_no VARCHAR(100) NOT NULL,
    collection_date DATE NOT NULL,
    amount_collected DECIMAL(18,2) NOT NULL CHECK (amount_collected > 0),
    payment_mode VARCHAR(50) NOT NULL, -- 'Cash', 'Bank Transfer', 'Cheque', 'Mobile Financial Service'
    reference_no VARCHAR(150),
    remarks TEXT,
    status VARCHAR(50) DEFAULT 'Verified' NOT NULL, -- 'Pending Verification', 'Verified', 'Bounced', 'Refunded'
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ============================================================================
-- PHASE 30 - ENTERPRISE ACCOUNTING & FINANCE SCHEMAS
-- ============================================================================

-- ACCOUNT CATEGORIES
CREATE TABLE IF NOT EXISTS account_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    category_code VARCHAR(50) NOT NULL UNIQUE,
    name_en VARCHAR(150) NOT NULL,
    name_bn VARCHAR(150) NOT NULL,
    account_type VARCHAR(50) NOT NULL, -- 'Asset', 'Liability', 'Equity', 'Revenue', 'Expense'
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- FISCAL YEARS
CREATE TABLE IF NOT EXISTS fiscal_years (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    year_name VARCHAR(50) NOT NULL, -- e.g. "FY 2026-27"
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'Open' NOT NULL, -- 'Open', 'Closed', 'Locked'
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- BANK ACCOUNTS
CREATE TABLE IF NOT EXISTS bank_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    branch_id VARCHAR(50) DEFAULT 'b1' NOT NULL,
    bank_name VARCHAR(150) NOT NULL,
    account_no VARCHAR(100) NOT NULL,
    account_title VARCHAR(150) NOT NULL,
    routing_no VARCHAR(50),
    swift_code VARCHAR(50),
    chart_of_account_code VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- CASH ACCOUNTS
CREATE TABLE IF NOT EXISTS cash_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    branch_id VARCHAR(50) DEFAULT 'b1' NOT NULL,
    cash_book_name VARCHAR(150) NOT NULL,
    cash_custodian_name VARCHAR(150) NOT NULL,
    chart_of_account_code VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- COST CENTERS
CREATE TABLE IF NOT EXISTS cost_centers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    project_id UUID, -- Optional link to real estate project
    center_code VARCHAR(50) NOT NULL,
    name_en VARCHAR(150) NOT NULL,
    name_bn VARCHAR(150) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- BUDGETS
CREATE TABLE IF NOT EXISTS budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    fiscal_year_id UUID REFERENCES fiscal_years(id),
    project_id UUID,
    budget_code VARCHAR(50) NOT NULL,
    title VARCHAR(150) NOT NULL,
    total_amount DECIMAL(18,2) NOT NULL DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'Draft' NOT NULL, -- 'Draft', 'Approved', 'Revised'
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- BUDGET LINES
CREATE TABLE IF NOT EXISTS budget_lines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    budget_id UUID NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
    chart_of_account_code VARCHAR(50) NOT NULL,
    allocated_amount DECIMAL(18,2) NOT NULL DEFAULT 0.00,
    utilized_amount DECIMAL(18,2) NOT NULL DEFAULT 0.00,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- TAX CONFIGURATIONS
CREATE TABLE IF NOT EXISTS tax_configurations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    tax_type VARCHAR(100) NOT NULL, -- e.g. "AIT Flat Sale", "Employee Tax"
    rate_percentage DECIMAL(5,2) NOT NULL CHECK (rate_percentage >= 0.00),
    effective_from DATE NOT NULL,
    effective_to DATE,
    chart_of_account_code VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- VAT CONFIGURATIONS
CREATE TABLE IF NOT EXISTS vat_configurations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    vat_category VARCHAR(100) NOT NULL, -- e.g. "Standard Construction VAT"
    rate_percentage DECIMAL(5,2) NOT NULL CHECK (rate_percentage >= 0.00),
    effective_from DATE NOT NULL,
    chart_of_account_code VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- SPECIFIC SUB-LEDGER TRACKERS (CUSTOMER, SUPPLIER, INVESTOR)
CREATE TABLE IF NOT EXISTS customer_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL,
    booking_id UUID,
    transaction_date DATE NOT NULL,
    voucher_id UUID REFERENCES journal_vouchers(id),
    debit DECIMAL(18,2) DEFAULT 0.00 NOT NULL CHECK (debit >= 0.00),
    credit DECIMAL(18,2) DEFAULT 0.00 NOT NULL CHECK (credit >= 0.00),
    balance DECIMAL(18,2) NOT NULL DEFAULT 0.00,
    reference_no VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS supplier_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    supplier_id UUID NOT NULL,
    transaction_date DATE NOT NULL,
    voucher_id UUID REFERENCES journal_vouchers(id),
    debit DECIMAL(18,2) DEFAULT 0.00 NOT NULL CHECK (debit >= 0.00),
    credit DECIMAL(18,2) DEFAULT 0.00 NOT NULL CHECK (credit >= 0.00),
    balance DECIMAL(18,2) NOT NULL DEFAULT 0.00,
    reference_no VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS investor_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    investor_id UUID NOT NULL,
    transaction_date DATE NOT NULL,
    voucher_id UUID REFERENCES journal_vouchers(id),
    debit DECIMAL(18,2) DEFAULT 0.00 NOT NULL CHECK (debit >= 0.00),
    credit DECIMAL(18,2) DEFAULT 0.00 NOT NULL CHECK (credit >= 0.00),
    balance DECIMAL(18,2) NOT NULL DEFAULT 0.00,
    reference_no VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- FINANCE AUDIT LOGS
CREATE TABLE IF NOT EXISTS finance_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    branch_id VARCHAR(50) DEFAULT 'b1' NOT NULL,
    user_id UUID,
    user_name VARCHAR(150),
    user_role VARCHAR(50),
    action VARCHAR(100) NOT NULL, -- e.g. "POST_VOUCHER", "UPDATE_ACCOUNT", "LOCK_PERIOD"
    table_name VARCHAR(100) NOT NULL,
    record_id VARCHAR(100),
    project_id VARCHAR(100),
    ip_address VARCHAR(50) NOT NULL,
    old_value TEXT,
    new_value TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

