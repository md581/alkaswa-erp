# AL KASWA HOLDINGS ERP - REAL ESTATE TRANSACTION ENGINE IMPLEMENTATION GUIDE (PHASE 1D)
**Author:** Chief ERP Solution Architect & Database Administrator  
**Version:** 1.0.0 (Production Ready)  
**DBMS:** PostgreSQL (v12+)  
**Backend Framework:** NestJS (TypeScript)  

---

## 1. Architectural Overview & Workflow Sequence

The Real Estate Transaction Engine controls the life-cycle of land, flats, and plots from sourcing up to final hand-over. To enforce auditable double-entry accounting compliance, the system coordinates database locks, status state-machines, automated payment ledger distribution, and real-time ledger auto-postings.

```
       [Sourcing & Land Registry]
                   ↓
         [JVA signed with Owners]
                   ↓
       [Plot/Flat Unit Sizing & Layout]
                   ↓
       [Mutex Allocation Reservation] (Status: Available -> Reserved)
                   ↓
       [Booking Confirmed & Downpayment] (Status: Reserved -> Booked)
                   ↓
       [Generate Installment Schedules] (FIFO Payment Matches)
                   ↓
      [Register Cash & Bank Money Receipts] (Status: Paid / Partially Paid)
                   ↓
          [Mutation & Legal Tracking]
                   ↓
      [Ownership Registry & Deed Handover] (Status: Sold)
```

---

## 2. Comprehensive Database Tables (PostgreSQL / Drizzle Schema)

All tables utilize **UUID-v4** primary keys, strict foreign key constraints, tenant isolation checks, and indexes on frequently queried properties.

### 2.1. Projects (`projects`)
Tracks land and real-estate project milestones.
```sql
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    name_bn VARCHAR(255) NOT NULL,
    location_en TEXT NOT NULL,
    location_bn TEXT NOT NULL,
    total_floors INT NOT NULL DEFAULT 1,
    land_area_katha DECIMAL(12,2) NOT NULL,
    jva_ratio_developer DECIMAL(5,2) NOT NULL DEFAULT 50.00,
    jva_ratio_landowner DECIMAL(5,2) NOT NULL DEFAULT 50.00,
    status VARCHAR(50) NOT NULL CHECK (status IN ('Planning', 'Sourcing', 'Under Construction', 'Finishing', 'Handed Over')),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_projects_company ON projects(company_id);
```

### 2.2. Units (`units`)
Combines plots and flats. Includes mutation, RAJUK approvals, and JVA allocation share tags.
```sql
CREATE TABLE units (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL,
    project_id UUID NOT NULL REFERENCES projects(id),
    unit_no VARCHAR(50) NOT NULL,
    floor_no INT NOT NULL,
    size_sft DECIMAL(10,2) NOT NULL,
    price_per_sft DECIMAL(12,2) NOT NULL,
    parking_charge_bdt DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    utility_charge_bdt DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    allocation_type VARCHAR(50) NOT NULL CHECK (allocation_type IN ('Developer Share', 'Landowner Share')),
    status VARCHAR(50) NOT NULL DEFAULT 'Available' CHECK (status IN ('Available', 'Reserved', 'Booked', 'Sold', 'Cancelled', 'Transferred')),
    
    -- Mutation & Land Registry Properties
    mutation_date DATE,
    khatian_no VARCHAR(100),
    dag_no VARCHAR(100),
    mouza VARCHAR(255),
    rajuk_approval_no VARCHAR(100),
    legal_status VARCHAR(50) NOT NULL DEFAULT 'Clear' CHECK (legal_status IN ('Clear', 'Disputed', 'Under Review')),
    
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_units_project_company ON units(project_id, company_id);
```

### 2.3. Bookings (`bookings`)
Holds active and historical records of apartment and plot bookings.
```sql
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL,
    project_id UUID NOT NULL REFERENCES projects(id),
    unit_id UUID NOT NULL REFERENCES units(id),
    customer_id UUID NOT NULL,
    booking_date DATE NOT NULL,
    total_agreed_price DECIMAL(18,2) NOT NULL,
    booking_money_bdt DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    downpayment_bdt DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    status VARCHAR(50) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Cancelled', 'Completed')),
    sales_person_id UUID NOT NULL,
    commission_percentage DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    
    -- Cancellation & Refund specifics
    cancellation_date DATE,
    refund_amount DECIMAL(18,2) DEFAULT 0.00,
    cancellation_fee DECIMAL(18,2) DEFAULT 0.00,
    cancellation_reason TEXT,
    
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_bookings_customer ON bookings(customer_id);
```

### 2.4. Installments (`installments`)
Auto-generated billing schedule mapping.
```sql
CREATE TABLE installments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id),
    installment_no INT NOT NULL,
    due_date DATE NOT NULL,
    amount_bdt DECIMAL(12,2) NOT NULL,
    paid_amount_bdt DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    status VARCHAR(50) NOT NULL DEFAULT 'Unpaid' CHECK (status IN ('Unpaid', 'Paid', 'Partially Paid', 'Overdue')),
    paid_date DATE,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_installments_booking ON installments(booking_id);
```

### 2.5. Money Receipts (`money_receipts`)
Stores client checks, transfers, and cash payments. Linked directly with ledger journals.
```sql
CREATE TABLE money_receipts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL,
    receipt_no VARCHAR(50) NOT NULL,
    booking_id UUID NOT NULL REFERENCES bookings(id),
    received_from_id UUID NOT NULL,
    amount_bdt DECIMAL(12,2) NOT NULL,
    payment_mode VARCHAR(50) NOT NULL CHECK (payment_mode IN ('Cash', 'Cheque', 'Pay Order', 'Bank Transfer')),
    bank_name VARCHAR(150),
    instrument_no VARCHAR(100),
    issued_by_id UUID NOT NULL,
    received_date DATE NOT NULL,
    is_cleared BOOLEAN NOT NULL DEFAULT FALSE,
    journal_voucher_id UUID, -- References general ledger journal
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX idx_receipt_no_company ON money_receipts(company_id, receipt_no);
```

### 2.6. JVA Agreements (`jva_agreements`)
Tracks agreement bounds between landowners and developers.
```sql
CREATE TABLE jva_agreements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL,
    project_id UUID NOT NULL REFERENCES projects(id),
    landowner_name VARCHAR(255) NOT NULL,
    developer_share DECIMAL(5,2) NOT NULL DEFAULT 50.00,
    landowner_share DECIMAL(5,2) NOT NULL DEFAULT 50.00,
    revenue_terms TEXT,
    expense_terms TEXT,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

---

## 3. NestJS Module & Service Integrations

### 3.1. Real Estate Module Configuration (`real-estate.module.ts`)
```typescript
import { Module } from '@nestjs/common';
import { RealEstateController } from './real-estate.controller';
import { BookingWorkflowService, InstallmentCalculatorService, CancellationRefundEngineService } from '/src/db/real_estate_engine';
import { ProjectRepository, UnitRepository, BookingRepository, MoneyReceiptRepository, InstallmentRepository } from '/src/db/real_estate_engine';

@Module({
  controllers: [RealEstateController],
  providers: [
    BookingWorkflowService,
    InstallmentCalculatorService,
    CancellationRefundEngineService,
    {
      provide: 'PROJECT_REPO',
      useClass: ProjectRepository,
    },
    {
      provide: 'UNIT_REPO',
      useClass: UnitRepository,
    },
    {
      provide: 'BOOKING_REPO',
      useClass: BookingRepository,
    },
    {
      provide: 'RECEIPT_REPO',
      useClass: MoneyReceiptRepository,
    },
    {
      provide: 'INSTALLMENT_REPO',
      useClass: InstallmentRepository,
    },
  ],
  exports: [BookingWorkflowService],
})
export class RealEstateModule {}
```

---

## 4. REST API Endpoint Definitions

All request parameters are strictly validated using NestJS `ValidationPipe` and secure tokens.

### 4.1. Project & Sourcing endpoints
*   `POST /api/real-estate/projects`
    *   Creates a project record.
    *   *Payload:* `CreateProjectDto`
*   `GET /api/real-estate/projects`
    *   List all active projects for the authenticated tenant company ID.

### 4.2. Unit Inventory Management
*   `POST /api/real-estate/units`
    *   Populates a floor or plot item block.
    *   *Payload:* `CreateUnitDto`
*   `PATCH /api/real-estate/units/mutation`
    *   Records Khatian numbers, Mouza name, legal disputes, and RAJUK numbers.
    *   *Payload:* `UpdateMutationDto`

### 4.3. Core Booking Engine
*   `POST /api/real-estate/bookings`
    *   Executes unit locks, schedules installment matrices, maps sales team commissions, and inserts double-entry receivables journals.
    *   *Payload:* `CreateBookingDto`

### 4.4. Money Receipt Clearance
*   `POST /api/real-estate/receipts`
    *   Logs cash/bank received receipts and pays off installments via FIFO sequence.
    *   *Payload:* `RegisterPaymentDto`

### 4.5. Transaction Cancellation Engine
*   `POST /api/real-estate/bookings/cancel`
    *   Frees booked units, deletes unpaid invoices, and creates a reversal journal.
    *   *Payload:* `CancelBookingDto`

---

## 5. Audit & Customer Ledger Reconciliation Integrations

### 5.1. Customer Ledger View
Utilizes PostgreSQL's table-valued window functions to list all transactions under chronological debit-credit ledgers.
```typescript
@Get('/bookings/:id/ledger')
async getCustomerLedger(@Param('id') bookingId: string, @Request() req) {
  const companyId = req.user.companyId;
  const result = await this.dbClient.query(
    'SELECT * FROM get_customer_ledger($1::UUID, $2::UUID)',
    [companyId, bookingId]
  );
  return result.rows;
}
```

### 5.2. Audit Logging Wrapper
Every mutation automatically records action metadata, JSON modifications, and localized English/Bangla activity trails.
```typescript
async logActivity(tx: any, companyId: string, userId: string, action: string, refId: string, values: any) {
  await tx.query(
    `INSERT INTO audit_logs (company_id, user_id, action, table_name, record_id, new_values, created_at)
     VALUES ($1, $2, $3, 'real_estate_transaction', $4, $5, CURRENT_TIMESTAMP)`,
    [companyId, userId, action, refId, JSON.stringify(values)]
  );
}
```

---

## 6. Comprehensive Step-by-Step Implementation & Execution Order

To guarantee complete ledger accuracy and transaction integrity, execute tasks in the following strict order:

### Step 1: Run Database Initializations
Log in to your PostgreSQL cluster and execute the primary table layouts:
```bash
psql -h <host> -U <user> -d <database> -f /src/db/schema.sql
```

### Step 2: Provision Transaction Procedures & Mutex Locks
Execute the transactional state machine and automated procedures:
```bash
psql -h <host> -U <user> -d <database> -f /src/db/real_estate_procedures.sql
```

### Step 3: Link NestJS Modules & Auto-Accounting Triggers
Mount the repositories inside NestJS modules and ensure the transaction managers trigger the core accounting ledger whenever a booking or money receipt clears:
```typescript
// On booking creation callback:
await autoPostingService.handleBookingCreated(bookingId);

// On installment checkout clearance:
await autoPostingService.handleMoneyReceiptCleared(receiptId);

// On booking cancellation:
await autoPostingService.handleBookingCancelled(bookingId);
```

### Step 4: Verify Unit Isolation & Concurrency Safety
Execute automated integration test sequences:
1.  **Race Condition Test:** Simulate 10 simultaneous user calls attempting to book the same plot unit. Verify that 9 calls fail with a `Validation Failure: Unit is currently Reserved/Booked` exception, and exactly 1 call succeeds.
2.  **Audit Integrity Test:** Trigger a full cancellation workflow. Confirm that the associated unit reverts back to `Available`, outstanding unpaid installment items are deleted, and audit trails log both BDT refunds and service deductions cleanly.
3.  **Cross-Tenant Isolation Test:** Attempt to query landowner settlement ledgers across separate company context IDs. Verify that the system blockages throw authorization blocks.
