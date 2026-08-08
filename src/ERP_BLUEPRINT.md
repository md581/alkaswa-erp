# BANGLADESH REAL ESTATE DEVELOPER ERP SYSTEM
## Architectural Blueprint & System Design Document
**Author:** Senior Software Architect
**Date:** July 2026
**Target Industry:** Real Estate & Property Development (Bangladesh Context: RAJUK, CDA, City Survey, Joint Venture JVA, Landowner allocation)
**System Version:** 1.0.0-Blueprint

---

## Table of Contents
1. [Complete Software Architecture](#1-complete-software-architecture)
2. [Department Structure](#2-department-structure)
3. [User Roles & Personas](#3-user-roles--personas)
4. [Permission Matrix](#4-permission-matrix)
5. [Database Architecture (Relational Schema)](#5-database-architecture-relational-schema)
6. [Module Architecture](#6-module-architecture)
7. [Portal Architecture](#7-portal-architecture)
8. [Bilingual (Bangla/English) Design Pattern](#8-bilingual-banglaenglish-design-pattern)

---

## 1. Complete Software Architecture

The Bangladesh Real Estate Developer ERP is designed as a secure, full-stack, enterprise-grade system. Real estate development in Bangladesh involves multi-year project lifecycles, massive capital flows, complex regulatory approvals (RAJUK, CDA, KDA, RDA, Department of Environment, Fire Service, etc.), and Joint-Venture (JV) land sharing agreements. The architecture is engineered to guarantee data integrity, absolute financial accountability, and real-time operational transparency.

### 1.1 Technical Stack & Infrastructure
*   **Frontend**: Single Page Application (SPA) powered by **React 19** and **Vite**, styled with **Tailwind CSS**. Built with high-density, bento-grid layouts, optimized for both desktop executive dashboards and mobile on-site construction logs.
*   **Animation Engine**: **Motion (Framer Motion)** for fluid, purposeful screen-to-screen transitions and data viz reveal effects.
*   **Backend**: **Node.js (Express)** serving a RESTful API with server-side proxy routes for secure external interactions.
*   **Database**: **PostgreSQL (via Cloud SQL or Supabase)** to handle complex relational schemas, financial ledgers, and nested project dependencies.
*   **ORM**: **Drizzle ORM** for type-safe database queries and automated schema migrations.
*   **File Storage**: Cloud Storage (e.g., Google Cloud Storage) to store critical legal land documents, deeds (Deed of Agreement, Power of Attorney), approval maps, and money receipts securely.

### 1.2 Architectural System Diagram
```
+---------------------------------------------------------------------------------+
|                                 USER PORTAL LAYER                               |
|   +--------------------+   +---------------------+   +-----------------------+  |
|   |  Executive Portal  |   | Departmental Hub    |   | Stakeholder Portals   |  |
|   |  (Founder, MD, GM) |   | (HR, Accounts, Eng) |   | (Client, Owner, Inv)  |  |
|   +--------------------+   +---------------------+   +-----------------------+  |
+----------------------------------------+----------------------------------------+
                                         | (HTTPS / REST)
+----------------------------------------v----------------------------------------+
|                                APPLICATION SERVICES                             |
|   +-------------------------------------------------------------------------+   |
|   |   Bilingual i18n Translation Service (English / Bangla switcher)         |   |
|   +-------------------------------------------------------------------------+   |
|   |   Role-Based Access Control (RBAC) & Session Validator                  |   |
|   +-------------------------------------------------------------------------+   |
|   |   Dynamic Reporting Engine (PDF Invoice, Money Receipt, Ledger Export)   |   |
|   +-------------------------------------------------------------------------+   |
|   |   Gemini AI Assistant (Smart Legal Doc parsing, JV Profitability Estim) |   |
|   +-------------------------------------------------------------------------+   |
+----------------------------------------+----------------------------------------+
                                         | (Type-Safe Queries)
+----------------------------------------v----------------------------------------+
|                                PERSISTENCE LAYER                                |
|   +-------------------------------------------------------------------------+   |
|   |   PostgreSQL Relational DB (Drizzle Schema)                             |   |
|   |   - Users, Roles, Permissions                                           |   |
|   |   - Projects, Units, Land Deeds, JVA Records                            |   |
|   |   - Financial Ledger, Purchase Orders, Cost Estimations                 |   |
|   +-------------------------------------------------------------------------+   |
+---------------------------------------------------------------------------------+
```

### 1.3 Key Architectural Patterns
1.  **Strict Ledger Consistency (No Floating Balances)**: Double-entry bookkeeping ledger rules applied to customer installments, procurement receipts, and investor payouts. Every financial transaction must link to a verified journal voucher (JV).
2.  **Hybrid Bilingual i18n**: Direct schema support for multi-language records (e.g., land details, client names, and project locations stored in both English and Bangla characters) paired with UI localization.
3.  **Audit-Log-First Design**: Modification of crucial parameters (like apartment price, JVA ratios, landowner allocations, or legal status) generates a cryptographically ordered audit trail record.

---

## 2. Department Structure

The ERP reflects the operational departments of a premier Bangladeshi real estate developer:

```
                          +-------------------------------+
                          |     BOARD OF DIRECTORS        |
                          |    (Founder, MD, GM)          |
                          +---------------+---------------+
                                          |
        +------------------+--------------+-------------+--------------------+
        |                  |                            |                    |
+-------v-------+  +-------v-------+            +-------v-------+    +-------v-------+
|  ACQUISITION  |  |     LEGAL     |            |  ENGINEERING  |    |  PROCUREMENT  |
| Land sourcing |  | Deed vetting  |            | Project prep  |    | Purchase Req  |
| JV JVA prep   |  | RAJUK/CDA app |            | Site progress |    | Store inventory|
+---------------+  +---------------+            +-------+-------+    +---------------+
        |                  |                            |                    |
+-------v-------+  +-------v-------+                    |            +-------v-------+
|     SALES     |  |   ACCOUNTS    |                    |            |   HUMAN RES   |
| Unit booking  |  | Balance Sheet |                    |            | Staff payroll |
| Installments  |  | Money receipt |                    |            | Commission    |
+---------------+  +---------------+                    |            +---------------+
        |                  |                            |                    |
        +------------------+--------------+-------------+--------------------+
                                          |
                               +----------v----------+
                               |     STAKEHOLDERS    |
                               | Customers, Owners,  |
                               | Investors           |
                               +---------------------+
```

1.  **Land Acquisition & Business Development**: Identifies properties, negotiates with landowners, and executes Joint Venture Agreements (JVA) or Outright Purchase deeds.
2.  **Legal & Regulatory Affairs**: Handles vetting of land titles (CS/SA/RS/BS), mutation status, non-encumbrance verification, and coordinates with municipal bodies (RAJUK, CDA, KDA, RDA, Paurashava) for building approval.
3.  **Engineering & Project Management**: Manages structural design, coordinates site activities (piling, framing, finishing), tracks materials usage, and oversees sub-contractor progress.
4.  **Procurement & Inventory**: Manages supplier contracts, coordinates bulk purchases (rod, cement, sand, bricks), authorizes item dispatches to various active project sites, and maintains inventory levels.
5.  **Sales & Marketing**: Handles marketing of residential/commercial spaces, coordinates pricing tables, drives customer bookings, allocates units, and manages down payments and installment cycles.
6.  **Accounts & Finance**: Overlooks the general ledger, tracks cash flow (receipts vs. bills), runs project-wise balance sheets, handles payroll disbursements, and manages taxation.
7.  **Human Resources & Administration**: Manages employee performance, processes monthly payroll, calculates on-site labor rates, and manages commissions for sales agents.
8.  **Management Executives**: Holds operational and financial oversight over all departments, reviews portfolio performance, and approves large procurement budgets and new land investments.

---

## 3. User Roles & Personas

The system supports exactly 13 roles, split into internal corporate staff and external stakeholders.

### 3.1 Corporate Leadership & Oversight
1.  **Founder (FND)**:
    *   *Persona*: Ultimate shareholder of the company. Focuses on overall business health, portfolio expansion, high-level cash flow, and equity stakes.
    *   *Core Action*: Views global company analytics, project profitability summaries, and high-value legal/financial bottlenecks.
2.  **Managing Director (MD)**:
    *   *Persona*: Principal executive responsible for operations. Handles ultimate project approvals, budget allocations, joint ventures, and strategic hires.
    *   *Core Action*: Approves or rejects JVA terms, legal clearances, procurement orders above 5,00,000 BDT, and project launches.
3.  **General Manager (GM)**:
    *   *Persona*: Mid-to-senior coordinator overseeing cross-departmental operations. Ensures project timelines and targets are met.
    *   *Core Action*: Tracks departmental milestones, reviews inter-departmental requests, and prepares quarterly operational reports for the MD.

### 3.2 Departmental Managers (Internal Operational Staff)
4.  **HR Manager (HRM)**:
    *   *Persona*: Oversees staffing, recruitment, payroll calculations, sales agent commission structures, and daily worker records.
    *   *Core Action*: Approves payroll logs, verifies sales commissions, tracks employee attendance, and maintains personnel records.
5.  **Accounts Manager (ACT)**:
    *   *Persona*: Controller of the company ledger. Tracks money coming from bookings/installments and money going out to contractors and suppliers.
    *   *Core Action*: Authorizes official Money Receipts (MR), vettes vendor bills against Purchase Orders, updates general ledger, and files tax files.
6.  **Sales Manager (SLM)**:
    *   *Persona*: Drives revenue targets, tracks apartment inventory (booked, sold, unsold, JVA allocated), and tracks client payments.
    *   *Core Action*: Generates payment schedules, handles allotment bookings, applies delayed installment penalties, and tracks team targets.
7.  **Land Acquisition Manager (LAM)**:
    *   *Persona*: Evaluates potential land parcels, tracks landowner profiles, and leads Joint Venture negotiations.
    *   *Core Action*: Inputs land surveys, uploads via-deeds and deeds of agreement, and tracks JVA share splits (e.g., 60-40 developer-landowner).
8.  **Legal Manager (LGL)**:
    *   *Persona*: Keeps the developer safe from litigation and title disputes. Vets land deeds back to British-era records if necessary.
    *   *Core Action*: Submits legal vetting reports, logs RAJUK/CDA layout approvals, tracks litigation cases, and files mutation clearances.
9.  **Engineering Manager (ENG)**:
    *   *Persona*: Heads construction, ensures on-time civil structure delivery, structural safety, and monitors raw material usage.
    *   *Core Action*: Inputs daily site progress reports, submits material demand sheets, schedules piling/roof casting milestones, and evaluates sub-contractors.
10. **Procurement Manager (PRM)**:
    *   *Persona*: Sources structural materials, negotiates prices with suppliers, and manages central/site inventories.
    *   *Core Action*: Tracks purchase requisitions, creates Purchase Orders (PO), manages cement/steel stock ledgers, and logs delivery challans.

### 3.3 Stakeholders (External Portals)
11. **Customer (CST)**:
    *   *Persona*: Individual/corporate buyer of an apartment, shop, or commercial space.
    *   *Core Action*: Accesses customer portal to view booking documents, tracks installment payment schedule, views outstanding dues, and submits query tickets.
12. **Land Owner (LDO)**:
    *   *Persona*: Original owner(s) of the land who signed a JV agreement with the developer in exchange for cash and a portion of the apartments.
    *   *Core Action*: Accesses landowner portal to view progress of the building, verifies construction updates (milestones), and tracks the handover checklist of allocated units.
13. **Investor (INV)**:
    *   *Persona*: Capital partner funding specific projects in exchange for profit shares or fixed returns.
    *   *Core Action*: Monitors project-specific cash registers, tracks development progress, and views financial yield sheets.

---

## 4. Permission Matrix

The system features a strict Role-Based Access Control (RBAC) model. Features are organized by domain. Below is the comprehensive permission matrix mapping CRUD (Create, Read, Update, Delete) rights:

| Domain | Feature Module | FND | MD | GM | HRM | ACT | SLM | LAM | LGL | ENG | PRM | CST | LDO | INV |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **System** | System Settings & Audit | CRUD | CR | R | - | - | - | - | - | - | - | - | - | - |
| **HR** | Employee & Payroll Management | R | CRUD | R | CRUD | R | - | - | - | - | - | - | - | - |
| **Acquisition** | Land Vetting & JV Profiles | R | CRUD | R | - | - | - | CRUD | R | - | - | - | - | - |
| **Legal** | RAJUK / Mutation Approvals | R | CRUD | RU | - | - | - | R | CRUD | - | - | - | - | - |
| **Project** | Project & Unit Inventory | R | CRUD | RU | - | R | CRUD | R | R | CRUD | - | - | - | - |
| **Sales** | Booking, Allotment & Rates | R | CRUD | RU | - | R | CRUD | - | - | - | - | - | - | - |
| **Finance** | Payment Schedule & Ledger | R | CRUD | R | - | CRUD | RU | - | - | - | - | R | - | - |
| **Procure** | Purchase Requisitions & POs | R | RU | R | - | RU | - | - | - | CR | CRUD | - | - | - |
| **Construction** | Site Logs & Piling Progress | R | R | R | - | - | - | - | - | CRUD | - | R | R | R |
| **Portals** | Customer / Owner / Inv Views | - | R | R | - | - | - | - | - | - | - | CRUD | CRUD | CRUD |

**Legend:**
*   `C`: Create, `R`: Read, `U`: Update, `D`: Delete (CRUD denotes full control).
*   `-`: Access Denied.
*   Portals for CST, LDO, INV have read access to their respective resources and the ability to submit request tickets (Create operations on tickets).

---

## 5. Database Architecture (Relational Schema)

The database matches the structural relations of real estate business processes. Transactions are strictly non-destructible (soft deleted if necessary via `is_deleted` flags).

```
 +------------------+           +------------------+           +------------------+
 |      users       |1        N |     projects     |1        N |    project_units |
 |------------------|-----------|------------------|-----------|------------------|
 | - id (PK)        |           | - id (PK)        |           | - id (PK)        |
 | - email          |           | - name_en / bn   |           | - unit_no        |
 | - role (enum)    |           | - location_en/bn |           | - size_sft       |
 | - phone          |           | - total_floors   |           | - floor_no       |
 | - active_status  |           | - land_area_katha|           | - price_per_sft  |
 +--------+---------+           | - jva_ratio      |           | - status (enum)  |
          |                     +--------+---------+           +--------+---------+
          |                              |                              |
          | 1                            | 1                            | 1
          |                              |                              |
          | N                            | N                            | N
 +--------v---------+           +--------v---------+           +--------v---------+
 |   audit_logs     |           |  land_records    |           | customer_bookings|
 |------------------|           |------------------|           |------------------|
 | - id (PK)        |           | - id (PK)        |           | - id (PK)        |
 | - user_id (FK)   |           | - cs_da_nos      |           | - project_id (FK)|
 | - action         |           | - jva_signed_date|           | - unit_id (FK)   |
 | - table_name     |           | - legal_vetting  |           | - customer_id(FK)|
 | - changed_data   |           | - mutation_status|           | - booking_date   |
 +------------------+           +------------------+           +--------+---------+
                                                                        |
                                                                        | 1
                                                                        |
                                                                        | N
                                                               +--------v---------+
                                                               |   installments   |
                                                               |------------------|
                                                               | - id (PK)        |
                                                               | - booking_id (FK)|
                                                               | - due_date       |
                                                               | - amount_bdt     |
                                                               | - status (enum)  |
                                                               +------------------+
```

### 5.1 Main Tables & Fields

#### 5.1.1 `users`
*   `id` (UUID, Primary Key)
*   `email` (VARCHAR, Unique)
*   `password_hash` (VARCHAR)
*   `name_en` (VARCHAR), `name_bn` (VARCHAR)
*   `role` (VARCHAR / ENUM: FND, MD, GM, HRM, ACT, SLM, LAM, LGL, ENG, PRM, CST, LDO, INV)
*   `phone` (VARCHAR)
*   `nid_no` (VARCHAR) - National ID Number
*   `is_active` (BOOLEAN, Default: TRUE)
*   `created_at` (TIMESTAMP)

#### 5.1.2 `projects`
*   `id` (UUID, Primary Key)
*   `name_en` (VARCHAR), `name_bn` (VARCHAR)
*   `location_en` (VARCHAR), `location_bn` (VARCHAR) (e.g., Uttara Sector 10, Dhanmondi Road 27)
*   `total_floors` (INTEGER)
*   `land_area_katha` (DECIMAL) - Bangladesh land measurement unit (Katha)
*   `jva_ratio_developer` (DECIMAL, e.g. 60.00)
*   `jva_ratio_landowner` (DECIMAL, e.g. 40.00)
*   `start_date` (DATE)
*   `estimated_completion` (DATE)
*   `status` (VARCHAR - Planning, Sourcing, Under Construction, Finishing, Handed Over)

#### 5.1.3 `project_units`
*   `id` (UUID, Primary Key)
*   `project_id` (UUID, Foreign Key)
*   `unit_no` (VARCHAR, e.g., A-3, B-4)
*   `floor_no` (INTEGER)
*   `size_sft` (DECIMAL) - Size in square feet
*   `price_per_sft` (DECIMAL)
*   `parking_charge_bdt` (DECIMAL)
*   `utility_charge_bdt` (DECIMAL)
*   `allocation_type` (VARCHAR - Developer Share, Landowner Share)
*   `status` (VARCHAR - Available, Booked, Sold, Blocked)

#### 5.1.4 `land_records`
*   `id` (UUID, Primary Key)
*   `project_id` (UUID, Foreign Key, Nullable - used if converted to project)
*   `location_en` (VARCHAR), `location_bn` (VARCHAR)
*   `size_decimal` (DECIMAL) - Land size in Decimals
*   `cs_daag_no` (VARCHAR) - CS Daag Number
*   `sa_daag_no` (VARCHAR) - SA Daag Number
*   `rs_daag_no` (VARCHAR) - RS Daag Number
*   `bs_city_daag_no` (VARCHAR) - BS/City Survey Daag Number
*   `mutation_status` (VARCHAR - Pending, Completed, Rejected)
*   `via_deeds_verified` (BOOLEAN)
*   `legal_vetting_by` (UUID, FK to users - Legal Manager)
*   `legal_status` (VARCHAR - Clear, Disputed, Under Review)
*   `jva_signed` (BOOLEAN)
*   `power_of_attorney_registered` (BOOLEAN)

#### 5.1.5 `customer_bookings`
*   `id` (UUID, Primary Key)
*   `project_id` (UUID, FK)
*   `unit_id` (UUID, FK)
*   `customer_id` (UUID, FK to users - Customer)
*   `booking_date` (DATE)
*   `total_agreed_price` (DECIMAL)
*   `booking_money_bdt` (DECIMAL)
*   `downpayment_bdt` (DECIMAL)
*   `sales_person_id` (UUID, FK to users - Sales Manager/Agent)
*   `commission_percentage` (DECIMAL)
*   `status` (VARCHAR - Active, Cancelled, Completed)

#### 5.1.6 `installments`
*   `id` (UUID, Primary Key)
*   `booking_id` (UUID, FK)
*   `installment_no` (INTEGER)
*   `due_date` (DATE)
*   `amount_bdt` (DECIMAL)
*   `status` (VARCHAR - Unpaid, Paid, Partially Paid, Overdue)
*   `paid_date` (DATE, Nullable)

#### 5.1.7 `money_receipts`
*   `id` (UUID, Primary Key)
*   `receipt_no` (VARCHAR, Unique) - e.g., MR-2026-1002
*   `booking_id` (UUID, FK, Nullable)
*   `received_from_id` (UUID, FK to users)
*   `amount_bdt` (DECIMAL)
*   `payment_mode` (VARCHAR - Cash, Cheque, Pay Order, Bank Transfer)
*   `bank_name` (VARCHAR, Nullable)
*   `instrument_no` (VARCHAR, Nullable) - Cheque or transaction ID
*   `issued_by` (UUID, FK to users - Accounts Manager)
*   `received_date` (DATE)
*   `is_cleared` (BOOLEAN)

#### 5.1.8 `procurement_items`
*   `id` (UUID, Primary Key)
*   `name_en` (VARCHAR), `name_bn` (VARCHAR) (e.g. Mild Steel TMT Rod 72.5G, Portland Cement)
*   `unit_measure` (VARCHAR - Ton, Bag, CFT, SFT, CFT)
*   `category` (VARCHAR - Structural, Finishing, MEP, General)

#### 5.1.9 `purchase_requisitions`
*   `id` (UUID, Primary Key)
*   `project_id` (UUID, FK)
*   `requester_id` (UUID, FK to users - Engineering Manager)
*   `item_id` (UUID, FK)
*   `quantity_required` (DECIMAL)
*   `required_by_date` (DATE)
*   `status` (VARCHAR - Draft, Submitted, Approved by GM, Approved by MD, Completed)
*   `remarks` (TEXT)

#### 5.1.10 `purchase_orders`
*   `id` (UUID, Primary Key)
*   `requisition_id` (UUID, FK)
*   `supplier_name` (VARCHAR)
*   `supplier_phone` (VARCHAR)
*   `unit_price` (DECIMAL)
*   `total_amount` (DECIMAL)
*   `payment_terms` (TEXT)
*   `status` (VARCHAR - Draft, Released, Delivered, Paid)
*   `issued_by` (UUID, FK to users - Procurement Manager)

#### 5.1.11 `daily_construction_logs`
*   `id` (UUID, Primary Key)
*   `project_id` (UUID, FK)
*   `log_date` (DATE)
*   `recorded_by` (UUID, FK to users - Engineering Manager)
*   `current_milestone` (VARCHAR - Piling, Basement, Ground Floor Casting, Brickwork, etc.)
*   `work_description_en` (TEXT), `work_description_bn` (TEXT)
*   `materials_received` (JSONB) - [{item_id: "...", qty: 50, challan_no: "..."}]
*   `materials_consumed` (JSONB) - [{item_id: "...", qty: 30}]
*   `labor_count_daily` (INTEGER)

---

## 6. Module Architecture

The system's modular architecture breaks operations into micro-frontends or modular routes:

```
+------------------------------------------------------------------------------------+
|                                    ERP MODULES                                     |
+-------------------+--------------------+--------------------+----------------------+
| 1. ACQUISITION    | 2. LEGAL & COMP    | 3. SITE ENGINEERING| 4. SUPPLY & PROCURE  |
| - Land profiling  | - Deed vetting     | - Milestone tracks | - Materials demand   |
| - Owner maps      | - RAJUK submissions| - Daily site logs  | - Purchase Orders    |
| - JV split logs   | - Land court cases | - Safety status    | - Site Stock registers|
+-------------------+--------------------+--------------------+----------------------+
| 5. SALES & BOOK   | 6. ACCOUNTS & FIN  | 7. HR & COMMISSIONS| 8. BILINGUAL CORNER  |
| - Unit catalogs   | - Ledger posting   | - Employee profiles| - EN/BN translation  |
| - Booking deeds   | - Money receipt gen| - Attendance tracking| - Currency formatting|
| - Dues tracker    | - Project budgets  | - Sales commission | - BDT/Lakh/Crore conv|
+-------------------+--------------------+--------------------+----------------------+
```

### 6.1 Land Acquisition & JV Module
*   **Purpose**: Streamlines the process from raw land inspection to Joint-Venture signature.
*   **Key Features**:
    *   *Katha & Decimal Calculator*: Standardizes local land units.
    *   *Landowner Allocation Engine*: Dynamically allocates apartments based on JVA percentage (e.g., out of 40 apartments, 16 allocated to Landowner, 24 to Developer with standard floor balancing).

### 6.2 Legal & Compliance Vetting Module
*   **Purpose**: Manages multi-generation paper chains typical in Bangladesh land deeds.
*   **Key Features**:
    *   *Title Chain Builder*: Maps deeds through CS (Cadastral Survey) -> SA (State Acquisition) -> RS (Revisional Survey) -> BS/City Survey to verify uninterrupted ownership.
    *   *Mutation Tracker*: Follows the status of AC Land mutation approval, Land Development Tax (Dakhila) payment years, and Non-Encumbrance Certificate (NEC) records.

### 6.3 Site Engineering & Construction Tracking
*   **Purpose**: Provides daily site updates directly from field engineers.
*   **Key Features**:
    *   *Milestone Checklist*: Tracks Piling -> Basement -> Ground Slab -> Floor Slab (1 to N) -> Brickwork -> Plastering -> Paint & Tiles -> Handover.
    *   *On-Site Consumption Logger*: Logs physical usage of Rod (Tons) and Cement (Bags) to detect material wastage or theft.

### 6.4 Procurement, Supply Chain & Inventory
*   **Purpose**: Standardizes raw material orders and prevents cash leakages.
*   **Key Features**:
    *   *Site Demand Vetting*: Engineers submit demands; the system checks them against project budget limits before alerting Procurement.
    *   *Supplier Ledger & Challan Matcher*: Matches materials received on-site (Delivery Challans) with initial Purchase Orders and ultimate vendor bills before Finance authorizes payment.

### 6.5 Sales, Booking & Billing Module
*   **Purpose**: The central revenue driver.
*   **Key Features**:
    *   *Interactive Unit Map*: Graphic layout of floors showing Sold (Red), Available (Green), JVA Landowner (Blue), and Reserved (Yellow).
    *   *Installment Plan Generator*: Automatically splits the balance after downpayment into equal monthly, bi-monthly, or structural milestone installments (e.g., casting-wise installment).

### 6.6 Accounts & Financial Operations
*   **Purpose**: Establishes rigorous ledger posting and tax audit compliance.
*   **Key Features**:
    *   *Automated Money Receipt (MR) Generation*: Accounts Manager creates MR on payment clearance, sending SMS/Email notification to the client with a secure download link.
    *   *Project Profitability Register*: Real-time cost vs. revenue tracker showing each project's gross profit margin based on bills cleared and customer installments collected.

### 6.7 HR, Payroll & Commission Engine
*   **Purpose**: Tracks staff performance, salaries, and site-level attendance.
*   **Key Features**:
    *   *Sales Commission Registry*: Calculates performance-based payouts for sales representatives based on collected installments (not just booking signatures).
    *   *On-site Labor Pay System*: Tracks daily attendance of sub-contracted labors and direct payroll.

---

## 7. Portal Architecture

The interface is structured into dedicated portals, allowing users to interact with clean, context-specific views.

### 7.1 Executive Portal (Founder, MD, GM)
*   **Primary Focus**: Executive KPI dashboards, project health cards, company liquidity, and high-value approvals.
*   **Visual Widgets**:
    *   *Strategic Overview Grid*: Global sales target vs. actual collections.
    *   *Pending Approvals Drawer*: Consolidated list of PRs, POs, and Legal clearances waiting for signature.
    *   *Portfolio Map*: Inter-city map pinpointing development progress of all active projects in Dhaka/Chittagong.

### 7.2 Departmental Hub (HR, Accounts, Sales, Land, Legal, Eng, Procure)
*   **Primary Focus**: High-density productivity workspaces suited to specific workflows.
*   **Views**:
    *   *Sales Hub*: Unit lists, installment schedules, client list, MR generator.
    *   *Legal/Land Hub*: Document upload slots, CS/RS/BS survey ledger, mutation progress tracker.
    *   *Procurement/Inventory Hub*: Pending requisitions list, supplier directories, PO builder, stock levels.
    *   *Engineering Hub*: Daily logs workspace, structural milestone updates, raw material consumption sheets.

### 7.3 Stakeholder Portals (External Interface)

#### 7.3.1 Customer Portal
*   **Focus**: Financial status, documents, and building progress.
*   **Features**:
    *   *My Apartment Summary*: Details of the booked flat, size, floor, parking, utilities.
    *   *Installments Timeline*: Interactive progress bar showing Paid, Upcoming, and Overdue installments with digital BDT receipts.
    *   *Construction Gallery*: View uploaded high-resolution on-site photos showing current floor progress.
    *   *Support Corner*: Submits claims or questions directly to the Sales Manager.

#### 7.3.2 Land Owner Portal
*   **Focus**: Joint Venture execution progress and flat allocation handovers.
*   **Features**:
    *   *JVA Allocation Map*: Highlights the specific flats assigned to the landowner.
    *   *Civil Progress Dashboard*: Graphical display of structural milestones (piling, casting, plumbing).
    *   *Defect Snagging List*: Checklist for the owner during final unit inspection before handover.

#### 7.3.3 Investor Portal
*   **Focus**: Financial yields and fund utilization.
*   **Features**:
    *   *Investment Health Index*: ROI tracker, total capital injected, total payouts received.
    *   *Project Spend Ledger*: Transparency chart showing where their invested funds have been deployed (e.g., Cement: 22%, Land registration: 45%).

---

## 8. Bilingual (Bangla/English) Design Pattern

Real estate operation in Bangladesh demands complete, frictionless bilingual interfaces. 
Our design pattern uses a localized context provider coupled with explicit database support:

### 8.1 Key Localization Vocabularies
| Technical English Term | Bangla Equivalent (বাংলা) | Bangladesh Industry Context |
| :--- | :--- | :--- |
| **Landowner JVA** | জমির মালিকের চুক্তিপত্র (জেভিএ) | Joint Venture Agreement split ratios |
| **Katha / Decimal** | কাঠা / ডেসিমাল | Standard measurement: 1 Katha = 1.65 Decimal = 720 SFT |
| **Mutation Clearance** | নামজারী ও জমাভাগ | Land mutation from AC Land office |
| **CS / SA / RS / BS Deeds** | সি.এস / এস.এ / আর.এস / বি.এস দলিল | Historic land surveys and ownership flow |
| **Building Layout Approval** | ভবনের নকশা অনুমোদন (রাজউক) | RAJUK / CDA architectural and structural clearance |
| **Money Receipt (MR)** | টাকা প্রাপ্তি রশিদ | Legal invoice proof given to flat buyer |
| **Installment Due** | কিস্তি বকেয়া | Recurring monthly payment schedules |
| **Site Casting Milestone** | ছাদ ঢালাই মাইলফলক | Construction stage triggering intermediate payments |
| **Delivery Challan** | ডেলিভারি চালান | Supplier shipment confirmation at construction site |

### 8.2 Number Formatting & Local Currency Rules
*   The system formats currencies using **BDT** symbols (৳) and supports the traditional Indian/South Asian numbering system (Lakh, Crore) alongside Million/Billion.
    *   *Example*: `৳15,00,00,000` is represented as `15 Crore BDT` (১৫ কোটি টাকা) instead of `150 Million BDT`.

---
This software architecture document serves as the absolute baseline blueprint for building the Bangladesh Real Estate Developer ERP System. All subsequent UI designs, database migrations, and API integrations must comply with these configurations.
