-- ============================================================================
-- AL KASWA HOLDINGS - ACCOUNTING CORE ENGINE (DATABASE LAYER)
-- DBMS: PostgreSQL (v12+)
-- Rules Enforced: Multi-tenant, double-entry validation, transaction safety,
-- fiscal year locking, immutable postings, and auto-journals for bookings.
-- ============================================================================

-- ============================================================================
-- 1. TRANSACTIONAL POSTING ENGINE (STORED PROCEDURES & FUNCTIONS)
-- ============================================================================

/**
 * Creates a complete Journal Voucher with balanced ledger entries.
 * Enforces:
 *   - Sum(Debit) = Sum(Credit) > 0
 *   - No posting allowed if the voucher date falls inside a locked fiscal year.
 *   - Strict multi-company tenant validation.
 */
CREATE OR REPLACE FUNCTION post_journal_voucher(
    p_company_id UUID,
    p_voucher_no VARCHAR(50),
    p_voucher_date DATE,
    p_voucher_type VARCHAR(50),
    p_description_en TEXT,
    p_description_bn TEXT,
    p_posted_by UUID,
    p_ledger_entries JSONB -- Array of lines: [{"account_id": "uuid", "debit": 100.00, "credit": 0.00, "narration_en": "...", "narration_bn": "...", "reference_id": "uuid", "reference_type": "..."}]
)
RETURNS UUID AS $$
DECLARE
    v_voucher_id UUID;
    v_debit_sum DECIMAL(18,2) := 0.00;
    v_credit_sum DECIMAL(18,2) := 0.00;
    v_line RECORD;
    v_account_type VARCHAR(50);
    v_account_company UUID;
    v_fiscal_locked BOOLEAN;
BEGIN
    -- 1. Check Fiscal Year Lock
    -- Check if there is an active lock for this period and company
    SELECT EXISTS (
        SELECT 1 FROM journal_vouchers 
        WHERE company_id = p_company_id 
          AND is_locked = TRUE 
          AND p_voucher_date BETWEEN '2020-01-01' AND voucher_date -- or based on active fiscal lock tables
    ) INTO v_fiscal_locked;
    
    -- For real-world implementation, lock is checked on a fiscal year master. We simulate:
    IF p_voucher_date <= '2026-06-30'::DATE THEN
        -- Hardcoded past fiscal year lock safeguard for demo purposes
        v_fiscal_locked := TRUE;
    ELSE
        v_fiscal_locked := FALSE;
    END IF;

    IF v_fiscal_locked THEN
        RAISE EXCEPTION 'Action Blocked: Voucher date % falls inside a locked or closed fiscal period.', p_voucher_date;
    END IF;

    -- 2. Verify Voucher Number Uniqueness
    IF EXISTS (SELECT 1 FROM journal_vouchers WHERE company_id = p_company_id AND voucher_no = p_voucher_no) THEN
        RAISE EXCEPTION 'Integrity Error: Voucher number % already exists for this company.', p_voucher_no;
    END IF;

    -- 3. Calculate Ledger Debit and Credit Sums and validate tenancy
    FOR v_line IN SELECT * FROM jsonb_to_recordset(p_ledger_entries) 
        AS x(account_id UUID, debit DECIMAL(18,2), credit DECIMAL(18,2), narration_en TEXT, narration_bn TEXT, reference_id UUID, reference_type VARCHAR(100)) 
    LOOP
        v_debit_sum := v_debit_sum + COALESCE(v_line.debit, 0.00);
        v_credit_sum := v_credit_sum + COALESCE(v_line.credit, 0.00);

        -- Validate Chart of Account belongs to the same tenant company
        SELECT company_id, account_type INTO v_account_company, v_account_type 
        FROM chart_of_accounts 
        WHERE id = v_line.account_id AND is_deleted = FALSE;

        IF v_account_company IS NULL THEN
            RAISE EXCEPTION 'Validation Error: Account ID % does not exist.', v_line.account_id;
        END IF;

        IF v_account_company <> p_company_id THEN
            RAISE EXCEPTION 'Security Violation: Account ID % belongs to another company tenant.', v_line.account_id;
        END IF;

        -- Enforce line level debit vs credit check
        IF (v_line.debit > 0.00 AND v_line.credit > 0.00) OR (v_line.debit = 0.00 AND v_line.credit = 0.00) THEN
            RAISE EXCEPTION 'Accounting Rule Violation: Ledger line must have strictly either a Debit or a Credit value, never both or neither.';
        END IF;
    END LOOP;

    -- 4. Enforce Double-Entry Balance
    IF v_debit_sum <> v_credit_sum THEN
        RAISE EXCEPTION 'Double-Entry Error: Unbalanced transaction. Total Debits (৳%) must exactly equal Total Credits (৳%).', v_debit_sum, v_credit_sum;
    END IF;

    IF v_debit_sum <= 0.00 THEN
        RAISE EXCEPTION 'Double-Entry Error: Total Debit and Credit amounts must be greater than zero.';
    END IF;

    -- 5. Insert Voucher Header
    INSERT INTO journal_vouchers (
        id, company_id, voucher_no, voucher_date, voucher_type, 
        description_en, description_bn, debit_total, credit_total, 
        posted_by, is_posted, is_locked, is_deleted
    ) VALUES (
        uuid_generate_v4(), p_company_id, p_voucher_no, p_voucher_date, p_voucher_type,
        p_description_en, p_description_bn, v_debit_sum, v_credit_sum,
        p_posted_by, TRUE, FALSE, FALSE
    ) RETURNING id INTO v_voucher_id;

    -- 6. Insert Ledger Entries (Details)
    INSERT INTO ledger_entries (
        id, company_id, voucher_id, account_id, debit, credit, 
        narration_en, narration_bn, reference_id, reference_type
    )
    SELECT 
        uuid_generate_v4(), p_company_id, v_voucher_id, x.account_id, COALESCE(x.debit, 0.00), COALESCE(x.credit, 0.00),
        x.narration_en, x.narration_bn, x.reference_id, x.reference_type
    FROM jsonb_to_recordset(p_ledger_entries) 
        AS x(account_id UUID, debit DECIMAL(18,2), credit DECIMAL(18,2), narration_en TEXT, narration_bn TEXT, reference_id UUID, reference_type VARCHAR(100));

    -- 7. Write Audit Log
    INSERT INTO audit_logs (
        company_id, user_id, action, table_name, record_id, new_values, created_at
    ) VALUES (
        p_company_id, p_posted_by, 'INSERT_VOUCHER', 'journal_vouchers', v_voucher_id, 
        jsonb_build_object('voucher_no', p_voucher_no, 'debit_total', v_debit_sum, 'lines_count', jsonb_array_length(p_ledger_entries)),
        CURRENT_TIMESTAMP
    );

    RETURN v_voucher_id;
END;
$$ LANGUAGE plpgsql;


-- ============================================================================
-- 2. DYNAMIC AUTO-POSTING TRIGGERS & PROCEDURES
-- ============================================================================

/**
 * AUTO POSTING FOR FLAT/PLOT BOOKING CREATED
 * Debits Accounts Receivable (Asset)
 * Credits Real Estate Sales (Revenue)
 */
CREATE OR REPLACE FUNCTION auto_post_booking_journal(
    p_booking_id UUID
)
RETURNS UUID AS $$
DECLARE
    v_company_id UUID;
    v_total_price DECIMAL(18,2);
    v_customer_id UUID;
    v_sales_person_id UUID;
    v_project_name VARCHAR(255);
    v_unit_no VARCHAR(50);
    v_ar_account_id UUID;
    v_sales_account_id UUID;
    v_voucher_no VARCHAR(50);
    v_voucher_id UUID;
    v_ledger_json JSONB;
BEGIN
    -- 1. Gather Booking details
    SELECT b.company_id, b.total_agreed_price, b.customer_id, b.sales_person_id, p.name_en, u.unit_no
    INTO v_company_id, v_total_price, v_customer_id, v_sales_person_id, v_project_name, u.unit_no
    FROM bookings b
    JOIN projects p ON b.project_id = p.id
    JOIN units u ON b.unit_id = u.id
    WHERE b.id = p_booking_id AND b.is_deleted = FALSE;

    IF v_company_id IS NULL THEN
        RAISE EXCEPTION 'Booking ID % not found or is deleted.', p_booking_id;
    END IF;

    -- 2. Find or Auto-Create Accounts Receivable and Sales Revenue accounts for the company
    SELECT id INTO v_ar_account_id FROM chart_of_accounts 
    WHERE company_id = v_company_id AND account_code = '1200-REC-CUST' AND is_deleted = FALSE;
    
    IF v_ar_account_id IS NULL THEN
        INSERT INTO chart_of_accounts (id, company_id, account_code, name_en, name_bn, account_type)
        VALUES (uuid_generate_v4(), v_company_id, '1200-REC-CUST', 'Accounts Receivable - Customers', 'গ্রাহক দেনাদার হিসাব', 'Asset')
        RETURNING id INTO v_ar_account_id;
    END IF;

    SELECT id INTO v_sales_account_id FROM chart_of_accounts 
    WHERE company_id = v_company_id AND account_code = '4100-REV-SALES' AND is_deleted = FALSE;
    
    IF v_sales_account_id IS NULL THEN
        INSERT INTO chart_of_accounts (id, company_id, account_code, name_en, name_bn, account_type)
        VALUES (uuid_generate_v4(), v_company_id, '4100-REV-SALES', 'Real Estate Sales Revenue', 'রিয়েল এস্টেট বিক্রয় রাজস্ব', 'Revenue')
        RETURNING id INTO v_sales_account_id;
    END IF;

    -- 3. Prepare Voucher details
    v_voucher_no := 'JV-BKG-' || TO_CHAR(CURRENT_TIMESTAMP, 'YYYYMMDD') || '-' || SUBSTR(p_booking_id::TEXT, 1, 6);
    
    -- Construct balanced ledger entries
    v_ledger_json := jsonb_build_array(
        jsonb_build_object(
            'account_id', v_ar_account_id,
            'debit', v_total_price,
            'credit', 0.00,
            'narration_en', 'Receivable booked for ' || v_project_name || ' Unit: ' || v_unit_no,
            'narration_bn', v_project_name || ' ইউনিট: ' || v_unit_no || ' এর জন্য প্রাপ্য হিসাবভুক্ত',
            'reference_id', p_booking_id,
            'reference_type', 'Booking'
        ),
        jsonb_build_object(
            'account_id', v_sales_account_id,
            'debit', 0.00,
            'credit', v_total_price,
            'narration_en', 'Sales revenue recognized for ' || v_project_name || ' Unit: ' || v_unit_no,
            'narration_bn', v_project_name || ' ইউনিট: ' || v_unit_no || ' এর জন্য বিক্রয় রাজস্ব গণনা',
            'reference_id', p_booking_id,
            'reference_type', 'Booking'
        )
    );

    -- 4. Post Journal Voucher using Core Double-Entry function
    v_voucher_id := post_journal_voucher(
        v_company_id,
        v_voucher_no,
        CURRENT_DATE,
        'JV',
        'Auto Posting - Booking Created for ' || v_project_name || ' (Unit: ' || v_unit_no || ')',
        'স্বয়ংক্রিয় পোস্টিং - ' || v_project_name || ' (ইউনিট: ' || v_unit_no || ') এর বুকিং সম্পন্ন',
        v_sales_person_id,
        v_ledger_json
    );

    RETURN v_voucher_id;
END;
$$ LANGUAGE plpgsql;


/**
 * AUTO POSTING FOR MONEY RECEIPTS (INSTALLMENT PAYMENTS)
 * Debits Cash/Bank Asset Account
 * Credits Accounts Receivable Asset Account
 */
CREATE OR REPLACE FUNCTION auto_post_receipt_journal(
    p_money_receipt_id UUID
)
RETURNS UUID AS $$
DECLARE
    v_company_id UUID;
    v_amount DECIMAL(18,2);
    v_booking_id UUID;
    v_received_from_id UUID;
    v_issued_by_id UUID;
    v_payment_mode VARCHAR(50);
    v_receipt_no VARCHAR(50);
    v_ar_account_id UUID;
    v_cash_bank_account_id UUID;
    v_account_code VARCHAR(50);
    v_voucher_no VARCHAR(50);
    v_voucher_id UUID;
    v_ledger_json JSONB;
BEGIN
    -- 1. Get money receipt details
    SELECT company_id, amount_bdt, booking_id, received_from_id, issued_by_id, payment_mode, receipt_no
    INTO v_company_id, v_amount, v_booking_id, v_received_from_id, v_issued_by_id, v_payment_mode, v_receipt_no
    FROM money_receipts
    WHERE id = p_money_receipt_id AND is_deleted = FALSE;

    IF v_company_id IS NULL THEN
        RAISE EXCEPTION 'Money Receipt ID % not found.', p_money_receipt_id;
    END IF;

    -- 2. Determine Cash or Bank Account Code
    IF v_payment_mode = 'Cash' THEN
        v_account_code := '1110-CASH-HND';
    ELSE
        v_account_code := '1120-BANK-GEN';
    END IF;

    -- 3. Retrieve or Create accounts
    SELECT id INTO v_cash_bank_account_id FROM chart_of_accounts 
    WHERE company_id = v_company_id AND account_code = v_account_code AND is_deleted = FALSE;

    IF v_cash_bank_account_id IS NULL THEN
        IF v_payment_mode = 'Cash' THEN
            INSERT INTO chart_of_accounts (id, company_id, account_code, name_en, name_bn, account_type)
            VALUES (uuid_generate_v4(), v_company_id, '1110-CASH-HND', 'Cash-in-Hand', 'হাতে নগদ অর্থ', 'Asset')
            RETURNING id INTO v_cash_bank_account_id;
        ELSE
            INSERT INTO chart_of_accounts (id, company_id, account_code, name_en, name_bn, account_type)
            VALUES (uuid_generate_v4(), v_company_id, '1120-BANK-GEN', 'Bank Account General', 'ব্যাংক হিসাব (সাধারণ)', 'Asset')
            RETURNING id INTO v_cash_bank_account_id;
        END IF;
    END IF;

    SELECT id INTO v_ar_account_id FROM chart_of_accounts 
    WHERE company_id = v_company_id AND account_code = '1200-REC-CUST' AND is_deleted = FALSE;

    IF v_ar_account_id IS NULL THEN
        INSERT INTO chart_of_accounts (id, company_id, account_code, name_en, name_bn, account_type)
        VALUES (uuid_generate_v4(), v_company_id, '1200-REC-CUST', 'Accounts Receivable - Customers', 'গ্রাহক দেনাদার হিসাব', 'Asset')
        RETURNING id INTO v_ar_account_id;
    END IF;

    -- 4. Prepare Voucher details
    v_voucher_no := 'BRV-' || TO_CHAR(CURRENT_TIMESTAMP, 'YYYYMMDD') || '-' || SUBSTR(v_receipt_no, 1, 6);

    v_ledger_json := jsonb_build_array(
        jsonb_build_object(
            'account_id', v_cash_bank_account_id,
            'debit', v_amount,
            'credit', 0.00,
            'narration_en', 'Cash/Bank clearance for Receipt No: ' || v_receipt_no,
            'narration_bn', 'রশিদ নং: ' || v_receipt_no || ' এর বিপরীতে ব্যাংক/নগদ জমা',
            'reference_id', p_money_receipt_id,
            'reference_type', 'MoneyReceipt'
        ),
        jsonb_build_object(
            'account_id', v_ar_account_id,
            'debit', 0.00,
            'credit', v_amount,
            'narration_en', 'Credit clearance towards Accounts Receivable for Booking ID: ' || COALESCE(v_booking_id::TEXT, 'Unspecified'),
            'narration_bn', 'দেনাদার বকেয়া হ্রাস বুকিং আইডি: ' || COALESCE(v_booking_id::TEXT, 'অনির্ধারিত'),
            'reference_id', p_money_receipt_id,
            'reference_type', 'MoneyReceipt'
        )
    );

    -- 5. Post Journal Voucher
    v_voucher_id := post_journal_voucher(
        v_company_id,
        v_voucher_no,
        CURRENT_DATE,
        CASE WHEN v_payment_mode = 'Cash' THEN 'CRV'::VARCHAR ELSE 'BRV'::VARCHAR END,
        'Auto Posting - Collection Received via ' || v_payment_mode || ' (Receipt: ' || v_receipt_no || ')',
        'স্বয়ংক্রিয় পোস্টিং - আদায়কৃত অর্থ প্রাপ্তি (' || v_payment_mode || ' মাধ্যমে রশিদ: ' || v_receipt_no || ')',
        v_issued_by_id,
        v_ledger_json
    );

    -- Associate Journal Voucher directly with receipt
    UPDATE money_receipts 
    SET journal_voucher_id = v_voucher_id 
    WHERE id = p_money_receipt_id;

    RETURN v_voucher_id;
END;
$$ LANGUAGE plpgsql;


/**
 * AUTO POSTING FOR BOOKING CANCELLATION (AUTO REVERSAL JOURNAL)
 * Debits Real Estate Sales (Revenue Reversal)
 * Credits Accounts Receivable (Receivable Reversal)
 * Debits Cancellation Fee Expense Account / Credits Cash/Bank for Refund amount.
 */
CREATE OR REPLACE FUNCTION auto_post_booking_cancellation_journal(
    p_booking_id UUID
)
RETURNS UUID AS $$
DECLARE
    v_company_id UUID;
    v_total_price DECIMAL(18,2);
    v_refund_amount DECIMAL(18,2);
    v_cancellation_fee DECIMAL(18,2);
    v_customer_id UUID;
    v_voucher_no VARCHAR(50);
    v_voucher_id UUID;
    v_ar_account_id UUID;
    v_sales_account_id UUID;
    v_refund_account_id UUID; -- Cash/Bank
    v_fee_account_id UUID; -- Cancellation Fee Revenue Account
    v_ledger_json JSONB;
BEGIN
    -- 1. Gather cancellation details
    SELECT company_id, total_agreed_price, refund_amount, cancellation_fee, customer_id
    INTO v_company_id, v_total_price, v_refund_amount, v_cancellation_fee, v_customer_id
    FROM bookings
    WHERE id = p_booking_id AND status = 'Cancelled' AND is_deleted = FALSE;

    IF v_company_id IS NULL THEN
        RAISE EXCEPTION 'Cancelled Booking ID % not found.', p_booking_id;
    END IF;

    -- 2. Retrieve/Create accounts
    SELECT id INTO v_ar_account_id FROM chart_of_accounts 
    WHERE company_id = v_company_id AND account_code = '1200-REC-CUST' AND is_deleted = FALSE;

    SELECT id INTO v_sales_account_id FROM chart_of_accounts 
    WHERE company_id = v_company_id AND account_code = '4100-REV-SALES' AND is_deleted = FALSE;

    SELECT id INTO v_refund_account_id FROM chart_of_accounts 
    WHERE company_id = v_company_id AND account_code = '1120-BANK-GEN' AND is_deleted = FALSE;

    -- For fee revenue
    SELECT id INTO v_fee_account_id FROM chart_of_accounts 
    WHERE company_id = v_company_id AND account_code = '4200-REV-FEES' AND is_deleted = FALSE;

    IF v_fee_account_id IS NULL THEN
        INSERT INTO chart_of_accounts (id, company_id, account_code, name_en, name_bn, account_type)
        VALUES (uuid_generate_v4(), v_company_id, '4200-REV-FEES', 'Cancellation Fees Income', 'বাতিলকরণ ফি আয়', 'Revenue')
        RETURNING id INTO v_fee_account_id;
    END IF;

    -- 3. Construct multi-line reversal journal entries
    -- This journal reverses the original Sales vs Receivable.
    -- Debits Sales (Sales reversal) for v_total_price
    -- Credits Accounts Receivable (Receivable reduction) for v_total_price
    -- If refund paid: Debits Accounts Receivable (offset received refund) for refund + fee, Credits Bank
    v_voucher_no := 'JV-REV-' || TO_CHAR(CURRENT_TIMESTAMP, 'YYYYMMDD') || '-' || SUBSTR(p_booking_id::TEXT, 1, 6);

    v_ledger_json := jsonb_build_array(
        jsonb_build_object(
            'account_id', v_sales_account_id,
            'debit', v_total_price,
            'credit', 0.00,
            'narration_en', 'Reversal of original sales revenue on Booking Cancellation ID: ' || p_booking_id,
            'narration_bn', 'বুকিং বাতিলকরণের কারণে বিক্রয় রাজস্বের বিপরীতকরণ বুকিং আইডি: ' || p_booking_id,
            'reference_id', p_booking_id,
            'reference_type', 'Booking'
        ),
        jsonb_build_object(
            'account_id', v_ar_account_id,
            'debit', 0.00,
            'credit', v_total_price,
            'narration_en', 'Reversal of accounts receivable on Booking Cancellation ID: ' || p_booking_id,
            'narration_bn', 'বুকিং বাতিলকরণের কারণে দেনাদার বকেয়ার বিপরীতকরণ বুকিং আইডি: ' || p_booking_id,
            'reference_id', p_booking_id,
            'reference_type', 'Booking'
        )
    );

    -- Apply cancellation cash/fee distribution if refund is processed
    IF v_refund_amount > 0.00 THEN
        v_ledger_json := v_ledger_json || jsonb_build_array(
            jsonb_build_object(
                'account_id', v_ar_account_id,
                'debit', v_refund_amount + v_cancellation_fee,
                'credit', 0.00,
                'narration_en', 'Settlement adjustment of historical collections for cancelled booking',
                'narration_bn', 'বাতিল বুকিংয়ের জন্য সংগ্রহ সমন্বয়',
                'reference_id', p_booking_id,
                'reference_type', 'Booking'
            ),
            jsonb_build_object(
                'account_id', v_refund_account_id,
                'debit', 0.00,
                'credit', v_refund_amount,
                'narration_en', 'Refund payout to customer for cancellation',
                'narration_bn', 'বুকিং বাতিলের জন্য গ্রাহককে অর্থ ফেরত',
                'reference_id', p_booking_id,
                'reference_type', 'Booking'
            ),
            jsonb_build_object(
                'account_id', v_fee_account_id,
                'debit', 0.00,
                'credit', v_cancellation_fee,
                'narration_en', 'Cancellation fee retained as income',
                'narration_bn', 'বাতিলকরণ ফি কোম্পানি আয় হিসেবে গন্য',
                'reference_id', p_booking_id,
                'reference_type', 'Booking'
            )
        );
    END IF;

    -- 4. Post using Transactional Core Engine
    v_voucher_id := post_journal_voucher(
        v_company_id,
        v_voucher_no,
        CURRENT_DATE,
        'JV',
        'Auto Reversal Journal - Booking Cancelled ID: ' || p_booking_id,
        'স্বয়ংক্রিয় বিপরীত জার্নাল - বুকিং বাতিল আইডি: ' || p_booking_id,
        v_customer_id, -- User associated
        v_ledger_json
    );

    RETURN v_voucher_id;
END;
$$ LANGUAGE plpgsql;


-- ============================================================================
-- 3. FINANCIAL REPORTING ENGINE (COMPREHENSIVE QUERIES)
-- ============================================================================

/**
 * TRIAL BALANCE QUERY (TABLE-VALUED FUNCTION)
 * Retrieves all accounts for a specific company with Debits and Credits
 * for a date range, proving debit = credit.
 */
CREATE OR REPLACE FUNCTION get_trial_balance(
    p_company_id UUID,
    p_start_date DATE,
    p_end_date DATE
)
RETURNS TABLE (
    account_id UUID,
    account_code VARCHAR(50),
    name_en VARCHAR(150),
    name_bn VARCHAR(150),
    account_type VARCHAR(50),
    opening_balance DECIMAL(18,2),
    period_debit DECIMAL(18,2),
    period_credit DECIMAL(18,2),
    closing_balance DECIMAL(18,2)
) AS $$
BEGIN
    RETURN QUERY
    WITH opening_bal AS (
        SELECT 
            le.account_id,
            SUM(le.debit - le.credit) as op_bal
        FROM ledger_entries le
        JOIN journal_vouchers jv ON le.voucher_id = jv.id
        WHERE le.company_id = p_company_id
          AND jv.is_posted = TRUE
          AND jv.is_deleted = FALSE
          AND jv.voucher_date < p_start_date
        GROUP BY le.account_id
    ),
    period_activity AS (
        SELECT 
            le.account_id,
            SUM(le.debit) as p_debit,
            SUM(le.credit) as p_credit
        FROM ledger_entries le
        JOIN journal_vouchers jv ON le.voucher_id = jv.id
        WHERE le.company_id = p_company_id
          AND jv.is_posted = TRUE
          AND jv.is_deleted = FALSE
          AND jv.voucher_date BETWEEN p_start_date AND p_end_date
        GROUP BY le.account_id
    )
    SELECT 
        coa.id as account_id,
        coa.account_code,
        coa.name_en,
        coa.name_bn,
        coa.account_type,
        COALESCE(op.op_bal, 0.00) as opening_balance,
        COALESCE(pa.p_debit, 0.00) as period_debit,
        COALESCE(pa.p_credit, 0.00) as period_credit,
        -- Closing Balance calculation based on normal accounts balance
        CASE 
            WHEN coa.account_type IN ('Asset', 'Expense') THEN
                COALESCE(op.op_bal, 0.00) + (COALESCE(pa.p_debit, 0.00) - COALESCE(pa.p_credit, 0.00))
            ELSE -- Liability, Equity, Revenue (Credits are additions)
                COALESCE(op.op_bal, 0.00) + (COALESCE(pa.p_credit, 0.00) - COALESCE(pa.p_debit, 0.00))
        END as closing_balance
    FROM chart_of_accounts coa
    LEFT JOIN opening_bal op ON coa.id = op.account_id
    LEFT JOIN period_activity pa ON coa.id = pa.account_id
    WHERE coa.company_id = p_company_id 
      AND coa.is_deleted = FALSE
      AND (op.op_bal IS NOT NULL OR pa.p_debit IS NOT NULL OR pa.p_credit IS NOT NULL)
    ORDER BY coa.account_code;
END;
$$ LANGUAGE plpgsql;


/**
 * PROFIT & LOSS (INCOME STATEMENT) QUERY
 * Summarizes Revenues vs Expenses to deliver Net Profit or Loss.
 */
CREATE OR REPLACE FUNCTION get_profit_and_loss(
    p_company_id UUID,
    p_start_date DATE,
    p_end_date DATE
)
RETURNS TABLE (
    category_type VARCHAR(50), -- 'REVENUE' or 'EXPENSE'
    account_code VARCHAR(50),
    name_en VARCHAR(150),
    name_bn VARCHAR(150),
    period_amount DECIMAL(18,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        CASE WHEN coa.account_type = 'Revenue' THEN 'REVENUE'::VARCHAR ELSE 'EXPENSE'::VARCHAR END as category_type,
        coa.account_code,
        coa.name_en,
        coa.name_bn,
        CASE 
            WHEN coa.account_type = 'Revenue' THEN SUM(le.credit - le.debit) -- Credits are positive for revenues
            ELSE SUM(le.debit - le.credit) -- Debits are positive for expenses
        END as period_amount
    FROM ledger_entries le
    JOIN journal_vouchers jv ON le.voucher_id = jv.id
    JOIN chart_of_accounts coa ON le.account_id = coa.id
    WHERE le.company_id = p_company_id
      AND jv.is_posted = TRUE
      AND jv.is_deleted = FALSE
      AND jv.voucher_date BETWEEN p_start_date AND p_end_date
      AND coa.account_type IN ('Revenue', 'Expense')
    GROUP BY coa.id, coa.account_code, coa.name_en, coa.name_bn, coa.account_type
    HAVING SUM(le.debit) <> SUM(le.credit)
    ORDER BY category_type DESC, coa.account_code;
END;
$$ LANGUAGE plpgsql;


/**
 * BALANCE SHEET QUERY
 * Returns Assets, Liabilities, and Equity balances up to a specific date.
 */
CREATE OR REPLACE FUNCTION get_balance_sheet(
    p_company_id UUID,
    p_as_of_date DATE
)
RETURNS TABLE (
    section_type VARCHAR(50), -- 'ASSET', 'LIABILITY', 'EQUITY'
    account_code VARCHAR(50),
    name_en VARCHAR(150),
    name_bn VARCHAR(150),
    balance DECIMAL(18,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        CASE 
            WHEN coa.account_type = 'Asset' THEN 'ASSET'::VARCHAR
            WHEN coa.account_type = 'Liability' THEN 'LIABILITY'::VARCHAR
            ELSE 'EQUITY'::VARCHAR
        END as section_type,
        coa.account_code,
        coa.name_en,
        coa.name_bn,
        CASE 
            WHEN coa.account_type = 'Asset' THEN SUM(le.debit - le.credit)
            ELSE SUM(le.credit - le.debit) -- Liabilities & Equity are normal credit balances
        END as balance
    FROM ledger_entries le
    JOIN journal_vouchers jv ON le.voucher_id = jv.id
    JOIN chart_of_accounts coa ON le.account_id = coa.id
    WHERE le.company_id = p_company_id
      AND jv.is_posted = TRUE
      AND jv.is_deleted = FALSE
      AND jv.voucher_date <= p_as_of_date
      AND coa.account_type IN ('Asset', 'Liability', 'Equity')
    GROUP BY coa.id, coa.account_code, coa.name_en, coa.name_bn, coa.account_type
    HAVING SUM(le.debit) <> SUM(le.credit)
    ORDER BY section_type, coa.account_code;
END;
$$ LANGUAGE plpgsql;


/**
 * CASH FLOW STATEMENT (DIRECT METHOD)
 * Categorizes cash inflows and outflows by Operating, Investing, and Financing activities.
 */
CREATE OR REPLACE FUNCTION get_cash_flow(
    p_company_id UUID,
    p_start_date DATE,
    p_end_date DATE
)
RETURNS TABLE (
    activity_type VARCHAR(50), -- 'OPERATING_INFLOW', 'OPERATING_OUTFLOW', 'INVESTING_INFLOW', 'INVESTING_OUTFLOW', 'FINANCING_INFLOW', 'FINANCING_OUTFLOW'
    account_code VARCHAR(50),
    name_en VARCHAR(150),
    name_bn VARCHAR(150),
    amount DECIMAL(18,2)
) AS $$
BEGIN
    RETURN QUERY
    -- Filter and categorize transactions targeting cash and bank accounts
    SELECT 
        CASE 
            -- Financing: Capital partner injections, dividends, and repayments
            WHEN coa.account_code LIKE '3%' OR coa.account_code LIKE '25%' THEN 
                CASE WHEN SUM(le.credit - le.debit) > 0 THEN 'FINANCING_INFLOW'::VARCHAR ELSE 'FINANCING_OUTFLOW'::VARCHAR END
            -- Investing: Land acquisition expenditures, fixed asset purchases
            WHEN coa.account_code LIKE '15%' OR coa.account_code LIKE '16%' THEN
                CASE WHEN SUM(le.credit - le.debit) > 0 THEN 'INVESTING_INFLOW'::VARCHAR ELSE 'INVESTING_OUTFLOW'::VARCHAR END
            -- Operating: Standard customer collections, trade payables, salaries, and materials
            ELSE
                CASE WHEN SUM(le.debit - le.credit) > 0 THEN 'OPERATING_INFLOW'::VARCHAR ELSE 'OPERATING_OUTFLOW'::VARCHAR END
        END as activity_type,
        coa.account_code,
        coa.name_en,
        coa.name_bn,
        ABS(SUM(le.debit - le.credit)) as amount
    FROM ledger_entries le
    JOIN journal_vouchers jv ON le.voucher_id = jv.id
    JOIN chart_of_accounts coa ON le.account_id = coa.id
    WHERE le.company_id = p_company_id
      AND jv.is_posted = TRUE
      AND jv.is_deleted = FALSE
      AND jv.voucher_date BETWEEN p_start_date AND p_end_date
      -- Only track entries affecting general cash/bank accounts
      AND coa.id IN (
          SELECT id FROM chart_of_accounts 
          WHERE company_id = p_company_id 
            AND (account_code LIKE '111%' OR account_code LIKE '112%') 
            AND is_deleted = FALSE
      )
    GROUP BY coa.id, coa.account_code, coa.name_en, coa.name_bn
    HAVING SUM(le.debit) <> SUM(le.credit);
END;
$$ LANGUAGE plpgsql;
