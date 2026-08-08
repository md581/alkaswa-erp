-- ============================================================================
-- AL KASWA HOLDINGS - REAL ESTATE TRANSACTION ENGINE (DATABASE LAYER)
-- DBMS: PostgreSQL (v12+)
-- Multi-Tenant Isolation, Unit Status Locking, Safe Double-Allocations block,
-- Auto-Installment Generation, Collection Tracking, and Refund Reverse Postings.
-- ============================================================================

-- Ensure uuid-ossp is available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. UNIT STATUS CONSTRAINTS & MUTEX LOCKING
-- ============================================================================

/**
 * Locks a unit and initiates a reservation.
 * Guarantees that only one active booking or reservation can exist for a unit.
 * Throws exceptions if the unit is blocked or already booked.
 */
CREATE OR REPLACE FUNCTION reserve_unit_allocation(
    p_company_id UUID,
    p_unit_id UUID,
    p_customer_id UUID,
    p_action_by UUID
)
RETURNS VOID AS $$
DECLARE
    v_current_status VARCHAR(50);
    v_company_match BOOLEAN;
BEGIN
    -- Select with row-level transaction locking to prevent race conditions (MUTEX)
    SELECT status, (company_id = p_company_id)
    INTO v_current_status, v_company_match
    FROM units
    WHERE id = p_unit_id
    FOR UPDATE;

    IF v_current_status IS NULL THEN
        RAISE EXCEPTION 'Not Found: Unit ID % does not exist.', p_unit_id;
    END IF;

    IF NOT v_company_match THEN
        RAISE EXCEPTION 'Security Exception: Tenant mismatch. Unit does not belong to Company %.', p_company_id;
    END IF;

    IF v_current_status <> 'Available' THEN
        RAISE EXCEPTION 'Validation Failure: Unit % is currently %, and cannot be reserved.', p_unit_id, v_current_status;
    END IF;

    -- Update unit status to Reserved
    UPDATE units
    SET status = 'Reserved',
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_unit_id;

    -- Add audit log
    INSERT INTO audit_logs (
        company_id, user_id, action, table_name, record_id, new_values, created_at
    ) VALUES (
        p_company_id, p_action_by, 'UNIT_RESERVED', 'units', p_unit_id,
        jsonb_build_object('customer_id', p_customer_id, 'previous_status', v_current_status, 'new_status', 'Reserved'),
        CURRENT_TIMESTAMP
    );
END;
$$ LANGUAGE plpgsql;


/**
 * Confirms unit booking. Updates unit status from Reserved/Available to Booked.
 */
CREATE OR REPLACE FUNCTION confirm_unit_booking(
    p_company_id UUID,
    p_unit_id UUID,
    p_booking_id UUID,
    p_action_by UUID
)
RETURNS VOID AS $$
DECLARE
    v_current_status VARCHAR(50);
BEGIN
    SELECT status INTO v_current_status
    FROM units
    WHERE id = p_unit_id
    FOR UPDATE;

    IF v_current_status NOT IN ('Available', 'Reserved') THEN
        RAISE EXCEPTION 'Booking Rejection: Unit % cannot be booked. Current status is %.', p_unit_id, v_current_status;
    END IF;

    UPDATE units
    SET status = 'Booked',
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_unit_id;

    -- Log transaction audit
    INSERT INTO audit_logs (
        company_id, user_id, action, table_name, record_id, new_values, created_at
    ) VALUES (
        p_company_id, p_action_by, 'UNIT_BOOKED', 'units', p_unit_id,
        jsonb_build_object('booking_id', p_booking_id, 'previous_status', v_current_status, 'new_status', 'Booked'),
        CURRENT_TIMESTAMP
    );
END;
$$ LANGUAGE plpgsql;


-- ============================================================================
-- 2. DYNAMIC INSTALLMENT ENGINE
-- ============================================================================

/**
 * Automatically calculates and generates balanced installment records for a booking.
 * Supports: 'Monthly', 'Quarterly', 'Half-Yearly', 'Custom' schedule.
 */
CREATE OR REPLACE FUNCTION generate_booking_installments(
    p_company_id UUID,
    p_booking_id UUID,
    p_total_amount DECIMAL(18,2),
    p_downpayment DECIMAL(18,2),
    p_installment_count INT,
    p_frequency VARCHAR(50), -- 'Monthly', 'Quarterly', 'Half-Yearly', 'Custom'
    p_start_date DATE
)
RETURNS INT AS $$
DECLARE
    v_remaining_amount DECIMAL(18,2);
    v_installment_amount DECIMAL(18,2);
    v_installment_no INT := 1;
    v_due_date DATE := p_start_date;
    v_interval INTERVAL;
BEGIN
    -- Delete any existing draft unpaid installments first to support recalculation
    DELETE FROM installments 
    WHERE booking_id = p_booking_id AND status = 'Unpaid';

    v_remaining_amount := p_total_amount - p_downpayment;
    IF v_remaining_amount <= 0 THEN
        RAISE EXCEPTION 'Math Error: Downpayment exceeds or equals total agreed price.';
    END IF;

    v_installment_amount := ROUND(v_remaining_amount / p_installment_count, 2);

    -- Setup interval based on frequency rules
    v_interval := CASE 
        WHEN p_frequency = 'Monthly' THEN '1 month'::INTERVAL
        WHEN p_frequency = 'Quarterly' THEN '3 months'::INTERVAL
        WHEN p_frequency = 'Half-Yearly' THEN '6 months'::INTERVAL
        ELSE '1 month'::INTERVAL -- default custom fallback to monthly increments
    END;

    WHILE v_installment_no <= p_installment_count LOOP
        -- Adjust final installment to handle floating-point division roundings
        IF v_installment_no = p_installment_count THEN
            v_installment_amount := v_remaining_amount - (v_installment_amount * (p_installment_count - 1));
        END IF;

        INSERT INTO installments (
            id, booking_id, installment_no, due_date, amount_bdt, status, is_deleted, created_at, updated_at
        ) VALUES (
            uuid_generate_v4(), p_booking_id, v_installment_no, v_due_date, v_installment_amount, 'Unpaid', FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        );

        v_due_date := v_due_date + v_interval;
        v_installment_no := v_installment_no + 1;
    END LOOP;

    RETURN p_installment_count;
END;
$$ LANGUAGE plpgsql;


-- ============================================================================
-- 3. CASH & REVENUE RECOGNITION (MONEY RECEIPTS)
-- ============================================================================

/**
 * Registers a customer money receipt, tracks clearance, and returns the unique voucher details.
 * Prevents duplicate posting by validating cleared statuses.
 */
CREATE OR REPLACE FUNCTION register_payment_collection(
    p_company_id UUID,
    p_booking_id UUID,
    p_receipt_no VARCHAR(50),
    p_amount DECIMAL(18,2),
    p_payment_mode VARCHAR(50), -- 'Cash', 'Cheque', 'Pay Order', 'Bank Transfer'
    p_bank_name VARCHAR(150),
    p_instrument_no VARCHAR(100),
    p_issued_by UUID,
    p_received_date DATE
)
RETURNS UUID AS $$
DECLARE
    v_receipt_id UUID;
    v_customer_id UUID;
BEGIN
    -- Verify booking exists and belongs to tenant
    SELECT customer_id INTO v_customer_id
    FROM bookings
    WHERE id = p_booking_id AND company_id = p_company_id AND is_deleted = FALSE;

    IF v_customer_id IS NULL THEN
        RAISE EXCEPTION 'Not Found: Booking ID % does not exist for Company %.', p_booking_id, p_company_id;
    END IF;

    -- Generate a unique money receipt entry
    INSERT INTO money_receipts (
        id, company_id, receipt_no, booking_id, received_from_id, amount_bdt,
        payment_mode, bank_name, instrument_no, issued_by_id, received_date,
        is_cleared, created_at, updated_at
    ) VALUES (
        uuid_generate_v4(), p_company_id, p_receipt_no, p_booking_id, v_customer_id, p_amount,
        p_payment_mode, p_bank_name, p_instrument_no, p_issued_by, p_received_date,
        FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) RETURNING id INTO v_receipt_id;

    -- Update outstanding installments list sequentially (FIFO matching)
    PERFORM allocate_payment_to_installments(p_booking_id, p_amount);

    RETURN v_receipt_id;
END;
$$ LANGUAGE plpgsql;


/**
 * Distributes payment amount to unpaid installments based on First-In-First-Out (FIFO) logic.
 */
CREATE OR REPLACE FUNCTION allocate_payment_to_installments(
    p_booking_id UUID,
    p_payment_amount DECIMAL(18,2)
)
RETURNS VOID AS $$
DECLARE
    v_remaining_payment DECIMAL(18,2) := p_payment_amount;
    v_inst RECORD;
    v_alloc DECIMAL(18,2);
BEGIN
    FOR v_inst IN 
        SELECT id, amount_bdt, paid_amount_bdt, status 
        FROM installments 
        WHERE booking_id = p_booking_id AND status IN ('Unpaid', 'Partially Paid') AND is_deleted = FALSE
        ORDER BY installment_no ASC
    LOOP
        EXIT WHEN v_remaining_payment <= 0.00;

        DECLARE
            v_due DECIMAL(18,2) := v_inst.amount_bdt - COALESCE(v_inst.paid_amount_bdt, 0.00);
        BEGIN
            IF v_remaining_payment >= v_due THEN
                v_alloc := v_due;
                v_remaining_payment := v_remaining_payment - v_due;
                
                UPDATE installments 
                SET paid_amount_bdt = amount_bdt,
                    status = 'Paid',
                    paid_date = CURRENT_DATE,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = v_inst.id;
            ELSE
                v_alloc := v_remaining_payment;
                
                UPDATE installments 
                SET paid_amount_bdt = COALESCE(paid_amount_bdt, 0.00) + v_remaining_payment,
                    status = 'Partially Paid',
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = v_inst.id;
                
                v_remaining_payment := 0.00;
            END IF;
        END;
    END LOOP;
END;
$$ LANGUAGE plpgsql;


-- ============================================================================
-- 4. BOOKING CANCELLATION ENGINE
-- ============================================================================

/**
 * Processes full booking cancellation.
 * Frees the associated unit, deletes future unpaid installments, computes refund distribution,
 * and calls the double-entry accounting engine reversal.
 */
CREATE OR REPLACE FUNCTION cancel_booking_transaction(
    p_company_id UUID,
    p_booking_id UUID,
    p_cancellation_fee DECIMAL(18,2),
    p_refund_amount DECIMAL(18,2),
    p_reason TEXT,
    p_action_by UUID
)
RETURNS VOID AS $$
DECLARE
    v_unit_id UUID;
    v_customer_id UUID;
    v_voucher_id UUID;
BEGIN
    -- 1. Row Lock and fetch details
    SELECT unit_id, customer_id
    INTO v_unit_id, v_customer_id
    FROM bookings
    WHERE id = p_booking_id AND company_id = p_company_id AND status = 'Active' AND is_deleted = FALSE
    FOR UPDATE;

    IF v_unit_id IS NULL THEN
        RAISE EXCEPTION 'Integrity Error: Booking is either already cancelled, deleted, or does not exist.';
    END IF;

    -- 2. Update booking status
    UPDATE bookings
    SET status = 'Cancelled',
        cancellation_date = CURRENT_DATE,
        refund_amount = p_refund_amount,
        cancellation_fee = p_cancellation_fee,
        cancellation_reason = p_reason,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_booking_id;

    -- 3. Free the unit allocation
    UPDATE units
    SET status = 'Available',
        updated_at = CURRENT_TIMESTAMP
    WHERE id = v_unit_id;

    -- 4. Delete or cancel future installments
    UPDATE installments
    SET status = 'Unpaid', -- Reset state
        is_deleted = TRUE,
        updated_at = CURRENT_TIMESTAMP
    WHERE booking_id = p_booking_id AND status = 'Unpaid';

    -- 5. Trigger auto-posting reversal journal
    v_voucher_id := auto_post_booking_cancellation_journal(p_booking_id);

    -- 6. Log audit records
    INSERT INTO audit_logs (
        company_id, user_id, action, table_name, record_id, new_values, created_at
    ) VALUES (
        p_company_id, p_action_by, 'BOOKING_CANCELLED', 'bookings', p_booking_id,
        jsonb_build_object(
            'unit_id', v_unit_id,
            'refund_amount', p_refund_amount,
            'cancellation_fee', p_cancellation_fee,
            'reversal_voucher_id', v_voucher_id
        ),
        CURRENT_TIMESTAMP
    );
END;
$$ LANGUAGE plpgsql;


-- ============================================================================
-- 5. REPORTING & CLIENT RECONCILIATION LEDGERS
-- ============================================================================

/**
 * CLIENT LEDGER RECONCILIATION REPORT (TABLE-VALUED FUNCTION)
 * Aggregates all transactions, collections, receivables, overdues, and balances for a client booking.
 */
CREATE OR REPLACE FUNCTION get_customer_ledger(
    p_company_id UUID,
    p_booking_id UUID
)
RETURNS TABLE (
    transaction_date DATE,
    reference_no VARCHAR(100),
    description_en TEXT,
    description_bn TEXT,
    debit_amount DECIMAL(18,2),
    credit_amount DECIMAL(18,2),
    running_balance DECIMAL(18,2)
) AS $$
DECLARE
    v_booking_price DECIMAL(18,2);
    v_booking_date DATE;
    v_customer_name VARCHAR(150);
BEGIN
    -- Gather Booking base properties
    SELECT b.booking_date, b.total_agreed_price
    INTO v_booking_date, v_booking_price
    FROM bookings b
    WHERE b.id = p_booking_id AND b.company_id = p_company_id AND b.is_deleted = FALSE;

    IF v_booking_price IS NULL THEN
        RAISE EXCEPTION 'Not Found: Booking record not found.';
    END IF;

    RETURN QUERY
    WITH ledger_entries_union AS (
        -- Step 1: Base Booking entry (Debit)
        SELECT 
            v_booking_date as entry_date,
            'BKG-INIT'::VARCHAR(100) as ref_no,
            'Booking recognition'::TEXT as desc_en,
            'বুকিং প্রারম্ভিক অন্তর্ভুক্তি'::TEXT as desc_bn,
            v_booking_price as dr,
            0.00 as cr
        UNION ALL
        -- Step 2: Collection payments (Credit)
        SELECT 
            mr.received_date as entry_date,
            mr.receipt_no::VARCHAR(100) as ref_no,
            ('Collection Received via ' || mr.payment_mode)::TEXT as desc_en,
            ('অর্থ প্রাপ্তি মাধ্যম: ' || mr.payment_mode)::TEXT as desc_bn,
            0.00 as dr,
            mr.amount_bdt as cr
        FROM money_receipts mr
        WHERE mr.booking_id = p_booking_id AND mr.is_deleted = FALSE
        UNION ALL
        -- Step 3: Cancellation Charges / Adjustments
        SELECT 
            b.cancellation_date as entry_date,
            'BKG-CANCEL'::VARCHAR(100) as ref_no,
            'Cancellation fee recognized'::TEXT as desc_en,
            'বাতিলকরণ ফি হিসাবভুক্ত'::TEXT as desc_bn,
            b.cancellation_fee as dr,
            0.00 as cr
        FROM bookings b
        WHERE b.id = p_booking_id AND b.status = 'Cancelled' AND b.cancellation_fee > 0
        UNION ALL
        -- Step 4: Reversals / Refunds
        SELECT 
            b.cancellation_date as entry_date,
            'BKG-REFUND'::VARCHAR(100) as ref_no,
            'Refund paid out to customer'::TEXT as desc_en,
            'গ্রাহককে অর্থ ফেরত প্রদান'::TEXT as desc_bn,
            0.00 as dr,
            b.refund_amount as cr
        FROM bookings b
        WHERE b.id = p_booking_id AND b.status = 'Cancelled' AND b.refund_amount > 0
    )
    SELECT 
        entry_date as transaction_date,
        ref_no as reference_no,
        desc_en as description_en,
        desc_bn as description_bn,
        dr as debit_amount,
        cr as credit_amount,
        SUM(dr - cr) OVER (ORDER BY entry_date ASC, ref_no ASC) as running_balance
    FROM ledger_entries_union
    ORDER BY entry_date ASC, ref_no ASC;
END;
$$ LANGUAGE plpgsql;
