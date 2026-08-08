import fs from 'fs';
import path from 'path';

const BACKUPS_DIR = path.resolve(process.cwd(), 'backups');
const REPORT_FILE = path.resolve(BACKUPS_DIR, 'business_logic_audit_report.json');

export interface AuditIssue {
  Module: string;
  Severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  "Record ID": string;
  "Root Cause": string;
  "Recommended Fix": string;
  details?: string;
}

export interface BusinessLogicAuditReport {
  timestamp: string;
  auditTitle: string;
  business_logic_score: number;
  audit_status: 'PASS' | 'WARNING' | 'FAIL';
  modules_audited: string[];
  summary: {
    total_records_audited: number;
    critical_findings_count: number;
    high_findings_count: number;
    medium_findings_count: number;
    low_findings_count: number;
    pass_modules_count: number;
  };
  critical_findings: AuditIssue[];
  all_issues: AuditIssue[];
  module_scores: Record<string, number>;
  recommended_fixes: string[];
}

function readJsonFile<T>(filename: string, defaultValue: T): T {
  try {
    const dataDir = path.resolve(process.cwd(), 'data');
    let filePath = path.resolve(dataDir, filename);
    if (!fs.existsSync(filePath)) {
      filePath = path.resolve(process.cwd(), filename);
    }
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8').trim();
      return content ? JSON.parse(content) : defaultValue;
    }
  } catch (e) {
    console.error(`Failed to read ${filename}:`, e);
  }
  return defaultValue;
}

/**
 * Performs a 100% read-only enterprise business logic audit across 13 modules.
 * DO NOT MODIFY ANY DATA. READ-ONLY AUDIT.
 */
export function runBusinessLogicAudit(): BusinessLogicAuditReport {
  if (!fs.existsSync(BACKUPS_DIR)) {
    fs.mkdirSync(BACKUPS_DIR, { recursive: true });
  }

  const issues: AuditIssue[] = [];
  let totalRecordsAudited = 0;

  const modules = [
    '1. Sales & Booking',
    '2. Customer Management',
    '3. Flat / Plot Inventory',
    '4. Payment Collection',
    '5. Money Receipts',
    '6. Installments',
    '7. Investor Management',
    '8. Land Owner Management',
    '9. Expense Management',
    '10. Accounting & Ledger',
    '11. Construction BOQ',
    '12. Procurement',
    '13. HR & Payroll'
  ];

  // Load All System Datasets
  const bookings = readJsonFile<any[]>('salesBookingsDb.json', []);
  const altBookings = readJsonFile<any[]>('crm_booking_workflows.json', []);
  const allBookings = [...bookings, ...altBookings.filter(b => !bookings.some(x => x.id === b.id))];
  totalRecordsAudited += allBookings.length;

  const customers = readJsonFile<any[]>('salesCustomersDb.json', []);
  const erpCustomers = readJsonFile<any[]>('erp_customers.json', []);
  const allCustomers = [...customers, ...erpCustomers.filter(c => !customers.some(x => x.id === c.id))];
  totalRecordsAudited += allCustomers.length;

  const units = readJsonFile<any[]>('erp_project_units.json', []);
  totalRecordsAudited += units.length;

  const payments = readJsonFile<any[]>('salesPaymentsDb.json', []);
  totalRecordsAudited += payments.length;

  const receipts = readJsonFile<any[]>('erp_money_receipts.json', []);
  const altReceipts = readJsonFile<any[]>('moneyReceiptsDb.json', []);
  const allReceipts = [...receipts, ...altReceipts.filter(r => !receipts.some(x => x.id === r.id))];
  totalRecordsAudited += allReceipts.length;

  const installments = readJsonFile<any[]>('salesInstallmentsDb.json', []);
  totalRecordsAudited += installments.length;

  const investors = readJsonFile<any[]>('investor_profiles.json', []);
  const investorPortfolios = readJsonFile<any[]>('investor_portfolios.json', []);
  const dividendPayments = readJsonFile<any[]>('dividend_payments.json', []);
  const investmentTxs = readJsonFile<any[]>('investment_transactions.json', []);
  totalRecordsAudited += investors.length + investorPortfolios.length + dividendPayments.length + investmentTxs.length;

  const landOwners = readJsonFile<any[]>('phase4_land_owners.json', []);
  const jvaAgreements = readJsonFile<any[]>('phase4_jva_agreements.json', []);
  totalRecordsAudited += landOwners.length + jvaAgreements.length;

  const vouchers = readJsonFile<any[]>('erp_vouchers.json', []);
  const altVouchers = readJsonFile<any[]>('vouchersDb.json', []);
  const jvVouchers = readJsonFile<any[]>('journalVouchersDb.json', []);
  const allVouchers = [
    ...vouchers,
    ...altVouchers.filter(v => !vouchers.some(x => x.id === v.id)),
    ...jvVouchers.filter(v => !vouchers.some(x => x.id === v.id) && !altVouchers.some(x => x.id === v.id))
  ];
  totalRecordsAudited += allVouchers.length;

  const coa = readJsonFile<any[]>('erp_chart_of_accounts.json', []);
  totalRecordsAudited += coa.length;

  const purchaseOrders = readJsonFile<any[]>('construction_purchase_orders.json', []);
  const materialReceipts = readJsonFile<any[]>('construction_material_receipts.json', []);
  const inventoryLedger = readJsonFile<any[]>('construction_inventory_ledger.json', []);
  totalRecordsAudited += purchaseOrders.length + materialReceipts.length + inventoryLedger.length;

  const employees = readJsonFile<any[]>('erp_employees.json', []);
  const attendanceLogs = readJsonFile<any[]>('phase10_employee_attendance.json', []);
  totalRecordsAudited += employees.length + attendanceLogs.length;

  // =========================================================================
  // 1 & 3. SALES, BOOKING & FLAT/PLOT INVENTORY AUDIT
  // =========================================================================
  const unitBookingsMap = new Map<string, any[]>();
  allBookings.forEach(b => {
    const isCancelled = b.status === 'Cancelled' || b.status === 'REVOKED';
    const unitId = b.unitId || b.propertyId || b.unitName;
    if (unitId && !isCancelled) {
      const list = unitBookingsMap.get(unitId) || [];
      list.push(b);
      unitBookingsMap.set(unitId, list);
    }

    // Check invalid booking status transitions or orphan customer reference
    if (b.customerId) {
      const custExists = allCustomers.some(c => c.id === b.customerId);
      if (!custExists) {
        issues.push({
          Module: '1. Sales & Booking',
          Severity: 'HIGH',
          "Record ID": b.id,
          "Root Cause": `Booking '${b.id}' refers to non-existent Customer ID '${b.customerId}'.`,
          "Recommended Fix": `Ensure customer record creation before booking finalization or soft-link customer master.`
        });
      }
    }
  });

  // Check double booking of same unit
  unitBookingsMap.forEach((bookingList, unitId) => {
    if (bookingList.length > 1) {
      issues.push({
        Module: '3. Flat / Plot Inventory',
        Severity: 'CRITICAL',
        "Record ID": unitId,
        "Root Cause": `Unit/Property '${unitId}' is concurrently allocated to ${bookingList.length} active non-cancelled bookings (${bookingList.map(x => x.id).join(', ')}).`,
        "Recommended Fix": `Enforce unique database constraint on active unit bookings and reject overlapping booking creation.`
      });
    }
  });

  // Verify cancelled bookings release inventory
  allBookings.filter(b => b.status === 'Cancelled' || b.status === 'REVOKED').forEach(b => {
    const unitId = b.unitId || b.propertyId;
    if (unitId) {
      const unit = units.find(u => u.id === unitId || u.unitNo === unitId);
      if (unit && (unit.status === 'Sold' || unit.status === 'Booked')) {
        const activeBookingsOnUnit = allBookings.filter(x => (x.unitId === unitId || x.propertyId === unitId) && x.status !== 'Cancelled');
        if (activeBookingsOnUnit.length === 0) {
          issues.push({
            Module: '3. Flat / Plot Inventory',
            Severity: 'HIGH',
            "Record ID": unit.id || unitId,
            "Root Cause": `Booking '${b.id}' was cancelled, but associated unit '${unit.unitNo || unit.id}' remains marked as '${unit.status}' instead of 'Available'.`,
            "Recommended Fix": `Trigger automated inventory status transition to 'Available' upon booking cancellation.`
          });
        }
      }
    }
  });

  // =========================================================================
  // 2, 4, 5 & 6. CUSTOMER, PAYMENT COLLECTION, MONEY RECEIPTS & INSTALLMENTS
  // =========================================================================
  const receiptNoMap = new Map<string, any[]>();
  allReceipts.forEach(r => {
    if (r.receiptNo) {
      const key = r.receiptNo.toString().trim().toUpperCase();
      const list = receiptNoMap.get(key) || [];
      list.push(r);
      receiptNoMap.set(key, list);
    }
  });

  receiptNoMap.forEach((list, key) => {
    if (list.length > 1) {
      issues.push({
        Module: '5. Money Receipts',
        Severity: 'HIGH',
        "Record ID": list[0].id,
        "Root Cause": `Money Receipt number '${key}' is duplicated across ${list.length} distinct receipt entries.`,
        "Recommended Fix": `Implement unique transaction index on receipt_no per company ledger.`
      });
    }
  });

  // Booking price vs Cleared Payments & Overpayment Check
  allBookings.forEach(b => {
    const salePrice = b.totalAgreedPrice || b.totalPrice || b.agreedPriceBdt || 0;
    const clearedPayments = payments
      .filter(p => p.bookingId === b.id && (p.status === 'Cleared' || p.status === 'Paid'))
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    const clearedReceipts = allReceipts
      .filter(r => r.bookingId === b.id && (r.isCleared === true || r.isApproved === true))
      .reduce((sum, r) => sum + (r.amountBdt || r.amount || 0), 0);

    const effectiveReceived = Math.max(clearedPayments, clearedReceipts);

    if (salePrice > 0 && effectiveReceived > salePrice) {
      issues.push({
        Module: '4. Payment Collection',
        Severity: 'HIGH',
        "Record ID": b.id,
        "Root Cause": `Overpayment detected: Received amount BDT ${effectiveReceived.toLocaleString()} exceeds total agreed sale price BDT ${salePrice.toLocaleString()} on booking '${b.id}'.`,
        "Recommended Fix": `Implement real-time payment validation cap preventing collections from exceeding total booking value.`
      });
    }

    // Installments validation against total booking balance
    const bookingInstallments = installments.filter(i => i.bookingId === b.id);
    if (bookingInstallments.length > 0 && salePrice > 0) {
      const totalInstallmentsAmount = bookingInstallments.reduce((s, i) => s + (i.amount || 0), 0);
      const downpayment = b.downpaymentBdt || b.bookingMoneyBdt || 0;
      const expectedInstallmentsSum = salePrice - downpayment;
      if (Math.abs(totalInstallmentsAmount - expectedInstallmentsSum) > 10.0 && expectedInstallmentsSum > 0) {
        issues.push({
          Module: '6. Installments',
          Severity: 'MEDIUM',
          "Record ID": b.id,
          "Root Cause": `Installment schedule total BDT ${totalInstallmentsAmount.toLocaleString()} does not match remaining booking balance BDT ${expectedInstallmentsSum.toLocaleString()}.`,
          "Recommended Fix": `Re-calculate installment schedule breakdown upon booking agreement modification.`
        });
      }
    }
  });

  // =========================================================================
  // 9 & 10. EXPENSE MANAGEMENT, ACCOUNTING & LEDGER AUDIT
  // =========================================================================
  const validAccountCodes = new Set<string>(coa.map(c => c.code || c.accountCode));

  allVouchers.forEach(v => {
    // Check balanced debit and credit
    if (v.lines && Array.isArray(v.lines) && v.lines.length > 0) {
      const totalDebit = v.lines.reduce((s: number, l: any) => s + (Number(l.debit) || 0), 0);
      const totalCredit = v.lines.reduce((s: number, l: any) => s + (Number(l.credit) || 0), 0);

      if (Math.abs(totalDebit - totalCredit) > 0.01) {
        issues.push({
          Module: '10. Accounting & Ledger',
          Severity: 'CRITICAL',
          "Record ID": v.id || 'Voucher',
          "Root Cause": `Journal Voucher '${v.id}' is unbalanced: Total Debits (BDT ${totalDebit}) != Total Credits (BDT ${totalCredit}).`,
          "Recommended Fix": `Apply double-entry balancing validation middleware before posting journal vouchers.`
        });
      }

      // Check for orphan account codes in voucher lines
      v.lines.forEach((line: any, idx: number) => {
        if (line.accountCode && validAccountCodes.size > 0 && !validAccountCodes.has(line.accountCode)) {
          issues.push({
            Module: '10. Accounting & Ledger',
            Severity: 'HIGH',
            "Record ID": `${v.id}-line-${idx}`,
            "Root Cause": `Voucher line refers to unmapped Chart of Accounts code '${line.accountCode}'.`,
            "Recommended Fix": `Enforce foreign key reference to valid chart of accounts in general ledger postings.`
          });
        }
      });
    } else {
      issues.push({
        Module: '10. Accounting & Ledger',
        Severity: 'HIGH',
        "Record ID": v.id || 'EmptyVoucher',
        "Root Cause": `Posted voucher '${v.id}' contains zero line items.`,
        "Recommended Fix": `Reject posting of empty journal vouchers.`
      });
    }
  });

  // Verify every cleared payment creates ledger entries / money receipt
  payments.filter(p => p.status === 'Cleared' || p.status === 'Paid').forEach(p => {
    const hasReceipt = allReceipts.some(r => r.paymentId === p.id || r.bookingId === p.bookingId);
    const hasVoucher = allVouchers.some(v => v.referenceNo === p.id || (v.lines && v.lines.some((l: any) => l.particulars?.includes(p.id))));
    if (!hasReceipt && !hasVoucher) {
      issues.push({
        Module: '9. Expense Management',
        Severity: 'MEDIUM',
        "Record ID": p.id,
        "Root Cause": `Cleared payment '${p.id}' does not have a corresponding money receipt or linked general ledger voucher entry.`,
        "Recommended Fix": `Automate atomic transaction link between payment collection clearing and general ledger double-entry voucher generation.`
      });
    }
  });

  // =========================================================================
  // 7. INVESTOR MANAGEMENT AUDIT
  // =========================================================================
  investorPortfolios.forEach(port => {
    const totalCapital = port.totalInvestedBdt || port.principalBdt || 0;
    const invTxs = investmentTxs.filter(t => t.investorId === port.investorId);
    const calculatedCapital = invTxs
      .filter(t => t.type === 'Inflow' || t.type === 'Deposit')
      .reduce((s, t) => s + (t.amountBdt || 0), 0);

    if (totalCapital > 0 && invTxs.length > 0 && Math.abs(totalCapital - calculatedCapital) > 1.0) {
      issues.push({
        Module: '7. Investor Management',
        Severity: 'MEDIUM',
        "Record ID": port.investorId || port.id,
        "Root Cause": `Investor portfolio capital balance BDT ${totalCapital.toLocaleString()} differs from calculated transaction sum BDT ${calculatedCapital.toLocaleString()}.`,
        "Recommended Fix": `Sync portfolio stored summary metrics with real-time investment transaction ledger.`
      });
    }
  });

  // =========================================================================
  // 8. LAND OWNER MANAGEMENT AUDIT
  // =========================================================================
  jvaAgreements.forEach(jva => {
    const landOwnerShare = jva.landOwnerSharePercent || 0;
    const developerShare = jva.developerSharePercent || 0;
    if (landOwnerShare > 0 && developerShare > 0 && Math.abs(landOwnerShare + developerShare - 100) > 0.01) {
      issues.push({
        Module: '8. Land Owner Management',
        Severity: 'HIGH',
        "Record ID": jva.id,
        "Root Cause": `Joint Venture Agreement '${jva.id}' share ratio is invalid: Land Owner (${landOwnerShare}%) + Developer (${developerShare}%) != 100%.`,
        "Recommended Fix": `Enforce 100% total sum validation on JVA revenue / unit share allocation fields.`
      });
    }
  });

  // =========================================================================
  // 11 & 12. CONSTRUCTION BOQ & PROCUREMENT AUDIT
  // =========================================================================
  purchaseOrders.forEach(po => {
    if (po.totalAmountBdt && po.totalAmountBdt < 0) {
      issues.push({
        Module: '12. Procurement',
        Severity: 'HIGH',
        "Record ID": po.id,
        "Root Cause": `Purchase order '${po.id}' has negative order total: BDT ${po.totalAmountBdt}.`,
        "Recommended Fix": `Reject negative procurement line items and order totals.`
      });
    }
  });

  // =========================================================================
  // 13. HR & PAYROLL AUDIT
  // =========================================================================
  employees.forEach(emp => {
    if (emp.basicSalaryBdt !== undefined) {
      const basic = emp.basicSalaryBdt || 0;
      const houseRent = emp.houseRentBdt || 0;
      const medical = emp.medicalAllowanceBdt || 0;
      const conveyance = emp.conveyanceAllowanceBdt || 0;
      const deductions = emp.providentFundDeductionBdt || 0;
      const calculatedGross = basic + houseRent + medical + conveyance - deductions;
      const storedGross = emp.grossSalaryBdt;

      if (storedGross !== undefined && Math.abs(storedGross - calculatedGross) > 1.0) {
        issues.push({
          Module: '13. HR & Payroll',
          Severity: 'LOW',
          "Record ID": emp.id,
          "Root Cause": `Employee '${emp.id}' stored gross salary (BDT ${storedGross}) differs from calculated salary components sum (BDT ${calculatedGross}).`,
          "Recommended Fix": `Dynamically compute gross salary from breakdown allowances and deductions.`
        });
      }
    }
  });

  // =========================================================================
  // SCORE & STATUS CALCULATION
  // =========================================================================
  const criticalCount = issues.filter(i => i.Severity === 'CRITICAL').length;
  const highCount = issues.filter(i => i.Severity === 'HIGH').length;
  const mediumCount = issues.filter(i => i.Severity === 'MEDIUM').length;
  const lowCount = issues.filter(i => i.Severity === 'LOW').length;

  // 100 base score
  const penalty = (criticalCount * 20) + (highCount * 10) + (mediumCount * 5) + (lowCount * 2);
  const rawScore = 100 - penalty;
  const businessLogicScore = Math.max(0, Math.min(100, rawScore));

  let auditStatus: 'PASS' | 'WARNING' | 'FAIL' = 'PASS';
  if (criticalCount > 0 || businessLogicScore < 70) {
    auditStatus = 'FAIL';
  } else if (highCount > 0 || mediumCount > 0 || businessLogicScore < 90) {
    auditStatus = 'WARNING';
  }

  // Calculate scores per module
  const moduleScores: Record<string, number> = {};
  modules.forEach(mod => {
    const modIssues = issues.filter(i => i.Module === mod);
    const modCrit = modIssues.filter(i => i.Severity === 'CRITICAL').length;
    const modHigh = modIssues.filter(i => i.Severity === 'HIGH').length;
    const modMed = modIssues.filter(i => i.Severity === 'MEDIUM').length;
    const modScore = Math.max(0, 100 - (modCrit * 30 + modHigh * 15 + modMed * 5));
    moduleScores[mod] = modScore;
  });

  const report: BusinessLogicAuditReport = {
    timestamp: new Date().toISOString(),
    auditTitle: 'AL KASWA HOLDINGS ERP - ENTERPRISE BUSINESS LOGIC AUDIT REPORT',
    business_logic_score: businessLogicScore,
    audit_status: auditStatus,
    modules_audited: modules,
    summary: {
      total_records_audited: totalRecordsAudited,
      critical_findings_count: criticalCount,
      high_findings_count: highCount,
      medium_findings_count: mediumCount,
      low_findings_count: lowCount,
      pass_modules_count: Object.values(moduleScores).filter(s => s === 100).length
    },
    critical_findings: issues.filter(i => i.Severity === 'CRITICAL' || i.Severity === 'HIGH'),
    all_issues: issues,
    module_scores: moduleScores,
    recommended_fixes: [
      "1. Sales & Booking: Implement database-level UNIQUE constraints on active unit bookings.",
      "2. Customer & Payment: Enforce real-time payment cap validation against agreed booking prices.",
      "3. Inventory: Automate unit status transition to 'Available' upon booking cancellation.",
      "4. Accounting & Ledger: Enforce double-entry debit-credit balancing middleware prior to voucher posting.",
      "5. Investor Management: Synchronize portfolio capital balances dynamically with investment transactions.",
      "6. Land Owner Management: Validate JVA revenue/unit allocation shares sum strictly to 100%."
    ]
  };

  try {
    fs.writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write business_logic_audit_report.json:', err);
  }

  return report;
}
