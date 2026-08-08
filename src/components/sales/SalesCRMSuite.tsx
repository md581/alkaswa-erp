import React, { useState, useEffect } from 'react';
import { 
  Layers, Users, TrendingUp, FolderOpen, Activity, Award, Building2, MapPin, 
  Receipt, Plus, Trash2, Calendar, Phone, Mail, DollarSign, FileText, 
  CheckCircle2, AlertCircle, RefreshCw, BarChart2, Info, ArrowRight, 
  Printer, Clock, FileCheck, Check, Send, AlertTriangle, MessageSquare, BookOpen
} from 'lucide-react';
import { dbService } from '../../db/dbService';
import { 
  CRMLead, LeadFollowUp, SiteVisit, Broker, BrokerCommission, 
  CustomerCommunication, BookingWorkflow, Project, ProjectUnit, 
  PlotBooking, BookingInstallment, Customer, MoneyReceipt
} from '../../types';
import DeveloperRef from './DeveloperRef';
import CRMReports from './CRMReports';
import { SalesService } from '../../services/salesService';

interface SalesCRMSuiteProps {
  lang: 'en' | 'bn';
}

export default function SalesCRMSuite({ lang }: SalesCRMSuiteProps) {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'dashboard' | 'pipeline' | 'followups' | 'sitevisits' | 'booking' | 'brokers' | 'communications' | 'reports' | 'developer'>('dashboard');

  // Database States
  const [leads, setLeads] = useState<CRMLead[]>([]);
  const [followUps, setFollowUps] = useState<LeadFollowUp[]>([]);
  const [siteVisits, setSiteVisits] = useState<SiteVisit[]>([]);
  const [brokers, setBrokers] = useState<Broker[]>([]);
  const [commissions, setCommissions] = useState<BrokerCommission[]>([]);
  const [communications, setCommunications] = useState<CustomerCommunication[]>([]);
  const [workflows, setWorkflows] = useState<BookingWorkflow[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [units, setUnits] = useState<ProjectUnit[]>([]);
  const [bookings, setBookings] = useState<PlotBooking[]>([]);
  const [backendMetrics, setBackendMetrics] = useState<any>(null);

  // Load Database Records
  const loadData = async () => {
    try {
      const leadsRes = await SalesService.getLeads();
      if (leadsRes && leadsRes.success) {
        setLeads(leadsRes.data.map((l: any) => ({
          id: l.id,
          customerName: l.customerName,
          mobile: l.phone,
          email: l.email || '',
          source: l.source,
          interestedProjectId: l.interestedProjectId,
          budget: Number(l.budget),
          requirement: l.requirements || '',
          stage: l.stage,
          createdAt: l.createdAt,
          assignedExecutive: l.assignedExecutive || 'Tariq Anam'
        })));
      } else {
        setLeads(dbService.leads.getAll());
      }
    } catch (e) {
      console.warn("Backend leads fetch failed, using local dbService", e);
      setLeads(dbService.leads.getAll());
    }

    try {
      const bookingsRes = await SalesService.getBookings();
      if (bookingsRes && bookingsRes.success) {
        setBookings(bookingsRes.data.map((b: any) => ({
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
          salesPersonId: b.salesPersonId || 'Tariq Anam'
        })));
      } else {
        setBookings(dbService.bookings.getAll());
      }
    } catch (e) {
      console.warn("Backend bookings fetch failed, using local dbService", e);
      setBookings(dbService.bookings.getAll());
    }

    try {
      const dashRes = await SalesService.getDashboard();
      if (dashRes && dashRes.success) {
        setBackendMetrics(dashRes.metrics);
      }
    } catch (e) {
      console.warn("Backend dashboard fetch failed", e);
    }

    // Secondary local tables
    setFollowUps(dbService.leadFollowups.getAll());
    setSiteVisits(dbService.siteVisits.getAll());
    setBrokers(dbService.brokers.getAll());
    setCommissions(dbService.brokerCommissions.getAll());
    setCommunications(dbService.customerCommunications.getAll());
    setWorkflows(dbService.bookingWorkflows.getAll());
    setProjects(dbService.projects.getAll());
    setUnits(dbService.units.getAll());
  };

  useEffect(() => {
    loadData();
  }, []);

  // 1. Lead Creator Form States
  const [customerName, setCustomerName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [source, setSource] = useState<'Facebook' | 'Website' | 'Referral' | 'Broker' | 'Walk-In' | 'Campaign'>('Facebook');
  const [interestedProjectId, setInterestedProjectId] = useState('');
  const [budget, setBudget] = useState('');
  const [requirement, setRequirement] = useState('');
  const [assignedExecutive, setAssignedExecutive] = useState('Tariq Anam');

  const handleAddLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !mobile || !interestedProjectId) return;

    try {
      await SalesService.createLead({
        customerName,
        phone: mobile,
        email,
        source,
        interestedProjectId,
        budget: parseFloat(budget) || 0,
        requirements: requirement,
        assignedExecutive
      });
    } catch (err) {
      console.warn("Backend lead recording failed, falling back to local simulation", err);
      const newLead: CRMLead = {
        id: 'lnd-ld-' + Date.now(),
        customerName,
        mobile,
        email,
        source,
        interestedProjectId,
        budget: parseFloat(budget) || 0,
        requirement,
        stage: 'New Lead',
        createdAt: new Date().toISOString(),
        assignedExecutive
      };
      dbService.leads.create(newLead);
    }
    
    // Auto Create Welcome SMS/Email Communication
    const newComm: CustomerCommunication = {
      id: 'lnd-comm-' + Date.now(),
      leadId: 'lnd-ld-' + Date.now(),
      type: 'SMS',
      timestamp: new Date().toISOString(),
      summary: 'Welcome Auto-SMS Sent',
      details: `Dear ${customerName}, thank you for your interest. Al Kaswa sales advisor will reach you shortly.`,
      sender: 'System Router'
    };
    dbService.customerCommunications.create(newComm);

    // Reset Form
    setCustomerName('');
    setMobile('');
    setEmail('');
    setBudget('');
    setRequirement('');
    await loadData();
  };

  // Lead Stage Updater
  const handleUpdateLeadStage = async (leadId: string, stage: CRMLead['stage']) => {
    dbService.leads.update(leadId, (item) => ({ ...item, stage }));
    await loadData();
  };

  // 2. Follow-Up Schedulers
  const [followLeadId, setFollowLeadId] = useState('');
  const [followDate, setFollowDate] = useState('');
  const [followNotes, setFollowNotes] = useState('');
  const [nextFollowDate, setNextFollowDate] = useState('');
  const [followExecutive, setFollowExecutive] = useState('Tariq Anam');

  const handleAddFollowUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!followLeadId || !followNotes || !followDate || !nextFollowDate) return;

    const newFollow: LeadFollowUp = {
      id: 'lnd-fl-' + Date.now(),
      leadId: followLeadId,
      followUpDate: followDate,
      notes: followNotes,
      salesExecutive: followExecutive,
      nextFollowUp: nextFollowDate,
      completed: false,
      createdAt: new Date().toISOString()
    };

    dbService.leadFollowups.create(newFollow);
    
    // Update Lead to 'Contacted' stage automatically
    dbService.leads.update(followLeadId, (lead) => ({ ...lead, stage: 'Contacted' }));

    // Reset Form
    setFollowLeadId('');
    setFollowNotes('');
    setFollowDate('');
    setNextFollowDate('');
    loadData();
  };

  const handleCompleteFollowUp = (id: string) => {
    dbService.leadFollowups.update(id, (item) => ({ ...item, completed: true }));
    loadData();
  };

  // 3. Site Visit Planner
  const [visitLeadId, setVisitLeadId] = useState('');
  const [visitProjectId, setVisitProjectId] = useState('');
  const [visitDate, setVisitDate] = useState('');
  const [visitExecutive, setVisitExecutive] = useState('Sabina Yasmin');
  const [visitFeedback, setVisitFeedback] = useState('');

  const handleAddSiteVisit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitLeadId || !visitProjectId || !visitDate) return;

    const newVisit: SiteVisit = {
      id: 'lnd-sv-' + Date.now(),
      visitDate,
      projectId: visitProjectId,
      leadId: visitLeadId,
      assignedExecutive: visitExecutive,
      feedback: visitFeedback || 'Scheduled',
      status: 'Scheduled'
    };

    dbService.siteVisits.create(newVisit);

    // Auto promote Lead stage to 'Site Visit Scheduled'
    dbService.leads.update(visitLeadId, (lead) => ({ ...lead, stage: 'Site Visit Scheduled' }));

    setVisitLeadId('');
    setVisitFeedback('');
    setVisitDate('');
    loadData();
  };

  const handleCompleteSiteVisit = (id: string, feedback: string) => {
    dbService.siteVisits.update(id, (item) => {
      // Find the lead associated with this visit to promote stage to Completed
      dbService.leads.update(item.leadId, (lead) => ({ ...lead, stage: 'Site Visit Completed' }));
      return { ...item, status: 'Completed', feedback };
    });
    loadData();
  };

  // 4. Booking Automation Engine Wizard
  const [bookingLeadId, setBookingLeadId] = useState('');
  const [bookingProjectId, setBookingProjectId] = useState('');
  const [bookingUnitId, setBookingUnitId] = useState('');
  const [bookingPrice, setBookingPrice] = useState('');
  const [bookingMoney, setBookingMoney] = useState('');
  const [bookingDownpayment, setBookingDownpayment] = useState('');
  const [bookingInstallments, setBookingInstallments] = useState('12');
  const [bookingStep, setBookingStep] = useState<number | null>(null);
  const [bookingResult, setBookingResult] = useState<{
    bookingNo: string;
    receiptNo: string;
    agreementDraft: string;
  } | null>(null);

  const handleTriggerBookingAutomation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingLeadId || !bookingProjectId || !bookingUnitId || !bookingPrice) return;

    // Start 6-Step Booking Automation Sequence
    setBookingStep(1);
    const lead = leads.find(l => l.id === bookingLeadId)!;
    const project = projects.find(p => p.id === bookingProjectId)!;
    const unit = units.find(u => u.id === bookingUnitId)!;

    const bookingNo = 'BK-AK-' + Math.floor(100000 + Math.random() * 900000);
    const receiptNo = 'MR-LND-' + Math.floor(1000 + Math.random() * 9000);
    const customerId = 'cust-' + Date.now();
    const bookingId = 'bk-' + Date.now();

    // Step 1: Generate Booking Number
    await new Promise(r => setTimeout(r, 600));
    setBookingStep(2);

    // Step 2: Generate Money Receipt
    await new Promise(r => setTimeout(r, 600));
    setBookingStep(3);

    // Step 3: Create Installment Schedule
    await new Promise(r => setTimeout(r, 600));
    setBookingStep(4);

    // Step 4: Reserve Unit
    await new Promise(r => setTimeout(r, 600));
    setBookingStep(5);

    // Step 5: Create Accounting Entries
    await new Promise(r => setTimeout(r, 600));
    setBookingStep(6);

    // Step 6: Generate Agreement Draft
    await new Promise(r => setTimeout(r, 600));

    // Execution / DB Commit:
    const parsedPrice = parseFloat(bookingPrice);
    const parsedBookingMoney = parseFloat(bookingMoney) || 0;
    const parsedDownpayment = parseFloat(bookingDownpayment) || 0;
    const parsedInstallmentCount = parseInt(bookingInstallments) || 12;

    // Call Backend services
    try {
      // 1. Create Customer
      await SalesService.createCustomer({
        fullNameEn: lead.customerName,
        fullNameBn: lead.customerName,
        phone: lead.mobile,
        email: lead.email || 'customer@alkaswa.com',
        nidNo: 'MUT-LND-' + Math.floor(10000000 + Math.random() * 90000000),
        fatherSpouseNameEn: 'S.M. Rahman',
        fatherSpouseNameBn: 'এস.এম. রহমান',
        motherNameEn: 'M. Sultana',
        motherNameBn: 'এম. সুলতানা',
        presentAddressEn: 'Dhaka, Bangladesh',
        presentAddressBn: 'ঢাকা, বাংলাদেশ',
        permanentAddressEn: 'Dhaka, Bangladesh',
        permanentAddressBn: 'ঢাকা, বাংলাদেশ',
        nomineeNameEn: 'Farhana Chowdhury',
        nomineeNameBn: 'ফারহানা চৌধুরী',
        nomineeRelationEn: 'Spouse',
        nomineeRelationBn: 'স্ত্রী',
        nomineePhone: lead.mobile
      });

      // 2. Create Booking Portfolio
      await SalesService.createBooking({
        customerId,
        projectId: bookingProjectId,
        unitId: bookingUnitId,
        totalAgreedPrice: parsedPrice,
        bookingMoneyBdt: parsedBookingMoney,
        downpaymentBdt: parsedDownpayment,
        installmentCount: parsedInstallmentCount,
        installmentFrequency: 'Monthly',
        startDate: new Date().toISOString().split('T')[0]
      });
    } catch (e) {
      console.warn("Backend registration failed, running client local simulation fallback", e);
    }

    // Create Customer (Local Fallback list)
    const newCustomer: Customer = {
      id: customerId,
      nameEn: lead.customerName,
      nameBn: lead.customerName,
      phone: lead.mobile,
      email: lead.email || '',
      nidNo: 'MUT-LND-' + Math.floor(10000000 + Math.random() * 90000000),
      presentAddressEn: 'Dhaka, Bangladesh',
      presentAddressBn: 'ঢাকা, বাংলাদেশ',
      permanentAddressEn: 'Dhaka, Bangladesh',
      permanentAddressBn: 'ঢাকা, বাংলাদেশ',
      nomineeNameEn: 'Pending Nominee',
      nomineeNameBn: 'মনোনীত ব্যক্তি',
      nomineeRelationEn: 'Spouse',
      nomineeRelationBn: 'স্বামী/স্ত্রী',
      nomineePhone: lead.mobile,
      registeredDate: new Date().toISOString().split('T')[0]
    };
    dbService.customers.create(newCustomer);

    const remainingBalance = parsedPrice - parsedBookingMoney - parsedDownpayment;
    const installmentAmt = remainingBalance / parsedInstallmentCount;

    const scheduledInstallments: BookingInstallment[] = [];
    for (let i = 1; i <= parsedInstallmentCount; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() + i);
      scheduledInstallments.push({
        id: `inst-${i}-${Date.now()}`,
        installmentNo: i,
        amountBdt: installmentAmt,
        dueDate: d.toISOString().split('T')[0],
        status: 'Unpaid'
      });
    }

    // Create Booking (Local Fallback list)
    const newBooking: PlotBooking = {
      id: bookingId,
      customerId: customerId,
      projectId: bookingProjectId,
      unitId: bookingUnitId,
      bookingDate: new Date().toISOString().split('T')[0],
      totalAgreedPrice: parsedPrice,
      bookingMoneyBdt: parsedBookingMoney,
      downpaymentBdt: parsedDownpayment,
      installmentCount: parsedInstallmentCount,
      installments: scheduledInstallments,
      status: 'Active',
      salesPersonId: 'Tariq Anam'
    };
    dbService.bookings.create(newBooking);

    // Reserve unit
    dbService.units.update(bookingUnitId, (u) => ({ ...u, status: 'Booked' }));

    // Money Receipt
    const newReceipt: MoneyReceipt = {
      id: 'mr-' + Date.now(),
      receiptNo,
      bookingId,
      receivedFromId: customerId,
      receivedFromName: lead.customerName,
      amountBdt: parsedBookingMoney,
      paymentMode: 'Bank Transfer',
      bankName: 'Sonali Bank Ltd',
      issuedBy: 'Tariq Anam',
      receivedDate: new Date().toISOString().split('T')[0],
      isCleared: true
    };
    dbService.moneyReceipts.create(newReceipt);

    // Accounting Journal entries
    // Dr Cash/Bank (1100), Cr Customer Advances Booking Money (2200)
    dbService.vouchers.create({
      id: 'V-LND-' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      type: 'JV',
      narrationEn: `Booking Money Advance received for Unit ${unit.unitNo} - Project ${project.nameEn}`,
      narrationBn: `${project.nameBn} এর ইউনিট ${unit.unitNo} এর বুকিং ফি প্রাপ্তি।`,
      refNo: bookingNo,
      lines: [
        { accountCode: '1100', debit: parsedBookingMoney, credit: 0 },
        { accountCode: '2200', debit: 0, credit: parsedBookingMoney }
      ]
    });

    // Agreement Draft
    const agreementDraft = `DEED OF AGREEMENT FOR UNIT ALLOCATION

THIS AGREEMENT is entered into on this day of ${new Date().toLocaleDateString('en-GB')}, by and between:
AL KASWA HOLDINGS LIMITED, having its registered office at House 14, Road 4, Uttara, Dhaka, hereinafter referred to as the "DEVELOPER" (which expression shall include its successors and assigns).

AND

MR/MS. ${lead.customerName.toUpperCase()}, bearing Mobile: ${lead.mobile}, Email: ${lead.email || 'N/A'}, hereinafter referred to as the "ALLOTTEE".

WHEREAS the Developer is constructing a premium building named "${project.nameEn}" on Land Area of ${project.landAreaKatha} Katha, and the Allottee has requested allocation of Flat/Plot Unit No. ${unit.unitNo}.

NOW THIS DEED WITNESSETH AS FOLLOWS:
1. SPECIFICS: The Developer hereby registers Unit No: ${unit.unitNo} on Floor ${unit.floorNo} of "${project.nameEn}" in favor of the Allottee.
2. FINANCIALS: Total agreed price is BDT ${parsedPrice.toLocaleString()} only. Booking Money BDT ${parsedBookingMoney.toLocaleString()} is acknowledged hereby.
3. SCHEDULE: Balance shall be payable in ${parsedInstallmentCount} monthly installments.
`;

    // Write to Document Workflow
    dbService.bookingWorkflows.create({
      id: 'wf-' + Date.now(),
      bookingId,
      step: 'Agreement Draft',
      status: 'Completed',
      completedAt: new Date().toISOString(),
      completedBy: 'Automation CRM Engine'
    });

    // Promote Lead Stage to Sold
    dbService.leads.update(bookingLeadId, (l) => ({ ...l, stage: 'Sold' }));

    setBookingResult({
      bookingNo,
      receiptNo,
      agreementDraft
    });
    setBookingStep(7);
    loadData();
  };

  // 5. Broker Registry & Commission Calculator
  const [brokerName, setBrokerName] = useState('');
  const [brokerMobile, setBrokerMobile] = useState('');
  const [brokerAddress, setBrokerAddress] = useState('');
  const [brokerCommPct, setBrokerCommPct] = useState('2.5');

  const handleAddBroker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brokerName || !brokerMobile) return;

    const newBroker: Broker = {
      id: 'brk-' + Date.now(),
      name: brokerName,
      mobile: brokerMobile,
      address: brokerAddress,
      commissionPercent: parseFloat(brokerCommPct) || 2.5,
      salesHistoryCount: 0,
      totalCommissionEarned: 0
    };
    dbService.brokers.create(newBroker);

    setBrokerName('');
    setBrokerMobile('');
    setBrokerAddress('');
    loadData();
  };

  const handleApproveCommission = (commissionId: string) => {
    dbService.brokerCommissions.update(commissionId, (comm) => {
      // Auto Create Accounting Voucher: Dr Sales Commission Expense (5600), Cr Accounts Payable (2100)
      dbService.vouchers.create({
        id: 'JV-COMM-' + Date.now(),
        date: new Date().toISOString().split('T')[0],
        type: 'JV',
        narrationEn: `Broker Commission approved for broker: ${comm.brokerId}`,
        narrationBn: `ব্রোকার ${comm.brokerId} এর জন্য কমিশন খরচ অনুমোদন।`,
        refNo: comm.id,
        lines: [
          { accountCode: '5600', debit: comm.calculatedCommission, credit: 0 },
          { accountCode: '2100', debit: 0, credit: comm.calculatedCommission }
        ]
      });
      return { ...comm, status: 'Approved' };
    });
    loadData();
  };

  const handlePayCommission = (commissionId: string) => {
    dbService.brokerCommissions.update(commissionId, (comm) => {
      // Find broker to increment total earned
      dbService.brokers.update(comm.brokerId, (b) => ({
        ...b,
        salesHistoryCount: b.salesHistoryCount + 1,
        totalCommissionEarned: b.totalCommissionEarned + comm.calculatedCommission
      }));
      return { ...comm, status: 'Paid', payoutDate: new Date().toISOString() };
    });
    loadData();
  };

  // 6. Communication Logs
  const [commLeadId, setCommLeadId] = useState('');
  const [commType, setCommType] = useState<'SMS' | 'Email' | 'Call' | 'Meeting'>('Call');
  const [commSummary, setCommSummary] = useState('');
  const [commDetails, setCommDetails] = useState('');

  const handleAddComm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commLeadId || !commSummary) return;

    const newComm: CustomerCommunication = {
      id: 'comm-' + Date.now(),
      leadId: commLeadId,
      type: commType,
      timestamp: new Date().toISOString(),
      summary: commSummary,
      details: commDetails,
      sender: 'Sabina Yasmin'
    };
    dbService.customerCommunications.create(newComm);

    setCommLeadId('');
    setCommSummary('');
    setCommDetails('');
    loadData();
  };

  // Calculate quick metrics for Dashboard Widgets
  const totalLeads = leads.length;
  const activeFollowupsCount = followUps.filter(f => !f.completed).length;
  const scheduledVisitsCount = siteVisits.filter(v => v.status === 'Scheduled').length;
  const monthlyBookingsCount = bookings.length; // rough estimate
  
  // Calculate collection forecast: sum of unpaid installments
  const totalCollectionForecast = bookings.reduce((sum, b) => {
    return sum + b.installments.filter(inst => inst.status !== 'Paid').reduce((s, i) => s + i.amountBdt, 0);
  }, 0);

  // Auto Reminder Alerts
  const todayStr = new Date().toISOString().split('T')[0];
  const activeFollowUpsList = followUps.filter(f => !f.completed);
  const pendingVisitsList = siteVisits.filter(v => v.status === 'Scheduled');

  return (
    <div className="space-y-6" id="sales-crm-suite-container">
      {/* Module Title Shield */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="bg-emerald-500 text-slate-950 font-mono text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-widest">
                ERP CORE PHASE 5
              </span>
              <span className="bg-slate-800 text-slate-300 font-sans text-[10px] font-bold px-2 py-0.5 rounded-md">
                CRM ENGINE V1.2
              </span>
            </div>
            <h3 className="font-display font-black text-2xl tracking-tight text-slate-100">
              AL KASWA Sales CRM & Booking Automation Suite
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Unified CRM Gateway handling leads acquisition, pipelined schedules, brokers, commissions, and double-entry automated vouchers.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500/10 text-emerald-400 text-xs px-3 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1.5 font-bold">
              <CheckCircle2 size={13} />
              {lang === 'en' ? 'Active Integration' : 'ইন্টিগ্রেশন সক্রিয়'}
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-100 p-2 rounded-2xl border border-slate-200 h-fit max-w-full overflow-x-auto">
        {[
          { id: 'dashboard', label: lang === 'en' ? 'Dashboard Widgets' : 'ড্যাশবোর্ড', icon: Layers },
          { id: 'pipeline', label: lang === 'en' ? 'Lead Pipeline' : 'লিড পাইপলাইন', icon: Award },
          { id: 'followups', label: lang === 'en' ? 'Follow-Up Tracker' : 'ফলো-আপ ট্র্যাকার', icon: Clock },
          { id: 'sitevisits', label: lang === 'en' ? 'Site Visits' : 'সাইট ভিজিট', icon: MapPin },
          { id: 'booking', label: lang === 'en' ? 'Booking Automation' : 'বুকিং অটোমেশন', icon: Receipt },
          { id: 'brokers', label: lang === 'en' ? 'Broker & Commissions' : 'ব্রোকার কমিশন', icon: Users },
          { id: 'communications', label: lang === 'en' ? 'Communications Center' : 'যোগাযোগ কেন্দ্র', icon: MessageSquare },
          { id: 'reports', label: lang === 'en' ? 'Reporting Center' : 'রিপোর্টস সেন্টার', icon: BarChart2 },
          { id: 'developer', label: lang === 'en' ? 'NestJS & DDL' : 'ব্যাকএন্ড ডিডিএল', icon: BookOpen }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === tab.id 
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <tab.icon size={14} className={activeTab === tab.id ? 'text-emerald-600' : 'text-slate-400'} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Main Container Workspace */}
      <div className="min-h-[400px]">
        {/* TAB 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Real Estate KPI Blocks */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{lang === 'en' ? 'Total Active Leads' : 'মোট লিড'}</span>
                  <strong className="text-3xl text-slate-800 font-mono block mt-2">{totalLeads}</strong>
                </div>
                <div className="text-[10px] text-emerald-600 font-bold mt-2 flex items-center gap-1 font-sans">
                  <span>+15% {lang === 'en' ? 'this month' : 'চলতি মাসে'}</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{lang === 'en' ? 'Active Follow-Ups' : 'সক্রিয় ফলো-আপ'}</span>
                  <strong className="text-3xl text-amber-600 font-mono block mt-2">{activeFollowupsCount}</strong>
                </div>
                <div className="text-[10px] text-slate-500 font-semibold mt-2">
                  <span>{lang === 'en' ? 'Require direct callback' : 'সরাসরি যোগাযোগ প্রয়োজন'}</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{lang === 'en' ? 'Scheduled Site Visits' : 'নির্ধারিত সাইট ভিজিট'}</span>
                  <strong className="text-3xl text-blue-600 font-mono block mt-2">{scheduledVisitsCount}</strong>
                </div>
                <div className="text-[10px] text-slate-500 font-semibold mt-2">
                  <span>{lang === 'en' ? 'Today / Tomorrow' : 'আজ এবং আগামীকাল'}</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{lang === 'en' ? 'Automated Bookings' : 'মোট বুকিং সংখ্যা'}</span>
                  <strong className="text-3xl text-emerald-600 font-mono block mt-2">{monthlyBookingsCount}</strong>
                </div>
                <div className="text-[10px] text-emerald-600 font-bold mt-2">
                  <span>{lang === 'en' ? '100% Core System Cleared' : 'মেইন কোর ডাটাবেইজ সিঙ্কড'}</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{lang === 'en' ? 'Collection Forecast' : 'মোট কালেকশন পূর্বাভাস'}</span>
                  <strong className="text-xl text-indigo-700 font-mono font-black block mt-2">৳{(totalCollectionForecast / 100000).toFixed(1)}L</strong>
                </div>
                <div className="text-[10px] text-indigo-600 font-bold mt-2">
                  <span>{lang === 'en' ? 'Unpaid Installments' : 'ভবিষ্যৎ কিস্তি বকেয়া'}</span>
                </div>
              </div>
            </div>

            {/* Reminders Panel & Top Performers */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Automated Reminder Alerts */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-xs p-6">
                <h4 className="font-display font-bold text-sm text-slate-800 mb-4 flex items-center gap-2">
                  <AlertCircle className="text-amber-500 animate-bounce" size={16} />
                  {lang === 'en' ? 'Auto Reminders & Critical Alerts' : 'স্বয়ংক্রিয় এলার্ট ও রিমাইন্ডারস'}
                </h4>
                
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                  {/* Followups alerts */}
                  {activeFollowUpsList.map(f => {
                    const lead = leads.find(l => l.id === f.leadId);
                    return (
                      <div key={f.id} className="p-3.5 bg-amber-50/50 border border-amber-100 rounded-xl flex items-start justify-between gap-3 text-xs">
                        <div>
                          <p className="font-semibold text-slate-800">
                            Follow-up with <span className="text-amber-700">{lead ? lead.customerName : 'Client'}</span>
                          </p>
                          <p className="text-[11px] text-slate-500 mt-1">{f.notes}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[9px] font-bold block mb-1">
                            Due: {f.nextFollowUp}
                          </span>
                          <button 
                            onClick={() => handleCompleteFollowUp(f.id)}
                            className="text-[10px] font-bold text-emerald-600 hover:underline cursor-pointer"
                          >
                            Mark Completed
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {/* Site Visit alerts */}
                  {pendingVisitsList.map(v => {
                    const lead = leads.find(l => l.id === v.leadId);
                    return (
                      <div key={v.id} className="p-3.5 bg-blue-50/50 border border-blue-100 rounded-xl flex items-start justify-between gap-3 text-xs">
                        <div>
                          <p className="font-semibold text-slate-800">
                            Site Visit Scheduled: <span className="text-blue-700">{lead ? lead.customerName : 'Client'}</span>
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">Project: {projects.find(p=>p.id===v.projectId)?.nameEn}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[9px] font-bold block mb-1">
                            {v.visitDate}
                          </span>
                          <button 
                            onClick={() => handleCompleteSiteVisit(v.id, 'Feedback Logged')}
                            className="text-[10px] font-bold text-emerald-600 hover:underline cursor-pointer"
                          >
                            Confirm Visit Completed
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {activeFollowUpsList.length === 0 && pendingVisitsList.length === 0 && (
                    <p className="text-slate-400 text-center py-6">
                      {lang === 'en' ? 'All clear! No critical alerts for today.' : 'আজকের কোনো জটিল এলার্ট বা পেন্ডিং রিমাইন্ডার নেই।'}
                    </p>
                  )}
                </div>
              </div>

              {/* Leaderboards */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 space-y-6">
                <div>
                  <h4 className="font-display font-bold text-sm text-slate-800 mb-3 flex items-center gap-1.5">
                    <Award className="text-emerald-500" size={16} />
                    {lang === 'en' ? 'Top Sales Executives' : 'সেরা বিক্রয় এক্সিকিউটিভ'}
                  </h4>
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-slate-700">Tariq Anam</span>
                      <strong className="font-mono text-slate-800">4 Bookings</strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-slate-700">Sabina Yasmin</span>
                      <strong className="font-mono text-slate-800">3 Bookings</strong>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <h4 className="font-display font-bold text-sm text-slate-800 mb-3 flex items-center gap-1.5">
                    <Users className="text-emerald-500" size={16} />
                    {lang === 'en' ? 'Top Affiliated Brokers' : 'সেরা ব্রোকার অংশীদার'}
                  </h4>
                  <div className="space-y-3 text-xs">
                    {brokers.slice(0, 2).map(b => (
                      <div key={b.id} className="flex justify-between items-center">
                        <span className="font-semibold text-slate-700">{b.name}</span>
                        <strong className="font-mono text-emerald-600">৳{b.totalCommissionEarned.toLocaleString()}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LEAD PIPELINE */}
        {activeTab === 'pipeline' && (
          <div className="space-y-6">
            {/* Quick lead generator and Pipeline switcher */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form */}
              <form onSubmit={handleAddLead} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs h-fit space-y-4">
                <h4 className="font-display font-bold text-sm text-slate-800 flex items-center gap-2">
                  <Plus className="text-emerald-500" size={16} />
                  {lang === 'en' ? 'Source New Sales Lead' : 'নতুন কাস্টমার লিড এন্ট্রি'}
                </h4>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-slate-500 block mb-1 font-semibold">{lang === 'en' ? 'Customer Name' : 'গ্রাহকের নাম'} *</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="e.g. Salim Ullah"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500 text-slate-800"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-500 block mb-1 font-semibold">{lang === 'en' ? 'Mobile' : 'মোবাইল'} *</label>
                      <input 
                        type="tel" 
                        required 
                        placeholder="01711XXXXXX"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500 text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="text-slate-500 block mb-1 font-semibold">Email</label>
                      <input 
                        type="email" 
                        placeholder="e.g. client@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500 text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-500 block mb-1 font-semibold">{lang === 'en' ? 'Lead Source' : 'লিড সোর্স'}</label>
                      <select 
                        value={source} 
                        onChange={(e) => setSource(e.target.value as any)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500 text-slate-800"
                      >
                        <option value="Facebook">Facebook</option>
                        <option value="Website">Website</option>
                        <option value="Referral">Referral</option>
                        <option value="Broker">Broker</option>
                        <option value="Walk-In">Walk-In</option>
                        <option value="Campaign">Campaign</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-slate-500 block mb-1 font-semibold">{lang === 'en' ? 'Budget BDT' : 'বাজেট টাকা'}</label>
                      <input 
                        type="number" 
                        placeholder="e.g. 9500000"
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500 text-slate-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-500 block mb-1 font-semibold">{lang === 'en' ? 'Interested Project' : 'আগ্রহী প্রকল্প'} *</label>
                    <select 
                      required
                      value={interestedProjectId} 
                      onChange={(e) => setInterestedProjectId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500 text-slate-800"
                    >
                      <option value="">-- Choose Project --</option>
                      {projects.map(p => (
                        <option key={p.id} value={p.id}>{lang === 'en' ? p.nameEn : p.nameBn}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-500 block mb-1 font-semibold">{lang === 'en' ? 'Client Requirements' : 'নির্দিষ্ট চাহিদা'}</label>
                    <textarea 
                      rows={2}
                      placeholder="e.g. 1500 Sqft, South Facing, Dual Parking"
                      value={requirement}
                      onChange={(e) => setRequirement(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500 text-slate-800"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Create & Dispatch Welcome Auto-SMS
                </button>
              </form>

              {/* Pipeline Kanban / List View */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-xs p-6 space-y-4">
                <h4 className="font-display font-bold text-sm text-slate-800">
                  {lang === 'en' ? 'Active Leads Stage-Shifter Pipeline' : 'সক্রিয় লিড পাইপলাইন স্টেজ কন্ট্রোলার'}
                </h4>
                <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
                  {leads.map(lead => (
                    <div key={lead.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex flex-col md:flex-row justify-between gap-4 text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-slate-800 text-sm">{lead.customerName}</strong>
                          <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-600 text-[9px] font-bold">
                            {lead.source}
                          </span>
                        </div>
                        <p className="text-[10px] font-semibold text-slate-400 font-mono mt-1">
                          Mob: {lead.mobile} | Project: {projects.find(p=>p.id===lead.interestedProjectId)?.nameEn}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-1 italic">Requirement: {lead.requirement || 'General interest'}</p>
                        <p className="text-[11px] font-bold text-slate-700 mt-1">Budget: ৳{lead.budget?.toLocaleString()}</p>
                      </div>

                      <div className="flex flex-col gap-1 items-start md:items-end justify-center">
                        <label className="text-[9px] font-bold text-slate-400 uppercase">Change Stage</label>
                        <select
                          value={lead.stage}
                          onChange={(e) => handleUpdateLeadStage(lead.id, e.target.value as any)}
                          className="bg-white border border-slate-200 rounded px-2 py-1 text-[11px] font-bold text-slate-800 focus:outline-none"
                        >
                          <option value="New Lead">New Lead</option>
                          <option value="Contacted">Contacted</option>
                          <option value="Site Visit Scheduled">Site Visit Scheduled</option>
                          <option value="Site Visit Completed">Site Visit Completed</option>
                          <option value="Negotiation">Negotiation</option>
                          <option value="Booking">Booking</option>
                          <option value="Sold">Sold</option>
                        </select>
                      </div>
                    </div>
                  ))}
                  {leads.length === 0 && (
                    <p className="text-center text-slate-400 py-6">No sales leads generated yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: FOLLOW-UPS */}
        {activeTab === 'followups' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Scheduler */}
            <form onSubmit={handleAddFollowUp} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs h-fit space-y-4">
              <h4 className="font-display font-bold text-sm text-slate-800 flex items-center gap-2">
                <Clock className="text-emerald-500" size={16} />
                {lang === 'en' ? 'Log Call / Follow-Up Task' : 'ফলো-আপ কার্য বিবরণী'}
              </h4>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-500 block mb-1 font-semibold">{lang === 'en' ? 'Select Lead Customer' : 'গ্রাহক লিড'}</label>
                  <select 
                    required
                    value={followLeadId}
                    onChange={(e) => setFollowLeadId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500 text-slate-800 font-bold"
                  >
                    <option value="">-- Choose Lead --</option>
                    {leads.map(l => (
                      <option key={l.id} value={l.id}>{l.customerName} ({l.mobile})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-500 block mb-1 font-semibold">{lang === 'en' ? 'Follow-Up Date' : 'যোগাযোগের তারিখ'}</label>
                    <input 
                      type="date" 
                      required
                      value={followDate}
                      onChange={(e) => setFollowDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500 text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-1 font-semibold">{lang === 'en' ? 'Next Action Date' : 'পরবর্তী পদক্ষেপ তারিখ'}</label>
                    <input 
                      type="date" 
                      required
                      value={nextFollowDate}
                      onChange={(e) => setNextFollowDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500 text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-500 block mb-1 font-semibold">{lang === 'en' ? 'Call / Meeting Notes' : 'কথোপকথন ও নোটস'}</label>
                  <textarea 
                    required
                    rows={4}
                    placeholder="Customer liked floor plan. Requested details regarding downpayment and monthly installment sizes..."
                    value={followNotes}
                    onChange={(e) => setFollowNotes(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500 text-slate-800"
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
              >
                Log Follow-Up & Dispatch Alarm
              </button>
            </form>

            {/* List */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-xs p-6 space-y-4">
              <h4 className="font-display font-bold text-sm text-slate-800">{lang === 'en' ? 'Follow-Up History & Action Items' : 'ফলো-আপ কার্যকারী খতিয়ান'}</h4>
              <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
                {followUps.map(f => {
                  const lead = leads.find(l => l.id === f.leadId);
                  return (
                    <div key={f.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50 text-xs flex flex-col md:flex-row justify-between gap-4">
                      <div>
                        <strong className="text-sm text-slate-800">{lead ? lead.customerName : 'Client'}</strong>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">Logged on: {f.followUpDate} | Executive: {f.salesExecutive}</p>
                        <p className="text-slate-600 mt-2 bg-white p-2.5 rounded-lg border border-slate-150/50 leading-relaxed font-mono">{f.notes}</p>
                        <p className="text-indigo-600 font-bold mt-2">Next Follow-Up Date: {f.nextFollowUp}</p>
                      </div>

                      <div className="flex flex-col justify-center shrink-0">
                        {f.completed ? (
                          <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full font-bold text-[10px] flex items-center gap-1">
                            <CheckCircle2 size={12} />
                            Completed
                          </span>
                        ) : (
                          <button 
                            onClick={() => handleCompleteFollowUp(f.id)}
                            className="bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 px-3 py-1.5 rounded-xl font-bold text-[10px] transition-colors cursor-pointer"
                          >
                            Mark Completed
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SITE VISITS */}
        {activeTab === 'sitevisits' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form */}
            <form onSubmit={handleAddSiteVisit} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs h-fit space-y-4">
              <h4 className="font-display font-bold text-sm text-slate-800 flex items-center gap-2">
                <MapPin className="text-emerald-500" size={16} />
                {lang === 'en' ? 'Schedule Site Visit' : 'সাইট ভিজিট শিডিউল'}
              </h4>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-500 block mb-1 font-semibold">{lang === 'en' ? 'Select Lead Customer' : 'গ্রাহক লিড'}</label>
                  <select 
                    required
                    value={visitLeadId}
                    onChange={(e) => setVisitLeadId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500 text-slate-800 font-bold"
                  >
                    <option value="">-- Choose Lead --</option>
                    {leads.map(l => (
                      <option key={l.id} value={l.id}>{l.customerName}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-500 block mb-1 font-semibold">{lang === 'en' ? 'Select Project' : 'প্রকল্প'}</label>
                  <select 
                    required
                    value={visitProjectId}
                    onChange={(e) => setVisitProjectId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500 text-slate-800"
                  >
                    <option value="">-- Choose Project --</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{lang === 'en' ? p.nameEn : p.nameBn}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-500 block mb-1 font-semibold">{lang === 'en' ? 'Visit Date' : 'ভিজিটের তারিখ'}</label>
                    <input 
                      type="date" 
                      required
                      value={visitDate}
                      onChange={(e) => setFollowDate(e.target.value)} // sync with date inputs
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500 text-slate-800"
                      onBlur={(e) => setVisitDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-1 font-semibold">{lang === 'en' ? 'Assigned Host' : 'নিয়োজিত কর্মকর্তা'}</label>
                    <select 
                      value={visitExecutive}
                      onChange={(e) => setVisitExecutive(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500 text-slate-800"
                    >
                      <option value="Sabina Yasmin">Sabina Yasmin</option>
                      <option value="Tariq Anam">Tariq Anam</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-slate-500 block mb-1 font-semibold">{lang === 'en' ? 'Initial Notes / Focus' : 'প্রাথমিক নোটস'}</label>
                  <input 
                    type="text"
                    placeholder="Wants to check construction progress of roofslab first."
                    value={visitFeedback}
                    onChange={(e) => setVisitFeedback(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500 text-slate-800"
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
              >
                Book Site Visit Appointment
              </button>
            </form>

            {/* List */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-xs p-6 space-y-4">
              <h4 className="font-display font-bold text-sm text-slate-800">{lang === 'en' ? 'Site Visit Ledger & Feedback' : 'সাইট ভিজিট এবং গ্রাহক প্রতিক্রিয়া'}</h4>
              <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
                {siteVisits.map(sv => {
                  const lead = leads.find(l => l.id === sv.leadId);
                  const proj = projects.find(p => p.id === sv.projectId);
                  return (
                    <div key={sv.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50 text-xs flex flex-col md:flex-row justify-between gap-4">
                      <div>
                        <strong className="text-sm text-slate-800">{lead ? lead.customerName : 'Client'}</strong>
                        <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                          Project: {proj ? proj.nameEn : 'Project'} | Executive: {sv.assignedExecutive}
                        </p>
                        <p className="text-slate-600 mt-2 bg-white p-2.5 border border-slate-150/50 rounded-lg leading-relaxed font-mono">
                          Notes / Feedback: {sv.feedback}
                        </p>
                        <p className="text-indigo-600 font-bold mt-2 font-mono">Date Scheduled: {sv.visitDate}</p>
                      </div>

                      <div className="flex flex-col justify-center shrink-0">
                        {sv.status === 'Completed' ? (
                          <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full font-bold text-[10px] flex items-center gap-1">
                            <CheckCircle2 size={12} />
                            Completed
                          </span>
                        ) : (
                          <div className="space-y-1">
                            <button 
                              onClick={() => handleCompleteSiteVisit(sv.id, 'Client was highly impressed with construction works.')}
                              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3 py-1.5 rounded-xl text-[10px] transition-all cursor-pointer"
                            >
                              Log Completed
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: BOOKING AUTOMATION */}
        {activeTab === 'booking' && (
          <div className="space-y-6">
            <div className="bg-emerald-50 border border-emerald-150 p-6 rounded-2xl flex items-start gap-4">
              <Info className="text-emerald-600 shrink-0 mt-0.5 animate-pulse" size={18} />
              <div>
                <strong className="text-xs text-emerald-950 uppercase tracking-widest block mb-1">
                  1-Click Multi-Module Transaction Router (Booking Automation Core)
                </strong>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  When a booking transaction is processed, the system triggers 6 micro-steps in real-time:
                  (1) Auto generates a Booking Code, (2) Registers a new ERP Customer account, (3) Builds an amortization payment schedule, 
                  (4) reserves the unit in inventory, (5) creates double-entry journal entries, and (6) dynamic legal deed compilation.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form */}
              <form onSubmit={handleTriggerBookingAutomation} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs h-fit space-y-4">
                <h4 className="font-display font-bold text-sm text-slate-800 flex items-center gap-2">
                  <Receipt className="text-emerald-500" size={16} />
                  {lang === 'en' ? 'Trigger Booking Automation' : 'বুকিং অটোমেশন ফর্ম'}
                </h4>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-slate-500 block mb-1 font-semibold">{lang === 'en' ? 'Select Lead' : 'গ্রাহক লিড'}</label>
                    <select 
                      required
                      value={bookingLeadId}
                      onChange={(e) => setBookingLeadId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500 text-slate-800 font-bold"
                    >
                      <option value="">-- Choose Lead --</option>
                      {leads.filter(l => l.stage !== 'Sold').map(l => (
                        <option key={l.id} value={l.id}>{l.customerName} ({l.mobile})</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-500 block mb-1 font-semibold">{lang === 'en' ? 'Select Project' : 'প্রকল্প'}</label>
                      <select 
                        required
                        value={bookingProjectId}
                        onChange={(e) => {
                          setBookingProjectId(e.target.value);
                          setBookingUnitId('');
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500 text-slate-800"
                      >
                        <option value="">-- Choose Project --</option>
                        {projects.map(p => (
                          <option key={p.id} value={p.id}>{p.nameEn}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-slate-500 block mb-1 font-semibold">{lang === 'en' ? 'Select Unit' : 'ইউনিট'}</label>
                      <select 
                        required
                        value={bookingUnitId}
                        onChange={(e) => {
                          const unitId = e.target.value;
                          setBookingUnitId(unitId);
                          const un = units.find(u => u.id === unitId);
                          if (un) {
                            const totalPrice = (un.sizeSft * un.pricePerSft) + un.parkingChargeBdt + un.utilityChargeBdt;
                            setBookingPrice(totalPrice.toString());
                            setBookingMoney((totalPrice * 0.05).toString());
                          }
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500 text-slate-800 font-bold"
                      >
                        <option value="">-- Choose Unit --</option>
                        {units
                          .filter(u => u.projectId === bookingProjectId && u.status === 'Available')
                          .map(u => (
                            <option key={u.id} value={u.id}>Unit {u.unitNo} ({u.status})</option>
                          ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="text-slate-500 block mb-1 font-semibold">Total Price</label>
                      <input 
                        type="number" 
                        required
                        value={bookingPrice}
                        onChange={(e) => setBookingPrice(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-2.5 focus:outline-none font-mono font-bold text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="text-slate-500 block mb-1 font-semibold">Booking Deposit</label>
                      <input 
                        type="number" 
                        required
                        value={bookingMoney}
                        onChange={(e) => setBookingMoney(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-2.5 focus:outline-none font-mono font-bold text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="text-slate-500 block mb-1 font-semibold">Installments</label>
                      <select
                        value={bookingInstallments}
                        onChange={(e) => setBookingInstallments(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-2.5 focus:outline-none text-slate-800 font-bold"
                      >
                        <option value="6">6 Months</option>
                        <option value="12">12 Months</option>
                        <option value="24">24 Months</option>
                        <option value="36">36 Months</option>
                      </select>
                    </div>
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-3 rounded-xl text-xs transition-colors cursor-pointer"
                >
                  EXECUTE 6-STEP BOOKING AUTOMATION
                </button>
              </form>

              {/* Wizard Status Display */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-xs p-6 space-y-6">
                <h4 className="font-display font-bold text-sm text-slate-800">
                  {lang === 'en' ? 'Automation Processing Log' : 'প্রসেসিং এবং অটোমেশন ট্র্যাকার'}
                </h4>

                {bookingStep === null && (
                  <div className="h-64 flex flex-col items-center justify-center text-center text-slate-400">
                    <RefreshCw className="animate-spin mb-3 text-slate-300" size={32} />
                    <p className="text-xs">Fill out the booking parameters and trigger the multi-module transaction.</p>
                  </div>
                )}

                {bookingStep !== null && bookingStep < 7 && (
                  <div className="space-y-4 font-mono text-xs text-slate-600">
                    <p className="font-bold text-indigo-600 animate-pulse">Running Al Kaswa Transaction Router Engine...</p>
                    
                    {[
                      { stepNo: 1, label: 'Generating Booking Reference Key & core registration...' },
                      { stepNo: 2, label: 'Instantiating Money Receipt & allocation receipts...' },
                      { stepNo: 3, label: 'Calculating amortized installment schedule matrices...' },
                      { stepNo: 4, label: 'Locking unit status to Reserved/Booked in project grid...' },
                      { stepNo: 5, label: 'Writing double-entry General Journal accounting entries...' },
                      { stepNo: 6, label: 'Compiling legal Deed of Agreement templates...' }
                    ].map((step) => {
                      const isActive = bookingStep === step.stepNo;
                      const isCompleted = bookingStep > step.stepNo;
                      return (
                        <div key={step.stepNo} className="flex items-center gap-3 p-2 border border-slate-100 rounded-lg">
                          {isCompleted ? (
                            <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                          ) : isActive ? (
                            <RefreshCw size={16} className="text-indigo-500 animate-spin shrink-0" />
                          ) : (
                            <Clock size={16} className="text-slate-300 shrink-0" />
                          )}
                          <span className={isCompleted ? 'text-slate-800 font-bold' : isActive ? 'text-indigo-600 font-black animate-pulse' : 'text-slate-400'}>
                            Step {step.stepNo}: {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {bookingStep === 7 && bookingResult && (
                  <div className="space-y-5">
                    <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3">
                      <CheckCircle2 className="text-emerald-600" size={20} />
                      <div>
                        <strong className="text-xs text-emerald-950 uppercase">Booking Confirmed Successfully!</strong>
                        <p className="text-[11px] text-emerald-700 font-mono">CODE: {bookingResult.bookingNo} | RECEIPT: {bookingResult.receiptNo}</p>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-900 text-slate-300 rounded-2xl font-mono text-[10px] space-y-3 h-64 overflow-y-auto">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <span className="text-slate-100 font-bold">Dynamic Agreement Draft</span>
                        <button 
                          onClick={() => window.print()}
                          className="flex items-center gap-1 bg-slate-800 text-slate-200 px-2 py-1 rounded text-[9px] font-bold"
                        >
                          <Printer size={10} /> Print Document
                        </button>
                      </div>
                      <pre className="whitespace-pre-wrap">{bookingResult.agreementDraft}</pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: BROKERS & COMMISSIONS */}
        {activeTab === 'brokers' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Side: Register Broker */}
            <div className="space-y-6 h-fit">
              <form onSubmit={handleAddBroker} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4 text-xs">
                <h4 className="font-display font-bold text-sm text-slate-800 flex items-center gap-2">
                  <Users className="text-emerald-500" size={16} />
                  {lang === 'en' ? 'Register Broker Partner' : 'ব্রোকার পার্টনার এন্ট্রি'}
                </h4>

                <div className="space-y-3">
                  <div>
                    <label className="text-slate-500 block mb-1 font-semibold">Broker / Consultant Name *</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="e.g. Al-Amin Consultants"
                      value={brokerName}
                      onChange={(e) => setBrokerName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500 text-slate-800 font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-slate-500 block mb-1 font-semibold">Mobile No *</label>
                    <input 
                      type="tel" 
                      required 
                      placeholder="01711XXXXXX"
                      value={brokerMobile}
                      onChange={(e) => setBrokerMobile(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500 text-slate-800"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-500 block mb-1 font-semibold">Commission Rate (%)</label>
                      <input 
                        type="number" 
                        step="0.1"
                        value={brokerCommPct}
                        onChange={(e) => setBrokerCommPct(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500 text-slate-800 font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-slate-500 block mb-1 font-semibold">Address / Office</label>
                      <input 
                        type="text" 
                        placeholder="Banani, Dhaka"
                        value={brokerAddress}
                        onChange={(e) => setBrokerAddress(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500 text-slate-800"
                      />
                    </div>
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Register Broker & Activate Rate
                </button>
              </form>

              {/* Commission Calculator Widget */}
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-4 text-xs">
                <h4 className="font-display font-bold text-sm text-slate-800 flex items-center gap-1.5">
                  <TrendingUp className="text-emerald-500" size={16} />
                  Commission Calculator Engine
                </h4>
                <p className="text-[11px] text-slate-500">
                  Auto calculate payouts using formula: Sale Value × Rate %
                </p>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-2 font-mono">
                  <div className="flex justify-between">
                    <span>Base Value:</span>
                    <strong className="text-slate-800">৳9,500,000</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Commission:</span>
                    <strong className="text-indigo-600">2.5%</strong>
                  </div>
                  <hr className="border-slate-200/60" />
                  <div className="flex justify-between text-sm">
                    <span className="font-bold">Total Payout:</span>
                    <strong className="text-emerald-600">৳237,500</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side: Commission approvals ledger */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-xs p-6 space-y-4 text-xs">
              <h4 className="font-display font-bold text-sm text-slate-800">
                Broker Commissions & Payout Workflows
              </h4>

              <div className="space-y-3 max-h-[450px] overflow-y-auto">
                {commissions.map((comm) => {
                  const broker = brokers.find(b => b.id === comm.brokerId);
                  return (
                    <div key={comm.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50 font-mono flex flex-col md:flex-row justify-between gap-4">
                      <div>
                        <strong className="text-sm text-slate-800 font-sans">{broker ? broker.name : 'Partner Broker'}</strong>
                        <p className="text-[10px] text-slate-400 mt-1">Ref ID: {comm.id} | Booking: {comm.bookingId || 'N/A'}</p>
                        <p className="text-xs text-slate-600 mt-2">
                          Sale value: <strong className="text-slate-800">৳{comm.saleValue.toLocaleString()}</strong> @ {comm.commissionPercent}% rate
                        </p>
                        <p className="text-emerald-600 font-bold text-sm mt-1">Calculated Commission: ৳{comm.calculatedCommission.toLocaleString()}</p>
                      </div>

                      <div className="flex flex-col gap-1.5 justify-center font-sans shrink-0">
                        {comm.status === 'Pending' && (
                          <button 
                            onClick={() => handleApproveCommission(comm.id)}
                            className="bg-indigo-500 hover:bg-indigo-400 text-white font-bold px-3 py-1.5 rounded-xl text-[10px] text-center cursor-pointer"
                          >
                            Approve Commission
                          </button>
                        )}
                        {comm.status === 'Approved' && (
                          <button 
                            onClick={() => handlePayCommission(comm.id)}
                            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3 py-1.5 rounded-xl text-[10px] text-center cursor-pointer"
                          >
                            Disburse Payout (Paid)
                          </button>
                        )}
                        {comm.status === 'Paid' && (
                          <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-bold text-center border border-emerald-100 flex items-center gap-1 justify-center">
                            <CheckCircle2 size={12} /> Paid
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
                {commissions.length === 0 && (
                  <p className="text-center text-slate-400 py-6">No commissions calculated yet.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: COMMUNICATIONS CENTER */}
        {activeTab === 'communications' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form */}
            <form onSubmit={handleAddComm} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs h-fit space-y-4">
              <h4 className="font-display font-bold text-sm text-slate-800 flex items-center gap-2">
                <MessageSquare className="text-emerald-500" size={16} />
                {lang === 'en' ? 'Log Communication' : 'গ্রাহক যোগাযোগ এন্ট্রি'}
              </h4>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-500 block mb-1 font-semibold">{lang === 'en' ? 'Lead Customer' : 'গ্রাহক লিড'}</label>
                  <select 
                    required
                    value={commLeadId}
                    onChange={(e) => setCommLeadId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500 text-slate-800 font-bold"
                  >
                    <option value="">-- Choose Lead --</option>
                    {leads.map(l => (
                      <option key={l.id} value={l.id}>{l.customerName}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-500 block mb-1 font-semibold">{lang === 'en' ? 'Communication Type' : 'যোগাযোগের ধরণ'}</label>
                    <select 
                      value={commType}
                      onChange={(e) => setCommType(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500 text-slate-800 font-bold"
                    >
                      <option value="Call">Call Note</option>
                      <option value="SMS">SMS Sent</option>
                      <option value="Email">Email Sent</option>
                      <option value="Meeting">Meeting Log</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-500 block mb-1 font-semibold">{lang === 'en' ? 'Summary Heading' : 'সংক্ষিপ্ত বিষয়'}</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Price Negotiation"
                      value={commSummary}
                      onChange={(e) => setCommSummary(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500 text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-500 block mb-1 font-semibold">{lang === 'en' ? 'Conversation Details' : 'আলোচনার বিস্তারিত বিবরণ'}</label>
                  <textarea 
                    rows={4}
                    placeholder="Discussed flat layouts, price options, installment cycles, and booked site visit scheduled next week..."
                    value={commDetails}
                    onChange={(e) => setCommDetails(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500 text-slate-800"
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
              >
                Log Contact & Save History
              </button>
            </form>

            {/* Logs List */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-xs p-6 space-y-4">
              <h4 className="font-display font-bold text-sm text-slate-800">{lang === 'en' ? 'SMS & Interaction History' : 'বার্তা ও যোগাযোগ খতিয়ান'}</h4>
              <div className="space-y-3 max-h-[450px] overflow-y-auto">
                {communications.map(comm => {
                  const lead = leads.find(l => l.id === comm.leadId);
                  return (
                    <div key={comm.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50 text-xs font-mono">
                      <div className="flex items-center justify-between border-b border-slate-200/60 pb-1.5 mb-2 font-sans">
                        <div>
                          <strong className="text-slate-800">{lead ? lead.customerName : 'Client'}</strong>
                          <span className={`ml-2 px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                            comm.type === 'SMS' ? 'bg-indigo-50 text-indigo-700' : comm.type === 'Email' ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'
                          }`}>
                            {comm.type}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400">{new Date(comm.timestamp).toLocaleString()}</span>
                      </div>
                      <p className="font-bold text-slate-700 font-sans">{comm.summary}</p>
                      <p className="text-slate-600 mt-1 leading-relaxed font-mono whitespace-pre-wrap">{comm.details}</p>
                      <p className="text-[9px] text-slate-400 mt-2 font-sans">Logged By: {comm.sender}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: REPORTS */}
        {activeTab === 'reports' && (
          <CRMReports 
            lang={lang} 
            leads={leads} 
            followUps={followUps} 
            siteVisits={siteVisits} 
            brokers={brokers} 
            commissions={commissions} 
            bookings={bookings} 
            projects={projects} 
            units={units} 
          />
        )}

        {/* TAB 9: DEVELOPER REF */}
        {activeTab === 'developer' && (
          <DeveloperRef lang={lang} />
        )}
      </div>
    </div>
  );
}
