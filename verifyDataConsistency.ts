import fs from "fs";
import path from "path";
import { readJsonFile } from "./dbClient.ts";

const BACKUPS_ROOT = path.join(process.cwd(), "backups");
const REPORT_FILE = path.join(BACKUPS_ROOT, "data_consistency_report.json");

export interface ConsistencyIssue {
  module: string;
  id: string;
  message: string;
}

export interface DataConsistencyReport {
  duplicates: ConsistencyIssue[];
  orphans: ConsistencyIssue[];
  financial_mismatches: ConsistencyIssue[];
  audit_gaps: ConsistencyIssue[];
  status: "PASS" | "WARNING" | "FAIL";
  certificationStatus: "VERIFIED" | "WARNING" | "FAIL";
  consistencyScore: number;
  lastVerificationTime: string;
  metrics: {
    duplicateCount: number;
    orphanCount: number;
    financialMismatchCount: number;
    auditGapCount: number;
    totalIssues: number;
  };
}

// Ensure backups directory exists
function ensureDirectories() {
  if (!fs.existsSync(BACKUPS_ROOT)) {
    fs.mkdirSync(BACKUPS_ROOT, { recursive: true });
  }
}

export async function runDataConsistencyAudit(): Promise<DataConsistencyReport> {
  ensureDirectories();

  // 1. Load data from fallback JSON databases
  const customers = readJsonFile<any[]>("salesCustomersDb.json", []);
  const projects = readJsonFile<any[]>("erp_projects.json", []);
  const flats = readJsonFile<any[]>("bookingUnitsDb.json", []);
  const bookings = readJsonFile<any[]>("salesBookingsDb.json", []);
  const payments = readJsonFile<any[]>("salesPaymentsDb.json", []);
  const investors = readJsonFile<any[]>("investor_profiles.json", []);
  const investorTransactions = readJsonFile<any[]>("investment_transactions.json", []);
  const landowners = readJsonFile<any[]>("phase4_land_owners.json", []);
  const landownerTransactions = readJsonFile<any[]>("phase4_land_transactions.json", []);
  const leads = readJsonFile<any[]>("leadsDb.json", []);
  const users = readJsonFile<any[]>("usersDb.json", []);
  const auditLogs = readJsonFile<any[]>("auditLogsDb.json", []);

  const duplicates: ConsistencyIssue[] = [];
  const orphans: ConsistencyIssue[] = [];
  const financial_mismatches: ConsistencyIssue[] = [];
  const audit_gaps: ConsistencyIssue[] = [];

  // --------------------------------------------------------------------------
  // Rule 1: Duplicate Detection
  // --------------------------------------------------------------------------
  
  // Find duplicate customer ids
  const customerIdsSeen = new Set<string>();
  const customerIdsDuplicated = new Set<string>();
  customers.forEach(c => {
    if (c.id) {
      if (customerIdsSeen.has(c.id)) {
        customerIdsDuplicated.add(c.id);
      } else {
        customerIdsSeen.add(c.id);
      }
    }
  });
  customerIdsDuplicated.forEach(id => {
    duplicates.push({
      module: "Customers",
      id,
      message: `Duplicate Customer ID '${id}' detected.`
    });
  });

  // Find duplicate booking ids
  const bookingIdsSeen = new Set<string>();
  const bookingIdsDuplicated = new Set<string>();
  bookings.forEach(b => {
    if (b.id) {
      if (bookingIdsSeen.has(b.id)) {
        bookingIdsDuplicated.add(b.id);
      } else {
        bookingIdsSeen.add(b.id);
      }
    }
  });
  bookingIdsDuplicated.forEach(id => {
    duplicates.push({
      module: "Bookings",
      id,
      message: `Duplicate Booking ID '${id}' detected.`
    });
  });

  // Find duplicate payment ids
  const paymentIdsSeen = new Set<string>();
  const paymentIdsDuplicated = new Set<string>();
  payments.forEach(p => {
    if (p.id) {
      if (paymentIdsSeen.has(p.id)) {
        paymentIdsDuplicated.add(p.id);
      } else {
        paymentIdsSeen.add(p.id);
      }
    }
  });
  paymentIdsDuplicated.forEach(id => {
    duplicates.push({
      module: "Payments",
      id,
      message: `Duplicate Payment ID '${id}' detected.`
    });
  });

  // --------------------------------------------------------------------------
  // Rule 2: Orphan Record Detection
  // --------------------------------------------------------------------------

  // payment without booking
  payments.forEach(p => {
    if (p.bookingId && !bookingIdsSeen.has(p.bookingId)) {
      orphans.push({
        module: "Payments",
        id: p.id,
        message: `Payment '${p.id}' references non-existent Booking '${p.bookingId}'.`
      });
    }
  });

  // booking without customer
  bookings.forEach(b => {
    if (b.customerId && !customerIdsSeen.has(b.customerId)) {
      orphans.push({
        module: "Bookings",
        id: b.id,
        message: `Booking '${b.id}' references non-existent Customer '${b.customerId}'.`
      });
    }
  });

  // flat assigned to non-existent project
  const projectIdsSeen = new Set<string>(projects.map(p => p.id).filter(Boolean));
  flats.forEach(f => {
    if (f.projectId && !projectIdsSeen.has(f.projectId)) {
      orphans.push({
        module: "Flats",
        id: f.id,
        message: `Flat '${f.id || f.unitName}' assigned to non-existent Project '${f.projectId}'.`
      });
    }
  });

  // investor transaction without investor
  const investorIdsSeen = new Set<string>();
  investors.forEach(inv => {
    if (inv.id) investorIdsSeen.add(inv.id);
    if (inv.investorId) investorIdsSeen.add(inv.investorId);
  });
  investorTransactions.forEach(tx => {
    if (tx.investorId && !investorIdsSeen.has(tx.investorId)) {
      orphans.push({
        module: "Investors",
        id: tx.id,
        message: `Investor Transaction '${tx.id}' references non-existent Investor '${tx.investorId}'.`
      });
    }
  });

  // landowner transaction without landowner
  const landownerIdsSeen = new Set<string>();
  landowners.forEach(lo => {
    if (lo.id) landownerIdsSeen.add(lo.id);
    if (lo.landOwnerId) landownerIdsSeen.add(lo.landOwnerId);
    if (lo.landownerId) landownerIdsSeen.add(lo.landownerId);
  });
  landownerTransactions.forEach(lt => {
    const ownerId = lt.landOwnerId || lt.landownerId || lt.ownerId;
    if (ownerId && !landownerIdsSeen.has(ownerId)) {
      orphans.push({
        module: "Landowners",
        id: lt.id,
        message: `Landowner Transaction '${lt.id}' references non-existent Landowner '${ownerId}'.`
      });
    }
  });

  // --------------------------------------------------------------------------
  // Rule 3: Financial Integrity
  // --------------------------------------------------------------------------

  bookings.forEach(b => {
    // Booking Amount
    const bookingAmount = b.totalPrice || b.totalAgreedPrice || 0;

    // Payments Received (Sum of Cleared payments)
    const bookingPayments = payments.filter(p => p.bookingId === b.id && (p.status === "Cleared" || p.status === "Paid"));
    const totalPaymentsReceived = bookingPayments.reduce((sum, p) => sum + (p.amount || p.amountBdt || 0), 0);

    // Outstanding Balance (calculated)
    const outstandingCalculated = bookingAmount - totalPaymentsReceived;

    // Stored Outstanding Balance (if present in booking object)
    const storedOutstanding = b.outstandingAmount !== undefined ? b.outstandingAmount : (b.outstanding !== undefined ? b.outstanding : (b.outstandingBalance !== undefined ? b.outstandingBalance : (b.dueAmount !== undefined ? b.dueAmount : null)));

    if (storedOutstanding !== null && storedOutstanding !== outstandingCalculated) {
      financial_mismatches.push({
        module: "Bookings",
        id: b.id,
        message: `Booking '${b.id}' financial mismatch: Stored outstanding (${storedOutstanding}) does not match calculated outstanding (${outstandingCalculated}) [Total Price: ${bookingAmount}, Payments Received: ${totalPaymentsReceived}].`
      });
    }
  });

  // Verify Investor Financial Integrity
  investors.forEach(inv => {
    const storedTotalInvested = inv.totalInvestedAmount || 0;
    const invId = inv.investorId || inv.id;
    const invTxInflows = investorTransactions.filter(tx => tx.investorId === invId && (tx.type === "Capital Inflow" || tx.type === "Investment"));
    const calculatedTotalInvested = invTxInflows.reduce((sum, tx) => sum + (tx.amountBdt || tx.amount || 0), 0);

    if (storedTotalInvested > 0 && calculatedTotalInvested > 0 && storedTotalInvested !== calculatedTotalInvested) {
      financial_mismatches.push({
        module: "Investors",
        id: inv.id,
        message: `Investor '${inv.nameEn || inv.id}' financial mismatch: Stored total investment (${storedTotalInvested}) does not match sum of transaction inflows (${calculatedTotalInvested}).`
      });
    }
  });

  // --------------------------------------------------------------------------
  // Rule 4: Audit Log Integrity
  // --------------------------------------------------------------------------

  // Helper to check if any audit log contains reference to record ID or module action
  const auditLogsText = auditLogs.map(log => JSON.stringify(log).toLowerCase()).join(" ");

  const checkAuditGap = (module: string, record: any) => {
    const id = record.id;
    if (!id) return;
    const idLower = id.toLowerCase();
    
    // Check if the record ID appears anywhere in the audit logs
    const hasAuditCoverage = auditLogsText.includes(idLower);
    if (!hasAuditCoverage) {
      audit_gaps.push({
        module,
        id,
        message: `Audit gap detected: No audit log coverage found for ${module} record '${id}'.`
      });
    }
  };

  // Check audit log coverage for samples in each module
  customers.forEach(c => checkAuditGap("Customers", c));
  projects.forEach(p => checkAuditGap("Projects", p));
  flats.forEach(f => checkAuditGap("Flats", f));
  bookings.forEach(b => checkAuditGap("Bookings", b));
  payments.forEach(p => checkAuditGap("Payments", p));
  investors.forEach(inv => checkAuditGap("Investors", inv));
  landowners.forEach(lo => checkAuditGap("Landowners", lo));
  leads.forEach(l => checkAuditGap("Leads", l));
  users.forEach(u => checkAuditGap("Users", u));

  // --------------------------------------------------------------------------
  // Certification & Score Computation
  // --------------------------------------------------------------------------

  const totalIssues = duplicates.length + orphans.length + financial_mismatches.length + audit_gaps.length;

  // Rule 8: Certification Rules
  // VERIFIED = No issues
  // WARNING = Less than 5 issues
  // FAIL = 5 or more issues
  let certificationStatus: "VERIFIED" | "WARNING" | "FAIL" = "FAIL";
  let status: "PASS" | "WARNING" | "FAIL" = "FAIL";

  if (totalIssues === 0) {
    certificationStatus = "VERIFIED";
    status = "PASS";
  } else if (totalIssues < 5) {
    certificationStatus = "WARNING";
    status = "WARNING";
  } else {
    certificationStatus = "FAIL";
    status = "FAIL";
  }

  // Calculate standard Consistency Score
  // Max score is 100%, each issue deducts from score
  const baseScore = 100 - (duplicates.length * 5) - (orphans.length * 8) - (financial_mismatches.length * 10) - (audit_gaps.length * 2);
  const consistencyScore = Math.max(0, Math.min(100, baseScore));

  const report: DataConsistencyReport = {
    duplicates,
    orphans,
    financial_mismatches,
    audit_gaps,
    status,
    certificationStatus,
    consistencyScore,
    lastVerificationTime: new Date().toISOString(),
    metrics: {
      duplicateCount: duplicates.length,
      orphanCount: orphans.length,
      financialMismatchCount: financial_mismatches.length,
      auditGapCount: audit_gaps.length,
      totalIssues
    }
  };

  // Save the integrity report
  fs.writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2), "utf-8");

  return report;
}
