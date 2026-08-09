/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { dbService } from '../db/dbService';
import { 
  Plus, 
  Search, 
  Printer, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Award, 
  FileText, 
  Wrench, 
  ShieldAlert, 
  Calendar, 
  User, 
  Layers, 
  Activity, 
  CheckSquare, 
  RefreshCw, 
  Building2, 
  Smile, 
  ShieldCheck, 
  Lock,
  Flame,
  ArrowRight,
  ClipboardList,
  MessageSquare,
  Key
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  UnitHandover, 
  HandoverChecklist, 
  DefectReport, 
  WarrantyRecord, 
  CustomerComplaint, 
  ServiceTicket, 
  UtilityClearance, 
  CustomerFeedback,
  DefectCategory,
  DefectStatus,
  WarrantyType,
  ComplaintPriority,
  ComplaintStatus,
  TicketStatus
} from '../types';
import { formatCurrency, formatDate } from '../utils/translations';

interface Props {
  lang: 'en' | 'bn';
}

export default function HandoverAfterSalesModule({ lang }: Props) {
  const [activeTab, setActiveTab] = useState<'overview' | 'handovers' | 'defects' | 'warranties' | 'complaints' | 'reports' | 'facility'>('overview');
  
  // Real-time states reading from shared memory database
  const [handovers, setHandovers] = useState<UnitHandover[]>([]);
  const [checklists, setChecklists] = useState<HandoverChecklist[]>([]);
  const [defects, setDefects] = useState<DefectReport[]>([]);
  const [warranties, setWarranties] = useState<WarrantyRecord[]>([]);
  const [complaints, setComplaints] = useState<CustomerComplaint[]>([]);
  const [tickets, setTickets] = useState<ServiceTicket[]>([]);
  const [utilities, setUtilities] = useState<UtilityClearance[]>([]);
  const [feedbacks, setFeedbacks] = useState<CustomerFeedback[]>([]);
  
  // Real-time ticket escalations state (Phase 21 CRM Hardening)
  const [ticketEscalations, setTicketEscalations] = useState<Record<string, { level: 'L1' | 'L2' | 'L3'; note: string; date: string }>>({});
  const [escalationNoteInput, setEscalationNoteInput] = useState('');
  
  const [projects, setProjects] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  
  // Create / Edit modal states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHandover, setSelectedHandover] = useState<UnitHandover | null>(null);
  const [selectedDefect, setSelectedDefect] = useState<DefectReport | null>(null);
  const [selectedComplaint, setSelectedComplaint] = useState<CustomerComplaint | null>(null);
  
  // Document generation state
  const [previewDoc, setPreviewDoc] = useState<{ type: string; title: string; html: string } | null>(null);
  
  // Create forms states
  const [showAddHandover, setShowAddHandover] = useState(false);
  const [showAddDefect, setShowAddDefect] = useState(false);
  const [showAddComplaint, setShowAddComplaint] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  
  // Add Handover form state
  const [newHovProject, setNewHovProject] = useState('');
  const [newHovUnit, setNewHovUnit] = useState('');
  const [newHovCust, setNewHovCust] = useState('');
  const [newHovDate, setNewHovDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Add Defect form state
  const [newDfUnit, setNewDfUnit] = useState('');
  const [newDfCategory, setNewDfCategory] = useState<DefectCategory>('Civil');
  const [newDfDesc, setNewDfDesc] = useState('');
  const [newDfEngineer, setNewDfEngineer] = useState('Nazia Sultana (ENG)');
  
  // Add Complaint form state
  const [newCmpCust, setNewCmpCust] = useState('');
  const [newCmpUnit, setNewCmpUnit] = useState('');
  const [newCmpPriority, setNewCmpPriority] = useState<ComplaintPriority>('Medium');
  const [newCmpDetails, setNewCmpDetails] = useState('');
  
  // Feedback form state
  const [feedScore, setFeedScore] = useState(5);
  const [feedComments, setFeedComments] = useState('');
  const [feedHovId, setFeedHovId] = useState('');

  // Selected handover sub-tab state (inside side dossier)
  const [dossierSubTab, setDossierSubTab] = useState<'clearance' | 'inspection' | 'keys' | 'signoff'>('clearance');

  // Flat Inspection Checklist states (Keyed by handoverId)
  const [flatInspectionChecklist, setFlatInspectionChecklist] = useState<Record<string, {
    electricalSockets: boolean;
    civilFinishing: boolean;
    plumbingFixtures: boolean;
    tilingAlignment: boolean;
    doorsWindows: boolean;
  }>>({});

  // Plot Inspection Checklist states (Keyed by handoverId)
  const [plotInspectionChecklist, setPlotInspectionChecklist] = useState<Record<string, {
    boundaryPins: boolean;
    soilLeveling: boolean;
    sewageOutlet: boolean;
    roadAccess: boolean;
  }>>({});

  // Key Delivery Register (Keyed by handoverId)
  const [keyDeliveryRegister, setKeyDeliveryRegister] = useState<Record<string, {
    mainKey: boolean;
    roomKeys: boolean;
    balconyKeys: boolean;
    kitchenKeys: boolean;
    receiverName: string;
    keysCount: number;
  }>>({});

  // Sign-off verification states (Keyed by handoverId)
  const [signOffAccepted, setSignOffAccepted] = useState<Record<string, boolean>>({});
  const [signOffSignature, setSignOffSignature] = useState<Record<string, string>>({});

  // Facility Management registers
  const [facilityTab, setFacilityTab] = useState<'security' | 'cleaners' | 'maintenance' | 'assets' | 'visitors'>('security');
  
  const [securityRoster, setSecurityRoster] = useState([
    { id: 'sec-1', name: 'Md. Dulal Hossain', shift: 'Day Shift (06:00 - 18:00)', gate: 'Main Entrance Gate A', contact: '01711-223344', status: 'On Duty' },
    { id: 'sec-2', name: 'Kabir Ahmed', shift: 'Night Shift (18:00 - 06:00)', gate: 'Main Entrance Gate A', contact: '01822-334455', status: 'On Duty' },
    { id: 'sec-3', name: 'Zahirul Islam', shift: 'Day Shift (06:00 - 18:00)', gate: 'Basement Parking B', contact: '01933-445566', status: 'On Break' },
  ]);

  const [cleanerSchedule, setCleanerSchedule] = useState([
    { id: 'cl-1', name: 'Rasheda Begum', area: 'Ground Floor Lobby & Stairs', task: 'Mopping and dusting', status: 'Completed', lastChecked: '10:30 AM' },
    { id: 'cl-2', name: 'Mitu Akter', area: 'Rooftop Community Center', task: 'Trash disposal', status: 'Pending', lastChecked: '08:00 AM' },
    { id: 'cl-3', name: 'Abul Kalam', area: 'Basement A & B Drainage', task: 'Debris clearing', status: 'Completed', lastChecked: '11:15 AM' },
  ]);

  const [maintenanceTeam, setMaintenanceTeam] = useState([
    { id: 'm-1', name: 'Engr. Kamrul Hassan', specialty: 'Electrical Systems', phone: '01511-998877', availability: 'Available' },
    { id: 'm-2', name: 'Anwar Hossain', specialty: 'Plumbing & Pumps', phone: '01622-887766', availability: 'On Dispatch' },
    { id: 'm-3', name: 'Sujon Mia', specialty: 'Lift & Generator Tech', phone: '01733-776655', availability: 'Available' },
  ]);

  const [commonAreaInspections, setCommonAreaInspections] = useState([
    { id: 'ins-1', area: 'Main Entrance & Lobby', itemsChecked: 'Lighting, Doors, Front Desk', condition: 'Excellent', inspector: 'M. Rafiq', date: '2026-07-09' },
    { id: 'ins-2', area: 'Basement Parking', itemsChecked: 'Drainage Pump, CCTV, Lighting', condition: 'Fair', inspector: 'Engr. Kamrul', date: '2026-07-08' },
    { id: 'ins-3', area: 'Stairwells & Fire Exits', itemsChecked: 'Fire Extinguishers, Emergency Lights', condition: 'Good', inspector: 'Sujon Mia', date: '2026-07-07' },
  ]);

  const [visitorRegister, setVisitorRegister] = useState([
    { id: 'vis-1', name: 'Monirul Islam', phone: '01819-112233', unitVisited: 'A-3', purpose: 'Friend Site Visit', checkIn: '09:45 AM', checkOut: '11:00 AM' },
    { id: 'vis-2', name: 'Dr. Shahana Begum', phone: '01712-445566', unitVisited: 'B-5', purpose: 'Allottee Inspection', checkIn: '10:30 AM', checkOut: 'Ongoing' },
  ]);

  const [assetMaintenance, setAssetMaintenance] = useState([
    { id: 'ast-1', name: 'Standby Generator (500 KVA)', lastService: '2026-05-15', nextService: '2026-08-15', fuelLevel: '85%', runningHours: '342 hrs', status: 'Normal' },
    { id: 'ast-2', name: 'Passenger Elevator 01 (Sigma)', lastService: '2026-06-10', nextService: '2026-07-10', sensorStatus: 'Functional', cables: 'Certified', status: 'Maintenance Due' },
    { id: 'ast-3', name: 'Passenger Elevator 02 (Sigma)', lastService: '2026-06-12', nextService: '2026-07-12', sensorStatus: 'Functional', cables: 'Certified', status: 'Normal' },
    { id: 'ast-4', name: 'Submersible Water Pump 01', lastService: '2026-04-20', nextService: '2026-07-20', motorTemp: '42°C', pressurePsi: '45 PSI', status: 'Normal' },
  ]);

  // Visitor form states
  const [newVisitorName, setNewVisitorName] = useState('');
  const [newVisitorPhone, setNewVisitorPhone] = useState('');
  const [newVisitorUnit, setNewVisitorUnit] = useState('');
  const [newVisitorPurpose, setNewVisitorPurpose] = useState('');

  // Helper methods for dynamic checklists & logs (Phase 21 CRM Hardening)
  const getFlatChecklist = (hovId: string) => {
    return flatInspectionChecklist[hovId] || {
      electricalSockets: false,
      civilFinishing: false,
      plumbingFixtures: false,
      tilingAlignment: false,
      doorsWindows: false
    };
  };

  const toggleFlatChecklist = (hovId: string, field: 'electricalSockets' | 'civilFinishing' | 'plumbingFixtures' | 'tilingAlignment' | 'doorsWindows') => {
    const current = getFlatChecklist(hovId);
    setFlatInspectionChecklist({
      ...flatInspectionChecklist,
      [hovId]: {
        ...current,
        [field]: !current[field]
      }
    });
  };

  const getPlotChecklist = (hovId: string) => {
    return plotInspectionChecklist[hovId] || {
      boundaryPins: false,
      soilLeveling: false,
      sewageOutlet: false,
      roadAccess: false
    };
  };

  const togglePlotChecklist = (hovId: string, field: 'boundaryPins' | 'soilLeveling' | 'sewageOutlet' | 'roadAccess') => {
    const current = getPlotChecklist(hovId);
    setPlotInspectionChecklist({
      ...plotInspectionChecklist,
      [hovId]: {
        ...current,
        [field]: !current[field]
      }
    });
  };

  const getKeyRegister = (hovId: string) => {
    return keyDeliveryRegister[hovId] || {
      mainKey: false,
      roomKeys: false,
      balconyKeys: false,
      kitchenKeys: false,
      receiverName: '',
      keysCount: 0
    };
  };

  const updateKeyRegister = (hovId: string, updates: Partial<{
    mainKey: boolean;
    roomKeys: boolean;
    balconyKeys: boolean;
    kitchenKeys: boolean;
    receiverName: string;
    keysCount: number;
  }>) => {
    const current = getKeyRegister(hovId);
    setKeyDeliveryRegister({
      ...keyDeliveryRegister,
      [hovId]: {
        ...current,
        ...updates
      }
    });
  };

  // Fetch initial data
  const loadData = () => {
    setHandovers(dbService.unitHandovers.getAll());
    setChecklists(dbService.handoverChecklists.getAll());
    setDefects(dbService.defectReports.getAll());
    setWarranties(dbService.warrantyRecords.getAll());
    setComplaints(dbService.customerComplaints.getAll());
    setTickets(dbService.serviceTickets.getAll());
    setUtilities(dbService.utilityClearances.getAll());
    setFeedbacks(dbService.customerFeedback.getAll());
    
    setProjects(dbService.projects.getAll());
    setUnits(dbService.units.getAll());
    setCustomers(dbService.customers.getAll());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAuditLog = (action: string, detailsEn: string, detailsBn: string) => {
    const timestamp = new Date().toISOString();
    dbService.auditLogs.create({
      id: 'log_' + Date.now(),
      userId: 'user-hnd-1',
      userName: 'M. Rafiq (Handover Officer)',
      userRole: 'Sales Operations Manager',
      action,
      tableName: 'unit_handovers',
      detailsEn,
      detailsBn,
      createdAt: timestamp,
    });
  };

  // 1. Handover Management: Add unit handover
  const handleCreateHandover = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHovProject || !newHovUnit || !newHovCust) {
      alert(lang === 'en' ? 'Please fill out all fields!' : 'দয়া করে সব ঘর পূরণ করুন!');
      return;
    }

    // Verify if handover already exists for unit
    const exists = handovers.some(h => h.unitId === newHovUnit);
    if (exists) {
      alert(lang === 'en' ? 'Handover process already initiated for this unit!' : 'এই ইউনিটের জন্য হ্যান্ডওভার প্রক্রিয়া ইতিমধ্যে শুরু হয়েছে!');
      return;
    }

    const handoverId = 'hov-' + Date.now();
    const handoverNo = 'HOV-2026-' + String(handovers.length + 1).padStart(3, '0');
    
    const newHov: UnitHandover = {
      id: handoverId,
      handoverNo,
      customerId: newHovCust,
      projectId: newHovProject,
      unitId: newHovUnit,
      handoverDate: newHovDate,
      status: 'Pending'
    };

    // Default Pre-Handover Checklist
    const newChk: HandoverChecklist = {
      id: 'chk-' + Date.now(),
      handoverId,
      fullPaymentCompleted: false,
      utilityBillsCleared: false,
      registrationCompleted: false,
      mutationCompleted: false,
      keysReady: false,
      documentsReady: false
    };

    // Default Utility Clearance
    const newUt: UtilityClearance = {
      id: 'ut-' + Date.now(),
      handoverId,
      electricityCleared: false,
      gasCleared: false,
      waterCleared: false,
      serviceChargeCleared: false,
      maintenanceFeesCleared: false
    };

    dbService.unitHandovers.create(newHov);
    dbService.handoverChecklists.create(newChk);
    dbService.utilityClearances.create(newUt);

    handleAuditLog(
      'INSERT',
      `Initiated handover process ${handoverNo} for Unit ID ${newHovUnit}`,
      `ইউনিট আইডি ${newHovUnit} এর জন্য হ্যান্ডওভার প্রক্রিয়া ${handoverNo} শুরু করা হয়েছে`
    );

    loadData();
    setShowAddHandover(false);
    setNewHovProject('');
    setNewHovUnit('');
    setNewHovCust('');
  };

  // Toggle checklist tasks
  const handleToggleChecklist = (handoverId: string, field: keyof HandoverChecklist) => {
    const chk = checklists.find(c => c.handoverId === handoverId);
    if (!chk) return;

    const updated = { ...chk, [field]: !chk[field] };
    dbService.handoverChecklists.update(chk.id, () => updated);
    loadData();
  };

  // Toggle utility clearance
  const handleToggleUtility = (handoverId: string, field: keyof UtilityClearance) => {
    const ut = utilities.find(u => u.handoverId === handoverId);
    if (!ut) return;

    const updated = { ...ut, [field]: !ut[field] };
    dbService.utilityClearances.update(ut.id, () => updated);
    
    // Auto sync check: if all utilities are cleared, update checklists.utilityBillsCleared
    const allCleared = updated.electricityCleared && updated.gasCleared && updated.waterCleared && updated.serviceChargeCleared && updated.maintenanceFeesCleared;
    const chk = checklists.find(c => c.handoverId === handoverId);
    if (chk) {
      dbService.handoverChecklists.update(chk.id, (c) => ({ ...c, utilityBillsCleared: allCleared }));
    }

    loadData();
  };

  // Final Settlement details calculation helper
  const getSettlementDetails = (handover: UnitHandover) => {
    const unitObj = units.find(u => u.id === handover.unitId);
    const booking = dbService.bookings.getAll().find(b => b.customerId === handover.customerId && b.unitId === handover.unitId);
    
    if (!booking || !unitObj) {
      return { totalDue: 0, outstanding: 0, installmentsCleared: false, ready: false };
    }

    // Calculate paid installments
    const paidAmount = booking.installments
      .filter((i: any) => i.status === 'Paid')
      .reduce((sum: number, i: any) => sum + i.amountBdt, 0) + booking.bookingMoneyBdt + booking.downpaymentBdt;

    const outstanding = booking.totalAgreedPrice - paidAmount;
    const installmentsCleared = outstanding <= 0;

    return {
      totalDue: booking.totalAgreedPrice,
      paid: paidAmount,
      outstanding,
      installmentsCleared,
      ready: installmentsCleared
    };
  };

  // Mark unit as "Ready for Handover" if checklist is complete
  const handleMarkReady = (hov: UnitHandover) => {
    const chk = checklists.find(c => c.handoverId === hov.id);
    const settlement = getSettlementDetails(hov);

    if (!chk) return;

    const checklistIncomplete = 
      !chk.fullPaymentCompleted || 
      !chk.utilityBillsCleared || 
      !chk.registrationCompleted || 
      !chk.mutationCompleted || 
      !chk.keysReady || 
      !chk.documentsReady;

    if (checklistIncomplete) {
      alert(lang === 'en' 
        ? 'Cannot mark as ready! Pre-handover checklist is incomplete.' 
        : 'প্রস্তুত চিহ্নিত করা যাবে না! প্রি-হ্যান্ডওভার চেকলিস্ট অসম্পূর্ণ আছে।');
      return;
    }

    if (!settlement.installmentsCleared) {
      alert(lang === 'en' 
        ? 'Cannot mark as ready! Outstanding amount must be 0 for Final Settlement.' 
        : 'প্রস্তুত চিহ্নিত করা যাবে না! চূড়ান্ত নিষ্পত্তির জন্য বকেয়া অবশ্যই ০ হতে হবে।');
      return;
    }

    dbService.unitHandovers.update(hov.id, (item) => ({ ...item, status: 'Ready' }));
    handleAuditLog(
      'UPDATE',
      `Handover ${hov.handoverNo} marked as READY. Checklist and final settlements verified.`,
      `হ্যান্ডওভার ${hov.handoverNo} প্রস্তুত (READY) হিসেবে চিহ্নিত করা হয়েছে। চেকলিস্ট ও ফাইনাল সেটলমেন্ট যাচাইকৃত।`
    );
    loadData();
  };

  // Complete Handover & Accounting Integration Flow
  const handleCompleteHandover = (hov: UnitHandover) => {
    // Perform handover completion
    dbService.unitHandovers.update(hov.id, (item) => ({ ...item, status: 'Completed' }));
    
    // Update Unit Status in system
    const unitObj = units.find(u => u.id === hov.unitId);
    if (unitObj) {
      dbService.units.update(unitObj.id, (item) => ({ ...item, status: 'Sold' }));
    }

    // Auto-Register standard warranties for completed handovers (Electrical, Plumbing, Waterproofing)
    const baseWarranties: WarrantyType[] = ['Electrical Warranty', 'Plumbing Warranty', 'Waterproofing Warranty'];
    baseWarranties.forEach((type, index) => {
      dbService.warrantyRecords.create({
        id: `w-auto-${Date.now()}-${index}`,
        unitId: hov.unitId,
        warrantyType: type,
        startDate: hov.handoverDate,
        expiryDate: new Date(new Date(hov.handoverDate).setFullYear(new Date(hov.handoverDate).getFullYear() + (type === 'Waterproofing Warranty' ? 5 : 2))).toISOString().split('T')[0]
      });
    });

    // Accounting Integration posting:
    // Debit Cost of Sales, Credit Inventory / Project Cost
    // Debit Warranty Expense, Credit Provision for Warranty
    const unitPrice = unitObj ? (unitObj.sizeSft * unitObj.pricePerSft) : 12000000;
    const estCost = unitPrice * 0.70; // assume 70% cost
    const warrantyProvision = 50000; // standard warranty provision

    const voucherId = 'JV-HOV-' + Date.now().toString().slice(-6);
    dbService.vouchers.create({
      id: voucherId,
      date: hov.handoverDate,
      type: 'JV',
      narrationEn: `Property Handover Cost of Sales & Warranty Provision recognition for Handover ${hov.handoverNo} Unit ${unitObj?.unitNo || ''}`,
      narrationBn: `হ্যান্ডওভার ${hov.handoverNo} ইউনিট ${unitObj?.unitNo || ''} এর জন্য বিক্রয়মূল্য ব্যয় ও ওয়ারেন্টি প্রভিশন হিসাবভুক্তকরণ`,
      lines: [
        { accountCode: '5300', debit: estCost, credit: 0 }, // Sourcing/Project Cost of Sales (Cost of sales)
        { accountCode: '1400', debit: 0, credit: estCost }, // Inventory/Project Cost Asset Credit
        { accountCode: '5600', debit: warrantyProvision, credit: 0 }, // Warranty Expense (Direct Marketing/Ops Expense)
        { accountCode: '2100', debit: 0, credit: warrantyProvision } // Provision / Accounts Payable Credit
      ]
    });

    handleAuditLog(
      'UPDATE',
      `Completed Handover ${hov.handoverNo}. Triggered accounting cost voucher ${voucherId} and auto-registered base warranties.`,
      `হ্যান্ডওভার ${hov.handoverNo} সফলভাবে সম্পন্ন হয়েছে। অ্যাকাউন্টিং কস্ট ভাউচার ${voucherId} পোস্ট করা হয়েছে এবং ওয়ারেন্টি নিবন্ধিত হয়েছে।`
    );

    loadData();
  };

  // Document Generation Engines
  const generateDocument = (hov: UnitHandover, type: 'handover' | 'possession' | 'settlement' | 'warranty' | 'acceptance') => {
    const cust = customers.find(c => c.id === hov.customerId);
    const proj = projects.find(p => p.id === hov.projectId);
    const unitObj = units.find(u => u.id === hov.unitId);
    const settlement = getSettlementDetails(hov);

    const companyName = lang === 'en' ? 'AL KASWA HOLDINGS LIMITED' : 'আল কাসওয়া হোল্ডিংস লিমিটেড';
    const clientName = cust ? (lang === 'en' ? cust.nameEn : cust.nameBn) : 'Valued Client';
    const pName = proj ? (lang === 'en' ? proj.nameEn : proj.nameBn) : 'Al Kaswa Project';
    const uNo = unitObj ? unitObj.unitNo : 'N/A';
    const floor = unitObj ? unitObj.floorNo : 'N/A';
    const size = unitObj ? unitObj.sizeSft : 'N/A';
    const dateFormatted = formatDate(hov.handoverDate);

    let title = '';
    let html = '';

    if (type === 'handover') {
      title = lang === 'en' ? 'Handover Certificate' : 'হ্যান্ডওভার সনদ';
      html = `
        <div class="p-8 font-serif text-slate-800 max-w-2xl mx-auto border-8 border-double border-emerald-800 bg-amber-50/20">
          <div class="text-center mb-8">
            <h1 class="text-xl font-bold tracking-widest text-emerald-800 uppercase">${companyName}</h1>
            <p class="text-[10px] tracking-widest font-mono text-slate-500 uppercase">Premium Real Estate Developer</p>
            <div class="w-16 h-0.5 bg-emerald-600 mx-auto mt-2"></div>
          </div>
          
          <h2 class="text-center font-bold text-2xl text-slate-900 mb-6 font-display uppercase tracking-wider">${title}</h2>
          
          <p class="mb-4 text-justify leading-relaxed">
            This is to certify that <strong>${companyName}</strong> has officially handed over and delivered physical, peaceful, and vacant possession of the residential/commercial apartment described below to the allottee:
          </p>

          <table class="w-full text-sm border border-slate-300 mb-6">
            <tr class="bg-slate-100"><td class="p-2 border font-bold">Handover Ref No</td><td class="p-2 border font-mono">${hov.handoverNo}</td></tr>
            <tr><td class="p-2 border font-bold">Allottee Name</td><td class="p-2 border">${clientName}</td></tr>
            <tr class="bg-slate-100"><td class="p-2 border font-bold">Project Name</td><td class="p-2 border">${pName}</td></tr>
            <tr><td class="p-2 border font-bold">Unit / Flat No</td><td class="p-2 border">${uNo} (Floor ${floor})</td></tr>
            <tr class="bg-slate-100"><td class="p-2 border font-bold">Super Area</td><td class="p-2 border">${size} Sft</td></tr>
            <tr><td class="p-2 border font-bold">Handover Date</td><td class="p-2 border">${dateFormatted}</td></tr>
          </table>

          <p class="mb-8 leading-relaxed text-sm">
            The allottee has fully inspected the unit, verified the complete finishes, fittings, utility clearances, and expressed utmost satisfaction. All physical keys and original possession documents are hereby delivered.
          </p>

          <div class="flex justify-between mt-12 text-center text-xs">
            <div>
              <div class="w-32 border-t border-slate-400 mx-auto mt-8 pt-1">Allottee Signature</div>
            </div>
            <div>
              <div class="w-32 border-t border-slate-400 mx-auto mt-8 pt-1">Project Architect</div>
            </div>
            <div>
              <div class="w-32 border-t border-emerald-600 mx-auto mt-8 pt-1 text-emerald-800 font-bold">For Al Kaswa Holdings</div>
            </div>
          </div>
        </div>
      `;
    } else if (type === 'possession') {
      title = lang === 'en' ? 'Possession Letter' : 'দখলপত্র';
      html = `
        <div class="p-8 font-sans text-slate-800 max-w-2xl mx-auto border border-slate-300 shadow-sm bg-white">
          <div class="mb-6">
            <h1 class="text-lg font-bold text-slate-900">${companyName}</h1>
            <p class="text-xs text-slate-500">Corporate Office: Gulshan Avenue, Dhaka, Bangladesh</p>
            <p class="text-xs font-mono">Ref: AKHL/POSS/${hov.handoverNo}</p>
            <p class="text-xs">Date: ${dateFormatted}</p>
          </div>
          
          <h2 class="text-xl font-bold text-slate-900 mb-4 pb-2 border-b uppercase">${title}</h2>
          
          <p class="text-sm mb-4">To,<br><strong>${clientName}</strong><br>Phone: ${cust?.phone || ''}</p>
          
          <p class="text-sm mb-4 font-bold">Subject: Delivery of Possession of Unit ${uNo} at project "${pName}"</p>
          
          <p class="text-sm mb-4 leading-relaxed">
            Dear Customer,
          </p>
          <p class="text-sm mb-4 leading-relaxed text-justify">
            We are pleased to inform you that the construction of your allotted Unit <strong>${uNo}</strong> situated on Floor <strong>${floor}</strong> having an approximate area of <strong>${size} Sft</strong> at <strong>${pName}</strong> is fully completed in accordance with the specifications in the booking agreement.
          </p>
          <p class="text-sm mb-4 leading-relaxed text-justify">
            Since you have cleared all your dues, outstanding installments, utility charges, and registration/mutation formalities, we are hereby transferring the physical possession of the said property to you today.
          </p>
          <p class="text-sm mb-8 leading-relaxed text-justify">
            Please find attached the keys and physical checklist of utility items. We welcome you to the Al Kaswa family of proud homeowners!
          </p>

          <div class="flex justify-between mt-16 text-xs font-bold text-slate-700">
            <div>Accepted By (Allottee)</div>
            <div>Authorized Signatory<br>${companyName}</div>
          </div>
        </div>
      `;
    } else if (type === 'settlement') {
      title = lang === 'en' ? 'Final Settlement Certificate' : 'চূড়ান্ত নিষ্পত্তি সনদ';
      html = `
        <div class="p-8 font-mono text-xs text-slate-800 max-w-2xl mx-auto border border-slate-900 bg-slate-50">
          <div class="text-center mb-6">
            <h1 class="text-sm font-bold uppercase">${companyName}</h1>
            <p>ACCOUNTING & FINANCE DIVISION</p>
            <p>Ref: FIN/SETT/${hov.handoverNo}</p>
            <p>Date: ${dateFormatted}</p>
          </div>

          <h2 class="text-center font-bold text-sm border-y border-slate-900 py-1 uppercase mb-6">${title}</h2>

          <p class="mb-4">CUSTOMER NAME: ${clientName}</p>
          <p class="mb-4">PROJECT: ${pName} | UNIT: ${uNo}</p>
          
          <div class="border-b border-dashed border-slate-900 my-4"></div>
          
          <table class="w-full text-left mb-6">
            <tr><td class="py-1">Total Agreed Apartment Price:</td><td class="text-right py-1">${formatCurrency(settlement.totalDue || 0, lang)}</td></tr>
            <tr><td class="py-1">Booking Money Received:</td><td class="text-right py-1">${formatCurrency(settlement.paid || 0, lang)}</td></tr>
            <tr class="font-bold border-t border-slate-900"><td class="py-1">OUTSTANDING ACCOUNT BALANCE:</td><td class="text-right py-1">BDT 0.00</td></tr>
          </table>

          <div class="border-b border-dashed border-slate-900 my-4"></div>

          <p class="leading-relaxed mb-6">
            This certifies that the above customer has settled all structural installments, downpayments, service charge adjustments, and utility connection costs. The client's ledger holds NO further claims or outstanding dues.
          </p>

          <div class="flex justify-between mt-12 pt-6">
            <div>Prepared By: Accounts Officer</div>
            <div>Approved By: Accounts Manager</div>
          </div>
        </div>
      `;
    } else if (type === 'warranty') {
      title = lang === 'en' ? 'Warranty Certificate' : 'ওয়ারেন্টি সনদ';
      html = `
        <div class="p-8 font-serif text-slate-800 max-w-2xl mx-auto border-4 border-slate-700 bg-stone-50">
          <div class="text-center mb-6">
            <h1 class="text-lg font-bold text-stone-900">${companyName}</h1>
            <p class="text-xs uppercase italic">Quality Assurance Department</p>
          </div>

          <h2 class="text-center text-xl font-bold uppercase text-stone-800 tracking-wide mb-6">${title}</h2>

          <p class="mb-4 text-justify text-sm">
            This certificate guarantees that Unit <strong>${uNo}</strong> in Project <strong>${pName}</strong> is fully backed by the company's comprehensive structural and service warranty package:
          </p>

          <table class="w-full text-xs border border-slate-400 mb-6">
            <thead>
              <tr class="bg-slate-200 font-bold"><th class="p-2 border">Warranty Item</th><th class="p-2 border">Period</th><th class="p-2 border">Coverage Details</th></tr>
            </thead>
            <tbody>
              <tr><td class="p-2 border font-bold">Electrical Fittings</td><td class="p-2 border">2 Years</td><td class="p-2 border">Wiring, breakers, switches & connections</td></tr>
              <tr class="bg-stone-100"><td class="p-2 border font-bold">Plumbing Fittings</td><td class="p-2 border">2 Years</td><td class="p-2 border">Piping, concealed leaks, faucets & pressure</td></tr>
              <tr><td class="p-2 border font-bold">Waterproofing</td><td class="p-2 border">5 Years</td><td class="p-2 border">Concealed roofing slabs and bathroom damp-proofing</td></tr>
            </tbody>
          </table>

          <p class="text-xs text-stone-600 mb-8 leading-relaxed">
            Warranties take active effect on <strong>${dateFormatted}</strong> and expire accordingly. In case of any snag or component failure, kindly report immediately to the Customer Complaint Center for rapid maintenance.
          </p>

          <div class="text-center text-xs font-bold mt-12">
            Director, Quality Assurance & Engineering Services
          </div>
        </div>
      `;
    } else {
      title = lang === 'en' ? 'Customer Acceptance Form' : 'গ্রাহক স্বীকৃতি ফর্ম';
      html = `
        <div class="p-8 font-sans text-slate-800 max-w-2xl mx-auto border border-slate-300 bg-white">
          <h2 class="text-xl font-bold text-slate-900 mb-4 uppercase text-center">${title}</h2>
          <p class="text-xs text-center text-slate-500 mb-6">${companyName}</p>

          <p class="text-sm mb-4 leading-relaxed">
            I, <strong>${clientName}</strong>, owner of Unit <strong>${uNo}</strong> at <strong>${pName}</strong>, hereby declare that I have personally inspected my unit with the engineers and confirm:
          </p>

          <div class="space-y-2 mb-6 text-sm">
            <div class="flex gap-2"><input type="checkbox" checked disabled> Structural Civil works are completed in high quality.</div>
            <div class="flex gap-2"><input type="checkbox" checked disabled> All electrical wiring and points are functional.</div>
            <div class="flex gap-2"><input type="checkbox" checked disabled> Plumbing fixtures, hot water, and drainage are clear.</div>
            <div class="flex gap-2"><input type="checkbox" checked disabled> Wall paints, wood polishing, and floor tiles are fully finished.</div>
          </div>

          <p class="text-sm leading-relaxed mb-8">
            I accept the possession of the unit in its current flawless condition and agree to adhere to the property's general community guidelines and maintenance charges.
          </p>

          <div class="flex justify-between text-xs font-bold mt-12">
            <div>Customer Name & Signature</div>
            <div>Authorized Handover Executive</div>
          </div>
        </div>
      `;
    }

    setPreviewDoc({ type, title, html });
  };

  // 2. Defect & Snag Management: Add snag report
  const handleCreateDefect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDfUnit || !newDfDesc) {
      alert(lang === 'en' ? 'Please fill out all fields!' : 'দয়া করে সব ঘর পূরণ করুন!');
      return;
    }

    const defectId = 'df-' + Date.now();
    const defectNo = 'DF-SNAG-' + String(defects.length + 1).padStart(3, '0');

    // Find if there is an active handover for this unit
    const hov = handovers.find(h => h.unitId === newDfUnit && h.status !== 'Completed');

    const newDf: DefectReport = {
      id: defectId,
      defectNo,
      unitId: newDfUnit,
      handoverId: hov?.id,
      category: newDfCategory,
      description: newDfDesc,
      reportDate: new Date().toISOString().split('T')[0],
      assignedEngineer: newDfEngineer,
      status: 'Reported'
    };

    dbService.defectReports.create(newDf);

    // Auto-create initial Service Ticket for this defect
    const ticketId = 'tck-' + Date.now();
    const ticketNo = 'TCK-' + String(tickets.length + 1).padStart(4, '0');
    dbService.serviceTickets.create({
      id: ticketId,
      ticketNo,
      defectId,
      assignedStaff: newDfEngineer,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
      status: 'Open'
    });

    handleAuditLog(
      'INSERT',
      `Registered Defect ${defectNo} for Unit ${newDfUnit} under ${newDfCategory}. Ticket ${ticketNo} assigned.`,
      `ইউনিট ${newDfUnit} এর জন্য ${newDfCategory} ক্যাটাগরিতে ত্রুটি ${defectNo} নিবন্ধিত। টিকিট ${ticketNo} বরাদ্দ করা হয়েছে।`
    );

    loadData();
    setShowAddDefect(false);
    setNewDfUnit('');
    setNewDfDesc('');
  };

  // Advance Defect status workflow
  // Reported -> Inspected -> Work Order -> Repair Complete -> Customer Verification -> Close Ticket (Closed)
  const handleAdvanceDefect = (df: DefectReport) => {
    let nextStatus: DefectStatus = 'Reported';
    let ticketStatusToUpdate: TicketStatus = 'In Progress';

    if (df.status === 'Reported') {
      nextStatus = 'Inspected';
      ticketStatusToUpdate = 'In Progress';
    } else if (df.status === 'Inspected') {
      nextStatus = 'Work Order';
      ticketStatusToUpdate = 'In Progress';
    } else if (df.status === 'Work Order') {
      nextStatus = 'Repair Complete';
      ticketStatusToUpdate = 'Resolved';
    } else if (df.status === 'Repair Complete') {
      nextStatus = 'Verified';
      ticketStatusToUpdate = 'Resolved';
    } else if (df.status === 'Verified') {
      nextStatus = 'Closed';
      ticketStatusToUpdate = 'Closed';
    } else {
      return; // Already closed
    }

    dbService.defectReports.update(df.id, (item) => ({ ...item, status: nextStatus }));

    // Sync corresponding Service Ticket status
    const tck = tickets.find(t => t.defectId === df.id);
    if (tck) {
      dbService.serviceTickets.update(tck.id, (item) => ({
        ...item,
        status: ticketStatusToUpdate,
        resolutionDate: nextStatus === 'Closed' ? new Date().toISOString().split('T')[0] : item.resolutionDate
      }));
    }

    handleAuditLog(
      'UPDATE',
      `Advanced Defect ${df.defectNo} status to ${nextStatus}`,
      `ত্রুটি ${df.defectNo} এর অবস্থা পরিবর্তন করে ${nextStatus} করা হয়েছে`
    );

    loadData();
  };

  // 3. Customer Complaint & Service Tickets
  const handleCreateComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCmpCust || !newCmpUnit || !newCmpDetails) {
      alert(lang === 'en' ? 'Please fill out all fields!' : 'দয়া করে সব ঘর পূরণ করুন!');
      return;
    }

    const complaintId = 'comp-' + Date.now();
    const complaintNo = 'CMP-' + String(complaints.length + 1).padStart(4, '0');

    const newCmp: CustomerComplaint = {
      id: complaintId,
      complaintNo,
      customerId: newCmpCust,
      unitId: newCmpUnit,
      complaintDate: new Date().toISOString().split('T')[0],
      priority: newCmpPriority,
      status: 'Pending',
      details: newCmpDetails
    };

    dbService.customerComplaints.create(newCmp);

    // Auto create service ticket for complaints
    const ticketId = 'tck-' + Date.now();
    const ticketNo = 'TCK-' + String(tickets.length + 1).padStart(4, '0');
    dbService.serviceTickets.create({
      id: ticketId,
      ticketNo,
      complaintId,
      assignedStaff: 'Sharif Hasan (CRM Service Specialist)',
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 days for general customer complaints
      status: 'Open'
    });

    handleAuditLog(
      'INSERT',
      `Registered Customer Complaint ${complaintNo} for Unit ${newCmpUnit}. Priority: ${newCmpPriority}. Ticket ${ticketNo} issued.`,
      `গ্রাহক অভিযোগ ${complaintNo} নিবন্ধিত করা হয়েছে। গুরুত্ব: ${newCmpPriority}। টিকিট ${ticketNo} প্রদান করা হয়েছে।`
    );

    loadData();
    setShowAddComplaint(false);
    setNewCmpCust('');
    setNewCmpUnit('');
    setNewCmpDetails('');
  };

  // Resolve complaint
  const handleResolveComplaint = (cmp: CustomerComplaint) => {
    dbService.customerComplaints.update(cmp.id, (item) => ({ ...item, status: 'Resolved' }));
    
    const tck = tickets.find(t => t.complaintId === cmp.id);
    if (tck) {
      dbService.serviceTickets.update(tck.id, (item) => ({
        ...item,
        status: 'Resolved',
        resolutionDate: new Date().toISOString().split('T')[0]
      }));
    }

    loadData();
  };

  // Close complaint and capture rating
  const handleCloseComplaint = (cmp: CustomerComplaint, score: number, comment: string) => {
    dbService.customerComplaints.update(cmp.id, (item) => ({ ...item, status: 'Closed' }));

    const tck = tickets.find(t => t.complaintId === cmp.id);
    if (tck) {
      dbService.serviceTickets.update(tck.id, (item) => ({
        ...item,
        status: 'Closed',
        customerFeedback: `Rating: ${score}/5. Comment: ${comment}`,
        resolutionDate: new Date().toISOString().split('T')[0]
      }));
    }

    loadData();
  };

  // Register Customer Satisfaction score
  const handleAddFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedHovId) return;

    dbService.customerFeedback.create({
      id: 'fb-' + Date.now(),
      handoverId: feedHovId,
      satisfactionScore: feedScore,
      comments: feedComments,
      feedbackDate: new Date().toISOString().split('T')[0]
    });

    handleAuditLog(
      'INSERT',
      `Registered satisfaction feedback score ${feedScore}/5 for handover ID ${feedHovId}`,
      `হ্যান্ডওভার আইডি ${feedHovId} এর জন্য সন্তুষ্টির রেটিং ${feedScore}/৫ রেকর্ড করা হয়েছে`
    );

    loadData();
    setShowFeedbackModal(false);
    setFeedComments('');
    setFeedScore(5);
  };

  // Search filter
  const filteredHandovers = useMemo(() => {
    return handovers.filter(h => {
      const custObj = customers.find(c => c.id === h.customerId);
      const unitObj = units.find(u => u.id === h.unitId);
      const projObj = projects.find(p => p.id === h.projectId);
      
      const matchQuery = 
        h.handoverNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (custObj?.nameEn || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (custObj?.nameBn || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (unitObj?.unitNo || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (projObj?.nameEn || '').toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchQuery;
    });
  }, [handovers, customers, units, projects, searchQuery]);

  // Statistics calculations for Widgets
  const stats = useMemo(() => {
    const totalCount = handovers.length;
    const completedCount = handovers.filter(h => h.status === 'Completed').length;
    const pendingCount = handovers.filter(h => h.status === 'Pending').length;
    const readyCount = handovers.filter(h => h.status === 'Ready').length;
    
    const activeWarranties = warranties.length;
    const openDefects = defects.filter(d => d.status !== 'Closed').length;
    const openComplaints = complaints.filter(c => c.status !== 'Closed').length;

    const avgSatisfaction = feedbacks.length > 0 
      ? (feedbacks.reduce((sum, f) => sum + f.satisfactionScore, 0) / feedbacks.length).toFixed(1)
      : '4.8'; // Default high industry standard

    return {
      totalCount,
      completedCount,
      pendingCount,
      readyCount,
      activeWarranties,
      openDefects,
      openComplaints,
      avgSatisfaction
    };
  }, [handovers, warranties, defects, complaints, feedbacks]);

  return (
    <div className="space-y-6" id="handover-after-sales-root">
      
      {/* Top Banner Navigation & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 text-slate-100 p-6 rounded-3xl shadow-xl border border-slate-800">
        <div>
          <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest">Al Kaswa Holdings Ltd</span>
          <h1 className="text-2xl font-bold font-display tracking-tight mt-1">
            {lang === 'en' ? 'Property Handover & After Sales' : 'প্রপার্টি হ্যান্ডওভার ও আফটার সেলস'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {lang === 'en' 
              ? 'Phase 6 – Comprehensive Delivery, Defect Rectification, and Warranty Registry Engine' 
              : 'ফেজ ৬ – সমন্বিত হস্তান্তর, ত্রুটি সংশোধন এবং ওয়ারেন্টি রেজিস্ট্রি ইঞ্জিন'}
          </p>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowAddHandover(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-lg cursor-pointer"
            id="btn-initiate-handover"
          >
            <Plus size={16} />
            {lang === 'en' ? 'Initiate Handover' : 'হ্যান্ডওভার শুরু করুন'}
          </button>
          
          <button
            onClick={() => setShowAddDefect(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 transition-all cursor-pointer"
            id="btn-report-snag"
          >
            <Wrench size={16} />
            {lang === 'en' ? 'Log Defect/Snag' : 'ত্রুটি/স্ন্যাগ রেকর্ড'}
          </button>
        </div>
      </div>

      {/* Dashboard Metrics Widgets */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Widget 1 */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
              {lang === 'en' ? 'Total Handovers' : 'মোট হস্তান্তর'}
            </span>
            <span className="text-3xl font-bold text-slate-900 block mt-1">{stats.totalCount}</span>
            <span className="text-[10px] font-mono text-emerald-600 font-bold mt-1 block">
              ✓ {stats.completedCount} {lang === 'en' ? 'Completed' : 'সম্পন্ন'}
            </span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <CheckSquare size={24} />
          </div>
        </div>

        {/* Widget 2 */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
              {lang === 'en' ? 'Open Snags / Defects' : 'চলমান স্ন্যাগ/ত্রুটি'}
            </span>
            <span className="text-3xl font-bold text-slate-900 block mt-1">{stats.openDefects}</span>
            <span className="text-[10px] font-mono text-amber-600 font-bold mt-1 block">
              ⚠ {defects.filter(d => d.status === 'Work Order').length} {lang === 'en' ? 'Work Orders' : 'ওয়ার্ক অর্ডার'}
            </span>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
            <Wrench size={24} />
          </div>
        </div>

        {/* Widget 3 */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
              {lang === 'en' ? 'Warranty Records' : 'সক্রিয় ওয়ারেন্টি'}
            </span>
            <span className="text-3xl font-bold text-slate-900 block mt-1">{stats.activeWarranties}</span>
            <span className="text-[10px] font-mono text-blue-600 font-bold mt-1 block">
              ★ {lang === 'en' ? 'Structural coverage active' : 'কাঠামোগত কভারেজ সক্রিয়'}
            </span>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
            <ShieldCheck size={24} />
          </div>
        </div>

        {/* Widget 4 */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
              {lang === 'en' ? 'Customer Satisfaction' : 'গ্রাহক সন্তুষ্টি স্কোর'}
            </span>
            <span className="text-3xl font-bold text-slate-900 block mt-1">{stats.avgSatisfaction} / 5</span>
            <span className="text-[10px] font-mono text-purple-600 font-bold mt-1 block">
              ❤ {feedbacks.length} {lang === 'en' ? 'Feedbacks logged' : 'মতামত নথিভুক্ত'}
            </span>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
            <Smile size={24} />
          </div>
        </div>
      </div>

      {/* Main Layout Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-2xl w-fit border border-slate-200/60 flex-wrap gap-1">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'overview' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          {lang === 'en' ? 'Overview Board' : 'ওভারভিউ বোর্ড'}
        </button>
        <button
          onClick={() => setActiveTab('handovers')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'handovers' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          {lang === 'en' ? 'Handover Tracker' : 'হ্যান্ডওভার ট্র্যাকার'}
        </button>
        <button
          onClick={() => setActiveTab('defects')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'defects' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          {lang === 'en' ? 'Snags & Repairs' : 'স্ন্যাগ ও মেরামত'}
        </button>
        <button
          onClick={() => setActiveTab('warranties')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'warranties' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          {lang === 'en' ? 'Warranty Registry' : 'ওয়ারেন্টি রেজিস্ট্রি'}
        </button>
        <button
          onClick={() => setActiveTab('complaints')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'complaints' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          {lang === 'en' ? 'Complaint & Support' : 'অভিযোগ ও টিকিট'}
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'reports' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          {lang === 'en' ? 'Executive Reports' : 'এক্সিকিউটিভ রিপোর্টস'}
        </button>
        <button
          onClick={() => setActiveTab('facility')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'facility' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
          }`}
          id="btn-facility-tab"
        >
          {lang === 'en' ? 'Facility Operations' : 'ফ্যাসিলিটি অপারেশনস'}
        </button>
      </div>

      {/* Tab Contents */}
      <AnimatePresence mode="wait">
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Left: Interactive Workflow Process */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm lg:col-span-2 space-y-6">
              <h2 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
                <Activity size={18} className="text-emerald-500" />
                {lang === 'en' ? 'Property Handover & Delivery Process' : 'প্রপার্টি হস্তান্তর ও সরবরাহ প্রক্রিয়া'}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 relative">
                  <div className="absolute top-3 right-3 text-xs font-mono font-bold bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-full">1</div>
                  <h3 className="font-bold text-sm text-slate-900">{lang === 'en' ? 'Checklist & Clearance' : 'চেকলিস্ট ও ক্লিয়ারেন্স'}</h3>
                  <p className="text-xs text-slate-500 mt-1">Verify payment, registration, mutation, and complete utility clears.</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 relative">
                  <div className="absolute top-3 right-3 text-xs font-mono font-bold bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-full">2</div>
                  <h3 className="font-bold text-sm text-slate-900">{lang === 'en' ? 'Defect Rectification' : 'ত্রুটি সংশোধন'}</h3>
                  <p className="text-xs text-slate-500 mt-1">Inspect units, report structural/paint snags, and issue quick repair orders.</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 relative">
                  <div className="absolute top-3 right-3 text-xs font-mono font-bold bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-full">3</div>
                  <h3 className="font-bold text-sm text-slate-900">{lang === 'en' ? 'Handover & Warranty' : 'হস্তান্তর ও ওয়ারেন্টি'}</h3>
                  <p className="text-xs text-slate-500 mt-1">Sign certificate, deliver keys, and auto-provision warranties in accounts.</p>
                </div>
              </div>

              {/* Outstanding Settlements Panel */}
              <div className="bg-slate-950 text-slate-100 p-5 rounded-2xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-bold text-emerald-400 font-mono tracking-wider">▲ ACCOUNTING AUTOMATION STATUS</span>
                  <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300 font-mono">POSTED JOURNAL VOUCHERS</span>
                </div>
                <p className="text-xs text-slate-300">
                  Completing handovers automatically creates Cost of Sales (COS) recognition and Warranty Provision vouchers, ensuring accurate developer ledger sync.
                </p>
                <div className="flex gap-4 text-xs font-mono bg-slate-900 p-3 rounded border border-slate-800">
                  <div>
                    <span className="text-slate-500 block">Dr Cost of Sales</span>
                    <span className="text-emerald-400 font-bold">৳ Project Expense Account (5300)</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Cr Inventory</span>
                    <span className="text-emerald-400 font-bold">৳ Project Asset Account (1400)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Urgent Tasks & Actions */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
                <ShieldAlert size={18} className="text-amber-500" />
                {lang === 'en' ? 'Critical Action Required' : 'জরুরি পদক্ষেপ প্রয়োজন'}
              </h2>

              <div className="space-y-3">
                {/* Find handovers with un-cleared utilities */}
                {handovers.filter(h => h.status === 'Pending').slice(0, 3).map(hov => {
                  const custObj = customers.find(c => c.id === hov.customerId);
                  const unitObj = units.find(u => u.id === hov.unitId);
                  return (
                    <div key={hov.id} className="p-3 bg-rose-50/50 hover:bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3 transition-colors">
                      <div className="p-1 bg-rose-100 text-rose-600 rounded">
                        <AlertTriangle size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 truncate">{unitObj?.unitNo} - {custObj?.nameEn}</span>
                          <span className="text-[10px] font-mono text-rose-600 bg-rose-100/50 px-1 rounded">Checklist Block</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 truncate">Dues clearance and utility records incomplete.</p>
                      </div>
                    </div>
                  );
                })}
                {handovers.filter(h => h.status === 'Pending').length === 0 && (
                  <div className="p-4 bg-slate-50 rounded-2xl text-center text-xs text-slate-500">
                    No pending handover blocks. All checklist clearances resolved!
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* HANDOVER TRACKER TAB */}
        {activeTab === 'handovers' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Search Filter Bar */}
            <div className="flex bg-white p-4 rounded-3xl border border-slate-100 shadow-sm gap-4 items-center flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder={lang === 'en' ? 'Search handover number, customer, project or unit...' : 'হ্যান্ডওভার নম্বর, গ্রাহক, প্রকল্প বা ইউনিট দিয়ে খুঁজুন...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:border-emerald-500"
                  id="handover-search-input"
                />
              </div>
            </div>

            {/* Handover List and Checklist Drawer Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              
              {/* Handover Register Table */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden xl:col-span-2">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 font-display">
                    {lang === 'en' ? 'Active Handover Register' : 'সক্রিয় হস্তান্তর খাতা'}
                  </h3>
                  <span className="text-xs bg-slate-100 px-2.5 py-1 rounded-full font-mono font-bold text-slate-600">
                    {filteredHandovers.length} {lang === 'en' ? 'Records' : 'রেকর্ডসমূহ'}
                  </span>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
                        <th className="p-4">{lang === 'en' ? 'Ref No' : 'রেফারেন্স নং'}</th>
                        <th className="p-4">{lang === 'en' ? 'Customer' : 'গ্রাহক'}</th>
                        <th className="p-4">{lang === 'en' ? 'Unit Detail' : 'ইউনিট বিবরণ'}</th>
                        <th className="p-4">{lang === 'en' ? 'Handover Date' : 'হ্যান্ডওভার তারিখ'}</th>
                        <th className="p-4">{lang === 'en' ? 'Status' : 'অবস্থা'}</th>
                        <th className="p-4 text-right">{lang === 'en' ? 'Action' : 'পদক্ষেপ'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredHandovers.map(hov => {
                        const custObj = customers.find(c => c.id === hov.customerId);
                        const projObj = projects.find(p => p.id === hov.projectId);
                        const unitObj = units.find(u => u.id === hov.unitId);
                        const settlement = getSettlementDetails(hov);
                        const isSelected = selectedHandover?.id === hov.id;

                        return (
                          <tr 
                            key={hov.id}
                            className={`hover:bg-slate-50/50 cursor-pointer transition-colors ${isSelected ? 'bg-emerald-50/20 font-medium' : ''}`}
                            onClick={() => setSelectedHandover(hov)}
                          >
                            <td className="p-4 font-mono font-bold text-slate-900">
                              {hov.handoverNo}
                            </td>
                            <td className="p-4">
                              <div className="font-bold text-slate-900">{lang === 'en' ? custObj?.nameEn : custObj?.nameBn}</div>
                              <div className="text-slate-400 font-mono text-[10px]">{custObj?.phone}</div>
                            </td>
                            <td className="p-4">
                              <div className="text-slate-800 font-semibold">{projObj?.nameEn}</div>
                              <div className="text-slate-500 font-mono">Unit {unitObj?.unitNo} ({unitObj?.sizeSft} Sft)</div>
                            </td>
                            <td className="p-4 font-mono">
                              {formatDate(hov.handoverDate)}
                            </td>
                            <td className="p-4">
                              <span className={`px-2 py-1 rounded-full font-mono text-[10px] font-bold uppercase ${
                                hov.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                                hov.status === 'Ready' ? 'bg-blue-100 text-blue-800' :
                                'bg-amber-100 text-amber-800'
                              }`}>
                                {hov.status}
                              </span>
                            </td>
                            <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                              <div className="flex justify-end gap-1.5">
                                {hov.status === 'Pending' && (
                                  <button
                                    onClick={() => handleMarkReady(hov)}
                                    className="px-2.5 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 text-[10px] font-bold border border-blue-200 transition-colors"
                                    title="Verify & Mark Ready"
                                  >
                                    Verify Clearance
                                  </button>
                                )}
                                {hov.status === 'Ready' && (
                                  <button
                                    onClick={() => handleCompleteHandover(hov)}
                                    className="px-2.5 py-1 rounded bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-[10px] font-bold transition-colors shadow-sm"
                                    title="Complete Handover"
                                  >
                                    Complete
                                  </button>
                                )}
                                <button
                                  onClick={() => generateDocument(hov, 'handover')}
                                  className="p-1 rounded hover:bg-slate-100 text-slate-500"
                                  title="Print Handover Certificate"
                                >
                                  <Printer size={15} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {filteredHandovers.length === 0 && (
                        <tr>
                          <td colSpan={6} className="text-center p-8 text-slate-400">
                            {lang === 'en' ? 'No handovers found matching search criteria.' : 'অনুসন্ধানের মানদণ্ডের সাথে মিলে যাওয়া কোন হস্তান্তর পাওয়া যায়নি।'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Handover Side Clearance Checklist Panel */}
              <div className="space-y-6">
                
                {selectedHandover ? (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6"
                  >
                    <div>
                      <span className="text-[10px] font-bold text-emerald-500 font-mono tracking-widest block">SELECTED HANDOVER DOSSIER</span>
                      <h3 className="text-base font-bold text-slate-900 font-display mt-0.5">
                        {selectedHandover.handoverNo}
                      </h3>
                      <p className="text-xs text-slate-500">
                        Check clearance parameters below to advance status.
                      </p>
                    </div>

                    {/* Pre-Handover Checklist Toggle Switches */}
                    <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                        <ClipboardList size={14} className="text-emerald-500" />
                        {lang === 'en' ? 'Pre-Handover Checklist' : 'প্রি-হ্যান্ডওভার চেকলিস্ট'}
                      </h4>
                      
                      {(() => {
                        const chk = checklists.find(c => c.handoverId === selectedHandover.id);
                        if (!chk) return <p className="text-xs text-slate-400">No checklist initialized.</p>;

                        return (
                          <div className="space-y-2 text-xs">
                            <label className="flex items-center justify-between p-2 hover:bg-white rounded border border-transparent hover:border-slate-150 transition-all cursor-pointer">
                              <span>1. Full Payment Completed</span>
                              <input
                                type="checkbox"
                                checked={chk.fullPaymentCompleted}
                                onChange={() => handleToggleChecklist(selectedHandover.id, 'fullPaymentCompleted')}
                                className="rounded text-emerald-500 focus:ring-emerald-500"
                                disabled={selectedHandover.status === 'Completed'}
                              />
                            </label>
                            
                            <label className="flex items-center justify-between p-2 hover:bg-white rounded border border-transparent hover:border-slate-150 transition-all cursor-pointer">
                              <span>2. Utility Bills Cleared</span>
                              <input
                                type="checkbox"
                                checked={chk.utilityBillsCleared}
                                onChange={() => handleToggleChecklist(selectedHandover.id, 'utilityBillsCleared')}
                                className="rounded text-emerald-500 focus:ring-emerald-500"
                                disabled={selectedHandover.status === 'Completed'}
                              />
                            </label>

                            <label className="flex items-center justify-between p-2 hover:bg-white rounded border border-transparent hover:border-slate-150 transition-all cursor-pointer">
                              <span>3. Registration Completed</span>
                              <input
                                type="checkbox"
                                checked={chk.registrationCompleted}
                                onChange={() => handleToggleChecklist(selectedHandover.id, 'registrationCompleted')}
                                className="rounded text-emerald-500 focus:ring-emerald-500"
                                disabled={selectedHandover.status === 'Completed'}
                              />
                            </label>

                            <label className="flex items-center justify-between p-2 hover:bg-white rounded border border-transparent hover:border-slate-150 transition-all cursor-pointer">
                              <span>4. Mutation Completed</span>
                              <input
                                type="checkbox"
                                checked={chk.mutationCompleted}
                                onChange={() => handleToggleChecklist(selectedHandover.id, 'mutationCompleted')}
                                className="rounded text-emerald-500 focus:ring-emerald-500"
                                disabled={selectedHandover.status === 'Completed'}
                              />
                            </label>

                            <label className="flex items-center justify-between p-2 hover:bg-white rounded border border-transparent hover:border-slate-150 transition-all cursor-pointer">
                              <span>5. Keys Prepared & Ready</span>
                              <input
                                type="checkbox"
                                checked={chk.keysReady}
                                onChange={() => handleToggleChecklist(selectedHandover.id, 'keysReady')}
                                className="rounded text-emerald-500 focus:ring-emerald-500"
                                disabled={selectedHandover.status === 'Completed'}
                              />
                            </label>

                            <label className="flex items-center justify-between p-2 hover:bg-white rounded border border-transparent hover:border-slate-150 transition-all cursor-pointer">
                              <span>6. Final Documents Ready</span>
                              <input
                                type="checkbox"
                                checked={chk.documentsReady}
                                onChange={() => handleToggleChecklist(selectedHandover.id, 'documentsReady')}
                                className="rounded text-emerald-500 focus:ring-emerald-500"
                                disabled={selectedHandover.status === 'Completed'}
                              />
                            </label>
                          </div>
                        );
                      })()}
                    </div>

                    {/* FLAT OR PLOT SPECIFIC INSPECTION CHECKLIST (Phase 21 Real Estate Developer Precision) */}
                    <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                        <CheckSquare size={14} className="text-indigo-500" />
                        {(selectedHandover as any).unitType === 'Plot' 
                          ? (lang === 'en' ? 'Plot Delivery Inspections' : 'প্লট সীমানা ও ভরাট চেকলিস্ট')
                          : (lang === 'en' ? 'Flat Delivery Inspections' : 'ফ্ল্যাট সিভিল ও ফিটিং চেকলিস্ট')
                        }
                      </h4>

                      {(selectedHandover as any).unitType === 'Plot' ? (
                        // Plot Specific Inspection Checklist
                        <div className="space-y-2 text-xs">
                          {(() => {
                            const plotChk = getPlotChecklist(selectedHandover.id);
                            return (
                              <>
                                <label className="flex items-center justify-between p-2 hover:bg-white rounded border border-transparent hover:border-slate-150 transition-all cursor-pointer">
                                  <span>Boundary Alignment Pins Installed</span>
                                  <input
                                    type="checkbox"
                                    checked={plotChk.boundaryPins}
                                    onChange={() => togglePlotChecklist(selectedHandover.id, 'boundaryPins')}
                                    className="rounded text-indigo-500 focus:ring-indigo-500"
                                    disabled={selectedHandover.status === 'Completed'}
                                  />
                                </label>
                                <label className="flex items-center justify-between p-2 hover:bg-white rounded border border-transparent hover:border-slate-150 transition-all cursor-pointer">
                                  <span>Soil Leveling & Earthwork Finished</span>
                                  <input
                                    type="checkbox"
                                    checked={plotChk.soilLeveling}
                                    onChange={() => togglePlotChecklist(selectedHandover.id, 'soilLeveling')}
                                    className="rounded text-indigo-500 focus:ring-indigo-500"
                                    disabled={selectedHandover.status === 'Completed'}
                                  />
                                </label>
                                <label className="flex items-center justify-between p-2 hover:bg-white rounded border border-transparent hover:border-slate-150 transition-all cursor-pointer">
                                  <span>Storm & Sewage Outlets Ready</span>
                                  <input
                                    type="checkbox"
                                    checked={plotChk.sewageOutlet}
                                    onChange={() => togglePlotChecklist(selectedHandover.id, 'sewageOutlet')}
                                    className="rounded text-indigo-500 focus:ring-indigo-500"
                                    disabled={selectedHandover.status === 'Completed'}
                                  />
                                </label>
                                <label className="flex items-center justify-between p-2 hover:bg-white rounded border border-transparent hover:border-slate-150 transition-all cursor-pointer">
                                  <span>Road Infrastructure Access Verified</span>
                                  <input
                                    type="checkbox"
                                    checked={plotChk.roadAccess}
                                    onChange={() => togglePlotChecklist(selectedHandover.id, 'roadAccess')}
                                    className="rounded text-indigo-500 focus:ring-indigo-500"
                                    disabled={selectedHandover.status === 'Completed'}
                                  />
                                </label>
                              </>
                            );
                          })()}
                        </div>
                      ) : (
                        // Flat Specific Inspection Checklist
                        <div className="space-y-2 text-xs">
                          {(() => {
                            const flatChk = getFlatChecklist(selectedHandover.id);
                            return (
                              <>
                                <label className="flex items-center justify-between p-2 hover:bg-white rounded border border-transparent hover:border-slate-150 transition-all cursor-pointer">
                                  <span>Electrical Sockets & Load Testing</span>
                                  <input
                                    type="checkbox"
                                    checked={flatChk.electricalSockets}
                                    onChange={() => toggleFlatChecklist(selectedHandover.id, 'electricalSockets')}
                                    className="rounded text-indigo-500 focus:ring-indigo-500"
                                    disabled={selectedHandover.status === 'Completed'}
                                  />
                                </label>
                                <label className="flex items-center justify-between p-2 hover:bg-white rounded border border-transparent hover:border-slate-150 transition-all cursor-pointer">
                                  <span>Civil Wall Finishing & Paint Job</span>
                                  <input
                                    type="checkbox"
                                    checked={flatChk.civilFinishing}
                                    onChange={() => toggleFlatChecklist(selectedHandover.id, 'civilFinishing')}
                                    className="rounded text-indigo-500 focus:ring-indigo-500"
                                    disabled={selectedHandover.status === 'Completed'}
                                  />
                                </label>
                                <label className="flex items-center justify-between p-2 hover:bg-white rounded border border-transparent hover:border-slate-150 transition-all cursor-pointer">
                                  <span>Plumbing & Bathroom Fittings Tested</span>
                                  <input
                                    type="checkbox"
                                    checked={flatChk.plumbingFixtures}
                                    onChange={() => toggleFlatChecklist(selectedHandover.id, 'plumbingFixtures')}
                                    className="rounded text-indigo-500 focus:ring-indigo-500"
                                    disabled={selectedHandover.status === 'Completed'}
                                  />
                                </label>
                                <label className="flex items-center justify-between p-2 hover:bg-white rounded border border-transparent hover:border-slate-150 transition-all cursor-pointer">
                                  <span>Tiles & Margin Alignment Inspected</span>
                                  <input
                                    type="checkbox"
                                    checked={flatChk.tilingAlignment}
                                    onChange={() => toggleFlatChecklist(selectedHandover.id, 'tilingAlignment')}
                                    className="rounded text-indigo-500 focus:ring-indigo-500"
                                    disabled={selectedHandover.status === 'Completed'}
                                  />
                                </label>
                                <label className="flex items-center justify-between p-2 hover:bg-white rounded border border-transparent hover:border-slate-150 transition-all cursor-pointer">
                                  <span>Doors & Aluminium Slide Windows Tested</span>
                                  <input
                                    type="checkbox"
                                    checked={flatChk.doorsWindows}
                                    onChange={() => toggleFlatChecklist(selectedHandover.id, 'doorsWindows')}
                                    className="rounded text-indigo-500 focus:ring-indigo-500"
                                    disabled={selectedHandover.status === 'Completed'}
                                  />
                                </label>
                              </>
                            );
                          })()}
                        </div>
                      )}
                    </div>

                    {/* KEY DELIVERY REGISTER & LOGS (Phase 21 Custody Handover) */}
                    <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                        <Key size={14} className="text-amber-500" />
                        {lang === 'en' ? 'Custody Key Delivery Register' : 'চাবি হস্তান্তর রেজিস্টার'}
                      </h4>
                      {(() => {
                        const keyReg = getKeyRegister(selectedHandover.id);
                        return (
                          <div className="space-y-3 text-xs">
                            <div className="grid grid-cols-2 gap-2">
                              <label className="flex items-center gap-2 p-1.5 bg-white rounded border border-slate-100 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={keyReg.mainKey}
                                  onChange={() => updateKeyRegister(selectedHandover.id, { mainKey: !keyReg.mainKey })}
                                  className="rounded text-amber-500 focus:ring-amber-500"
                                  disabled={selectedHandover.status === 'Completed'}
                                />
                                <span>Main Entrance Key</span>
                              </label>
                              <label className="flex items-center gap-2 p-1.5 bg-white rounded border border-slate-100 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={keyReg.roomKeys}
                                  onChange={() => updateKeyRegister(selectedHandover.id, { roomKeys: !keyReg.roomKeys })}
                                  className="rounded text-amber-500 focus:ring-amber-500"
                                  disabled={selectedHandover.status === 'Completed'}
                                />
                                <span>All Bedroom Keys</span>
                              </label>
                              <label className="flex items-center gap-2 p-1.5 bg-white rounded border border-slate-100 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={keyReg.balconyKeys}
                                  onChange={() => updateKeyRegister(selectedHandover.id, { balconyKeys: !keyReg.balconyKeys })}
                                  className="rounded text-amber-500 focus:ring-amber-500"
                                  disabled={selectedHandover.status === 'Completed'}
                                />
                                <span>Balcony Door Keys</span>
                              </label>
                              <label className="flex items-center gap-2 p-1.5 bg-white rounded border border-slate-100 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={keyReg.kitchenKeys}
                                  onChange={() => updateKeyRegister(selectedHandover.id, { kitchenKeys: !keyReg.kitchenKeys })}
                                  className="rounded text-amber-500 focus:ring-amber-500"
                                  disabled={selectedHandover.status === 'Completed'}
                                />
                                <span>Kitchen & Utility Key</span>
                              </label>
                            </div>

                            <div className="space-y-2">
                              <div>
                                <label className="font-semibold text-slate-700 block mb-1">Total Set Keys Transferred Count</label>
                                <input
                                  type="number"
                                  value={keyReg.keysCount || ''}
                                  onChange={(e) => updateKeyRegister(selectedHandover.id, { keysCount: parseInt(e.target.value) || 0 })}
                                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                                  placeholder="e.g. 8"
                                  disabled={selectedHandover.status === 'Completed'}
                                />
                              </div>
                              <div>
                                <label className="font-semibold text-slate-700 block mb-1">Key Receiver Name (Authorized Person) *</label>
                                <input
                                  type="text"
                                  value={keyReg.receiverName || ''}
                                  onChange={(e) => updateKeyRegister(selectedHandover.id, { receiverName: e.target.value })}
                                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                                  placeholder="e.g. Owner / Brother"
                                  disabled={selectedHandover.status === 'Completed'}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Utility Clearance Verification details */}
                    <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                        <Activity size={14} className="text-blue-500" />
                        {lang === 'en' ? 'Utility Clearance Details' : 'ইউটিলিটি ক্লিয়ারেন্স বিবরণ'}
                      </h4>

                      {(() => {
                        const ut = utilities.find(u => u.handoverId === selectedHandover.id);
                        if (!ut) return <p className="text-xs text-slate-400">No records.</p>;

                        return (
                          <div className="space-y-2 text-xs">
                            <label className="flex items-center justify-between p-2 bg-white rounded border border-slate-100">
                              <span>Electricity Meter Assigned & Cleared</span>
                              <input
                                type="checkbox"
                                checked={ut.electricityCleared}
                                onChange={() => handleToggleUtility(selectedHandover.id, 'electricityCleared')}
                                disabled={selectedHandover.status === 'Completed'}
                              />
                            </label>
                            
                            <label className="flex items-center justify-between p-2 bg-white rounded border border-slate-100">
                              <span>Gas Connection Cleared</span>
                              <input
                                type="checkbox"
                                checked={ut.gasCleared}
                                onChange={() => handleToggleUtility(selectedHandover.id, 'gasCleared')}
                                disabled={selectedHandover.status === 'Completed'}
                              />
                            </label>

                            <label className="flex items-center justify-between p-2 bg-white rounded border border-slate-100">
                              <span>Water Connection Cleared</span>
                              <input
                                type="checkbox"
                                checked={ut.waterCleared}
                                onChange={() => handleToggleUtility(selectedHandover.id, 'waterCleared')}
                                disabled={selectedHandover.status === 'Completed'}
                              />
                            </label>

                            <label className="flex items-center justify-between p-2 bg-white rounded border border-slate-100">
                              <span>Service Charges Settled</span>
                              <input
                                type="checkbox"
                                checked={ut.serviceChargeCleared}
                                onChange={() => handleToggleUtility(selectedHandover.id, 'serviceChargeCleared')}
                                disabled={selectedHandover.status === 'Completed'}
                              />
                            </label>

                            <label className="flex items-center justify-between p-2 bg-white rounded border border-slate-100">
                              <span>Maintenance Fees Cleared</span>
                              <input
                                type="checkbox"
                                checked={ut.maintenanceFeesCleared}
                                onChange={() => handleToggleUtility(selectedHandover.id, 'maintenanceFeesCleared')}
                                disabled={selectedHandover.status === 'Completed'}
                              />
                            </label>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Final Settlement Summary */}
                    <div className="bg-slate-900 text-slate-100 p-4 rounded-2xl space-y-2 text-xs">
                      <span className="text-[10px] text-emerald-400 font-mono tracking-wider block">FINAL FINANCIAL SETTLEMENT</span>
                      {(() => {
                        const setObj = getSettlementDetails(selectedHandover);
                        return (
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span className="text-slate-400">Total Purchase Value:</span>
                              <span className="font-bold">{formatCurrency(setObj.totalDue || 0, lang)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Total Cleared Ledger:</span>
                              <span className="font-bold text-emerald-400">{formatCurrency(setObj.paid || 0, lang)}</span>
                            </div>
                            <div className="flex justify-between border-t border-slate-800 pt-1.5 font-bold">
                              <span>Outstanding Balance:</span>
                              <span className={setObj.outstanding > 0 ? 'text-amber-400' : 'text-emerald-400'}>
                                {setObj.outstanding > 0 ? formatCurrency(setObj.outstanding, lang) : '৳0.00 (Cleared)'}
                              </span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Printable Document Suite Links */}
                    <div className="space-y-2">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">GENERATE / PRINT DOCUMENTS</span>
                      <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                        <button
                          onClick={() => generateDocument(selectedHandover, 'handover')}
                          className="p-2 border border-slate-200 hover:border-emerald-500 rounded-xl flex items-center gap-2 hover:bg-slate-50 transition-all text-slate-700"
                        >
                          <FileText size={14} className="text-emerald-500" />
                          Handover Cert
                        </button>
                        <button
                          onClick={() => generateDocument(selectedHandover, 'possession')}
                          className="p-2 border border-slate-200 hover:border-emerald-500 rounded-xl flex items-center gap-2 hover:bg-slate-50 transition-all text-slate-700"
                        >
                          <FileText size={14} className="text-emerald-500" />
                          Possession Letter
                        </button>
                        <button
                          onClick={() => generateDocument(selectedHandover, 'settlement')}
                          className="p-2 border border-slate-200 hover:border-emerald-500 rounded-xl flex items-center gap-2 hover:bg-slate-50 transition-all text-slate-700"
                        >
                          <FileText size={14} className="text-emerald-500" />
                          Final Settlement
                        </button>
                        <button
                          onClick={() => generateDocument(selectedHandover, 'warranty')}
                          className="p-2 border border-slate-200 hover:border-emerald-500 rounded-xl flex items-center gap-2 hover:bg-slate-50 transition-all text-slate-700"
                        >
                          <FileText size={14} className="text-emerald-500" />
                          Warranty Cert
                        </button>
                      </div>
                      
                      {selectedHandover.status === 'Completed' && (
                        <button
                          onClick={() => {
                            setFeedHovId(selectedHandover.id);
                            setShowFeedbackModal(true);
                          }}
                          className="w-full mt-2 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border border-purple-200 transition-all"
                        >
                          <Smile size={14} />
                          Log Customer Satisfaction (CSAT)
                        </button>
                      )}
                    </div>

                  </motion.div>
                ) : (
                  <div className="bg-slate-50 border border-dashed border-slate-200 p-8 rounded-3xl text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2 h-72">
                    <Layers size={32} />
                    Select a handover record to view and configure checklist compliance.
                  </div>
                )}

              </div>

            </div>
          </motion.div>
        )}

        {/* SNAGS & REPAIRS TAB */}
        {activeTab === 'defects' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex-wrap gap-4">
              <h3 className="font-bold text-slate-900 font-display">
                {lang === 'en' ? 'Snag / Defect Management Registry' : 'ত্রুটি ও স্ন্যাগ রেজিস্ট্রি খাতা'}
              </h3>
              <button
                onClick={() => setShowAddDefect(true)}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900 text-slate-100 text-xs font-bold hover:bg-slate-800 transition-all cursor-pointer"
              >
                <Plus size={14} />
                Add Snag Report
              </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              
              {/* Defect List */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden xl:col-span-2">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
                        <th className="p-4">{lang === 'en' ? 'Snag ID' : 'স্ন্যাগ আইডি'}</th>
                        <th className="p-4">{lang === 'en' ? 'Unit' : 'ইউনিট'}</th>
                        <th className="p-4">{lang === 'en' ? 'Category' : 'ক্যাটাগরি'}</th>
                        <th className="p-4">{lang === 'en' ? 'Report Date' : 'রিপোর্ট তারিখ'}</th>
                        <th className="p-4">{lang === 'en' ? 'Engineer' : 'ইঞ্জিনিয়ার'}</th>
                        <th className="p-4">{lang === 'en' ? 'Status Workflow' : 'অবস্থা ওয়ার্কফ্লো'}</th>
                        <th className="p-4 text-right">{lang === 'en' ? 'Action' : 'পদক্ষেপ'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {defects.map(df => {
                        const unitObj = units.find(u => u.id === df.unitId);
                        const isSelected = selectedDefect?.id === df.id;
                        
                        return (
                          <tr 
                            key={df.id} 
                            className={`hover:bg-slate-50/50 cursor-pointer transition-all ${isSelected ? 'bg-amber-50/10' : ''}`}
                            onClick={() => setSelectedDefect(df)}
                          >
                            <td className="p-4 font-mono font-bold text-slate-900">{df.defectNo}</td>
                            <td className="p-4 font-mono font-bold">Unit {unitObj?.unitNo || df.unitId}</td>
                            <td className="p-4">
                              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px]">
                                {df.category}
                              </span>
                            </td>
                            <td className="p-4 font-mono">{formatDate(df.reportDate)}</td>
                            <td className="p-4 text-slate-600">{df.assignedEngineer}</td>
                            <td className="p-4">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                                df.status === 'Closed' ? 'bg-emerald-100 text-emerald-800' :
                                df.status === 'Verified' ? 'bg-blue-100 text-blue-800' :
                                df.status === 'Repair Complete' ? 'bg-purple-100 text-purple-800' :
                                df.status === 'Work Order' ? 'bg-orange-100 text-orange-800' :
                                'bg-rose-100 text-rose-800'
                              }`}>
                                {df.status}
                              </span>
                            </td>
                            <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                              {df.status !== 'Closed' ? (
                                <button
                                  onClick={() => handleAdvanceDefect(df)}
                                  className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[10px]"
                                >
                                  Advance Status
                                </button>
                              ) : (
                                <span className="text-[10px] font-mono text-emerald-600 font-bold">✓ Resolved</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                      {defects.length === 0 && (
                        <tr>
                          <td colSpan={7} className="text-center p-8 text-slate-400">
                            No defects reported yet. Pristine structures verified!
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Defect workflow visualizer */}
              <div>
                {selectedDefect ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4"
                  >
                    <div>
                      <span className="text-[10px] font-bold text-amber-500 font-mono tracking-widest block">DEFECT LIFECYCLE ENGINE</span>
                      <h4 className="text-sm font-bold text-slate-900 mt-1">Snag: {selectedDefect.defectNo}</h4>
                      <p className="text-xs text-slate-500">{selectedDefect.description}</p>
                    </div>

                    <div className="border-t border-slate-100 pt-4 space-y-3">
                      <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Interactive Workflow Path</h5>
                      
                      {/* Flow steps visualizer */}
                      <div className="space-y-4 relative pl-4 border-l border-slate-200">
                        {['Reported', 'Inspected', 'Work Order', 'Repair Complete', 'Verified', 'Closed'].map((step, idx) => {
                          const isCurrent = selectedDefect.status === step;
                          const isPassed = ['Reported', 'Inspected', 'Work Order', 'Repair Complete', 'Verified', 'Closed'].indexOf(selectedDefect.status) >= idx;

                          return (
                            <div key={step} className="relative">
                              <span className={`absolute -left-[21px] top-0.5 w-2.5 h-2.5 rounded-full border border-white ${
                                isCurrent ? 'bg-amber-500 ring-4 ring-amber-100' :
                                isPassed ? 'bg-emerald-500' : 'bg-slate-200'
                              }`} />
                              <div className="flex justify-between items-center">
                                <span className={`text-xs font-semibold ${isCurrent ? 'text-slate-900 font-bold' : isPassed ? 'text-slate-700' : 'text-slate-400'}`}>
                                  {step}
                                </span>
                                {isCurrent && (
                                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-amber-500 bg-amber-50 px-1 rounded">Active</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Corresponding Service Ticket detail */}
                      {(() => {
                        const tck = tickets.find(t => t.defectId === selectedDefect.id);
                        if (!tck) return null;
                        return (
                          <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                            <div className="flex justify-between font-mono font-bold text-slate-700">
                              <span>Service Ticket: {tck.ticketNo}</span>
                              <span className="uppercase text-slate-500">{tck.status}</span>
                            </div>
                            <div className="mt-1 text-slate-500">Assigned: {tck.assignedStaff}</div>
                            <div className="text-slate-500">Target Due: {formatDate(tck.dueDate)}</div>
                          </div>
                        );
                      })()}

                    </div>
                  </motion.div>
                ) : (
                  <div className="bg-slate-50 border border-dashed border-slate-200 p-8 rounded-3xl text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2 h-72">
                    <Wrench size={32} />
                    Select a reported defect snag to view real-time repair work order steps.
                  </div>
                )}
              </div>

            </div>
          </motion.div>
        )}

        {/* WARRANTY REGISTRY TAB */}
        {activeTab === 'warranties' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 font-display">
                  {lang === 'en' ? 'Property & Appliance Warranty Registry' : 'সম্পত্তি ও সরঞ্জামাদি ওয়ারেন্টি খাত'}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Active structural warranties, damp proof checks, lifts, and generator coverage parameters.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {warranties.map(rec => {
                const unitObj = units.find(u => u.id === rec.unitId);
                const projObj = unitObj ? projects.find(p => p.id === unitObj.projectId) : null;
                const isExpired = new Date(rec.expiryDate) < new Date();

                return (
                  <div key={rec.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4 relative overflow-hidden">
                    {/* Badge */}
                    <div className="absolute top-4 right-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase ${
                        isExpired ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {isExpired ? 'Expired' : 'Active Coverage'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl">
                        <ShieldCheck size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-slate-900">{rec.warrantyType}</h4>
                        <span className="text-[10px] font-semibold text-slate-500">{projObj?.nameEn} | Unit {unitObj?.unitNo}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs font-mono border-t border-slate-50 pt-3">
                      <div>
                        <span className="text-[10px] text-slate-400 block">START DATE</span>
                        <span className="font-bold text-slate-700">{formatDate(rec.startDate)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">EXPIRY DATE</span>
                        <span className="font-bold text-slate-700">{formatDate(rec.expiryDate)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
              {warranties.length === 0 && (
                <div className="col-span-full text-center p-8 text-slate-400 text-xs">
                  No warranties registered yet. Ready/Completed handovers auto-generate default warranties.
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* CUSTOMER COMPLAINT & SERVICE TICKETS */}
        {activeTab === 'complaints' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex-wrap gap-4">
              <h3 className="font-bold text-slate-900 font-display">
                {lang === 'en' ? 'After-Sales Customer Complaint Center' : 'আফটার-সেলস গ্রাহক অভিযোগ কেন্দ্র'}
              </h3>
              <button
                onClick={() => setShowAddComplaint(true)}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900 text-slate-100 text-xs font-bold hover:bg-slate-800 transition-all cursor-pointer"
              >
                <Plus size={14} />
                Log Customer Complaint
              </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              
              {/* Complaints List Table */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden xl:col-span-2">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
                        <th className="p-4">{lang === 'en' ? 'Ref No' : 'অভিযোগ নং'}</th>
                        <th className="p-4">{lang === 'en' ? 'Customer & Unit' : 'গ্রাহক ও ইউনিট'}</th>
                        <th className="p-4">{lang === 'en' ? 'Priority' : 'অগ্রাধিকার'}</th>
                        <th className="p-4">{lang === 'en' ? 'Complaint Date' : 'অভিযোগের তারিখ'}</th>
                        <th className="p-4">{lang === 'en' ? 'Status' : 'অবস্থা'}</th>
                        <th className="p-4 text-right">{lang === 'en' ? 'Action' : 'পদক্ষেপ'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {complaints.map(cmp => {
                        const custObj = customers.find(c => c.id === cmp.customerId);
                        const unitObj = units.find(u => u.id === cmp.unitId);
                        const isSelected = selectedComplaint?.id === cmp.id;

                        return (
                          <tr 
                            key={cmp.id} 
                            className={`hover:bg-slate-50/50 cursor-pointer transition-colors ${isSelected ? 'bg-slate-50' : ''}`}
                            onClick={() => setSelectedComplaint(cmp)}
                          >
                            <td className="p-4 font-mono font-bold text-slate-900">{cmp.complaintNo}</td>
                            <td className="p-4">
                              <div className="font-bold text-slate-900">{lang === 'en' ? custObj?.nameEn : custObj?.nameBn}</div>
                              <div className="text-slate-500 font-mono text-[10px]">Unit {unitObj?.unitNo || cmp.unitId}</div>
                            </td>
                            <td className="p-4">
                              <span className={`px-2 py-0.5 rounded font-bold text-[9px] ${
                                cmp.priority === 'Critical' ? 'bg-red-100 text-red-800' :
                                cmp.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                                cmp.priority === 'Medium' ? 'bg-blue-100 text-blue-800' :
                                'bg-slate-100 text-slate-800'
                              }`}>
                                {cmp.priority}
                              </span>
                            </td>
                            <td className="p-4 font-mono">{formatDate(cmp.complaintDate)}</td>
                            <td className="p-4">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                                cmp.status === 'Closed' ? 'bg-emerald-100 text-emerald-800' :
                                cmp.status === 'Resolved' ? 'bg-blue-100 text-blue-800' :
                                cmp.status === 'Investigating' ? 'bg-purple-100 text-purple-800' :
                                'bg-amber-100 text-amber-800'
                              }`}>
                                {cmp.status}
                              </span>
                            </td>
                            <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                              <div className="flex gap-1 justify-end">
                                {cmp.status === 'Pending' && (
                                  <button
                                    onClick={() => handleResolveComplaint(cmp)}
                                    className="px-2 py-1 rounded bg-blue-50 text-blue-700 text-[10px] font-bold hover:bg-blue-100"
                                  >
                                    Resolve
                                  </button>
                                )}
                                {cmp.status === 'Resolved' && (
                                  <button
                                    onClick={() => {
                                      setFeedHovId(cmp.id);
                                      setShowFeedbackModal(true);
                                    }}
                                    className="px-2 py-1 rounded bg-emerald-500 text-slate-950 text-[10px] font-bold hover:bg-emerald-600"
                                  >
                                    Close Case
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {complaints.length === 0 && (
                        <tr>
                          <td colSpan={6} className="text-center p-8 text-slate-400">
                            No complaints logged. Excellent client satisfaction levels maintained!
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Service Ticket Details Panel */}
              <div>
                {selectedComplaint ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4"
                  >
                    <div>
                      <span className="text-[10px] font-bold text-emerald-500 font-mono tracking-widest block">COMPLAINT CENTER DETAIL</span>
                      <h4 className="font-bold text-slate-900 mt-1">Ref: {selectedComplaint.complaintNo}</h4>
                      <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 mt-2 italic">
                        "{selectedComplaint.details}"
                      </p>
                    </div>

                    {/* Assigned Ticket detail */}
                    {(() => {
                      const tck = tickets.find(t => t.complaintId === selectedComplaint.id);
                      if (!tck) return null;
                      return (
                        <div className="space-y-3 border-t border-slate-100 pt-4">
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">SERVICE TICKET LIFECYCLE</span>
                          <div className="bg-slate-950 text-slate-200 p-4 rounded-2xl space-y-2 text-xs">
                            <div className="flex justify-between font-mono font-bold text-emerald-400">
                              <span>TICKET: {tck.ticketNo}</span>
                              <span className="uppercase text-slate-400">{tck.status}</span>
                            </div>
                            <div className="text-slate-300">Staff Assigned: <span className="font-bold text-white">{tck.assignedStaff}</span></div>
                            <div className="text-slate-400">Resolution Due: {formatDate(tck.dueDate)}</div>
                            {tck.customerFeedback && (
                              <div className="mt-2 text-[11px] text-purple-400 bg-purple-950/40 p-2 rounded border border-purple-900/40">
                                <strong>Feedback Rate:</strong> {tck.customerFeedback}
                              </div>
                            )}

                            {/* ESCALATION MATRIX (Phase 21 CRM Stabilization) */}
                            {(() => {
                              const esc = ticketEscalations[tck.id];
                              return (
                                <div className="space-y-3 pt-3 border-t border-slate-800">
                                  <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-400 uppercase font-bold tracking-wider">ESCALATION STANDING</span>
                                    {esc ? (
                                      <span className={`px-2 py-0.5 rounded-full font-bold ${
                                        esc.level === 'L3' ? 'bg-rose-500 text-white animate-pulse' :
                                        esc.level === 'L2' ? 'bg-amber-500 text-slate-950' :
                                        'bg-blue-500 text-white'
                                      }`}>
                                        {esc.level === 'L3' ? 'CRITICAL - ESCALATED TO MD' :
                                         esc.level === 'L2' ? 'HIGH - ESCALATED TO TEAM LEAD' :
                                         'MEDIUM - ASSIGNED TO SITE'}
                                      </span>
                                    ) : (
                                      <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-bold uppercase">
                                        LEVEL 1: STANDARD
                                      </span>
                                    )}
                                  </div>

                                  {esc && (
                                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-[11px] space-y-1">
                                      <div className="text-slate-400 font-semibold italic">"{esc.note}"</div>
                                      <div className="text-[10px] text-slate-500 font-mono text-right">Escalated: {esc.date}</div>
                                    </div>
                                  )}

                                  {tck.status !== 'Closed' && tck.status !== 'Resolved' && (
                                    <div className="space-y-2 bg-slate-900 p-3 rounded-xl border border-slate-800 mt-2">
                                      <span className="text-[9px] text-slate-400 font-bold block uppercase">TRIGGER CUSTOMER ESCALATION</span>
                                      <textarea
                                        value={escalationNoteInput}
                                        onChange={(e) => setEscalationNoteInput(e.target.value)}
                                        placeholder="Reason for escalation (e.g. overdue parts, critical leak)..."
                                        className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-[11px] text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 resize-none h-14"
                                      />
                                      <div className="flex gap-2">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            if (!escalationNoteInput.trim()) {
                                              alert('Please specify the escalation notes.');
                                              return;
                                            }
                                            setTicketEscalations({
                                              ...ticketEscalations,
                                              [tck.id]: {
                                                level: 'L2',
                                                note: escalationNoteInput,
                                                date: new Date().toLocaleDateString()
                                              }
                                            });
                                            setEscalationNoteInput('');
                                          }}
                                          className="flex-1 py-1 px-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[10px] rounded transition-all cursor-pointer text-center"
                                        >
                                          Escalate to L2
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            if (!escalationNoteInput.trim()) {
                                              alert('Please specify the escalation notes.');
                                              return;
                                            }
                                            setTicketEscalations({
                                              ...ticketEscalations,
                                              [tck.id]: {
                                                level: 'L3',
                                                note: escalationNoteInput,
                                                date: new Date().toLocaleDateString()
                                              }
                                            });
                                            setEscalationNoteInput('');
                                          }}
                                          className="flex-1 py-1 px-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] rounded transition-all cursor-pointer text-center"
                                        >
                                          Escalate to MD
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                      );
                    })()}

                  </motion.div>
                ) : (
                  <div className="bg-slate-50 border border-dashed border-slate-200 p-8 rounded-3xl text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2 h-72">
                    <MessageSquare size={32} />
                    Select a logged customer complaint to view assigned service tickets & feedback logs.
                  </div>
                )}
              </div>

            </div>
          </motion.div>
        )}

        {/* EXECUTIVE REPORTS TAB */}
        {activeTab === 'reports' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            {/* Report 1: Pending Handover Report */}
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <FileText className="text-amber-500" size={18} />
                Pending Handover Report
              </h4>
              <p className="text-xs text-slate-500">List of all apartment units ready or pending checklist completions before handover delivery.</p>
              <div className="text-xs font-mono text-slate-600 bg-slate-50 p-3 rounded-2xl">
                <div>• Pending Blocks: {handovers.filter(h => h.status === 'Pending').length} units</div>
                <div>• Active Queue: {handovers.filter(h => h.status === 'Ready').length} units</div>
              </div>
              <button 
                onClick={() => {
                  const items = handovers.filter(h => h.status !== 'Completed');
                  const rows = items.map(h => {
                    const c = customers.find(cu => cu.id === h.customerId);
                    const u = units.find(un => un.id === h.unitId);
                    return `<tr><td class="p-2 border font-mono">${h.handoverNo}</td><td class="p-2 border">${c?.nameEn || h.customerId}</td><td class="p-2 border">Unit ${u?.unitNo || h.unitId}</td><td class="p-2 border font-mono">${h.status}</td></tr>`;
                  }).join('');
                  setPreviewDoc({
                    type: 'report',
                    title: 'Pending Handover Report',
                    html: `
                      <div class="p-8 font-sans">
                        <h2 class="text-xl font-bold uppercase text-slate-900 mb-2">Al Kaswa Holdings Limited</h2>
                        <h3 class="text-base font-bold text-slate-700 mb-4 uppercase">Pending Handover Report</h3>
                        <table class="w-full border-collapse border border-slate-300 text-xs">
                          <thead><tr class="bg-slate-150 font-bold"><th class="p-2 border text-left">Ref No</th><th class="p-2 border text-left">Customer</th><th class="p-2 border text-left">Unit</th><th class="p-2 border text-left">Status</th></tr></thead>
                          <tbody>${rows}</tbody>
                        </table>
                      </div>
                    `
                  });
                }}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-slate-100 rounded-xl text-xs font-bold transition-all"
              >
                Generate Report View
              </button>
            </div>

            {/* Report 2: Snags & Repairs Defect Report */}
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Wrench className="text-rose-500" size={18} />
                Defect Snag Report
              </h4>
              <p className="text-xs text-slate-500">Summary of reported civil, plumbing, painting, and electrical snags active under construction.</p>
              <div className="text-xs font-mono text-slate-600 bg-slate-50 p-3 rounded-2xl">
                <div>• Open Snags: {defects.filter(d => d.status !== 'Closed').length} items</div>
                <div>• Closed Repairs: {defects.filter(d => d.status === 'Closed').length} items</div>
              </div>
              <button
                onClick={() => {
                  const rows = defects.map(d => {
                    const u = units.find(un => un.id === d.unitId);
                    return `<tr><td class="p-2 border font-mono">${d.defectNo}</td><td class="p-2 border">Unit ${u?.unitNo || d.unitId}</td><td class="p-2 border">${d.category}</td><td class="p-2 border">${d.description}</td><td class="p-2 border font-mono">${d.status}</td></tr>`;
                  }).join('');
                  setPreviewDoc({
                    type: 'report',
                    title: 'Defect Snag & Repair Report',
                    html: `
                      <div class="p-8 font-sans">
                        <h2 class="text-xl font-bold uppercase text-slate-900 mb-2">Al Kaswa Holdings Limited</h2>
                        <h3 class="text-base font-bold text-slate-700 mb-4 uppercase">Structural Defect & Snag Report</h3>
                        <table class="w-full border-collapse border border-slate-300 text-xs">
                          <thead><tr class="bg-slate-150 font-bold"><th class="p-2 border text-left">Ref No</th><th class="p-2 border text-left">Unit</th><th class="p-2 border text-left">Category</th><th class="p-2 border text-left">Description</th><th class="p-2 border text-left">Status</th></tr></thead>
                          <tbody>${rows}</tbody>
                        </table>
                      </div>
                    `
                  });
                }}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-slate-100 rounded-xl text-xs font-bold transition-all"
              >
                Generate Report View
              </button>
            </div>

            {/* Report 3: Customer Satisfaction (CSAT) Performance Report */}
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Smile className="text-purple-500" size={18} />
                CSAT Performance Report
              </h4>
              <p className="text-xs text-slate-500">Evaluations of handovers and completed resolution tickets under client reviews.</p>
              <div className="text-xs font-mono text-slate-600 bg-slate-50 p-3 rounded-2xl">
                <div>• Average Rating: {stats.avgSatisfaction} / 5 Stars</div>
                <div>• Satisfaction Index: Excellent</div>
              </div>
              <button
                onClick={() => {
                  const rows = feedbacks.map(f => {
                    const h = handovers.find(ho => ho.id === f.handoverId);
                    const c = h ? customers.find(cu => cu.id === h.customerId) : null;
                    return `<tr><td class="p-2 border">${c?.nameEn || 'Customer'}</td><td class="p-2 border font-bold text-amber-500 font-mono">${f.satisfactionScore}/5</td><td class="p-2 border">${f.comments}</td><td class="p-2 border font-mono">${f.feedbackDate}</td></tr>`;
                  }).join('');
                  setPreviewDoc({
                    type: 'report',
                    title: 'Customer Satisfaction Report',
                    html: `
                      <div class="p-8 font-sans">
                        <h2 class="text-xl font-bold uppercase text-slate-900 mb-2">Al Kaswa Holdings Limited</h2>
                        <h3 class="text-base font-bold text-slate-700 mb-4 uppercase">Customer Satisfaction (CSAT) Report</h3>
                        <table class="w-full border-collapse border border-slate-300 text-xs">
                          <thead><tr class="bg-slate-150 font-bold"><th class="p-2 border text-left">Customer</th><th class="p-2 border text-left">Score</th><th class="p-2 border text-left">Comments</th><th class="p-2 border text-left">Date</th></tr></thead>
                          <tbody>${rows.length > 0 ? rows : '<tr><td colspan="4" class="p-4 text-center text-slate-400">No CSAT submissions logged. All deliveries holding default 4.8/5 standard index.</td></tr>'}</tbody>
                        </table>
                      </div>
                    `
                  });
                }}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-slate-100 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Generate Report View
              </button>
            </div>
          </motion.div>
        )}

        {activeTab === 'facility' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6 animate-fade-in"
          >
            {/* Facility Navigation Sub-Bar */}
            <div className="flex bg-slate-100 p-1 rounded-2xl w-fit border border-slate-200/60 shadow-xs flex-wrap gap-1">
              <button
                type="button"
                onClick={() => setFacilityTab('security')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  facilityTab === 'security' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {lang === 'en' ? 'Security & Roster' : 'নিরাপত্তা ও ডিউটি রোস্টার'}
              </button>
              <button
                type="button"
                onClick={() => setFacilityTab('cleaners')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  facilityTab === 'cleaners' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {lang === 'en' ? 'Cleaner Schedule' : 'পরিচ্ছন্নতা কর্মী সূচী'}
              </button>
              <button
                type="button"
                onClick={() => setFacilityTab('maintenance')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  facilityTab === 'maintenance' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {lang === 'en' ? 'Maintenance Dispatch' : 'রক্ষণাবেক্ষণ কর্মী দল'}
              </button>
              <button
                type="button"
                onClick={() => setFacilityTab('assets')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  facilityTab === 'assets' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {lang === 'en' ? 'Asset & Service Logs' : 'সম্পদ ও সার্ভিস লগ'}
              </button>
              <button
                type="button"
                onClick={() => setFacilityTab('visitors')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  facilityTab === 'visitors' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {lang === 'en' ? 'Visitor Register' : 'ভিজিটর রেজিস্টার'}
              </button>
            </div>

            {/* SECURITY ROSTER PANEL */}
            {facilityTab === 'security' && (
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 font-display">Security Guard Duty Roster</h3>
                    <p className="text-xs text-slate-500">Real-time surveillance post allocations and shifts.</p>
                  </div>
                  <span className="px-2.5 py-1 text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 rounded-full border border-emerald-100">
                    SURVEILLANCE: ACTIVE
                  </span>
                </div>
                <div className="overflow-x-auto font-sans">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase font-semibold">
                        <th className="p-3">Guard Name</th>
                        <th className="p-3">Shift Hour</th>
                        <th className="p-3">Assigned Post</th>
                        <th className="p-3">Contact</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {securityRoster.map(sec => (
                        <tr key={sec.id} className="hover:bg-slate-50/50">
                          <td className="p-3 font-semibold text-slate-800">{sec.name}</td>
                          <td className="p-3 text-slate-600">{sec.shift}</td>
                          <td className="p-3 text-slate-600">{sec.gate}</td>
                          <td className="p-3 font-mono text-slate-500">{sec.contact}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              sec.status === 'On Duty' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {sec.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* CLEANER SCHEDULE PANEL */}
            {facilityTab === 'cleaners' && (
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-display">Common Area Cleaning Log</h3>
                  <p className="text-xs text-slate-500">Sanitation schedules and clearance checks for common property.</p>
                </div>
                <div className="overflow-x-auto font-sans">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase font-semibold">
                        <th className="p-3">Staff Name</th>
                        <th className="p-3">Assigned Sector</th>
                        <th className="p-3">Core Task</th>
                        <th className="p-3">Last Checked</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {cleanerSchedule.map(cl => (
                        <tr key={cl.id} className="hover:bg-slate-50/50">
                          <td className="p-3 font-semibold text-slate-800">{cl.name}</td>
                          <td className="p-3 text-slate-600">{cl.area}</td>
                          <td className="p-3 text-slate-600">{cl.task}</td>
                          <td className="p-3 font-mono text-slate-500">{cl.lastChecked}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              cl.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {cl.status}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                setCleanerSchedule(cleanerSchedule.map(item => 
                                  item.id === cl.id 
                                    ? { ...item, status: item.status === 'Completed' ? 'Pending' : 'Completed', lastChecked: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) } 
                                    : item
                                ));
                              }}
                              className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold transition-all cursor-pointer"
                            >
                              Toggle Status
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* MAINTENANCE DISPATCH PANEL */}
            {facilityTab === 'maintenance' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 font-display">Specialized Technicians</h3>
                    <p className="text-xs text-slate-500">Available technical team for mechanical, electrical, plumbing (MEP) dispatches.</p>
                  </div>
                  <div className="divide-y divide-slate-100 text-xs font-sans">
                    {maintenanceTeam.map(tech => (
                      <div key={tech.id} className="py-3 flex justify-between items-center">
                        <div>
                          <div className="font-bold text-slate-800">{tech.name}</div>
                          <div className="text-slate-500 font-medium text-[11px]">{tech.specialty}</div>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold block w-fit ml-auto ${
                            tech.availability === 'Available' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {tech.availability}
                          </span>
                          <span className="font-mono text-[10px] text-slate-400 mt-1 block">{tech.phone}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 font-display">Common Area Inspections</h3>
                    <p className="text-xs text-slate-500">Logged diagnostics of shared facilities.</p>
                  </div>
                  <div className="space-y-3 font-sans">
                    {commonAreaInspections.map(ins => (
                      <div key={ins.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-slate-800">{ins.area}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            ins.condition === 'Excellent' ? 'bg-emerald-50 text-emerald-700' :
                            ins.condition === 'Good' ? 'bg-blue-50 text-blue-700' :
                            'bg-amber-50 text-amber-700'
                          }`}>
                            {ins.condition}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">Checked: {ins.itemsChecked}</p>
                        <div className="flex justify-between text-[10px] text-slate-400 mt-2 font-mono">
                          <span>Inspector: {ins.inspector}</span>
                          <span>Date: {ins.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ASSET MAINTENANCE & SERVICE LOGS */}
            {facilityTab === 'assets' && (
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 font-display">Enterprise Mechanical & Electrical Assets</h3>
                    <p className="text-xs text-slate-500">Service schedules for primary real estate equipment (Standby Generators, Lifts, and Submersible Water Pumps).</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans">
                    {assetMaintenance.map(ast => (
                      <div key={ast.id} className="p-5 bg-slate-50 rounded-3xl border border-slate-100 space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block font-mono">ASSET LOG ID: {ast.id}</span>
                            <h4 className="font-bold text-xs text-slate-800 mt-0.5">{ast.name}</h4>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            ast.status === 'Normal' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {ast.status}
                          </span>
                        </div>

                        {/* Custom diagnostics sub-view */}
                        <div className="p-3 bg-white rounded-2xl border border-slate-100 grid grid-cols-2 gap-2 text-[11px] text-slate-600 font-mono">
                          {ast.id === 'ast-1' && (
                            <>
                              <div>Fuel Level: <span className="font-bold text-slate-800">{ast.fuelLevel}</span></div>
                              <div>Run Hours: <span className="font-bold text-slate-800">{ast.runningHours}</span></div>
                            </>
                          )}
                          {ast.id.includes('ast-2') || ast.id.includes('ast-3') ? (
                            <>
                              <div>Cables: <span className="font-bold text-slate-800">Certified</span></div>
                              <div>Sensors: <span className="font-bold text-emerald-600">Functional</span></div>
                            </>
                          ) : null}
                          {ast.id === 'ast-4' && (
                            <>
                              <div>Motor Temp: <span className="font-bold text-slate-800">42°C</span></div>
                              <div>Pressure: <span className="font-bold text-slate-800">45 PSI</span></div>
                            </>
                          )}
                          <div>Last Serviced: <span className="font-bold text-slate-700">{ast.lastService}</span></div>
                          <div>Next Scheduled: <span className="font-bold text-indigo-600">{ast.nextService}</span></div>
                        </div>

                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => {
                              // Perform standard simulation update for asset servicing
                              setAssetMaintenance(assetMaintenance.map(item => 
                                item.id === ast.id 
                                  ? { ...item, lastService: new Date().toISOString().split('T')[0], status: 'Normal' } 
                                  : item
                              ));
                            }}
                            className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-100 text-[10px] font-bold rounded-xl transition-all cursor-pointer"
                          >
                            Mark Asset Serviced
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* VISITOR REGISTER PANEL */}
            {facilityTab === 'visitors' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Visitor Log Form */}
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 font-display">Log New Visitor Entry</h3>
                    <p className="text-xs text-slate-500">Record check-in detail at main lobby security desk.</p>
                  </div>
                  <div className="space-y-3 text-xs font-sans">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Visitor Full Name *</label>
                      <input
                        type="text"
                        value={newVisitorName}
                        onChange={(e) => setNewVisitorName(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Mobile Contact *</label>
                      <input
                        type="text"
                        value={newVisitorPhone}
                        onChange={(e) => setNewVisitorPhone(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                        placeholder="017XX-XXXXXX"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">Visited Unit *</label>
                        <input
                          type="text"
                          value={newVisitorUnit}
                          onChange={(e) => setNewVisitorUnit(e.target.value)}
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                          placeholder="A-3 / B-5"
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">Purpose</label>
                        <input
                          type="text"
                          value={newVisitorPurpose}
                          onChange={(e) => setNewVisitorPurpose(e.target.value)}
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                          placeholder="Delivery / Inspection"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (!newVisitorName || !newVisitorPhone || !newVisitorUnit) {
                          alert('Please fill out Name, Phone and Unit No.');
                          return;
                        }
                        const newVis = {
                          id: 'vis-' + Date.now(),
                          name: newVisitorName,
                          phone: newVisitorPhone,
                          unitVisited: newVisitorUnit,
                          purpose: newVisitorPurpose || 'Site Visit',
                          checkIn: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                          checkOut: 'Ongoing'
                        };
                        setVisitorRegister([newVis, ...visitorRegister]);
                        setNewVisitorName('');
                        setNewVisitorPhone('');
                        setNewVisitorUnit('');
                        setNewVisitorPurpose('');
                      }}
                      className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold font-mono tracking-wide uppercase transition-all cursor-pointer text-center"
                    >
                      Log Visitor Check-In
                    </button>
                  </div>
                </div>

                {/* Visitor Log Table */}
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm lg:col-span-2 space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 font-display">Daily Gate Entry Register</h3>
                    <p className="text-xs text-slate-500">Live registry of visitors checking in and out of the common property boundary.</p>
                  </div>
                  <div className="overflow-x-auto text-xs font-sans">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase">
                          <th className="p-3">Visitor Info</th>
                          <th className="p-3">Unit Visited</th>
                          <th className="p-3">Purpose</th>
                          <th className="p-3 font-mono">In Time</th>
                          <th className="p-3 font-mono">Out Time</th>
                          <th className="p-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {visitorRegister.map(vis => (
                          <tr key={vis.id} className="hover:bg-slate-50/50">
                            <td className="p-3">
                              <div className="font-bold text-slate-800">{vis.name}</div>
                              <div className="text-[10px] text-slate-400 font-mono">{vis.phone}</div>
                            </td>
                            <td className="p-3 font-semibold text-slate-600">{vis.unitVisited}</td>
                            <td className="p-3 text-slate-600">{vis.purpose}</td>
                            <td className="p-3 font-mono text-slate-500">{vis.checkIn}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold ${
                                vis.checkOut === 'Ongoing' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                              }`}>
                                {vis.checkOut}
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              {vis.checkOut === 'Ongoing' && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setVisitorRegister(visitorRegister.map(item => 
                                      item.id === vis.id 
                                        ? { ...item, checkOut: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) } 
                                        : item
                                    ));
                                  }}
                                  className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] rounded transition-all cursor-pointer"
                                >
                                  Check Out
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

          </motion.div>
        )}

      </AnimatePresence>

      {/* MODAL SYSTEM */}

      {/* 1. Add Handover Modal */}
      {showAddHandover && (
        <div className="fixed inset-0 bg-slate-950/60 flex items-center justify-center p-4 z-50 backdrop-blur-xs">
          <motion.form
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onSubmit={handleCreateHandover}
            className="bg-white p-6 rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-900 font-display">Initiate Handover Delivery</h3>
              <button type="button" onClick={() => setShowAddHandover(false)} className="text-slate-400 hover:text-slate-600">×</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Select Project</label>
                <select
                  value={newHovProject}
                  onChange={(e) => {
                    setNewHovProject(e.target.value);
                    setNewHovUnit('');
                  }}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                >
                  <option value="">-- Choose Project --</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.nameEn}</option>)}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Select Unit (Sold/Booked Share)</label>
                <select
                  value={newHovUnit}
                  onChange={(e) => setNewHovUnit(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                >
                  <option value="">-- Choose Unit --</option>
                  {units
                    .filter(u => u.projectId === newHovProject)
                    .map(u => <option key={u.id} value={u.id}>{u.unitNo} ({u.allocationType} - {u.status})</option>)}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Select Customer</label>
                <select
                  value={newHovCust}
                  onChange={(e) => setNewHovCust(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                >
                  <option value="">-- Choose Allottee --</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.nameEn}</option>)}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Proposed Handover Date</label>
                <input
                  type="date"
                  value={newHovDate}
                  onChange={(e) => setNewHovDate(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 text-xs font-bold pt-2 border-t border-slate-50">
              <button
                type="button"
                onClick={() => setShowAddHandover(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl shadow-lg shadow-emerald-500/10"
              >
                Create Delivery File
              </button>
            </div>
          </motion.form>
        </div>
      )}

      {/* 2. Add Snag Report Modal */}
      {showAddDefect && (
        <div className="fixed inset-0 bg-slate-950/60 flex items-center justify-center p-4 z-50 backdrop-blur-xs">
          <motion.form
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onSubmit={handleCreateDefect}
            className="bg-white p-6 rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-900 font-display">Log Structural Snag/Defect</h3>
              <button type="button" onClick={() => setShowAddDefect(false)} className="text-slate-400 hover:text-slate-600">×</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Select Affected Unit</label>
                <select
                  value={newDfUnit}
                  onChange={(e) => setNewDfUnit(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                >
                  <option value="">-- Choose Unit --</option>
                  {units.map(u => <option key={u.id} value={u.id}>Unit {u.unitNo} ({projects.find(p => p.id === u.projectId)?.nameEn})</option>)}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Defect Category</label>
                <select
                  value={newDfCategory}
                  onChange={(e) => setNewDfCategory(e.target.value as DefectCategory)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                >
                  <option value="Civil">Civil</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Plumbing">Plumbing</option>
                  <option value="Paint">Paint</option>
                  <option value="Tiles">Tiles</option>
                  <option value="Door & Window">Door & Window</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Assigned Maintenance Engineer</label>
                <input
                  type="text"
                  value={newDfEngineer}
                  onChange={(e) => setNewDfEngineer(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Defect Description / Observations</label>
                <textarea
                  value={newDfDesc}
                  onChange={(e) => setNewDfDesc(e.target.value)}
                  placeholder="Describe crack details, water pressure issues, paints scratches..."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl h-20"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 text-xs font-bold pt-2 border-t border-slate-50">
              <button
                type="button"
                onClick={() => setShowAddDefect(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-100 rounded-xl"
              >
                Log Defect File
              </button>
            </div>
          </motion.form>
        </div>
      )}

      {/* 3. Add Customer Complaint Modal */}
      {showAddComplaint && (
        <div className="fixed inset-0 bg-slate-950/60 flex items-center justify-center p-4 z-50 backdrop-blur-xs">
          <motion.form
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onSubmit={handleCreateComplaint}
            className="bg-white p-6 rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-900 font-display">Log Customer Complaint</h3>
              <button type="button" onClick={() => setShowAddComplaint(false)} className="text-slate-400 hover:text-slate-600">×</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Allottee / Customer</label>
                <select
                  value={newCmpCust}
                  onChange={(e) => setNewCmpCust(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                >
                  <option value="">-- Choose Customer --</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.nameEn}</option>)}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Select Unit</label>
                <select
                  value={newCmpUnit}
                  onChange={(e) => setNewCmpUnit(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                >
                  <option value="">-- Choose Unit --</option>
                  {units.map(u => <option key={u.id} value={u.id}>Unit {u.unitNo}</option>)}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Priority Index</label>
                <select
                  value={newCmpPriority}
                  onChange={(e) => setNewCmpPriority(e.target.value as ComplaintPriority)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical (Immediate Dispatch)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Complaint Details</label>
                <textarea
                  value={newCmpDetails}
                  onChange={(e) => setNewCmpDetails(e.target.value)}
                  placeholder="Hot water issue, low lift velocity, lobby lighting missing..."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl h-20"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 text-xs font-bold pt-2 border-t border-slate-50">
              <button
                type="button"
                onClick={() => setShowAddComplaint(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-100 rounded-xl"
              >
                Log Complaint
              </button>
            </div>
          </motion.form>
        </div>
      )}

      {/* 4. Customer Feedback / Satisfaction Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-slate-950/60 flex items-center justify-center p-4 z-50 backdrop-blur-xs">
          <motion.form
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onSubmit={handleAddFeedback}
            className="bg-white p-6 rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-900 font-display">Log Satisfaction Review (CSAT)</h3>
              <button type="button" onClick={() => setShowFeedbackModal(false)} className="text-slate-400 hover:text-slate-600">×</button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-2">CSAT Satisfaction Score (1 - 5 Stars)</label>
                <div className="flex gap-2 items-center justify-center py-2 bg-slate-50 rounded-2xl border border-slate-100">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFeedScore(star)}
                      className={`text-2xl transition-all cursor-pointer ${feedScore >= star ? 'text-amber-400 scale-110' : 'text-slate-300 hover:text-amber-200'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Remarks / Testimonial Comments</label>
                <textarea
                  value={feedComments}
                  onChange={(e) => setFeedComments(e.target.value)}
                  placeholder="Express your experience with our construction finishing and support..."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl h-20"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 text-xs font-bold pt-2 border-t border-slate-50">
              <button
                type="button"
                onClick={() => setShowFeedbackModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl shadow-lg"
              >
                Register CSAT
              </button>
            </div>
          </motion.form>
        </div>
      )}

      {/* 5. Document Preview Drawer */}
      {previewDoc && (
        <div className="fixed inset-0 bg-slate-950/65 flex items-center justify-center p-4 z-50 backdrop-blur-xs">
          <motion.div
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden"
          >
            <div className="p-4 bg-slate-900 text-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-xs uppercase tracking-wider font-mono">DMS DOCUMENT VIEWER & ENGINE</h3>
              <button onClick={() => setPreviewDoc(null)} className="text-slate-400 hover:text-slate-100 font-bold text-lg">×</button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-slate-100/50">
              {/* Actual premium printed style document */}
              <div 
                className="bg-white shadow-xl rounded-2xl border border-slate-200 overflow-hidden p-1"
                dangerouslySetInnerHTML={{ __html: previewDoc.html }} 
              />
            </div>

            <div className="p-4 border-t border-slate-100 flex justify-between bg-white text-xs font-bold">
              <button
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl"
              >
                Close Viewer
              </button>
              <button
                onClick={() => {
                  const printContent = previewDoc.html;
                  const win = window.open('', '_blank');
                  if (win) {
                    win.document.write(`<html><head><title>${previewDoc.title}</title><link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet"></head><body onload="window.print()">${printContent}</body></html>`);
                    win.document.close();
                  }
                }}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-100 rounded-xl flex items-center gap-1.5"
              >
                <Printer size={14} />
                Print Document File
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}
