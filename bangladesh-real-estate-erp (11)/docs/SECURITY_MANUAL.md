# AL KASWA HOLDINGS ERP — Security, RBAC & Compliance Manual

## Overview
This manual details the security architecture, Role-Based Access Control (RBAC) matrix, cryptographic protection standards, data protection rules, and compliance mechanisms implemented across **AL KASWA HOLDINGS ERP**.

---

## 1. Role-Based Access Control (RBAC) Matrix

The system enforces strict permission scoping across **13 Enterprise Roles**. Permissions are validated on every API request and UI route navigation.

```
+-----------+-----------------------------+--------------------------------------------------------------------------+
| Role ID   | Role Title                  | Module Access Rights & Scope                                             |
+-----------+-----------------------------+--------------------------------------------------------------------------+
| FND       | Founder                     | Full System Access, Emergency Overrides, Board Management, All Approvals |
| MD        | Managing Director           | Full Executive Access, Financial Approvals, Strategic KPI Oversight      |
| GM        | General Manager             | Operational Approvals, Project Oversight, Procurement & Staff Management  |
| HRM       | HR Manager                  | Employee Management, Biometric Attendance, Monthly Payroll Generation    |
| ACT       | Accountant                  | General Ledger, Money Receipts, Vouchers, Financial Reporting            |
| SLM       | Sales Manager               | CRM Leads, Site Visits, Booking Approvals, Commission Tracking           |
| LAM       | Land Acquisition Manager    | Land Records, Mutation Tracking, JVA Execution, Registry Management      |
| LGL       | Legal Counsel               | Land Deed Vault, Legal Case Tracking, Dispute Management, Contract Review|
| ENG       | Site Engineer               | BOQ Tracking, Daily Site Logs, Contractor Bill Certification, Cameras    |
| PRM       | Procurement Manager         | Purchase Requisitions, RFQs, Vendor Quotations, Store Stock Ledger       |
| CST       | Customer                    | Customer Portal: Unit Statements, Money Receipts, Support Tickets, NOCs  |
| LDO       | Landowner                   | Landowner Portal: JVA Unit Share, Mutation Status, Revenue Statements    |
| INV       | Investor                    | Investor Portal: Portfolio Valuation, Dividend History, ROI Analytics    |
+-----------+-----------------------------+--------------------------------------------------------------------------+
```

---

## 2. Authentication & Authorization Enforcement

### JWT Token Security
* **Algorithm**: HMAC SHA-256 signatures with 24-hour expiration token lifetime.
* **Secret Key Enforcement**: System verifies non-default `JWT_SECRET` during startup.
* **Token Payload**: Contains `userId`, `userName`, `roleId`, and `permittedModules[]`.

### HTTP Security Headers & Hardening
The API server configures HTTP headers via Helmet middleware:
* **Content-Security-Policy (CSP)**: Restricts script/style sources to trusted origins.
* **Strict-Transport-Security (HSTS)**: Forces HTTPS connections (`max-age=31536000`).
* **X-Frame-Options**: Set to `SAMEORIGIN` to prevent clickjacking attacks.
* **X-Content-Type-Options**: Set to `nosniff` to prevent MIME-type sniffing.

---

## 3. Data Protection & Cryptographic Rules

### Data Encryption Rules
* **Data at Rest**: Sensitive fields (NIDs, Passwords, Bank Account numbers) are protected via AES-256 encryption or hashed with salt.
* **Data in Transit**: All API traffic requires TLS 1.3 encryption.
* **Backup Integrity Hashes**: Every backup archive `.json.gz` is sealed with a SHA-256 cryptographic digest.

### Data Protection & Privacy Rules
1. **NID & PII Masking**: Customer and Employee NID numbers are masked on non-privileged screens (e.g., `XXXX-XXXX-1234`).
2. **Read-Only Vault Documents**: Legal deeds and registered land documents cannot be deleted or modified; new versions create immutable append-only version histories.
3. **No Unsanctioned Soft-Deletes**: Deleting financial vouchers, money receipts, or land records is strictly forbidden. Any reversal requires an offsetting reversing entry with Founder approval.

---

## 4. Audit Trail & Tamper-Evident History

Every state-modifying action (create, update, status change, override) automatically records a structured event in `audit_logs`:

### Audit Log Schema Fields
* `id`: Unique UUID.
* `userId`, `userName`, `userRole`: Identity of actor.
* `action`: Action verb (e.g. `BOOKING_CREATED`, `MUTATION_APPROVED`, `DIVIDEND_DECLARED`).
* `tableName`: Targeted database entity.
* `detailsEn`, `detailsBn`: Human-readable summary of changed fields.
* `createdAt`: ISO Timestamp.

### Integrity Verification Script
```bash
# Verify RBAC matrix and security audit status:
npx tsx verifySecurityAudit.ts
```
