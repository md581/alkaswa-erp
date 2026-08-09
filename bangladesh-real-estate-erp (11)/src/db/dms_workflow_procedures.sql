-- ============================================================================
-- AL KASWA HOLDINGS ERP - DOCUMENT MANAGEMENT SYSTEM, NOTIFICATION CENTER & 
-- APPROVAL WORKFLOW ENGINE (PHASE 1F)
-- DBMS: PostgreSQL (v12+)
-- Architecture: Tenant Isolation, Soft Delete, Version Control, Multi-level Approvals
-- ============================================================================

-- Enable UUID extension if not already present
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. DATABASE TABLES (DDL)
-- ============================================================================

-- 1.1. DOCUMENT MANAGEMENT SYSTEM (DMS)
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL,
    document_no VARCHAR(100) NOT NULL,
    document_type VARCHAR(100) NOT NULL CHECK (
        document_type IN (
            'Booking Agreement', 'Money Receipt', 'Land Deed', 'Mutation Document', 
            'JVA Agreement', 'Employee File', 'Payroll Document', 'Investor Certificate', 
            'Vendor Agreement', 'Project Approval'
        )
    ),
    related_module VARCHAR(100) NOT NULL, -- 'Real Estate', 'Finance', 'HR', 'Sourcing', 'Investor'
    related_entity_id VARCHAR(100) NOT NULL, -- UUID of booking, employee, project, receipt, etc.
    title VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'Active' NOT NULL CHECK (status IN ('Draft', 'Active', 'Approved', 'Archived', 'Superseded')),
    version_number INT DEFAULT 1 NOT NULL,
    file_path TEXT, -- CDN/Local path
    file_content_text TEXT, -- Optional text summary/metadata/raw content
    remarks TEXT,
    is_archived BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uq_company_doc_no UNIQUE (company_id, document_no)
);

CREATE TABLE IF NOT EXISTS document_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    version_number INT NOT NULL,
    file_path TEXT NOT NULL,
    remarks TEXT,
    uploaded_by UUID NOT NULL, -- References employees(id) or users
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uq_doc_version UNIQUE (document_id, version_number)
);

-- 1.2. NOTIFICATION CENTER
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL,
    recipient_id VARCHAR(100) NOT NULL, -- User/Employee/Customer ID
    recipient_role VARCHAR(50), -- Option to notify a whole role (e.g., 'GM', 'HR', 'Accounts')
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(100) NOT NULL CHECK (
        type IN (
            'Installment Due', 'Overdue Payment', 'Booking Confirmed', 'Booking Cancelled',
            'Salary Generated', 'Payroll Released', 'Investor Dividend Released', 
            'Document Expiry Alert', 'Land Mutation Reminder', 'Project Deadline Reminder',
            'Workflow Pending Action'
        )
    ),
    channel VARCHAR(50) DEFAULT 'In-App' NOT NULL CHECK (channel IN ('In-App', 'SMS', 'Email', 'All')),
    is_read BOOLEAN DEFAULT FALSE NOT NULL,
    status VARCHAR(50) DEFAULT 'Sent' NOT NULL CHECK (status IN ('Pending', 'Sent', 'Failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    read_at TIMESTAMP WITH TIME ZONE
);

-- 1.3. APPROVAL WORKFLOW ENGINE
CREATE TABLE IF NOT EXISTS approval_workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL,
    module VARCHAR(100) NOT NULL CHECK (
        module IN ('Booking Approval', 'Expense Approval', 'Payroll Approval', 'Land Purchase Approval', 'Investor Payment Approval')
    ),
    entity_id VARCHAR(100) NOT NULL, -- Referenced business record UUID
    current_level INT DEFAULT 1 NOT NULL,
    max_levels INT DEFAULT 3 NOT NULL,
    status VARCHAR(50) DEFAULT 'Draft' NOT NULL CHECK (status IN ('Draft', 'Pending', 'Under Review', 'Approved', 'Rejected', 'Cancelled')),
    initiator_id UUID NOT NULL, -- User/Employee who started workflow
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uq_company_module_entity UNIQUE (company_id, module, entity_id)
);

CREATE TABLE IF NOT EXISTS approval_workflow_steps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id UUID NOT NULL REFERENCES approval_workflows(id) ON DELETE CASCADE,
    level_no INT NOT NULL CHECK (level_no BETWEEN 1 AND 5),
    required_role VARCHAR(50) NOT NULL, -- 'Manager', 'GM', 'MD', 'HR', 'CFO'
    assigned_user_id UUID, -- Specific individual, if null, any user with required_role can approve
    status VARCHAR(50) DEFAULT 'Pending' NOT NULL CHECK (status IN ('Pending', 'Approved', 'Rejected', 'Skipped')),
    action_taken_by UUID, -- Specific user who signed off
    action_taken_name VARCHAR(150),
    action_taken_at TIMESTAMP WITH TIME ZONE,
    remarks TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uq_workflow_level UNIQUE (workflow_id, level_no)
);

CREATE TABLE IF NOT EXISTS approval_workflow_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL,
    workflow_id UUID NOT NULL REFERENCES approval_workflows(id) ON DELETE CASCADE,
    level_no INT NOT NULL,
    previous_state VARCHAR(50) NOT NULL,
    new_state VARCHAR(50) NOT NULL,
    action_by UUID NOT NULL,
    action_by_name VARCHAR(150) NOT NULL,
    action_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    remarks TEXT
);

-- Indexes for performance & scale
CREATE INDEX IF NOT EXISTS idx_documents_entity ON documents(company_id, related_module, related_entity_id);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(company_id, recipient_id, is_read);
CREATE INDEX IF NOT EXISTS idx_workflows_entity ON approval_workflows(company_id, module, entity_id);
CREATE INDEX IF NOT EXISTS idx_workflow_steps_workflow ON approval_workflow_steps(workflow_id);

-- ============================================================================
-- 2. PROCEDURES & ENGINES (PL/pgSQL)
-- ============================================================================

-- 2.1. NOTIFICATION ROUTER
-- Triggers/Dispatches a notification record and formats templates
CREATE OR REPLACE FUNCTION trigger_system_notification(
    p_company_id UUID,
    p_recipient_id VARCHAR(100),
    p_recipient_role VARCHAR(50),
    p_type VARCHAR(100),
    p_channel VARCHAR(50),
    p_context JSONB -- holds template parameters (e.g., customerName, amount, date)
)
RETURNS UUID AS $$
DECLARE
    v_notification_id UUID;
    v_title VARCHAR(255);
    v_message TEXT;
    v_emp_name VARCHAR(200);
BEGIN
    -- Evaluate notification type and dynamically format SMS / Email templates
    IF p_type = 'Installment Due' THEN
        v_title := 'Upcoming Installment Payment Due / কিস্তি পরিশোধের তাগিদ';
        v_message := 'Dear ' || COALESCE(p_context->>'customerName', 'Valued Client') || 
                     ', Your installment for ' || COALESCE(p_context->>'unitNo', 'Unit') || 
                     ' of project ' || COALESCE(p_context->>'projectNameEn', 'Project') || 
                     ' amount ৳' || COALESCE(p_context->>'amount', '0.00') || 
                     ' is due on ' || COALESCE(p_context->>'dueDate', 'due date') || 
                     '. Please make your payment on time. ' ||
                     'সম্মানিত গ্রাহক, আপনার প্রজেক্টের ' || COALESCE(p_context->>'unitNo', 'ইউনিট') || 
                     '-এর কিস্তি বাবদ ৳' || COALESCE(p_context->>'amount', '০') || 
                     ' আগামী ' || COALESCE(p_context->>'dueDate', 'তারিখ') || ' এর মধ্যে পরিশোধ করার জন্য অনুরোধ করা হলো।';
                     
    ELSIF p_type = 'Overdue Payment' THEN
        v_title := 'URGENT: Overdue Installment Reminder / বকেয়া কিস্তি পরিশোধের নোটিশ';
        v_message := 'CRITICAL: Dear ' || COALESCE(p_context->>'customerName', 'Valued Client') || 
                     ', Your payment of ৳' || COALESCE(p_context->>'amount', '0.00') || 
                     ' was due on ' || COALESCE(p_context->>'dueDate', 'due date') || 
                     ' and is now overdue. Overdue interest may apply. Please contact our offices.' ||
                     'জরুরী নোটিশ: আপনার বকেয়া কিস্তি বাবদ ৳' || COALESCE(p_context->>'amount', '০') || 
                     ' যা ' || COALESCE(p_context->>'dueDate', 'তারিখ') || ' পরিশোধ করার কথা ছিল, তা এখনো পরিশোধ করা হয়নি। অনুগ্রহ করে অতিসত্বর যোগাযোগ করুন।';
                     
    ELSIF p_type = 'Booking Confirmed' THEN
        v_title := 'Booking Confirmed & Allocation Registered / বুকিং নিশ্চিতকরণ বিজ্ঞপ্তি';
        v_message := 'Congratulations! Your booking for ' || COALESCE(p_context->>'unitNo', 'Unit') || 
                     ' in project ' || COALESCE(p_context->>'projectNameEn', 'Project') || 
                     ' is successfully confirmed. Booking Agreement Ref: ' || COALESCE(p_context->>'docNo', 'N/A') || '.' ||
                     'অভিনন্দন! আপনার প্রজেক্টের ' || COALESCE(p_context->>'unitNo', 'ইউনিট') || 
                     '-এর বুকিং সফলভাবে নিশ্চিত করা হয়েছে। চুক্তিপত্র নং: ' || COALESCE(p_context->>'docNo', 'N/A') || '।';
                     
    ELSIF p_type = 'Booking Cancelled' THEN
        v_title := 'Booking Cancellation Settlement / বুকিং বাতিলকরণ নোটিশ';
        v_message := 'Booking Ref ' || COALESCE(p_context->>'bookingId', 'N/A') || 
                     ' has been cancelled. Cancellation fee: ৳' || COALESCE(p_context->>'cancellationFee', '0.00') || 
                     '. Refund amount: ৳' || COALESCE(p_context->>'refundAmount', '0.00') || '.' ||
                     'বুকিং আইডি ' || COALESCE(p_context->>'bookingId', 'N/A') || ' বাতিল করা হয়েছে। বাতিলকরণ ফি: ৳' || 
                     COALESCE(p_context->>'cancellationFee', '০') || '। রিফান্ড পরিমাণ: ৳' || COALESCE(p_context->>'refundAmount', '০') || '।';

    ELSIF p_type = 'Salary Generated' THEN
        v_title := 'Accrued Monthly Salary Sheet Compiled / বেতন বিবরণী প্রস্তুত';
        v_message := 'Monthly Payroll sheet for ' || COALESCE(p_context->>'month', 'month') || 
                     ' has been compiled and is awaiting disbursement authorization.' ||
                     COALESCE(p_context->>'month', 'মাস') || ' মাসের জন্য বেতন বিবরণী প্রস্তুত করা হয়েছে এবং অনুমোদনের অপেক্ষায় রয়েছে।';

    ELSIF p_type = 'Payroll Released' THEN
        v_title := 'Monthly Salaries Credited & Disbursed / বেতন পরিশোধ বিজ্ঞপ্তি';
        v_message := 'Dear Employee, Your salary for ' || COALESCE(p_context->>'month', 'month') || 
                     ' Net Pay: ৳' || COALESCE(p_context->>'netPay', '0.00') || 
                     ' has been disbursed via ' || COALESCE(p_context->>'mode', 'Cash/Bank') || '.' ||
                     'প্রিয় কর্মী, আপনার ' || COALESCE(p_context->>'month', 'মাস') || ' মাসের বেতন ৳' || 
                     COALESCE(p_context->>'netPay', '০') || ' পরিশোধ করা হয়েছে।';

    ELSIF p_type = 'Investor Dividend Released' THEN
        v_title := 'Investor Share Dividend Released / বিনিয়োগ লভ্যাংশ বিজ্ঞপ্তি';
        v_message := 'Dear Investor, Dividend share of ৳' || COALESCE(p_context->>'amount', '0.00') || 
                     ' for project ' || COALESCE(p_context->>'projectNameEn', 'Project') || 
                     ' has been successfully credited to your registered bank.' ||
                     'প্রিয় বিনিয়োগকারী, প্রজেক্ট ' || COALESCE(p_context->>'projectNameEn', 'প্রজেক্ট') || 
                     '-এর লভ্যাংশ বাবদ ৳' || COALESCE(p_context->>'amount', '০') || ' আপনার ব্যাংকে জমা করা হয়েছে।';

    ELSIF p_type = 'Workflow Pending Action' THEN
        v_title := 'ERP Approval Workflow Sign-off Action Required / অনুমোদন কাজের আবেদন';
        v_message := 'Urgent approval required: Level ' || COALESCE(p_context->>'level', '1') || 
                     ' approval pending for module: ' || COALESCE(p_context->>'module', 'Approval') || 
                     ', Ref ID: ' || COALESCE(p_context->>'entityId', 'N/A') || '.' ||
                     'জরুরী অনুমোদন প্রয়োজন: ' || COALESCE(p_context->>'module', 'অনুমোদন') || 
                     ' মডিউলের লেভেল ' || COALESCE(p_context->>'level', '১') || ' অনুমোদন অপেক্ষমান রয়েছে।';
                     
    ELSE
        v_title := 'Al Kaswa System Alert';
        v_message := COALESCE(p_context->>'customMessage', 'Important alert regarding your enterprise ledger activities.');
    END IF;

    -- Insert into notifications table
    INSERT INTO notifications (company_id, recipient_id, recipient_role, title, message, type, channel, is_read, status)
    VALUES (p_company_id, p_recipient_id, p_recipient_role, v_title, v_message, p_type, p_channel, FALSE, 'Sent')
    RETURNING id INTO v_notification_id;

    RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql;

-- 2.2. DOCUMENT VERSION MANAGEMENT & LOCKING
-- Uploads a new document record or increments version, archiving previous
CREATE OR REPLACE FUNCTION register_new_document_revision(
    p_company_id UUID,
    p_doc_id UUID, -- If null, create new document
    p_doc_no VARCHAR(100),
    p_doc_type VARCHAR(100),
    p_related_module VARCHAR(100),
    p_related_entity_id VARCHAR(100),
    p_title VARCHAR(255),
    p_file_path TEXT,
    p_remarks TEXT,
    p_uploaded_by UUID
)
RETURNS UUID AS $$
DECLARE
    v_doc_id UUID := p_doc_id;
    v_current_version INT;
BEGIN
    -- If document doesn't exist, register a new master document
    IF v_doc_id IS NULL THEN
        -- Check if doc_no already exists to avoid conflict
        SELECT id, version_number INTO v_doc_id, v_current_version 
        FROM documents 
        WHERE company_id = p_company_id AND document_no = p_doc_no;

        IF v_doc_id IS NULL THEN
            INSERT INTO documents (
                company_id, document_no, document_type, related_module, related_entity_id, 
                title, status, version_number, file_path, remarks, is_archived
            )
            VALUES (
                p_company_id, p_doc_no, p_doc_type, p_related_module, p_related_entity_id, 
                p_title, 'Active', 1, p_file_path, p_remarks, FALSE
            )
            RETURNING id INTO v_doc_id;

            -- Record primary version
            INSERT INTO document_versions (document_id, version_number, file_path, remarks, uploaded_by)
            VALUES (v_doc_id, 1, p_file_path, 'Initial draft/document uploaded', p_uploaded_by);

            RETURN v_doc_id;
        END IF;
    END IF;

    -- Document exists, fetch current version and increment
    SELECT version_number INTO v_current_version FROM documents WHERE id = v_doc_id;

    -- Update previous version to Superseded in logging (if needed)
    UPDATE documents 
    SET version_number = v_current_version + 1,
        file_path = p_file_path,
        remarks = p_remarks,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = v_doc_id;

    -- Insert new row-level document_version audit record
    INSERT INTO document_versions (document_id, version_number, file_path, remarks, uploaded_by)
    VALUES (v_doc_id, v_current_version + 1, p_file_path, p_remarks, p_uploaded_by);

    RETURN v_doc_id;
END;
$$ LANGUAGE plpgsql;

-- 2.3. APPROVAL WORKFLOW SETUP ENGINE
-- Initiates a workflow instance with step levels mapped
CREATE OR REPLACE FUNCTION initiate_approval_workflow(
    p_company_id UUID,
    p_module VARCHAR(100),
    p_entity_id VARCHAR(100),
    p_initiator_id UUID,
    p_remarks TEXT,
    p_steps_json JSONB -- Array of workflow steps (level_no, required_role, assigned_user_id)
)
RETURNS UUID AS $$
DECLARE
    v_workflow_id UUID;
    v_max_levels INT;
    v_step RECORD;
    v_recipient_role VARCHAR(50);
    v_recipient_id VARCHAR(100);
BEGIN
    -- Delete existing active workflow for the same entity if exists to avoid collision
    UPDATE approval_workflows 
    SET status = 'Cancelled', updated_at = CURRENT_TIMESTAMP 
    WHERE company_id = p_company_id AND module = p_module AND entity_id = p_entity_id AND status IN ('Draft', 'Pending', 'Under Review');

    -- Calculate total steps
    SELECT JSONB_ARRAY_LENGTH(p_steps_json) INTO v_max_levels;

    -- Create core workflow record
    INSERT INTO approval_workflows (company_id, module, entity_id, current_level, max_levels, status, initiator_id, remarks)
    VALUES (p_company_id, p_module, p_entity_id, 1, v_max_levels, 'Pending', p_initiator_id, p_remarks)
    RETURNING id INTO v_workflow_id;

    -- Insert steps from JSONB
    FOR v_step IN SELECT * FROM jsonb_to_recordset(p_steps_json) AS x(level_no INT, required_role VARCHAR(50), assigned_user_id UUID)
    LOOP
        INSERT INTO approval_workflow_steps (workflow_id, level_no, required_role, assigned_user_id, status)
        VALUES (v_workflow_id, v_step.level_no, v_step.required_role, v_step.assigned_user_id, 'Pending');
    END LOOP;

    -- Trigger initial level notification alert to role/user
    SELECT required_role, assigned_user_id::VARCHAR INTO v_recipient_role, v_recipient_id 
    FROM approval_workflow_steps 
    WHERE workflow_id = v_workflow_id AND level_no = 1;

    PERFORM trigger_system_notification(
        p_company_id,
        COALESCE(v_recipient_id, 'ALL'),
        v_recipient_role,
        'Workflow Pending Action',
        'In-App',
        jsonb_build_object(
            'level', 1,
            'module', p_module,
            'entityId', p_entity_id
        )
    );

    -- Log transaction state change
    INSERT INTO approval_workflow_logs (company_id, workflow_id, level_no, previous_state, new_state, action_by, action_by_name, remarks)
    VALUES (p_company_id, v_workflow_id, 0, 'None', 'Pending Approval Level 1', p_initiator_id, 'Workflow Engine', 'Workflow initiated dynamically.');

    RETURN v_workflow_id;
END;
$$ LANGUAGE plpgsql;

-- 2.4. WORKFLOW TRANSACTION ACTION SIGN-OFF
-- Processes an approval/rejection at a level, advancing or terminating the workflow
CREATE OR REPLACE FUNCTION submit_workflow_action(
    p_company_id UUID,
    p_workflow_id UUID,
    p_level_no INT,
    p_action_by UUID,
    p_action_by_name VARCHAR(150),
    p_action VARCHAR(50), -- 'Approve' | 'Reject' | 'Cancel'
    p_remarks TEXT
)
RETURNS VARCHAR(50) AS $$
DECLARE
    v_status VARCHAR(50);
    v_max_levels INT;
    v_next_role VARCHAR(50);
    v_next_user UUID;
    v_module VARCHAR(100);
    v_entity_id VARCHAR(100);
BEGIN
    -- Fetch workflow bounds
    SELECT module, entity_id, max_levels INTO v_module, v_entity_id, v_max_levels 
    FROM approval_workflows 
    WHERE id = p_workflow_id AND company_id = p_company_id;

    IF v_module IS NULL THEN
        RAISE EXCEPTION 'Workflow instance not found or company ID mismatch.';
    END IF;

    IF p_action = 'Reject' THEN
        -- Mark step as Rejected
        UPDATE approval_workflow_steps 
        SET status = 'Rejected', action_taken_by = p_action_by, action_taken_name = p_action_by_name, action_taken_at = CURRENT_TIMESTAMP, remarks = p_remarks, updated_at = CURRENT_TIMESTAMP
        WHERE workflow_id = p_workflow_id AND level_no = p_level_no;

        -- Terminate entire workflow as Rejected
        UPDATE approval_workflows 
        SET status = 'Rejected', updated_at = CURRENT_TIMESTAMP
        WHERE id = p_workflow_id;

        -- Log State
        INSERT INTO approval_workflow_logs (company_id, workflow_id, level_no, previous_state, new_state, action_by, action_by_name, remarks)
        VALUES (p_company_id, p_workflow_id, p_level_no, 'Under Review', 'Rejected', p_action_by, p_action_by_name, p_remarks);

        -- Notify initiator
        PERFORM trigger_system_notification(
            p_company_id,
            (SELECT initiator_id::VARCHAR FROM approval_workflows WHERE id = p_workflow_id),
            NULL,
            'Booking Cancelled', -- Use cancellation alert pattern to denote rejection
            'In-App',
            jsonb_build_object(
                'bookingId', v_entity_id,
                'cancellationFee', 0.00,
                'refundAmount', 0.00,
                'customMessage', 'Your approval request for ' || v_module || ' has been Rejected by ' || p_action_by_name || '.'
            )
        );

        RETURN 'Rejected';

    ELSIF p_action = 'Approve' THEN
        -- Mark step as Approved
        UPDATE approval_workflow_steps 
        SET status = 'Approved', action_taken_by = p_action_by, action_taken_name = p_action_by_name, action_taken_at = CURRENT_TIMESTAMP, remarks = p_remarks, updated_at = CURRENT_TIMESTAMP
        WHERE workflow_id = p_workflow_id AND level_no = p_level_no;

        -- Check if this was the final level
        IF p_level_no = v_max_levels THEN
            -- Fully Approved
            UPDATE approval_workflows 
            SET status = 'Approved', updated_at = CURRENT_TIMESTAMP
            WHERE id = p_workflow_id;

            -- Log State
            INSERT INTO approval_workflow_logs (company_id, workflow_id, level_no, previous_state, new_state, action_by, action_by_name, remarks)
            VALUES (p_company_id, p_workflow_id, p_level_no, 'Under Review', 'Approved', p_action_by, p_action_by_name, p_remarks);

            -- Notify initiator
            PERFORM trigger_system_notification(
                p_company_id,
                (SELECT initiator_id::VARCHAR FROM approval_workflows WHERE id = p_workflow_id),
                NULL,
                'Booking Confirmed', -- Confirm to initiator
                'In-App',
                jsonb_build_object(
                    'unitNo', 'Entity Ref: ' || v_entity_id,
                    'projectNameEn', v_module,
                    'docNo', 'Fully Approved Signoff Completed'
                )
            );

            RETURN 'Approved';
        ELSE
            -- Advance to next level
            UPDATE approval_workflows 
            SET current_level = p_level_no + 1, status = 'Under Review', updated_at = CURRENT_TIMESTAMP
            WHERE id = p_workflow_id;

            -- Log State
            INSERT INTO approval_workflow_logs (company_id, workflow_id, level_no, previous_state, new_state, action_by, action_by_name, remarks)
            VALUES (p_company_id, p_workflow_id, p_level_no, 'Under Review', 'Reviewing Level ' || (p_level_no + 1)::VARCHAR, p_action_by, p_action_by_name, p_remarks);

            -- Find next step credentials
            SELECT required_role, assigned_user_id INTO v_next_role, v_next_user 
            FROM approval_workflow_steps 
            WHERE workflow_id = p_workflow_id AND level_no = (p_level_no + 1);

            -- Alert next person
            PERFORM trigger_system_notification(
                p_company_id,
                COALESCE(v_next_user::VARCHAR, 'ALL'),
                v_next_role,
                'Workflow Pending Action',
                'In-App',
                jsonb_build_object(
                    'level', p_level_no + 1,
                    'module', v_module,
                    'entityId', v_entity_id
                )
            );

            RETURN 'Under Review';
        END IF;
    END IF;

    RETURN 'Pending';
END;
$$ LANGUAGE plpgsql;
