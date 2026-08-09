/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// ============================================================================
// 1. DATA TRANSFER OBJECTS (DTOs)
// ============================================================================

export class CreateProjectDto {
  companyId!: string;
  nameEn!: string;
  nameBn!: string;
  locationEn!: string;
  locationBn!: string;
  totalFloors!: number;
  landAreaKatha!: number;
  jvaRatioDeveloper!: number;
  jvaRatioLandowner!: number;
  status!: 'Planning' | 'Sourcing' | 'Under Construction' | 'Finishing' | 'Handed Over';
}

export class CreateUnitDto {
  companyId!: string;
  projectId!: string;
  unitNo!: string;
  floorNo!: number;
  sizeSft!: number;
  pricePerSft!: number;
  parkingChargeBdt!: number;
  utilityChargeBdt!: number;
  allocationType!: 'Developer Share' | 'Landowner Share';
  type!: 'Flat' | 'Plot';
}

export class CreateBookingDto {
  companyId!: string;
  projectId!: string;
  unitId!: string;
  customerId!: string;
  bookingDate!: string; // ISO format (YYYY-MM-DD)
  totalAgreedPrice!: number;
  bookingMoneyBdt!: number;
  downpaymentBdt!: number;
  installmentCount!: number;
  installmentFrequency!: 'Monthly' | 'Quarterly' | 'Half-Yearly' | 'Custom';
  salesPersonId!: string;
  commissionPercentage!: number;
}

export class RegisterPaymentDto {
  companyId!: string;
  bookingId!: string;
  receiptNo!: string;
  amountBdt!: number;
  paymentMode!: 'Cash' | 'Cheque' | 'Pay Order' | 'Bank Transfer';
  bankName?: string;
  instrumentNo?: string;
  issuedBy!: string; // User ID
  receivedDate!: string; // ISO Format (YYYY-MM-DD)
}

export class CancelBookingDto {
  companyId!: string;
  bookingId!: string;
  cancellationFee!: number;
  refundAmount!: number;
  reason!: string;
  actionBy!: string; // User ID
}

export class UpdateMutationDto {
  companyId!: string;
  unitId!: string;
  mutationDate?: string;
  khatianNo?: string;
  dagNo?: string;
  mouza?: string;
  rajukApprovalNo?: string;
  legalStatus!: 'Clear' | 'Disputed' | 'Under Review';
}

export class UpdateJvaDto {
  companyId!: string;
  projectId!: string;
  landownerName!: string;
  developerSharePercent!: number;
  landownerSharePercent!: number;
  revenueSharingTermsEn?: string;
  expenseSharingTermsEn?: string;
}

// ============================================================================
// 2. REPOSITORY PATTERNS & PERSISTENCE ENTITIES
// ============================================================================

export interface IProjectRepository {
  save(dto: CreateProjectDto): Promise<any>;
  findById(id: string): Promise<any>;
  findAll(companyId: string): Promise<any[]>;
}

export interface IUnitRepository {
  save(dto: CreateUnitDto): Promise<any>;
  findById(id: string): Promise<any>;
  findByProject(projectId: string): Promise<any[]>;
  updateStatus(unitId: string, status: 'Available' | 'Reserved' | 'Booked' | 'Sold' | 'Cancelled' | 'Transferred', manager?: any): Promise<void>;
  updateMutation(dto: UpdateMutationDto): Promise<void>;
}

export interface IBookingRepository {
  save(dto: CreateBookingDto, manager?: any): Promise<any>;
  findById(id: string): Promise<any>;
  findAll(companyId: string): Promise<any[]>;
  updateStatus(bookingId: string, status: 'Active' | 'Cancelled' | 'Completed', details?: any, manager?: any): Promise<void>;
}

export interface IMoneyReceiptRepository {
  save(dto: RegisterPaymentDto, manager?: any): Promise<any>;
  findById(id: string): Promise<any>;
  findAll(companyId: string): Promise<any[]>;
  setClearedStatus(receiptId: string, isCleared: boolean, manager?: any): Promise<void>;
}

export interface IInstallmentRepository {
  generateSchedules(bookingId: string, total: number, downpayment: number, count: number, freq: string, start: string, manager?: any): Promise<void>;
  findByBooking(bookingId: string): Promise<any[]>;
  allocatePayment(bookingId: string, amount: number, manager?: any): Promise<void>;
}

// ============================================================================
// 3. HIGH-FIDELITY IMPLEMENTATIONS FOR DRIZZLE / POSTGRES ORM
// ============================================================================

export class ProjectRepository implements IProjectRepository {
  constructor(private readonly db: any) {}

  async save(dto: CreateProjectDto): Promise<any> {
    const result = await this.db.query(
      `INSERT INTO projects (id, company_id, name_en, name_bn, location_en, location_bn, total_floors, land_area_katha, jva_ratio_developer, jva_ratio_landowner, status, created_at, updated_at)
       VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING *`,
      [dto.companyId, dto.nameEn, dto.nameBn, dto.locationEn, dto.locationBn, dto.totalFloors, dto.landAreaKatha, dto.jvaRatioDeveloper, dto.jvaRatioLandowner, dto.status]
    );
    return result.rows[0];
  }

  async findById(id: string): Promise<any> {
    const result = await this.db.query('SELECT * FROM projects WHERE id = $1 AND is_deleted = FALSE', [id]);
    return result.rows[0] || null;
  }

  async findAll(companyId: string): Promise<any[]> {
    const result = await this.db.query('SELECT * FROM projects WHERE company_id = $1 AND is_deleted = FALSE ORDER BY name_en', [companyId]);
    return result.rows;
  }
}

export class UnitRepository implements IUnitRepository {
  constructor(private readonly db: any) {}

  async save(dto: CreateUnitDto): Promise<any> {
    const result = await this.db.query(
      `INSERT INTO units (id, company_id, project_id, unit_no, floor_no, size_sft, price_per_sft, parking_charge_bdt, utility_charge_bdt, allocation_type, status, is_deleted, created_at, updated_at)
       VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5, $6, $7, $8, $9, 'Available', FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING *`,
      [dto.companyId, dto.projectId, dto.unitNo, dto.floorNo, dto.sizeSft, dto.pricePerSft, dto.parkingChargeBdt, dto.utilityChargeBdt, dto.allocationType]
    );
    return result.rows[0];
  }

  async findById(id: string): Promise<any> {
    const result = await this.db.query('SELECT * FROM units WHERE id = $1 AND is_deleted = FALSE', [id]);
    return result.rows[0] || null;
  }

  async findByProject(projectId: string): Promise<any[]> {
    const result = await this.db.query('SELECT * FROM units WHERE project_id = $1 AND is_deleted = FALSE ORDER BY floor_no, unit_no', [projectId]);
    return result.rows;
  }

  async updateStatus(unitId: string, status: string, manager?: any): Promise<void> {
    const client = manager || this.db;
    await client.query('UPDATE units SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [status, unitId]);
  }

  async updateMutation(dto: UpdateMutationDto): Promise<void> {
    await this.db.query(
      `UPDATE units 
       SET mutation_date = $1, khatian_no = $2, dag_no = $3, mouza = $4, rajuk_approval_no = $5, legal_status = $6, updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 AND company_id = $8`,
      [dto.mutationDate || null, dto.khatianNo || null, dto.dagNo || null, dto.mouza || null, dto.rajukApprovalNo || null, dto.legalStatus, dto.unitId, dto.companyId]
    );
  }
}

export class BookingRepository implements IBookingRepository {
  constructor(private readonly db: any) {}

  async save(dto: CreateBookingDto, manager?: any): Promise<any> {
    const client = manager || this.db;
    const result = await client.query(
      `INSERT INTO bookings (id, company_id, project_id, unit_id, customer_id, booking_date, total_agreed_price, booking_money_bdt, downpayment_bdt, status, sales_person_id, commission_percentage, is_deleted, created_at, updated_at)
       VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5, $6, $7, $8, 'Active', $9, $10, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING *`,
      [dto.companyId, dto.projectId, dto.unitId, dto.customerId, dto.bookingDate, dto.totalAgreedPrice, dto.bookingMoneyBdt, dto.downpaymentBdt, dto.salesPersonId, dto.commissionPercentage]
    );
    return result.rows[0];
  }

  async findById(id: string): Promise<any> {
    const result = await this.db.query('SELECT * FROM bookings WHERE id = $1 AND is_deleted = FALSE', [id]);
    return result.rows[0] || null;
  }

  async findAll(companyId: string): Promise<any[]> {
    const result = await this.db.query('SELECT * FROM bookings WHERE company_id = $1 AND is_deleted = FALSE ORDER BY booking_date DESC', [companyId]);
    return result.rows;
  }

  async updateStatus(bookingId: string, status: string, details?: any, manager?: any): Promise<void> {
    const client = manager || this.db;
    if (status === 'Cancelled') {
      await client.query(
        `UPDATE bookings 
         SET status = 'Cancelled', cancellation_date = CURRENT_DATE, refund_amount = $1, cancellation_fee = $2, cancellation_reason = $3, updated_at = CURRENT_TIMESTAMP
         WHERE id = $4`,
        [details?.refundAmount || 0, details?.cancellationFee || 0, details?.reason || 'Cancelled by Request', bookingId]
      );
    } else {
      await client.query('UPDATE bookings SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [status, bookingId]);
    }
  }
}

export class MoneyReceiptRepository implements IMoneyReceiptRepository {
  constructor(private readonly db: any) {}

  async save(dto: RegisterPaymentDto, manager?: any): Promise<any> {
    const client = manager || this.db;
    
    // Call the PostgreSQL stored procedure directly for collection setup & audit
    const query = `
      SELECT register_payment_collection(
        $1::UUID, $2::UUID, $3::VARCHAR, $4::DECIMAL, $5::VARCHAR, $6::VARCHAR, $7::VARCHAR, $8::UUID, $9::DATE
      ) as receipt_id;
    `;
    
    const result = await client.query(query, [
      dto.companyId,
      dto.bookingId,
      dto.receiptNo,
      dto.amountBdt,
      dto.paymentMode,
      dto.bankName || null,
      dto.instrumentNo || null,
      dto.issuedBy,
      dto.receivedDate
    ]);
    
    return result.rows[0]?.receipt_id;
  }

  async findById(id: string): Promise<any> {
    const result = await this.db.query('SELECT * FROM money_receipts WHERE id = $1 AND is_deleted = FALSE', [id]);
    return result.rows[0] || null;
  }

  async findAll(companyId: string): Promise<any[]> {
    const result = await this.db.query('SELECT * FROM money_receipts WHERE company_id = $1 AND is_deleted = FALSE ORDER BY received_date DESC', [companyId]);
    return result.rows;
  }

  async setClearedStatus(receiptId: string, isCleared: boolean, manager?: any): Promise<void> {
    const client = manager || this.db;
    await client.query('UPDATE money_receipts SET is_cleared = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [isCleared, receiptId]);
  }
}

export class InstallmentRepository implements IInstallmentRepository {
  constructor(private readonly db: any) {}

  async generateSchedules(bookingId: string, total: number, downpayment: number, count: number, freq: string, start: string, manager?: any): Promise<void> {
    const client = manager || this.db;
    
    // Delegate calculations to stored procedure
    await client.query(
      `SELECT generate_booking_installments(
        company_id, id, $1::DECIMAL, $2::DECIMAL, $3::INT, $4::VARCHAR, $5::DATE
      ) FROM bookings WHERE id = $6`,
      [total, downpayment, count, freq, start, bookingId]
    );
  }

  async findByBooking(bookingId: string): Promise<any[]> {
    const result = await this.db.query('SELECT * FROM installments WHERE booking_id = $1 AND is_deleted = FALSE ORDER BY installment_no ASC', [bookingId]);
    return result.rows;
  }

  async allocatePayment(bookingId: string, amount: number, manager?: any): Promise<void> {
    const client = manager || this.db;
    await client.query('SELECT allocate_payment_to_installments($1::UUID, $2::DECIMAL)', [bookingId, amount]);
  }
}

// ============================================================================
// 4. BUSINESS CORE DOMAIN SERVICES (REAL ESTATE TRANSACTION ENGINE)
// ============================================================================

export class BookingWorkflowService {
  constructor(
    private readonly unitRepo: IUnitRepository,
    private readonly bookingRepo: IBookingRepository,
    private readonly installmentRepo: IInstallmentRepository,
    private readonly dbClient: any
  ) {}

  /**
   * Initiates the secure Booking validation flow.
   * Enforces:
   *  - Single Active Booking per unit constraint.
   *  - Row-level database locking using procedures.
   *  - Automatic installment schedule mapping.
   */
  async createBooking(dto: CreateBookingDto): Promise<{ success: boolean; bookingId: string; message: string }> {
    return await this.dbClient.transaction(async (tx: any) => {
      // 1. Verify and lock the unit allocation
      await tx.query(
        'SELECT reserve_unit_allocation($1::UUID, $2::UUID, $3::UUID, $4::UUID)',
        [dto.companyId, dto.unitId, dto.customerId, dto.salesPersonId]
      );

      // 2. Commit booking ledger registration record
      const booking = await this.bookingRepo.save(dto, tx);

      // 3. Promote unit status from 'Reserved' to 'Booked'
      await tx.query(
        'SELECT confirm_unit_booking($1::UUID, $2::UUID, $3::UUID, $4::UUID)',
        [dto.companyId, dto.unitId, booking.id, dto.salesPersonId]
      );

      // 4. Auto-generate standard installments list
      await this.installmentRepo.generateSchedules(
        booking.id,
        dto.totalAgreedPrice,
        dto.downpaymentBdt,
        dto.installmentCount,
        dto.installmentFrequency,
        dto.bookingDate,
        tx
      );

      // 5. Trigger the automatic double-entry accounting recognition (auto post booking)
      await tx.query('SELECT auto_post_booking_journal($1::UUID)', [booking.id]);

      return {
        success: true,
        bookingId: booking.id,
        message: 'Real estate booking transaction completed successfully. Double-entry journals recognized.'
      };
    });
  }
}

export class InstallmentCalculatorService {
  constructor(private readonly installmentRepo: IInstallmentRepository) {}

  /**
   * Evaluates installment performance metrics
   */
  async calculateMetrics(bookingId: string, currentPrice: number, downpayment: number): Promise<{
    totalDue: number;
    totalPaid: number;
    outstandingBalance: number;
    overdueAmount: number;
    collectionPercentage: number;
    overdueCount: number;
  }> {
    const list = await this.installmentRepo.findByBooking(bookingId);
    const today = new Date();

    let totalPaid = downpayment;
    let totalDue = downpayment;
    let overdueAmount = 0;
    let overdueCount = 0;

    for (const inst of list) {
      const isOverdue = new Date(inst.due_date) < today && inst.status !== 'Paid';
      const paid = parseFloat(inst.paid_amount_bdt || 0);
      const amt = parseFloat(inst.amount_bdt);

      totalPaid += paid;
      totalDue += amt;

      if (isOverdue) {
        overdueAmount += (amt - paid);
        overdueCount++;
      }
    }

    const outstandingBalance = currentPrice - totalPaid;
    const collectionPercentage = currentPrice > 0 ? ROUND_MOCK((totalPaid / currentPrice) * 100) : 0;

    return {
      totalDue,
      totalPaid,
      outstandingBalance,
      overdueAmount,
      collectionPercentage,
      overdueCount
    };
  }
}

export class CancellationRefundEngineService {
  constructor(private readonly dbClient: any) {}

  /**
   * Resets the unit status back to 'Available', clears outstanding installments,
   * calculates refund distribution, and creates reversing ledger adjustments.
   */
  async processCancellation(dto: CancelBookingDto): Promise<{ success: boolean; message: string }> {
    await this.dbClient.transaction(async (tx: any) => {
      await tx.query(
        'SELECT cancel_booking_transaction($1::UUID, $2::UUID, $3::DECIMAL, $4::DECIMAL, $5::TEXT, $6::UUID)',
        [dto.companyId, dto.bookingId, dto.cancellationFee, dto.refundAmount, dto.reason, dto.actionBy]
      );
    });

    return {
      success: true,
      message: 'Booking cancellation registered. Unit restored to Available. Offsetting reverse ledger posted.'
    };
  }
}

export class JvaAgreementTrackingService {
  constructor(private readonly dbClient: any) {}

  /**
   * Records JVA terms and allocates units to Developer / Landowner shares
   */
  async registerJva(dto: UpdateJvaDto): Promise<void> {
    await this.dbClient.query(
      `INSERT INTO jva_agreements (id, company_id, project_id, landowner_name, developer_share, landowner_share, revenue_terms, expense_terms, created_at)
       VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)`,
      [dto.companyId, dto.projectId, dto.landownerName, dto.developerSharePercent, dto.landownerSharePercent, dto.revenueSharingTermsEn || '', dto.expenseSharingTermsEn || '']
    );
  }

  async getSettlementLedger(companyId: string, projectId: string): Promise<any[]> {
    const result = await this.dbClient.query(
      `SELECT u.unit_no, u.floor_no, u.size_sft, u.allocation_type, u.status, b.total_agreed_price,
              COALESCE(b.total_agreed_price * (j.developer_share / 100.0), 0) as developer_revenue_share,
              COALESCE(b.total_agreed_price * (j.landowner_share / 100.0), 0) as landowner_revenue_share
       FROM units u
       LEFT JOIN bookings b ON u.id = b.unit_id AND b.is_deleted = FALSE
       LEFT JOIN jva_agreements j ON u.project_id = j.project_id AND j.is_deleted = FALSE
       WHERE u.project_id = $1 AND u.company_id = $2 AND u.is_deleted = FALSE
       ORDER BY u.unit_no`,
      [projectId, companyId]
    );
    return result.rows;
  }
}

// Helper to round currency/decimals
function ROUND_MOCK(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}
