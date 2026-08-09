# AL KASWA HOLDINGS ERP — Database Schema Document

## Overview
This document specifies the database schema, entity structures, data types, and relational constraints for **AL KASWA HOLDINGS ERP**. The schema supports both PostgreSQL (via Drizzle ORM in `src/db/schema.ts`) and the JSON File Persistence Engine (`src/types.ts`).

---

## 1. Core Enterprise & Organizational Entities

### `companies`
* `id` (VARCHAR/UUID, PK): Unique company identification.
* `nameEn` (TEXT): Company English name (e.g., "Al Kaswa Holdings Ltd.").
* `nameBn` (TEXT): Company Bengali name.
* `registrationNo` (TEXT): Joint Stock Registration / RJSC Number.
* `tradeLicenseNo` (TEXT): Municipal Trade License Number.
* `registeredAddressEn` (TEXT): Registered head office address.
* `registeredAddressBn` (TEXT): Bengali address.

### `projects`
* `id` (VARCHAR/UUID, PK): Unique project ID.
* `companyId` (VARCHAR/UUID, FK -> companies.id): Associated company.
* `nameEn` (TEXT), `nameBn` (TEXT): Project title.
* `locationEn` (TEXT), `locationBn` (TEXT): Physical site location.
* `totalFloors` (INTEGER): Planned total floors (e.g., B+G+14).
* `landAreaKatha` (DECIMAL): Land area in Katha.
* `jvaRatioDeveloper` (DECIMAL), `jvaRatioLandowner` (DECIMAL): JVA revenue/area sharing ratio.
* `status` (ENUM): 'Planning' | 'Sourcing' | 'Under Construction' | 'Finishing' | 'Handed Over'.
* `completionPercent` (DECIMAL): Project progress percentage (0-100%).
* `budgetBdt` (DECIMAL), `actualCostBdt` (DECIMAL): Financial performance tracking.

### `project_units`
* `id` (VARCHAR/UUID, PK): Unit unique identifier.
* `projectId` (VARCHAR/UUID, FK -> projects.id): Parent project.
* `unitNo` (TEXT): Unit designation (e.g., "A-4", "Plot-12").
* `floorNo` (INTEGER): Floor number.
* `sizeSft` (DECIMAL): Square footage area.
* `pricePerSft` (DECIMAL): Unit rate in BDT.
* `parkingChargeBdt` (DECIMAL), `utilityChargeBdt` (DECIMAL): Ancillary charges.
* `allocationType` (ENUM): 'Developer Share' | 'Landowner Share'.
* `status` (ENUM): 'Available' | 'Booked' | 'Sold' | 'Blocked'.

---

## 2. Land Sourcing & Legal Entities

### `land_records`
* `id` (VARCHAR/UUID, PK): Land record ID.
* `locationEn` (TEXT), `locationBn` (TEXT): Land location details.
* `sizeDecimal` (DECIMAL): Land area in Decimal.
* `mouza` (TEXT), `jlNumber` (TEXT): Mouza name and JL number.
* `csDaagNo` (TEXT), `saDaagNo` (TEXT), `rsDaagNo` (TEXT), `bsCityDaagNo` (TEXT): Bangladesh Cadastral Survey Dag numbers.
* `khatianNo` (TEXT): Khatian reference.
* `mutationStatus` (ENUM): 'Pending' | 'Completed' | 'Rejected'.
* `legalStatus` (ENUM): 'Clear' | 'Disputed' | 'Under Review'.
* `jvaSigned` (BOOLEAN), `powerOfAttorneyRegistered` (BOOLEAN): Legal execution flags.

### `land_owners`
* `id` (VARCHAR/UUID, PK): Owner ID.
* `landRecordId` (VARCHAR/UUID, FK -> land_records.id): Associated land record.
* `name` (TEXT), `fatherName` (TEXT), `motherName` (TEXT): Owner personal info.
* `nid` (TEXT): National ID card number.
* `ownershipPercentage` (DECIMAL): Share percentage.
* `payableAmount` (DECIMAL), `paidAmount` (DECIMAL), `outstandingAmount` (DECIMAL): Financial accounting.

---

## 3. Sales, Customer & Booking Entities

### `customers`
* `id` (VARCHAR/UUID, PK): Customer ID.
* `nameEn` (TEXT), `nameBn` (TEXT): Customer full name.
* `phone` (TEXT), `email` (TEXT), `nidNo` (TEXT): Contact credentials & NID.
* `presentAddressEn` (TEXT), `permanentAddressEn` (TEXT): Addresses.
* `nomineeNameEn` (TEXT), `nomineeRelationEn` (TEXT), `nomineePhone` (TEXT): Nominee details.

### `customer_bookings`
* `id` (VARCHAR/UUID, PK): Booking ID.
* `projectId` (VARCHAR/UUID, FK -> projects.id): Project.
* `unitId` (VARCHAR/UUID, FK -> project_units.id): Booked unit.
* `customerId` (VARCHAR/UUID, FK -> customers.id): Buyer.
* `bookingDate` (TIMESTAMP/TEXT): Date of booking.
* `totalAgreedPrice` (DECIMAL): Total property price in BDT.
* `bookingMoneyBdt` (DECIMAL), `downpaymentBdt` (DECIMAL): Initial payments.
* `salesPersonId` (VARCHAR/UUID): Sales executive ID.
* `status` (ENUM): 'Active' | 'Cancelled' | 'Completed'.

### `booking_installments`
* `id` (VARCHAR/UUID, PK): Installment ID.
* `bookingId` (VARCHAR/UUID, FK -> customer_bookings.id): Parent booking.
* `installmentNo` (INTEGER): Sequence number.
* `dueDate` (DATE/TEXT): Scheduled payment date.
* `amountBdt` (DECIMAL): Installment amount in BDT.
* `status` (ENUM): 'Unpaid' | 'Paid' | 'Partially Paid' | 'Overdue'.
* `paidDate` (TIMESTAMP/TEXT): Actual payment timestamp.

### `money_receipts`
* `id` (VARCHAR/UUID, PK): Receipt ID.
* `receiptNo` (TEXT, UNIQUE): Human-readable receipt number (MR-2026-XXXX).
* `bookingId` (VARCHAR/UUID, FK -> customer_bookings.id): Associated booking.
* `receivedFromName` (TEXT): Payer name.
* `amountBdt` (DECIMAL): Amount in BDT.
* `paymentMode` (ENUM): 'Cash' | 'Cheque' | 'Pay Order' | 'Bank Transfer'.
* `bankName` (TEXT), `instrumentNo` (TEXT): Banking details.
* `isCleared` (BOOLEAN): Payment clearance verification flag.

---

## 4. Investor & Dividend Entities

### `investor_profiles`
* `id` (VARCHAR/UUID, PK): Investor record ID.
* `investorCode` (TEXT, UNIQUE): Public ID (e.g. INV-1001).
* `nameEn` (TEXT), `nameBn` (TEXT): Investor name.
* `totalInvestedAmount` (DECIMAL): Total principal invested.
* `currentPortfolioValue` (DECIMAL): Adjusted portfolio value.
* `totalDividendsReceived` (DECIMAL): Cumulative dividend payouts.

### `dividend_declarations`
* `id` (VARCHAR/UUID, PK): Declaration ID.
* `declarationNo` (TEXT, UNIQUE): Public declaration code.
* `period` (TEXT): Dividend period (e.g., "Q1 2026").
* `declaredDate` (DATE/TEXT): Date declared.
* `totalPoolAmount` (DECIMAL): Total distributable pool in BDT.
* `status` (ENUM): 'Draft' | 'Approved' | 'Paid'.

### `dividend_payments`
* `id` (VARCHAR/UUID, PK): Payment record ID.
* `investorId` (VARCHAR/UUID, FK -> investor_profiles.id): Investor recipient.
* `period` (TEXT): Associated period.
* `payableAmount` (DECIMAL), `paidAmount` (DECIMAL): Disbursed amount.
* `status` (ENUM): 'Pending' | 'Approved' | 'Paid'.

---

## 5. Construction, Procurement & Inventory Entities

### `boqs` & `boq_items`
* `id` (VARCHAR/UUID, PK): BOQ ID.
* `projectId` (VARCHAR/UUID, FK -> projects.id): Project.
* `materialName` (TEXT): Cement, Rod, Sand, Bricks, Tiles, etc.
* `quantity` (DECIMAL), `rate` (DECIMAL), `totalCost` (DECIMAL): Estimated vs. actual metrics.

### `purchase_orders` & `material_receipts`
* `poNumber` (TEXT, UNIQUE): Purchase Order code.
* `vendorName` (TEXT): Supplier name.
* `receivedQuantity` (DECIMAL), `inspectedBy` (TEXT): QC verification metrics.

---

## 6. System Governance & Audit

### `approval_workflows` & `approval_workflow_steps`
* Stores multi-tier approval states for Bookings, Expenses, Payroll, Land Purchases, and Investor Payouts.

### `audit_logs`
* `id` (VARCHAR/UUID, PK): Log ID.
* `userId` (TEXT), `userName` (TEXT), `userRole` (TEXT): Actor identity.
* `action` (TEXT), `tableName` (TEXT): Operation executed.
* `detailsEn` (TEXT), `detailsBn` (TEXT): Detailed description.
* `createdAt` (TIMESTAMP/TEXT): Timestamp.
