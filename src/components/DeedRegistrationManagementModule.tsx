import React, { useState, useMemo } from 'react';
import { 
  Landmark, 
  Search, 
  Plus, 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  History, 
  UserCheck, 
  Download, 
  TrendingUp, 
  MapPin, 
  Calendar, 
  Building2, 
  Users, 
  Check, 
  X, 
  ShieldAlert, 
  Sparkles, 
  BookOpen, 
  Briefcase, 
  FileUp,
  ArrowRight,
  RefreshCw,
  Eye,
  Trash2,
  FileSpreadsheet
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  RoleId, 
  DeedRegistration, 
  MutationApplication, 
  OwnershipTransfer, 
  RegistryOffice, 
  MutationDocument, 
  DeedDocument,
  Project,
  ProjectUnit
} from '../types';
import { dbService } from '../db/dbService';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  Legend 
} from 'recharts';

interface DeedRegistrationManagementModuleProps {
  lang: 'en' | 'bn';
  currentRole: RoleId;
}

export default function DeedRegistrationManagementModule({ lang, currentRole }: DeedRegistrationManagementModuleProps) {
  // --- DATABASE & STATE INITIALIZATION ---
  const [projects] = useState<Project[]>(() => dbService.projects.getAll());
  const [units, setUnits] = useState<ProjectUnit[]>(() => dbService.units.getAll());
  const [registryOffices, setRegistryOffices] = useState<RegistryOffice[]>(() => dbService.registryOffices.getAll());
  
  const [deeds, setDeeds] = useState<DeedRegistration[]>(() => dbService.deedRegistrations.getAll());
  const [mutations, setMutations] = useState<MutationApplication[]>(() => dbService.mutationApplications.getAll());
  const [transfers, setTransfers] = useState<OwnershipTransfer[]>(() => dbService.ownershipTransfers.getAll());
  const [mutationDocs, setMutationDocs] = useState<MutationDocument[]>(() => dbService.mutationDocuments.getAll());
  const [deedDocs, setDeedDocs] = useState<DeedDocument[]>(() => dbService.deedDocuments.getAll());

  // --- COMPONENT STATE ---
  const [activeTab, setActiveTab] = useState<'deeds' | 'mutations' | 'transfers' | 'vault' | 'reports'>('deeds');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal control states
  const [showDeedModal, setShowDeedModal] = useState(false);
  const [showMutationModal, setShowMutationModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showDocModal, setShowDocModal] = useState(false);
  const [viewingDeedId, setViewingDeedId] = useState<string | null>(null);
  const [viewingMutationId, setViewingMutationId] = useState<string | null>(null);

  // Form states
  const [newDeed, setNewDeed] = useState<Partial<DeedRegistration>>({
    deedNo: '',
    registrationDate: new Date().toISOString().split('T')[0],
    registryOfficeId: 'ro-1',
    buyerNameEn: '',
    buyerNameBn: '',
    sellerNameEn: 'Al Kaswa Holdings Limited',
    sellerNameBn: 'আল কাসওয়া হোল্ডিংস লিমিটেড',
    unitId: '',
    registrationFee: 0,
    stampDuty: 0,
    vat: 0,
    status: 'Draft',
    remarksEn: '',
    remarksBn: ''
  });

  const [newMutation, setNewMutation] = useState<Partial<MutationApplication>>({
    applicationNo: '',
    landOfficeEn: '',
    landOfficeBn: '',
    submissionDate: new Date().toISOString().split('T')[0],
    mutationFee: 1150,
    status: 'Pending',
    unitId: '',
    buyerNameEn: '',
    buyerNameBn: ''
  });

  const [newTransfer, setNewTransfer] = useState<Partial<OwnershipTransfer>>({
    unitId: '',
    previousOwnerEn: '',
    previousOwnerBn: '',
    newOwnerEn: '',
    newOwnerBn: '',
    transferDate: new Date().toISOString().split('T')[0],
    transferReasonEn: 'Direct Purchase',
    transferReasonBn: 'সরাসরি ক্রয়',
    transferValue: 0,
    legalNotesEn: '',
    legalNotesBn: '',
    status: 'Completed'
  });

  const [newDoc, setNewDoc] = useState<{
    associationType: 'deed' | 'mutation';
    associationId: string;
    titleEn: string;
    titleBn: string;
    documentType: string;
    fileName: string;
  }>({
    associationType: 'deed',
    associationId: '',
    titleEn: '',
    titleBn: '',
    documentType: 'Other',
    fileName: ''
  });

  // --- ROLE PERMISSIONS DETERMINATION ---
  const isFounder = currentRole === 'FND';
  const isMD = currentRole === 'MD';
  const isLegal = currentRole === 'LGL';
  const isLandTeam = currentRole === 'LAM';
  const isAccounts = currentRole === 'ACT';
  const isCustomer = currentRole === 'CST';
  const isInvestor = currentRole === 'INV';

  // Strict structural boundaries: check who can perform write operations
  const canCreateDeed = isFounder || isMD || isLegal;
  const canUpdateDeed = isFounder || isMD || isLegal || isLandTeam;
  const canCreateMutation = isFounder || isMD || isLegal;
  const canUpdateMutation = isFounder || isMD || isLegal || isLandTeam;
  const canExecuteTransfer = isFounder || isMD || isLegal;

  // --- TRANSLATIONS SLATE ---
  const t = {
    en: {
      title: 'Deed Registration & Mutation ERP',
      subtitle: 'Al Kaswa Holdings Limited Legal Core & Title Registry System',
      projectFilter: 'Project Filter',
      allProjects: 'All Active Projects',
      roleAlert: 'Logged in as',
      restrictedRole: 'Your role has restricted read-only permissions for legal registries.',
      investorRestricted: 'Investors do not have access to customer registry ledgers.',
      noAccessTitle: 'Access Denied',
      noAccessDesc: 'Your account security clearance level is insufficient to view the Deed and Mutation Registry database.',
      
      // KPI Widgets
      totalRegistered: 'Registered Deeds',
      pendingMutations: 'Pending Mutations',
      completedTransfers: 'Ownership Transfers',
      registryLatency: 'Registry Latency',
      avgDays: 'Avg. Days',
      activeLedgers: 'Active Ledgers',

      // Tabs
      tabDeeds: 'Deed Registry Tracker',
      tabMutations: 'Mutation Case Office',
      tabTransfers: 'Ownership Ledger',
      tabVault: 'DMS Document Vault',
      tabReports: 'Executive Reports',

      // Table & General Headers
      deedNo: 'Deed Number',
      regDate: 'Registration Date',
      registryOffice: 'Registry Office',
      buyer: 'Buyer Name',
      seller: 'Seller Name',
      unitNo: 'Unit ID',
      project: 'Project Name',
      regFee: 'Reg. Fee',
      stampDuty: 'Stamp Duty',
      vat: 'VAT',
      totalCost: 'Total Govt. Cost',
      status: 'Current Status',
      actions: 'Actions',

      // Mutation Headers
      appNo: 'Application Number',
      landOffice: 'Land Office',
      submissionDate: 'Submission Date',
      fee: 'Processing Fee',
      caseNo: 'Case Number',
      hearingDate: 'Hearing Date',
      rejectionReason: 'Rejection Reason',

      // Ownership Headers
      prevOwner: 'Previous Owner',
      newOwner: 'New Owner',
      transferDate: 'Transfer Date',
      transferReason: 'Transfer Reason',
      transferValue: 'Transfer Value',
      notes: 'Legal Notes',

      // Status translation mappings
      Draft: 'Draft',
      Submitted: 'Submitted',
      'Under Verification': 'Under Verification',
      Registered: 'Registered',
      Delivered: 'Delivered',
      Pending: 'Pending',
      Processing: 'Processing',
      Approved: 'Approved',
      Rejected: 'Rejected',
      Completed: 'Completed',

      // Buttons
      registerDeedBtn: 'Register New Deed',
      newMutationBtn: 'New Mutation File',
      transferOwnerBtn: 'Execute Ownership Transfer',
      uploadDocBtn: 'Vault Secure Document',
      searchPlaceholder: 'Search by deed, application number, buyer name, or unit...',
      save: 'Save Record',
      cancel: 'Cancel',
      close: 'Close',
      details: 'View Legal Summary',

      // Validation/Errors
      fieldRequired: 'Please fill out all required fields.',
      successAdd: 'Record added successfully!',
      successUpdate: 'Status updated successfully!',
      successTransfer: 'Ownership transfer executed successfully! Unit ownership updated.',

      // Reports
      regSummary: 'Deed Registration Breakdown',
      mutationProgress: 'Mutation Case Lifecycle',
      registryPerf: 'Sub-Registry Performance Analysis',
      transferHistory: 'Monthly Ownership Transfers',
      latencyLabel: 'Average processing delays in days',
      feeDistribution: 'Collected Government Duties (BDT)'
    },
    bn: {
      title: 'দলিল রেজিস্ট্রেশন ও নামজারি ইআরপি',
      subtitle: 'আল কাসওয়া হোল্ডিংস লিমিটেড লিগ্যাল কোর ও রেজিস্ট্রি সিস্টেম',
      projectFilter: 'প্রকল্প ফিল্টার',
      allProjects: 'সকল সক্রিয় প্রকল্পসমূহ',
      roleAlert: 'লগইন ভূমিকা',
      restrictedRole: 'আপনার ভূমিকার কারণে লিগ্যাল রেজিস্ট্রিটি শুধুমাত্র দেখার অনুমতি রয়েছে।',
      investorRestricted: 'বিনিয়োগকারীদের কাস্টমার রেজিস্ট্রি খতিয়ান দেখার অনুমতি নেই।',
      noAccessTitle: 'অ্যাক্সেস অস্বীকার',
      noAccessDesc: 'দলিল এবং নামজারি রেজিস্ট্রি ডেটাবেস দেখার জন্য আপনার পর্যাপ্ত নিরাপত্তা ছাড়পত্র নেই।',
      
      // KPI Widgets
      totalRegistered: 'নিবন্ধিত দলিলসমূহ',
      pendingMutations: 'চলমান নামজারি',
      completedTransfers: 'মালিকানা হস্তান্তর',
      registryLatency: 'রেজিস্ট্রি লেটেন্সি',
      avgDays: 'গড় দিন',
      activeLedgers: 'সক্রিয় খতিয়ান',

      // Tabs
      tabDeeds: 'দলিল রেজিস্ট্রি ট্র্যাকার',
      tabMutations: 'নামজারি মামলা অফিস',
      tabTransfers: 'মালিকানা স্থানান্তর লেজার',
      tabVault: 'ডিএমএস ডকুমেন্ট ভল্ট',
      tabReports: 'নির্বাহী রিপোর্ট',

      // Table & General Headers
      deedNo: 'দলিল নম্বর',
      regDate: 'নিবন্ধন তারিখ',
      registryOffice: 'রেজিস্ট্রি অফিস',
      buyer: 'ক্রেতার নাম',
      seller: 'বিক্রেতার নাম',
      unitNo: 'ইউনিট নং',
      project: 'প্রকল্পের নাম',
      regFee: 'রেজিঃ ফি',
      stampDuty: 'স্ট্যাম্প ডিউটি',
      vat: 'ভ্যাট',
      totalCost: 'মোট সরকারি খরচ',
      status: 'বর্তমান অবস্থা',
      actions: 'পদক্ষেপ',

      // Mutation Headers
      appNo: 'আবেদন নম্বর',
      landOffice: 'ভূমি অফিস',
      submissionDate: 'দাখিলের তারিখ',
      fee: 'প্রসেসিং ফি',
      caseNo: 'মামলা নম্বর',
      hearingDate: 'শুনানির তারিখ',
      rejectionReason: 'প্রত্যাখ্যানের কারণ',

      // Ownership Headers
      prevOwner: 'পূর্ববর্তী মালিক',
      newOwner: 'নতুন মালিক',
      transferDate: 'হস্তান্তরের তারিখ',
      transferReason: 'হস্তান্তরের কারণ',
      transferValue: 'হস্তান্তর মূল্য',
      notes: 'আইনি মন্তব্য',

      // Status translation mappings
      Draft: 'খসড়া',
      Submitted: 'দাখিলকৃত',
      'Under Verification': 'যাচাইাধীন',
      Registered: 'নিবন্ধিত',
      Delivered: 'সরবরাহকৃত',
      Pending: 'পেন্ডিং',
      Processing: 'প্রক্রিয়াধীন',
      Approved: 'অনুমোদিত',
      Rejected: 'প্রত্যাখ্যাত',
      Completed: 'সম্পন্ন',

      // Buttons
      registerDeedBtn: 'নতুন দলিল নিবন্ধন করুন',
      newMutationBtn: 'নতুন নামজারি ফাইল',
      transferOwnerBtn: 'মালিকানা হস্তান্তর সম্পাদন',
      uploadDocBtn: 'ভল্টে নতুন ফাইল সংযুক্ত করুন',
      searchPlaceholder: 'দলিল, আবেদন নম্বর, নাম অথবা ইউনিট দিয়ে খুঁজুন...',
      save: 'রেকর্ড সংরক্ষণ',
      cancel: 'বাতিল',
      close: 'বন্ধ করুন',
      details: 'আইনি বিবরণ দেখুন',

      // Validation/Errors
      fieldRequired: 'দয়া করে সকল প্রয়োজনীয় ক্ষেত্র পূরণ করুন।',
      successAdd: 'রেকর্ড সফলভাবে যুক্ত হয়েছে!',
      successUpdate: 'অবস্থা সফলভাবে আপডেট করা হয়েছে!',
      successTransfer: 'মালিকানা হস্তান্তর সম্পন্ন হয়েছে! ইউনিটের মালিকানা হালনাগাদ করা হয়েছে।',

      // Reports
      regSummary: 'দলিল নিবন্ধনের অবস্থা',
      mutationProgress: 'নামজারি আবেদনের অগ্রগতি',
      registryPerf: 'সাব-রেজিস্ট্রি অফিসের সময়সীমা বিশ্লেষণ',
      transferHistory: 'মাসিক মালিকানা হস্তান্তর তালিকা',
      latencyLabel: 'গড় প্রসেসিং সময় (দিন)',
      feeDistribution: 'সংগৃহীত সরকারি শুল্ক (টাকা)'
    }
  };

  const currentTranslations = t[lang];

  // Helper currency and date formatter
  const formatCurrency = (val: number) => {
    return val.toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US') + (lang === 'bn' ? ' ৳' : ' BDT');
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  // --- STRICT DATA FILTERING BASED ON ROLE & PROJECT ---
  const filteredDeeds = useMemo(() => {
    let result = deeds;
    
    // 1. Role-based filtering: Customers only see their OWN records
    if (isCustomer) {
      result = result.filter(d => d.customerId === 'cst-1');
    }

    // 2. Project filter
    if (selectedProjectId !== 'all') {
      result = result.filter(d => d.projectId === selectedProjectId);
    }

    // 3. Search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(d => 
        d.deedNo.toLowerCase().includes(q) ||
        d.buyerNameEn.toLowerCase().includes(q) ||
        d.buyerNameBn.includes(q) ||
        d.unitNo.toLowerCase().includes(q) ||
        d.projectNameEn.toLowerCase().includes(q)
      );
    }

    // 4. Status filter
    if (statusFilter !== 'all') {
      result = result.filter(d => d.status === statusFilter);
    }

    return result;
  }, [deeds, selectedProjectId, searchQuery, statusFilter, isCustomer]);

  const filteredMutations = useMemo(() => {
    let result = mutations;

    if (isCustomer) {
      result = result.filter(m => m.customerId === 'cst-1');
    }

    if (selectedProjectId !== 'all') {
      result = result.filter(m => m.projectId === selectedProjectId);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(m => 
        m.applicationNo.toLowerCase().includes(q) ||
        m.buyerNameEn.toLowerCase().includes(q) ||
        m.buyerNameBn.includes(q) ||
        m.unitNo.toLowerCase().includes(q) ||
        m.landOfficeEn.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter(m => m.status === statusFilter);
    }

    return result;
  }, [mutations, selectedProjectId, searchQuery, statusFilter, isCustomer]);

  const filteredTransfers = useMemo(() => {
    let result = transfers;

    if (selectedProjectId !== 'all') {
      result = result.filter(t => t.projectId === selectedProjectId);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(t => 
        t.unitNo.toLowerCase().includes(q) ||
        t.previousOwnerEn.toLowerCase().includes(q) ||
        t.newOwnerEn.toLowerCase().includes(q) ||
        t.projectNameEn.toLowerCase().includes(q)
      );
    }

    return result;
  }, [transfers, selectedProjectId, searchQuery]);

  // --- ACTIONS & PERSISTENCE WRITING ---
  const handleCreateDeed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeed.deedNo || !newDeed.unitId) {
      alert(currentTranslations.fieldRequired);
      return;
    }

    const selectedUnit = units.find(u => u.id === newDeed.unitId);
    const selectedProject = projects.find(p => p.id === selectedUnit?.projectId);
    const registry = registryOffices.find(r => r.id === newDeed.registryOfficeId);

    const fullDeed: DeedRegistration = {
      id: `deed_${Date.now()}`,
      deedNo: newDeed.deedNo,
      registrationDate: newDeed.registrationDate || new Date().toISOString().split('T')[0],
      registryOfficeId: newDeed.registryOfficeId || 'ro-1',
      buyerNameEn: newDeed.buyerNameEn || 'Unknown Buyer',
      buyerNameBn: newDeed.buyerNameBn || 'অজ্ঞাত ক্রেতা',
      sellerNameEn: newDeed.sellerNameEn || 'Al Kaswa Holdings Limited',
      sellerNameBn: newDeed.sellerNameBn || 'আল কাসওয়া হোল্ডিংস লিমিটেড',
      unitId: newDeed.unitId,
      unitNo: selectedUnit?.unitNo || '',
      projectId: selectedProject?.id || 'p1',
      projectNameEn: selectedProject?.nameEn || '',
      projectNameBn: selectedProject?.nameBn || '',
      registrationFee: Number(newDeed.registrationFee || 0),
      stampDuty: Number(newDeed.stampDuty || 0),
      vat: Number(newDeed.vat || 0),
      status: (newDeed.status as any) || 'Draft',
      customerId: selectedUnit?.id === 'u3' ? 'cst-1' : undefined, // link test case customer
      remarksEn: newDeed.remarksEn,
      remarksBn: newDeed.remarksBn
    };

    dbService.deedRegistrations.create(fullDeed);
    setDeeds(dbService.deedRegistrations.getAll());
    setShowDeedModal(false);
    alert(currentTranslations.successAdd);
    
    // Reset form
    setNewDeed({
      deedNo: '',
      registrationDate: new Date().toISOString().split('T')[0],
      registryOfficeId: 'ro-1',
      buyerNameEn: '',
      buyerNameBn: '',
      sellerNameEn: 'Al Kaswa Holdings Limited',
      sellerNameBn: 'আল কাসওয়া হোল্ডিংস লিমিটেড',
      unitId: '',
      registrationFee: 0,
      stampDuty: 0,
      vat: 0,
      status: 'Draft',
      remarksEn: '',
      remarksBn: ''
    });
  };

  const handleCreateMutation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMutation.applicationNo || !newMutation.unitId) {
      alert(currentTranslations.fieldRequired);
      return;
    }

    const selectedUnit = units.find(u => u.id === newMutation.unitId);
    const selectedProject = projects.find(p => p.id === selectedUnit?.projectId);

    const fullMutation: MutationApplication = {
      id: `mut_${Date.now()}`,
      applicationNo: newMutation.applicationNo,
      landOfficeEn: newMutation.landOfficeEn || 'Revenue Circle Office',
      landOfficeBn: newMutation.landOfficeBn || 'রাজস্ব সার্কেল অফিস',
      submissionDate: newMutation.submissionDate || new Date().toISOString().split('T')[0],
      mutationFee: Number(newMutation.mutationFee || 1150),
      status: (newMutation.status as any) || 'Pending',
      unitId: newMutation.unitId,
      unitNo: selectedUnit?.unitNo || '',
      projectId: selectedProject?.id || 'p1',
      projectNameEn: selectedProject?.nameEn || '',
      projectNameBn: selectedProject?.nameBn || '',
      buyerNameEn: newMutation.buyerNameEn || 'Unknown Buyer',
      buyerNameBn: newMutation.buyerNameBn || 'অজ্ঞাত ক্রেতা',
      customerId: selectedUnit?.id === 'u3' ? 'cst-1' : undefined
    };

    dbService.mutationApplications.create(fullMutation);
    setMutations(dbService.mutationApplications.getAll());
    setShowMutationModal(false);
    alert(currentTranslations.successAdd);

    setNewMutation({
      applicationNo: '',
      landOfficeEn: '',
      landOfficeBn: '',
      submissionDate: new Date().toISOString().split('T')[0],
      mutationFee: 1150,
      status: 'Pending',
      unitId: '',
      buyerNameEn: '',
      buyerNameBn: ''
    });
  };

  const handleCreateTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTransfer.unitId || !newTransfer.newOwnerEn) {
      alert(currentTranslations.fieldRequired);
      return;
    }

    const selectedUnit = units.find(u => u.id === newTransfer.unitId);
    const selectedProject = projects.find(p => p.id === selectedUnit?.projectId);

    const fullTransfer: OwnershipTransfer = {
      id: `ot_${Date.now()}`,
      unitId: newTransfer.unitId,
      unitNo: selectedUnit?.unitNo || '',
      projectId: selectedProject?.id || 'p1',
      projectNameEn: selectedProject?.nameEn || '',
      projectNameBn: selectedProject?.nameBn || '',
      previousOwnerEn: newTransfer.previousOwnerEn || 'Al Kaswa Holdings Limited',
      previousOwnerBn: newTransfer.previousOwnerBn || 'আল কাসওয়া হোল্ডিংস লিমিটেড',
      newOwnerEn: newTransfer.newOwnerEn,
      newOwnerBn: newTransfer.newOwnerBn || newTransfer.newOwnerEn,
      transferDate: newTransfer.transferDate || new Date().toISOString().split('T')[0],
      transferReasonEn: newTransfer.transferReasonEn || 'Direct Purchase',
      transferReasonBn: newTransfer.transferReasonBn || 'সরাসরি ক্রয়',
      transferValue: Number(newTransfer.transferValue || 0),
      legalNotesEn: newTransfer.legalNotesEn,
      legalNotesBn: newTransfer.legalNotesBn,
      status: 'Completed'
    };

    // 1. Create transfer record
    dbService.ownershipTransfers.create(fullTransfer);
    setTransfers(dbService.ownershipTransfers.getAll());

    // 2. Also automatically update the Unit status/ownership details in system units
    dbService.units.update(newTransfer.unitId, (oldUnit) => ({
      ...oldUnit,
      allocationType: 'Developer Share', // or updated
      status: 'Sold' // ensure marked as sold
    }));
    setUnits(dbService.units.getAll());

    setShowTransferModal(false);
    alert(currentTranslations.successTransfer);

    setNewTransfer({
      unitId: '',
      previousOwnerEn: '',
      previousOwnerBn: '',
      newOwnerEn: '',
      newOwnerBn: '',
      transferDate: new Date().toISOString().split('T')[0],
      transferReasonEn: 'Direct Purchase',
      transferReasonBn: 'সরাসরি ক্রয়',
      transferValue: 0,
      legalNotesEn: '',
      legalNotesBn: '',
      status: 'Completed'
    });
  };

  const handleUpdateDeedStatus = (deedId: string, nextStatus: DeedRegistration['status']) => {
    dbService.deedRegistrations.update(deedId, (old) => ({
      ...old,
      status: nextStatus
    }));
    setDeeds(dbService.deedRegistrations.getAll());
  };

  const handleUpdateMutationStatus = (mutationId: string, nextStatus: MutationApplication['status']) => {
    dbService.mutationApplications.update(mutationId, (old) => ({
      ...old,
      status: nextStatus
    }));
    setMutations(dbService.mutationApplications.getAll());
  };

  const handleDeleteDeed = (id: string) => {
    if (confirm(lang === 'en' ? 'Are you sure you want to delete this deed record?' : 'আপনি কি নিশ্চিত যে আপনি এই দলিলের রেকর্ডটি মুছতে চান?')) {
      dbService.deedRegistrations.delete(id);
      setDeeds(dbService.deedRegistrations.getAll());
    }
  };

  const handleDeleteMutation = (id: string) => {
    if (confirm(lang === 'en' ? 'Are you sure you want to delete this mutation application?' : 'আপনি কি নিশ্চিত যে আপনি এই নামজারি খতিয়ান রেকর্ডটি মুছতে চান?')) {
      dbService.mutationApplications.delete(id);
      setMutations(dbService.mutationApplications.getAll());
    }
  };

  const handleCreateDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDoc.associationId || !newDoc.titleEn) {
      alert(currentTranslations.fieldRequired);
      return;
    }

    if (newDoc.associationType === 'deed') {
      const docRecord: DeedDocument = {
        id: `dd_${Date.now()}`,
        deedRegistrationId: newDoc.associationId,
        titleEn: newDoc.titleEn,
        titleBn: newDoc.titleBn || newDoc.titleEn,
        documentType: newDoc.documentType as any,
        fileName: newDoc.fileName || 'document.pdf',
        fileSize: '2.5 MB',
        version: 1,
        uploadedBy: getRoleNameEn(currentRole),
        uploadedAt: new Date().toISOString().split('T')[0],
        scannedCopyPath: `/documents/${newDoc.fileName || 'file.pdf'}`
      };
      dbService.deedDocuments.create(docRecord);
      setDeedDocs(dbService.deedDocuments.getAll());
    } else {
      const docRecord: MutationDocument = {
        id: `md_${Date.now()}`,
        mutationApplicationId: newDoc.associationId,
        titleEn: newDoc.titleEn,
        titleBn: newDoc.titleBn || newDoc.titleEn,
        documentType: newDoc.documentType as any,
        fileName: newDoc.fileName || 'document.pdf',
        fileSize: '1.2 MB',
        version: 1,
        uploadedBy: getRoleNameEn(currentRole),
        uploadedAt: new Date().toISOString().split('T')[0],
        scannedCopyPath: `/documents/${newDoc.fileName || 'file.pdf'}`
      };
      dbService.mutationDocuments.create(docRecord);
      setMutationDocs(dbService.mutationDocuments.getAll());
    }

    setShowDocModal(false);
    alert(currentTranslations.successAdd);
    setNewDoc({
      associationType: 'deed',
      associationId: '',
      titleEn: '',
      titleBn: '',
      documentType: 'Other',
      fileName: ''
    });
  };

  const getRoleNameEn = (role: RoleId) => {
    switch (role) {
      case 'FND': return 'Founder';
      case 'MD': return 'Managing Director';
      case 'LGL': return 'Legal Officer';
      case 'LAM': return 'Land Team';
      case 'ACT': return 'Accountant';
      case 'CST': return 'Customer';
      default: return role;
    }
  };

  // --- STATS COMPUTATION FOR WIDGETS ---
  const totalRegisteredCount = useMemo(() => deeds.filter(d => d.status === 'Registered').length, [deeds]);
  const pendingMutationCount = useMemo(() => mutations.filter(m => ['Pending', 'Submitted', 'Processing'].includes(m.status)).length, [mutations]);
  const completedTransferCount = useMemo(() => transfers.filter(t => t.status === 'Completed').length, [transfers]);
  const avgRegistryDelay = useMemo(() => {
    if (registryOffices.length === 0) return 0;
    const total = registryOffices.reduce((acc, curr) => acc + curr.avgDelayDays, 0);
    return Math.round(total / registryOffices.length);
  }, [registryOffices]);

  // --- ANALYTICS DATA GENERATION ---
  const deedsChartData = useMemo(() => {
    const statuses = ['Draft', 'Submitted', 'Under Verification', 'Registered', 'Delivered'];
    return statuses.map(status => {
      const count = deeds.filter(d => d.status === status).length;
      return {
        name: lang === 'bn' ? currentTranslations[status as keyof typeof currentTranslations] || status : status,
        value: count
      };
    });
  }, [deeds, lang]);

  const mutationPieData = useMemo(() => {
    const statuses = ['Pending', 'Submitted', 'Processing', 'Approved', 'Rejected'];
    const colors = ['#E2E8F0', '#3B82F6', '#F59E0B', '#10B981', '#EF4444'];
    return statuses.map((status, index) => {
      const count = mutations.filter(m => m.status === status).length;
      return {
        name: lang === 'bn' ? currentTranslations[status as keyof typeof currentTranslations] || status : status,
        value: count,
        color: colors[index]
      };
    }).filter(item => item.value > 0);
  }, [mutations, lang]);

  const registryDelayData = useMemo(() => {
    return registryOffices.map(office => ({
      name: lang === 'en' ? office.nameEn : office.nameBn,
      days: office.avgDelayDays
    }));
  }, [registryOffices, lang]);

  const feeGovernmentChart = useMemo(() => {
    const totalRegFee = deeds.reduce((sum, d) => sum + d.registrationFee, 0);
    const totalStampDuty = deeds.reduce((sum, d) => sum + d.stampDuty, 0);
    const totalVat = deeds.reduce((sum, d) => sum + d.vat, 0);
    return [
      { name: lang === 'en' ? 'Reg. Fee' : 'দলিল রেজিঃ ফি', amount: totalRegFee },
      { name: lang === 'en' ? 'Stamp Duty' : 'স্ট্যাম্প শুল্ক', amount: totalStampDuty },
      { name: lang === 'en' ? 'VAT Duty' : 'ভ্যাট', amount: totalVat }
    ];
  }, [deeds, lang]);

  // If role is Investor, completely block view per requirements
  if (isInvestor) {
    return (
      <div className="bg-white rounded-3xl border border-red-150 p-8 shadow-sm flex flex-col items-center justify-center text-center py-20">
        <div className="p-4 bg-red-100 text-red-600 rounded-full mb-4">
          <ShieldAlert size={48} />
        </div>
        <h2 className="text-2xl font-bold font-display text-slate-900 mb-2">{currentTranslations.noAccessTitle}</h2>
        <p className="text-slate-500 max-w-md">{currentTranslations.investorRestricted}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* HEADER CONTROLS BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute left-1/3 bottom-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono px-3 py-1 rounded-full uppercase tracking-wider font-semibold">
                PHASE 24 ACTIVATED
              </span>
              <span className="bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded-md flex items-center gap-1">
                <Users size={12} /> Role: {getRoleNameEn(currentRole)}
              </span>
            </div>
            <h1 className="text-3xl font-display font-bold tracking-tight mb-2">
              {currentTranslations.title}
            </h1>
            <p className="text-indigo-200 text-sm max-w-2xl font-sans font-light">
              {currentTranslations.subtitle}
            </p>
          </div>

          {/* PROJECT FILTER */}
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 w-full md:w-72">
            <label className="text-[10px] uppercase font-bold tracking-wider text-indigo-200 block mb-1.5">
              {currentTranslations.projectFilter}
            </label>
            <div className="flex items-center gap-2">
              <Building2 size={16} className="text-indigo-300 shrink-0" />
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full bg-slate-950/40 text-slate-100 text-xs border border-white/15 rounded-lg py-1.5 px-2 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="all" className="bg-slate-900 text-white">{currentTranslations.allProjects}</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                    {lang === 'en' ? p.nameEn : p.nameBn}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* REGISTRY NOTIFICATION STRIP FOR READ-ONLY ROLES */}
      {isAccounts && (
        <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={18} />
          <div>
            <p className="text-xs font-semibold text-amber-800">
              {currentTranslations.roleAlert}: {currentTranslations.Draft} - {getRoleNameEn(currentRole)} (Accounts)
            </p>
            <p className="text-[11px] text-amber-700 mt-0.5">
              {currentTranslations.restrictedRole}
            </p>
          </div>
        </div>
      )}

      {/* KEY PERFORMANCE INDICATORS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: TOTAL REGISTERED DEEDS */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-2xl">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-[11px] uppercase font-bold tracking-wider text-slate-400">
              {currentTranslations.totalRegistered}
            </p>
            <h3 className="text-2xl font-bold font-mono text-slate-800 mt-0.5">
              {totalRegisteredCount}
            </h3>
            <p className="text-[10px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
              <Sparkles size={10} /> Active Legal Assets
            </p>
          </div>
        </div>

        {/* KPI 2: PENDING MUTATIONS */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="p-3.5 bg-amber-50 text-amber-600 rounded-2xl">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-[11px] uppercase font-bold tracking-wider text-slate-400">
              {currentTranslations.pendingMutations}
            </p>
            <h3 className="text-2xl font-bold font-mono text-slate-800 mt-0.5">
              {pendingMutationCount}
            </h3>
            <p className="text-[10px] text-amber-600 font-medium mt-1 flex items-center gap-1">
              <History size={10} /> In-Process Registry
            </p>
          </div>
        </div>

        {/* KPI 3: OWNERSHIP TRANSFERS */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-2xl">
            <UserCheck size={24} />
          </div>
          <div>
            <p className="text-[11px] uppercase font-bold tracking-wider text-slate-400">
              {currentTranslations.completedTransfers}
            </p>
            <h3 className="text-2xl font-bold font-mono text-slate-800 mt-0.5">
              {completedTransferCount}
            </h3>
            <p className="text-[10px] text-indigo-600 font-medium mt-1 flex items-center gap-1">
              <TrendingUp size={10} /> Title Ledgers Active
            </p>
          </div>
        </div>

        {/* KPI 4: REGISTRY OFFICE AVG DELAY */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="p-3.5 bg-rose-50 text-rose-600 rounded-2xl">
            <Landmark size={24} />
          </div>
          <div>
            <p className="text-[11px] uppercase font-bold tracking-wider text-slate-400">
              {currentTranslations.registryLatency}
            </p>
            <h3 className="text-2xl font-bold font-mono text-slate-800 mt-0.5">
              {avgRegistryDelay} <span className="text-xs font-sans text-slate-400 font-normal">Days</span>
            </h3>
            <p className="text-[10px] text-rose-500 font-medium mt-1 flex items-center gap-1">
              <AlertTriangle size={10} /> Office Delay Index
            </p>
          </div>
        </div>
      </div>

      {/* TAB NAVIGATION & SEARCH CONTROLS */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Main Tab Switcher */}
          <div className="flex flex-wrap p-1 bg-slate-100 rounded-2xl w-fit gap-1">
            <button
              onClick={() => { setActiveTab('deeds'); setStatusFilter('all'); }}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${activeTab === 'deeds' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
            >
              {currentTranslations.tabDeeds}
            </button>
            <button
              onClick={() => { setActiveTab('mutations'); setStatusFilter('all'); }}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${activeTab === 'mutations' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
            >
              {currentTranslations.tabMutations}
            </button>
            <button
              onClick={() => { setActiveTab('transfers'); setStatusFilter('all'); }}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${activeTab === 'transfers' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
            >
              {currentTranslations.tabTransfers}
            </button>
            <button
              onClick={() => { setActiveTab('vault'); setStatusFilter('all'); }}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${activeTab === 'vault' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
            >
              {currentTranslations.tabVault}
            </button>
            <button
              onClick={() => { setActiveTab('reports'); setStatusFilter('all'); }}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${activeTab === 'reports' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
            >
              {currentTranslations.tabReports}
            </button>
          </div>

          {/* Quick Action Buttons (shown conditionally on roles) */}
          <div className="flex items-center gap-2 flex-wrap">
            {activeTab === 'deeds' && canCreateDeed && (
              <button
                onClick={() => setShowDeedModal(true)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs rounded-xl py-2 px-4 shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus size={14} /> {currentTranslations.registerDeedBtn}
              </button>
            )}

            {activeTab === 'mutations' && canCreateMutation && (
              <button
                onClick={() => setShowMutationModal(true)}
                className="bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs rounded-xl py-2 px-4 shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus size={14} /> {currentTranslations.newMutationBtn}
              </button>
            )}

            {activeTab === 'transfers' && canExecuteTransfer && (
              <button
                onClick={() => setShowTransferModal(true)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-xl py-2 px-4 shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus size={14} /> {currentTranslations.transferOwnerBtn}
              </button>
            )}

            {activeTab === 'vault' && (isFounder || isMD || isLegal || isLandTeam) && (
              <button
                onClick={() => setShowDocModal(true)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-100 font-medium text-xs rounded-xl py-2 px-4 shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <FileUp size={14} /> {currentTranslations.uploadDocBtn}
              </button>
            )}
          </div>
        </div>

        {/* Tab-specific contextual search and filter subbar */}
        {activeTab !== 'reports' && (
          <div className="flex flex-col sm:flex-row items-center gap-3 bg-slate-50 p-3 rounded-2xl">
            
            {/* Search */}
            <div className="relative w-full sm:flex-1">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <input
                type="text"
                placeholder={currentTranslations.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Quick Status Filters */}
            {activeTab === 'deeds' && (
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full sm:w-44 bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-indigo-500 cursor-pointer text-slate-600 font-medium"
              >
                <option value="all">All Deed Statuses</option>
                <option value="Draft">{lang === 'bn' ? 'খসড়া (Draft)' : 'Draft'}</option>
                <option value="Submitted">{lang === 'bn' ? 'দাখিলকৃত (Submitted)' : 'Submitted'}</option>
                <option value="Under Verification">{lang === 'bn' ? 'যাচাইাধীন (Under Verification)' : 'Under Verification'}</option>
                <option value="Registered">{lang === 'bn' ? 'নিবন্ধিত (Registered)' : 'Registered'}</option>
                <option value="Delivered">{lang === 'bn' ? 'সরবরাহকৃত (Delivered)' : 'Delivered'}</option>
              </select>
            )}

            {activeTab === 'mutations' && (
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full sm:w-44 bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-indigo-500 cursor-pointer text-slate-600 font-medium"
              >
                <option value="all">All Mutation Statuses</option>
                <option value="Pending">{lang === 'bn' ? 'পেন্ডিং (Pending)' : 'Pending'}</option>
                <option value="Submitted">{lang === 'bn' ? 'দাখিলকৃত (Submitted)' : 'Submitted'}</option>
                <option value="Processing">{lang === 'bn' ? 'প্রক্রিয়াধীন (Processing)' : 'Processing'}</option>
                <option value="Approved">{lang === 'bn' ? 'অনুমোদিত (Approved)' : 'Approved'}</option>
                <option value="Rejected">{lang === 'bn' ? 'প্রত্যাখ্যাত (Rejected)' : 'Rejected'}</option>
              </select>
            )}
          </div>
        )}
      </div>

      {/* PRIMARY ACTIVE TAB WORKSPACE CANVAS */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        
        {/* TAB 1: DEED REGISTRATION TRACKER */}
        {activeTab === 'deeds' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                  <th className="p-4 pl-6">{currentTranslations.deedNo}</th>
                  <th className="p-4">{currentTranslations.project}</th>
                  <th className="p-4">{currentTranslations.unitNo}</th>
                  <th className="p-4">{currentTranslations.buyer}</th>
                  <th className="p-4">{currentTranslations.regDate}</th>
                  <th className="p-4 text-right">{currentTranslations.totalCost}</th>
                  <th className="p-4 text-center">{currentTranslations.status}</th>
                  <th className="p-4 pr-6 text-right">{currentTranslations.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredDeeds.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-12 text-center text-slate-400">
                      <Landmark size={32} className="mx-auto mb-2 text-slate-300" />
                      No Deed Registrations Found
                    </td>
                  </tr>
                ) : (
                  filteredDeeds.map(deed => {
                    const totalCost = deed.registrationFee + deed.stampDuty + deed.vat;
                    return (
                      <tr key={deed.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 pl-6 font-mono font-bold text-slate-900">
                          {deed.deedNo}
                        </td>
                        <td className="p-4 font-semibold text-slate-700">
                          {lang === 'en' ? deed.projectNameEn : deed.projectNameBn}
                        </td>
                        <td className="p-4">
                          <span className="bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded text-[10px]">
                            {deed.unitNo}
                          </span>
                        </td>
                        <td className="p-4 text-slate-700 font-medium">
                          {lang === 'en' ? deed.buyerNameEn : deed.buyerNameBn}
                        </td>
                        <td className="p-4 text-slate-500">
                          {formatDate(deed.registrationDate)}
                        </td>
                        <td className="p-4 text-right font-mono font-bold text-slate-800">
                          {formatCurrency(totalCost)}
                        </td>
                        <td className="p-4 text-center">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            deed.status === 'Registered' ? 'bg-emerald-100 text-emerald-800' :
                            deed.status === 'Delivered' ? 'bg-blue-100 text-blue-800' :
                            deed.status === 'Under Verification' ? 'bg-amber-100 text-amber-800' :
                            deed.status === 'Submitted' ? 'bg-indigo-100 text-indigo-800' :
                            'bg-slate-100 text-slate-600'
                          }`}>
                            {currentTranslations[deed.status as keyof typeof currentTranslations] || deed.status}
                          </span>
                        </td>
                        <td className="p-4 pr-6 text-right space-x-1.5">
                          <button
                            onClick={() => setViewingDeedId(deed.id)}
                            className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors inline-flex cursor-pointer"
                            title="Summary details"
                          >
                            <Eye size={14} />
                          </button>

                          {/* Role-based action to change status */}
                          {canUpdateDeed && deed.status !== 'Delivered' && (
                            <select
                              value={deed.status}
                              onChange={(e) => handleUpdateDeedStatus(deed.id, e.target.value as any)}
                              className="bg-white border border-slate-200 text-[10px] py-1 px-1.5 rounded cursor-pointer font-bold text-slate-700 focus:outline-none focus:border-emerald-500"
                            >
                              <option value="Draft">Set Draft</option>
                              <option value="Submitted">Submit File</option>
                              <option value="Under Verification">Verify</option>
                              <option value="Registered">Register</option>
                              <option value="Delivered">Deliver</option>
                            </select>
                          )}

                          {canCreateDeed && (
                            <button
                              onClick={() => handleDeleteDeed(deed.id)}
                              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors inline-flex cursor-pointer"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 2: MUTATION APPLICATIONS */}
        {activeTab === 'mutations' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                  <th className="p-4 pl-6">{currentTranslations.appNo}</th>
                  <th className="p-4">{currentTranslations.project}</th>
                  <th className="p-4">{currentTranslations.unitNo}</th>
                  <th className="p-4">{currentTranslations.landOffice}</th>
                  <th className="p-4">{currentTranslations.submissionDate}</th>
                  <th className="p-4 text-right">{currentTranslations.fee}</th>
                  <th className="p-4 text-center">{currentTranslations.status}</th>
                  <th className="p-4 pr-6 text-right">{currentTranslations.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredMutations.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-12 text-center text-slate-400">
                      <Landmark size={32} className="mx-auto mb-2 text-slate-300" />
                      No Mutation Applications Found
                    </td>
                  </tr>
                ) : (
                  filteredMutations.map(mutation => {
                    return (
                      <tr key={mutation.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 pl-6 font-mono font-bold text-slate-900">
                          {mutation.applicationNo}
                        </td>
                        <td className="p-4 font-semibold text-slate-700">
                          {lang === 'en' ? mutation.projectNameEn : mutation.projectNameBn}
                        </td>
                        <td className="p-4">
                          <span className="bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded text-[10px]">
                            {mutation.unitNo}
                          </span>
                        </td>
                        <td className="p-4 text-slate-700">
                          {lang === 'en' ? mutation.landOfficeEn : mutation.landOfficeBn}
                        </td>
                        <td className="p-4 text-slate-500">
                          {formatDate(mutation.submissionDate)}
                        </td>
                        <td className="p-4 text-right font-mono font-bold text-slate-800">
                          {formatCurrency(mutation.mutationFee)}
                        </td>
                        <td className="p-4 text-center">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            mutation.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                            mutation.status === 'Processing' ? 'bg-amber-100 text-amber-800' :
                            mutation.status === 'Submitted' ? 'bg-blue-100 text-blue-800' :
                            mutation.status === 'Rejected' ? 'bg-rose-100 text-rose-800' :
                            'bg-slate-100 text-slate-600'
                          }`}>
                            {currentTranslations[mutation.status as keyof typeof currentTranslations] || mutation.status}
                          </span>
                        </td>
                        <td className="p-4 pr-6 text-right space-x-1.5">
                          <button
                            onClick={() => setViewingMutationId(mutation.id)}
                            className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors inline-flex cursor-pointer"
                            title="Case Detail"
                          >
                            <Eye size={14} />
                          </button>

                          {canUpdateMutation && (
                            <select
                              value={mutation.status}
                              onChange={(e) => handleUpdateMutationStatus(mutation.id, e.target.value as any)}
                              className="bg-white border border-slate-200 text-[10px] py-1 px-1.5 rounded cursor-pointer font-bold text-slate-700 focus:outline-none focus:border-emerald-500"
                            >
                              <option value="Pending">Pending</option>
                              <option value="Submitted">Submit Office</option>
                              <option value="Processing">Process Case</option>
                              <option value="Approved">Approve</option>
                              <option value="Rejected">Reject</option>
                            </select>
                          )}

                          {canCreateMutation && (
                            <button
                              onClick={() => handleDeleteMutation(mutation.id)}
                              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors inline-flex cursor-pointer"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 3: OWNERSHIP TRANSFER HISTORY LEDGER */}
        {activeTab === 'transfers' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                  <th className="p-4 pl-6">{currentTranslations.transferDate}</th>
                  <th className="p-4">{currentTranslations.project}</th>
                  <th className="p-4">{currentTranslations.unitNo}</th>
                  <th className="p-4">{currentTranslations.prevOwner}</th>
                  <th className="p-4">{currentTranslations.newOwner}</th>
                  <th className="p-4">{currentTranslations.transferReason}</th>
                  <th className="p-4 text-right">{currentTranslations.transferValue}</th>
                  <th className="p-4 pr-6">{currentTranslations.notes}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredTransfers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-12 text-center text-slate-400">
                      <Landmark size={32} className="mx-auto mb-2 text-slate-300" />
                      No Ownership Transfer Ledgers Found
                    </td>
                  </tr>
                ) : (
                  filteredTransfers.map(ot => {
                    return (
                      <tr key={ot.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 pl-6 text-slate-500 font-medium">
                          {formatDate(ot.transferDate)}
                        </td>
                        <td className="p-4 font-semibold text-slate-700">
                          {lang === 'en' ? ot.projectNameEn : ot.projectNameBn}
                        </td>
                        <td className="p-4">
                          <span className="bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded text-[10px]">
                            {ot.unitNo}
                          </span>
                        </td>
                        <td className="p-4 text-slate-500 font-medium line-through">
                          {lang === 'en' ? ot.previousOwnerEn : ot.previousOwnerBn}
                        </td>
                        <td className="p-4 text-emerald-700 font-bold">
                          {lang === 'en' ? ot.newOwnerEn : ot.newOwnerBn}
                        </td>
                        <td className="p-4 text-slate-600">
                          {lang === 'en' ? ot.transferReasonEn : ot.transferReasonBn}
                        </td>
                        <td className="p-4 text-right font-mono font-bold text-slate-800">
                          {formatCurrency(ot.transferValue)}
                        </td>
                        <td className="p-4 pr-6 text-slate-500 text-[11px] italic max-w-xs truncate">
                          {lang === 'en' ? ot.legalNotesEn : ot.legalNotesBn}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 4: DMS SECURE DOCUMENT VAULT */}
        {activeTab === 'vault' && (
          <div className="p-6 space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* DEED REGISTRY DOCUMENTS */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-800 flex items-center gap-1.5 border-b pb-2">
                  <FileText className="text-emerald-600" size={18} />
                  {lang === 'en' ? 'Registered Deeds Vault' : 'নিবন্ধিত দলিল ভল্ট'}
                </h4>
                <div className="space-y-3">
                  {deedDocs.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No deed documents archived.</p>
                  ) : (
                    deedDocs.map(doc => {
                      const associatedDeed = deeds.find(d => d.id === doc.deedRegistrationId);
                      return (
                        <div key={doc.id} className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-start justify-between gap-4">
                          <div className="flex gap-3">
                            <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-lg self-start">
                              <FileSpreadsheet size={18} />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-800">{lang === 'en' ? doc.titleEn : doc.titleBn}</p>
                              <p className="text-[10px] text-slate-500 mt-1">
                                File: <span className="font-mono">{doc.fileName}</span> | Size: {doc.fileSize}
                              </p>
                              <p className="text-[10px] text-slate-500">
                                Deed Ref: <span className="font-mono font-semibold">{associatedDeed?.deedNo || 'Legacy'}</span>
                              </p>
                              <div className="flex items-center gap-1.5 mt-1.5 text-[10px] text-slate-400">
                                <span>Version: v{doc.version}</span>
                                <span>•</span>
                                <span>By: {doc.uploadedBy}</span>
                                <span>•</span>
                                <span>At: {formatDate(doc.uploadedAt)}</span>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => alert(lang === 'en' ? `Downloading ${doc.fileName}...` : `${doc.fileName} ডাউনলোড হচ্ছে...`)}
                            className="text-slate-500 hover:text-emerald-600 p-1 rounded hover:bg-slate-200 transition-colors cursor-pointer shrink-0"
                            title="Secure Download"
                          >
                            <Download size={14} />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* MUTATION RECORDS DOCUMENTS */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-800 flex items-center gap-1.5 border-b pb-2">
                  <FileText className="text-amber-600" size={18} />
                  {lang === 'en' ? 'Mutation Certificates (Namjari)' : 'নামজারি খতিয়ান ভল্ট'}
                </h4>
                <div className="space-y-3">
                  {mutationDocs.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No mutation documents archived.</p>
                  ) : (
                    mutationDocs.map(doc => {
                      const associatedMut = mutations.find(m => m.id === doc.mutationApplicationId);
                      return (
                        <div key={doc.id} className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-start justify-between gap-4">
                          <div className="flex gap-3">
                            <div className="p-2.5 bg-amber-100 text-amber-800 rounded-lg self-start">
                              <FileText size={18} />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-800">{lang === 'en' ? doc.titleEn : doc.titleBn}</p>
                              <p className="text-[10px] text-slate-500 mt-1">
                                File: <span className="font-mono">{doc.fileName}</span> | Size: {doc.fileSize}
                              </p>
                              <p className="text-[10px] text-slate-500">
                                App Ref: <span className="font-mono font-semibold">{associatedMut?.applicationNo || 'Legacy'}</span>
                              </p>
                              <div className="flex items-center gap-1.5 mt-1.5 text-[10px] text-slate-400">
                                <span>Version: v{doc.version}</span>
                                <span>•</span>
                                <span>By: {doc.uploadedBy}</span>
                                <span>•</span>
                                <span>At: {formatDate(doc.uploadedAt)}</span>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => alert(lang === 'en' ? `Downloading ${doc.fileName}...` : `${doc.fileName} ডাউনলোড হচ্ছে...`)}
                            className="text-slate-500 hover:text-amber-600 p-1 rounded hover:bg-slate-200 transition-colors cursor-pointer shrink-0"
                            title="Secure Download"
                          >
                            <Download size={14} />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 5: EXECUTIVE REPORTING & INTUITION ANALYTICS */}
        {activeTab === 'reports' && (
          <div className="p-6 space-y-8">
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* REPORT A: DEED REGISTRATION BREAKDOWN */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider text-slate-400">
                  {currentTranslations.regSummary}
                </h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={deedsChartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#10B981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* REPORT B: MUTATION STAGES PIE */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider text-slate-400">
                  {currentTranslations.mutationProgress}
                </h4>
                <div className="h-64 flex flex-col sm:flex-row items-center justify-around">
                  {mutationPieData.length === 0 ? (
                    <p className="text-xs text-slate-400">No data available</p>
                  ) : (
                    <>
                      <div className="h-full w-full sm:w-1/2">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={mutationPieData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {mutationPieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="space-y-1 text-xs sm:w-1/2">
                        {mutationPieData.map((item, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                            <span className="text-slate-600 font-medium">{item.name}:</span>
                            <span className="font-bold text-slate-800 font-mono">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* REPORT C: COA GOVERNMENT FEE DISTRIBUTION */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider text-slate-400">
                  {currentTranslations.feeDistribution}
                </h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={feeGovernmentChart}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
                      <Area type="monotone" dataKey="amount" stroke="#4F46E5" fill="#EEF2FF" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* REPORT D: REGISTRY OFFICE DELAYS (LATENCY BAR) */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider text-slate-400">
                  {currentTranslations.registryPerf}
                </h4>
                <p className="text-[10px] text-slate-400 italic mt-0.5">{currentTranslations.latencyLabel}</p>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={registryDelayData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 9 }} />
                      <Tooltip />
                      <Bar dataKey="days" fill="#EF4444" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>

      {/* =======================================================================
          MODALS & DETAILED DIALOGS (WITH WHITE-SCREEN EXCEPTION PREVENTION)
          ======================================================================= */}
      
      {/* MODAL 1: REGISTER NEW DEED */}
      {showDeedModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl border border-slate-100 max-w-xl w-full p-6 shadow-2xl relative"
          >
            <button 
              onClick={() => setShowDeedModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X size={20} />
            </button>
            <h3 className="text-lg font-bold font-display text-slate-900 mb-4 flex items-center gap-2">
              <Landmark className="text-emerald-600" size={20} />
              {currentTranslations.registerDeedBtn}
            </h3>

            <form onSubmit={handleCreateDeed} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Deed Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 5420/2026"
                    value={newDeed.deedNo || ''}
                    onChange={(e) => setNewDeed({...newDeed, deedNo: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Select Project Unit *</label>
                  <select
                    required
                    value={newDeed.unitId || ''}
                    onChange={(e) => {
                      const unitSelected = units.find(u => u.id === e.target.value);
                      setNewDeed({
                        ...newDeed, 
                        unitId: e.target.value,
                        // Pre-populate if buyer details are available
                        buyerNameEn: unitSelected?.status === 'Sold' ? 'Tariqul Islam Rubel' : 'M. H. Hasan',
                        buyerNameBn: unitSelected?.status === 'Sold' ? 'তারিকুল ইসলাম রুবেল' : 'এম. এইচ. হাসান'
                      });
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 cursor-pointer"
                  >
                    <option value="">Select Apartment/Plot</option>
                    {units.map(u => {
                      const proj = projects.find(p => p.id === u.projectId);
                      return (
                        <option key={u.id} value={u.id}>
                          {proj?.nameEn} - Unit {u.unitNo} ({u.status})
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Registration Date</label>
                  <input
                    type="date"
                    value={newDeed.registrationDate || ''}
                    onChange={(e) => setNewDeed({...newDeed, registrationDate: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Sub-Registry Office</label>
                  <select
                    value={newDeed.registryOfficeId || 'ro-1'}
                    onChange={(e) => setNewDeed({...newDeed, registryOfficeId: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 cursor-pointer"
                  >
                    {registryOffices.map(ro => (
                      <option key={ro.id} value={ro.id}>
                        {lang === 'en' ? ro.nameEn : ro.nameBn}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Buyer Name (English)</label>
                  <input
                    type="text"
                    placeholder="Buyer Name En"
                    value={newDeed.buyerNameEn || ''}
                    onChange={(e) => setNewDeed({...newDeed, buyerNameEn: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Buyer Name (Bangla)</label>
                  <input
                    type="text"
                    placeholder="Buyer Name Bn"
                    value={newDeed.buyerNameBn || ''}
                    onChange={(e) => setNewDeed({...newDeed, buyerNameBn: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Registration Fee (BDT)</label>
                  <input
                    type="number"
                    value={newDeed.registrationFee || 0}
                    onChange={(e) => setNewDeed({...newDeed, registrationFee: Number(e.target.value)})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Stamp Duty (BDT)</label>
                  <input
                    type="number"
                    value={newDeed.stampDuty || 0}
                    onChange={(e) => setNewDeed({...newDeed, stampDuty: Number(e.target.value)})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">VAT Duty (BDT)</label>
                  <input
                    type="number"
                    value={newDeed.vat || 0}
                    onChange={(e) => setNewDeed({...newDeed, vat: Number(e.target.value)})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Remarks (English)</label>
                  <input
                    type="text"
                    placeholder="e.g. Cleared title verification"
                    value={newDeed.remarksEn || ''}
                    onChange={(e) => setNewDeed({...newDeed, remarksEn: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Remarks (Bangla)</label>
                  <input
                    type="text"
                    placeholder="মন্তব্য (বাংলা)"
                    value={newDeed.remarksBn || ''}
                    onChange={(e) => setNewDeed({...newDeed, remarksBn: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t pt-4">
                <button
                  type="button"
                  onClick={() => setShowDeedModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-lg py-2 px-4 cursor-pointer"
                >
                  {currentTranslations.cancel}
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg py-2 px-4 cursor-pointer"
                >
                  {currentTranslations.save}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* MODAL 2: NEW MUTATION APPLICATION */}
      {showMutationModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl border border-slate-100 max-w-xl w-full p-6 shadow-2xl relative"
          >
            <button 
              onClick={() => setShowMutationModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X size={20} />
            </button>
            <h3 className="text-lg font-bold font-display text-slate-900 mb-4 flex items-center gap-2">
              <Landmark className="text-amber-600" size={20} />
              {currentTranslations.newMutationBtn}
            </h3>

            <form onSubmit={handleCreateMutation} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Application No *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MUT-2026-992"
                    value={newMutation.applicationNo || ''}
                    onChange={(e) => setNewMutation({...newMutation, applicationNo: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Select Apartment Unit *</label>
                  <select
                    required
                    value={newMutation.unitId || ''}
                    onChange={(e) => {
                      const unitSelected = units.find(u => u.id === e.target.value);
                      setNewMutation({
                        ...newMutation, 
                        unitId: e.target.value,
                        buyerNameEn: unitSelected?.status === 'Sold' ? 'Tariqul Islam Rubel' : 'M. H. Hasan',
                        buyerNameBn: unitSelected?.status === 'Sold' ? 'তারিকুল ইসলাম রুবেল' : 'এম. এইচ. হাসান'
                      });
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 cursor-pointer"
                  >
                    <option value="">Select Apartment/Plot</option>
                    {units.map(u => (
                      <option key={u.id} value={u.id}>
                        Unit {u.unitNo} ({u.status})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Land Office (English)</label>
                  <input
                    type="text"
                    placeholder="e.g. Uttara Land Office"
                    value={newMutation.landOfficeEn || ''}
                    onChange={(e) => setNewMutation({...newMutation, landOfficeEn: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Land Office (Bangla)</label>
                  <input
                    type="text"
                    placeholder="যেমনঃ উত্তরা ভূমি অফিস"
                    value={newMutation.landOfficeBn || ''}
                    onChange={(e) => setNewMutation({...newMutation, landOfficeBn: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Submission Date</label>
                  <input
                    type="date"
                    value={newMutation.submissionDate || ''}
                    onChange={(e) => setNewMutation({...newMutation, submissionDate: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Mutation Fee (BDT)</label>
                  <input
                    type="number"
                    value={newMutation.mutationFee || 1150}
                    onChange={(e) => setNewMutation({...newMutation, mutationFee: Number(e.target.value)})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Applicant (English)</label>
                  <input
                    type="text"
                    value={newMutation.buyerNameEn || ''}
                    onChange={(e) => setNewMutation({...newMutation, buyerNameEn: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Applicant (Bangla)</label>
                  <input
                    type="text"
                    value={newMutation.buyerNameBn || ''}
                    onChange={(e) => setNewMutation({...newMutation, buyerNameBn: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t pt-4">
                <button
                  type="button"
                  onClick={() => setShowMutationModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-lg py-2 px-4 cursor-pointer"
                >
                  {currentTranslations.cancel}
                </button>
                <button
                  type="submit"
                  className="bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg py-2 px-4 cursor-pointer"
                >
                  {currentTranslations.save}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* MODAL 3: EXECUTE OWNERSHIP TRANSFER LEDGER */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl border border-slate-100 max-w-xl w-full p-6 shadow-2xl relative"
          >
            <button 
              onClick={() => setShowTransferModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X size={20} />
            </button>
            <h3 className="text-lg font-bold font-display text-slate-900 mb-4 flex items-center gap-2">
              <UserCheck className="text-indigo-600" size={20} />
              {currentTranslations.transferOwnerBtn}
            </h3>

            <form onSubmit={handleCreateTransfer} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Select Apartment Unit *</label>
                <select
                  required
                  value={newTransfer.unitId || ''}
                  onChange={(e) => {
                    const selectedUnit = units.find(u => u.id === e.target.value);
                    setNewTransfer({
                      ...newTransfer, 
                      unitId: e.target.value,
                      previousOwnerEn: 'Al Kaswa Holdings Limited',
                      previousOwnerBn: 'আল কাসওয়া হোল্ডিংস লিমিটেড',
                      transferValue: selectedUnit ? (selectedUnit.sizeSft * selectedUnit.pricePerSft) : 0
                    });
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 cursor-pointer"
                >
                  <option value="">Select Apartment/Plot</option>
                  {units.map(u => (
                    <option key={u.id} value={u.id}>
                      Unit {u.unitNo} ({u.status})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Previous Owner (English)</label>
                  <input
                    type="text"
                    required
                    value={newTransfer.previousOwnerEn || ''}
                    onChange={(e) => setNewTransfer({...newTransfer, previousOwnerEn: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Previous Owner (Bangla)</label>
                  <input
                    type="text"
                    value={newTransfer.previousOwnerBn || ''}
                    onChange={(e) => setNewTransfer({...newTransfer, previousOwnerBn: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">New Owner (English) *</label>
                  <input
                    type="text"
                    required
                    placeholder="New Owner Full Name"
                    value={newTransfer.newOwnerEn || ''}
                    onChange={(e) => setNewTransfer({...newTransfer, newOwnerEn: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">New Owner (Bangla)</label>
                  <input
                    type="text"
                    placeholder="নতুন মালিকের সম্পূর্ণ নাম"
                    value={newTransfer.newOwnerBn || ''}
                    onChange={(e) => setNewTransfer({...newTransfer, newOwnerBn: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Transfer Date</label>
                  <input
                    type="date"
                    value={newTransfer.transferDate || ''}
                    onChange={(e) => setNewTransfer({...newTransfer, transferDate: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Transfer Value (BDT)</label>
                  <input
                    type="number"
                    value={newTransfer.transferValue || 0}
                    onChange={(e) => setNewTransfer({...newTransfer, transferValue: Number(e.target.value)})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Legal Notes (English)</label>
                  <textarea
                    rows={2}
                    placeholder="Legal reasons, registry details..."
                    value={newTransfer.legalNotesEn || ''}
                    onChange={(e) => setNewTransfer({...newTransfer, legalNotesEn: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Legal Notes (Bangla)</label>
                  <textarea
                    rows={2}
                    placeholder="আইনি খতিয়ান, দলিল বিবরণী..."
                    value={newTransfer.legalNotesBn || ''}
                    onChange={(e) => setNewTransfer({...newTransfer, legalNotesBn: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t pt-4">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-lg py-2 px-4 cursor-pointer"
                >
                  {currentTranslations.cancel}
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg py-2 px-4 cursor-pointer"
                >
                  {currentTranslations.save}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* MODAL 4: VAULT SECURE DOCUMENT */}
      {showDocModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl border border-slate-100 max-w-xl w-full p-6 shadow-2xl relative"
          >
            <button 
              onClick={() => setShowDocModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X size={20} />
            </button>
            <h3 className="text-lg font-bold font-display text-slate-900 mb-4 flex items-center gap-2">
              <FileUp className="text-slate-800" size={20} />
              {currentTranslations.uploadDocBtn}
            </h3>

            <form onSubmit={handleCreateDocument} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Association Registry Type</label>
                  <select
                    value={newDoc.associationType}
                    onChange={(e) => setNewDoc({...newDoc, associationType: e.target.value as any, associationId: ''})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 cursor-pointer"
                  >
                    <option value="deed">Deed Registration File</option>
                    <option value="mutation">Mutation Case File</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Select Association Record *</label>
                  <select
                    required
                    value={newDoc.associationId}
                    onChange={(e) => setNewDoc({...newDoc, associationId: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 cursor-pointer"
                  >
                    <option value="">Select Record</option>
                    {newDoc.associationType === 'deed' ? (
                      deeds.map(d => (
                        <option key={d.id} value={d.id}>Deed: {d.deedNo} ({d.unitNo})</option>
                      ))
                    ) : (
                      mutations.map(m => (
                        <option key={m.id} value={m.id}>Mutation application: {m.applicationNo} ({m.unitNo})</option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Document Title (English) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Registered Certified Sale Deed"
                    value={newDoc.titleEn}
                    onChange={(e) => setNewDoc({...newDoc, titleEn: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Document Title (Bangla)</label>
                  <input
                    type="text"
                    placeholder="যেমনঃ মূল দলিলের স্ক্যান কপি"
                    value={newDoc.titleBn}
                    onChange={(e) => setNewDoc({...newDoc, titleBn: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Document Type Classification</label>
                  <select
                    value={newDoc.documentType}
                    onChange={(e) => setNewDoc({...newDoc, documentType: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 cursor-pointer"
                  >
                    {newDoc.associationType === 'deed' ? (
                      <>
                        <option value="Registered Deed">Registered Deed</option>
                        <option value="Stamp Duty Receipt">Stamp Duty Receipt</option>
                        <option value="POA Document">POA Document</option>
                        <option value="Registration Receipt">Registration Receipt</option>
                        <option value="Other">Other</option>
                      </>
                    ) : (
                      <>
                        <option value="Mutation Certificate">Mutation Certificate</option>
                        <option value="Tax Clearance">Tax Clearance</option>
                        <option value="Khajna Receipt">Khajna Receipt</option>
                        <option value="DCR">DCR</option>
                        <option value="Other">Other</option>
                      </>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Simulated File Name</label>
                  <input
                    type="text"
                    placeholder="e.g. deed_copy.pdf"
                    value={newDoc.fileName}
                    onChange={(e) => setNewDoc({...newDoc, fileName: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t pt-4">
                <button
                  type="button"
                  onClick={() => setShowDocModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-lg py-2 px-4 cursor-pointer"
                >
                  {currentTranslations.cancel}
                </button>
                <button
                  type="submit"
                  className="bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg py-2 px-4 cursor-pointer"
                >
                  {currentTranslations.save}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* DETAIL MODAL A: DEED SUMMARY VIEW */}
      {viewingDeedId && (
        (() => {
          const d = deeds.find(item => item.id === viewingDeedId);
          if (!d) return null;
          const totalCost = d.registrationFee + d.stampDuty + d.vat;
          const registry = registryOffices.find(ro => ro.id === d.registryOfficeId);
          return (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-3xl border border-slate-100 max-w-lg w-full p-6 shadow-2xl relative"
              >
                <button 
                  onClick={() => setViewingDeedId(null)}
                  className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X size={20} />
                </button>
                <h3 className="text-lg font-bold font-display text-slate-900 mb-4 flex items-center gap-2">
                  <Landmark className="text-emerald-600" size={20} />
                  {lang === 'en' ? 'Certified Deed Summary' : 'দলিল সারসংক্ষেপ বিবরণ'}
                </h3>
                
                <div className="space-y-4 text-xs font-sans text-slate-600">
                  <div className="bg-slate-50 p-4 rounded-xl space-y-2">
                    <p className="flex justify-between border-b pb-1">
                      <span className="font-semibold">{currentTranslations.deedNo}:</span>
                      <span className="font-mono font-bold text-slate-900">{d.deedNo}</span>
                    </p>
                    <p className="flex justify-between border-b pb-1">
                      <span className="font-semibold">{currentTranslations.project}:</span>
                      <span className="font-bold text-slate-800">{lang === 'en' ? d.projectNameEn : d.projectNameBn}</span>
                    </p>
                    <p className="flex justify-between border-b pb-1">
                      <span className="font-semibold">{currentTranslations.unitNo}:</span>
                      <span className="bg-indigo-50 text-indigo-700 font-bold px-1.5 py-0.5 rounded">{d.unitNo}</span>
                    </p>
                    <p className="flex justify-between border-b pb-1">
                      <span className="font-semibold">{currentTranslations.buyer}:</span>
                      <span className="font-bold text-slate-800">{lang === 'en' ? d.buyerNameEn : d.buyerNameBn}</span>
                    </p>
                    <p className="flex justify-between border-b pb-1">
                      <span className="font-semibold">{currentTranslations.seller}:</span>
                      <span>{lang === 'en' ? d.sellerNameEn : d.sellerNameBn}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="font-semibold">{currentTranslations.registryOffice}:</span>
                      <span>{lang === 'en' ? registry?.nameEn : registry?.nameBn}</span>
                    </p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl space-y-2">
                    <h5 className="font-bold text-slate-700 border-b pb-1">{lang === 'en' ? 'Government Duties Breakdown' : 'সরকারি শুল্ক বিবরণী'}</h5>
                    <p className="flex justify-between">
                      <span>{currentTranslations.regFee}:</span>
                      <span className="font-mono font-semibold">{formatCurrency(d.registrationFee)}</span>
                    </p>
                    <p className="flex justify-between">
                      <span>{currentTranslations.stampDuty}:</span>
                      <span className="font-mono font-semibold">{formatCurrency(d.stampDuty)}</span>
                    </p>
                    <p className="flex justify-between">
                      <span>{currentTranslations.vat}:</span>
                      <span className="font-mono font-semibold">{formatCurrency(d.vat)}</span>
                    </p>
                    <p className="flex justify-between border-t pt-1 font-bold text-slate-800">
                      <span>{currentTranslations.totalCost}:</span>
                      <span className="font-mono text-emerald-700">{formatCurrency(totalCost)}</span>
                    </p>
                  </div>

                  {d.remarksEn && (
                    <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl">
                      <p className="font-bold text-indigo-950 mb-0.5">{lang === 'en' ? 'Official Notes:' : 'দাপ্তরিক মন্তব্যঃ'}</p>
                      <p className="italic text-slate-600">{lang === 'en' ? d.remarksEn : d.remarksBn}</p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 border-t pt-4 mt-6">
                  <button
                    onClick={() => setViewingDeedId(null)}
                    className="bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg py-2 px-4 cursor-pointer"
                  >
                    {currentTranslations.close}
                  </button>
                </div>
              </motion.div>
            </div>
          );
        })()
      )}

      {/* DETAIL MODAL B: MUTATION SUMMARY VIEW */}
      {viewingMutationId && (
        (() => {
          const m = mutations.find(item => item.id === viewingMutationId);
          if (!m) return null;
          return (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-3xl border border-slate-100 max-w-lg w-full p-6 shadow-2xl relative"
              >
                <button 
                  onClick={() => setViewingMutationId(null)}
                  className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X size={20} />
                </button>
                <h3 className="text-lg font-bold font-display text-slate-900 mb-4 flex items-center gap-2">
                  <Landmark className="text-amber-600" size={20} />
                  {lang === 'en' ? 'Mutation Case Details' : 'নামজারি মামলা বিবরণ'}
                </h3>
                
                <div className="space-y-4 text-xs font-sans text-slate-600">
                  <div className="bg-slate-50 p-4 rounded-xl space-y-2">
                    <p className="flex justify-between border-b pb-1">
                      <span className="font-semibold">{currentTranslations.appNo}:</span>
                      <span className="font-mono font-bold text-slate-900">{m.applicationNo}</span>
                    </p>
                    <p className="flex justify-between border-b pb-1">
                      <span className="font-semibold">{currentTranslations.project}:</span>
                      <span className="font-bold text-slate-800">{lang === 'en' ? m.projectNameEn : m.projectNameBn}</span>
                    </p>
                    <p className="flex justify-between border-b pb-1">
                      <span className="font-semibold">{currentTranslations.unitNo}:</span>
                      <span className="bg-indigo-50 text-indigo-700 font-bold px-1.5 py-0.5 rounded">{m.unitNo}</span>
                    </p>
                    <p className="flex justify-between border-b pb-1">
                      <span className="font-semibold">{currentTranslations.buyer}:</span>
                      <span className="font-bold text-slate-800">{lang === 'en' ? m.buyerNameEn : m.buyerNameBn}</span>
                    </p>
                    <p className="flex justify-between border-b pb-1">
                      <span className="font-semibold">{currentTranslations.landOffice}:</span>
                      <span>{lang === 'en' ? m.landOfficeEn : m.landOfficeBn}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="font-semibold">{currentTranslations.submissionDate}:</span>
                      <span>{formatDate(m.submissionDate)}</span>
                    </p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl space-y-2">
                    <h5 className="font-bold text-slate-700 border-b pb-1">{lang === 'en' ? 'Land Revenue Circle Tracking' : 'ভূমি সার্কেল ট্র্যাকিং'}</h5>
                    <p className="flex justify-between">
                      <span>{currentTranslations.fee}:</span>
                      <span className="font-mono font-semibold">{formatCurrency(m.mutationFee)}</span>
                    </p>
                    <p className="flex justify-between">
                      <span>{currentTranslations.caseNo}:</span>
                      <span className="font-mono font-bold text-slate-800">{m.caseNumber || 'TBD'}</span>
                    </p>
                    <p className="flex justify-between">
                      <span>{currentTranslations.hearingDate}:</span>
                      <span>{m.hearingDate ? formatDate(m.hearingDate) : 'Not Scheduled'}</span>
                    </p>
                  </div>

                  {m.rejectedReasonEn && (
                    <div className="p-3 bg-red-50 border border-red-100 rounded-xl">
                      <p className="font-bold text-red-950 mb-0.5">{currentTranslations.rejectionReason}:</p>
                      <p className="text-red-700">{lang === 'en' ? m.rejectedReasonEn : m.rejectedReasonBn}</p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 border-t pt-4 mt-6">
                  <button
                    onClick={() => setViewingMutationId(null)}
                    className="bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg py-2 px-4 cursor-pointer"
                  >
                    {currentTranslations.close}
                  </button>
                </div>
              </motion.div>
            </div>
          );
        })()
      )}

    </div>
  );
}
