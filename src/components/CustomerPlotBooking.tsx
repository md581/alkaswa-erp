/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  UserPlus, 
  Users, 
  Key, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  FileText, 
  Printer, 
  Search, 
  Plus, 
  Clock, 
  Sparkles, 
  Percent, 
  BookOpen, 
  User, 
  MapPin, 
  Building, 
  ArrowRight,
  ShieldCheck,
  Send,
  Trash2,
  Undo2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Project, 
  ProjectUnit, 
  MoneyReceipt, 
  RoleId,
  Customer,
  BookingInstallment,
  PlotBooking
} from '../types';
import { dbService } from '../db/dbService';
import { formatCurrency } from '../utils/translations';
import { SalesService } from '../services/salesService';

interface CustomerPlotBookingProps {
  lang: 'en' | 'bn';
  projects: Project[];
  units: ProjectUnit[];
  setUnits: React.Dispatch<React.SetStateAction<ProjectUnit[]>>;
  moneyReceipts?: MoneyReceipt[];
  setMoneyReceipts?: React.Dispatch<React.SetStateAction<MoneyReceipt[]>>;
  addAuditLog?: (action: string, table: string, descEn: string, descBn: string) => void;
  currentRole?: RoleId;
}

export default function CustomerPlotBooking({
  lang,
  projects,
  units,
  setUnits,
  moneyReceipts = [],
  setMoneyReceipts,
  addAuditLog,
  currentRole = 'SLM'
}: CustomerPlotBookingProps) {
  // --- TRANSLATIONS RESOURCE ---
  const t = {
    en: {
      title: "Customer & Plot Booking Management",
      subtitle: "Bilingual customer registrations, plot/unit sales, payment installments, and dues dashboard",
      dashboardTab: "Collection Dashboard",
      customersTab: "Customer Profiles",
      bookingTab: "Plot Booking Planner",
      manageTab: "Booking Status & Dues",
      
      // Dashboard
      totalBookingsVal: "Total Portfolio Booked Value",
      totalCollected: "Total Collected Amount",
      totalDue: "Total Outstanding Due",
      overdueCount: "Overdue Installments",
      dueNoticeSent: "Collection notice dispatched successfully!",
      noticeBtn: "Disburse Notice",
      overdueDues: "Overdue Dues List",
      recency: "Activity Recency",
      activeBookings: "Active Bookings",
      cancelledBookings: "Cancelled Bookings",
      completionRate: "Collection Coverage Rate",

      // Customer Reg
      customerReg: "New Customer Registration",
      fullNameEn: "Full Name (English)",
      fullNameBn: "Full Name (Bangla)",
      phone: "Mobile Phone Number",
      email: "Email Address",
      nid: "National ID (NID) Number",
      presentAddrEn: "Present Address (English)",
      presentAddrBn: "Present Address (Bangla)",
      permanentAddrEn: "Permanent Address (English)",
      permanentAddrBn: "Permanent Address (Bangla)",
      nomineeNameEn: "Nominee Name (English)",
      nomineeNameBn: "Nominee Name (Bangla)",
      nomineeRelationEn: "Nominee Relationship (English)",
      nomineeRelationBn: "Nominee Relationship (Bangla)",
      nomineePhone: "Nominee Phone Number",
      registerBtn: "Register Customer",
      customerCreated: "Customer registered successfully inside B-RE ERP system!",
      searchCustomer: "Search customers by name, phone or NID...",
      registeredOn: "Registered on",
      noCustomers: "No registered customers found. Please register a customer to begin plot booking.",

      // Plot Booking
      bookPlot: "Plot / Apartment Unit Booking",
      selectCustomer: "Select Customer",
      selectProject: "Select Project Portfolio",
      selectUnit: "Select Plot / Apartment Unit",
      totalAgreedPrice: "Total Agreed Valuation (BDT)",
      bookingMoney: "Booking Money Received (BDT)",
      downpayment: "Downpayment Received (BDT)",
      installmentPeriod: "Installment Frequency (Months)",
      generateSchedule: "Generate Schedule Plan",
      bookingMoneyPlaceholder: "e.g., 500000",
      downpaymentPlaceholder: "e.g., 1500000",
      confirmBooking: "Confirm Booking & Lock Inventory",
      bookingCreated: "Booking initialized and installment schedule generated!",
      previewSchedule: "Live Payment Schedule Preview",
      installNo: "Inst. No",
      dueDate: "Due Date",
      instAmount: "Installment BDT",
      availUnits: "Available Units Only",
      noAvailableUnits: "No available units/plots in this project.",

      // Booking Status & Actions
      bookingId: "Booking ID",
      customer: "Customer",
      project: "Project",
      unitNo: "Unit/Plot",
      status: "Status",
      actions: "Actions",
      payInstallment: "Receive Payment",
      cancelBooking: "Cancel Booking",
      viewSchedule: "View Schedule",
      paymentSuccess: "Installment payment successfully registered!",
      cancellationSuccess: "Booking cancelled, penalty fee applied, and plot returned to Available inventory.",
      bookingDetails: "Payment Installment Tracker",
      cancelTitle: "Process Booking Cancellation",
      cancelFee: "Cancellation Penalty Fee (BDT)",
      refundAmount: "Calculated Refund Amount (BDT)",
      cancelReason: "Reason for Cancellation",
      confirmCancelBtn: "Cancel Booking & Free Plot",
      installmentPaid: "Paid",
      installmentUnpaid: "Unpaid",
      installmentOverdue: "Overdue",
      paidOn: "Paid On",
      receiptNo: "Receipt No",
      totalPaid: "Total Paid",
      remainingDue: "Remaining Due",
      close: "Close Panel",
      noBookings: "No bookings recorded yet."
    },
    bn: {
      title: "গ্রাহক এবং প্লট বুকিং ব্যবস্থাপনা",
      subtitle: "দ্বিভাষিক গ্রাহক নিবন্ধন, প্লট/ইউনিট বিক্রয়, কিস্তি পরিকল্পনা এবং আদায় ড্যাশবোর্ড",
      dashboardTab: "কালেকশন ড্যাশবোর্ড",
      customersTab: "গ্রাহক প্রোফাইল",
      bookingTab: "প্লট বুকিং প্ল্যানার",
      manageTab: "বুকিং স্ট্যাটাস ও বকেয়া",

      // Dashboard
      totalBookingsVal: "মোট বুকিং পোর্টফোলিও মূল্য",
      totalCollected: "মোট আদায়কৃত টাকা",
      totalDue: "মোট বকেয়া পরিমাণ",
      overdueCount: "অতি-অতিক্রান্ত বকেয়া কিস্তি",
      dueNoticeSent: "কালেকশন নোটিশ সফলভাবে প্রেরণ করা হয়েছে!",
      noticeBtn: "নোটিশ পাঠান",
      overdueDues: "বকেয়া কিস্তির তালিকা",
      recency: "অ্যাক্টিভিটি রিসেন্সি",
      activeBookings: "সক্রিয় বুকিং",
      cancelledBookings: "বাতিলকৃত বুকিং",
      completionRate: "কালেকশন কভারেজ রেট",

      // Customer Reg
      customerReg: "নতুন গ্রাহক নিবন্ধন",
      fullNameEn: "পূর্ণ নাম (ইংরেজি)",
      fullNameBn: "পূর্ণ নাম (বাংলা)",
      phone: "মোবাইল ফোন নম্বর",
      email: "ইমেইল ঠিকানা",
      nid: "জাতীয় পরিচয়পত্র (NID) নম্বর",
      presentAddrEn: "বর্তমান ঠিকানা (ইংরেজি)",
      presentAddrBn: "বর্তমান ঠিকানা (বাংলা)",
      permanentAddrEn: "স্থায়ী ঠিকানা (ইংরেজি)",
      permanentAddrBn: "স্থায়ী ঠিকানা (বাংলা)",
      nomineeNameEn: "মনোনীত ব্যক্তি (নমিনী) নাম (ইংরেজি)",
      nomineeNameBn: "মনোনীত ব্যক্তি (নমিনী) নাম (বাংলা)",
      nomineeRelationEn: "নমিনীয় সম্পর্ক (ইংরেজি)",
      nomineeRelationBn: "নমিনীয় সম্পর্ক (বাংলা)",
      nomineePhone: "নমিনীর ফোন নম্বর",
      registerBtn: "গ্রাহক নিবন্ধন করুন",
      customerCreated: "গ্রাহক সফলভাবে বি-আরই ইআরপি সিস্টেমে নিবন্ধিত হয়েছে!",
      searchCustomer: "নাম, ফোন বা এনআইডি দিয়ে গ্রাহক খুঁজুন...",
      registeredOn: "নিবন্ধনের তারিখ",
      noCustomers: "কোনো নিবন্ধিত গ্রাহক পাওয়া যায়নি। প্লট বুকিং শুরু করতে প্রথমে গ্রাহক নিবন্ধন করুন।",

      // Plot Booking
      bookPlot: "প্লট / অ্যাপার্টমেন্ট ইউনিট বুকিং",
      selectCustomer: "গ্রাহক নির্বাচন করুন",
      selectProject: "প্রকল্প নির্বাচন করুন",
      selectUnit: "প্লট / অ্যাপার্টমেন্ট ইউনিট নির্বাচন",
      totalAgreedPrice: "মোট চুক্তি মূল্য (টাকা)",
      bookingMoney: "বুকিং মানি প্রাপ্তি (টাকা)",
      downpayment: "ডাউনপেমেন্ট প্রাপ্তি (টাকা)",
      installmentPeriod: "কিস্তির সংখ্যা (মাস)",
      generateSchedule: "কিস্তি তালিকা তৈরি করুন",
      bookingMoneyPlaceholder: "উদা: ৫00000",
      downpaymentPlaceholder: "উদা: ১৫00000",
      confirmBooking: "বুকিং নিশ্চিত করুন এবং ইনভেন্টরি লক করুন",
      bookingCreated: "বুকিং সফল হয়েছে এবং পেমেন্ট কিস্তি শিডিউল তৈরি করা হয়েছে!",
      previewSchedule: "কিস্তি শিডিউল প্রিভিউ",
      installNo: "কিস্তি নং",
      dueDate: "পরিশোধের শেষ তারিখ",
      instAmount: "কিস্তির পরিমাণ (টাকা)",
      availUnits: "শুধুমাত্র বিক্রয়যোগ্য ইউনিট",
      noAvailableUnits: "এই প্রকল্পে কোনো বিক্রয়যোগ্য ইউনিট/প্লট নেই।",

      // Booking Status & Actions
      bookingId: "বুকিং আইডি",
      customer: "গ্রাহক",
      project: "প্রকল্প",
      unitNo: "ইউনিট/প্লট",
      status: "স্ট্যাটাস",
      actions: "কার্যক্রম",
      payInstallment: "টাকা গ্রহণ (কিস্তি)",
      cancelBooking: "বুকিং বাতিল করুন",
      viewSchedule: "শিডিউল দেখুন",
      paymentSuccess: "কিস্তির টাকা প্রাপ্তি সফলভাবে নথিভুক্ত করা হয়েছে!",
      cancellationSuccess: "বুকিং বাতিল করা হয়েছে, জরিমানা কর্তন করা হয়েছে এবং ইউনিটটি পুনরায় বিক্রয়যোগ্য তালিকায় ফেরত দেওয়া হয়েছে।",
      bookingDetails: "পেমেন্ট কিস্তি ট্র্যাকার",
      cancelTitle: "বুকিং বাতিলকরণ প্রক্রিয়া",
      cancelFee: "বাতিলকরণ জরিমানা ফি (টাকা)",
      refundAmount: "ফেরতযোগ্য টাকার পরিমাণ (টাকা)",
      cancelReason: "বাতিলকরণের কারণ",
      confirmCancelBtn: "বুকিং বাতিল করুন ও প্লট মুক্ত করুন",
      installmentPaid: "পরিশোধিত",
      installmentUnpaid: "অপরিশোধিত",
      installmentOverdue: "অতি-অতিক্রান্ত",
      paidOn: "পরিশোধের তারিখ",
      receiptNo: "রশিদ নং",
      totalPaid: "মোট পরিশোধিত",
      remainingDue: "অবশিষ্ট বকেয়া",
      close: "প্যানেল বন্ধ করুন",
      noBookings: "এখনো কোনো বুকিং রেকর্ড করা হয়নি।"
    }
  };

  const currentT = t[lang];

  // --- DOUBLE ENTRY ACCOUNTING INTEGRATION ---
  const addDoubleEntryVoucher = (
    type: 'JV' | 'CP' | 'CR' | 'BP' | 'BR',
    narrationEn: string,
    narrationBn: string,
    lines: { accountCode: string; debit: number; credit: number }[],
    refNo?: string
  ) => {
    const currentVouchers = dbService.vouchers.getAll();
    const nextId = `${type}-2026-${String(currentVouchers.length + 1).padStart(3, '0')}`;
    const newVoucher = {
      id: nextId,
      date: new Date().toISOString().split('T')[0],
      type,
      narrationEn,
      narrationBn,
      lines,
      refNo
    };
    dbService.vouchers.create(newVoucher);
  };

  // --- STATE PERSISTENCE IN LOCAL STORAGE ---
  const [activeTab, setActiveTab] = useState<'dashboard' | 'customers' | 'booking' | 'manage'>('dashboard');
  
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [bookings, setBookings] = useState<PlotBooking[]>([]);

  const loadBackendData = async () => {
    try {
      const custRes = await SalesService.getCustomers();
      if (custRes && custRes.success) {
        setCustomers(custRes.data.map((c: any) => ({
          id: c.id,
          nameEn: c.fullNameEn,
          nameBn: c.fullNameBn,
          phone: c.phone,
          email: c.email,
          nidNo: c.nidNo,
          presentAddressEn: c.presentAddressEn,
          presentAddressBn: c.presentAddressBn,
          permanentAddressEn: c.permanentAddressEn,
          permanentAddressBn: c.permanentAddressBn,
          nomineeNameEn: c.nomineeNameEn,
          nomineeNameBn: c.nomineeNameBn,
          nomineeRelationEn: c.nomineeRelationEn,
          nomineeRelationBn: c.nomineeRelationBn,
          nomineePhone: c.nomineePhone,
          registeredDate: c.createdAt ? c.createdAt.split('T')[0] : new Date().toISOString().split('T')[0]
        })));
      } else {
        setCustomers(dbService.customers.getAll());
      }
    } catch (e) {
      console.warn("Backend customers load failed, falling back", e);
      setCustomers(dbService.customers.getAll());
    }

    try {
      const bookRes = await SalesService.getBookings();
      if (bookRes && bookRes.success) {
        setBookings(bookRes.data.map((b: any) => ({
          id: b.id,
          customerId: b.customerId,
          projectId: b.projectId,
          unitId: b.unitId,
          bookingDate: b.bookingDate,
          totalAgreedPrice: Number(b.totalAgreedPrice),
          bookingMoneyBdt: Number(b.bookingMoneyBdt),
          downpaymentBdt: Number(b.downpaymentBdt),
          installmentCount: Number(b.installmentCount),
          installments: [],
          status: b.status === 'Active' ? 'Active' : b.status === 'Cancelled' ? 'Cancelled' : 'Completed',
          salesPersonId: b.salesPersonId || 'emp1'
        })));
      } else {
        setBookings(dbService.bookings.getAll());
      }
    } catch (e) {
      console.warn("Backend bookings load failed, falling back", e);
      setBookings(dbService.bookings.getAll());
    }
  };

  useEffect(() => {
    loadBackendData();
  }, []);

  useEffect(() => {
    if (customers.length > 0) {
      dbService.customers.saveAll(customers);
    }
  }, [customers]);

  useEffect(() => {
    if (bookings.length > 0) {
      dbService.bookings.saveAll(bookings);
    }
  }, [bookings]);

  // --- SUBMISSION FORMS STATE ---
  // 1. Customer profile registration form
  const [custForm, setCustForm] = useState({
    nameEn: '', nameBn: '', phone: '', email: '', nidNo: '',
    presentAddressEn: '', presentAddressBn: '',
    permanentAddressEn: '', permanentAddressBn: '',
    nomineeNameEn: '', nomineeNameBn: '',
    nomineeRelationEn: '', nomineeRelationBn: '',
    nomineePhone: ''
  });
  const [custSuccess, setCustSuccess] = useState(false);
  const [custSearch, setCustSearch] = useState('');

  // 2. Plot Booking Form
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedUnitId, setSelectedUnitId] = useState('');
  const [bookingAgreedPrice, setBookingAgreedPrice] = useState<number>(0);
  const [bookingMoney, setBookingMoney] = useState('');
  const [downpayment, setDownpayment] = useState('');
  const [installmentPeriod, setInstallmentPeriod] = useState<number>(12);
  const [schedulePreview, setSchedulePreview] = useState<BookingInstallment[]>([]);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // 3. Status View Tracker & Payment modals
  const [viewingBookingId, setViewingBookingId] = useState<string | null>(null);
  const [cancellingBookingId, setCancellingBookingId] = useState<string | null>(null);
  const [cancelFeeBdt, setCancelFeeBdt] = useState('');
  const [cancelReasonText, setCancelReasonText] = useState('');

  // --- DERIVED CALCULATIONS FOR DASHBOARD ---
  const activeBookings = bookings.filter(b => b.status === 'Active');
  const cancelledBookings = bookings.filter(b => b.status === 'Cancelled');

  const totalPortfolioVal = activeBookings.reduce((sum, b) => sum + b.totalAgreedPrice, 0);

  // Total collected = Booking money + downpayment + cleared paid installments for active bookings
  const totalCollectedAmount = activeBookings.reduce((sum, b) => {
    const directPay = b.bookingMoneyBdt + b.downpaymentBdt;
    const paidInstallments = b.installments
      .filter(inst => inst.status === 'Paid')
      .reduce((s, inst) => s + inst.amountBdt, 0);
    return sum + directPay + paidInstallments;
  }, 0);

  const totalOutstandingDue = totalPortfolioVal - totalCollectedAmount;

  // Flatten installments of active bookings for tracking overdue and dues
  const allActiveInstallments = activeBookings.flatMap(b => 
    b.installments.map(inst => ({
      ...inst,
      bookingId: b.id,
      customerId: b.customerId,
      projectId: b.projectId,
      unitId: b.unitId
    }))
  );

  const overdueInstallments = allActiveInstallments.filter(inst => inst.status === 'Overdue');
  const coverageRate = totalPortfolioVal > 0 ? (totalCollectedAmount / totalPortfolioVal) * 100 : 0;

  // Track disburse notifications locally
  const [notifiedInstallments, setNotifiedInstallments] = useState<Record<string, boolean>>({});

  // Triggered when project or unit changes to calculate standard price
  useEffect(() => {
    if (selectedUnitId) {
      const u = units.find(unit => unit.id === selectedUnitId);
      if (u) {
        const total = (u.sizeSft * u.pricePerSft) + u.parkingChargeBdt + u.utilityChargeBdt;
        setBookingAgreedPrice(total);
      }
    } else {
      setBookingAgreedPrice(0);
    }
  }, [selectedUnitId, units]);

  // Handle Customer profile registration
  const handleRegisterCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!custForm.nameEn || !custForm.phone || !custForm.nidNo) return;

    const newCust: Customer = {
      ...custForm,
      id: `cst-${Date.now()}`,
      registeredDate: new Date().toISOString().split('T')[0]
    };

    try {
      await SalesService.createCustomer({
        fullNameEn: custForm.nameEn,
        fullNameBn: custForm.nameBn,
        phone: custForm.phone,
        email: custForm.email || 'customer@alkaswa.com',
        nidNo: custForm.nidNo,
        fatherSpouseNameEn: 'S.M. Rahman',
        fatherSpouseNameBn: 'এস.এম. রহমান',
        motherNameEn: 'M. Sultana',
        motherNameBn: 'এম. সুলতানা',
        presentAddressEn: custForm.presentAddressEn,
        presentAddressBn: custForm.presentAddressBn,
        permanentAddressEn: custForm.permanentAddressEn,
        permanentAddressBn: custForm.permanentAddressBn,
        nomineeNameEn: custForm.nomineeNameEn,
        nomineeNameBn: custForm.nomineeNameBn,
        nomineeRelationEn: custForm.nomineeRelationEn,
        nomineeRelationBn: custForm.nomineeRelationBn,
        nomineePhone: custForm.nomineePhone
      });
    } catch (err) {
      console.warn("Backend customer insertion failed, using local fallback", err);
    }

    setCustomers(prev => [...prev, newCust]);
    
    // Audit Log Integration
    if (addAuditLog) {
      addAuditLog(
        'INSERT',
        'customers',
        `Registered customer profile for '${newCust.nameEn}' (Phone: ${newCust.phone}).`,
        `গ্রাহক '${newCust.nameBn}' এর প্রোফাইল সফলভাবে নিবন্ধিত হয়েছে (মোবাইল: ${newCust.phone})।`
      );
    }

    // Reset Form
    setCustForm({
      nameEn: '', nameBn: '', phone: '', email: '', nidNo: '',
      presentAddressEn: '', presentAddressBn: '',
      permanentAddressEn: '', permanentAddressBn: '',
      nomineeNameEn: '', nomineeNameBn: '',
      nomineeRelationEn: '', nomineeRelationBn: '',
      nomineePhone: ''
    });

    setCustSuccess(true);
    setTimeout(() => setCustSuccess(false), 5000);
  };

  // Live generate installment dates and schedule
  const handleGenerateSchedule = () => {
    if (!bookingAgreedPrice) return;
    const bMoney = parseFloat(bookingMoney) || 0;
    const dPayment = parseFloat(downpayment) || 0;
    const remaining = bookingAgreedPrice - bMoney - dPayment;

    if (remaining <= 0) return;

    const installmentAmt = Math.round(remaining / installmentPeriod);
    const schedule: BookingInstallment[] = [];
    const baseDate = new Date();

    for (let i = 1; i <= installmentPeriod; i++) {
      // monthly increments
      const dueDate = new Date(baseDate.getFullYear(), baseDate.getMonth() + i, 1);
      schedule.push({
        id: `prev-inst-${i}`,
        installmentNo: i,
        amountBdt: installmentAmt,
        dueDate: dueDate.toISOString().split('T')[0],
        status: 'Unpaid'
      });
    }

    setSchedulePreview(schedule);
  };

  // Save Booking to local state and update unit status
  const handleConfirmBooking = async () => {
    if (!selectedCustomerId || !selectedProjectId || !selectedUnitId) return;
    
    const bMoney = parseFloat(bookingMoney) || 0;
    const dPayment = parseFloat(downpayment) || 0;

    // Build fresh installments schedule
    const remaining = bookingAgreedPrice - bMoney - dPayment;
    const installmentAmt = Math.round(remaining / installmentPeriod);
    const installmentsList: BookingInstallment[] = [];
    const baseDate = new Date();

    for (let i = 1; i <= installmentPeriod; i++) {
      const dueDate = new Date(baseDate.getFullYear(), baseDate.getMonth() + i, 1);
      installmentsList.push({
        id: `inst-${Date.now()}-${i}`,
        installmentNo: i,
        amountBdt: installmentAmt,
        dueDate: dueDate.toISOString().split('T')[0],
        status: 'Unpaid'
      });
    }

    const bookingId = `BKG-2026-00${bookings.length + 1}`;

    try {
      await SalesService.createBooking({
        customerId: selectedCustomerId,
        projectId: selectedProjectId,
        unitId: selectedUnitId,
        totalAgreedPrice: bookingAgreedPrice,
        bookingMoneyBdt: bMoney,
        downpaymentBdt: dPayment,
        installmentCount: installmentPeriod,
        installmentFrequency: 'Monthly',
        startDate: new Date().toISOString().split('T')[0]
      });
    } catch (err) {
      console.warn("Backend booking confirmation failed, relying on local fallback logic", err);
    }

    const newBooking: PlotBooking = {
      id: bookingId,
      customerId: selectedCustomerId,
      projectId: selectedProjectId,
      unitId: selectedUnitId,
      bookingDate: new Date().toISOString().split('T')[0],
      totalAgreedPrice: bookingAgreedPrice,
      bookingMoneyBdt: bMoney,
      downpaymentBdt: dPayment,
      installmentCount: installmentPeriod,
      installments: installmentsList,
      status: 'Active',
      salesPersonId: 'emp1'
    };

    // 1. Add booking
    setBookings(prev => [newBooking, ...prev]);

    // 2. Lock inventory: set status to 'Booked' in the global state
    setUnits(prev => prev.map(u => u.id === selectedUnitId ? { ...u, status: 'Booked' } : u));

    // 3. Sync official Money Receipts for Booking Money & Downpayment
    if (setMoneyReceipts) {
      const customerObj = customers.find(c => c.id === selectedCustomerId);
      const customerName = customerObj ? (lang === 'en' ? customerObj.nameEn : customerObj.nameBn) : 'Unknown Customer';

      const receiptsToAdd: MoneyReceipt[] = [];

      if (bMoney > 0) {
        receiptsToAdd.push({
          id: `mr-${Date.now()}-bm`,
          receiptNo: `MR-2026-${1000 + moneyReceipts.length + 1}`,
          bookingId: newBooking.id,
          receivedFromId: selectedCustomerId,
          receivedFromName: customerName,
          amountBdt: bMoney,
          paymentMode: 'Cash',
          issuedBy: 'Sales Acquisition Manager',
          receivedDate: newBooking.bookingDate,
          isCleared: true
        });
      }

      if (dPayment > 0) {
        receiptsToAdd.push({
          id: `mr-${Date.now()}-dp`,
          receiptNo: `MR-2026-${1000 + moneyReceipts.length + 2}`,
          bookingId: newBooking.id,
          receivedFromId: selectedCustomerId,
          receivedFromName: customerName,
          amountBdt: dPayment,
          paymentMode: 'Bank Transfer',
          bankName: 'City Bank Ltd.',
          instrumentNo: 'DP-TXN-BOOK',
          issuedBy: 'Sales Acquisition Manager',
          receivedDate: newBooking.bookingDate,
          isCleared: true
        });
      }

      if (receiptsToAdd.length > 0) {
        setMoneyReceipts(prev => [...receiptsToAdd, ...prev]);
      }
    }

    // 3.5. Record Double-Entry Vouchers for initial payments in General Ledger
    const voucherLines = [];
    if (bMoney > 0) {
      voucherLines.push({ accountCode: '1100', debit: bMoney, credit: 0 }); // Debit Cash in Hand
    }
    if (dPayment > 0) {
      voucherLines.push({ accountCode: '1220', debit: dPayment, credit: 0 }); // Debit Dutch-Bangla Bank (1220)
    }
    if (voucherLines.length > 0) {
      const totalInitialReceived = bMoney + dPayment;
      voucherLines.push({ accountCode: '2200', debit: 0, credit: totalInitialReceived }); // Credit Customer Advances (2200)

      const customerObj = customers.find(c => c.id === selectedCustomerId);
      const unitObj = units.find(u => u.id === selectedUnitId);

      addDoubleEntryVoucher(
        dPayment > 0 ? 'BR' : 'CR',
        `Booking money / downpayment advance received for unit '${unitObj?.unitNo}' from customer '${customerObj?.nameEn}'.`,
        `গ্রাহক '${customerObj?.nameBn}' থেকে ইউনিট '${unitObj?.unitNo}' এর বুকিং বাবদ অগ্রিম গ্রহণ।`,
        voucherLines,
        `BKG-REC-${newBooking.id}`
      );
    }

    // 4. Audit logger
    if (addAuditLog) {
      const custObj = customers.find(c => c.id === selectedCustomerId);
      const projObj = projects.find(p => p.id === selectedProjectId);
      const unitObj = units.find(u => u.id === selectedUnitId);

      addAuditLog(
        'INSERT',
        'customer_bookings',
        `Booked unit '${unitObj?.unitNo}' at project '${projObj?.nameEn}' for customer '${custObj?.nameEn}'. Total Contract Value: BDT ${bookingAgreedPrice.toLocaleString()}.`,
        `গ্রাহক '${custObj?.nameBn}' এর অনুকূলে '${projObj?.nameBn}' প্রকল্পের ইউনিট '${unitObj?.unitNo}' বুকিং করা হয়েছে। মোট চুক্তি মূল্য: BDT ${bookingAgreedPrice.toLocaleString()} টাকা।`
      );
    }

    // Clean inputs
    setSelectedCustomerId('');
    setSelectedProjectId('');
    setSelectedUnitId('');
    setBookingMoney('');
    setDownpayment('');
    setSchedulePreview([]);
    setBookingSuccess(true);
    setTimeout(() => setBookingSuccess(false), 5000);
  };

  // Settle single installment payment (Receive Payment Action)
  const handlePayInstallment = (bookingId: string, installmentId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    const installment = booking.installments.find(inst => inst.id === installmentId);
    if (!installment) return;

    const customerObj = customers.find(c => c.id === booking.customerId);
    const customerName = customerObj ? (lang === 'en' ? customerObj.nameEn : customerObj.nameBn) : 'Unknown Customer';

    const generatedReceiptNo = `MR-2026-${1000 + moneyReceipts.length + 1}`;

    // 1. Update Booking state
    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        return {
          ...b,
          installments: b.installments.map(inst => 
            inst.id === installmentId 
              ? { ...inst, status: 'Paid', paidDate: new Date().toISOString().split('T')[0], receiptNo: generatedReceiptNo } 
              : inst
          )
        };
      }
      return b;
    }));

    // 2. Generate official ERP Money Receipt
    if (setMoneyReceipts) {
      setMoneyReceipts(prev => [
        {
          id: `mr-${Date.now()}-inst`,
          receiptNo: generatedReceiptNo,
          bookingId: bookingId,
          receivedFromId: booking.customerId,
          receivedFromName: customerName,
          amountBdt: installment.amountBdt,
          paymentMode: 'Cash',
          issuedBy: 'Accounts Collector',
          receivedDate: new Date().toISOString().split('T')[0],
          isCleared: true
        },
        ...prev
      ]);
    }

    // 2.5. Record Double-Entry Voucher for Installment Receipt in General Ledger
    const instLines = [
      { accountCode: '1100', debit: installment.amountBdt, credit: 0 }, // Debit Cash in Hand (1100)
      { accountCode: '2200', debit: 0, credit: installment.amountBdt }  // Credit Customer Advances (2200)
    ];
    addDoubleEntryVoucher(
      'CR',
      `Installment payment collected for Booking ID ${bookingId} (Installment #${installment.installmentNo}) from customer '${customerName}'. Receipt No: ${generatedReceiptNo}.`,
      `গ্রাহক '${customerName}' থেকে বুকিং আইডি ${bookingId} (কিস্তি নং #${installment.installmentNo}) এর কিস্তি বাবদ টাকা গ্রহণ। মানি রিসিট নং: ${generatedReceiptNo}।`,
      instLines,
      generatedReceiptNo
    );

    // 3. Audit Log
    if (addAuditLog) {
      addAuditLog(
        'UPDATE',
        'customer_bookings',
        `Collected BDT ${installment.amountBdt.toLocaleString()} for Booking '${bookingId}' (Installment #${installment.installmentNo}). Money Receipt issued: ${generatedReceiptNo}.`,
        `বুকিং '${bookingId}' এর কিস্তি #${installment.installmentNo} বাবদ BDT ${installment.amountBdt.toLocaleString()} টাকা আদায় করা হয়েছে। মানি রিসিট নং: ${generatedReceiptNo}।`
      );
    }
  };

  // Perform Booking Cancellation
  const handleCancelBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancellingBookingId) return;

    const booking = bookings.find(b => b.id === cancellingBookingId);
    if (!booking) return;

    const penaltyFee = parseFloat(cancelFeeBdt) || 0;
    
    // Total collected so far
    const directPay = booking.bookingMoneyBdt + booking.downpaymentBdt;
    const paidInstallments = booking.installments
      .filter(inst => inst.status === 'Paid')
      .reduce((s, inst) => s + inst.amountBdt, 0);
    const totalCollected = directPay + paidInstallments;

    const refund = Math.max(0, totalCollected - penaltyFee);

    // 1. Update status to 'Cancelled'
    setBookings(prev => prev.map(b => {
      if (b.id === cancellingBookingId) {
        return {
          ...b,
          status: 'Cancelled',
          cancellationDate: new Date().toISOString().split('T')[0],
          cancellationFee: penaltyFee,
          refundAmount: refund,
          cancellationReason: cancelReasonText
        };
      }
      return b;
    }));

    // 2. Unlock inventory: set status back to 'Available'
    setUnits(prev => prev.map(u => u.id === booking.unitId ? { ...u, status: 'Available' } : u));

    // 2.5. Record Double-Entry Voucher for Booking Cancellation in General Ledger
    const cancelLines = [
      { accountCode: '2200', debit: totalCollected, credit: 0 } // Reverse total advance collected from liability (2200)
    ];
    if (refund > 0) {
      cancelLines.push({ accountCode: '1100', debit: 0, credit: refund }); // Refund paid back from Cash in Hand (1100)
    }
    if (penaltyFee > 0) {
      cancelLines.push({ accountCode: '4300', debit: 0, credit: penaltyFee }); // Retention/Penalty recorded as Misc Revenue (4300)
    }
    addDoubleEntryVoucher(
      'JV',
      `Booking Cancellation for ID ${booking.id}. Total Collected: BDT ${totalCollected.toLocaleString()}, Penalty Charge: BDT ${penaltyFee.toLocaleString()}, Refund Disbursed: BDT ${refund.toLocaleString()}.`,
      `বুকিং আইডি ${booking.id} বাতিলের হিসাব ভাউচার। মোট আদায়কৃত: BDT ${totalCollected.toLocaleString()}, জরিমানা চার্জ: BDT ${penaltyFee.toLocaleString()}, রিফান্ড বা ফেরত প্রদান: BDT ${refund.toLocaleString()}।`,
      cancelLines,
      `CAN-${booking.id}`
    );

    // 3. Audit Log
    if (addAuditLog) {
      const custObj = customers.find(c => c.id === booking.customerId);
      const unitObj = units.find(u => u.id === booking.unitId);

      addAuditLog(
        'UPDATE',
        'customer_bookings',
        `Cancelled booking '${booking.id}' for unit '${unitObj?.unitNo}'. Penalty Fee: BDT ${penaltyFee.toLocaleString()}. Refund: BDT ${refund.toLocaleString()}. Reason: ${cancelReasonText || 'N/A'}.`,
        `ইউনিট '${unitObj?.unitNo}' এর বুকিং '${booking.id}' বাতিল করা হয়েছে। জরিমানা ফি: BDT ${penaltyFee.toLocaleString()} টাকা। অফেরতযোগ্য বাদে ফেরত প্রদান: BDT ${refund.toLocaleString()} টাকা।`
      );
    }

    setCancellingBookingId(null);
    setCancelFeeBdt('');
    setCancelReasonText('');
  };

  // Disburse collection notice (Simulated)
  const dispatchNotice = (instId: string) => {
    setNotifiedInstallments(prev => ({ ...prev, [instId]: true }));
    setTimeout(() => {
      // Auto close/fade notice
    }, 3000);
  };

  // Search filter customers list
  const filteredCustomers = customers.filter(c => 
    c.nameEn.toLowerCase().includes(custSearch.toLowerCase()) ||
    c.nameBn.includes(custSearch) ||
    c.phone.includes(custSearch) ||
    c.nidNo.includes(custSearch)
  );

  return (
    <div className="space-y-6" id="customer-plot-booking-container">
      {/* ERP Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-850 p-6 rounded-2xl text-slate-100 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs uppercase tracking-wider mb-1.5 font-bold">
              <Sparkles size={14} />
              <span>{lang === 'en' ? 'B-RE Sales Core' : 'বি-আরই সেলস কোর'}</span>
            </div>
            <h2 className="font-display font-bold text-2xl md:text-3xl tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              {currentT.title}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {currentT.subtitle}
            </p>
          </div>
          {/* Active Company Badge */}
          <div className="bg-slate-800/80 backdrop-blur-xs border border-slate-700/60 px-4 py-2.5 rounded-xl text-right shrink-0">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono block">Active Module Mode</span>
            <span className="text-xs font-semibold text-emerald-400 font-mono">BDT (৳) Currency Platform</span>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex flex-wrap gap-2 mt-8 pt-4 border-t border-slate-800">
          {[
            { id: 'dashboard', label: currentT.dashboardTab, icon: TrendingUp },
            { id: 'customers', label: currentT.customersTab, icon: Users },
            { id: 'booking', label: currentT.bookingTab, icon: Key },
            { id: 'manage', label: currentT.manageTab, icon: BookOpen }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20' 
                    : 'bg-slate-850 text-slate-400 hover:text-slate-100 hover:bg-slate-800'
                }`}
                id={`booking-tab-${tab.id}`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* --- TAB CONTENT AREA --- */}
      <AnimatePresence mode="wait">
        {/* TAB 1: COLLECTION DASHBOARD */}
        {activeTab === 'dashboard' && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
            id="tab-dashboard"
          >
            {/* Stats Dashboard Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{currentT.totalBookingsVal}</span>
                  <h3 className="text-xl font-bold font-mono text-slate-800 mt-1">{formatCurrency(totalPortfolioVal, lang)}</h3>
                  <span className="text-[10px] text-emerald-600 font-semibold block mt-1">৳ {totalPortfolioVal.toLocaleString()} BDT</span>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-500 shrink-0">
                  <TrendingUp size={20} />
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{currentT.totalCollected}</span>
                  <h3 className="text-xl font-bold font-mono text-slate-800 mt-1">{formatCurrency(totalCollectedAmount, lang)}</h3>
                  <span className="text-[10px] text-slate-400 font-semibold block mt-1">{coverageRate.toFixed(1)}% coverage rate</span>
                </div>
                <div className="p-3 rounded-xl bg-teal-50 text-teal-500 shrink-0">
                  <CheckCircle size={20} />
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{currentT.totalDue}</span>
                  <h3 className="text-xl font-bold font-mono text-rose-600 mt-1">{formatCurrency(totalOutstandingDue, lang)}</h3>
                  <span className="text-[10px] text-rose-500 font-semibold block mt-1">৳ {totalOutstandingDue.toLocaleString()} remaining</span>
                </div>
                <div className="p-3 rounded-xl bg-rose-50 text-rose-500 shrink-0">
                  <AlertCircle size={20} />
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{currentT.overdueCount}</span>
                  <h3 className="text-xl font-bold font-mono text-amber-600 mt-1">{overdueInstallments.length} Installments</h3>
                  <span className="text-[10px] text-amber-500 font-semibold block mt-1">Requires collector review</span>
                </div>
                <div className="p-3 rounded-xl bg-amber-50 text-amber-500 shrink-0">
                  <Clock size={20} />
                </div>
              </div>
            </div>

            {/* Overdue dues and collection lists */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 shadow-xs">
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
                  <div>
                    <h4 className="font-display font-bold text-lg text-slate-800">
                      {currentT.overdueDues}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {lang === 'en' ? 'Track unpaid plot payments that have passed their contractual dates' : 'চুক্তির মেয়াদ অতিক্রমকারী বকেয়া প্লট পেমেন্ট সমূহের বিবরণ'}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-md bg-amber-50 border border-amber-200 text-[10px] font-bold text-amber-700">
                    {overdueInstallments.length} OVERDUE
                  </span>
                </div>

                {overdueInstallments.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-xs">
                    <CheckCircle size={32} className="mx-auto mb-2 text-emerald-500" />
                    <p>All active installment accounts are fully compliant and up to date!</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider font-semibold text-[10px]">
                          <th className="pb-3">{currentT.bookingId}</th>
                          <th className="pb-3">{currentT.customer}</th>
                          <th className="pb-3">{currentT.unitNo}</th>
                          <th className="pb-3">{currentT.dueDate}</th>
                          <th className="pb-3 text-right">{currentT.instAmount}</th>
                          <th className="pb-3 text-right">{currentT.actions}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 font-medium text-slate-700">
                        {overdueInstallments.map((inst, index) => {
                          const customerObj = customers.find(c => c.id === inst.customerId);
                          const unitObj = units.find(u => u.id === inst.unitId);
                          const projectObj = projects.find(p => p.id === inst.projectId);
                          const isNotified = notifiedInstallments[inst.id];

                          return (
                            <tr key={`${inst.bookingId}-${inst.installmentNo}-${index}`} className="hover:bg-slate-50/50">
                              <td className="py-3 font-mono font-bold text-slate-800">{inst.bookingId}</td>
                              <td className="py-3">
                                <div>
                                  <p className="font-semibold text-slate-800">{lang === 'en' ? customerObj?.nameEn : customerObj?.nameBn}</p>
                                  <p className="text-[10px] text-slate-400">{customerObj?.phone}</p>
                                </div>
                              </td>
                              <td className="py-3">
                                <div>
                                  <p className="font-bold text-emerald-700">{unitObj?.unitNo}</p>
                                  <p className="text-[10px] text-slate-400 truncate max-w-[120px]">{lang === 'en' ? projectObj?.nameEn : projectObj?.nameBn}</p>
                                </div>
                              </td>
                              <td className="py-3 text-rose-600 font-mono font-bold">{inst.dueDate}</td>
                              <td className="py-3 text-right font-mono font-bold">{formatCurrency(inst.amountBdt, lang)}</td>
                              <td className="py-3 text-right">
                                <button
                                  onClick={() => dispatchNotice(inst.id)}
                                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wider uppercase cursor-pointer transition-all ${
                                    isNotified 
                                      ? 'bg-slate-100 text-slate-400 border border-slate-200' 
                                      : 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md shadow-amber-500/10'
                                  }`}
                                  disabled={isNotified}
                                >
                                  {isNotified ? 'Notified ✉' : currentT.noticeBtn}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Activity statistics cards */}
              <div className="space-y-6">
                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs">
                  <h4 className="font-display font-bold text-sm text-slate-800 mb-3 uppercase tracking-wider text-slate-400">
                    {currentT.recency}
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                        {currentT.activeBookings}
                      </span>
                      <span className="font-bold text-slate-800 font-mono">{activeBookings.length}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                        {currentT.cancelledBookings}
                      </span>
                      <span className="font-bold text-slate-800 font-mono">{cancelledBookings.length}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-100">
                      <span className="text-slate-800 font-semibold">{currentT.completionRate}</span>
                      <span className="font-bold text-emerald-600 font-mono">{coverageRate.toFixed(1)}%</span>
                    </div>

                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-2">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${coverageRate}%` }} />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-slate-950 p-6 rounded-2xl shadow-lg shadow-emerald-500/10 flex flex-col justify-between h-48">
                  <div>
                    <h5 className="font-bold text-sm uppercase tracking-wider text-emerald-950">ERP Unified Core</h5>
                    <p className="text-xs text-emerald-900 leading-relaxed mt-1.5 font-medium">
                      All sales milestones, plot holdings, payments, and receipt generations are instantly linked to our finance bookkeeping and audit ledgers automatically.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 font-bold font-mono text-[10px] text-emerald-950 uppercase">
                    <ShieldCheck size={16} />
                    <span>Real-time Compliance Active</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 2: CUSTOMER PROFILES */}
        {activeTab === 'customers' && (
          <motion.div
            key="customers"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            id="tab-customers"
          >
            {/* Customer List & Search */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <h4 className="font-display font-bold text-lg text-slate-800">
                  {lang === 'en' ? 'Registered Customer Registry' : 'নিবন্ধিত গ্রাহকদের তালিকা ও প্রোফাইল'}
                </h4>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
                  <input
                    type="text"
                    value={custSearch}
                    onChange={(e) => setCustSearch(e.target.value)}
                    placeholder={currentT.searchCustomer}
                    className="pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 text-xs rounded-xl focus:outline-none focus:border-emerald-500 text-slate-800 w-full md:w-64"
                  />
                </div>
              </div>

              {filteredCustomers.length === 0 ? (
                <div className="py-16 text-center text-slate-400 text-xs">
                  <Users size={36} className="mx-auto mb-2 text-slate-300" />
                  <p>{currentT.noCustomers}</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                  {filteredCustomers.map((cust) => {
                    const custBookings = bookings.filter(b => b.customerId === cust.id);
                    return (
                      <div key={cust.id} className="p-4 rounded-xl bg-slate-50 border border-slate-150 hover:border-emerald-200 transition-colors">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <h5 className="font-bold text-sm text-slate-800">{cust.nameEn}</h5>
                              <span className="text-[10px] text-slate-400">•</span>
                              <h5 className="font-bold text-xs text-slate-500 font-sans">{cust.nameBn}</h5>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-[11px] text-slate-500 mt-2 font-medium">
                              <p><span className="text-slate-400">Phone:</span> {cust.phone}</p>
                              <p><span className="text-slate-400">Email:</span> {cust.email || 'N/A'}</p>
                              <p><span className="text-slate-400">NID:</span> {cust.nidNo}</p>
                              <p className="sm:col-span-2"><span className="text-slate-400">Nominee:</span> {cust.nomineeNameEn} ({cust.nomineeRelationEn}) - {cust.nomineePhone}</p>
                            </div>
                          </div>
                          <div className="shrink-0 text-right mt-2 md:mt-0">
                            <span className="text-[9px] font-bold text-slate-400 uppercase font-mono block">
                              {currentT.registeredOn}: {cust.registeredDate}
                            </span>
                            <span className="mt-1.5 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase border border-emerald-100">
                              {custBookings.length} {custBookings.length === 1 ? 'Booking' : 'Bookings'}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Customer Registration Form */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs h-fit space-y-4">
              <h4 className="font-display font-bold text-base text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
                <UserPlus size={18} className="text-emerald-500" />
                {currentT.customerReg}
              </h4>

              {custSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold p-3.5 rounded-xl flex items-start gap-2">
                  <CheckCircle size={16} className="text-emerald-500 shrink-0" />
                  <span>{currentT.customerCreated}</span>
                </div>
              )}

              <form onSubmit={handleRegisterCustomer} className="space-y-4 text-xs font-semibold">
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">{currentT.fullNameEn} *</label>
                    <input
                      type="text"
                      required
                      value={custForm.nameEn}
                      onChange={(e) => setCustForm({ ...custForm, nameEn: e.target.value })}
                      placeholder="e.g., Kazi Arifur Rahman"
                      className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500 text-slate-800 font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">{currentT.fullNameBn} *</label>
                    <input
                      type="text"
                      required
                      value={custForm.nameBn}
                      onChange={(e) => setCustForm({ ...custForm, nameBn: e.target.value })}
                      placeholder="উদা: কাজী আরিফুর রহমান"
                      className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500 text-slate-800 font-medium"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">{currentT.phone} *</label>
                      <input
                        type="tel"
                        required
                        value={custForm.phone}
                        onChange={(e) => setCustForm({ ...custForm, phone: e.target.value })}
                        placeholder="e.g., 01700000000"
                        className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500 text-slate-800 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">{currentT.nid} *</label>
                      <input
                        type="text"
                        required
                        value={custForm.nidNo}
                        onChange={(e) => setCustForm({ ...custForm, nidNo: e.target.value })}
                        placeholder="e.g., 4239840212"
                        className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500 text-slate-800 font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">{currentT.email}</label>
                    <input
                      type="email"
                      value={custForm.email}
                      onChange={(e) => setCustForm({ ...custForm, email: e.target.value })}
                      placeholder="e.g., arifur@gmail.com"
                      className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500 text-slate-800 font-medium"
                    />
                  </div>

                  {/* Nominee details sub-card */}
                  <div className="p-3 bg-slate-50/70 border border-slate-150 rounded-xl space-y-3">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block border-b border-slate-200 pb-1">
                      Nominee Information / মনোনীত ব্যক্তি
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[9px] uppercase tracking-wider text-slate-400 block mb-1">{currentT.nomineeNameEn}</label>
                        <input
                          type="text"
                          value={custForm.nomineeNameEn}
                          onChange={(e) => setCustForm({ ...custForm, nomineeNameEn: e.target.value })}
                          placeholder="e.g., Nusrat Jahan"
                          className="w-full bg-white border border-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500 text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] uppercase tracking-wider text-slate-400 block mb-1">{currentT.nomineeNameBn}</label>
                        <input
                          type="text"
                          value={custForm.nomineeNameBn}
                          onChange={(e) => setCustForm({ ...custForm, nomineeNameBn: e.target.value })}
                          placeholder="উদা: নুসরাত জাহান"
                          className="w-full bg-white border border-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500 text-slate-800"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[9px] uppercase tracking-wider text-slate-400 block mb-1">{currentT.nomineeRelationEn}</label>
                        <input
                          type="text"
                          value={custForm.nomineeRelationEn}
                          onChange={(e) => setCustForm({ ...custForm, nomineeRelationEn: e.target.value })}
                          placeholder="e.g., Sister"
                          className="w-full bg-white border border-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500 text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] uppercase tracking-wider text-slate-400 block mb-1">{currentT.nomineePhone}</label>
                        <input
                          type="tel"
                          value={custForm.nomineePhone}
                          onChange={(e) => setCustForm({ ...custForm, nomineePhone: e.target.value })}
                          placeholder="e.g., 01711112222"
                          className="w-full bg-white border border-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500 text-slate-800 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-2.5 px-4 rounded-xl transition-colors shadow-md shadow-emerald-500/10 flex items-center justify-center gap-2 cursor-pointer text-xs"
                >
                  <UserPlus size={16} />
                  <span>{currentT.registerBtn}</span>
                </button>
              </form>
            </div>
          </motion.div>
        )}

        {/* TAB 3: PLOT BOOKING & PLANNER */}
        {activeTab === 'booking' && (
          <motion.div
            key="booking"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            id="tab-booking"
          >
            {/* Booking Config Form */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-4">
              <h4 className="font-display font-bold text-lg text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
                <Key size={18} className="text-emerald-500" />
                {currentT.bookPlot}
              </h4>

              {bookingSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold p-4 rounded-xl flex items-start gap-2.5 shadow-sm">
                  <CheckCircle size={18} className="text-emerald-500 shrink-0" />
                  <div>
                    <h5 className="font-bold">{currentT.bookingCreated}</h5>
                    <p className="text-[10px] text-emerald-600 mt-0.5">Plot allocation status updated to Locked (Booked) and money receipt logged automatically.</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
                {/* Selector customer */}
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">{currentT.selectCustomer} *</label>
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500 text-slate-800 cursor-pointer"
                  >
                    <option value="">-- Choose Customer --</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{lang === 'en' ? `${c.nameEn} (${c.phone})` : `${c.nameBn} (${c.phone})`}</option>
                    ))}
                  </select>
                </div>

                {/* Selector Project */}
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">{currentT.selectProject} *</label>
                  <select
                    value={selectedProjectId}
                    onChange={(e) => {
                      setSelectedProjectId(e.target.value);
                      setSelectedUnitId(''); // reset unit
                    }}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500 text-slate-800 cursor-pointer"
                  >
                    <option value="">-- Choose Project Portfolio --</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{lang === 'en' ? p.nameEn : p.nameBn}</option>
                    ))}
                  </select>
                </div>

                {/* Selector Unit/Plot */}
                <div className="sm:col-span-2">
                  <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">
                    {currentT.selectUnit} * <span className="text-[10px] text-emerald-600 font-mono font-bold">({currentT.availUnits})</span>
                  </label>
                  <select
                    value={selectedUnitId}
                    onChange={(e) => setSelectedUnitId(e.target.value)}
                    disabled={!selectedProjectId}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500 text-slate-800 cursor-pointer disabled:bg-slate-100 disabled:cursor-not-allowed"
                  >
                    <option value="">-- Choose Unit / Plot Block --</option>
                    {units
                      .filter(u => u.projectId === selectedProjectId && u.status === 'Available')
                      .map(u => (
                        <option key={u.id} value={u.id}>
                          {u.unitNo} - Size: {u.sizeSft} SFT | Base Price: ৳ {u.pricePerSft.toLocaleString()}/SFT
                        </option>
                      ))
                    }
                  </select>
                  {selectedProjectId && units.filter(u => u.projectId === selectedProjectId && u.status === 'Available').length === 0 && (
                    <span className="text-[10px] text-rose-500 font-bold block mt-1">{currentT.noAvailableUnits}</span>
                  )}
                </div>

                {/* Auto Calculated Agreed Price */}
                <div className="sm:col-span-2 bg-slate-50 p-4 rounded-xl border border-slate-250 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 block">{currentT.totalAgreedPrice}</span>
                    <span className="text-base font-bold text-slate-800 font-mono mt-1 block">
                      ৳ {bookingAgreedPrice.toLocaleString()} BDT
                    </span>
                  </div>
                  {selectedUnitId && (
                    <div className="text-[10px] text-slate-500 text-right font-medium">
                      <p>Parking Fee: ৳ {units.find(u => u.id === selectedUnitId)?.parkingChargeBdt.toLocaleString()}</p>
                      <p>Utility Charge: ৳ {units.find(u => u.id === selectedUnitId)?.utilityChargeBdt.toLocaleString()}</p>
                    </div>
                  )}
                </div>

                {/* Booking & Downpayment Receipt Configuration */}
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">{currentT.bookingMoney} *</label>
                  <input
                    type="number"
                    value={bookingMoney}
                    onChange={(e) => setBookingMoney(e.target.value)}
                    placeholder={currentT.bookingMoneyPlaceholder}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500 text-slate-800 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">{currentT.downpayment} *</label>
                  <input
                    type="number"
                    value={downpayment}
                    onChange={(e) => setDownpayment(e.target.value)}
                    placeholder={currentT.downpaymentPlaceholder}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500 text-slate-800 font-mono"
                  />
                </div>

                {/* Installment Plan Generation */}
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">{currentT.installmentPeriod} *</label>
                  <select
                    value={installmentPeriod}
                    onChange={(e) => setInstallmentPeriod(parseInt(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500 text-slate-800 cursor-pointer"
                  >
                    <option value={6}>6 Months Installments</option>
                    <option value={12}>12 Months (1 Year) Installments</option>
                    <option value={18}>18 Months Installments</option>
                    <option value={24}>24 Months (2 Years) Installments</option>
                    <option value={36}>36 Months (3 Years) Installments</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={handleGenerateSchedule}
                    disabled={!bookingAgreedPrice}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold py-2.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Calendar size={14} />
                    <span>{currentT.generateSchedule}</span>
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
                <button
                  type="button"
                  onClick={handleConfirmBooking}
                  disabled={!selectedCustomerId || !selectedProjectId || !selectedUnitId}
                  className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-emerald-500/10 flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircle size={16} />
                  <span>{currentT.confirmBooking}</span>
                </button>
              </div>
            </div>

            {/* Installment Planner Preview Area */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs h-fit space-y-4">
              <h4 className="font-display font-bold text-sm text-slate-800 uppercase tracking-wider text-slate-400">
                {currentT.previewSchedule}
              </h4>

              {schedulePreview.length === 0 ? (
                <div className="py-24 text-center text-slate-300 text-xs">
                  <Calendar size={32} className="mx-auto mb-2 text-slate-200" />
                  <p>Configure booking form and generate schedule plan to preview installments matrix.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1 text-xs">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase pb-2 border-b border-slate-100">
                    <span>{currentT.installNo}</span>
                    <span>{currentT.dueDate}</span>
                    <span className="text-right">{currentT.instAmount}</span>
                  </div>
                  {schedulePreview.map((inst) => (
                    <div key={inst.id} className="flex items-center justify-between py-2 border-b border-slate-50 font-medium text-slate-700 font-mono">
                      <span className="font-bold text-slate-500">#{inst.installmentNo}</span>
                      <span>{inst.dueDate}</span>
                      <span className="font-bold text-slate-800">৳ {inst.amountBdt.toLocaleString()}</span>
                    </div>
                  ))}

                  {/* Summary math */}
                  <div className="pt-3 border-t border-slate-150 font-semibold space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-150/60">
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>Total Agreed Price:</span>
                      <span>৳ {bookingAgreedPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>Booking Money:</span>
                      <span>- ৳ {(parseFloat(bookingMoney) || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>Downpayment:</span>
                      <span>- ৳ {(parseFloat(downpayment) || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-800 font-bold pt-1.5 border-t border-slate-200">
                      <span>Installment Balance:</span>
                      <span>৳ {(bookingAgreedPrice - (parseFloat(bookingMoney) || 0) - (parseFloat(downpayment) || 0)).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* TAB 4: BOOKING STATUS & ACTION DETAILS */}
        {activeTab === 'manage' && (
          <motion.div
            key="manage"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
            id="tab-manage"
          >
            {/* Bookings table */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs">
              <h4 className="font-display font-bold text-lg text-slate-800 mb-4">
                {lang === 'en' ? 'All Portfolio Bookings Accounts' : 'সমগ্র বুকিং অ্যাকাউন্টের বিবরণ ও কার্যক্রম'}
              </h4>

              {bookings.length === 0 ? (
                <div className="py-20 text-center text-slate-400 text-xs">
                  <BookOpen size={36} className="mx-auto mb-2 text-slate-200" />
                  <p>{currentT.noBookings}</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider font-semibold text-[10px]">
                        <th className="pb-3">{currentT.bookingId}</th>
                        <th className="pb-3">{currentT.customer}</th>
                        <th className="pb-3">{currentT.project}</th>
                        <th className="pb-3">{currentT.unitNo}</th>
                        <th className="pb-3 text-right">{lang === 'en' ? 'Total Price (BDT)' : 'চুক্তি মূল্য (টাকা)'}</th>
                        <th className="pb-3 text-right">{currentT.status}</th>
                        <th className="pb-3 text-right">{currentT.actions}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 font-medium text-slate-700">
                      {bookings.map((b) => {
                        const custObj = customers.find(c => c.id === b.customerId);
                        const projObj = projects.find(p => p.id === b.projectId);
                        const unitObj = units.find(u => u.id === b.unitId);

                        return (
                          <tr key={b.id} className="hover:bg-slate-50/50">
                            <td className="py-4 font-mono font-bold text-slate-800">{b.id}</td>
                            <td className="py-4">
                              <div>
                                <p className="font-semibold text-slate-800">{lang === 'en' ? custObj?.nameEn : custObj?.nameBn}</p>
                                <p className="text-[10px] text-slate-400 font-mono">{custObj?.phone}</p>
                              </div>
                            </td>
                            <td className="py-4 text-slate-500 font-semibold">{lang === 'en' ? projObj?.nameEn : projObj?.nameBn}</td>
                            <td className="py-4"><span className="px-2 py-1 bg-slate-100 border border-slate-200 rounded text-slate-700 font-bold">{unitObj?.unitNo}</span></td>
                            <td className="py-4 text-right font-mono font-bold text-slate-800">{formatCurrency(b.totalAgreedPrice, lang)}</td>
                            <td className="py-4 text-right">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${
                                b.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                b.status === 'Completed' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                'bg-rose-50 text-rose-700 border-rose-100'
                              }`}>
                                {b.status === 'Active' ? currentT.installmentPaid + ' / Active' : b.status}
                              </span>
                            </td>
                            <td className="py-4 text-right space-x-1.5 shrink-0">
                              <button
                                onClick={() => setViewingBookingId(b.id)}
                                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold cursor-pointer transition-colors"
                              >
                                {currentT.viewSchedule}
                              </button>
                              {b.status === 'Active' && (
                                <button
                                  onClick={() => setCancellingBookingId(b.id)}
                                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-[10px] font-bold cursor-pointer transition-colors border border-rose-100"
                                >
                                  {currentT.cancelBooking}
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* --- CHILD VIEW / DRAWER PANEL: INDIVIDUAL PAYMENT SCHEDULES --- */}
            {viewingBookingId && (() => {
              const b = bookings.find(bk => bk.id === viewingBookingId);
              if (!b) return null;
              const customerObj = customers.find(c => c.id === b.customerId);
              const projectObj = projects.find(p => p.id === b.projectId);
              const unitObj = units.find(u => u.id === b.unitId);

              // calculations
              const paidSum = b.installments
                .filter(inst => inst.status === 'Paid')
                .reduce((s, inst) => s + inst.amountBdt, 0);
              const collectedTotal = b.bookingMoneyBdt + b.downpaymentBdt + paidSum;
              const pendingDue = b.totalAgreedPrice - collectedTotal;

              return (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl border border-slate-200 p-6 shadow-lg space-y-6"
                >
                  <div className="flex items-center justify-between pb-4 border-b border-slate-150">
                    <div>
                      <h4 className="font-display font-bold text-lg text-slate-800 flex items-center gap-2">
                        <FileText size={18} className="text-emerald-500" />
                        <span>{currentT.bookingDetails} - <span className="font-mono text-emerald-600">{b.id}</span></span>
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {lang === 'en' ? `Customer: ${customerObj?.nameEn} | Unit: ${unitObj?.unitNo} | Project: ${projectObj?.nameEn}` : `গ্রাহক: ${customerObj?.nameBn} | ইউনিট: ${unitObj?.unitNo} | প্রকল্প: ${projectObj?.nameBn}`}
                      </p>
                    </div>
                    <button
                      onClick={() => setViewingBookingId(null)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg cursor-pointer"
                    >
                      {currentT.close}
                    </button>
                  </div>

                  {/* Pricing Balance Stats inside Detailed view */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono">
                    <div>
                      <span className="text-[10px] uppercase font-sans text-slate-400 block font-bold">Agreed Value</span>
                      <span className="text-sm font-bold text-slate-800 block mt-1">৳ {b.totalAgreedPrice.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-sans text-slate-400 block font-bold">Booking + Downpay</span>
                      <span className="text-sm font-bold text-slate-800 block mt-1">৳ {(b.bookingMoneyBdt + b.downpaymentBdt).toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-sans text-slate-400 block font-bold">{currentT.totalPaid}</span>
                      <span className="text-sm font-bold text-emerald-600 block mt-1">৳ {collectedTotal.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-sans text-rose-500 block font-bold">{currentT.remainingDue}</span>
                      <span className="text-sm font-bold text-rose-600 block mt-1">৳ {pendingDue.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Installments Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs font-semibold">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider font-semibold text-[10px]">
                          <th className="pb-3">{currentT.installNo}</th>
                          <th className="pb-3">{currentT.dueDate}</th>
                          <th className="pb-3">{currentT.status}</th>
                          <th className="pb-3">{currentT.receiptNo}</th>
                          <th className="pb-3 text-right">{currentT.instAmount}</th>
                          <th className="pb-3 text-right">{currentT.actions}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 font-medium text-slate-700">
                        {b.installments.map((inst) => (
                          <tr key={inst.id} className="hover:bg-slate-50/50">
                            <td className="py-3 font-bold text-slate-500 font-mono">Installment #{inst.installmentNo}</td>
                            <td className="py-3 font-mono">{inst.dueDate}</td>
                            <td className="py-3">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${
                                inst.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                inst.status === 'Overdue' ? 'bg-rose-50 text-rose-700 border-rose-100 animate-pulse' :
                                'bg-slate-50 text-slate-500 border-slate-200'
                              }`}>
                                {inst.status === 'Paid' ? currentT.installmentPaid :
                                 inst.status === 'Overdue' ? currentT.installmentOverdue :
                                 currentT.installmentUnpaid}
                              </span>
                            </td>
                            <td className="py-3 font-mono text-slate-500">{inst.receiptNo || 'N/A'}</td>
                            <td className="py-3 text-right font-mono font-bold text-slate-800">৳ {inst.amountBdt.toLocaleString()}</td>
                            <td className="py-3 text-right">
                              {inst.status !== 'Paid' && b.status === 'Active' && (
                                <button
                                  onClick={() => handlePayInstallment(b.id, inst.id)}
                                  className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-[10px] rounded-lg cursor-pointer transition-colors shadow-xs"
                                >
                                  {currentT.payInstallment}
                                </button>
                              )}
                              {inst.status === 'Paid' && (
                                <span className="text-[10px] text-slate-400 font-mono">Paid: {inst.paidDate}</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              );
            })()}

            {/* --- CHILD VIEW: BOOKING CANCELLATION PANEL --- */}
            {cancellingBookingId && (() => {
              const b = bookings.find(bk => bk.id === cancellingBookingId);
              if (!b) return null;
              const customerObj = customers.find(c => c.id === b.customerId);
              const unitObj = units.find(u => u.id === b.unitId);

              // calculate collected sum
              const paidSum = b.installments
                .filter(inst => inst.status === 'Paid')
                .reduce((s, inst) => s + inst.amountBdt, 0);
              const collected = b.bookingMoneyBdt + b.downpaymentBdt + paidSum;

              return (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-2xl border-2 border-rose-100 p-6 shadow-xl space-y-6"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <h4 className="font-display font-bold text-rose-600 text-lg flex items-center gap-2">
                      <XCircle size={18} />
                      <span>{currentT.cancelTitle} - <span className="font-mono">{b.id}</span></span>
                    </h4>
                    <button
                      onClick={() => setCancellingBookingId(null)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      ✕
                    </button>
                  </div>

                  <form onSubmit={handleCancelBooking} className="space-y-4 text-xs font-semibold">
                    <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl space-y-2">
                      <p className="text-rose-800 text-xs leading-relaxed font-medium">
                        WARNING: Cancelling this booking will set the contract as **Cancelled**, log a refund transaction, apply penalty fees, and unlock plot **Unit {unitObj?.unitNo}** back to public **Available** inventory. This is irreversible inside our central ledger database.
                      </p>
                      <div className="grid grid-cols-2 gap-4 pt-2 font-mono text-[11px] text-rose-700">
                        <p>Customer: <span className="font-bold">{customerObj?.nameEn}</span></p>
                        <p>Total Collected So Far: <span className="font-bold">৳ {collected.toLocaleString()} BDT</span></p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">{currentT.cancelFee} *</label>
                        <input
                          type="number"
                          required
                          value={cancelFeeBdt}
                          onChange={(e) => setCancelFeeBdt(e.target.value)}
                          placeholder="e.g., 200000"
                          className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-rose-500 font-mono text-slate-800"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">{currentT.refundAmount}</label>
                        <div className="w-full bg-slate-100 border border-slate-200 text-xs rounded-xl px-3 py-2.5 font-mono text-slate-500 h-[38px] flex items-center">
                          ৳ {Math.max(0, collected - (parseFloat(cancelFeeBdt) || 0)).toLocaleString()} BDT
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">{currentT.cancelReason} *</label>
                      <textarea
                        required
                        value={cancelReasonText}
                        onChange={(e) => setCancelReasonText(e.target.value)}
                        placeholder="Please state reasons for contract dissolution (e.g., customer requested refund, default of non-payments...)"
                        rows={3}
                        className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-rose-500 font-medium text-slate-800"
                      />
                    </div>

                    <div className="flex justify-end gap-2.5 pt-3">
                      <button
                        type="button"
                        onClick={() => setCancellingBookingId(null)}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
                      >
                        Abort
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-colors shadow-md shadow-rose-600/10 cursor-pointer"
                      >
                        {currentT.confirmCancelBtn}
                      </button>
                    </div>
                  </form>
                </motion.div>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
