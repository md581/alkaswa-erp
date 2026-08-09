# AL KASWA HOLDINGS ERP — Founder Operation & Executive Cockpit Manual

## Overview
This manual details the strategic controls, governance protocols, executive override capabilities, and oversight workflows reserved for the **Founder (FND)**, **Managing Director (MD)**, and **General Manager (GM)** of **AL KASWA HOLDINGS LTD.**

---

## 1. Executive Cockpit Dashboard & Governance

### Core Real-Time KPI Cards
As Founder/MD, your primary dashboard provides real-time oversight of the entire conglomerate:
1. **Total Cash Flow & Bank Balances (BDT)**: Real-time net liquidity across all company accounts.
2. **Total Sales & Outstanding Receivables**: Total property sales value vs. overdue customer installments.
3. **Active Projects & Construction Progress**: Aggregate completion percentages across all land and housing developments.
4. **Total Land Bank (Katha/Decimal)**: Acquired land holdings, clear titles vs. disputed/pending mutation plots.
5. **Investor Portfolio Valuation & Pending Dividends**: Total investor capital managed vs. declared dividend liabilities.
6. **Pending Workflow Approvals**: Count of high-value items requiring Founder/MD authorization.

---

## 2. Executive Multi-Tier Approval Workflows

The ERP enforces strict governance over high-value transactions. As Founder or MD, you hold ultimate sign-off authority for the following 5 approval modules:

```
+--------------------------+----------------------------+-----------------------------+
| Workflow Module          | Initiator                  | Founder / MD Authority      |
+--------------------------+----------------------------+-----------------------------+
| Booking Approval         | Sales Executive / Manager  | Final Discount & Price Approval|
| Expense Approval (>50k)   | Accounts / Procurement     | Fund Disbursement Clearance  |
| Payroll Release          | HR Manager                 | Executive Salary Authorization|
| Land Purchase Approval   | Land Acquisition Manager   | Land Acquisition & JVA Sign-off|
| Investor Dividend Payout | Finance Director           | Pool Declaration & Release  |
+--------------------------+----------------------------+-----------------------------+
```

### Reviewing & Approving Pending Workflows
1. Click on **Founder Cockpit** -> **Approval Center**.
2. Filter by Module or Priority ('Urgent', 'High').
3. Click **Inspect Workflow**. Review attached documents, financial impact analysis, and prior manager remarks.
4. Click **APPROVE**, **REJECT**, or **RETURN FOR REVISION**.
5. Approved items immediately execute downstream ledger postings or document generation.

---

## 3. Founder Override Powers & Emergency Controls

### Emergency Administrative Override
In critical operational scenarios (e.g., emergency site funding, dispute resolution, unblocking locked units), the Founder role possesses system-wide override capabilities:
* **Manual Unit Unblocking**: Override sales holds on reserved flats/plots.
* **Special Discount / Commission Override**: Authorize non-standard sales commissions or custom customer installment plans.
* **Force Ledger Adjustment**: Execute executive journal vouchers to correct accounting discrepancies with mandatory audit logging.
* **Role Permission Escalation**: Momentarily grant elevated access to managers during audit periods.

---

## 4. Strategic Governance, Board Resolutions & Risk Management

### Managing Board Meetings & Resolutions
1. Navigate to **Executive Governance** -> **Board Meetings**.
2. Click **Schedule Board Meeting**. Enter Date, Location, and Agenda items.
3. Record official **Board Resolutions** with resolution numbers, proposed decisions, and vote outcomes.
4. All approved resolutions are digitally archived in the immutable Document Vault.

### Strategic Risk Register Monitoring
1. Open **Risk Register**. Review flagged risks categorized by category:
   * **Financial Risks**: Interest rate fluctuations, collection delays.
   * **Legal Risks**: Land mutation delays, CS/SA/RS title disputes.
   * **Construction Risks**: Raw material price spikes (rod, cement), weather delays.
2. Assign mitigation plans and responsible departmental leads.

---

## 5. System Integrity & Disaster Recovery Triggering

### One-Click Emergency Backup Trigger
From the Founder Cockpit:
1. Navigate to **System Administration** -> **Backup & Recovery**.
2. Click **Trigger Emergency Backup Now**.
3. The system instantly generates a fresh compressed GZIP snapshot, uploads it to the offsite Google Cloud Storage bucket (`gs://alkaswa-holdings-production-vault`), verifies the SHA-256 digest, and updates the system audit log.
