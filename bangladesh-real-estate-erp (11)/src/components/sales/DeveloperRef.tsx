import React from 'react';
import { Server, Database, FileText, Code } from 'lucide-react';

interface DeveloperRefProps {
  lang: 'en' | 'bn';
}

export default function DeveloperRef({ lang }: DeveloperRefProps) {
  return (
    <div className="space-y-6" id="developer-ref-module">
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
        <h4 className="font-display font-bold text-lg text-slate-800 mb-2 flex items-center gap-2">
          <Code className="text-emerald-500 animate-pulse" />
          {lang === 'en' ? 'Phase 5 Backend DDL & NestJS Reference' : 'ফেজ ৫ ব্যাকএন্ড ডিডিএল এবং নেস্টজেএস রেফারেন্স'}
        </h4>
        <p className="text-xs text-slate-500">
          {lang === 'en'
            ? 'Production-ready database schema and NestJS framework structure optimized for enterprise deployment.'
            : 'এন্টারপ্রাইজ ডিপ্লয়মেন্টের জন্য অপ্টিমাইজড ডেটাবেস স্কিমা এবং নেস্টজেএস ফ্রেমওয়ার্ক ফাইলসমূহ।'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PostgreSQL Schema */}
        <div className="bg-slate-900 text-slate-300 p-6 rounded-2xl border border-slate-800 font-mono text-[11px] h-[500px] overflow-y-auto">
          <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-800 text-slate-200">
            <Database className="text-emerald-400" size={16} />
            <span className="font-bold">1. PostgreSQL DDL Schema (schema.sql)</span>
          </div>
          <pre>{`-- PostgreSQL Schema for Phase 5 Sales CRM & Booking Automation

-- Lead Sources Enum
CREATE TYPE lead_source AS ENUM ('Facebook', 'Website', 'Referral', 'Broker', 'Walk-In', 'Campaign');

-- Lead Pipeline Stages Enum
CREATE TYPE lead_stage AS ENUM ('New Lead', 'Contacted', 'Site Visit Scheduled', 'Site Visit Completed', 'Negotiation', 'Booking', 'Sold');

-- CRM Leads Table
CREATE TABLE crm_leads (
    id VARCHAR(50) PRIMARY KEY,
    customer_name VARCHAR(150) NOT NULL,
    mobile VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    source lead_source NOT NULL DEFAULT 'Website',
    interested_project_id VARCHAR(50) REFERENCES erp_projects(id),
    budget NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    requirement TEXT,
    stage lead_stage NOT NULL DEFAULT 'New Lead',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    assigned_executive VARCHAR(100)
);

-- Lead Follow-Ups Table
CREATE TABLE lead_followups (
    id VARCHAR(50) PRIMARY KEY,
    lead_id VARCHAR(50) REFERENCES crm_leads(id) ON DELETE CASCADE,
    follow_up_date DATE NOT NULL,
    notes TEXT NOT NULL,
    sales_executive VARCHAR(100) NOT NULL,
    next_follow_up DATE NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Site Visits Table
CREATE TABLE site_visits (
    id VARCHAR(50) PRIMARY KEY,
    visit_date DATE NOT NULL,
    project_id VARCHAR(50) REFERENCES erp_projects(id),
    lead_id VARCHAR(50) REFERENCES crm_leads(id) ON DELETE CASCADE,
    assigned_executive VARCHAR(100) NOT NULL,
    feedback TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'Scheduled' -- Scheduled, Completed, Cancelled
);

-- Brokers Table
CREATE TABLE brokers (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    mobile VARCHAR(20) NOT NULL,
    address TEXT,
    commission_percent NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    sales_history_count INT DEFAULT 0,
    total_commission_earned NUMERIC(15, 2) DEFAULT 0.00
);

-- Broker Commissions Table
CREATE TABLE broker_commissions (
    id VARCHAR(50) PRIMARY KEY,
    broker_id VARCHAR(50) REFERENCES brokers(id) ON DELETE CASCADE,
    lead_id VARCHAR(50) REFERENCES crm_leads(id),
    booking_id VARCHAR(50), -- Links with existing plot bookings
    sale_value NUMERIC(15, 2) NOT NULL,
    commission_percent NUMERIC(5, 2) NOT NULL,
    calculated_commission NUMERIC(15, 2) GENERATED ALWAYS AS (sale_value * (commission_percent / 100)) STORED,
    status VARCHAR(30) NOT NULL DEFAULT 'Pending', -- Pending, Approved, Paid
    created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    payout_date TIMESTAMP WITH TIME ZONE
);

-- Customer Communications Table (SMS/Email histories)
CREATE TABLE customer_communications (
    id VARCHAR(50) PRIMARY KEY,
    lead_id VARCHAR(50) REFERENCES crm_leads(id) ON DELETE SET NULL,
    customer_id VARCHAR(50), -- Cross links to core customers if booking is done
    type VARCHAR(30) NOT NULL, -- SMS, Email, Call, Meeting
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    summary VARCHAR(250) NOT NULL,
    details TEXT,
    sender VARCHAR(100) NOT NULL
);

-- Booking Workflows Table (Tracks steps in automation)
CREATE TABLE booking_workflows (
    id VARCHAR(50) PRIMARY KEY,
    booking_id VARCHAR(50) NOT NULL,
    step VARCHAR(50) NOT NULL, -- Reservation, Money Receipt, Installment Schedule, Accounting Entry, Agreement Draft
    status VARCHAR(30) NOT NULL DEFAULT 'Pending', -- Pending, Completed
    completed_at TIMESTAMP WITH TIME ZONE,
    completed_by VARCHAR(100)
);

-- Indexes for lightning fast lookups
CREATE INDEX idx_crm_leads_stage ON crm_leads(stage);
CREATE INDEX idx_lead_followups_date ON lead_followups(follow_up_date);
CREATE INDEX idx_broker_commissions_status ON broker_commissions(status);
`}</pre>
        </div>

        {/* NestJS Module File */}
        <div className="bg-slate-900 text-slate-300 p-6 rounded-2xl border border-slate-800 font-mono text-[11px] h-[500px] overflow-y-auto">
          <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-800 text-slate-200">
            <Server className="text-blue-400" size={16} />
            <span className="font-bold">2. NestJS Module & DTOs</span>
          </div>
          <pre>{`// ==========================================
// sales-crm.dto.ts
// ==========================================
import { IsString, IsNotEmpty, IsEmail, IsEnum, IsNumber, IsOptional } from 'class-validator';

export class CreateLeadDto {
  @IsString()
  @IsNotEmpty()
  customerName: string;

  @IsString()
  @IsNotEmpty()
  mobile: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsNotEmpty()
  source: string;

  @IsString()
  @IsNotEmpty()
  interestedProjectId: string;

  @IsNumber()
  budget: number;

  @IsString()
  @IsOptional()
  requirement?: string;
}

export class ConfirmBookingDto {
  @IsString()
  @IsNotEmpty()
  leadId: string;

  @IsString()
  @IsNotEmpty()
  projectId: string;

  @IsString()
  @IsNotEmpty()
  unitId: string;

  @IsNumber()
  totalAgreedPrice: number;

  @IsNumber()
  bookingMoneyBdt: number;

  @IsNumber()
  downpaymentBdt: number;

  @IsNumber()
  installmentCount: number;
}

// ==========================================
// sales-crm.controller.ts
// ==========================================
import { Controller, Post, Body, Get, Param, Put, Patch } from '@nestjs/common';
import { SalesCrmService } from './sales-crm.service';
import { CreateLeadDto, ConfirmBookingDto } from './sales-crm.dto';

@Controller('api/sales-crm')
export class SalesCrmController {
  constructor(private readonly crmService: SalesCrmService) {}

  @Post('leads')
  async createLead(@Body() createLeadDto: CreateLeadDto) {
    return this.crmService.createLead(createLeadDto);
  }

  @Get('leads')
  async getAllLeads() {
    return this.crmService.getAllLeads();
  }

  @Patch('leads/:id/stage')
  async updateStage(@Param('id') id: string, @Body('stage') stage: string) {
    return this.crmService.updateLeadStage(id, stage);
  }

  @Post('booking-automation')
  async triggerBookingAutomation(@Body() confirmBookingDto: ConfirmBookingDto) {
    return this.crmService.executeBookingWorkflow(confirmBookingDto);
  }

  @Get('brokers/:id/commissions')
  async getBrokerCommissions(@Param('id') brokerId: string) {
    return this.crmService.getCommissionsByBroker(brokerId);
  }
}
`}</pre>
        </div>

        {/* NestJS Service File */}
        <div className="bg-slate-900 text-slate-300 p-6 rounded-2xl border border-slate-800 font-mono text-[11px] lg:col-span-2 h-[450px] overflow-y-auto">
          <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-800 text-slate-200">
            <Server className="text-blue-400" size={16} />
            <span className="font-bold">3. NestJS Booking Automation Engine Core Service (sales-crm.service.ts)</span>
          </div>
          <pre>{`import { Injectable, BadRequestException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ConfirmBookingDto } from './sales-crm.dto';

@Injectable()
export class SalesCrmService {
  constructor(private dataSource: DataSource) {}

  async executeBookingWorkflow(dto: ConfirmBookingDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Generate Booking Number
      const bookingNo = 'BK-AK-' + Date.now().toString().slice(-6);

      // 2. Insert Customer from Lead details
      const lead = await queryRunner.manager.findOne('crm_leads', { where: { id: dto.leadId } });
      if (!lead) throw new BadRequestException('Lead not found');

      const customerId = 'cust-' + Date.now();
      await queryRunner.manager.insert('bre_customers', {
        id: customerId,
        nameEn: lead.customer_name,
        phone: lead.mobile,
        email: lead.email,
        nidNo: 'Pending-Upload',
        presentAddressEn: 'Address Pending'
      });

      // 3. Create Booking Record
      const bookingId = 'bk-' + Date.now();
      await queryRunner.manager.insert('bre_bookings', {
        id: bookingId,
        customerId,
        projectId: dto.projectId,
        unitId: dto.unitId,
        bookingDate: new Date().toISOString().split('T')[0],
        totalAgreedPrice: dto.totalAgreedPrice,
        bookingMoneyBdt: dto.bookingMoneyBdt,
        downpaymentBdt: dto.downpaymentBdt,
        installmentCount: dto.installmentCount,
        status: 'Active'
      });

      // 4. Create Installments list
      const installmentAmount = (dto.totalAgreedPrice - dto.bookingMoneyBdt - dto.downpaymentBdt) / dto.installmentCount;
      for (let i = 1; i <= dto.installmentCount; i++) {
        const dueDate = new Date();
        dueDate.setMonth(dueDate.getMonth() + i);

        await queryRunner.manager.insert('booking_installments', {
          id: 'inst-' + i + '-' + Date.now(),
          bookingId,
          installmentNo: i,
          amountBdt: installmentAmount,
          dueDate: dueDate.toISOString().split('T')[0],
          status: 'Unpaid'
        });
      }

      // 5. Reserve Unit
      await queryRunner.manager.update('erp_project_units', { id: dto.unitId }, { status: 'Booked' });

      // 6. Double Entry Accounting - Debit Cash, Credit Booking Advance
      const voucherId = 'JV-' + Date.now();
      await queryRunner.manager.insert('erp_vouchers', {
        id: voucherId,
        date: new Date().toISOString().split('T')[0],
        type: 'JV',
        narrationEn: \`Booking Advance received for unit \${dto.unitId}\`,
        refNo: bookingNo
      });

      // Debit Cash/Bank
      await queryRunner.manager.insert('erp_voucher_lines', {
        voucherId,
        accountCode: '1100', // Cash in Hand
        debit: dto.bookingMoneyBdt,
        credit: 0
      });

      // Credit Customer Advances
      await queryRunner.manager.insert('erp_voucher_lines', {
        voucherId,
        accountCode: '2200', // Customer Advances (Booking Money)
        debit: 0,
        credit: dto.bookingMoneyBdt
      });

      // 7. Update Lead stage to 'Sold' or 'Booking'
      await queryRunner.manager.update('crm_leads', { id: dto.leadId }, { stage: 'Sold' });

      await queryRunner.commitTransaction();
      return {
        success: true,
        bookingNo,
        customerId,
        bookingId,
        message: '6-Step Booking Automation executed successfully!'
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}`}</pre>
        </div>

        {/* Step-by-Step Implementation Plan */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs lg:col-span-2">
          <h5 className="font-display font-bold text-sm text-slate-800 mb-3 flex items-center gap-2">
            <FileText size={16} className="text-indigo-500" />
            {lang === 'en' ? 'Phase 5 Step-by-Step Implementation Plan' : 'ফেজ ৫ ধাপে ধাপে বাস্তবায়ন পরিকল্পনা'}
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
              <span className="text-[10px] font-bold text-slate-400 font-mono block mb-1">STEP 1</span>
              <strong className="text-xs text-slate-700 block mb-1">Database Provision</strong>
              <p className="text-[10px] text-slate-500 leading-normal">
                Execute SQL DDL commands to establish relationships and schemas for crm_leads, follow-ups, and brokers.
              </p>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
              <span className="text-[10px] font-bold text-slate-400 font-mono block mb-1">STEP 2</span>
              <strong className="text-xs text-slate-700 block mb-1">DTOs & Controllers</strong>
              <p className="text-[10px] text-slate-500 leading-normal">
                Implement input request validations with class-validator in NestJS controllers to lock input schemas.
              </p>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
              <span className="text-[10px] font-bold text-slate-400 font-mono block mb-1">STEP 3</span>
              <strong className="text-xs text-slate-700 block mb-1">Booking Transaction</strong>
              <p className="text-[10px] text-slate-500 leading-normal">
                Deploy critical database transactions enclosing customers, bookings, accounting entries, and unit updates.
              </p>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
              <span className="text-[10px] font-bold text-slate-400 font-mono block mb-1">STEP 4</span>
              <strong className="text-xs text-slate-700 block mb-1">Broker Commissions</strong>
              <p className="text-[10px] text-slate-500 leading-normal">
                Build listeners to hook booking sales with brokers, auto calculating commissions and triggering payout vouchers.
              </p>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
              <span className="text-[10px] font-bold text-slate-400 font-mono block mb-1">STEP 5</span>
              <strong className="text-xs text-slate-700 block mb-1">Communication Hub</strong>
              <p className="text-[10px] text-slate-500 leading-normal">
                Plug SMS / Email SMTP web gateways into NestJS to dispatch transactional reminders on booking updates.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
