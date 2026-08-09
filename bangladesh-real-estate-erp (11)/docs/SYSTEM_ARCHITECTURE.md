# AL KASWA HOLDINGS ERP — System Architecture Document

## Executive Summary
**AL KASWA HOLDINGS ERP** is a comprehensive, enterprise-grade Resource Planning platform engineered specifically for real estate developers, construction enterprises, land sourcing conglomerates, and investor holding companies operating in Bangladesh and international markets. The platform combines high-availability operations, automated disaster recovery, hybrid multi-tenant data persistence, and strict Role-Based Access Control (RBAC) to ensure operational continuity, audit compliance, and financial accuracy.

---

## High-Level System Architecture

```
                                  +-------------------------------------------------------+
                                  |                 CLIENT / BROWSER LAYER               |
                                  | (React 18 + Vite + Tailwind CSS + Lucide + Motion UI) |
                                  +---------------------------+---------------------------+
                                                              |
                                                    HTTPS / REST API Requests
                                                              |
                                  +---------------------------v---------------------------+
                                  |              API GATEWAY / PROXY SERVER               |
                                  |         (Express.js + Node.js - Port 3000)            |
                                  +-------------+---------------------------+-------------+
                                                |                           |
                     +--------------------------+                           +--------------------------+
                     |                                                                                 |
                     v                                                                                 v
+--------------------+---------------------+                                         +-----------------+-------------------+
|      JSON PERSISTENCE ENGINE (ACTIVE)    |                                         |   POSTGRESQL / CLOUD SQL ORM ENGINE   |
| - Atomic Directory Read/Write Locking    |                                         | - Drizzle ORM Schema Definitions  |
| - Fallback Store & Data Backfilling      |                                         | - Connection Pool Manager         |
| - Automatic Recovery Engine              |                                         | - Relational FK Constraints       |
+--------------------+---------------------+                                         +-----------------+-------------------+
                     |                                                                                 |
                     +--------------------------+                           +--------------------------+
                                                |                           |
                                                v                           v
                                  +-------------+---------------------------+-------------+
                                  |            OFFSITE BACKUP & REPLICATION VAULT         |
                                  | - Local Snapshots (/backups/daily, weekly, etc.)      |
                                  | - Secondary Offsite Cloud Vault (.json.gz Archives)   |
                                  | - Google Cloud Storage (GCS) Bucket Replication       |
                                  | - SHA-256 Checksum Manifest & Integrity Repair Engine|
                                  +-------------------------------------------------------+
```

---

## Core System Modules

1. **Executive Dashboard & Founder Cockpit**: High-level KPI aggregations, cash flow forecasting, board resolutions, strategic risk register, and override controls.
2. **Land Sourcing & CS/SA/RS/BS Land Vault**: Complete Bangladesh land record management (Mouza, JL, Khatian, Dag), mutation tracking, and JVA revenue sharing calculations.
3. **Project Management & BOQ Construction Tracker**: Multi-stage project lifecycles, Bill of Quantities (BOQ), daily site logs, contractor bill certification, and live site camera feeds.
4. **Sales CRM & Automated Customer Booking**: Lead acquisition funnel, site visit tracking, automated unit booking, installment schedules, and money receipt issuance.
5. **Customer Self-Service Portal**: Customer account statements, payment history, NOC/allocation letter downloads, and support ticket management.
6. **Investor Relations & Dividend Distribution Engine**: Investor portfolios, capital inflow tracking, dividend declarations, payout releases, and ROI analytics.
7. **Procurement, Vendor & Inventory Store Management**: Purchase requisitions, RFQ management, vendor quotations, purchase orders, material receipts, and store ledger balances.
8. **Deed Registration, Mutation & Ownership Transfer**: Land/flat registry office workflows, stamp duty & fee calculations, mutation case tracking, and ownership transfer logs.
9. **HR, Payroll & Biometric Attendance**: Employee master files, automated monthly salary calculation with allowances and commissions, and ZKTeco/Hikvision attendance device sync.
10. **Accounting, Financial Ledger & Money Receipts**: Double-entry financial vouchers, customer payment clearing, vendor ledgers, and cash flow audit logs.
11. **Document Management Vault & Legal Case Tracker**: Centralized ERP document archive, versioning, expiry alerts, land legal dispute tracking, and court hearing dates.
12. **Executive Security, RBAC & Audit Engine**: 13 enterprise roles, granular module permissions, JWT secret enforcement, HTTP security headers, and immutable audit logs.

---

## Data Layer & Hybrid Persistence Architecture

The system utilizes a dual-engine data persistence strategy:
* **JSON Local Engine (Active Production Baseline)**: Provides zero-latency reading and writing directly to structured local storage in `/data`. Features atomic file writes, fallback fall-through, and audit log auto-repair to guarantee 100% uptime even when external database endpoints are unavailable.
* **PostgreSQL / Cloud SQL Engine (Enterprise Tier)**: Integrated via Drizzle ORM with full relational schema definitions covering all entities, foreign key constraints, and transactional safety.

---

## Offsite Replication & Auto-Repair Vault

Backup data is duplicated across 3 distinct physical/logical storage locations:
1. **Local Snapshot Folders**: `/backups/daily`, `/backups/weekly`, `/backups/monthly`, `/backups/emergency`.
2. **Secondary Offsite Cloud Vault**: `/backups/secondary_local_cloud/*.json.gz` containing GZIP-compressed snapshots.
3. **Google Cloud Storage (GCS)**: Replicated to `gs://alkaswa-holdings-production-vault` with SHA-256 checksum verification.

The **Backup Integrity Repair Engine** automatically detects missing, incomplete, or corrupted GZIP archives, re-compresses snapshots from local sources, updates `backup_manifest.json`, and recalculates SHA-256 digests to ensure a 100% Disaster Recovery (DR) score.

---

## Security & Compliance
* **JWT Token Security**: Enforced via `JWT_SECRET` with signature validation on all protected endpoints.
* **Security Headers**: Standardized HTTP security via Helmet middleware including X-Content-Type-Options, Strict-Transport-Security, Content-Security-Policy, and X-Frame-Options.
* **Tamper-Evident Audit Logs**: All state-modifying actions write structured JSON records to the audit log engine containing user ID, role, action, entity ID, timestamp, and details.
