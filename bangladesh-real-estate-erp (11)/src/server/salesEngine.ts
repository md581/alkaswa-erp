import { Router, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { 
  verifySessionToken, 
  requirePermission, 
  logSecurityEvent, 
  AuthenticatedRequest 
} from './rbacEngine';
import { dbPool, executeInTransaction } from './dbClient';

// ============================================================================
// PHASE 29 - DATABASE-DRIVEN CRM & SALES DATABASE SIMULATOR (PostgreSQL Model)
// ============================================================================

export interface Lead {
  id: string; // UUID
  companyId: string;
  branchId: string;
  customerName: string;
  phone: string;
  email: string;
  source: string;
  interestedProjectId: string;
  budget: number;
  stage: string;
  requirements: string;
  assignedExecutive: string;
  createdBy: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string; // UUID
  companyId: string;
  branchId: string;
  fullNameEn: string;
  fullNameBn: string;
  phone: string;
  email: string;
  nidNo: string;
  fatherSpouseNameEn: string;
  fatherSpouseNameBn: string;
  motherNameEn: string;
  motherNameBn: string;
  presentAddressEn: string;
  presentAddressBn: string;
  permanentAddressEn: string;
  permanentAddressBn: string;
  nomineeNameEn: string;
  nomineeNameBn: string;
  nomineeRelationEn: string;
  nomineeRelationBn: string;
  nomineePhone: string;
  nomineeNid?: string;
  occupationEn?: string;
  occupationBn?: string;
  tinNo?: string;
  emergencyContactPhone?: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface CustomerDocument {
  id: string;
  companyId: string;
  branchId: string;
  customerId: string;
  title: string;
  category: string;
  fileUrl: string;
  uploadedBy: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: string;
  companyId: string;
  branchId: string;
  customerId: string;
  projectId: string;
  unitId: string;
  bookingDate: string;
  totalAgreedPrice: number;
  bookingMoneyBdt: number;
  downpaymentBdt: number;
  installmentCount: number;
  salesPersonId: string;
  commissionPercentage: number;
  status: 'Active' | 'Cancelled' | 'Completed';
  cancellationDate?: string;
  refundAmount?: number;
  cancellationFee?: number;
  cancellationReason?: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface BookingUnit {
  id: string;
  companyId: string;
  branchId: string;
  bookingId: string;
  unitId: string;
  status: 'Reserved' | 'Sold' | 'Released';
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface Installment {
  id: string;
  companyId: string;
  branchId: string;
  bookingId: string;
  installmentNo: number;
  dueDate: string;
  amountBdt: number;
  amountPaidBdt: number;
  status: 'Unpaid' | 'Paid' | 'Partially Paid' | 'Overdue';
  paidDate?: string;
  titleEn: string;
  titleBn: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentCollection {
  id: string;
  companyId: string;
  branchId: string;
  bookingId: string;
  installmentId?: string;
  receiptNo: string;
  collectionDate: string;
  amountCollected: number;
  paymentMode: string;
  referenceNo?: string;
  remarks?: string;
  status: 'Verified' | 'Pending Verification' | 'Bounced';
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface SalesRepresentative {
  id: string;
  companyId: string;
  branchId: string;
  userId: string;
  fullName: string;
  targetBdt: number;
  achievementsBdt: number;
  isDeleted: boolean;
  isOnline: boolean;
}

export interface LeadActivity {
  id: string;
  companyId: string;
  branchId: string;
  leadId: string;
  activityType: 'Call' | 'Meeting' | 'Site Visit' | 'Email' | 'SMS';
  summary: string;
  details: string;
  activityDate: string;
  executiveId: string;
  isDeleted: boolean;
}

export interface CustomerNote {
  id: string;
  companyId: string;
  branchId: string;
  customerId: string;
  noteText: string;
  createdAt: string;
  createdBy: string;
  isDeleted: boolean;
}

// ============================================================================
// IN-MEMORY TABLE STORAGE (ROBUST & PERMANENT SIMULATION BACKED)
// ============================================================================

export const leadsDb: Lead[] = [
  {
    id: 'lnd-ld-1',
    companyId: 'c1',
    branchId: 'b1',
    customerName: 'Kazi Farhan',
    phone: '01711223344',
    email: 'kazi.farhan@gmail.com',
    source: 'Facebook',
    interestedProjectId: 'p1',
    budget: 8500000,
    stage: 'Negotiation',
    requirements: '3-Bedroom Apartment on 6th Floor or above',
    assignedExecutive: 'Tariq Anam',
    createdBy: 'system',
    isDeleted: false,
    createdAt: '2026-06-10T10:00:00Z',
    updatedAt: '2026-06-10T10:00:00Z'
  },
  {
    id: 'lnd-ld-2',
    companyId: 'c1',
    branchId: 'b1',
    customerName: 'Dr. Nusrat Jahan',
    phone: '01819876543',
    email: 'nusrat.jahan@popular.com.bd',
    source: 'Website',
    interestedProjectId: 'p2',
    budget: 12000000,
    stage: 'Site Visit Completed',
    requirements: '4-Bedroom premium unit with south-facing balcony',
    assignedExecutive: 'Sabina Yasmin',
    createdBy: 'system',
    isDeleted: false,
    createdAt: '2026-06-15T11:30:00Z',
    updatedAt: '2026-06-15T11:30:00Z'
  },
  {
    id: 'lnd-ld-3',
    companyId: 'c1',
    branchId: 'b1',
    customerName: 'Anwar Hossain',
    phone: '01911556677',
    email: 'anwar.h@hossain-group.com',
    source: 'Broker',
    interestedProjectId: 'p1',
    budget: 9500000,
    stage: 'Booking',
    requirements: 'Plot/Flat with dual car parking space',
    assignedExecutive: 'Sabina Yasmin',
    createdBy: 'system',
    isDeleted: false,
    createdAt: '2026-06-20T09:15:00Z',
    updatedAt: '2026-06-20T09:15:00Z'
  },
  {
    id: 'lnd-ld-4',
    companyId: 'c1',
    branchId: 'b1',
    customerName: 'Tanveer Rahman',
    phone: '01511224466',
    email: 'tanveer.rahman@outlook.com',
    source: 'Walk-In',
    interestedProjectId: 'p3',
    budget: 15000000,
    stage: 'New Lead',
    requirements: 'Duplex penthouse option or high-end unit',
    assignedExecutive: 'Tariq Anam',
    createdBy: 'system',
    isDeleted: false,
    createdAt: '2026-07-01T14:20:00Z',
    updatedAt: '2026-07-01T14:20:00Z'
  }
];

export const customersDb: Customer[] = [
  {
    id: 'cst-usr-1',
    companyId: 'c1',
    branchId: 'b1',
    fullNameEn: 'Tahsin Ahmed Chowdhury',
    fullNameBn: 'তাহসিন আহমেদ চৌধুরী',
    phone: '01712000111',
    email: 'tahsin.chowdhury@outlook.com',
    nidNo: '8273645192837',
    fatherSpouseNameEn: 'Late Kamal Ahmed Chowdhury',
    fatherSpouseNameBn: 'মৃত কামাল আহমেদ চৌধুরী',
    motherNameEn: 'Rowshan Ara Begum',
    motherNameBn: 'রওশন আরা বেগম',
    presentAddressEn: 'Flat 4B, House 12, Road 4, Banani, Dhaka',
    presentAddressBn: 'ফ্ল্যাট ৪বি, বাসা ১২, রোড ৪, বনানী, ঢাকা',
    permanentAddressEn: 'Chowdhury Bari, Laldighi, Chittagong',
    permanentAddressBn: 'চৌধুরী বাড়ি, লালদিঘী, চট্টগ্রাম',
    nomineeNameEn: 'Farhana Chowdhury',
    nomineeNameBn: 'ফারহানা চৌধুরী',
    nomineeRelationEn: 'Spouse',
    nomineeRelationBn: 'স্ত্রী',
    nomineePhone: '01712000112',
    nomineeNid: '1928374650',
    occupationEn: 'Business Director',
    occupationBn: 'ব্যবসায়ী',
    tinNo: '182736452',
    emergencyContactPhone: '01712000112',
    isDeleted: false,
    createdAt: '2026-05-15T08:00:00Z',
    updatedAt: '2026-05-15T08:00:00Z',
    createdBy: 'system'
  },
  {
    id: 'cst-usr-2',
    companyId: 'c1',
    branchId: 'b1',
    fullNameEn: 'Ayesha Siddiqua',
    fullNameBn: 'আয়েশা সিদ্দিকা',
    phone: '01815999888',
    email: 'ayesha.sidd@gmail.com',
    nidNo: '9182736451245',
    fatherSpouseNameEn: 'Abu Bakar Siddique',
    fatherSpouseNameBn: 'আবু বকর সিদ্দিক',
    motherNameEn: 'Mariam Begum',
    motherNameBn: 'মরিয়ম বেগম',
    presentAddressEn: 'Apartment 2A, Green Tower, Lalmatia, Dhaka',
    presentAddressBn: 'অ্যাপার্টমেন্ট ২এ, গ্রীন টাওয়ার, লালমাটিয়া, ঢাকা',
    permanentAddressEn: 'Siddique Villa, Faridpur Sadar',
    permanentAddressBn: 'সিদ্দিক ভিলা, ফরিদপুর সদর',
    nomineeNameEn: 'Abu Bakar Siddique',
    nomineeNameBn: 'আবু বকর সিদ্দিক',
    nomineeRelationEn: 'Father',
    nomineeRelationBn: 'পিতা',
    nomineePhone: '01815999880',
    nomineeNid: '1234567890',
    occupationEn: 'Senior Software Engineer',
    occupationBn: 'সফটওয়্যার প্রকৌশলী',
    isDeleted: false,
    createdAt: '2026-05-20T09:00:00Z',
    updatedAt: '2026-05-20T09:00:00Z',
    createdBy: 'system'
  }
];

export const customerDocumentsDb: CustomerDocument[] = [
  {
    id: 'doc-1',
    companyId: 'c1',
    branchId: 'b1',
    customerId: 'cst-usr-1',
    title: 'Customer NID Card',
    category: 'NID',
    fileUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=800&q=80',
    uploadedBy: 'u-fnd',
    isDeleted: false,
    createdAt: '2026-05-15T08:30:00Z',
    updatedAt: '2026-05-15T08:30:00Z'
  }
];

export const bookingsDb: Booking[] = [
  {
    id: 'bkg-1',
    companyId: 'c1',
    branchId: 'b1',
    customerId: 'cst-usr-1',
    projectId: 'p1',
    unitId: 'u1-1',
    bookingDate: '2026-05-15',
    totalAgreedPrice: 7500000,
    bookingMoneyBdt: 500000,
    downpaymentBdt: 1000000,
    installmentCount: 12,
    salesPersonId: 'u-fnd',
    commissionPercentage: 2.5,
    status: 'Active',
    isDeleted: false,
    createdAt: '2026-05-15T10:00:00Z',
    updatedAt: '2026-05-15T10:00:00Z',
    createdBy: 'system'
  }
];

export const bookingUnitsDb: BookingUnit[] = [
  {
    id: 'bkg-u-1',
    companyId: 'c1',
    branchId: 'b1',
    bookingId: 'bkg-1',
    unitId: 'u1-1',
    status: 'Sold',
    isDeleted: false,
    createdAt: '2026-05-15T10:00:00Z',
    updatedAt: '2026-05-15T10:00:00Z',
    createdBy: 'system'
  }
];

export const installmentsDb: Installment[] = [
  {
    id: 'inst-1',
    companyId: 'c1',
    branchId: 'b1',
    bookingId: 'bkg-1',
    installmentNo: 1,
    dueDate: '2026-06-15',
    amountBdt: 500000,
    amountPaidBdt: 500000,
    status: 'Paid',
    paidDate: '2026-06-12',
    titleEn: 'Installment #1',
    titleBn: 'কিস্তি নং ১',
    isDeleted: false,
    createdAt: '2026-05-15T10:05:00Z',
    updatedAt: '2026-05-15T10:05:00Z'
  },
  {
    id: 'inst-2',
    companyId: 'c1',
    branchId: 'b1',
    bookingId: 'bkg-1',
    installmentNo: 2,
    dueDate: '2026-07-15',
    amountBdt: 500000,
    amountPaidBdt: 200000,
    status: 'Partially Paid',
    paidDate: '2026-07-05',
    titleEn: 'Installment #2',
    titleBn: 'কিস্তি নং ২',
    isDeleted: false,
    createdAt: '2026-05-15T10:05:00Z',
    updatedAt: '2026-05-15T10:05:00Z'
  },
  {
    id: 'inst-3',
    companyId: 'c1',
    branchId: 'b1',
    bookingId: 'bkg-1',
    installmentNo: 3,
    dueDate: '2026-08-15',
    amountBdt: 500000,
    amountPaidBdt: 0,
    status: 'Unpaid',
    titleEn: 'Installment #3',
    titleBn: 'কিস্তি নং ৩',
    isDeleted: false,
    createdAt: '2026-05-15T10:05:00Z',
    updatedAt: '2026-05-15T10:05:00Z'
  }
];

export const paymentCollectionsDb: PaymentCollection[] = [
  {
    id: 'col-1',
    companyId: 'c1',
    branchId: 'b1',
    bookingId: 'bkg-1',
    installmentId: 'inst-1',
    receiptNo: 'MR-2026-0001',
    collectionDate: '2026-06-12',
    amountCollected: 500000,
    paymentMode: 'Bank Transfer',
    referenceNo: 'TXN-928374',
    remarks: 'Full payment for 1st installment',
    status: 'Verified',
    isDeleted: false,
    createdAt: '2026-06-12T14:30:00Z',
    updatedAt: '2026-06-12T14:30:00Z',
    createdBy: 'u-fnd'
  },
  {
    id: 'col-2',
    companyId: 'c1',
    branchId: 'b1',
    bookingId: 'bkg-1',
    installmentId: 'inst-2',
    receiptNo: 'MR-2026-0002',
    collectionDate: '2026-07-05',
    amountCollected: 200000,
    paymentMode: 'Cheque',
    referenceNo: 'CHQ-0019283',
    remarks: 'Partial payment',
    status: 'Verified',
    isDeleted: false,
    createdAt: '2026-07-05T11:00:00Z',
    updatedAt: '2026-07-05T11:00:00Z',
    createdBy: 'u-fnd'
  }
];

export const salesRepresentativesDb: SalesRepresentative[] = [
  { id: 'rep-1', companyId: 'c1', branchId: 'b1', userId: 'u-fnd', fullName: 'Tariq Anam', targetBdt: 50000000, achievementsBdt: 12500000, isDeleted: false, isOnline: true },
  { id: 'rep-2', companyId: 'c1', branchId: 'b1', userId: 'u-md', fullName: 'Sabina Yasmin', targetBdt: 60000000, achievementsBdt: 24000000, isDeleted: false, isOnline: true }
];

export const leadActivitiesDb: LeadActivity[] = [
  { id: 'act-1', companyId: 'c1', branchId: 'b1', leadId: 'lnd-ld-1', activityType: 'Call', summary: 'Introductory Call', details: 'Discussed project overview, sector details, and budget limits.', activityDate: '2026-06-12T11:00:00Z', executiveId: 'u-fnd', isDeleted: false },
  { id: 'act-2', companyId: 'c1', branchId: 'b1', leadId: 'lnd-ld-1', activityType: 'Site Visit', summary: 'Site Tour completed', details: 'Guided customer across Phase 1 & tower layout structures.', activityDate: '2026-06-25T15:00:00Z', executiveId: 'u-fnd', isDeleted: false }
];

export const customerNotesDb: CustomerNote[] = [
  { id: 'nt-1', companyId: 'c1', branchId: 'b1', customerId: 'cst-usr-1', noteText: 'Customer is extremely punctual about payments. Prefers bank transfers on the 10th of every month.', createdAt: '2026-05-15T09:00:00Z', createdBy: 'u-fnd', isDeleted: false }
];

// ============================================================================
// FILE-BACKED PERSISTENCE SYNC LAYER
// ============================================================================
const DATA_DIR = process.cwd();
const LEADS_FILE = path.join(DATA_DIR, 'leadsDb.json');
const CUSTOMERS_FILE = path.join(DATA_DIR, 'customersDb.json');
const C_DOCS_FILE = path.join(DATA_DIR, 'customerDocumentsDb.json');
const BOOKINGS_FILE = path.join(DATA_DIR, 'bookingsDb.json');
const B_UNITS_FILE = path.join(DATA_DIR, 'bookingUnitsDb.json');
const INSTALLMENTS_FILE = path.join(DATA_DIR, 'installmentsDb.json');
const PAYMENTS_FILE = path.join(DATA_DIR, 'paymentCollectionsDb.json');
const REPS_FILE = path.join(DATA_DIR, 'salesRepresentativesDb.json');
const ACTIVITIES_FILE = path.join(DATA_DIR, 'leadActivitiesDb.json');
const NOTES_FILE = path.join(DATA_DIR, 'customerNotesDb.json');

export async function saveSalesDataToPg() {
  if (!dbPool) return;
  try {
    const client = await dbPool.connect();
    try {
      await client.query("BEGIN");
      
      for (const cust of customersDb) {
        await client.query(`
          INSERT INTO sales_customers (
            id, company_id, branch_id, full_name_en, full_name_bn, phone, email, nid_no,
            father_spouse_name_en, father_spouse_name_bn, mother_name_en, mother_name_bn,
            present_address_en, present_address_bn, permanent_address_en, permanent_address_bn,
            nominee_name_en, nominee_name_bn, nominee_relation_en, nominee_relation_bn, nominee_phone, nominee_nid,
            occupation_en, occupation_bn, tin_no, emergency_contact_phone, is_deleted, created_by
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28)
          ON CONFLICT (id) DO UPDATE SET
            company_id = EXCLUDED.company_id, branch_id = EXCLUDED.branch_id, full_name_en = EXCLUDED.full_name_en, full_name_bn = EXCLUDED.full_name_bn,
            phone = EXCLUDED.phone, email = EXCLUDED.email, nid_no = EXCLUDED.nid_no, present_address_en = EXCLUDED.present_address_en,
            present_address_bn = EXCLUDED.present_address_bn, permanent_address_en = EXCLUDED.permanent_address_en, permanent_address_bn = EXCLUDED.permanent_address_bn,
            nominee_name_en = EXCLUDED.nominee_name_en, nominee_name_bn = EXCLUDED.nominee_name_bn, nominee_relation_en = EXCLUDED.nominee_relation_en, nominee_relation_bn = EXCLUDED.nominee_relation_bn,
            nominee_phone = EXCLUDED.nominee_phone, nominee_nid = EXCLUDED.nominee_nid, occupation_en = EXCLUDED.occupation_en, occupation_bn = EXCLUDED.occupation_bn,
            tin_no = EXCLUDED.tin_no, emergency_contact_phone = EXCLUDED.emergency_contact_phone, is_deleted = EXCLUDED.is_deleted
        `, [
          cust.id, cust.companyId, cust.branchId, cust.fullNameEn, cust.fullNameBn, cust.phone, cust.email, cust.nidNo,
          cust.fatherSpouseNameEn, cust.fatherSpouseNameBn, cust.motherNameEn, cust.motherNameBn,
          cust.presentAddressEn, cust.presentAddressBn, cust.permanentAddressEn, cust.permanentAddressBn,
          cust.nomineeNameEn, cust.nomineeNameBn, cust.nomineeRelationEn, cust.nomineeRelationBn, cust.nomineePhone, cust.nomineeNid,
          cust.occupationEn, cust.occupationBn, cust.tinNo, cust.emergencyContactPhone, cust.isDeleted, cust.createdBy
        ]);
      }

      for (const bkg of bookingsDb) {
        await client.query(`
          INSERT INTO sales_bookings (
            id, company_id, branch_id, customer_id, project_id, unit_id, booking_date,
            total_agreed_price, booking_money_bdt, downpayment_bdt, installment_count,
            sales_person_id, commission_percentage, status, cancellation_date, refund_amount,
            cancellation_fee, cancellation_reason, is_deleted, created_by
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
          ON CONFLICT (id) DO UPDATE SET
            company_id = EXCLUDED.company_id, branch_id = EXCLUDED.branch_id, customer_id = EXCLUDED.customer_id, project_id = EXCLUDED.project_id,
            unit_id = EXCLUDED.unit_id, booking_date = EXCLUDED.booking_date, total_agreed_price = EXCLUDED.total_agreed_price,
            booking_money_bdt = EXCLUDED.booking_money_bdt, downpayment_bdt = EXCLUDED.downpayment_bdt, installment_count = EXCLUDED.installment_count,
            sales_person_id = EXCLUDED.sales_person_id, commission_percentage = EXCLUDED.commission_percentage, status = EXCLUDED.status,
            cancellation_date = EXCLUDED.cancellation_date, refund_amount = EXCLUDED.refund_amount, cancellation_fee = EXCLUDED.cancellation_fee,
            cancellation_reason = EXCLUDED.cancellation_reason, is_deleted = EXCLUDED.is_deleted
        `, [
          bkg.id, bkg.companyId, bkg.branchId, bkg.customerId, bkg.projectId, bkg.unitId, bkg.bookingDate,
          bkg.totalAgreedPrice, bkg.bookingMoneyBdt, bkg.downpaymentBdt, bkg.installmentCount,
          bkg.salesPersonId, bkg.commissionPercentage, bkg.status, bkg.cancellationDate || null, bkg.refundAmount || null,
          bkg.cancellationFee || null, bkg.cancellationReason || null, bkg.isDeleted, bkg.createdBy
        ]);
      }

      for (const inst of installmentsDb) {
        await client.query(`
          INSERT INTO sales_installments (
            id, company_id, branch_id, booking_id, installment_no, due_date, amount_bdt,
            amount_paid_bdt, status, paid_date, title_en, title_bn, is_deleted
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
          ON CONFLICT (id) DO UPDATE SET
            company_id = EXCLUDED.company_id, branch_id = EXCLUDED.branch_id, booking_id = EXCLUDED.booking_id, installment_no = EXCLUDED.installment_no,
            due_date = EXCLUDED.due_date, amount_bdt = EXCLUDED.amount_bdt, amount_paid_bdt = EXCLUDED.amount_paid_bdt, status = EXCLUDED.status,
            paid_date = EXCLUDED.paid_date, title_en = EXCLUDED.title_en, title_bn = EXCLUDED.title_bn, is_deleted = EXCLUDED.is_deleted
        `, [
          inst.id, inst.companyId, inst.branchId, inst.bookingId, inst.installmentNo, inst.dueDate, inst.amountBdt,
          inst.amountPaidBdt, inst.status, inst.paidDate || null, inst.titleEn, inst.titleBn, inst.isDeleted
        ]);
      }

      for (const col of paymentCollectionsDb) {
        await client.query(`
          INSERT INTO sales_payment_collections (
            id, company_id, branch_id, booking_id, installment_id, receipt_no, collection_date,
            amount_collected, payment_mode, reference_no, remarks, status, is_deleted, created_by
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
          ON CONFLICT (id) DO UPDATE SET
            company_id = EXCLUDED.company_id, branch_id = EXCLUDED.branch_id, booking_id = EXCLUDED.booking_id, installment_id = EXCLUDED.installment_id,
            receipt_no = EXCLUDED.receipt_no, collection_date = EXCLUDED.collection_date, amount_collected = EXCLUDED.amount_collected,
            payment_mode = EXCLUDED.payment_mode, reference_no = EXCLUDED.reference_no, remarks = EXCLUDED.remarks, status = EXCLUDED.status,
            is_deleted = EXCLUDED.is_deleted
        `, [
          col.id, col.companyId, col.branchId, col.bookingId, col.installmentId, col.receiptNo, col.collectionDate,
          col.amountCollected, col.paymentMode, col.referenceNo, col.remarks || null, col.status, col.isDeleted, col.createdBy
        ]);
      }

      for (const l of leadsDb) {
        await client.query(`
          INSERT INTO leads (
            id, company_id, branch_id, customer_name, phone, email, source, interested_project_id, budget, stage, requirements, assigned_executive, is_deleted, created_by, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
          ON CONFLICT (id) DO UPDATE SET
            company_id = EXCLUDED.company_id, branch_id = EXCLUDED.branch_id, customer_name = EXCLUDED.customer_name, phone = EXCLUDED.phone,
            email = EXCLUDED.email, source = EXCLUDED.source, interested_project_id = EXCLUDED.interested_project_id, budget = EXCLUDED.budget,
            stage = EXCLUDED.stage, requirements = EXCLUDED.requirements, assigned_executive = EXCLUDED.assigned_executive, is_deleted = EXCLUDED.is_deleted,
            updated_at = EXCLUDED.updated_at
        `, [
          l.id, l.companyId || null, l.branchId || null, l.customerName, l.phone, l.email || null, l.source || null, l.interestedProjectId || null,
          l.budget ? parseFloat(l.budget as any) : 0, l.stage || null, l.requirements || null, l.assignedExecutive || null, l.isDeleted || false, l.createdBy || null,
          l.createdAt ? new Date(l.createdAt) : new Date(), l.updatedAt ? new Date(l.updatedAt) : new Date()
        ]);
      }

      for (const bu of bookingUnitsDb) {
        await client.query(`
          INSERT INTO booking_units (
            id, company_id, branch_id, booking_id, unit_id, status, is_deleted, created_by, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          ON CONFLICT (id) DO UPDATE SET
            company_id = EXCLUDED.company_id, branch_id = EXCLUDED.branch_id, booking_id = EXCLUDED.booking_id, unit_id = EXCLUDED.unit_id,
            status = EXCLUDED.status, is_deleted = EXCLUDED.is_deleted, updated_at = EXCLUDED.updated_at
        `, [
          bu.id, bu.companyId || null, bu.branchId || null, bu.bookingId, bu.unitId, bu.status, bu.isDeleted || false, bu.createdBy || null,
          bu.createdAt ? new Date(bu.createdAt) : new Date(), bu.updatedAt ? new Date(bu.updatedAt) : new Date()
        ]);
      }

      await client.query("COMMIT");
    } catch (e) {
      await client.query("ROLLBACK");
      console.error("Failed to persist sales data to PostgreSQL inside saveSalesDataToPg:", e);
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("Database connection error in saveSalesDataToPg:", err);
  }
}

export async function syncSalesFromPostgres() {
  if (!dbPool) return;
  try {
    const custRes = await dbPool.query("SELECT * FROM sales_customers");
    if (custRes.rows.length > 0) {
      customersDb.length = 0;
      customersDb.push(...custRes.rows.map((row: any) => ({
        id: row.id,
        companyId: row.company_id,
        branchId: row.branch_id,
        fullNameEn: row.full_name_en,
        fullNameBn: row.full_name_bn,
        phone: row.phone,
        email: row.email,
        nidNo: row.nid_no,
        fatherSpouseNameEn: row.father_spouse_name_en,
        fatherSpouseNameBn: row.father_spouse_name_bn,
        motherNameEn: row.mother_name_en,
        motherNameBn: row.mother_name_bn,
        presentAddressEn: row.present_address_en,
        presentAddressBn: row.present_address_bn,
        permanentAddressEn: row.permanent_address_en,
        permanentAddressBn: row.permanent_address_bn,
        nomineeNameEn: row.nominee_name_en,
        nomineeNameBn: row.nominee_name_bn,
        nomineeRelationEn: row.nominee_relation_en,
        nomineeRelationBn: row.nominee_relation_bn,
        nomineePhone: row.nominee_phone,
        nomineeNid: row.nominee_nid,
        occupationEn: row.occupation_en,
        occupationBn: row.occupation_bn,
        tinNo: row.tin_no,
        emergencyContactPhone: row.emergency_contact_phone,
        isDeleted: row.is_deleted,
        createdAt: new Date(row.created_at).toISOString(),
        updatedAt: new Date(row.updated_at).toISOString(),
        createdBy: row.created_by
      })));
    }

    const bkgRes = await dbPool.query("SELECT * FROM sales_bookings");
    if (bkgRes.rows.length > 0) {
      bookingsDb.length = 0;
      bookingsDb.push(...bkgRes.rows.map((row: any) => ({
        id: row.id,
        companyId: row.company_id,
        branchId: row.branch_id,
        customerId: row.customer_id,
        projectId: row.project_id,
        unitId: row.unit_id,
        bookingDate: row.booking_date,
        totalAgreedPrice: Number(row.total_agreed_price),
        bookingMoneyBdt: Number(row.booking_money_bdt),
        downpaymentBdt: Number(row.downpayment_bdt),
        installmentCount: row.installment_count,
        salesPersonId: row.sales_person_id,
        commissionPercentage: Number(row.commission_percentage),
        status: row.status,
        cancellationDate: row.cancellation_date || undefined,
        refundAmount: row.refund_amount ? Number(row.refund_amount) : undefined,
        cancellationFee: row.cancellation_fee ? Number(row.cancellation_fee) : undefined,
        cancellationReason: row.cancellation_reason || undefined,
        isDeleted: row.is_deleted,
        createdAt: new Date(row.created_at).toISOString(),
        updatedAt: new Date(row.updated_at).toISOString(),
        createdBy: row.created_by
      })));
    }

    const instRes = await dbPool.query("SELECT * FROM sales_installments");
    if (instRes.rows.length > 0) {
      installmentsDb.length = 0;
      installmentsDb.push(...instRes.rows.map((row: any) => ({
        id: row.id,
        companyId: row.company_id,
        branchId: row.branch_id,
        bookingId: row.booking_id,
        installmentNo: row.installment_no,
        dueDate: row.due_date,
        amountBdt: Number(row.amount_bdt),
        amountPaidBdt: Number(row.amount_paid_bdt),
        status: row.status,
        paidDate: row.paid_date || undefined,
        titleEn: row.title_en,
        titleBn: row.title_bn,
        isDeleted: row.is_deleted,
        createdAt: new Date(row.created_at).toISOString(),
        updatedAt: new Date(row.updated_at).toISOString()
      })));
    }

    const payRes = await dbPool.query("SELECT * FROM sales_payment_collections");
    if (payRes.rows.length > 0) {
      paymentCollectionsDb.length = 0;
      paymentCollectionsDb.push(...payRes.rows.map((row: any) => ({
        id: row.id,
        companyId: row.company_id,
        branchId: row.branch_id,
        bookingId: row.booking_id,
        installmentId: row.installment_id,
        receiptNo: row.receipt_no,
        collectionDate: row.collection_date,
        amountCollected: Number(row.amount_collected),
        paymentMode: row.payment_mode,
        referenceNo: row.reference_no,
        remarks: row.remarks || undefined,
        status: row.status,
        isDeleted: row.is_deleted,
        createdAt: new Date(row.created_at).toISOString(),
        updatedAt: new Date(row.updated_at).toISOString(),
        createdBy: row.created_by
      })));
    }

    const leadsRes = await dbPool.query("SELECT * FROM leads");
    if (leadsRes.rows.length > 0) {
      leadsDb.length = 0;
      leadsDb.push(...leadsRes.rows.map((row: any) => ({
        id: row.id,
        companyId: row.company_id,
        branchId: row.branch_id,
        customerName: row.customer_name,
        phone: row.phone,
        email: row.email,
        source: row.source,
        interestedProjectId: row.interested_project_id,
        budget: Number(row.budget || 0),
        stage: row.stage,
        requirements: row.requirements,
        assignedExecutive: row.assigned_executive,
        isDeleted: row.is_deleted,
        createdBy: row.created_by,
        createdAt: new Date(row.created_at).toISOString(),
        updatedAt: new Date(row.updated_at).toISOString()
      })));
    }

    const buRes = await dbPool.query("SELECT * FROM booking_units");
    if (buRes.rows.length > 0) {
      bookingUnitsDb.length = 0;
      bookingUnitsDb.push(...buRes.rows.map((row: any) => ({
        id: row.id,
        companyId: row.company_id,
        branchId: row.branch_id,
        bookingId: row.booking_id,
        unitId: row.unit_id,
        status: row.status,
        isDeleted: row.is_deleted,
        createdBy: row.created_by,
        createdAt: new Date(row.created_at).toISOString(),
        updatedAt: new Date(row.updated_at).toISOString()
      })));
    }
  } catch (err) {
    console.error("Failed to sync sales engine databases from PostgreSQL:", err);
  }
}

export function saveSalesData() {
  try {
    fs.writeFileSync(LEADS_FILE, JSON.stringify(leadsDb, null, 2), 'utf-8');
    fs.writeFileSync(C_DOCS_FILE, JSON.stringify(customerDocumentsDb, null, 2), 'utf-8');
    fs.writeFileSync(B_UNITS_FILE, JSON.stringify(bookingUnitsDb, null, 2), 'utf-8');
    fs.writeFileSync(REPS_FILE, JSON.stringify(salesRepresentativesDb, null, 2), 'utf-8');
    fs.writeFileSync(ACTIVITIES_FILE, JSON.stringify(leadActivitiesDb, null, 2), 'utf-8');
    fs.writeFileSync(NOTES_FILE, JSON.stringify(customerNotesDb, null, 2), 'utf-8');

    // Trigger async push to PostgreSQL
    saveSalesDataToPg();
  } catch (err) {
    console.error('Failed to save sales data to disk:', err);
  }
}

function loadSalesData() {
  try {
    if (fs.existsSync(LEADS_FILE)) {
      const data = JSON.parse(fs.readFileSync(LEADS_FILE, 'utf-8'));
      leadsDb.length = 0;
      leadsDb.push(...data);
    }
    if (fs.existsSync(C_DOCS_FILE)) {
      const data = JSON.parse(fs.readFileSync(C_DOCS_FILE, 'utf-8'));
      customerDocumentsDb.length = 0;
      customerDocumentsDb.push(...data);
    }
    if (fs.existsSync(B_UNITS_FILE)) {
      const data = JSON.parse(fs.readFileSync(B_UNITS_FILE, 'utf-8'));
      bookingUnitsDb.length = 0;
      bookingUnitsDb.push(...data);
    }
    if (fs.existsSync(REPS_FILE)) {
      const data = JSON.parse(fs.readFileSync(REPS_FILE, 'utf-8'));
      salesRepresentativesDb.length = 0;
      salesRepresentativesDb.push(...data);
    }
    if (fs.existsSync(ACTIVITIES_FILE)) {
      const data = JSON.parse(fs.readFileSync(ACTIVITIES_FILE, 'utf-8'));
      leadActivitiesDb.length = 0;
      leadActivitiesDb.push(...data);
    }
    if (fs.existsSync(NOTES_FILE)) {
      const data = JSON.parse(fs.readFileSync(NOTES_FILE, 'utf-8'));
      customerNotesDb.length = 0;
      customerNotesDb.push(...data);
    }
  } catch (err) {
    console.error('Failed to load sales data from disk:', err);
  }
}

loadSalesData();
if (!fs.existsSync(LEADS_FILE)) saveSalesData();

// ============================================================================
// CONCURRENCY MUTEX & BOOKING ENGINE LOGIC (STEP 2)
// ============================================================================

const allocationLock = new Set<string>();

export async function bookUnitTransaction(
  bookingData: Omit<Booking, 'id' | 'createdAt' | 'updatedAt' | 'isDeleted' | 'status'>,
  installments: Omit<Installment, 'id' | 'createdAt' | 'updatedAt' | 'isDeleted' | 'amountPaidBdt' | 'status'>[],
  req: AuthenticatedRequest
): Promise<{ success: boolean; booking?: Booking; error?: string }> {
  const { unitId, customerId } = bookingData;
  const ipAddress = (req.ip || req.socket.remoteAddress || '127.0.0.1').replace('::ffff:', '');

  // Concurrency Gate: Prevents double allocation
  if (allocationLock.has(unitId)) {
    return { success: false, error: 'Double allocation conflict. Unit is currently undergoing locks.' };
  }

  // Row Lock simulation
  allocationLock.add(unitId);

  const bookingId = `bkg-srv-${Date.now()}`;
  const newBooking: Booking = {
    ...bookingData,
    id: bookingId,
    status: 'Active',
    isDeleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const newUnitAlloc = {
    id: `bkg-u-${Date.now()}`,
    companyId: bookingData.companyId,
    branchId: bookingData.branchId,
    bookingId,
    unitId,
    status: 'Sold' as const,
    isDeleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: req.user?.id || 'system'
  };

  const newInstallmentsList: Installment[] = installments.map((inst, index) => ({
    id: `inst-srv-${Date.now()}-${index}`,
    companyId: bookingData.companyId,
    branchId: bookingData.branchId,
    bookingId,
    installmentNo: inst.installmentNo,
    dueDate: inst.dueDate,
    amountBdt: inst.amountBdt,
    amountPaidBdt: 0,
    status: 'Unpaid',
    titleEn: inst.titleEn,
    titleBn: inst.titleBn,
    isDeleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }));

  try {
    await executeInTransaction(
      async (client) => {
        if (client) {
          // SELECT ... FOR UPDATE Row Lock simulation in PostgreSQL
          const alreadyBooked = await client.query(
            "SELECT id FROM sales_bookings WHERE unit_id = $1 AND status = 'Active' AND is_deleted = FALSE",
            [unitId]
          );
          if (alreadyBooked.rows.length > 0) {
            throw new Error('Double allocation violation. Unit is already booked in PostgreSQL.');
          }

          // Insert Booking
          await client.query(`
            INSERT INTO sales_bookings (
              id, company_id, branch_id, customer_id, project_id, unit_id, booking_date,
              total_agreed_price, booking_money_bdt, downpayment_bdt, installment_count,
              sales_person_id, commission_percentage, status, is_deleted, created_by
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
          `, [
            newBooking.id, newBooking.companyId, newBooking.branchId, newBooking.customerId,
            newBooking.projectId, newBooking.unitId, newBooking.bookingDate, newBooking.totalAgreedPrice,
            newBooking.bookingMoneyBdt, newBooking.downpaymentBdt, newBooking.installmentCount,
            newBooking.salesPersonId, newBooking.commissionPercentage, newBooking.status, newBooking.isDeleted, newBooking.createdBy
          ]);

          // Insert Installments
          for (const inst of newInstallmentsList) {
            await client.query(`
              INSERT INTO sales_installments (
                id, company_id, branch_id, booking_id, installment_no, due_date, amount_bdt,
                amount_paid_bdt, status, title_en, title_bn, is_deleted
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            `, [
              inst.id, inst.companyId, inst.branchId, inst.bookingId, inst.installmentNo,
              inst.dueDate, inst.amountBdt, inst.amountPaidBdt, inst.status, inst.titleEn, inst.titleBn, inst.isDeleted
            ]);
          }
        } else {
          // Fallback verify simulation
          const alreadyBooked = bookingsDb.some(
            b => b.unitId === unitId && b.status === 'Active' && !b.isDeleted
          );
          if (alreadyBooked) {
            throw new Error('Double allocation violation. Unit is already booked by another customer portfolio.');
          }
        }
      },
      () => {
        // Local state commit on success
        bookingsDb.push(newBooking);
        bookingUnitsDb.push(newUnitAlloc);
        newInstallmentsList.forEach(inst => installmentsDb.push(inst));
        
        // Log Enterprise Security Audit
        logSecurityEvent(
          req.user?.id || 'system',
          req.user?.fullName || 'Sales Executive',
          req.user?.role || 'SLM',
          bookingData.companyId,
          bookingData.branchId,
          'CREATE',
          'sales',
          ipAddress,
          `Authorized secure property booking [${bookingId}] on Unit [${unitId}] for Customer [${customerId}].`,
          `ইউনিট [${unitId}] এর জন্য গ্রাহক [${customerId}] এর সম্পত্তি বুকিং [${bookingId}] সফলভাবে সম্পন্ন করা হয়েছে।`
        );

        saveSalesData();
      },
      () => {
        console.log("Transaction Rolled Back for booking allocation on unit:", unitId);
      }
    );

    return { success: true, booking: newBooking };
  } catch (err: any) {
    return { success: false, error: err.message || 'Booking transaction failed.' };
  } finally {
    allocationLock.delete(unitId);
  }
}

// ============================================================================
// AUTOMATIC INSTALLMENT SCHEDULE GENERATOR (STEP 6)
// ============================================================================

export function generateAutomaticInstallments(
  totalAgreed: number,
  bookingMoney: number,
  downpayment: number,
  installmentCount: number,
  frequency: 'Monthly' | 'Quarterly' | 'Custom',
  startDate: string
): Omit<Installment, 'id' | 'createdAt' | 'updatedAt' | 'isDeleted' | 'amountPaidBdt' | 'status'>[] {
  const remaining = totalAgreed - bookingMoney - downpayment;
  if (remaining <= 0 || installmentCount <= 0) return [];

  const perInstallment = Math.round((remaining / installmentCount) * 100) / 100;
  const installmentsList: Omit<Installment, 'id' | 'createdAt' | 'updatedAt' | 'isDeleted' | 'amountPaidBdt' | 'status'>[] = [];

  let currentYear = new Date(startDate).getFullYear();
  let currentMonth = new Date(startDate).getMonth();
  const baseDay = new Date(startDate).getDate() || 10;

  for (let i = 1; i <= installmentCount; i++) {
    // Handle frequency jumps
    if (i > 1) {
      if (frequency === 'Monthly') {
        currentMonth += 1;
      } else if (frequency === 'Quarterly') {
        currentMonth += 3;
      } else {
        currentMonth += 1; // Fallback
      }

      if (currentMonth > 11) {
        currentYear += Math.floor(currentMonth / 12);
        currentMonth = currentMonth % 12;
      }
    }

    // Format due date elegantly
    const paddedMonth = String(currentMonth + 1).padStart(2, '0');
    const paddedDay = String(baseDay).padStart(2, '0');
    const dueDateStr = `${currentYear}-${paddedMonth}-${paddedDay}`;

    installmentsList.push({
      companyId: 'c1',
      branchId: 'b1',
      bookingId: '',
      installmentNo: i,
      dueDate: dueDateStr,
      amountBdt: i === installmentCount ? Math.round((remaining - (perInstallment * (installmentCount - 1))) * 100) / 100 : perInstallment,
      titleEn: `Installment Schedule #${i}`,
      titleBn: `কিস্তি কিউরেক নং #${i}`
    });
  }

  return installmentsList;
}

// ============================================================================
// ROUTER & SECURED REST CONTROLLERS (STEP 3 & STEP 8)
// ============================================================================

export const salesRouter = Router();

// GET /api/sales/dashboard
salesRouter.get('/dashboard', verifySessionToken as any, requirePermission('sales:view') as any, (req: AuthenticatedRequest, res: Response) => {
  const compId = req.user?.companyId || 'c1';
  const branchId = req.user?.branchId || 'b1';

  // Filters by tenant scope
  const tenantLeads = leadsDb.filter(l => l.companyId === compId && !l.isDeleted);
  const tenantCustomers = customersDb.filter(c => c.companyId === compId && !c.isDeleted);
  const tenantBookings = bookingsDb.filter(b => b.companyId === compId && !b.isDeleted);
  const tenantInstallments = installmentsDb.filter(inst => inst.companyId === compId && !inst.isDeleted);

  // Stats calculation
  const totalLeads = tenantLeads.length;
  const qualifiedLeads = tenantLeads.filter(l => ['Negotiation', 'Booking', 'Site Visit Completed'].includes(l.stage)).length;
  const activeCustomers = tenantCustomers.length;
  const totalBookings = tenantBookings.length;

  const totalCollected = paymentCollectionsDb
    .filter(c => c.companyId === compId && c.status === 'Verified' && !c.isDeleted)
    .reduce((sum, c) => sum + Number(c.amountCollected), 0);

  const totalDueAmount = tenantInstallments
    .filter(inst => inst.status !== 'Paid')
    .reduce((sum, inst) => sum + (Number(inst.amountBdt) - Number(inst.amountPaidBdt)), 0);

  const overdueCount = tenantInstallments
    .filter(inst => inst.status === 'Overdue' || (inst.status !== 'Paid' && new Date(inst.dueDate) < new Date()))
    .length;

  // Chart data formatting
  const leadConversionFunnel = [
    { stage: 'New Lead', count: tenantLeads.filter(l => l.stage === 'New Lead').length },
    { stage: 'Site Visit Completed', count: tenantLeads.filter(l => l.stage === 'Site Visit Completed').length },
    { stage: 'Negotiation', count: tenantLeads.filter(l => l.stage === 'Negotiation').length },
    { stage: 'Booking Initiated', count: tenantLeads.filter(l => l.stage === 'Booking').length },
    { stage: 'Closed Won (Sold)', count: tenantLeads.filter(l => l.stage === 'Sold').length }
  ];

  const monthlySalesTrend = [
    { month: 'Jan 2026', sales: 12000000, target: 10000000 },
    { month: 'Feb 2026', sales: 14500000, target: 12000000 },
    { month: 'Mar 2026', sales: 19000000, target: 15000000 },
    { month: 'Apr 2026', sales: 11000000, target: 15000000 },
    { month: 'May 2026', sales: 16500000, target: 15000000 },
    { month: 'Jun 2026', sales: 24500000, target: 18000000 },
    { month: 'Jul 2026', sales: totalBookings * 7500000, target: 20000000 }
  ];

  const collectionTrend = [
    { month: 'May 2026', collected: 3200000, target: 3000000 },
    { month: 'Jun 2026', collected: 4500000, target: 4000000 },
    { month: 'Jul 2026', collected: totalCollected, target: 6000000 }
  ];

  const unitAvailabilitySummary = [
    { category: 'Available Apartment Units', count: 48 },
    { category: 'Reserved Units Under Hold', count: 12 },
    { category: 'Sold Units Confirmed', count: totalBookings }
  ];

  res.json({
    success: true,
    metrics: {
      totalLeads,
      qualifiedLeads,
      activeCustomers,
      totalBookings,
      availableUnits: 48,
      reservedUnits: 12,
      soldUnits: totalBookings,
      collectionThisMonth: totalCollected,
      dueAmount: totalDueAmount,
      overdueCount,
      conversionRate: totalLeads > 0 ? Math.round((totalBookings / totalLeads) * 100) : 0
    },
    charts: {
      leadConversionFunnel,
      monthlySalesTrend,
      collectionTrend,
      unitAvailabilitySummary
    }
  });
});

// GET /api/sales/leads
salesRouter.get('/leads', verifySessionToken as any, requirePermission('sales:view') as any, (req: AuthenticatedRequest, res: Response) => {
  const compId = req.user?.companyId || 'c1';
  const branchId = req.user?.branchId || 'b1';

  // Server-side search & filters
  const { stage, source, search } = req.query;

  let filtered = leadsDb.filter(l => l.companyId === compId && !l.isDeleted);

  if (stage) {
    filtered = filtered.filter(l => l.stage.toLowerCase() === String(stage).toLowerCase());
  }
  if (source) {
    filtered = filtered.filter(l => l.source.toLowerCase() === String(source).toLowerCase());
  }
  if (search) {
    const s = String(search).toLowerCase();
    filtered = filtered.filter(l => 
      l.customerName.toLowerCase().includes(s) || 
      l.phone.toLowerCase().includes(s) || 
      (l.email && l.email.toLowerCase().includes(s))
    );
  }

  res.json({ success: true, count: filtered.length, data: filtered });
});

// POST /api/sales/leads
salesRouter.post('/leads', verifySessionToken as any, requirePermission('sales:create') as any, (req: AuthenticatedRequest, res: Response) => {
  const { customerName, phone, email, source, interestedProjectId, budget, requirements, assignedExecutive } = req.body;
  const ipAddress = (req.ip || req.socket.remoteAddress || '127.0.0.1').replace('::ffff:', '');

  if (!customerName || !phone) {
    return res.status(400).json({ error: 'Customer Name and Mobile phone number are required.' });
  }

  const newLead: Lead = {
    id: `lnd-ld-${Date.now()}`,
    companyId: req.user?.companyId || 'c1',
    branchId: req.user?.branchId || 'b1',
    customerName,
    phone,
    email: email || '',
    source: source || 'Facebook',
    interestedProjectId: interestedProjectId || 'p1',
    budget: Number(budget) || 0,
    stage: 'New Lead',
    requirements: requirements || '',
    assignedExecutive: assignedExecutive || 'Tariq Anam',
    createdBy: req.user?.id || 'system',
    isDeleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  leadsDb.unshift(newLead);

  // Auto-register Lead Activity log
  leadActivitiesDb.push({
    id: `act-${Date.now()}`,
    companyId: newLead.companyId,
    branchId: newLead.branchId,
    leadId: newLead.id,
    activityType: 'SMS',
    summary: 'Auto-Welcome communication dispatched',
    details: `Auto-SMS dispatched to welcome Kazi Farhan into CRM pipelines.`,
    activityDate: new Date().toISOString(),
    executiveId: req.user?.id || 'system',
    isDeleted: false
  });

  logSecurityEvent(
    req.user?.id || 'system',
    req.user?.fullName || 'CRM Executive',
    req.user?.role || 'SLM',
    newLead.companyId,
    newLead.branchId,
    'CREATE',
    'sales',
    ipAddress,
    `Registered new CRM Lead [${newLead.id}] for: ${customerName}`,
    `নতুন সিআরএম লিড [${newLead.id}] নিবন্ধিত হয়েছে: ${customerName}`
  );

  saveSalesData();

  res.json({ success: true, data: newLead });
});

// GET /api/sales/customers
salesRouter.get('/customers', verifySessionToken as any, requirePermission('customer:view') as any, (req: AuthenticatedRequest, res: Response) => {
  const compId = req.user?.companyId || 'c1';
  const { search, page, limit } = req.query;

  let filtered = customersDb.filter(c => c.companyId === compId && !c.isDeleted);

  if (search) {
    const s = String(search).toLowerCase();
    filtered = filtered.filter(c => 
      c.fullNameEn.toLowerCase().includes(s) || 
      c.fullNameBn.toLowerCase().includes(s) || 
      c.phone.toLowerCase().includes(s) || 
      c.nidNo.toLowerCase().includes(s)
    );
  }

  // Server-side Pagination Support for Enterprise Scale
  const totalCount = filtered.length;
  const pageNum = parseInt(page as string) || 1;
  const limitNum = parseInt(limit as string) || 10;
  const totalPages = Math.ceil(totalCount / limitNum);
  const startIndex = (pageNum - 1) * limitNum;
  const endIndex = startIndex + limitNum;
  
  const paginatedData = filtered.slice(startIndex, endIndex);

  res.json({ 
    success: true, 
    count: totalCount,
    pagination: {
      page: pageNum,
      limit: limitNum,
      totalPages,
      totalCount,
      hasMore: pageNum < totalPages
    },
    data: paginatedData 
  });
});

// POST /api/sales/customers
salesRouter.post('/customers', verifySessionToken as any, requirePermission('customer:create') as any, (req: AuthenticatedRequest, res: Response) => {
  const ipAddress = (req.ip || req.socket.remoteAddress || '127.0.0.1').replace('::ffff:', '');
  const customerId = `cst-usr-${Date.now()}`;
  const newCustomer: Customer = {
    ...req.body,
    id: customerId,
    companyId: req.user?.companyId || 'c1',
    branchId: req.user?.branchId || 'b1',
    isDeleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: req.user?.id || 'system'
  };

  customersDb.unshift(newCustomer);

  logSecurityEvent(
    req.user?.id || 'system',
    req.user?.fullName || 'Registration Specialist',
    req.user?.role || 'SLM',
    newCustomer.companyId,
    newCustomer.branchId,
    'CREATE',
    'sales',
    ipAddress,
    `Registered corporate Customer Profile [${customerId}] - Name: ${newCustomer.fullNameEn}`,
    `করপোরেট গ্রাহক প্রোফাইল [${customerId}] নিবন্ধিত হয়েছে: ${newCustomer.fullNameEn}`
  );

  saveSalesData();

  res.json({ success: true, data: newCustomer });
});

// GET /api/sales/bookings
salesRouter.get('/bookings', verifySessionToken as any, requirePermission('sales:view') as any, (req: AuthenticatedRequest, res: Response) => {
  const compId = req.user?.companyId || 'c1';
  const filtered = bookingsDb.filter(b => b.companyId === compId && !b.isDeleted);
  res.json({ success: true, data: filtered });
});

// GET /api/sales/bookings/:id
salesRouter.get('/bookings/:id', verifySessionToken as any, requirePermission('sales:view') as any, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const booking = bookingsDb.find(b => b.id === id && !b.isDeleted);
  if (!booking) {
    return res.status(404).json({ error: 'Booking portfolio not found.' });
  }

  const installments = installmentsDb.filter(inst => inst.bookingId === id && !inst.isDeleted);
  const collections = paymentCollectionsDb.filter(col => col.bookingId === id && !col.isDeleted);
  const notes = customerNotesDb.filter(n => n.customerId === booking.customerId && !n.isDeleted);
  const documents = customerDocumentsDb.filter(d => d.customerId === booking.customerId && !d.isDeleted);

  res.json({
    success: true,
    data: {
      booking,
      installments,
      collections,
      notes,
      documents
    }
  });
});

// POST /api/sales/bookings (SECURED BOOKING ENGINE)
salesRouter.post('/bookings', verifySessionToken as any, requirePermission('booking:create') as any, async (req: AuthenticatedRequest, res: Response) => {
  const { customerId, projectId, unitId, bookingDate, totalAgreedPrice, bookingMoneyBdt, downpaymentBdt, installmentCount, installmentFrequency, startDate } = req.body;

  if (!customerId || !projectId || !unitId || !totalAgreedPrice || !installmentCount) {
    return res.status(400).json({ error: 'Missing core booking parameters.' });
  }

  // 1. Generate core booking payload
  const bookingPayload: Omit<Booking, 'id' | 'createdAt' | 'updatedAt' | 'isDeleted' | 'status'> = {
    companyId: req.user?.companyId || 'c1',
    branchId: req.user?.branchId || 'b1',
    customerId,
    projectId,
    unitId,
    bookingDate: bookingDate || new Date().toISOString().split('T')[0],
    totalAgreedPrice: Number(totalAgreedPrice),
    bookingMoneyBdt: Number(bookingMoneyBdt) || 0,
    downpaymentBdt: Number(downpaymentBdt) || 0,
    installmentCount: Number(installmentCount),
    salesPersonId: req.user?.id || 'system',
    commissionPercentage: 2.5,
    createdBy: req.user?.id || 'system'
  };

  // 2. Generate installment schedule automatic generator
  const generatedInstallments = generateAutomaticInstallments(
    Number(totalAgreedPrice),
    Number(bookingMoneyBdt) || 0,
    Number(downpaymentBdt) || 0,
    Number(installmentCount),
    installmentFrequency || 'Monthly',
    startDate || new Date().toISOString().split('T')[0]
  );

  // 3. Fire atomic multi-row secure allocation transaction
  const result = await bookUnitTransaction(bookingPayload, generatedInstallments, req);

  if (!result.success) {
    return res.status(409).json({ error: result.error });
  }

  res.json({ success: true, message: 'Property booking scheduled and locked successfully!', data: result.booking });
});

// GET /api/sales/installments/:bookingId
salesRouter.get('/installments/:bookingId', verifySessionToken as any, requirePermission('sales:view') as any, (req: AuthenticatedRequest, res: Response) => {
  const { bookingId } = req.params;
  const list = installmentsDb.filter(inst => inst.bookingId === bookingId && !inst.isDeleted);
  res.json({ success: true, data: list });
});

// POST /api/sales/installments/collect (SECURED INSTALLMENT LEDGER UPDATER)
salesRouter.post('/installments/collect', verifySessionToken as any, requirePermission('collection:create') as any, async (req: AuthenticatedRequest, res: Response) => {
  const { bookingId, installmentId, amount, paymentMode, referenceNo, remarks, receiptNo } = req.body;
  const ipAddress = (req.ip || req.socket.remoteAddress || '127.0.0.1').replace('::ffff:', '');

  if (!bookingId || !amount || !paymentMode) {
    return res.status(400).json({ error: 'Booking ID, amount collected, and payment mode are required.' });
  }

  const booking = bookingsDb.find(b => b.id === bookingId && !b.isDeleted);
  if (!booking) {
    return res.status(404).json({ error: 'Target property booking record not found.' });
  }

  const finalReceipt = receiptNo || `MR-COL-${Date.now()}`;
  const amountNum = Number(amount);

  const newCollection: PaymentCollection = {
    id: `col-srv-${Date.now()}`,
    companyId: req.user?.companyId || 'c1',
    branchId: req.user?.branchId || 'b1',
    bookingId,
    installmentId: installmentId || undefined,
    receiptNo: finalReceipt,
    collectionDate: new Date().toISOString().split('T')[0],
    amountCollected: amountNum,
    paymentMode,
    referenceNo,
    remarks,
    status: 'Verified',
    isDeleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: req.user?.id || 'system'
  };

  const backupInstallments = JSON.parse(JSON.stringify(installmentsDb));

  try {
    await executeInTransaction(
      async (client) => {
        if (client) {
          // Write Collection to PostgreSQL
          await client.query(`
            INSERT INTO sales_payment_collections (
              id, company_id, branch_id, booking_id, installment_id, receipt_no, collection_date,
              amount_collected, payment_mode, reference_no, remarks, status, is_deleted, created_by
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
          `, [
            newCollection.id, newCollection.companyId, newCollection.branchId, newCollection.bookingId,
            newCollection.installmentId || null, newCollection.receiptNo, newCollection.collectionDate,
            newCollection.amountCollected, newCollection.paymentMode, newCollection.referenceNo,
            newCollection.remarks || null, newCollection.status, newCollection.isDeleted, newCollection.createdBy
          ]);

          // Update Installment in PostgreSQL
          if (installmentId) {
            const inst = installmentsDb.find(i => i.id === installmentId);
            if (inst) {
              const updatedPaid = Number(inst.amountPaidBdt) + amountNum;
              let newStatus = inst.status;
              let paidDate = inst.paidDate;
              if (updatedPaid >= inst.amountBdt) {
                newStatus = 'Paid';
                paidDate = new Date().toISOString().split('T')[0];
              } else if (updatedPaid > 0) {
                newStatus = 'Partially Paid';
              }
              await client.query(`
                UPDATE sales_installments 
                SET amount_paid_bdt = $1, status = $2, paid_date = $3, updated_at = NOW() 
                WHERE id = $4
              `, [updatedPaid, newStatus, paidDate || null, installmentId]);
            }
          } else {
            // FIFO waterfall allocation on outstanding installments in PostgreSQL
            let leftToAllocate = amountNum;
            const unpaidList = installmentsDb
              .filter(i => i.bookingId === bookingId && i.status !== 'Paid' && !i.isDeleted)
              .sort((a, b) => a.installmentNo - b.installmentNo);

            for (const inst of unpaidList) {
              if (leftToAllocate <= 0) break;

              const outstanding = inst.amountBdt - inst.amountPaidBdt;
              let updatedPaid = inst.amountPaidBdt;
              let newStatus = inst.status;
              let paidDate = inst.paidDate;

              if (leftToAllocate >= outstanding) {
                leftToAllocate -= outstanding;
                updatedPaid = inst.amountBdt;
                newStatus = 'Paid';
                paidDate = new Date().toISOString().split('T')[0];
              } else {
                updatedPaid += leftToAllocate;
                leftToAllocate = 0;
                newStatus = 'Partially Paid';
              }

              await client.query(`
                UPDATE sales_installments 
                SET amount_paid_bdt = $1, status = $2, paid_date = $3, updated_at = NOW() 
                WHERE id = $4
              `, [updatedPaid, newStatus, paidDate || null, inst.id]);
            }
          }
        }
      },
      () => {
        paymentCollectionsDb.push(newCollection);

        if (installmentId) {
          const inst = installmentsDb.find(i => i.id === installmentId);
          if (inst) {
            inst.amountPaidBdt = Number(inst.amountPaidBdt) + amountNum;
            if (inst.amountPaidBdt >= inst.amountBdt) {
              inst.status = 'Paid';
              inst.paidDate = new Date().toISOString().split('T')[0];
            } else if (inst.amountPaidBdt > 0) {
              inst.status = 'Partially Paid';
            }
          }
        } else {
          let leftToAllocate = amountNum;
          const unpaidList = installmentsDb
            .filter(i => i.bookingId === bookingId && i.status !== 'Paid' && !i.isDeleted)
            .sort((a, b) => a.installmentNo - b.installmentNo);

          for (const inst of unpaidList) {
            if (leftToAllocate <= 0) break;

            const outstanding = inst.amountBdt - inst.amountPaidBdt;
            if (leftToAllocate >= outstanding) {
              leftToAllocate -= outstanding;
              inst.amountPaidBdt = inst.amountBdt;
              inst.status = 'Paid';
              inst.paidDate = new Date().toISOString().split('T')[0];
            } else {
              inst.amountPaidBdt += leftToAllocate;
              leftToAllocate = 0;
              inst.status = 'Partially Paid';
            }
          }
        }

        logSecurityEvent(
          req.user?.id || 'system',
          req.user?.fullName || 'Collection Officer',
          req.user?.role || 'ACT',
          booking.companyId,
          booking.branchId,
          'APPROVAL',
          'sales',
          ipAddress,
          `Collected BDT ${amountNum} payment for Booking ID [${bookingId}] under MR Receipt: ${finalReceipt}.`,
          `এমআর রশিদ [${finalReceipt}] এর আওতায় বুকিং আইডি [${bookingId}] এর জন্য BDT ${amountNum} পেমেন্ট সংগ্রহ করা হয়েছে।`
        );

        saveSalesData();
      },
      () => {
        installmentsDb.length = 0;
        installmentsDb.push(...backupInstallments);
        console.log("Collection Transaction Rolled Back for booking:", bookingId);
      }
    );

    res.json({ success: true, message: 'Payment collection recorded and installments adjusted successfully!', collection: newCollection });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to post payment collection inside ACID transaction." });
  }
});
