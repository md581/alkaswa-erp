/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { RoleId } from '../types';

// ============================================================================
// 1. DATA TRANSFER OBJECTS (DTOs) & VALIDATION LAYERS
// ============================================================================

export class CreateAccountDto {
  companyId!: string;
  accountCode!: string;
  nameEn!: string;
  nameBn!: string;
  accountType!: 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';
  parentId?: string;
  subType!: string;
  isCashBank!: boolean;
}

export class TransactionLineDto {
  accountCode!: string;
  debit!: number;
  credit!: number;
  narrationEn?: string;
  narrationBn?: string;
  referenceId?: string;
  referenceType?: string;
}

export class CreateVoucherDto {
  companyId!: string;
  voucherNo!: string;
  voucherDate!: string; // ISO String (YYYY-MM-DD)
  voucherType!: 'JV' | 'CPV' | 'CRV' | 'BPV' | 'BRV';
  descriptionEn!: string;
  descriptionBn!: string;
  postedBy!: string; // User ID
  lines!: TransactionLineDto[];
}

export class AdjustmentJournalDto {
  companyId!: string;
  voucherId!: string;
  adjustedDate!: string;
  reasonEn!: string;
  reasonBn!: string;
  approvedBy!: string;
  lines!: TransactionLineDto[];
}

// ============================================================================
// 2. REPOSITORY PATTERN INTERFACES & CLASSES
// ============================================================================

export interface IChartOfAccountsRepository {
  findByCode(companyId: string, code: string): Promise<any>;
  save(dto: CreateAccountDto): Promise<any>;
  getTree(companyId: string): Promise<any[]>;
  verifyActiveStatus(accountId: string): Promise<boolean>;
}

export interface IVoucherRepository {
  createVoucher(dto: CreateVoucherDto, manager?: any): Promise<any>;
  findVoucherById(id: string): Promise<any>;
  getVoucherWithLines(id: string): Promise<any>;
  checkVoucherNoExists(companyId: string, voucherNo: string): Promise<boolean>;
  markAsLocked(voucherId: string, manager?: any): Promise<void>;
  softDelete(voucherId: string, deletedBy: string): Promise<void>;
}

/**
 * Production-ready Mock Repository Implementation targeting PostgreSQL / Drizzle ORM.
 * Demonstrates transactional execution and multi-tenant isolation.
 */
export class ChartOfAccountsRepository implements IChartOfAccountsRepository {
  private db: any; // Represents Database Connection Client (e.g., Drizzle, pg-promise)

  constructor(dbClient: any) {
    this.db = dbClient;
  }

  async findByCode(companyId: string, code: string): Promise<any> {
    const result = await this.db.query(
      'SELECT * FROM chart_of_accounts WHERE company_id = $1 AND account_code = $2 AND is_deleted = FALSE',
      [companyId, code]
    );
    return result.rows[0] || null;
  }

  async save(dto: CreateAccountDto): Promise<any> {
    const result = await this.db.query(
      `INSERT INTO chart_of_accounts (id, company_id, account_code, name_en, name_bn, account_type, parent_id, sub_type, is_cash_bank)
       VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        dto.companyId,
        dto.accountCode,
        dto.nameEn,
        dto.nameBn,
        dto.accountType,
        dto.parentId || null,
        dto.subType,
        dto.isCashBank
      ]
    );
    return result.rows[0];
  }

  async getTree(companyId: string): Promise<any[]> {
    // Standard recursive CTE query to generate hierarchical Chart of Accounts tree
    const query = `
      WITH RECURSIVE coa_tree AS (
        SELECT id, parent_id, account_code, name_en, name_bn, account_type, 1 as level
        FROM chart_of_accounts
        WHERE company_id = $1 AND parent_id IS NULL AND is_deleted = FALSE
        UNION ALL
        SELECT c.id, c.parent_id, c.account_code, c.name_en, c.name_bn, c.account_type, t.level + 1
        FROM chart_of_accounts c
        INNER JOIN coa_tree t ON c.parent_id = t.id
        WHERE c.company_id = $1 AND c.is_deleted = FALSE
      )
      SELECT * FROM coa_tree ORDER BY account_code;
    `;
    const result = await this.db.query(query, [companyId]);
    return result.rows;
  }

  async verifyActiveStatus(accountId: string): Promise<boolean> {
    const result = await this.db.query(
      'SELECT is_active FROM chart_of_accounts WHERE id = $1 AND is_deleted = FALSE',
      [accountId]
    );
    return result.rows[0]?.is_active || false;
  }
}

export class VoucherRepository implements IVoucherRepository {
  private db: any;

  constructor(dbClient: any) {
    this.db = dbClient;
  }

  async checkVoucherNoExists(companyId: string, voucherNo: string): Promise<boolean> {
    const result = await this.db.query(
      'SELECT EXISTS(SELECT 1 FROM journal_vouchers WHERE company_id = $1 AND voucher_no = $2 AND is_deleted = FALSE)',
      [companyId, voucherNo]
    );
    return result.rows[0]?.exists || false;
  }

  async findVoucherById(id: string): Promise<any> {
    const result = await this.db.query('SELECT * FROM journal_vouchers WHERE id = $1 AND is_deleted = FALSE', [id]);
    return result.rows[0] || null;
  }

  async getVoucherWithLines(id: string): Promise<any> {
    const voucherResult = await this.db.query('SELECT * FROM journal_vouchers WHERE id = $1 AND is_deleted = FALSE', [id]);
    if (!voucherResult.rows[0]) return null;

    const linesResult = await this.db.query('SELECT * FROM ledger_entries WHERE voucher_id = $1', [id]);
    return {
      ...voucherResult.rows[0],
      lines: linesResult.rows
    };
  }

  /**
   * Complex Transactional execution inside a pooled database connection
   * Delegates the actual posting logic to the PostgreSQL function for performance and atomicity.
   */
  async createVoucher(dto: CreateVoucherDto, manager?: any): Promise<any> {
    const client = manager || this.db;
    const ledgerLinesJson = JSON.stringify(dto.lines);

    const query = `
      SELECT post_journal_voucher(
        $1::UUID, $2::VARCHAR, $3::DATE, $4::VARCHAR, $5::TEXT, $6::TEXT, $7::UUID, $8::JSONB
      ) as voucher_id;
    `;

    const result = await client.query(query, [
      dto.companyId,
      dto.voucherNo,
      dto.voucherDate,
      dto.voucherType,
      dto.descriptionEn,
      dto.descriptionBn,
      dto.postedBy,
      ledgerLinesJson
    ]);

    return result.rows[0]?.voucher_id;
  }

  async markAsLocked(voucherId: string, manager?: any): Promise<void> {
    const client = manager || this.db;
    await client.query('UPDATE journal_vouchers SET is_locked = TRUE WHERE id = $1', [voucherId]);
  }

  async softDelete(voucherId: string, deletedBy: string): Promise<void> {
    // Database triggers block direct deletions of POSTED vouchers;
    // This method sets is_deleted = TRUE and handles audit trails.
    await this.db.query(
      'UPDATE journal_vouchers SET is_deleted = TRUE WHERE id = $1 AND is_posted = FALSE',
      [voucherId]
    );
  }
}

// ============================================================================
// 3. SERVICE LAYER & TRANSACTION MANAGEMENT
// ============================================================================

export class AccountingService {
  constructor(
    private readonly coaRepo: IChartOfAccountsRepository,
    private readonly voucherRepo: IVoucherRepository,
    private readonly dbClient: any // Database Client supporting transaction pool
  ) {}

  /**
   * Post a Voucher using a strict database transaction wrapper.
   */
  async postVoucher(dto: CreateVoucherDto): Promise<{ success: boolean; voucherId: string; message: string }> {
    // Validate Debit and Credit sum in service layer first (Double entry pre-check)
    let totalDebit = 0;
    let totalCredit = 0;

    for (const line of dto.lines) {
      totalDebit += line.debit;
      totalCredit += line.credit;

      // Verify each ledger line doesn't violate single side rules
      if (line.debit > 0 && line.credit > 0) {
        throw new Error('Accounting Violation: Ledger line cannot contain both debit and credit values.');
      }
    }

    if (totalDebit !== totalCredit) {
      throw new Error(`Double Entry Error: Debit (৳${totalDebit}) must exactly match Credit (৳${totalCredit}).`);
    }

    if (totalDebit <= 0) {
      throw new Error('Double Entry Error: Transaction totals must be positive and greater than zero.');
    }

    // Check unique voucher numbers
    const exists = await this.voucherRepo.checkVoucherNoExists(dto.companyId, dto.voucherNo);
    if (exists) {
      throw new Error(`Integrity Error: Voucher Number ${dto.voucherNo} is already registered.`);
    }

    // Execute inside Database transaction pool
    const transactionResult = await this.dbClient.transaction(async (txManager: any) => {
      const voucherId = await this.voucherRepo.createVoucher(dto, txManager);
      return voucherId;
    });

    return {
      success: true,
      voucherId: transactionResult,
      message: 'Journal Voucher successfully posted under balanced ledger controls.'
    };
  }

  /**
   * Multi-company isolated financial reports query engine
   */
  async getTrialBalance(companyId: string, startDate: string, endDate: string): Promise<any[]> {
    const result = await this.dbClient.query(
      'SELECT * FROM get_trial_balance($1, $2, $3)',
      [companyId, startDate, endDate]
    );
    return result.rows;
  }

  async getProfitAndLoss(companyId: string, startDate: string, endDate: string): Promise<any> {
    const result = await this.dbClient.query(
      'SELECT * FROM get_profit_and_loss($1, $2, $3)',
      [companyId, startDate, endDate]
    );

    // Group revenues and expenses
    let totalRevenue = 0;
    let totalExpense = 0;
    const revenues: any[] = [];
    const expenses: any[] = [];

    for (const row of result.rows) {
      const amt = parseFloat(row.period_amount);
      if (row.category_type === 'REVENUE') {
        revenues.push(row);
        totalRevenue += amt;
      } else {
        expenses.push(row);
        totalExpense += amt;
      }
    }

    return {
      revenues,
      expenses,
      totalRevenue,
      totalExpense,
      netProfit: totalRevenue - totalExpense
    };
  }

  async getBalanceSheet(companyId: string, asOfDate: string): Promise<any> {
    const result = await this.dbClient.query(
      'SELECT * FROM get_balance_sheet($1, $2)',
      [companyId, asOfDate]
    );

    const assets: any[] = [];
    const liabilities: any[] = [];
    const equities: any[] = [];
    let totalAssets = 0;
    let totalLiabilities = 0;
    let totalEquity = 0;

    for (const row of result.rows) {
      const bal = parseFloat(row.balance);
      if (row.section_type === 'ASSET') {
        assets.push(row);
        totalAssets += bal;
      } else if (row.section_type === 'LIABILITY') {
        liabilities.push(row);
        totalLiabilities += bal;
      } else {
        equities.push(row);
        totalEquity += bal;
      }
    }

    return {
      assets,
      liabilities,
      equities,
      totalAssets,
      totalLiabilities,
      totalEquity,
      accountingEquationVerified: Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.01
    };
  }

  async getCashFlow(companyId: string, startDate: string, endDate: string): Promise<any> {
    const result = await this.dbClient.query(
      'SELECT * FROM get_cash_flow($1, $2, $3)',
      [companyId, startDate, endDate]
    );

    let operatingNet = 0;
    let investingNet = 0;
    let financingNet = 0;

    const operating: any[] = [];
    const investing: any[] = [];
    const financing: any[] = [];

    for (const row of result.rows) {
      const amt = parseFloat(row.amount);
      if (row.activity_type.startsWith('OPERATING')) {
        operating.push(row);
        operatingNet += row.activity_type.endsWith('INFLOW') ? amt : -amt;
      } else if (row.activity_type.startsWith('INVESTING')) {
        investing.push(row);
        investingNet += row.activity_type.endsWith('INFLOW') ? amt : -amt;
      } else {
        financing.push(row);
        financingNet += row.activity_type.endsWith('INFLOW') ? amt : -amt;
      }
    }

    return {
      operating,
      investing,
      financing,
      operatingNet,
      investingNet,
      financingNet,
      netCashIncrease: operatingNet + investingNet + financingNet
    };
  }
}

// ============================================================================
// 4. AUTO-POSTING ENGINE TRIGGER WRAPPERS
// ============================================================================

export class AutoPostingService {
  constructor(private readonly dbClient: any) {}

  /**
   * Automatically post booking journal vouchers on customer booking completion
   */
  async handleBookingCreated(bookingId: string): Promise<string> {
    return await this.dbClient.transaction(async (tx: any) => {
      const result = await tx.query('SELECT auto_post_booking_journal($1::UUID) as voucher_id', [bookingId]);
      return result.rows[0]?.voucher_id;
    });
  }

  /**
   * Automatically post cash/bank receipt journals when installment/dues clear
   */
  async handleMoneyReceiptCleared(receiptId: string): Promise<string> {
    return await this.dbClient.transaction(async (tx: any) => {
      const result = await tx.query('SELECT auto_post_receipt_journal($1::UUID) as voucher_id', [receiptId]);
      return result.rows[0]?.voucher_id;
    });
  }

  /**
   * Automatically post reversal journal vouchers if a booking is cancelled
   */
  async handleBookingCancelled(bookingId: string): Promise<string> {
    return await this.dbClient.transaction(async (tx: any) => {
      const result = await tx.query('SELECT auto_post_booking_cancellation_journal($1::UUID) as voucher_id', [bookingId]);
      return result.rows[0]?.voucher_id;
    });
  }
}

// ============================================================================
// 5. FISCAL YEAR LOCK ENGINE
// ============================================================================

export class FiscalPeriodLockService {
  constructor(private readonly dbClient: any, private readonly voucherRepo: IVoucherRepository) {}

  /**
   * Locks all vouchers of a given company up to a target date, safeguarding
   * accounts records from modifications, updates, or backdated entries.
   */
  async lockFiscalPeriod(companyId: string, lockDate: string, authorizedUserId: string): Promise<void> {
    await this.dbClient.transaction(async (tx: any) => {
      // 1. Fetch active vouchers up to the target lock date that are unlocked
      const result = await tx.query(
        `SELECT id FROM journal_vouchers 
         WHERE company_id = $1 
           AND voucher_date <= $2::DATE 
           AND is_locked = FALSE 
           AND is_deleted = FALSE`,
        [companyId, lockDate]
      );

      const voucherIds = result.rows.map((row: any) => row.id);

      if (voucherIds.length === 0) {
        return;
      }

      // 2. Lock each voucher
      for (const id of voucherIds) {
        await this.voucherRepo.markAsLocked(id, tx);
      }

      // 3. Log the administrative action in system audits
      await tx.query(
        `INSERT INTO audit_logs (company_id, user_id, action, table_name, record_id, new_values, created_at)
         VALUES ($1, $2, 'LOCK_FISCAL_PERIOD', 'journal_vouchers', $3, $4, CURRENT_TIMESTAMP)`,
        [
          companyId,
          authorizedUserId,
          companyId,
          JSON.stringify({ locked_up_to: lockDate, vouchers_affected: voucherIds.length })
        ]
      );
    });
  }
}

// ============================================================================
// 6. ADJUSTMENT JOURNAL WORKFLOW
// ============================================================================

export class AdjustmentJournalService {
  constructor(
    private readonly voucherRepo: IVoucherRepository,
    private readonly dbClient: any
  ) {}

  /**
   * Standard adjustment journal workflow.
   * Rather than editing a posted voucher (which violates auditable compliance rules),
   * the adjustment journal generates a paired adjustment/reversal voucher that connects
   * with the original voucher via references.
   */
  async createAdjustment(dto: AdjustmentJournalDto): Promise<string> {
    return await this.dbClient.transaction(async (tx: any) => {
      // 1. Fetch original voucher details
      const originalVoucher = await this.voucherRepo.getVoucherWithLines(dto.voucherId);
      if (!originalVoucher) {
        throw new Error('Error: Original voucher for adjustment not found.');
      }

      if (originalVoucher.is_locked) {
        throw new Error('Compliance Violation: Cannot post adjustment against a locked fiscal period.');
      }

      // 2. Create the offsetting/reversing entries
      const reversalLines: TransactionLineDto[] = originalVoucher.lines.map((line: any) => ({
        accountCode: line.account_code || 'UNSPECIFIED',
        debit: parseFloat(line.credit), // Debit gets original credit
        credit: parseFloat(line.debit), // Credit gets original debit
        narrationEn: `Reversal Adjustment JV: ${dto.reasonEn}`,
        narrationBn: `সংশোধনী জার্নাল হিসাব: ${dto.reasonBn}`,
        referenceId: originalVoucher.id,
        referenceType: 'JournalVoucherReversal'
      }));

      // 3. Post Reversal Voucher
      const reversalVoucherNo = `REV-ADJ-${TO_CHAR_MOCK()}-${SUBSTR_MOCK(originalVoucher.id)}`;
      
      const reversalVoucherId = await this.voucherRepo.createVoucher({
        companyId: dto.companyId,
        voucherNo: reversalVoucherNo,
        voucherDate: dto.adjustedDate,
        voucherType: 'JV',
        descriptionEn: `System auto-reversal for adjustment of Voucher No: ${originalVoucher.voucher_no}. Reason: ${dto.reasonEn}`,
        descriptionBn: `ভাউচার নং: ${originalVoucher.voucher_no} এর সংশোধনের জন্য বিপরীতকরণ। কারণ: ${dto.reasonBn}`,
        postedBy: dto.approvedBy,
        lines: reversalLines
      }, tx);

      // 4. Post the corrected replacement lines
      const correctedVoucherNo = `ADJ-${TO_CHAR_MOCK()}-${SUBSTR_MOCK(originalVoucher.id)}`;
      
      const correctedVoucherId = await this.voucherRepo.createVoucher({
        companyId: dto.companyId,
        voucherNo: correctedVoucherNo,
        voucherDate: dto.adjustedDate,
        voucherType: 'JV',
        descriptionEn: `Corrected entry adjustment replacing Voucher No: ${originalVoucher.voucher_no}`,
        descriptionBn: `ভাউচার নং: ${originalVoucher.voucher_no} এর সংশোধিত হিসাব স্থানান্তর`,
        postedBy: dto.approvedBy,
        lines: dto.lines
      }, tx);

      // 5. Link both vouchers as locked/adjusted
      await tx.query(
        'UPDATE journal_vouchers SET is_locked = TRUE WHERE id = $1',
        [originalVoucher.id]
      );

      return correctedVoucherId;
    });
  }
}

// Helpers for string generations in the mock backend
function TO_CHAR_MOCK(): string {
  const d = new Date();
  return d.getFullYear().toString() + (d.getMonth() + 1).toString().padStart(2, '0') + d.getDate().toString().padStart(2, '0');
}

function SUBSTR_MOCK(val: string): string {
  return val.substring(0, 6).toUpperCase();
}
