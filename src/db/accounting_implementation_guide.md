# AL KASWA HOLDINGS ERP - ACCOUNTING ENGINE IMPLEMENTATION GUIDE
**Author:** Chief ERP Solution Architect
**Target Platform:** NestJS Backend (TypeScript) + PostgreSQL Database (Cloud SQL)

---

## 1. Core Accounting Rules Enforced
*   **Balance Constraint:** Every single voucher posting must maintain the basic mathematical equation: `Sum(Debit) = Sum(Credit)`.
*   **Unbalanced Rejections:** Any transactional request where debits do not equal credits is immediately rolled back at the database connection layer using transactional isolation levels (`SERIALIZABLE` or `READ COMMITTED` inside Postgres `post_journal_voucher`).
*   **Immutable Entries:** Once a journal voucher is marked as `posted` and `locked`, it is completely frozen. Deletion is physically restricted by database constraints and triggers.
*   **Company Tenant Isolation:** All accounting tables (`chart_of_accounts`, `journal_vouchers`, `ledger_entries`) enforce tenant isolation. Every database query includes a strict `WHERE company_id = p_company_id` block.

---

## 2. Dynamic Auto-Posting Engine Workflows

### Scenario A: New Apartment / Plot Booking Created
*   **Trigger:** When the Sales Manager completes a booking.
*   **Auto-Journal Voucher Generated:**
    *   **Debit:** Accounts Receivable - Customers (`1200-REC-CUST`) -> *Increases Asset*
    *   **Credit:** Real Estate Sales Revenue (`4100-REV-SALES`) -> *Increases Revenue*
*   **Amount:** Total Agreed Price of the Unit.

### Scenario B: Money Receipt Issued & Cleared (Installment / Downpayment Collected)
*   **Trigger:** When the client pays an installment, and the check or transfer clears.
*   **Auto-Journal Voucher Generated:**
    *   **Debit:** Cash-in-Hand (`1110-CASH-HND`) or Bank General (`1120-BANK-GEN`) -> *Increases Asset*
    *   **Credit:** Accounts Receivable - Customers (`1200-REC-CUST`) -> *Decreases Asset*
*   **Amount:** The specific receipt amount collected in BDT.

### Scenario C: Booking Cancelled (Auto-Reversal)
*   **Trigger:** Customer requests cancellation, or default occurs, and approval is granted by the MD.
*   **Auto-Journal Voucher Generated:**
    *   **Debit:** Real Estate Sales Revenue (`4100-REV-SALES`) -> *Decreases Revenue (Sales Reversal)*
    *   **Credit:** Accounts Receivable - Customers (`1200-REC-CUST`) -> *Decreases Asset (Receivable Reversal)*
    *   **If Refund is paid out:**
        *   **Debit:** Accounts Receivable - Customers (`1200-REC-CUST`) -> *Adjusts receivable balance*
        *   **Credit:** Bank Account General (`1120-BANK-GEN`) -> *Decreases Asset (Refund outflow)*
        *   **Credit:** Cancellation Fees Income (`4200-REV-FEES`) -> *Increases Revenue (Fee retained)*

---

## 3. Database Layer Architecture (Stored Procedures & Functions)
All files are located in `/src/db/accounting_procedures.sql`.

*   `post_journal_voucher`: Evaluates fiscal period locks, chart of accounts ownership, enforces `debit = credit`, creates the voucher header, and inserts multiple lines under a single transaction.
*   `auto_post_booking_journal`: Automatic adapter triggering ledger recognition upon unit bookings.
*   `auto_post_receipt_journal`: Automatic bank-clearance and receivable adjustment trigger upon receipt clearance.
*   `auto_post_booking_cancellation_journal`: Multi-leg journal reversing recognized revenue and handling cancellations.
*   `get_trial_balance`: Aggregates opening balances, period debits, and period credits to verify company accounts balances.
*   `get_profit_and_loss`: Standard income statement summarizing Revenues and Expenses to compute net yield.
*   `get_balance_sheet`: Verifies the fundamental accounting equation: `Assets = Liabilities + Owner Equity`.
*   `get_cash_flow`: Generates Direct Method cash flows partitioned into Operating, Investing, and Financing activities.

---

## 4. Backend NestJS/TypeScript Layer
All classes are located in `/src/db/accounting_engine.ts`.

*   `ChartOfAccountsRepository`: Handles database mappings, hierarchical folder tree building, and active status checks.
*   `VoucherRepository`: Connects directly to PostgreSQL procedural engines, validating voucher numbers and enforcing double-entry controls.
*   `AccountingService`: Orchestrates transactions, evaluates validation schemas (DTOs), and wraps database operations in managed connection pools.
*   `AutoPostingService`: Hooks into other domain domains (Sales, CRM) to automatically post journals.
*   `FiscalPeriodLockService`: Provides administrative controls to seal ledger books up to designated periods.
*   `AdjustmentJournalService`: Standardizes adjustment ledger controls by reversing entries and inserting corrected placements.

---

## 5. Step-by-Step Implementation & Deployment Order

### Step 1: Run PostgreSQL Migrations
Execute the core SQL schema and procedures on your PostgreSQL database instance:
```bash
psql -h <host> -U <user> -d <database> -f /src/db/schema.sql
psql -h <host> -U <user> -d <database> -f /src/db/accounting_procedures.sql
```

### Step 2: Bind NestJS Module Providers
In your NestJS application backend, register the services and repositories inside an `AccountingModule`:
```typescript
@Module({
  controllers: [AccountingController],
  providers: [
    AccountingService,
    AutoPostingService,
    FiscalPeriodLockService,
    AdjustmentJournalService,
    {
      provide: 'CHART_OF_ACCOUNTS_REPO',
      useClass: ChartOfAccountsRepository,
    },
    {
      provide: 'VOUCHER_REPO',
      useClass: VoucherRepository,
    }
  ],
  exports: [AccountingService, AutoPostingService],
})
export class AccountingModule {}
```

### Step 3: Integrate Domain Event Handlers
Connect your other modules (Sales, Collections) using NestJS event emitters or directly call `AutoPostingService`:
*   *Event:* `booking.created` -> Call `autoPostingService.handleBookingCreated(bookingId)`
*   *Event:* `money_receipt.cleared` -> Call `autoPostingService.handleMoneyReceiptCleared(receiptId)`
*   *Event:* `booking.cancelled` -> Call `autoPostingService.handleBookingCancelled(bookingId)`

### Step 4: Verify Controls via Integration Tests
Deploy high-coverage test cases verifying:
1.  Attempting to post an unbalanced voucher throws a `Double-Entry Error` and rolls back any changes.
2.  Postings against locked fiscal dates trigger an immediate authorization block.
3.  Cross-company modifications from separate user sessions trigger a `Security Violation` exception.
