# AL KASWA HOLDINGS ERP - ENTERPRISE BACKEND FOUNDATION

This document defines the production-ready architectural foundation for the AL KASWA HOLDINGS ERP Backend, built on **Node.js with NestJS** and integrated with **PostgreSQL**.

---

## 1. NESTJS ENTERPRISE FOLDER STRUCTURE

The ERP uses a modular NestJS folder structure enforcing clean separation of concerns, strict encapsulation of company-level data, the Repository pattern, and strong type safety.

```text
al-kaswa-backend/
├── dist/                          # Compiled JS output
├── src/
│   ├── app.module.ts              # Root NestJS module
│   ├── main.ts                    # Application entry point (port 3000, 0.0.0.0)
│   │
│   ├── common/                    # Global/Shared modules and utilities
│   │   ├── decorators/
│   │   │   ├── company-id.decorator.ts    # Custom decorator to extract company_id
│   │   │   └── roles.decorator.ts         # Custom decorator for Role-Based Access
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts   # Global exception translator and logger
│   │   ├── guards/
│   │   │   ├── roles.guard.ts             # Enforces Role-Based Access Controls
│   │   │   └── tenant.guard.ts            # Enforces tenant isolation (company_id)
│   │   ├── interceptors/
│   │   │   ├── audit-log.interceptor.ts   # Automatic interception and logging of mutations
│   │   │   └── tenant.interceptor.ts      # Multi-tenant context propagation
│   │   └── validation/
│   │       └── validation.pipe.ts         # Class-validator global configurations
│   │
│   └── modules/                   # Enterprise Business Modules
│       ├── companies/
│       ├── users/
│       ├── projects/
│       ├── units/
│       ├── customers/
│       ├── bookings/
│       │   ├── dto/
│       │   │   ├── create-booking.dto.ts  # Validation rules for flat/plot booking
│       │   │   └── cancel-booking.dto.ts  # Validation rules for cancellations
│       │   ├── entities/
│       │   │   └── booking.entity.ts      # TypeORM/Sequelize Booking entity
│       │   ├── repositories/
│       │   │   └── booking.repository.ts  # Repository pattern implementation
│       │   ├── bookings.controller.ts     # REST controller for Bookings
│       │   ├── bookings.service.ts        # Business logic & transaction managers
│       │   └── bookings.module.ts         # Encapsulated module configuration
│       │
│       ├── installments/
│       ├── land-records/
│       ├── jva-agreements/
│       ├── employees/
│       ├── payroll/
│       ├── investor-transactions/
│       ├── chart-of-accounts/
│       ├── journal-vouchers/
│       ├── ledger-entries/
│       └── money-receipts/
│
├── test/                          # Unit and E2E test suites
├── .env.example                   # System environment variables template
├── nest-cli.json                  # NestJS configuration
├── package.json                   # Dependencies & build scripts
├── tsconfig.json                  # TypeScript compilation rules
└── firestore.rules                # Backup rules for secondary systems
```

---

## 2. REPOSITORY & SERVICE PATTERNS (CODE EXEMPLAR)

Below is the production implementation pattern for the **Booking Module** highlighting transaction safety, double-booking prevention, validation, and multi-tenant isolation.

### A. Entity Definition (`src/modules/bookings/entities/booking.entity.ts`)
```typescript
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, Unique } from 'typeorm';

@Entity('bookings')
@Unique(['unitId']) // Database constraint for active bookings
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id', type: 'uuid' })
  @Index()
  companyId: string;

  @Column({ name: 'customer_id', type: 'uuid' })
  customerId: string;

  @Column({ name: 'project_id', type: 'uuid' })
  projectId: string;

  @Column({ name: 'unit_id', type: 'uuid' })
  unitId: string;

  @Column({ name: 'booking_date', type: 'date' })
  bookingDate: Date;

  @Column({ name: 'total_agreed_price', type: 'decimal', precision: 18, scale: 2 })
  totalAgreedPrice: number;

  @Column({ name: 'booking_money_bdt', type: 'decimal', precision: 18, scale: 2 })
  bookingMoneyBdt: number;

  @Column({ name: 'downpayment_bdt', type: 'decimal', precision: 18, scale: 2 })
  downpaymentBdt: number;

  @Column({ name: 'installment_count', type: 'integer' })
  installmentCount: number;

  @Column({ name: 'sales_person_id', type: 'uuid', nullable: true })
  salesPersonId: string;

  @Column({ name: 'commission_percentage', type: 'decimal', precision: 5, scale: 2, default: 0.00 })
  commissionPercentage: number;

  @Column({ default: 'Active' })
  status: 'Active' | 'Cancelled' | 'Completed';

  @Column({ name: 'cancellation_date', type: 'date', nullable: true })
  cancellationDate: Date;

  @Column({ name: 'refund_amount', type: 'decimal', precision: 18, scale: 2, nullable: true })
  refundAmount: number;

  @Column({ name: 'cancellation_fee', type: 'decimal', precision: 18, scale: 2, nullable: true })
  cancellationFee: number;

  @Column({ name: 'cancellation_reason', type: 'text', nullable: true })
  cancellationReason: string;

  @Column({ name: 'is_deleted', default: false })
  isDeleted: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;
}
```

### B. Validation DTO (`src/modules/bookings/dto/create-booking.dto.ts`)
```typescript
import { IsUUID, IsDateString, IsNumber, IsPositive, Min, Max, IsInt } from 'class-validator';

export class CreateBookingDto {
  @IsUUID()
  customerId: string;

  @IsUUID()
  projectId: string;

  @IsUUID()
  unitId: string;

  @IsDateString()
  bookingDate: string;

  @IsNumber()
  @IsPositive()
  totalAgreedPrice: number;

  @IsNumber()
  @Min(0)
  bookingMoneyBdt: number;

  @IsNumber()
  @Min(0)
  downpaymentBdt: number;

  @IsInt()
  @Min(1)
  @Max(120)
  installmentCount: number;

  @IsUUID()
  salesPersonId: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  commissionPercentage: number;
}
```

### C. Booking Repository (`src/modules/bookings/repositories/booking.repository.ts`)
```typescript
import { Injectable, BadRequestException } from '@nestjs/common';
import { DataSource, Repository, EntityManager } from 'typeorm';
import { Booking } from '../entities/booking.entity';

@Injectable()
export class BookingRepository extends Repository<Booking> {
  constructor(private dataSource: DataSource) {
    super(Booking, dataSource.createEntityManager());
  }

  // Find a booking enforcing tenant/company boundaries
  async findByUnitAndTenant(unitId: string, companyId: string): Promise<Booking | null> {
    return this.findOne({
      where: { unitId, companyId, status: 'Active', isDeleted: false },
    });
  }

  // Create a booking using a managed transaction
  async createTransactionalBooking(
    bookingData: Partial<Booking>,
    installments: any[],
    manager: EntityManager
  ): Promise<Booking> {
    // 1. Verify unit is available and lock row to prevent concurrent race condition
    const unit = await manager.query(
      `SELECT status FROM units WHERE id = $1 AND company_id = $2 FOR UPDATE`,
      [bookingData.unitId, bookingData.companyId]
    );

    if (!unit || unit.length === 0) {
      throw new BadRequestException('The selected unit does not exist or belongs to another company.');
    }

    if (unit[0].status !== 'Available') {
      throw new BadRequestException('This unit has already been allocated or blocked.');
    }

    // 2. Insert Booking Record
    const booking = manager.create(Booking, bookingData);
    const savedBooking = await manager.save(booking);

    // 3. Update Unit Status
    await manager.query(
      `UPDATE units SET status = 'Booked' WHERE id = $1`,
      [bookingData.unitId]
    );

    // 4. Save Installments
    for (const inst of installments) {
      await manager.query(
        `INSERT INTO installments (id, company_id, booking_id, installment_no, due_date, amount_bdt, status)
         VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5, 'Unpaid')`,
        [bookingData.companyId, savedBooking.id, inst.installmentNo, inst.dueDate, inst.amountBdt]
      );
    }

    return savedBooking;
  }
}
```

### D. Booking Service (`src/modules/bookings/bookings.service.ts`)
```typescript
import { Injectable, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BookingRepository } from './repositories/booking.repository';
import { CreateBookingDto } from './dto/create-booking.dto';
import { Booking } from './entities/booking.entity';

@Injectable()
export class BookingsService {
  constructor(
    private readonly bookingRepository: BookingRepository,
    private readonly dataSource: DataSource
  ) {}

  async createBooking(companyId: string, createDto: CreateBookingDto): Promise<Booking> {
    // Enforce Tenant Check
    const activeBooking = await this.bookingRepository.findByUnitAndTenant(createDto.unitId, companyId);
    if (activeBooking) {
      throw new ConflictException('A booking is already active for this unit.');
    }

    // Generate installment schedule array (Equal distribution of balance)
    const totalCharges = createDto.totalAgreedPrice;
    const balanceToPay = totalCharges - createDto.bookingMoneyBdt - createDto.downpaymentBdt;
    const installmentAmount = Number((balanceToPay / createDto.installmentCount).toFixed(2));
    
    const installments = [];
    const currentDate = new Date();
    for (let i = 1; i <= createDto.installmentCount; i++) {
      const dueDate = new Date(currentDate.setMonth(currentDate.getMonth() + 1));
      installments.push({
        installmentNo: i,
        dueDate: dueDate.toISOString().split('T')[0],
        amountBdt: installmentAmount,
      });
    }

    // Run within single isolated PostgreSQL transaction block
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const newBooking = await this.bookingRepository.createTransactionalBooking(
        { ...createDto, companyId },
        installments,
        queryRunner.manager
      );
      await queryRunner.commitTransaction();
      return newBooking;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(error.message);
    } finally {
      await queryRunner.release();
    }
  }
}
```

---

## 3. MULTI-COMPANY ISOLATION LAYER (TENANCY SYSTEM)

Multi-tenant isolation must be verified at every request. AL KASWA HOLDINGS enforces data separation using **Shared Schema Tenant Isolation**, where:
1. Every client request includes a mandatory header: `x-company-id`.
2. A generic NestJS `TenantGuard` and `TenantInterceptor` validate the header and set the current context.
3. Every database query appends a strict filter: `WHERE company_id = :companyId`.

### Tenant Request Interceptor (`src/common/interceptors/tenant.interceptor.ts`)
```typescript
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, BadRequestException } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class TenantInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const companyId = request.headers['x-company-id'];

    if (!companyId) {
      throw new BadRequestException('Client error: Missing mandatory Header [x-company-id]');
    }

    // Attach company identifier to request context for decorators/services
    request.companyId = companyId;
    return next.handle();
  }
}
```

---

## 4. IMMUTABLE SYSTEM AUDIT ENGINE

To prevent any data-tampering or fraud, mutations are monitored via a global `AuditLogInterceptor`. This interceptor logs the state of entities **before** and **after** an update, publishing results directly to the database. The `audit_logs` table block trigger ensures that logs remain read-only.

### Audit Log Interceptor (`src/common/interceptors/audit-log.interceptor.ts`)
```typescript
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { DataSource } from 'typeorm';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(private readonly dataSource: DataSource) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, companyId, user } = request;

    // We only audit mutations (POST, PUT, DELETE, PATCH)
    if (method === 'GET') return next.handle();

    return next.handle().pipe(
      tap(async (response) => {
        try {
          const action = method === 'POST' ? 'INSERT' : method === 'DELETE' ? 'DELETE' : 'UPDATE';
          const tableName = url.split('/')[2] || 'unknown_table';
          const recordId = response?.id || '00000000-0000-0000-0000-000000000000';

          await this.dataSource.query(
            `INSERT INTO audit_logs (company_id, user_id, action, table_name, record_id, old_values, new_values, ip_address, user_agent)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [
              companyId,
              user?.id || null,
              action,
              tableName,
              recordId,
              request.oldState ? JSON.stringify(request.oldState) : null,
              JSON.stringify(request.body || {}),
              request.ip,
              request.headers['user-agent'],
            ]
          );
        } catch (auditError) {
          console.error('Audit Log Insertion Failure:', auditError.message);
        }
      })
    );
  }
}
```

---

## 5. RE-ENFORCED ACCOUNTING DOUBLE ENTRY RULES

Accounting integrity is protected by applying constraints inside the database and handling computations with high decimal precision (`DECIMAL(18,2)`):
- **Voucher Level Balances**: Check constraint `chk_debit_credit_match` forces `debit_total = credit_total` on every single insert/update of a posted Journal Voucher.
- **Voucher Line Enforcements**: Constraint `chk_debit_credit_sides` ensures a line entry is strictly a Debit OR a Credit (never both or empty).
- **Hard Deletion Protection**: Database trigger `trigger_block_voucher_deletion` strictly raises exceptions on any SQL `DELETE` or `UPDATE` attempt for a posted journal entry. Correction can ONLY be achieved by posting offset Adjustment Journal Vouchers.

---

## 6. ENTITY RELATIONSHIP DIAGRAM (ERD) RELATIONSHIPS

```text
  ┌─────────────────┐             ┌─────────────────┐             ┌─────────────────┐
  │    companies    │◄───────────┼│      users      │◄───────────┼│  role_permissions │
  └────────┬────────┘             └────────┬────────┘             └─────────────────┘
           │                               │
           ├───────────────────────────────┼──────────────────────────────┐
           ▼                               ▼                              ▼
  ┌─────────────────┐             ┌─────────────────┐             ┌─────────────────┐
  │    projects     │◄───────────┼│    bookings     │◄───────────┼│ chart_of_accounts│
  └────────┬────────┘             └────────┬────────┘             └────────┬────────┘
           │                               │                               │
           ▼                               ▼                               ▼
  ┌─────────────────┐             ┌─────────────────┐             ┌─────────────────┐
  │     units       │◄───────────┼│  installments   │             │ledger_entries   │
  └─────────────────┘             └─────────────────┘             └─────────────────┘
                                                                           ▲
                                  ┌─────────────────┐                      │
                                  │journal_vouchers │◄─────────────────────┘
                                  └─────────────────┘
```

---

## 7. ENTERPRISE REST API ENDPOINT SPECIFICATION

All endpoints consume and produce `application/json` and enforce validation schema structures.

### Authentication & Identification Headers
- `x-company-id`: UUID (Mandatory header for tenant identification).
- `Authorization`: `Bearer <JWT_TOKEN>` (Token containing User ID, Tenant Scope, and Role).

### Core REST Endpoints List

| Endpoint | Method | Role Permissions Required | Payload / Query Parameters | Response Codes |
| :--- | :--- | :--- | :--- | :--- |
| `/api/bookings` | `POST` | `sales:booking:write`, `FND`, `MD` | `CreateBookingDto` | `201 Created`, `400 Bad Request`, `409 Conflict` |
| `/api/bookings` | `GET` | Any company user | `?projectId=`, `?customerId=`, `?page=`, `?limit=` | `200 OK`, `403 Forbidden` |
| `/api/bookings/:id/cancel` | `POST` | `sales:booking:write`, `FND`, `MD` | `{ fee: number, reason: string }` | `200 OK`, `404 Not Found` |
| `/api/installments/due` | `GET` | `fin:ledger:write`, `FND`, `MD` | `?daysAhead=30`, `?isOverdue=true` | `200 OK` |
| `/api/vouchers` | `POST` | `fin:ledger:write`, `FND`, `MD` | `CreateVoucherDto` (with balancing ledger arrays) | `201 Created`, `400 Balances Mismatch` |
| `/api/vouchers/:id` | `DELETE` | **RESTRICTED TO NONE** | *N/A (Raises DB Trigger Exception)* | `403 Operation Blocked` |
| `/api/money-receipts` | `POST` | `fin:ledger:write`, `FND`, `MD` | `CreateReceiptDto` (Generates receipt and matches GL ledger entry) | `201 Created`, `400 Validation Error` |
| `/api/payroll/generate` | `POST` | `hr:payroll:write`, `FND`, `MD` | `{ salaryMonth: "2026-07" }` | `201 Created` |
| `/api/payroll/:id/pay` | `PATCH` | `hr:payroll:write`, `FND`, `MD` | `{ paymentMode: "Bank Transfer", bankName: "City Bank" }` | `200 OK` |
| `/api/documents/upload` | `POST` | `FND`, `MD`, `HRM`, `ACT`, `LGL` | Multipart form (File + Metadata) | `201 Created` |
| `/api/audit-logs` | `GET` | `FND` (Strictly restricted to founder) | `?startDate=`, `?userId=`, `?tableName=` | `200 OK` |

---

## 8. STEP-BY-STEP PRODUCTION IMPLEMENTATION TIMELINE

### Phase 1: Environment & Base Engine Setup (Weeks 1 - 2)
1. Provision isolated staging and production PostgreSQL clusters.
2. Initialize NestJS boilerplate with standard ESLint, TypeScript configuration, and type-safe database engines.
3. Configure logging middleware, global exception filters, and baseline security (cors, helmet, rate-limiting).

### Phase 2: Core Tenancy & Identity Engine (Weeks 3 - 4)
1. Deploy RBAC and Tenant schemas (companies, users, roles, role_permissions, permissions).
2. Seed initial roles and permission nodes.
3. Implement `TenantGuard`, `TenantInterceptor` and register global validation pipes.

### Phase 3: Financial & Double-Entry Ledgers (Weeks 5 - 7)
1. Deploy `chart_of_accounts`, `journal_vouchers`, and `ledger_entries` schemas.
2. Write SQL transactional functions to perform double-entry validations at runtime.
3. Implement `block_voucher_deletion` database-level safety triggers.
4. Build API handlers for general ledger postings, cash/bank books, and real-time trial balance engines.

### Phase 4: Real Estate Sourcing, Projects & Bookings (Weeks 8 - 10)
1. Deploy `projects`, `units`, `land_records`, and `jva_agreements` tables.
2. Implement partial index `idx_uq_active_unit_booking` to avoid unit double allocation.
3. Code the booking engine logic using database level locking (`FOR UPDATE`) for concurrency safety.
4. Build the installment schedule auto-generator and collection receipt system.

### Phase 5: HR, Payroll, Document Center & Logging (Weeks 11 - 12)
1. Deploy `employees`, `payroll`, `documents`, and `notifications` tables.
2. Integrate the immutable `audit_logs` tracking system and block modifications via triggers.
3. Connect the Document Center version control logic.
4. Perform comprehensive stress, security, and integration testing before launch.
