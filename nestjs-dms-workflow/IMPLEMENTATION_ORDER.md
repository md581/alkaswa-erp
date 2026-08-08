# AL KASWA HOLDINGS ERP: PHASE 1F - DMS & WORKFLOW IMPLEMENTATION ORDER

This guide specifies the exact, step-by-step pipeline for building and deploying the Document Management System, Notification Center, and Approval Workflow Engine from the local development stage to the cloud production environment.

---

## SECTION 1: DATABASE PROVISIONING (POSTGRESQL)

1. **Verify Database Connection**
   Ensure your cloud PostgreSQL instance or local database credentials are configured inside `.env`.
   
2. **Execute Database DDL & Stored Procedures**
   Execute the query compiled inside `/src/db/dms_workflow_procedures.sql` to instantiate the following structure:
   - **Tables Created**:
     - `documents`: Stores document properties, category tags, and file hashes.
     - `document_versions`: Holds previous revision logs for rollback and audit.
     - `notifications`: Dispatched sms/email logs and status flags.
     - `approval_workflows`: Multi-level pipeline headers.
     - `approval_workflow_steps`: Target role approvals.
     - `approval_workflow_logs`: Detailed audit state changes.
   - **Stored Procedures instantiated**:
     - `register_new_document_revision()`
     - `initiate_approval_workflow()`
     - `submit_workflow_action()`
     - `trigger_system_notification()`

---

## SECTION 2: BACKEND ENGINE DEPLOYMENT (NESTJS)

1. **Install NestJS Dependencies**
   Run the following package install if not already populated:
   ```bash
   npm install --save @nestjs/common @nestjs/core class-validator class-transformer pg
   ```

2. **Mount the Modular Classes**
   Import the files created under `/src/db/nestjs-dms-workflow/` into your NestJS workspace:
   - Register the `DmsWorkflowService` and `DmsWorkflowController` inside `DmsWorkflowModule`.
   - Import `DmsWorkflowModule` into your main `AppModule`.

3. **Verify Header Interceptors**
   Configure the API Gateway or NestJS Guard to extract actor headers (`x-actor-id`, `x-actor-name`) from user sessions to securely pass to our stored audit trails.

---

## SECTION 3: FRONTEND USER INTERFACES & PDF COMPILER (REACT)

1. **Local Persistent Fallback**
   Our React components in `/src/components/DocumentWorkflowNotificationModule.tsx` are fully synced with local browser storage. This guarantees testing can continue offline even without database container connectivity.

2. **Verify PDF Generation Templates**
   Open the DMS explorer interface in the browser, upload a sample file, and click **"Compile Official PDF"** to test:
   - **Money Receipts**: Formatted with secure BDT currency badges, tax/revenue seals, and Md Nazrul Islam's official signature.
   - **Booking Agreements**: Styled on double-bordered Government of Bangladesh Revenue Stamp models.

---

## SECTION 4: TESTING & QUALITY ASSURANCE CHECKLIST

- [ ] **DMS Version Control**: Revision of a document raises version counts (`v1 ➔ v2`) and appends history details correctly.
- [ ] **Workflow Hierarchy Enforcement**: A Level 2 step requires a GM simulation role to approve; other roles must be blocked.
- [ ] **Multi-Channel Dispatch logs**: Notifications correctly log In-App unread counts alongside SMS/Email dispatch statuses.
