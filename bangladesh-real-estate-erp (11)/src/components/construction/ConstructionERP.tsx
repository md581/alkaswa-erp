/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  HardHat, 
  ShoppingBag, 
  Users, 
  Activity, 
  DollarSign, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Building, 
  Clock, 
  Printer, 
  Eye, 
  RefreshCw, 
  Sliders, 
  Calendar, 
  Sparkles, 
  Info,
  Check,
  AlertCircle
} from 'lucide-react';
import { dbService } from '../../db/dbService';
import { 
  ConstructionBOQ, 
  BOQItem, 
  BOQRevision, 
  Vendor, 
  PurchaseOrder, 
  MaterialReceipt, 
  InventoryLedger, 
  SiteDailyLog, 
  ProjectProgressTracker, 
  ContractorBill,
  Project,
  AuditLog
} from '../../types';
import { formatCurrency, translations } from '../../utils/translations';

interface ConstructionERPProps {
  lang: 'en' | 'bn';
  initialTab?: string;
}

export default function ConstructionERP({ lang, initialTab = 'dashboard' }: ConstructionERPProps) {
  // Navigation Tabs matching UI Menu structure requested:
  // Dashboard, BOQ, Procurement, Vendors, Inventory, Site Logs, Progress Tracking, Contractor Bills, Reports
  const [activeTab, setActiveTab] = useState(initialTab);

  // States
  const [projects, setProjects] = useState<Project[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [boqs, setBoqs] = useState<ConstructionBOQ[]>([]);
  const [boqItems, setBoqItems] = useState<BOQItem[]>([]);
  const [boqRevisions, setBoqRevisions] = useState<BOQRevision[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [materialReceipts, setMaterialReceipts] = useState<MaterialReceipt[]>([]);
  const [inventoryLedger, setInventoryLedger] = useState<InventoryLedger[]>([]);
  const [siteDailyLogs, setSiteDailyLogs] = useState<SiteDailyLog[]>([]);
  const [projectProgress, setProjectProgress] = useState<ProjectProgressTracker[]>([]);
  const [contractorBills, setContractorBills] = useState<ContractorBill[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Selected Project filter
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');

  // Search/Filter states
  const [searchQuery, setSearchQuery] = useState('');

  // Notification Banner
  const [banner, setBanner] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  // Hydrate Data from dbService
  const loadData = () => {
    setProjects(dbService.projects.getAll());
    setVendors(dbService.vendors.getAll());
    setBoqs(dbService.constructionBOQs.getAll());
    setBoqItems(dbService.boqItems.getAll());
    setBoqRevisions(dbService.boqRevisions.getAll());
    setPurchaseOrders(dbService.purchaseOrders.getAll());
    setMaterialReceipts(dbService.materialReceipts.getAll());
    setInventoryLedger(dbService.inventoryLedger.getAll());
    setSiteDailyLogs(dbService.siteDailyLogs.getAll());
    setProjectProgress(dbService.projectProgress.getAll());
    setContractorBills(dbService.contractorBills.getAll());
    setAuditLogs(dbService.auditLogs.getAll().filter(log => log.tableName?.startsWith('construction_') || log.tableName?.startsWith('erp_daily_')));
  };

  useEffect(() => {
    loadData();
  }, []);

  const triggerBanner = (msg: string, type: 'success' | 'info' = 'success') => {
    setBanner({ message: msg, type });
    setTimeout(() => setBanner(null), 5000);
  };

  const createAudit = (actionEn: string, actionBn: string, table: string) => {
    const timestamp = new Date().toISOString();
    const newLog: AuditLog = {
      id: `audit-${Date.now()}`,
      userId: 'eng1',
      userName: 'Engr. Sajjad Hossain',
      userRole: 'ENG',
      action: actionEn,
      tableName: table,
      detailsEn: actionEn,
      detailsBn: actionBn,
      createdAt: timestamp
    };
    dbService.auditLogs.create(newLog);
    loadData();
  };

  // 1. BOQ ACTIONS
  const handleAddBOQItem = (item: Omit<BOQItem, 'id' | 'totalCost' | 'actualQuantityUsed' | 'actualCost'>) => {
    const totalCost = item.quantity * item.rate;
    const newItem: BOQItem = {
      id: `boqi-${Date.now()}`,
      ...item,
      totalCost,
      actualQuantityUsed: 0,
      actualCost: 0
    };
    dbService.boqItems.create(newItem);
    
    // Update BOQ total estimated cost
    const boq = boqs.find(b => b.id === item.boqId);
    if (boq) {
      const updatedBOQ = {
        ...boq,
        totalEstimatedCost: boq.totalEstimatedCost + totalCost
      };
      dbService.constructionBOQs.update(boq.id, updatedBOQ);
    }

    createAudit(
      `Added BOQ Item "${item.materialName}" under BOQ`,
      `বিওকিউ-র অধীনে নতুন আইটেম "${item.materialName}" যোগ করা হয়েছে`,
      'construction_boq_items'
    );
    triggerBanner(lang === 'en' ? 'BOQ Item added successfully!' : 'বিওকিউ আইটেম সফলভাবে যোগ করা হয়েছে!');
  };

  const handleReviseBOQ = (boqId: string, reason: string, newTotalCost: number) => {
    const boq = boqs.find(b => b.id === boqId);
    if (!boq) return;

    const prevCost = boq.totalEstimatedCost;
    const revisionNo = boqRevisions.filter(r => r.boqId === boqId).length + 1;

    const revision: BOQRevision = {
      id: `boqr-${Date.now()}`,
      boqId,
      revisionNo,
      dateOfRevision: new Date().toISOString().split('T')[0],
      changedBy: 'Engr. Sajjad Hossain',
      reason,
      previousCost: prevCost,
      newCost: newTotalCost
    };
    dbService.boqRevisions.create(revision);

    // Update active BOQ cost
    dbService.constructionBOQs.update(boqId, {
      ...boq,
      totalEstimatedCost: newTotalCost,
      status: 'Under Revision'
    });

    createAudit(
      `Revised BOQ Code ${boq.boqCode} - Revision #${revisionNo}`,
      `বিওকিউ কোড ${boq.boqCode} সংশোধন করা হয়েছে - সংস্করণ নং #${revisionNo}`,
      'construction_boq_revisions'
    );
    triggerBanner(lang === 'en' ? 'BOQ Revised successfully!' : 'বিওকিউ সফলভাবে সংশোধন করা হয়েছে!');
  };

  // 2. PROCUREMENT ACTIONS
  const handleCreatePO = (po: Omit<PurchaseOrder, 'id' | 'poNumber' | 'status' | 'createdAt' | 'totalAmount'>) => {
    const totalAmount = po.quantity * po.rate;
    const poNumber = `PO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newPO: PurchaseOrder = {
      id: `po-${Date.now()}`,
      poNumber,
      totalAmount,
      status: 'Draft',
      createdAt: new Date().toISOString().split('T')[0],
      ...po
    };
    dbService.purchaseOrders.create(newPO);

    createAudit(
      `Created Purchase Order Draft ${poNumber} for ${po.vendorName}`,
      `সরবরাহকারী ${po.vendorName} এর জন্য ক্রয় আদেশ খসড়া ${poNumber} তৈরি করা হয়েছে`,
      'construction_purchase_orders'
    );
    triggerBanner(lang === 'en' ? `Purchase Order ${poNumber} Draft Created!` : `ক্রয় আদেশ খসড়া ${poNumber} তৈরি হয়েছে!`);
  };

  const handleApprovePO = (poId: string) => {
    const po = purchaseOrders.find(p => p.id === poId);
    if (!po) return;

    dbService.purchaseOrders.update(poId, { ...po, status: 'Approved' });

    createAudit(
      `Approved Purchase Order ${po.poNumber}`,
      `ক্রয় আদেশ ${po.poNumber} অনুমোদন করা হয়েছে`,
      'construction_purchase_orders'
    );
    triggerBanner(lang === 'en' ? `PO ${po.poNumber} Approved!` : `পিও ${po.poNumber} অনুমোদিত হয়েছে!`);
  };

  // 3. MATERIAL RECEIPT (MRN) ACTION (Updates Central Inventory!)
  const handleCreateReceipt = (receipt: Omit<MaterialReceipt, 'id' | 'receiptNo' | 'receivedDate' | 'inspectedBy'>) => {
    const receiptNo = `MRN-${Date.now().toString().slice(-6)}`;
    const receivedDate = new Date().toISOString().split('T')[0];
    
    const newReceipt: MaterialReceipt = {
      id: `mrn-${Date.now()}`,
      receiptNo,
      receivedDate,
      inspectedBy: 'Engr. Sajjad Hossain',
      ...receipt
    };
    dbService.materialReceipts.create(newReceipt);

    // Dynamic Inventory Ledger updates!
    const inventoryItem = inventoryLedger.find(
      i => i.projectId === receipt.projectId && i.materialName.toLowerCase() === receipt.materialName.toLowerCase()
    );

    if (inventoryItem) {
      dbService.inventoryLedger.update(inventoryItem.id, {
        ...inventoryItem,
        available: inventoryItem.available + receipt.receivedQuantity,
        lastUpdated: receivedDate
      });
    } else {
      // Create new inventory line
      const newLedger: InventoryLedger = {
        id: `invl-${Date.now()}`,
        projectId: receipt.projectId,
        projectName: receipt.projectName,
        materialName: receipt.materialName,
        category: receipt.category as any,
        unit: 'Pcs',
        available: receipt.receivedQuantity,
        reserved: 0,
        issued: 0,
        damaged: 0,
        lastUpdated: receivedDate
      };
      dbService.inventoryLedger.create(newLedger);
    }

    // Automatically update the Purchase Order status to 'Delivered'
    const po = purchaseOrders.find(p => p.poNumber === receipt.poNumber);
    if (po) {
      dbService.purchaseOrders.update(po.id, { ...po, status: 'Delivered' });
    }

    createAudit(
      `Received ${receipt.receivedQuantity} units of ${receipt.materialName} under MRN ${receiptNo}`,
      `এমআরএন ${receiptNo} এর অধীনে ${receipt.receivedQuantity} ইউনিট ${receipt.materialName} গ্রহণ করা হয়েছে`,
      'construction_material_receipts'
    );
    triggerBanner(lang === 'en' ? `Goods Received under ${receiptNo}! Central Stock updated.` : `কাঁচামাল গ্রহণ সফল (${receiptNo})! কেন্দ্রীয় স্টক আপডেট করা হয়েছে।`);
  };

  // 4. VENDOR ACTIONS
  const handleAddVendor = (vendor: Omit<Vendor, 'id' | 'outstandingPayable'>) => {
    const newVendor: Vendor = {
      id: `vend-${Date.now()}`,
      outstandingPayable: 0,
      ...vendor
    };
    dbService.vendors.create(newVendor);

    createAudit(
      `Registered Vendor "${vendor.vendorName}"`,
      `নতুন সরবরাহকারী "${vendor.vendorName}" নথিভুক্ত করা হয়েছে`,
      'construction_vendors'
    );
    triggerBanner(lang === 'en' ? 'Vendor registered successfully!' : 'সরবরাহকারী সফলভাবে নথিভুক্ত করা হয়েছে!');
  };

  // 5. DAILY SITE LOG ACTIONS
  const handleAddDailyLog = (log: Omit<SiteDailyLog, 'id' | 'logDate' | 'recordedBy'>) => {
    const newLog: SiteDailyLog = {
      id: `slog-${Date.now()}`,
      logDate: new Date().toISOString().split('T')[0],
      recordedBy: 'Engr. Sajjad Hossain',
      ...log
    };
    dbService.siteDailyLogs.create(newLog);

    createAudit(
      `Submitted Daily Site Log for ${log.projectName}`,
      `${log.projectName} এর জন্য দৈনিক কাজের বিবরণী দাখিল করা হয়েছে`,
      'construction_site_daily_logs'
    );
    triggerBanner(lang === 'en' ? 'Daily Site Log submitted!' : 'দৈনিক সাইট লগ দাখিল করা হয়েছে!');
  };

  // 6. SITE PROGRESS TRACKER ACTIONS
  const handleUpdateProgress = (progressId: string, actual: number, delay: number, phase: string) => {
    const prog = projectProgress.find(p => p.id === progressId);
    if (!prog) return;

    dbService.projectProgress.update(progressId, {
      ...prog,
      actualPercent: actual,
      delayPercent: delay,
      completionPercent: actual
    });

    createAudit(
      `Updated site progress for phase ${phase} to ${actual}%`,
      `সাইট প্রোগ্রেস ধাপ ${phase} আপডেট করা হয়েছে ${actual}% এ`,
      'construction_project_progress'
    );
    triggerBanner(lang === 'en' ? 'Progress tracker updated!' : 'অগ্রগতি ট্র্যাকার আপডেট করা হয়েছে!');
  };

  // 7. CONTRACTOR BILLING ACTIONS (With Retention Deductions)
  const handleCertifyBill = (billId: string) => {
    const bill = contractorBills.find(b => b.id === billId);
    if (!bill) return;

    dbService.contractorBills.update(billId, {
      ...bill,
      status: 'Certified',
      certifiedBy: 'Engr. Sajjad Hossain'
    });

    createAudit(
      `Certified Contractor Bill ${bill.billNo} with 10% retention of ${formatCurrency(bill.retentionAmount, lang)}`,
      `কন্ট্রাক্টর বিল ${bill.billNo} সার্টিফাই করা হয়েছে (১০% রিটেনশন মানি: ${formatCurrency(bill.retentionAmount, lang)})`,
      'construction_contractor_bills'
    );
    triggerBanner(lang === 'en' ? 'Contractor Bill Certified!' : 'কন্ট্রাক্টর বিল সার্টিফাই করা হয়েছে!');
  };

  const handleApproveBill = (billId: string) => {
    const bill = contractorBills.find(b => b.id === billId);
    if (!bill) return;

    dbService.contractorBills.update(billId, {
      ...bill,
      status: 'Approved'
    });

    // Update Vendor or Contractor outstanding accounts in Accounting
    createAudit(
      `Approved certified payment of ${formatCurrency(bill.paidAmount, lang)} for Bill ${bill.billNo}`,
      `বিল ${bill.billNo} এর জন্য ${formatCurrency(bill.paidAmount, lang)} পেমেন্ট অনুমোদন করা হয়েছে`,
      'construction_contractor_bills'
    );
    triggerBanner(lang === 'en' ? 'Contractor Bill Approved for payment!' : 'কন্ট্রাক্টর বিল পেমেন্টের জন্য অনুমোদিত হয়েছে!');
  };

  // Active items based on Project Filter
  const filteredBOQs = boqs.filter(b => selectedProjectId === 'all' || b.projectId === selectedProjectId);
  const filteredPO = purchaseOrders.filter(p => selectedProjectId === 'all' || p.projectId === selectedProjectId);
  const filteredReceipts = materialReceipts.filter(m => selectedProjectId === 'all' || m.projectId === selectedProjectId);
  const filteredLedger = inventoryLedger.filter(i => selectedProjectId === 'all' || i.projectId === selectedProjectId);
  const filteredLogs = siteDailyLogs.filter(s => selectedProjectId === 'all' || s.projectId === selectedProjectId);
  const filteredProgress = projectProgress.filter(p => selectedProjectId === 'all' || p.projectId === selectedProjectId);
  const filteredBills = contractorBills.filter(b => selectedProjectId === 'all' || b.projectId === selectedProjectId);

  // Stats Calculations
  const totalBOQEstimates = filteredBOQs.reduce((sum, b) => sum + b.totalEstimatedCost, 0);
  const totalActualBOQCosts = filteredBOQs.reduce((sum, b) => sum + b.totalActualCost, 0);
  const totalApprovedPOValue = filteredPO.filter(p => p.status === 'Approved' || p.status === 'Delivered').reduce((sum, p) => sum + p.totalAmount, 0);
  const totalOutstandingBillPayments = filteredBills.filter(b => b.status !== 'Paid').reduce((sum, b) => sum + b.outstanding, 0);

  return (
    <div className="space-y-6" id="construction-erp-system">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <HardHat className="w-40 h-40" />
        </div>
        <div className="relative z-10 space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-500/30 uppercase tracking-wider">
              Phase 3A ERP Module
            </span>
            <span className="bg-slate-800 text-slate-300 text-[10px] font-mono px-2 py-1 rounded-full">
              AL KASWA HOLDINGS
            </span>
          </div>
          <h1 className="font-display font-black text-2xl md:text-3xl tracking-tight text-white flex items-center gap-3">
            Construction & BOQ Management System
          </h1>
          <p className="text-xs text-slate-400">
            Real-time material estimating, central store logistics, progressive contractor billing, and cost control audit systems.
          </p>
        </div>

        {/* Global Project Filter */}
        <div className="relative z-10 flex items-center gap-2 bg-slate-800/80 p-2 rounded-2xl border border-slate-700">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-2">Filter Project</span>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-emerald-500 text-white font-medium cursor-pointer"
            id="global-project-filter"
          >
            <option value="all">{lang === 'en' ? 'All Active Projects' : 'সকল সক্রিয় প্রকল্পসমূহ'}</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{lang === 'en' ? p.nameEn : p.nameBn}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Interactive Floating Status Banner */}
      {banner && (
        <div className={`p-4 rounded-2xl border flex items-center gap-3 shadow-md transition-all animate-bounce ${
          banner.type === 'success' 
            ? 'bg-emerald-950 border-emerald-800 text-emerald-200' 
            : 'bg-slate-900 border-slate-800 text-slate-200'
        }`} id="floating-banner-alert">
          <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse" />
          <p className="text-xs font-semibold">{banner.message}</p>
        </div>
      )}

      {/* Main ERP Navigation Menu */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl overflow-x-auto gap-1 border border-slate-200 shadow-inner scrollbar-hide">
        {[
          { id: 'dashboard', labelEn: 'Overview Dashboard', labelBn: 'ড্যাশবোর্ড', icon: Activity },
          { id: 'boq', labelEn: 'BOQ & Cost Estimating', labelBn: 'বিওকিউ', icon: Sliders },
          { id: 'procurement', labelEn: 'Material Procurement', labelBn: 'ক্রয় আদেশ', icon: ShoppingBag },
          { id: 'inventory', labelEn: 'Store & Inventory', labelBn: 'ইনভেন্টরি', icon: Building },
          { id: 'vendors', labelEn: 'Vendor Management', labelBn: 'সরবরাহকারী', icon: Users },
          { id: 'sitelogs', labelEn: 'Daily Site Logs', labelBn: 'সাইট লগ', icon: FileText },
          { id: 'progress', labelEn: 'Progress Tracking', labelBn: 'অগ্রগতি ট্র্যাকিং', icon: HardHat },
          { id: 'contractorbills', labelEn: 'Contractor Billing', labelBn: 'কন্ট্রাক্টর বিল', icon: DollarSign },
          { id: 'reports', labelEn: 'Audits & Reports', labelBn: 'রিপোর্টসমূহ', icon: Info },
        ].map((item) => {
          const IconComponent = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setSearchQuery('');
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                isActive 
                  ? 'bg-slate-900 text-white shadow-md transform scale-102 font-black' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
              id={`erp-tab-btn-${item.id}`}
            >
              <IconComponent className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span>{lang === 'en' ? item.labelEn : item.labelBn}</span>
            </button>
          );
        })}
      </div>

      {/* Sub-view Rendering */}
      <div className="space-y-6">

        {/* 1. OVERVIEW DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6" id="view-dashboard">
            {/* Core KPI cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">BOQ Estimated Pool</p>
                  <h3 className="font-display font-black text-2xl text-slate-800 tracking-tight mt-1">
                    {formatCurrency(totalBOQEstimates, lang)}
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-1">Across all matching records</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-700">
                  <Sliders className="w-5 h-5 text-slate-500" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Approved PO Outlay</p>
                  <h3 className="font-display font-black text-2xl text-emerald-600 tracking-tight mt-1">
                    {formatCurrency(totalApprovedPOValue, lang)}
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-1">Committed raw material cost</p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700">
                  <ShoppingBag className="w-5 h-5 text-emerald-600" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Outstanding Bills</p>
                  <h3 className="font-display font-black text-2xl text-amber-600 tracking-tight mt-1">
                    {formatCurrency(totalOutstandingBillPayments, lang)}
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-1">Awaiting release / audit clearance</p>
                </div>
                <div className="p-3 rounded-xl bg-amber-50 text-amber-700">
                  <DollarSign className="w-5 h-5 text-amber-600" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Actual Expense Incurred</p>
                  <h3 className="font-display font-black text-2xl text-slate-800 tracking-tight mt-1">
                    {formatCurrency(totalActualBOQCosts, lang)}
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-1">Certified structural work costs</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-700">
                  <Activity className="w-5 h-5 text-slate-500" />
                </div>
              </div>
            </div>

            {/* Quick Status and Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Material Inventory levels */}
              <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h4 className="font-display font-bold text-slate-800 text-sm">Central Store Material Levels</h4>
                  <span className="text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-full">Secure depot</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredLedger.slice(0, 4).map((item, i) => {
                    const isLow = item.available < 300;
                    return (
                      <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-700 truncate max-w-[150px]">{item.materialName}</span>
                          <span className="font-mono text-[10px] bg-white border border-slate-200 px-2 py-0.5 rounded-lg text-slate-500 font-bold">{item.available} {item.unit}</span>
                        </div>
                        <div>
                          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${isLow ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: isLow ? '25%' : '80%' }} />
                          </div>
                          <div className="flex justify-between text-[9px] font-mono text-slate-400 mt-1">
                            <span>Category: {item.category}</span>
                            <span className={isLow ? 'text-amber-600 font-bold' : 'text-slate-400'}>{isLow ? 'Restock soon' : 'Good Stock'}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Work Progress milestones */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h4 className="font-display font-bold text-slate-800 text-sm">Site Progress Meters</h4>
                </div>
                <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
                  {filteredProgress.map((prog, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-700 truncate max-w-[120px]">{prog.projectName}</span>
                        <span className="font-mono font-semibold text-slate-500 text-[10px]">{prog.phase}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200/50">
                          <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${prog.completionPercent}%` }} />
                        </div>
                        <span className="text-[10px] font-mono font-bold text-slate-800 w-8 text-right">{prog.completionPercent}%</span>
                      </div>
                      {prog.delayPercent > 0 && (
                        <p className="text-[9px] text-amber-600 font-mono flex items-center gap-1">
                          <AlertTriangle className="w-2.5 h-2.5" /> Delay detected: {prog.delayPercent}% behind schedule
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Site Worklog activity list */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
              <h4 className="font-display font-bold text-slate-800 text-sm border-b border-slate-100 pb-3">Recent Construction Activity Ledger</h4>
              <div className="space-y-3.5">
                {filteredLogs.slice(0, 3).map((log, i) => (
                  <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col md:flex-row items-start justify-between gap-4">
                    <div className="space-y-1 md:max-w-2xl">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-lg">{log.logDate}</span>
                        <span className="font-bold text-xs text-slate-800">{log.projectName}</span>
                        <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                          log.weather === 'Sunny' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                        }`}>{log.weather}</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed font-sans">{log.workCompleted}</p>
                      <p className="text-[10px] text-slate-400 font-mono italic">Notes: {log.engineerNotes}</p>
                    </div>
                    <div className="text-right flex flex-col justify-between h-full space-y-2">
                      <span className="text-[10px] font-mono text-slate-500 block">Recorded by: {log.recordedBy}</span>
                      <span className="text-[10px] font-bold bg-slate-900 text-emerald-400 px-2 py-0.5 rounded-lg border border-slate-800 text-center font-mono">
                        {log.laborCount} Active Labors
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 2. BOQ & COST ESTIMATING */}
        {activeTab === 'boq' && (
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-6" id="view-boq">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-display font-black text-lg text-slate-800">Bill of Quantities (BOQ) Master</h3>
                <p className="text-xs text-slate-500">Formulate building estimates, track cost updates, and execute revisions.</p>
              </div>

              {/* BOQ Action triggers */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const desc = prompt("Enter Revision Reason / Scope Alteration:");
                    const newCostStr = prompt("Enter New Total Estimated Cost (BDT):");
                    const targetBoq = filteredBOQs[0];
                    if (targetBoq && desc && newCostStr) {
                      handleReviseBOQ(targetBoq.id, desc, parseFloat(newCostStr) || 0);
                    }
                  }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-200 transition-all cursor-pointer flex items-center gap-2"
                  id="boq-revise-trigger-btn"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                  <span>Execute BOQ Revision</span>
                </button>
              </div>
            </div>

            {/* Cost estimate dashboard block */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredBOQs.map((boq, index) => (
                <div key={index} className="p-5 rounded-2xl bg-slate-50 border border-slate-200/60 shadow-xs space-y-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-2 h-full bg-slate-900" />
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-black text-slate-500 tracking-wide">{boq.boqCode}</span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      boq.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                    }`}>{boq.status}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm leading-snug">{boq.projectName}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Author: {boq.createdBy}</p>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-xs">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Estimated Budget</p>
                      <p className="font-mono font-black text-slate-800 mt-0.5">{formatCurrency(boq.totalEstimatedCost, lang)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Actual Expenses</p>
                      <p className="font-mono font-black text-slate-800 mt-0.5">{formatCurrency(boq.totalActualCost, lang)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Form to append new BOQ Items */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-inner space-y-4">
              <h4 className="font-display font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-500" />
                <span>Add Material Estimate to BOQ</span>
              </h4>
              <form onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const formData = new FormData(form);
                const activeBoq = filteredBOQs[0];
                if (!activeBoq) return;

                handleAddBOQItem({
                  boqId: activeBoq.id,
                  materialName: formData.get('materialName') as string,
                  category: formData.get('category') as any,
                  unit: formData.get('unit') as string,
                  quantity: parseFloat(formData.get('quantity') as string) || 0,
                  rate: parseFloat(formData.get('rate') as string) || 0
                });
                form.reset();
              }} className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <input
                  required
                  type="text"
                  name="materialName"
                  placeholder="Material Name (e.g. Holcim Cement)"
                  className="bg-white border border-slate-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-slate-800 text-slate-800 font-medium"
                />
                <select
                  required
                  name="category"
                  className="bg-white border border-slate-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-slate-800 text-slate-800 font-medium cursor-pointer"
                >
                  <option value="Cement">Cement</option>
                  <option value="Rod">Rod</option>
                  <option value="Sand">Sand</option>
                  <option value="Brick">Brick</option>
                  <option value="Stone">Stone</option>
                  <option value="Tiles">Tiles</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Plumbing">Plumbing</option>
                  <option value="Other">Other</option>
                </select>
                <input
                  required
                  type="text"
                  name="unit"
                  placeholder="Unit (e.g. Bags, Tons)"
                  className="bg-white border border-slate-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-slate-800 text-slate-800 font-medium"
                />
                <input
                  required
                  type="number"
                  name="quantity"
                  placeholder="Quantity"
                  className="bg-white border border-slate-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-slate-800 text-slate-800 font-mono"
                />
                <input
                  required
                  type="number"
                  name="rate"
                  placeholder="Rate (BDT)"
                  className="bg-white border border-slate-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-slate-800 text-slate-800 font-mono"
                />
                <div className="md:col-span-5 flex justify-end">
                  <button
                    type="submit"
                    className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-6 py-2.5 rounded-xl border border-slate-800 transition-all cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" /> Add Item Estimate
                  </button>
                </div>
              </form>
            </div>

            {/* List of items currently in BOQ */}
            <div className="space-y-3">
              <h4 className="font-display font-bold text-slate-800 text-xs uppercase tracking-wider">BOQ Estimated Items Ledger</h4>
              <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-slate-500 font-bold">
                      <th className="p-4">Material Name</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Quantity</th>
                      <th className="p-4">Unit Rate</th>
                      <th className="p-4">Total Estimated</th>
                      <th className="p-4">Actual Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {boqItems.map((item, i) => (
                      <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="p-4 font-bold text-slate-800">{item.materialName}</td>
                        <td className="p-4 font-mono text-[10px] text-slate-500">{item.category}</td>
                        <td className="p-4 font-mono font-bold text-slate-700">{item.quantity} {item.unit}</td>
                        <td className="p-4 font-mono text-slate-500">{formatCurrency(item.rate, lang)}</td>
                        <td className="p-4 font-mono font-bold text-slate-900">{formatCurrency(item.totalCost, lang)}</td>
                        <td className="p-4 font-mono font-bold text-slate-600">{formatCurrency(item.actualCost, lang)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* BOQ Revision History */}
            {boqRevisions.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h4 className="font-display font-bold text-slate-800 text-xs uppercase tracking-wider">Historical Revision Logs</h4>
                <div className="space-y-3">
                  {boqRevisions.map((rev, i) => (
                    <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row items-start justify-between text-xs gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-800 bg-slate-200 px-2 py-0.5 rounded">Revision #{rev.revisionNo}</span>
                          <span className="font-mono text-slate-400">{rev.dateOfRevision}</span>
                        </div>
                        <p className="text-slate-600 font-medium mt-1">Reason: {rev.reason}</p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">Authorized by: {rev.changedBy}</p>
                      </div>
                      <div className="text-right font-mono">
                        <span className="text-slate-400 line-through block">{formatCurrency(rev.previousCost, lang)}</span>
                        <span className="text-emerald-600 font-black text-sm block">{formatCurrency(rev.newCost, lang)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. MATERIAL PROCUREMENT */}
        {activeTab === 'procurement' && (
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-6" id="view-procurement">
            <div className="border-b border-slate-100 pb-4 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="font-display font-black text-lg text-slate-800">Procurement & Purchase Workflow</h3>
                <p className="text-xs text-slate-500">Formulate Requisitions, draft Purchase Orders (PO), and register Material Receipts (MRN).</p>
              </div>
            </div>

            {/* Quick stats on Procurement */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Form to Create Purchase Order */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <h4 className="font-display font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
                  <Plus className="w-4 h-4 text-emerald-500" />
                  <span>Draft New Purchase Order (PO)</span>
                </h4>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.currentTarget;
                  const formData = new FormData(form);
                  const selectedProj = projects.find(p => p.id === formData.get('projectId'));
                  const selectedVend = vendors.find(v => v.id === formData.get('vendorId'));
                  if (!selectedProj || !selectedVend) return;

                  handleCreatePO({
                    requisitionId: `REQ-${Date.now().toString().slice(-4)}`,
                    vendorId: selectedVend.id,
                    vendorName: selectedVend.vendorName,
                    projectId: selectedProj.id,
                    projectName: selectedProj.nameEn,
                    materialName: formData.get('materialName') as string,
                    category: formData.get('category') as string,
                    quantity: parseFloat(formData.get('quantity') as string) || 0,
                    rate: parseFloat(formData.get('rate') as string) || 0,
                    deliveryDate: formData.get('deliveryDate') as string
                  });
                  form.reset();
                }} className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Target Project</label>
                      <select required name="projectId" className="w-full bg-white border border-slate-200 text-xs rounded-xl px-3 py-2 mt-1 focus:outline-none focus:border-slate-800 text-slate-800 cursor-pointer">
                        {projects.map(p => <option key={p.id} value={p.id}>{p.nameEn}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Assign Vendor</label>
                      <select required name="vendorId" className="w-full bg-white border border-slate-200 text-xs rounded-xl px-3 py-2 mt-1 focus:outline-none focus:border-slate-800 text-slate-800 cursor-pointer">
                        {vendors.map(v => <option key={v.id} value={v.id}>{v.vendorName}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="md:col-span-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Material Name</label>
                      <input required type="text" name="materialName" placeholder="e.g. TMT Steel Rods (60-Grade)" className="w-full bg-white border border-slate-200 text-xs rounded-xl px-3 py-2 mt-1 focus:outline-none focus:border-slate-800 text-slate-800" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Category</label>
                      <select required name="category" className="w-full bg-white border border-slate-200 text-xs rounded-xl px-3 py-2 mt-1 focus:outline-none focus:border-slate-800 text-slate-800 cursor-pointer">
                        <option value="Cement">Cement</option>
                        <option value="Rod">Rod</option>
                        <option value="Sand">Sand</option>
                        <option value="Brick">Brick</option>
                        <option value="Stone">Stone</option>
                        <option value="Tiles">Tiles</option>
                        <option value="Electrical">Electrical</option>
                        <option value="Plumbing">Plumbing</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Quantity</label>
                      <input required type="number" name="quantity" placeholder="e.g. 50" className="w-full bg-white border border-slate-200 text-xs rounded-xl px-3 py-2 mt-1 focus:outline-none focus:border-slate-800 text-slate-800 font-mono" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Estimated Rate</label>
                      <input required type="number" name="rate" placeholder="e.g. 95000" className="w-full bg-white border border-slate-200 text-xs rounded-xl px-3 py-2 mt-1 focus:outline-none focus:border-slate-800 text-slate-800 font-mono" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Delivery Date</label>
                      <input required type="date" name="deliveryDate" className="w-full bg-white border border-slate-200 text-xs rounded-xl px-3 py-2 mt-1 focus:outline-none focus:border-slate-800 text-slate-800 font-mono cursor-pointer" />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-6 py-2.5 rounded-xl transition-all cursor-pointer">
                      Draft Purchase Order
                    </button>
                  </div>
                </form>
              </div>

              {/* Form to Record Goods Receipt Note (MRN) */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <h4 className="font-display font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Record Material Receipt Note (MRN)</span>
                </h4>
                <p className="text-[11px] text-slate-400 leading-normal">
                  Recording material arrivals automatically increments the central repository stock ledger lines.
                </p>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.currentTarget;
                  const formData = new FormData(form);
                  const selectedPO = purchaseOrders.find(p => p.id === formData.get('poId'));
                  if (!selectedPO) return;

                  handleCreateReceipt({
                    poNumber: selectedPO.poNumber,
                    projectId: selectedPO.projectId,
                    projectName: selectedPO.projectName,
                    materialName: selectedPO.materialName,
                    category: selectedPO.category,
                    receivedQuantity: parseFloat(formData.get('receivedQuantity') as string) || selectedPO.quantity,
                    remarks: formData.get('remarks') as string || 'Passed quality and weight metrics scan.'
                  });
                  form.reset();
                }} className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Select Approved Purchase Order (PO)</label>
                    <select required name="poId" className="w-full bg-white border border-slate-200 text-xs rounded-xl px-3 py-2 mt-1 focus:outline-none focus:border-slate-800 text-slate-800 cursor-pointer">
                      {filteredPO.filter(p => p.status === 'Approved').map(p => (
                        <option key={p.id} value={p.id}>{p.poNumber} - {p.materialName} ({p.quantity} units to {p.projectName})</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Received Quantity</label>
                      <input required type="number" name="receivedQuantity" placeholder="e.g. 50" className="w-full bg-white border border-slate-200 text-xs rounded-xl px-3 py-2 mt-1 focus:outline-none focus:border-slate-800 text-slate-800 font-mono" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Quality Verification Details</label>
                      <input type="text" name="remarks" placeholder="Remarks / Batch Number" className="w-full bg-white border border-slate-200 text-xs rounded-xl px-3 py-2 mt-1 focus:outline-none focus:border-slate-800 text-slate-800" />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-6 py-2.5 rounded-xl transition-all cursor-pointer">
                      Record Material Arrival (MRN)
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* List of active Purchase Orders */}
            <div className="space-y-3">
              <h4 className="font-display font-bold text-slate-800 text-xs uppercase tracking-wider">Purchase Orders (PO) Log</h4>
              <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-slate-500 font-bold">
                      <th className="p-4">PO Number</th>
                      <th className="p-4">Project</th>
                      <th className="p-4">Vendor</th>
                      <th className="p-4">Material Details</th>
                      <th className="p-4">Total Amount</th>
                      <th className="p-4">PO Status</th>
                      <th className="p-4 text-center">Execution Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPO.map((po, i) => (
                      <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="p-4 font-mono font-bold text-slate-800">{po.poNumber}</td>
                        <td className="p-4 font-medium text-slate-700">{po.projectName}</td>
                        <td className="p-4 text-slate-600">{po.vendorName}</td>
                        <td className="p-4">
                          <span className="font-bold text-slate-800">{po.materialName}</span>
                          <span className="font-mono text-[9px] text-slate-400 block">{po.quantity} Units @ {formatCurrency(po.rate, lang)}</span>
                        </td>
                        <td className="p-4 font-mono font-bold text-slate-900">{formatCurrency(po.totalAmount, lang)}</td>
                        <td className="p-4">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            po.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                            po.status === 'Delivered' ? 'bg-blue-100 text-blue-800' :
                            po.status === 'Draft' ? 'bg-slate-100 text-slate-600' : 'bg-amber-100 text-amber-800'
                          }`}>{po.status}</span>
                        </td>
                        <td className="p-4 text-center">
                          {po.status === 'Draft' && (
                            <button
                              onClick={() => handleApprovePO(po.id)}
                              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] px-3 py-1 rounded-lg transition-colors cursor-pointer"
                            >
                              Approve PO
                            </button>
                          )}
                          {po.status !== 'Draft' && <span className="text-[10px] font-mono text-slate-400">Verified</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Material Receipts (MRN) Log */}
            <div className="space-y-3">
              <h4 className="font-display font-bold text-slate-800 text-xs uppercase tracking-wider">Material Receipt Notes (MRN) Registry</h4>
              <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-slate-500 font-bold">
                      <th className="p-4">MRN Number</th>
                      <th className="p-4">PO Link</th>
                      <th className="p-4">Project Destination</th>
                      <th className="p-4">Material received</th>
                      <th className="p-4">Date received</th>
                      <th className="p-4">Inspected by</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReceipts.map((mr, i) => (
                      <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="p-4 font-mono font-bold text-slate-800">{mr.receiptNo}</td>
                        <td className="p-4 font-mono text-slate-500">{mr.poNumber}</td>
                        <td className="p-4 font-medium text-slate-700">{mr.projectName}</td>
                        <td className="p-4">
                          <span className="font-bold text-slate-800">{mr.materialName}</span>
                          <span className="font-mono text-[9px] text-emerald-600 block">{mr.receivedQuantity} Units arrived</span>
                        </td>
                        <td className="p-4 font-mono text-slate-500">{mr.receivedDate}</td>
                        <td className="p-4 text-slate-600">{mr.inspectedBy}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 4. STORE & INVENTORY */}
        {activeTab === 'inventory' && (
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-6" id="view-inventory">
            <div className="border-b border-slate-100 pb-4 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="font-display font-black text-lg text-slate-800">Depot Store & Stock Ledger</h3>
                <p className="text-xs text-slate-500">Real-time stock level balances, material issuance logs, and safelimit alerts.</p>
              </div>
            </div>

            {/* Inventory Listing */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLedger.map((item, idx) => {
                const isLow = item.available < 300;
                return (
                  <div key={idx} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] uppercase font-bold bg-slate-200 text-slate-600 px-2.5 py-0.5 rounded-lg font-mono">{item.category}</span>
                        <h4 className="font-bold text-slate-800 text-sm mt-1">{item.materialName}</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5 font-mono">{item.projectName}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isLow ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>{isLow ? 'Restock Alert' : 'Secure Level'}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center py-2 bg-white rounded-xl border border-slate-150">
                      <div>
                        <p className="text-[9px] text-slate-400 uppercase font-mono">Available</p>
                        <p className="text-sm font-black font-mono text-slate-800 mt-0.5">{item.available}</p>
                      </div>
                      <div className="border-x border-slate-100">
                        <p className="text-[9px] text-slate-400 uppercase font-mono">Issued</p>
                        <p className="text-sm font-black font-mono text-slate-800 mt-0.5">{item.issued}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-slate-400 uppercase font-mono">Reserved</p>
                        <p className="text-sm font-black font-mono text-slate-800 mt-0.5">{item.reserved}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span>Last Audited: {item.lastUpdated}</span>
                      <span>Unit: {item.unit}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Simulated Material Issuance Form */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-inner space-y-4">
              <h4 className="font-display font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4 text-slate-500" />
                <span>Issue Materials to Site Phase</span>
              </h4>
              <p className="text-[11px] text-slate-400">
                Authorized dispatching of physical store assets directly to active engineering tasks.
              </p>
              <form onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const formData = new FormData(form);
                const invId = formData.get('invId') as string;
                const qty = parseFloat(formData.get('quantity') as string) || 0;
                
                const item = inventoryLedger.find(i => i.id === invId);
                if (item && item.available >= qty) {
                  dbService.inventoryLedger.update(invId, {
                    ...item,
                    available: item.available - qty,
                    issued: item.issued + qty,
                    lastUpdated: new Date().toISOString().split('T')[0]
                  });
                  createAudit(
                    `Issued ${qty} ${item.unit} of ${item.materialName} to active structural works`,
                    `সক্রিয় কাজের জন্য ${qty} ${item.unit} ${item.materialName} গুদাম থেকে ইস্যু করা হয়েছে`,
                    'construction_inventory_ledger'
                  );
                  triggerBanner(lang === 'en' ? 'Materials Dispatched successfully!' : 'কাঁচামাল সফলভাবে সাইটে পাঠানো হয়েছে!');
                } else {
                  alert("Insufficient Stock!");
                }
                form.reset();
              }} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Select Stock Item</label>
                  <select required name="invId" className="w-full bg-white border border-slate-200 text-xs rounded-xl px-3 py-2 mt-1 focus:outline-none focus:border-slate-800 text-slate-800 cursor-pointer">
                    {filteredLedger.map(i => (
                      <option key={i.id} value={i.id}>{i.materialName} ({i.available} available - {i.projectName})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Issuing Quantity</label>
                  <input required type="number" name="quantity" placeholder="e.g. 100" className="w-full bg-white border border-slate-200 text-xs rounded-xl px-3 py-2 mt-1 focus:outline-none focus:border-slate-800 text-slate-800 font-mono" />
                </div>
                <div className="flex items-end">
                  <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2 px-4 rounded-xl transition-all cursor-pointer">
                    Issue to Active Site
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 5. VENDOR MANAGEMENT */}
        {activeTab === 'vendors' && (
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-6" id="view-vendors">
            <div className="border-b border-slate-100 pb-4 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="font-display font-black text-lg text-slate-800">Registered Suppliers & Vendor Roster</h3>
                <p className="text-xs text-slate-500">Track vendor performance metrics, license numbers, and outstanding accounts payables.</p>
              </div>
            </div>

            {/* Roster Table */}
            <div className="overflow-x-auto border border-slate-100 rounded-2xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-slate-500 font-bold">
                    <th className="p-4">Vendor / Corporate Name</th>
                    <th className="p-4">Contact Details</th>
                    <th className="p-4">Material Category</th>
                    <th className="p-4">Trade License No</th>
                    <th className="p-4">Outstandings Payable</th>
                    <th className="p-4 text-center">Roster Status</th>
                  </tr>
                </thead>
                <tbody>
                  {vendors.map((v, i) => (
                    <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-bold text-slate-800">
                        {v.vendorName}
                        <span className="text-[10px] text-slate-400 block mt-0.5">Contact: {v.contactPerson}</span>
                      </td>
                      <td className="p-4">
                        <span className="font-mono text-slate-600 block">{v.phone}</span>
                        <span className="text-[10px] text-slate-400 block">{v.email}</span>
                      </td>
                      <td className="p-4">
                        <span className="bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-lg text-[9px] uppercase tracking-wider">{v.category}</span>
                      </td>
                      <td className="p-4 font-mono text-slate-500">{v.tradeLicenseNo}</td>
                      <td className="p-4 font-mono font-black text-slate-800">{formatCurrency(v.outstandingPayable, lang)}</td>
                      <td className="p-4 text-center">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          v.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}>{v.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Vendor Registration Form */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-inner space-y-4">
              <h4 className="font-display font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-500" />
                <span>Nothihvukt (Register) New Corporate Supplier</span>
              </h4>
              <form onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const formData = new FormData(form);

                handleAddVendor({
                  vendorName: formData.get('vendorName') as string,
                  contactPerson: formData.get('contactPerson') as string,
                  phone: formData.get('phone') as string,
                  email: formData.get('email') as string,
                  tradeLicenseNo: formData.get('tradeLicenseNo') as string,
                  category: formData.get('category') as string,
                  status: 'Active'
                });
                form.reset();
              }} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input required type="text" name="vendorName" placeholder="Corporate Name (e.g. BSRM Steel)" className="bg-white border border-slate-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-slate-800 text-slate-800 font-medium" />
                <input required type="text" name="contactPerson" placeholder="Primary Contact Person Name" className="bg-white border border-slate-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-slate-800 text-slate-800 font-medium" />
                <input required type="text" name="phone" placeholder="Contact Phone Number" className="bg-white border border-slate-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-slate-800 text-slate-800 font-mono" />
                <input required type="email" name="email" placeholder="Corporate Email ID" className="bg-white border border-slate-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-slate-800 text-slate-800 font-mono" />
                <input required type="text" name="tradeLicenseNo" placeholder="Trade License Registration Number" className="bg-white border border-slate-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-slate-800 text-slate-800 font-mono" />
                <input required type="text" name="category" placeholder="Material Supply Scope Category (e.g. Bricks)" className="bg-white border border-slate-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-slate-800 text-slate-800 font-medium" />
                <div className="md:col-span-3 flex justify-end">
                  <button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-6 py-2.5 rounded-xl transition-all cursor-pointer">
                    Register Corporate Supplier
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 6. DAILY SITE LOGS */}
        {activeTab === 'sitelogs' && (
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-6" id="view-sitelogs">
            <div className="border-b border-slate-100 pb-4 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="font-display font-black text-lg text-slate-800">Daily Site Logs & Environmental Audits</h3>
                <p className="text-xs text-slate-500">Record labor forces, physical asset usages, and daily civil engineering site logs.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form to submit daily site reports */}
              <div className="lg:col-span-1 p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <h4 className="font-display font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
                  <Plus className="w-4 h-4 text-emerald-500" />
                  <span>Submit Daily Engineering Site Log</span>
                </h4>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.currentTarget;
                  const formData = new FormData(form);
                  const selectedProj = projects.find(p => p.id === formData.get('projectId'));
                  if (!selectedProj) return;

                  handleAddDailyLog({
                    projectId: selectedProj.id,
                    projectName: selectedProj.nameEn,
                    weather: formData.get('weather') as any,
                    laborCount: parseInt(formData.get('laborCount') as string) || 0,
                    materialUsedJson: formData.get('materialsJson') as string || '[]',
                    workCompleted: formData.get('workCompleted') as string,
                    engineerNotes: formData.get('engineerNotes') as string
                  });
                  form.reset();
                }} className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Select Target Project</label>
                    <select required name="projectId" className="w-full bg-white border border-slate-200 text-xs rounded-xl px-3 py-2 mt-1 focus:outline-none focus:border-slate-800 text-slate-800 cursor-pointer">
                      {projects.map(p => <option key={p.id} value={p.id}>{p.nameEn}</option>)}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Weather Vibe</label>
                      <select required name="weather" className="w-full bg-white border border-slate-200 text-xs rounded-xl px-3 py-2 mt-1 focus:outline-none focus:border-slate-800 text-slate-800 cursor-pointer">
                        <option value="Sunny">Sunny / Clear</option>
                        <option value="Rainy">Heavy Rainy</option>
                        <option value="Overcast">Overcast</option>
                        <option value="Stormy">Stormy</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Labor Count</label>
                      <input required type="number" name="laborCount" placeholder="e.g. 45" className="w-full bg-white border border-slate-200 text-xs rounded-xl px-3 py-2 mt-1 focus:outline-none focus:border-slate-800 text-slate-800 font-mono" />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Material Used (JSON Array format)</label>
                    <textarea name="materialsJson" placeholder='e.g. [{"materialName":"Cement","quantity":20,"unit":"Bags"}]' className="w-full bg-white border border-slate-200 text-xs rounded-xl px-3 py-2 mt-1 focus:outline-none focus:border-slate-800 text-slate-800 h-16 font-mono" />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Work Completed Scope</label>
                    <textarea required name="workCompleted" placeholder="e.g. Finished columns reinforcements structural casting." className="w-full bg-white border border-slate-200 text-xs rounded-xl px-3 py-2 mt-1 focus:outline-none focus:border-slate-800 text-slate-800 h-16" />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Engineering site notes</label>
                    <textarea required name="engineerNotes" placeholder="e.g. Standard load tests certified by BUET consultants." className="w-full bg-white border border-slate-200 text-xs rounded-xl px-3 py-2 mt-1 focus:outline-none focus:border-slate-800 text-slate-800 h-16" />
                  </div>

                  <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-all cursor-pointer">
                    Submit Site Log
                  </button>
                </form>
              </div>

              {/* Work log listings */}
              <div className="lg:col-span-2 space-y-4">
                <h4 className="font-display font-bold text-slate-800 text-xs uppercase tracking-wider">Submitted Engineering Activity Logs</h4>
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                  {filteredLogs.map((log, idx) => (
                    <div key={idx} className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-xs space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-lg">{log.logDate}</span>
                          <span className="font-bold text-xs text-slate-800">{log.projectName}</span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          log.weather === 'Sunny' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                        }`}>{log.weather}</span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed font-sans">{log.workCompleted}</p>
                      <div className="p-3 bg-white rounded-xl border border-slate-150 text-[11px] text-slate-500 font-mono italic">
                        Notes: {log.engineerNotes}
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono pt-2 border-t border-slate-200/50">
                        <span>Labors count: {log.laborCount} active</span>
                        <span>Audited by: {log.recordedBy}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 7. PROGRESS TRACKING */}
        {activeTab === 'progress' && (
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-6" id="view-progress">
            <div className="border-b border-slate-100 pb-4 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="font-display font-black text-lg text-slate-800">Civil Progress & Delay Meters</h3>
                <p className="text-xs text-slate-500">Compare scheduled timelines with real site phase percentage updates.</p>
              </div>
            </div>

            {/* List of progress updates */}
            <div className="space-y-4">
              {filteredProgress.map((prog, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm leading-snug">{prog.projectName}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5 font-mono">Phase: {prog.phase}</p>
                    </div>
                    <div className="flex items-center gap-3 font-mono text-[10px] text-slate-400">
                      <span>Start: {prog.startDate}</span>
                      <span>Target End: {prog.endDate}</span>
                    </div>
                  </div>

                  {/* Progressive Meter */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-mono font-bold">
                      <span className="text-slate-500">Planned: {prog.plannedPercent}%</span>
                      <span className="text-emerald-600">Actual: {prog.actualPercent}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden border border-slate-150">
                      <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${prog.actualPercent}%` }} />
                    </div>
                  </div>

                  {/* Quick Action to adjust progress percentage */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                    <div className="flex items-center gap-1.5">
                      {prog.delayPercent > 0 ? (
                        <span className="bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-100 px-2.5 py-1 rounded-lg flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Timeline Alert: {prog.delayPercent}% Deviation Delay</span>
                        </span>
                      ) : (
                        <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-100 px-2.5 py-1 rounded-lg flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>On Schedule</span>
                        </span>
                      )}
                    </div>

                    {/* Simulation trigger */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const percent = prompt("Enter Actual Completion Percentage (0-100):");
                          const delayVal = prompt("Enter Delay Percentage deviation (0-100):");
                          if (percent !== null && delayVal !== null) {
                            handleUpdateProgress(prog.id, parseFloat(percent) || 0, parseFloat(delayVal) || 0, prog.phase);
                          }
                        }}
                        className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        Adjust Phase Completion
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 8. CONTRACTOR BILLING */}
        {activeTab === 'contractorbills' && (
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-6" id="view-contractorbills">
            <div className="border-b border-slate-100 pb-4 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="font-display font-black text-lg text-slate-800">Contractor Billing & Retention Ledger</h3>
                <p className="text-xs text-slate-500">Certify subcontractor bill claims, audit 10% retention structures, and release certified accounts.</p>
              </div>
            </div>

            {/* List of bills */}
            <div className="overflow-x-auto border border-slate-100 rounded-2xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-slate-500 font-bold">
                    <th className="p-4">Bill Reference</th>
                    <th className="p-4">Project</th>
                    <th className="p-4">Subcontractor Name</th>
                    <th className="p-4">Claimed Amount</th>
                    <th className="p-4">10% Retention</th>
                    <th className="p-4">Outstanding Accounts</th>
                    <th className="p-4">Audit Status</th>
                    <th className="p-4 text-center">Certification Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBills.map((b, i) => (
                    <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-mono font-bold text-slate-800">
                        {b.billNo}
                        <span className="text-[10px] text-slate-400 block font-normal">Date: {b.billingDate}</span>
                      </td>
                      <td className="p-4 font-medium text-slate-700">{b.projectName}</td>
                      <td className="p-4 text-slate-600">{b.contractorName}</td>
                      <td className="p-4 font-mono font-bold text-slate-900">{formatCurrency(b.billAmount, lang)}</td>
                      <td className="p-4 font-mono text-amber-600 font-bold">-{formatCurrency(b.retentionAmount, lang)}</td>
                      <td className="p-4 font-mono text-slate-900 font-bold">{formatCurrency(b.outstanding, lang)}</td>
                      <td className="p-4">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          b.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
                          b.status === 'Certified' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                        }`}>{b.status}</span>
                      </td>
                      <td className="p-4 text-center space-x-1 whitespace-nowrap">
                        {b.status === 'Submitted' && (
                          <button
                            onClick={() => handleCertifyBill(b.id)}
                            className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                          >
                            Certify Bill (Engineer)
                          </button>
                        )}
                        {b.status === 'Certified' && (
                          <button
                            onClick={() => handleApproveBill(b.id)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                          >
                            Approve Payment
                          </button>
                        )}
                        {b.status === 'Paid' && <span className="text-[10px] font-mono text-slate-400">Payment Completed</span>}
                        {b.status === 'Approved' && <span className="text-[10px] font-mono text-slate-400">Awaiting Bank Transfer</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Simulated Bill Creation Form */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-inner space-y-4">
              <h4 className="font-display font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-500" />
                <span>Submit Subcontractor Invoice Claim</span>
              </h4>
              <p className="text-[11px] text-slate-400">
                Newly submitted subcontractor claims will automatically apply a 10% retention money reduction deduction.
              </p>
              <form onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const formData = new FormData(form);
                const selectedProj = projects.find(p => p.id === formData.get('projectId'));
                if (!selectedProj) return;

                const amount = parseFloat(formData.get('billAmount') as string) || 0;
                const retention = amount * 0.1;
                const outstanding = amount - retention;

                const newBill: ContractorBill = {
                  id: `cb-${Date.now()}`,
                  billNo: `CB-AK-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
                  contractorName: formData.get('contractorName') as string,
                  projectId: selectedProj.id,
                  projectName: selectedProj.nameEn,
                  workOrderNo: formData.get('workOrderNo') as string || `WO-${Date.now().toString().slice(-4)}`,
                  billAmount: amount,
                  retentionAmount: retention,
                  paidAmount: 0,
                  outstanding,
                  status: 'Submitted',
                  billingDate: new Date().toISOString().split('T')[0]
                };

                dbService.contractorBills.create(newBill);
                createAudit(
                  `Submitted Subcontractor Invoice ${newBill.billNo} for ${amount}`,
                  `কন্ট্রাক্টর ইনভয়েস ${newBill.billNo} জমা দেওয়া হয়েছে (পরিমাণ: ${amount})`,
                  'construction_contractor_bills'
                );
                triggerBanner(lang === 'en' ? 'Subcontractor claim registered!' : 'সাবকন্ট্রাক্টর বিল নথিভুক্ত করা হয়েছে!');
                form.reset();
              }} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <input required type="text" name="contractorName" placeholder="Subcontractor Corporate Name" className="bg-white border border-slate-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-slate-800 text-slate-800 font-medium" />
                <select required name="projectId" className="bg-white border border-slate-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-slate-800 text-slate-800 cursor-pointer">
                  {projects.map(p => <option key={p.id} value={p.id}>{p.nameEn}</option>)}
                </select>
                <input required type="text" name="workOrderNo" placeholder="Associated Work Order ID (WO-2026-X)" className="bg-white border border-slate-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-slate-800 text-slate-800 font-mono" />
                <input required type="number" name="billAmount" placeholder="Invoice Claim Amount (BDT)" className="bg-white border border-slate-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-slate-800 text-slate-800 font-mono" />
                <div className="md:col-span-4 flex justify-end">
                  <button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-6 py-2.5 rounded-xl transition-all cursor-pointer">
                    Submit Contractor Invoice Claim
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 9. AUDITS & REPORTS (COST CONTROL) */}
        {activeTab === 'reports' && (
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-6" id="view-reports">
            <div className="border-b border-slate-100 pb-4 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="font-display font-black text-lg text-slate-800">Executive Cost Control & System Audits</h3>
                <p className="text-xs text-slate-500">Real-time cost variation controls, budget comparison trackers, and chronological audit log feeds.</p>
              </div>
            </div>

            {/* Budget deviation card */}
            <div className="p-6 rounded-2xl bg-slate-900 text-white space-y-4">
              <h4 className="font-display font-bold text-sm tracking-wide text-emerald-400">Active Structural Project Cost Control Statement</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-400 uppercase font-mono">Grand Cumulative Budget</p>
                  <p className="text-xl font-mono font-black">{formatCurrency(totalBOQEstimates, lang)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-400 uppercase font-mono">Cumulative Certified Expenses</p>
                  <p className="text-xl font-mono font-black text-emerald-300">{formatCurrency(totalApprovedPOValue, lang)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-400 uppercase font-mono">Current Budget Cushion Balance</p>
                  <p className="text-xl font-mono font-black text-blue-300">{formatCurrency(Math.max(0, totalBOQEstimates - totalApprovedPOValue), lang)}</p>
                </div>
              </div>
            </div>

            {/* Budget vs Actual Comparison list */}
            <div className="space-y-3">
              <h4 className="font-display font-bold text-slate-800 text-xs uppercase tracking-wider">Estimated vs Actual Budget Deviations</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredBOQs.map((boq, index) => {
                  const variance = boq.totalEstimatedCost - boq.totalActualCost;
                  const ratio = boq.totalEstimatedCost > 0 ? (boq.totalActualCost / boq.totalEstimatedCost) * 100 : 0;
                  return (
                    <div key={index} className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-xs space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-800 truncate max-w-[150px]">{boq.projectName}</span>
                        <span className="font-mono text-[10px] text-slate-400">BOQ Reference: {boq.boqCode}</span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                          <span>Budget Consumption: {ratio.toFixed(1)}%</span>
                          <span className={variance >= 0 ? 'text-emerald-600 font-bold' : 'text-red-600 font-bold'}>
                            {variance >= 0 ? 'Under Budget' : 'Over Budget'}
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${variance >= 0 ? 'bg-emerald-500' : 'bg-red-500'}`} style={{ width: `${Math.min(100, ratio)}%` }} />
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 pt-2 border-t border-slate-200/50">
                        <span>Estimate: {formatCurrency(boq.totalEstimatedCost, lang)}</span>
                        <span>Expense: {formatCurrency(boq.totalActualCost, lang)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Chronological Audit Trails */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <h4 className="font-display font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-500 animate-spin-slow" />
                <span>Construction System Audit Trail Logs</span>
              </h4>
              <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
                {auditLogs.map((log) => (
                  <div key={log.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-150 flex items-start justify-between text-xs gap-4 hover:bg-slate-100 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[9px] font-black bg-slate-200 text-slate-700 px-2 py-0.2 rounded">{log.userRole}</span>
                        <span className="font-semibold text-slate-800">{log.userName}</span>
                        <span className="text-[9px] text-slate-400 font-mono">{log.createdAt}</span>
                      </div>
                      <p className="text-slate-600 font-sans leading-relaxed">
                        {lang === 'en' ? log.detailsEn : log.detailsBn}
                      </p>
                    </div>
                    <span className="text-[9px] font-mono font-bold uppercase text-slate-400 bg-white border border-slate-200 px-2 py-0.5 rounded">
                      {log.tableName}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
