import { Router } from 'express';
import { AuthenticatedRequest, logSecurityEvent } from './rbacEngine';
import pg from 'pg';

const { Pool } = pg;

// ============================================================================
// DATABASE CONNECTION POOL SETUP
// ============================================================================
const pool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL })
  : null;

// ============================================================================
// PHASE 30 - DEDICATED DOUBLE ENTRY ACCOUNTING ENGINE (PostgreSQL-Backed Model)
// ============================================================================

export interface COAAccount {
  id: string;
  companyId: string;
  code: string;
  nameEn: string;
  nameBn: string;
  type: 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';
  subType: string;
  isCashBank: boolean;
  isActive: boolean;
  isDeleted: boolean;
}

export interface TransactionLine {
  accountCode: string;
  debit: number;
  credit: number;
  narrationEn?: string;
  narrationBn?: string;
  referenceId?: string; // Links to customerId, supplierId, investorId etc.
  referenceType?: 'Customer' | 'Supplier' | 'Investor' | 'Project';
}

export interface Voucher {
  id: string; // e.g. JV-2026-001
  companyId: string;
  branchId: string;
  date: string; // YYYY-MM-DD
  type: 'JV' | 'CP' | 'CR' | 'BP' | 'BR' | 'CV' | 'AV'; // Journal, Cash Payment, Cash Receipt, Bank Payment, Bank Receipt, Contra, Adjustment
  narrationEn: string;
  narrationBn: string;
  lines: TransactionLine[];
  refNo?: string;
  postedBy: string; // user ID
  isPosted: boolean;
  isLocked: boolean; // fiscal year lock
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FiscalYear {
  id: string;
  companyId: string;
  yearName: string;
  startDate: string;
  endDate: string;
  status: 'Open' | 'Closed' | 'Locked';
}

export interface BankAccount {
  id: string;
  companyId: string;
  branchId: string;
  bankName: string;
  accountNo: string;
  accountTitle: string;
  chartOfAccountCode: string;
  isActive: boolean;
}

export interface CashAccount {
  id: string;
  companyId: string;
  branchId: string;
  cashBookName: string;
  cashCustodianName: string;
  chartOfAccountCode: string;
  isActive: boolean;
}

export interface Budget {
  id: string;
  companyId: string;
  projectId?: string;
  budgetCode: string;
  title: string;
  totalAmount: number;
  fiscalYearId: string;
  lines: {
    chartOfAccountCode: string;
    allocatedAmount: number;
    utilizedAmount: number;
  }[];
  status: 'Draft' | 'Approved' | 'Revised';
}

export interface TaxConfig {
  id: string;
  companyId: string;
  taxType: string;
  ratePercentage: number;
  chartOfAccountCode: string;
  isActive: boolean;
}

export interface VatConfig {
  id: string;
  companyId: string;
  vatCategory: string;
  ratePercentage: number;
  chartOfAccountCode: string;
  isActive: boolean;
}

export interface SubLedgerEntry {
  id: string;
  companyId: string;
  entityId: string; // customerId, supplierId or investorId
  entityType: 'Customer' | 'Supplier' | 'Investor';
  transactionDate: string;
  voucherId: string;
  debit: number;
  credit: number;
  balance: number;
  referenceNo?: string;
}

export interface FinanceAuditLog {
  id: string;
  companyId: string;
  branchId: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  tableName: string;
  recordId: string;
  projectId?: string;
  ipAddress: string;
  oldValue?: string;
  newValue?: string;
  timestamp: string;
}

// ============================================================================
// SEED DATA
// ============================================================================

export const coaDb: COAAccount[] = [
  // Assets
  { id: 'coa-1', companyId: 'c1', code: '1100', nameEn: 'Cash in Hand', nameBn: 'হাতে নগদ', type: 'Asset', subType: 'Current Asset', isCashBank: true, isActive: true, isDeleted: false },
  { id: 'coa-2', companyId: 'c1', code: '1210', nameEn: 'Sonali Bank A/C (102-459)', nameBn: 'সোনালী ব্যাংক এ/সি (১০২-৪৫৯)', type: 'Asset', subType: 'Current Asset', isCashBank: true, isActive: true, isDeleted: false },
  { id: 'coa-3', companyId: 'c1', code: '1220', nameEn: 'Dutch-Bangla Bank A/C (440-109)', nameBn: 'ডাচ-বাংলা ব্যাংক এ/সি (৪৪০-১০৯)', type: 'Asset', subType: 'Current Asset', isCashBank: true, isActive: true, isDeleted: false },
  { id: 'coa-4', companyId: 'c1', code: '1300', nameEn: 'Accounts Receivable (Customers)', nameBn: 'গ্রাহক দেনাদার', type: 'Asset', subType: 'Current Asset', isCashBank: false, isActive: true, isDeleted: false },
  { id: 'coa-5', companyId: 'c1', code: '1410', nameEn: 'Land Inventory', nameBn: 'জমি ইনভেন্টরি', type: 'Asset', subType: 'Fixed Asset', isCashBank: false, isActive: true, isDeleted: false },
  { id: 'coa-6', companyId: 'c1', code: '1420', nameEn: 'Construction WIP', nameBn: 'নির্মাণাধীন কাজ (WIP)', type: 'Asset', subType: 'Fixed Asset', isCashBank: false, isActive: true, isDeleted: false },
  { id: 'coa-7', companyId: 'c1', code: '1500', nameEn: 'Fixed Assets (Office Equipment)', nameBn: 'স্থায়ী সম্পদ (অফিস সরঞ্জাম)', type: 'Asset', subType: 'Fixed Asset', isCashBank: false, isActive: true, isDeleted: false },
  
  // Liabilities
  { id: 'coa-8', companyId: 'c1', code: '2100', nameEn: 'Supplier Payables', nameBn: 'সরবরাহকারী পাওনাদার', type: 'Liability', subType: 'Current Liability', isCashBank: false, isActive: true, isDeleted: false },
  { id: 'coa-9', companyId: 'c1', code: '2200', nameEn: 'Customer Advances (Booking Money)', nameBn: 'গ্রাহক অগ্রিম (বুকিং মানি)', type: 'Liability', subType: 'Current Liability', isCashBank: false, isActive: true, isDeleted: false },
  { id: 'coa-10', companyId: 'c1', code: '2300', nameEn: 'Loans', nameBn: 'ঋণ ও দায়', type: 'Liability', subType: 'Long-term Liability', isCashBank: false, isActive: true, isDeleted: false },
  { id: 'coa-11', companyId: 'c1', code: '2400', nameEn: 'Investor Payables', nameBn: 'বিনিয়োগকারী প্রদেয় হিসাব', type: 'Liability', subType: 'Current Liability', isCashBank: false, isActive: true, isDeleted: false },
  
  // Equity
  { id: 'coa-12', companyId: 'c1', code: '3100', nameEn: 'Share Capital', nameBn: 'শেয়ার মূলধন', type: 'Equity', subType: 'Equity', isCashBank: false, isActive: true, isDeleted: false },
  { id: 'coa-13', companyId: 'c1', code: '3200', nameEn: 'Retained Earnings', nameBn: 'অর্জিত আয় (রিমেইনিং আর্নিংস)', type: 'Equity', subType: 'Equity', isCashBank: false, isActive: true, isDeleted: false },
  
  // Income / Revenue
  { id: 'coa-14', companyId: 'c1', code: '4100', nameEn: 'Flat Sales Revenue', nameBn: 'ফ্ল্যাট বিক্রয় রাজস্ব', type: 'Revenue', subType: 'Operating Income', isCashBank: false, isActive: true, isDeleted: false },
  { id: 'coa-15', companyId: 'c1', code: '4200', nameEn: 'Plot Sales Revenue', nameBn: 'জমির প্লট বুকিং রাজস্ব', type: 'Revenue', subType: 'Operating Income', isCashBank: false, isActive: true, isDeleted: false },
  { id: 'coa-16', companyId: 'c1', code: '4300', nameEn: 'Service Charges Income', nameBn: 'সার্ভিস চার্জ আয়', type: 'Revenue', subType: 'Operating Income', isCashBank: false, isActive: true, isDeleted: false },
  { id: 'coa-17', companyId: 'c1', code: '4400', nameEn: 'Rental Income', nameBn: 'ভাড়া সংক্রান্ত আয়', type: 'Revenue', subType: 'Non-operating Income', isCashBank: false, isActive: true, isDeleted: false },
  
  // Expenses
  { id: 'coa-18', companyId: 'c1', code: '5100', nameEn: 'Construction Cost', nameBn: 'নির্মাণ সামগ্রী ও কাজের খরচ', type: 'Expense', subType: 'Direct Expense', isCashBank: false, isActive: true, isDeleted: false },
  { id: 'coa-19', companyId: 'c1', code: '5200', nameEn: 'Salary Expense', nameBn: 'বেতন ও ভাতা খরচ', type: 'Expense', subType: 'Operating Expense', isCashBank: false, isActive: true, isDeleted: false },
  { id: 'coa-20', companyId: 'c1', code: '5300', nameEn: 'Land Acquisition Cost', nameBn: 'জমি অধিগ্রহণ ক্রয় মূল্য', type: 'Expense', subType: 'Direct Expense', isCashBank: false, isActive: true, isDeleted: false },
  { id: 'coa-21', companyId: 'c1', code: '5400', nameEn: 'Legal Expense', nameBn: 'আইনি ও রাজউক অনুমোদন ফি', type: 'Expense', subType: 'Operating Expense', isCashBank: false, isActive: true, isDeleted: false },
  { id: 'coa-22', companyId: 'c1', code: '5500', nameEn: 'Utility Expense', nameBn: 'প্রশাসনিক ইউটিলিটি বিল', type: 'Expense', subType: 'Operating Expense', isCashBank: false, isActive: true, isDeleted: false },
  { id: 'coa-23', companyId: 'c1', code: '5600', nameEn: 'Marketing Expense', nameBn: 'বিজ্ঞাপন ও বিপণন ব্যয়', type: 'Expense', subType: 'Operating Expense', isCashBank: false, isActive: true, isDeleted: false },
  { id: 'coa-24', companyId: 'c1', code: '5700', nameEn: 'Administrative Expense', nameBn: 'প্রশাসনিক ও office খরচ', type: 'Expense', subType: 'Operating Expense', isCashBank: false, isActive: true, isDeleted: false },
];

export const vouchersDb: Voucher[] = [
  {
    id: 'BKG-BR-2026-001',
    companyId: 'c1',
    branchId: 'b1',
    date: '2026-05-10',
    type: 'BR',
    narrationEn: 'Initial share capital paid-up by founders deposited in Sonali Bank.',
    narrationBn: 'উদ্যোক্তাদের প্রাথমিক পরিশোধিত শেয়ার মূলধন সোনালী ব্যাংকে জমা করা হলো।',
    refNo: 'DEP-77192',
    postedBy: 'u-act',
    isPosted: true,
    isLocked: false,
    isDeleted: false,
    createdAt: '2026-05-10T08:00:00Z',
    updatedAt: '2026-05-10T08:00:00Z',
    lines: [
      { accountCode: '1210', debit: 15000000, credit: 0 },
      { accountCode: '3100', debit: 0, credit: 15000000 }
    ]
  },
  {
    id: 'BKG-BP-2026-001',
    companyId: 'c1',
    branchId: 'b1',
    date: '2026-05-15',
    type: 'BP',
    narrationEn: 'Payment made from Sonali Bank for primary land parcel acquisition.',
    narrationBn: 'প্রাথমিক জমি অধিগ্রহণের উদ্দেশ্যে সোনালী ব্যাংক থেকে পেমেন্ট প্রদান করা হলো।',
    refNo: 'CHQ-99120',
    postedBy: 'u-act',
    isPosted: true,
    isLocked: false,
    isDeleted: false,
    createdAt: '2026-05-15T10:00:00Z',
    updatedAt: '2026-05-15T10:00:00Z',
    lines: [
      { accountCode: '1410', debit: 4000000, credit: 0 },
      { accountCode: '1210', debit: 0, credit: 4000000 }
    ]
  },
  {
    id: 'BKG-BP-2026-002',
    companyId: 'c1',
    branchId: 'b1',
    date: '2026-05-18',
    type: 'BP',
    narrationEn: 'Transferred cash from Sonali Bank to Cash in Hand desk.',
    narrationBn: 'সোনালী ব্যাংক থেকে নগদ অর্থ হাতে নগদ ডেস্কে স্থানান্তর করা হলো।',
    refNo: 'WTH-45100',
    postedBy: 'u-act',
    isPosted: true,
    isLocked: false,
    isDeleted: false,
    createdAt: '2026-05-18T11:00:00Z',
    updatedAt: '2026-05-18T11:00:00Z',
    lines: [
      { accountCode: '1100', debit: 500000, credit: 0 },
      { accountCode: '1210', debit: 0, credit: 500000 }
    ]
  }
];

export const fiscalYearsDb: FiscalYear[] = [
  { id: 'fy-1', companyId: 'c1', yearName: 'FY 2025-26', startDate: '2025-07-01', endDate: '2026-06-30', status: 'Open' },
  { id: 'fy-2', companyId: 'c1', yearName: 'FY 2026-27', startDate: '2026-07-01', endDate: '2027-06-30', status: 'Open' }
];

export const bankAccountsDb: BankAccount[] = [
  { id: 'bank-1', companyId: 'c1', branchId: 'b1', bankName: 'Sonali Bank PLC', accountNo: '102-459-2937', accountTitle: 'Al Kaswa Holdings Treasury', chartOfAccountCode: '1210', isActive: true },
  { id: 'bank-2', companyId: 'c1', branchId: 'b1', bankName: 'Dutch-Bangla Bank PLC', accountNo: '440-109-8812', accountTitle: 'Al Kaswa Sales Operations', chartOfAccountCode: '1220', isActive: true }
];

export const cashAccountsDb: CashAccount[] = [
  { id: 'cash-1', companyId: 'c1', branchId: 'b1', cashBookName: 'Main Corporate Cash Vault', cashCustodianName: 'Sohail Tanvir', chartOfAccountCode: '1100', isActive: true }
];

export const costCentersDb: { id: string; companyId: string; nameEn: string; nameBn: string; code: string }[] = [
  { id: 'cc-1', companyId: 'c1', nameEn: 'Uttara Skyline Phase 1', nameBn: 'উত্তরা স্কাইলাইন ফেজ ১', code: 'CC-US-01' },
  { id: 'cc-2', companyId: 'c1', nameEn: 'Purbachal Green City Plotting', nameBn: 'পূর্বাচল গ্রীন সিটি প্লটিং', code: 'CC-PGC-02' }
];

export const budgetsDb: Budget[] = [
  {
    id: 'bgt-1',
    companyId: 'c1',
    budgetCode: 'BGT-2026-US1',
    title: 'Uttara Skyline Civil Construction Budget',
    totalAmount: 120000000,
    fiscalYearId: 'fy-2',
    status: 'Approved',
    lines: [
      { chartOfAccountCode: '5100', allocatedAmount: 80000000, utilizedAmount: 43200000 },
      { chartOfAccountCode: '5300', allocatedAmount: 30000000, utilizedAmount: 30000000 },
      { chartOfAccountCode: '5200', allocatedAmount: 10000000, utilizedAmount: 4500000 }
    ]
  }
];

export const taxConfigDb: TaxConfig[] = [
  { id: 'tax-1', companyId: 'c1', taxType: 'AIT Plot Sales Source Tax', ratePercentage: 5.0, chartOfAccountCode: '2100', isActive: true },
  { id: 'tax-2', companyId: 'c1', taxType: 'Withholding Employee Tax', ratePercentage: 10.0, chartOfAccountCode: '2100', isActive: true }
];

export const vatConfigDb: VatConfig[] = [
  { id: 'vat-1', companyId: 'c1', vatCategory: 'Construction Materials Standard VAT', ratePercentage: 15.0, chartOfAccountCode: '5100', isActive: true },
  { id: 'vat-2', companyId: 'c1', vatCategory: 'Real Estate Developer Flat Sale VAT', ratePercentage: 2.0, chartOfAccountCode: '2100', isActive: true }
];

export const customerLedgerDb: SubLedgerEntry[] = [
  { id: 'cl-1', companyId: 'c1', entityId: 'cst-usr-1', entityType: 'Customer', transactionDate: '2026-05-15', voucherId: 'BKG-BR-2026-001', debit: 0, credit: 500000, balance: -500000, referenceNo: 'MR-2026-0001' }
];

export const supplierLedgerDb: SubLedgerEntry[] = [];
export const investorLedgerDb: SubLedgerEntry[] = [];
export const financeAuditLogsDb: FinanceAuditLog[] = [];

// ============================================================================
// STARTUP POSTGRES DUAL-SYNC LAYER
// ============================================================================
async function syncDatabaseState() {
  if (!pool) return;
  try {
    // 1. Sync Chart of Accounts
    const coaRes = await pool.query('SELECT * FROM chart_of_accounts WHERE is_deleted = FALSE');
    if (coaRes.rows.length > 0) {
      coaDb.length = 0;
      coaRes.rows.forEach(r => {
        coaDb.push({
          id: r.id,
          companyId: r.company_id || 'c1',
          code: r.account_code,
          nameEn: r.name_en,
          nameBn: r.name_bn || r.name_en,
          type: r.account_type as any,
          subType: r.sub_type || 'Current',
          isCashBank: !!r.is_cash_bank,
          isActive: !!r.is_active,
          isDeleted: false
        });
      });
    } else {
      for (const item of coaDb) {
        await pool.query(
          `INSERT INTO chart_of_accounts (id, company_id, account_code, name_en, name_bn, account_type, sub_type, is_cash_bank, is_active)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT DO NOTHING`,
          [item.id, item.companyId, item.code, item.nameEn, item.nameBn, item.type, item.subType, item.isCashBank, item.isActive]
        );
      }
    }

    // 2. Sync Fiscal Years
    const fyRes = await pool.query('SELECT * FROM fiscal_years');
    if (fyRes.rows.length > 0) {
      fiscalYearsDb.length = 0;
      fyRes.rows.forEach(r => {
        fiscalYearsDb.push({
          id: r.id,
          companyId: r.company_id || 'c1',
          yearName: r.year_name,
          startDate: r.start_date instanceof Date ? r.start_date.toISOString().split('T')[0] : String(r.start_date),
          endDate: r.end_date instanceof Date ? r.end_date.toISOString().split('T')[0] : String(r.end_date),
          status: r.status as any
        });
      });
    } else {
      for (const item of fiscalYearsDb) {
        await pool.query(
          `INSERT INTO fiscal_years (id, company_id, year_name, start_date, end_date, status)
           VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT DO NOTHING`,
          [item.id, item.companyId, item.yearName, item.startDate, item.endDate, item.status]
        );
      }
    }

    // 3. Sync Vouchers & Ledger Entries
    const vRes = await pool.query('SELECT * FROM journal_vouchers WHERE is_deleted = FALSE');
    if (vRes.rows.length > 0) {
      vouchersDb.length = 0;
      for (const vRow of vRes.rows) {
        const linesRes = await pool.query('SELECT * FROM ledger_entries WHERE voucher_id = $1', [vRow.id]);
        vouchersDb.push({
          id: vRow.id,
          companyId: vRow.company_id,
          branchId: vRow.branch_id || 'b1',
          date: vRow.voucher_date instanceof Date ? vRow.voucher_date.toISOString().split('T')[0] : String(vRow.voucher_date),
          type: vRow.voucher_type as any,
          narrationEn: vRow.description_en,
          narrationBn: vRow.description_bn || vRow.description_en,
          postedBy: vRow.posted_by,
          isPosted: !!vRow.is_posted,
          isLocked: !!vRow.is_locked,
          isDeleted: false,
          createdAt: vRow.created_at,
          updatedAt: vRow.updated_at,
          lines: linesRes.rows.map(line => ({
            accountCode: line.account_code,
            debit: Number(line.debit || 0),
            credit: Number(line.credit || 0),
            narrationEn: line.description_en,
            narrationBn: line.description_bn || line.description_en,
            referenceId: line.reference_id,
            referenceType: line.reference_type as any
          }))
        });
      }
    } else {
      for (const item of vouchersDb) {
        await pool.query(
          `INSERT INTO journal_vouchers (id, company_id, branch_id, voucher_date, voucher_type, description_en, description_bn, posted_by, is_posted)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT DO NOTHING`,
          [item.id, item.companyId, item.branchId, item.date, item.type, item.narrationEn, item.narrationBn, item.postedBy, item.isPosted]
        );
        for (const line of item.lines) {
          await pool.query(
            `INSERT INTO ledger_entries (id, company_id, voucher_id, account_code, debit, credit, description_en, reference_id, reference_type)
             VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT DO NOTHING`,
            [item.companyId, item.id, line.accountCode, line.debit, line.credit, line.narrationEn || item.narrationEn, line.referenceId || null, line.referenceType || null]
          );
        }
      }
    }
    console.log('Finance PostgreSQL database synchronized successfully.');
  } catch (err) {
    console.error('Error in startup PostgreSQL state sync:', err);
  }
}
setTimeout(syncDatabaseState, 1500);

// ============================================================================
// DOUBLE-ENTRY TRANSACTION-SAFE POSTING ENGINE
// ============================================================================

const financeLock = new Set<string>();

export async function postDoubleEntryJournal(
  voucherData: Omit<Voucher, 'id' | 'createdAt' | 'updatedAt' | 'isPosted' | 'isLocked' | 'isDeleted'>,
  req: AuthenticatedRequest
): Promise<{ success: boolean; voucher?: Voucher; error?: string }> {
  const { companyId, date, type, lines, narrationEn } = voucherData;
  const ipAddress = (req.ip || req.socket.remoteAddress || '127.0.0.1').replace('::ffff:', '');

  // Concurrency lock on company financial transactions
  const lockKey = `${companyId}-${date}`;
  if (financeLock.has(lockKey)) {
    return { success: false, error: 'Database is locking concurrent writes for the chosen posting date. Retry in a moment.' };
  }

  financeLock.add(lockKey);

  try {
    // 1. Fiscal Period Validation
    const fy = fiscalYearsDb.find(y => y.companyId === companyId && date >= y.startDate && date <= y.endDate);
    if (fy && (fy.status === 'Closed' || fy.status === 'Locked')) {
      return { success: false, error: `Fiscal Year Violation: The target date falls inside a ${fy.status} fiscal period (${fy.yearName}).` };
    }

    // 2. Strict Double-Entry Check
    let totalDebit = 0;
    let totalCredit = 0;

    for (const line of lines) {
      if (line.debit < 0 || line.credit < 0) {
        return { success: false, error: 'Accounting Violation: Debit and Credit values must be positive numbers.' };
      }
      if (line.debit > 0 && line.credit > 0) {
        return { success: false, error: 'Accounting Violation: Individual ledger lines cannot contain both debit and credit entries.' };
      }
      if (line.debit === 0 && line.credit === 0) {
        return { success: false, error: 'Accounting Violation: Empty ledger lines are not allowed.' };
      }

      // Verify chart of account code exists and is active
      const accountExists = coaDb.some(acc => acc.code === line.accountCode && acc.companyId === companyId && acc.isActive && !acc.isDeleted);
      if (!accountExists) {
        return { success: false, error: `Chart of Accounts Error: Account code [${line.accountCode}] is unregistered or inactive.` };
      }

      totalDebit += line.debit;
      totalCredit += line.credit;
    }

    // Floating-point correction
    totalDebit = Math.round(totalDebit * 100) / 100;
    totalCredit = Math.round(totalCredit * 100) / 100;

    // Strict validation: IF total_debit != total_credit -> ROLLBACK
    if (totalDebit !== totalCredit) {
      return {
        success: false,
        error: `Double Entry Balancing Error: Total Debit (৳${totalDebit}) must EXACTLY equal Total Credit (৳${totalCredit}). Transaction rolled back.`
      };
    }

    if (totalDebit <= 0) {
      return { success: false, error: 'Double Entry Balancing Error: Transaction amount must be positive and greater than zero.' };
    }

    // 3. Duplicate Voucher Prevention
    const voucherNo = `${type}-${new Date(date).getFullYear()}-00${vouchersDb.filter(v => v.type === type && v.companyId === companyId).length + 1}`;
    const duplicateVoucher = vouchersDb.some(v => v.id === voucherNo && v.companyId === companyId && !v.isDeleted);
    if (duplicateVoucher) {
      return { success: false, error: `Integrity Violation: Voucher number [${voucherNo}] is already registered in the system.` };
    }

    // 4. PostgreSQL Real-time Safe Double Entry Transaction
    const voucherId = voucherNo;
    if (pool) {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        await client.query(
          `INSERT INTO journal_vouchers (id, company_id, branch_id, voucher_date, voucher_type, description_en, description_bn, posted_by, is_posted)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [voucherId, companyId, voucherData.branchId, date, type, narrationEn, voucherData.narrationBn, req.user?.id || 'u-act', true]
        );
        for (const line of lines) {
          await client.query(
            `INSERT INTO ledger_entries (id, company_id, voucher_id, account_code, debit, credit, description_en, reference_id, reference_type)
             VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8)`,
            [companyId, voucherId, line.accountCode, line.debit, line.credit, line.narrationEn || narrationEn, line.referenceId || null, line.referenceType || null]
          );
        }
        await client.query('COMMIT');
      } catch (dbErr: any) {
        await client.query('ROLLBACK');
        console.error('PostgreSQL Double-Entry Transaction failed, rolling back:', dbErr);
        return { success: false, error: `Database Transaction Aborted: ${dbErr.message || 'Verification Error'}` };
      } finally {
        client.release();
      }
    }

    // 5. Create and post the voucher to local list
    const newVoucher: Voucher = {
      ...voucherData,
      id: voucherId,
      isPosted: true,
      isLocked: false,
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    vouchersDb.unshift(newVoucher);

    // 6. Cascade update specific sub-ledgers (Customer, Supplier, Investor)
    lines.forEach(line => {
      if (line.referenceId) {
        const entryId = `sub-ledg-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        if (line.referenceType === 'Customer') {
          const currentBal = customerLedgerDb
            .filter(e => e.entityId === line.referenceId)
            .reduce((sum, e) => sum + (e.debit - e.credit), 0);
          
          customerLedgerDb.push({
            id: entryId,
            companyId,
            entityId: line.referenceId,
            entityType: 'Customer',
            transactionDate: date,
            voucherId: voucherId,
            debit: line.debit,
            credit: line.credit,
            balance: currentBal + (line.debit - line.credit),
            referenceNo: voucherData.refNo
          });
        } else if (line.referenceType === 'Supplier') {
          const currentBal = supplierLedgerDb
            .filter(e => e.entityId === line.referenceId)
            .reduce((sum, e) => sum + (e.credit - e.debit), 0); // supplier has credit balance normally
          
          supplierLedgerDb.push({
            id: entryId,
            companyId,
            entityId: line.referenceId,
            entityType: 'Supplier',
            transactionDate: date,
            voucherId: voucherId,
            debit: line.debit,
            credit: line.credit,
            balance: currentBal + (line.credit - line.debit),
            referenceNo: voucherData.refNo
          });
        } else if (line.referenceType === 'Investor') {
          const currentBal = investorLedgerDb
            .filter(e => e.entityId === line.referenceId)
            .reduce((sum, e) => sum + (e.credit - e.debit), 0); // investor has credit balance
          
          investorLedgerDb.push({
            id: entryId,
            companyId,
            entityId: line.referenceId,
            entityType: 'Investor',
            transactionDate: date,
            voucherId: voucherId,
            debit: line.debit,
            credit: line.credit,
            balance: currentBal + (line.credit - line.debit),
            referenceNo: voucherData.refNo
          });
        }
      }
    });

    // 7. Log immutable audit trail records
    financeAuditLogsDb.push({
      id: `f-audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      companyId,
      branchId: voucherData.branchId,
      userId: req.user?.id || 'system',
      userName: req.user?.fullName || 'Financial Officer',
      userRole: req.user?.role || 'ACT',
      action: 'POST_JOURNAL_VOUCHER',
      tableName: 'journal_vouchers',
      recordId: voucherId,
      ipAddress,
      oldValue: undefined,
      newValue: JSON.stringify({ type, debit_total: totalDebit, credit_total: totalCredit, narrationEn }),
      timestamp: new Date().toISOString()
    });

    // 8. Fire enterprise security log
    logSecurityEvent(
      req.user?.id || 'system',
      req.user?.fullName || 'Accounts Manager',
      req.user?.role || 'ACT',
      companyId,
      voucherData.branchId,
      'APPROVAL',
      'finance',
      ipAddress,
      `Double-Entry Posted Balanced Voucher [${voucherId}] totaling BDT ${totalDebit}`,
      `দ্বি-তরফা দাখিলা সম্পন্ন ব্যালেন্সড ভাউচার [${voucherId}] মোট BDT ${totalDebit} পোস্টিং করা হয়েছে`
    );

    return { success: true, voucher: newVoucher };

  } finally {
    financeLock.delete(lockKey);
  }
}

// ============================================================================
// CONSOLIDATED REPORTING CALCULATORS
// ============================================================================

export function getAccountBalances(companyId: string) {
  const balances: Record<string, number> = {};
  
  // Initialize
  coaDb.filter(acc => acc.companyId === companyId && !acc.isDeleted).forEach(acc => {
    balances[acc.code] = 0;
  });

  // Calculate
  vouchersDb.filter(v => v.companyId === companyId && v.isPosted && !v.isDeleted).forEach(v => {
    v.lines.forEach(line => {
      const acc = coaDb.find(a => a.code === line.accountCode);
      if (!acc) return;
      
      const isDebitNormal = acc.type === 'Asset' || acc.type === 'Expense';
      if (isDebitNormal) {
        balances[line.accountCode] = (balances[line.accountCode] || 0) + (line.debit - line.credit);
      } else {
        balances[line.accountCode] = (balances[line.accountCode] || 0) + (line.credit - line.debit);
      }
    });
  });

  return balances;
}

// ============================================================================
// APIS ROUTER CONTROLLER FOR SECURE FINANCE OPERATIONS
// ============================================================================

export const financeRouter = Router();

// 1. GET /api/finance/accounts (Secure fetch with filtering and company isolation)
financeRouter.get('/accounts', (req, res) => {
  const compId = 'c1'; // Default isolated company
  const activeOnly = req.query.activeOnly === 'true';

  let list = coaDb.filter(acc => acc.companyId === compId && !acc.isDeleted);
  if (activeOnly) {
    list = list.filter(acc => acc.isActive);
  }

  // Calculate dynamic balances for trial-run
  const balances = getAccountBalances(compId);
  const data = list.map(acc => ({
    ...acc,
    balance: balances[acc.code] || 0
  }));

  res.json({ success: true, data });
});

// 2. POST /api/finance/accounts (Register New Chart of Accounts)
financeRouter.post('/accounts', async (req, res) => {
  const { code, nameEn, nameBn, type, subType, isCashBank } = req.body;

  if (!code || !nameEn || !type || !subType) {
    return res.status(400).json({ error: 'Missing core Chart of Account parameters.' });
  }

  const compId = 'c1';

  // Prevent duplicate code
  const exists = coaDb.some(acc => acc.companyId === compId && acc.code === code && !acc.isDeleted);
  if (exists) {
    return res.status(409).json({ error: `Account Code [${code}] already exists in Chart of Accounts.` });
  }

  const newAcc: COAAccount = {
    id: `coa-user-${Date.now()}`,
    companyId: compId,
    code,
    nameEn,
    nameBn: nameBn || nameEn,
    type,
    subType,
    isCashBank: !!isCashBank,
    isActive: true,
    isDeleted: false
  };

  if (pool) {
    try {
      await pool.query(
        `INSERT INTO chart_of_accounts (id, company_id, account_code, name_en, name_bn, account_type, sub_type, is_cash_bank, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [newAcc.id, newAcc.companyId, newAcc.code, newAcc.nameEn, newAcc.nameBn, newAcc.type, newAcc.subType, newAcc.isCashBank, newAcc.isActive]
      );
    } catch (err: any) {
      console.error('Error inserting COA into PostgreSQL:', err);
      return res.status(500).json({ error: `Database Save Failed: ${err.message}` });
    }
  }

  coaDb.push(newAcc);

  res.json({ success: true, message: 'Account registered successfully under financial ledger rules.', data: newAcc });
});

// 3. PUT /api/finance/accounts/:id (Modify Account Properties)
financeRouter.put('/accounts/:id', async (req, res) => {
  const { id } = req.params;
  const { nameEn, nameBn, subType, isActive } = req.body;

  const accIndex = coaDb.findIndex(a => a.id === id);
  if (accIndex === -1) {
    return res.status(404).json({ error: 'Chart of Account definition not found.' });
  }

  if (pool) {
    try {
      await pool.query(
        `UPDATE chart_of_accounts SET name_en = $1, name_bn = $2, sub_type = $3, is_active = $4 WHERE id = $5`,
        [nameEn || coaDb[accIndex].nameEn, nameBn || coaDb[accIndex].nameBn, subType || coaDb[accIndex].subType, isActive !== undefined ? !!isActive : coaDb[accIndex].isActive, id]
      );
    } catch (err: any) {
      console.error('Error updating COA in PostgreSQL:', err);
      return res.status(500).json({ error: `Database Update Failed: ${err.message}` });
    }
  }

  if (nameEn) coaDb[accIndex].nameEn = nameEn;
  if (nameBn) coaDb[accIndex].nameBn = nameBn;
  if (subType) coaDb[accIndex].subType = subType;
  if (isActive !== undefined) coaDb[accIndex].isActive = !!isActive;

  res.json({ success: true, message: 'Account definition modified and replicated across ledger registers.', data: coaDb[accIndex] });
});

// 4. GET /api/finance/journals (Fetch all custom journal vouchers)
financeRouter.get('/journals', (req, res) => {
  const compId = 'c1';
  const { search, type } = req.query;

  let list = vouchersDb.filter(v => v.companyId === compId && !v.isDeleted);

  if (type) {
    list = list.filter(v => v.type === type);
  }

  if (search) {
    const s = String(search).toLowerCase();
    list = list.filter(v => 
      v.id.toLowerCase().includes(s) || 
      v.narrationEn.toLowerCase().includes(s) || 
      (v.refNo && v.refNo.toLowerCase().includes(s))
    );
  }

  res.json({ success: true, data: list });
});

// 5. POST /api/finance/journals (Double Entry Journal Posting Controller)
financeRouter.post('/journals', async (req: AuthenticatedRequest, res) => {
  const { date, type, narrationEn, narrationBn, lines, refNo } = req.body;

  if (!date || !type || !lines || !Array.isArray(lines)) {
    return res.status(400).json({ error: 'Missing core Double-Entry Journal voucher parameters.' });
  }

  const compId = 'c1';
  const branchId = 'b1';

  const voucherPayload = {
    companyId: compId,
    branchId,
    date,
    type,
    narrationEn,
    narrationBn: narrationBn || narrationEn,
    lines,
    refNo,
    postedBy: req.user?.id || 'u-act'
  };

  const result = await postDoubleEntryJournal(voucherPayload, req);

  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  res.json({ success: true, message: 'Double-entry journal voucher successfully verified and committed to ledger.', data: result.voucher });
});

// 6. GET /api/finance/receipts (Secure receipts collection filter)
financeRouter.get('/receipts', (req, res) => {
  const compId = 'c1';
  // Return cash/bank receipts ('BR' or 'CR' or money_receipts triggers)
  const list = vouchersDb.filter(v => v.companyId === compId && ['BR', 'CR'].includes(v.type) && !v.isDeleted);
  res.json({ success: true, data: list });
});

// 7. POST /api/finance/receipts (Record cash/bank receipt double-entry)
financeRouter.post('/receipts', async (req: AuthenticatedRequest, res) => {
  const { date, cashBankCode, creditAccountCode, amount, narrationEn, refNo, referenceId, referenceType } = req.body;

  if (!date || !cashBankCode || !creditAccountCode || !amount) {
    return res.status(400).json({ error: 'Missing Cash/Bank receipt parameters.' });
  }

  const amt = Number(amount);
  const lines = [
    { accountCode: cashBankCode, debit: amt, credit: 0 },
    { accountCode: creditAccountCode, debit: 0, credit: amt, referenceId, referenceType }
  ];

  const voucherPayload = {
    companyId: 'c1',
    branchId: 'b1',
    date,
    type: cashBankCode === '1100' ? 'CR' as const : 'BR' as const,
    narrationEn,
    narrationBn: narrationEn,
    lines,
    refNo,
    postedBy: req.user?.id || 'u-act'
  };

  const result = await postDoubleEntryJournal(voucherPayload, req);
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  res.json({ success: true, message: 'Receipt Voucher posted successfully.', data: result.voucher });
});

// 8. GET /api/finance/payments (Secure payments collection filter)
financeRouter.get('/payments', (req, res) => {
  const compId = 'c1';
  const list = vouchersDb.filter(v => v.companyId === compId && ['BP', 'CP'].includes(v.type) && !v.isDeleted);
  res.json({ success: true, data: list });
});

// 9. POST /api/finance/payments (Record cash/bank payment double-entry)
financeRouter.post('/payments', async (req: AuthenticatedRequest, res) => {
  const { date, cashBankCode, debitAccountCode, amount, narrationEn, refNo, referenceId, referenceType } = req.body;

  if (!date || !cashBankCode || !debitAccountCode || !amount) {
    return res.status(400).json({ error: 'Missing Cash/Bank payment parameters.' });
  }

  const amt = Number(amount);
  const lines = [
    { accountCode: debitAccountCode, debit: amt, credit: 0, referenceId, referenceType },
    { accountCode: cashBankCode, debit: 0, credit: amt }
  ];

  const voucherPayload = {
    companyId: 'c1',
    branchId: 'b1',
    date,
    type: cashBankCode === '1100' ? 'CP' as const : 'BP' as const,
    narrationEn,
    narrationBn: narrationEn,
    lines,
    refNo,
    postedBy: req.user?.id || 'u-act'
  };

  const result = await postDoubleEntryJournal(voucherPayload, req);
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  res.json({ success: true, message: 'Payment Voucher posted successfully.', data: result.voucher });
});

// 10. GET /api/finance/ledger/:accountId (Compile general ledger running balance)
financeRouter.get('/ledger/:accountId', (req, res) => {
  const { accountId } = req.params; // accountCode is accepted
  const compId = 'c1';

  const acc = coaDb.find(a => a.code === accountId && a.companyId === compId);
  if (!acc) {
    return res.status(404).json({ error: 'Chart of Account not registered.' });
  }

  const isDebitNormal = acc.type === 'Asset' || acc.type === 'Expense';
  const list: any[] = [];
  let runningBal = 0;

  // Sort vouchers by date
  const sorted = [...vouchersDb]
    .filter(v => v.companyId === compId && v.isPosted && !v.isDeleted)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  sorted.forEach(v => {
    v.lines.forEach(line => {
      if (line.accountCode === accountId) {
        const change = isDebitNormal ? (line.debit - line.credit) : (line.credit - line.debit);
        runningBal += change;

        list.push({
          id: `${v.id}-${line.accountCode}`,
          voucherId: v.id,
          date: v.date,
          type: v.type,
          refNo: v.refNo,
          narrationEn: line.narrationEn || v.narrationEn,
          narrationBn: line.narrationBn || v.narrationBn,
          debit: line.debit,
          credit: line.credit,
          balance: runningBal
        });
      }
    });
  });

  res.json({
    success: true,
    data: {
      account: acc,
      opening: 0,
      closing: runningBal,
      ledger: list
    }
  });
});

// 11. GET /api/finance/trial-balance (Trial Balance Summary report)
financeRouter.get('/trial-balance', (req, res) => {
  const compId = 'c1';
  const balances = getAccountBalances(compId);
  
  const report = coaDb
    .filter(acc => acc.companyId === compId && !acc.isDeleted)
    .map(acc => {
      const bal = balances[acc.code] || 0;
      const isDebitNormal = acc.type === 'Asset' || acc.type === 'Expense';
      return {
        code: acc.code,
        nameEn: acc.nameEn,
        nameBn: acc.nameBn,
        type: acc.type,
        debit: isDebitNormal ? (bal > 0 ? bal : 0) : (bal < 0 ? Math.abs(bal) : 0),
        credit: !isDebitNormal ? (bal > 0 ? bal : 0) : (bal < 0 ? Math.abs(bal) : 0)
      };
    })
    .filter(row => row.debit > 0 || row.credit > 0);

  const totalDebit = report.reduce((sum, r) => sum + r.debit, 0);
  const totalCredit = report.reduce((sum, r) => sum + r.credit, 0);

  res.json({
    success: true,
    data: {
      report,
      totalDebit,
      totalCredit,
      balanced: Math.abs(totalDebit - totalCredit) < 0.01
    }
  });
});

// 12. GET /api/finance/balance-sheet (Balance Sheet generator)
financeRouter.get('/balance-sheet', (req, res) => {
  const compId = 'c1';
  const balances = getAccountBalances(compId);

  const assets: any[] = [];
  const liabilities: any[] = [];
  const equities: any[] = [];
  let totalAssets = 0;
  let totalLiabilities = 0;
  let totalEquity = 0;

  coaDb.filter(acc => acc.companyId === compId && !acc.isDeleted).forEach(acc => {
    const bal = balances[acc.code] || 0;
    if (bal === 0) return;

    const row = { code: acc.code, nameEn: acc.nameEn, nameBn: acc.nameBn, balance: bal };

    if (acc.type === 'Asset') {
      assets.push(row);
      totalAssets += bal;
    } else if (acc.type === 'Liability') {
      liabilities.push(row);
      totalLiabilities += bal;
    } else if (acc.type === 'Equity') {
      equities.push(row);
      totalEquity += bal;
    }
  });

  // Calculate Retained Earnings from operational net profits
  let totalRevenue = 0;
  let totalExpense = 0;
  coaDb.filter(acc => acc.companyId === compId && !acc.isDeleted).forEach(acc => {
    const bal = balances[acc.code] || 0;
    if (acc.type === 'Revenue') totalRevenue += bal;
    if (acc.type === 'Expense') totalExpense += bal;
  });
  const netProfit = totalRevenue - totalExpense;

  // Append Retained Earnings line dynamically if netProfit exists
  if (netProfit !== 0) {
    equities.push({ code: '3200-NET', nameEn: 'Accumulated Retained Earnings (Profit & Loss)', nameBn: 'অর্জিত আয় হিসাব খতিয়ান', balance: netProfit });
    totalEquity += netProfit;
  }

  res.json({
    success: true,
    data: {
      assets,
      liabilities,
      equities,
      totalAssets,
      totalLiabilities,
      totalEquity,
      balanced: Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.01
    }
  });
});

// 13. GET /api/finance/profit-loss (Revenue vs Expense report)
financeRouter.get('/profit-loss', (req, res) => {
  const compId = 'c1';
  const balances = getAccountBalances(compId);

  const revenues: any[] = [];
  const expenses: any[] = [];
  let totalRevenue = 0;
  let totalExpense = 0;

  coaDb.filter(acc => acc.companyId === compId && !acc.isDeleted).forEach(acc => {
    const bal = balances[acc.code] || 0;
    if (bal === 0) return;

    const row = { code: acc.code, nameEn: acc.nameEn, nameBn: acc.nameBn, amount: bal };

    if (acc.type === 'Revenue') {
      revenues.push(row);
      totalRevenue += bal;
    } else if (acc.type === 'Expense') {
      expenses.push(row);
      totalExpense += bal;
    }
  });

  res.json({
    success: true,
    data: {
      revenues,
      expenses,
      totalRevenue,
      totalExpense,
      netProfit: totalRevenue - totalExpense
    }
  });
});

// 14. GET /api/finance/cashflow (Inflows and Outflows statement)
financeRouter.get('/cashflow', (req, res) => {
  const compId = 'c1';
  
  // Calculate flows from Cash and Bank accounts
  let operatingInflow = 0;
  let operatingOutflow = 0;
  let investingFlow = 0;
  let financingFlow = 0;

  const inflows: any[] = [];
  const outflows: any[] = [];

  // Categorize double-entries hitting Cash or Bank (codes starting with 11 or 12)
  vouchersDb
    .filter(v => v.companyId === compId && v.isPosted && !v.isDeleted)
    .forEach(v => {
      const hitsCashBank = v.lines.some(l => l.accountCode === '1100' || l.accountCode === '1210' || l.accountCode === '1220');
      if (!hitsCashBank) return;

      v.lines.forEach(line => {
        // Look at the off-setting leg of the entry to categorize
        const acc = coaDb.find(a => a.code === line.accountCode);
        if (!acc || acc.isCashBank) return; // ignore cash bank itself

        const amt = line.debit > 0 ? -line.debit : line.credit; // debit expense means cash went out (-), credit revenue means cash came in (+)
        
        if (acc.type === 'Revenue') {
          operatingInflow += line.credit;
          inflows.push({ date: v.date, details: `Customer Receipts: ${v.narrationEn}`, amount: line.credit });
        } else if (acc.type === 'Expense') {
          operatingOutflow += line.debit;
          outflows.push({ date: v.date, details: `Vendor/Operating Payments: ${v.narrationEn}`, amount: line.debit });
        } else if (acc.type === 'Asset' && ['1410', '1420', '1500'].includes(acc.code)) {
          investingFlow -= (line.debit - line.credit);
        } else if (acc.type === 'Liability' || acc.type === 'Equity') {
          financingFlow += (line.credit - line.debit);
        }
      });
    });

  res.json({
    success: true,
    data: {
      operatingInflow,
      operatingOutflow,
      netOperating: operatingInflow - operatingOutflow,
      investingFlow,
      financingFlow,
      netCashChange: (operatingInflow - operatingOutflow) + investingFlow + financingFlow
    }
  });
});
