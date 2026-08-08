import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  FileSpreadsheet, 
  FileText, 
  ShoppingBag, 
  Truck, 
  Receipt, 
  CreditCard, 
  BookOpen, 
  TrendingUp, 
  Plus, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  DollarSign,
  Briefcase,
  AlertTriangle,
  ChevronRight,
  Filter,
  BarChart4,
  Clock,
  Printer,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import { dbService } from '../db/dbService';
import { 
  Vendor, 
  VendorContact, 
  ProcurementRequisition, 
  RfqRequest, 
  VendorQuotation, 
  PurchaseOrder, 
  MaterialReceipt, 
  VendorBill, 
  VendorPayment, 
  VendorLedger,
  Project
} from '../types';

interface ProcurementVendorModuleProps {
  lang: 'en' | 'bn';
}

type TabType = 
  | 'dashboard' 
  | 'vendors' 
  | 'requisitions' 
  | 'rfq' 
  | 'pos' 
  | 'mrns' 
  | 'billing' 
  | 'ledger' 
  | 'reports';

export default function ProcurementVendorModule({ lang }: ProcurementVendorModuleProps) {
  // --- Active Tab State ---
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  // --- Core Data States (Synchronized with dbService) ---
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [contacts, setContacts] = useState<VendorContact[]>([]);
  const [requisitions, setRequisitions] = useState<ProcurementRequisition[]>([]);
  const [rfqs, setRfqs] = useState<RfqRequest[]>([]);
  const [quotations, setQuotations] = useState<VendorQuotation[]>([]);
  const [pos, setPos] = useState<PurchaseOrder[]>([]);
  const [mrns, setMrns] = useState<MaterialReceipt[]>([]);
  const [bills, setBills] = useState<VendorBill[]>([]);
  const [payments, setPayments] = useState<VendorPayment[]>([]);
  const [ledgers, setLedgers] = useState<VendorLedger[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  // --- UI Aux States ---
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVendorId, setSelectedVendorId] = useState<string>('');
  const [selectedRfqId, setSelectedRfqId] = useState<string>('');
  const [selectedPoId, setSelectedPoId] = useState<string>('');
  const [selectedBillId, setSelectedBillId] = useState<string>('');
  
  // Modal controllers
  const [showAddVendor, setShowAddVendor] = useState(false);
  const [showAddContact, setShowAddContact] = useState(false);
  const [showAddRequisition, setShowAddRequisition] = useState(false);
  const [showAddRfq, setShowAddRfq] = useState(false);
  const [showAddQuotation, setShowAddQuotation] = useState(false);
  const [showAddBill, setShowAddBill] = useState(false);
  const [showAddPayment, setShowAddPayment] = useState(false);

  // New Item states
  const [newVendor, setNewVendor] = useState({
    vendorName: '',
    contactPerson: '',
    phone: '',
    email: '',
    tradeLicenseNo: '',
    category: 'Cement',
    status: 'Active' as const
  });

  const [newContact, setNewContact] = useState({
    vendorId: '',
    contactName: '',
    designation: '',
    phone: '',
    email: '',
    isPrimary: false
  });

  const [newReq, setNewReq] = useState({
    projectId: '',
    materialName: 'Cement' as const,
    quantity: 1,
    unit: 'Bags',
    requiredDate: '',
    remarks: ''
  });

  const [newRfq, setNewRfq] = useState({
    requisitionId: '',
    closeDate: '',
    selectedVendors: [] as string[]
  });

  const [newQuotation, setNewQuotation] = useState({
    rfqId: '',
    vendorId: '',
    offeredRate: 0,
    deliveryLeadTimeDays: 3,
    warrantyMonths: 12,
    remarks: ''
  });

  const [newBill, setNewBill] = useState({
    poId: '',
    billNumber: '',
    billAmount: 0,
    dueDate: '',
    remarks: ''
  });

  const [newPayment, setNewPayment] = useState({
    billId: '',
    amountPaid: 0,
    paymentMethod: 'Bank Transfer' as const,
    referenceNo: '',
    remarks: ''
  });

  // --- Load Initial Data ---
  useEffect(() => {
    setVendors(dbService.vendors.getAll());
    setContacts(dbService.vendor_contacts.getAll());
    setRequisitions(dbService.purchase_requisitions.getAll());
    setRfqs(dbService.rfq_requests.getAll());
    setQuotations(dbService.vendor_quotations.getAll());
    setPos(dbService.purchase_orders.getAll());
    setMrns(dbService.material_receipts.getAll());
    setBills(dbService.vendor_bills.getAll());
    setPayments(dbService.vendor_payments.getAll());
    setLedgers(dbService.vendor_ledgers.getAll());
    setProjects(dbService.projects.getAll());
  }, []);

  // --- Material Types ---
  const materialsList = [
    'Cement',
    'Rod',
    'Brick',
    'Sand',
    'Stone',
    'Tiles',
    'Paint',
    'Electrical Items',
    'Plumbing Items',
    'Lift',
    'Generator'
  ];

  // --- Sync helper to update states and save to local repository ---
  const handleSave = <T extends { id: string }>(
    repo: { create: (item: T) => any },
    updater: React.Dispatch<React.SetStateAction<T[]>>,
    newItem: T
  ) => {
    repo.create(newItem);
    updater(prev => [...prev, newItem]);
  };

  const handleUpdate = <T extends { id: string }>(
    repo: { update: (id: string, fn: (item: T) => T) => any },
    updater: React.Dispatch<React.SetStateAction<T[]>>,
    id: string,
    updatedFields: Partial<T>
  ) => {
    repo.update(id, (item: T) => ({ ...item, ...updatedFields }));
    updater(prev => prev.map(item => item.id === id ? { ...item, ...updatedFields } : item));
  };

  // --- Action Handlers ---
  const handleCreateVendor = (e: React.FormEvent) => {
    e.preventDefault();
    const vendor: Vendor = {
      id: `v-${Date.now()}`,
      vendorName: newVendor.vendorName,
      contactPerson: newVendor.contactPerson,
      phone: newVendor.phone,
      email: newVendor.email,
      tradeLicenseNo: newVendor.tradeLicenseNo,
      category: newVendor.category,
      status: newVendor.status,
      outstandingPayable: 0
    };
    handleSave(dbService.vendors, setVendors, vendor);
    setShowAddVendor(false);
    setNewVendor({
      vendorName: '',
      contactPerson: '',
      phone: '',
      email: '',
      tradeLicenseNo: '',
      category: 'Cement',
      status: 'Active'
    });
  };

  const handleCreateContact = (e: React.FormEvent) => {
    e.preventDefault();
    const contact: VendorContact = {
      id: `vc-${Date.now()}`,
      vendorId: newContact.vendorId || vendors[0]?.id || '',
      contactName: newContact.contactName,
      designation: newContact.designation,
      phone: newContact.phone,
      email: newContact.email,
      isPrimary: newContact.isPrimary
    };
    handleSave(dbService.vendor_contacts, setContacts, contact);
    setShowAddContact(false);
    setNewContact({
      vendorId: '',
      contactName: '',
      designation: '',
      phone: '',
      email: '',
      isPrimary: false
    });
  };

  const handleCreateRequisition = (e: React.FormEvent) => {
    e.preventDefault();
    const project = projects.find(p => p.id === newReq.projectId) || projects[0];
    const requisition: ProcurementRequisition = {
      id: `pr-${Date.now()}`,
      prNumber: `PR-2026-${Math.floor(100 + Math.random() * 900)}`,
      projectId: project?.id || 'p1',
      projectName: project?.nameEn || 'Default Project',
      requestedBy: 'Procurement Specialist',
      materialName: newReq.materialName,
      quantity: Number(newReq.quantity),
      unit: newReq.unit,
      requiredDate: newReq.requiredDate || new Date().toISOString().split('T')[0],
      status: 'Draft',
      remarks: newReq.remarks,
      createdAt: new Date().toISOString()
    };
    handleSave(dbService.purchase_requisitions, setRequisitions, requisition);
    setShowAddRequisition(false);
    setNewReq({
      projectId: '',
      materialName: 'Cement',
      quantity: 1,
      unit: 'Bags',
      requiredDate: '',
      remarks: ''
    });
  };

  const handleCreateRfq = (e: React.FormEvent) => {
    e.preventDefault();
    const req = requisitions.find(r => r.id === newRfq.requisitionId);
    if (!req) return;

    const rfq: RfqRequest = {
      id: `rfq-${Date.now()}`,
      rfqNumber: `RFQ-2026-${Math.floor(100 + Math.random() * 900)}`,
      requisitionId: req.id,
      materialName: req.materialName,
      quantity: req.quantity,
      unit: req.unit,
      closeDate: newRfq.closeDate || new Date(Date.now() + 7*24*60*60*1000).toISOString().split('T')[0],
      status: 'Open',
      invitedVendorsJson: JSON.stringify(newRfq.selectedVendors),
      createdAt: new Date().toISOString()
    };
    handleSave(dbService.rfq_requests, setRfqs, rfq);
    // Update requisition status
    handleUpdate(dbService.purchase_requisitions, setRequisitions, req.id, { status: 'RFQ Created' });
    setShowAddRfq(false);
    setNewRfq({
      requisitionId: '',
      closeDate: '',
      selectedVendors: []
    });
  };

  const handleCreateQuotation = (e: React.FormEvent) => {
    e.preventDefault();
    const rfqObj = rfqs.find(r => r.id === newQuotation.rfqId) || rfqs[0];
    const vendorObj = vendors.find(v => v.id === newQuotation.vendorId) || vendors[0];
    if (!rfqObj || !vendorObj) return;

    const rate = Number(newQuotation.offeredRate);
    const total = rate * rfqObj.quantity;

    const quotation: VendorQuotation = {
      id: `vq-${Date.now()}`,
      quotationNumber: `QT-2026-${Math.floor(100 + Math.random() * 900)}`,
      rfqId: rfqObj.id,
      rfqNumber: rfqObj.rfqNumber,
      vendorId: vendorObj.id,
      vendorName: vendorObj.vendorName,
      materialName: rfqObj.materialName,
      offeredRate: rate,
      totalPrice: total,
      deliveryLeadTimeDays: Number(newQuotation.deliveryLeadTimeDays),
      warrantyMonths: Number(newQuotation.warrantyMonths) || undefined,
      status: 'Submitted',
      remarks: newQuotation.remarks,
      createdAt: new Date().toISOString()
    };
    handleSave(dbService.vendor_quotations, setQuotations, quotation);
    setShowAddQuotation(false);
    setNewQuotation({
      rfqId: '',
      vendorId: '',
      offeredRate: 0,
      deliveryLeadTimeDays: 3,
      warrantyMonths: 12,
      remarks: ''
    });
  };

  // Accept a quotation and trigger PO automatically
  const handleAcceptQuotation = (q: VendorQuotation) => {
    // 1. Accept quotation
    handleUpdate(dbService.vendor_quotations, setQuotations, q.id, { status: 'Accepted' });
    // Reject other quotations for the same RFQ
    quotations.filter(other => other.rfqId === q.rfqId && other.id !== q.id)
      .forEach(other => handleUpdate(dbService.vendor_quotations, setQuotations, other.id, { status: 'Rejected' }));

    // Update RFQ status
    handleUpdate(dbService.rfq_requests, setRfqs, q.rfqId, { status: 'Evaluated' });

    // Find original requisition & project
    const rfqObj = rfqs.find(r => r.id === q.rfqId);
    const prObj = requisitions.find(r => r.id === rfqObj?.requisitionId);

    // 2. Generate PO
    const po: PurchaseOrder = {
      id: `po-${Date.now()}`,
      poNumber: `PO-2026-${Math.floor(100 + Math.random() * 900)}`,
      requisitionId: rfqObj?.requisitionId || '',
      vendorId: q.vendorId,
      vendorName: q.vendorName,
      projectId: prObj?.projectId || 'p1',
      projectName: prObj?.projectName || 'Al Kaswa Uttara Skyline',
      materialName: q.materialName,
      category: q.materialName,
      quantity: rfqObj?.quantity || 10,
      rate: q.offeredRate,
      totalAmount: q.totalPrice,
      deliveryDate: new Date(Date.now() + q.deliveryLeadTimeDays*24*60*60*1000).toISOString().split('T')[0],
      status: 'Approved',
      createdAt: new Date().toISOString()
    };
    handleSave(dbService.purchase_orders, setPos, po);
  };

  // Generate MRN from PO
  const handleReceiveMaterial = (po: PurchaseOrder) => {
    const mrn: MaterialReceipt = {
      id: `mrn-${Date.now()}`,
      receiptNo: `MRN-2026-${Math.floor(100 + Math.random() * 900)}`,
      poNumber: po.poNumber,
      projectId: po.projectId,
      projectName: po.projectName,
      materialName: po.materialName,
      category: po.category,
      receivedQuantity: po.quantity,
      receivedDate: new Date().toISOString().split('T')[0],
      inspectedBy: 'Quality Inspector Engr.',
      remarks: 'Quantity matched completely. Inspected & approved.'
    };
    handleSave(dbService.material_receipts, setMrns, mrn);
    handleUpdate(dbService.purchase_orders, setPos, po.id, { status: 'Delivered' });
  };

  // Add Vendor Bill against PO / MRN
  const handleCreateBill = (e: React.FormEvent) => {
    e.preventDefault();
    const poObj = pos.find(p => p.id === newBill.poId) || pos[0];
    if (!poObj) return;

    const amount = Number(newBill.billAmount);
    const bill: VendorBill = {
      id: `vb-${Date.now()}`,
      billNumber: newBill.billNumber || `BILL-${Math.floor(1000 + Math.random() * 9000)}`,
      poId: poObj.id,
      poNumber: poObj.poNumber,
      vendorId: poObj.vendorId,
      vendorName: poObj.vendorName,
      billAmount: amount,
      billDate: new Date().toISOString().split('T')[0],
      dueDate: newBill.dueDate || new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
      status: 'Unpaid',
      remarks: newBill.remarks,
      createdAt: new Date().toISOString()
    };
    handleSave(dbService.vendor_bills, setBills, bill);

    // Update Vendor Outstanding Payables
    const vObj = vendors.find(v => v.id === poObj.vendorId);
    if (vObj) {
      handleUpdate(dbService.vendors, setVendors, vObj.id, { 
        outstandingPayable: vObj.outstandingPayable + amount 
      });
    }

    // Append to Vendor Ledger
    const lastLedger = ledgers.filter(l => l.vendorId === poObj.vendorId).pop();
    const currentBalance = (lastLedger?.balance || 0) + amount;
    const ledgerEntry: VendorLedger = {
      id: `vl-${Date.now()}`,
      vendorId: poObj.vendorId,
      vendorName: poObj.vendorName,
      transactionDate: new Date().toISOString().split('T')[0],
      transactionType: 'Bill',
      referenceNo: bill.billNumber,
      debit: 0,
      credit: amount,
      balance: currentBalance,
      remarks: `Invoice raised for ${poObj.materialName}`
    };
    handleSave(dbService.vendor_ledgers, setLedgers, ledgerEntry);

    setShowAddBill(false);
    setNewBill({
      poId: '',
      billNumber: '',
      billAmount: 0,
      dueDate: '',
      remarks: ''
    });
  };

  // Add payment
  const handleCreatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    const billObj = bills.find(b => b.id === newPayment.billId) || bills[0];
    if (!billObj) return;

    const amount = Number(newPayment.amountPaid);
    const payment: VendorPayment = {
      id: `pay-${Date.now()}`,
      paymentNumber: `PAY-2026-${Math.floor(100 + Math.random() * 900)}`,
      billId: billObj.id,
      billNumber: billObj.billNumber,
      vendorId: billObj.vendorId,
      vendorName: billObj.vendorName,
      amountPaid: amount,
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: newPayment.paymentMethod,
      referenceNo: newPayment.referenceNo,
      remarks: newPayment.remarks
    };
    handleSave(dbService.vendor_payments, setPayments, payment);

    // Update bill status
    const remaining = billObj.billAmount - amount;
    const newStatus = remaining <= 0 ? 'Paid' : 'Partially Paid';
    handleUpdate(dbService.vendor_bills, setBills, billObj.id, { status: newStatus });

    // Update Vendor Outstanding
    const vObj = vendors.find(v => v.id === billObj.vendorId);
    if (vObj) {
      handleUpdate(dbService.vendors, setVendors, vObj.id, { 
        outstandingPayable: Math.max(0, vObj.outstandingPayable - amount) 
      });
    }

    // Append to Ledger
    const lastLedger = ledgers.filter(l => l.vendorId === billObj.vendorId).pop();
    const currentBalance = Math.max(0, (lastLedger?.balance || 0) - amount);
    const ledgerEntry: VendorLedger = {
      id: `vl-${Date.now()}`,
      vendorId: billObj.vendorId,
      vendorName: billObj.vendorName,
      transactionDate: new Date().toISOString().split('T')[0],
      transactionType: 'Payment',
      referenceNo: payment.paymentNumber,
      debit: amount,
      credit: 0,
      balance: currentBalance,
      remarks: `Paid via ${newPayment.paymentMethod}`
    };
    handleSave(dbService.vendor_ledgers, setLedgers, ledgerEntry);

    setShowAddPayment(false);
    setNewPayment({
      billId: '',
      amountPaid: 0,
      paymentMethod: 'Bank Transfer',
      referenceNo: '',
      remarks: ''
    });
  };

  // Helper formatting currency
  const formatCur = (val: number) => {
    return '৳' + val.toLocaleString('en-US');
  };

  // Filtering based on search query
  const filteredVendors = vendors.filter(v => 
    v.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    v.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6" id="procurement-vendor-module">
      {/* Dynamic Tab Navigation Rail */}
      <div className="flex bg-slate-900 text-slate-100 p-2.5 rounded-2xl items-center justify-between shadow-lg flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500 p-2 rounded-xl text-white">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-sm tracking-wide">
              {lang === 'en' ? 'AL KASWA PROCUREMENT & SUPPLIER ERP' : 'আল কাসওয়া প্রকিউরমেন্ট ও সাপ্লায়ার ইআরপি'}
            </h3>
            <p className="text-[10px] text-slate-400">
              {lang === 'en' ? 'Phase 9: Procurement Lifecycle, Bid Comparison & Vendor Ledgers' : 'ধাপ ৯: প্রকিউরমেন্ট লাইফসাইকেল, বিড তুলনা ও ভেন্ডর লেজার'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1">
          {[
            { id: 'dashboard', label: lang === 'en' ? 'Overview' : 'ওভারভিউ', icon: TrendingUp },
            { id: 'vendors', label: lang === 'en' ? 'Vendors & Suppliers' : 'ভেন্ডর ও সাপ্লায়ার', icon: Users },
            { id: 'requisitions', label: lang === 'en' ? 'Requisitions (PR)' : 'রিকুইজিশন (PR)', icon: FileSpreadsheet },
            { id: 'rfq', label: lang === 'en' ? 'Sourcing & RFQ' : 'আরএফকিউ', icon: Briefcase },
            { id: 'pos', label: lang === 'en' ? 'Purchase Orders (PO)' : 'ক্রয় আদেশ (PO)', icon: ShoppingBag },
            { id: 'mrns', label: lang === 'en' ? 'Receipts (MRN)' : 'মালামাল গ্রহণ (MRN)', icon: Truck },
            { id: 'billing', label: lang === 'en' ? 'Billing & Payments' : 'বিল ও পেমেন্ট', icon: Receipt },
            { id: 'ledger', label: lang === 'en' ? 'Vendor Ledgers' : 'ভেন্ডর লেজার', icon: BookOpen },
            { id: 'reports', label: lang === 'en' ? 'Reports Engine' : 'রিপোর্ট ইঞ্জিন', icon: BarChart4 }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === tab.id 
                    ? 'bg-emerald-500 text-white shadow-md' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
                id={`proc-tab-${tab.id}`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* --- Tab 1: Dashboard / Overview --- */}
      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6" id="proc-view-dashboard">
          {/* Key Metrics Row */}
          <div className="lg:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-2">
              <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">{lang === 'en' ? 'Total Suppliers' : 'মোট সাপ্লায়ার'}</span>
              <div className="flex justify-between items-center">
                <span className="font-display font-black text-2xl text-slate-800">{vendors.length}</span>
                <Users className="text-blue-500 w-5 h-5" />
              </div>
              <span className="text-[10px] text-slate-500">{lang === 'en' ? 'Active in system' : 'সিস্টেমে সচল'}</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-2">
              <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">{lang === 'en' ? 'Pending Requisitions' : 'পেন্ডিং রিকুইজিশন'}</span>
              <div className="flex justify-between items-center">
                <span className="font-display font-black text-2xl text-amber-600">{requisitions.filter(r => r.status === 'Draft' || r.status === 'Pending Approval').length}</span>
                <FileSpreadsheet className="text-amber-500 w-5 h-5" />
              </div>
              <span className="text-[10px] text-slate-500">{lang === 'en' ? 'Needs review' : 'পর্যালোচনা প্রয়োজন'}</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-2">
              <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">{lang === 'en' ? 'Active Purchase Orders' : 'সচল ক্রয় আদেশ'}</span>
              <div className="flex justify-between items-center">
                <span className="font-display font-black text-2xl text-emerald-600">{pos.filter(p => p.status === 'Approved').length}</span>
                <ShoppingBag className="text-emerald-500 w-5 h-5" />
              </div>
              <span className="text-[10px] text-slate-500">{lang === 'en' ? 'Awaiting delivery' : 'ডেলিভারির অপেক্ষায়'}</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-2">
              <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">{lang === 'en' ? 'Total Outstanding Payable' : 'মোট প্রদেয় বকেয়া'}</span>
              <div className="flex justify-between items-center">
                <span className="font-display font-black text-lg text-rose-600">{formatCur(vendors.reduce((sum, v) => sum + v.outstandingPayable, 0))}</span>
                <DollarSign className="text-rose-500 w-5 h-5" />
              </div>
              <span className="text-[10px] text-slate-500">{lang === 'en' ? 'Across all verified vendors' : 'সকল ভেন্ডরের বকেয়া'}</span>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4">
            <h4 className="font-display font-bold text-sm text-slate-800">{lang === 'en' ? 'Quick Actions' : 'দ্রুত লিঙ্কসমূহ'}</h4>
            <div className="flex flex-col gap-2">
              <button onClick={() => setShowAddRequisition(true)} className="flex items-center justify-between w-full p-3 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-100 hover:border-emerald-200 transition-all text-xs font-semibold cursor-pointer">
                <span>{lang === 'en' ? 'Raise Purchase Requisition' : 'নতুন রিকুইজিশন তৈরি'}</span>
                <Plus className="w-4 h-4" />
              </button>
              <button onClick={() => setShowAddVendor(true)} className="flex items-center justify-between w-full p-3 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-100 hover:border-emerald-200 transition-all text-xs font-semibold cursor-pointer">
                <span>{lang === 'en' ? 'Onboard New Vendor' : 'নতুন ভেন্ডর যুক্ত করুন'}</span>
                <Plus className="w-4 h-4" />
              </button>
              <button onClick={() => setShowAddBill(true)} className="flex items-center justify-between w-full p-3 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-100 hover:border-emerald-200 transition-all text-xs font-semibold cursor-pointer">
                <span>{lang === 'en' ? 'Process Vendor Invoice' : 'ভেন্ডর বিল সাবমিট করুন'}</span>
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-3">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{lang === 'en' ? 'Active Materials Monitored' : 'নজরদারিকৃত মালামাল'}</span>
              <div className="flex flex-wrap gap-1.5">
                {materialsList.slice(0, 7).map(mat => (
                  <span key={mat} className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-medium">{mat}</span>
                ))}
                <span className="px-2.5 py-1 bg-slate-100 text-slate-400 rounded-lg text-[10px] font-medium">+{materialsList.length - 7} more</span>
              </div>
            </div>
          </div>

          {/* Sourcing Timeline */}
          <div className="lg:col-span-3 bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-5">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-display font-bold text-sm text-slate-800">{lang === 'en' ? 'Live Procurement Pipeline' : 'চলতি প্রকিউরমেন্ট পাইপলাইন'}</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">{lang === 'en' ? 'Tracks status from Requisition to Delivery' : 'রিকুইজিশন থেকে ডেলিভারি পর্যন্ত ট্র্যাকিং'}</p>
              </div>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-bold">Realtime</span>
            </div>

            <div className="relative border-l-2 border-slate-100 pl-6 ml-2 space-y-6">
              {requisitions.slice(-2).map((req, idx) => (
                <div key={req.id} className="relative group">
                  <div className="absolute -left-[31px] top-1.5 w-4.5 h-4.5 rounded-full border-4 border-white bg-amber-500 shadow-sm" />
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-800">{req.materialName} ({req.quantity} {req.unit})</span>
                      <p className="text-[10px] text-slate-400">{req.projectName} • {lang === 'en' ? 'Requisition' : 'রিকুইজিশন'} {req.prNumber}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-100">{req.status}</span>
                  </div>
                </div>
              ))}

              {pos.slice(-1).map((po, idx) => (
                <div key={po.id} className="relative group">
                  <div className="absolute -left-[31px] top-1.5 w-4.5 h-4.5 rounded-full border-4 border-white bg-emerald-500 shadow-sm" />
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-800">{po.materialName} Order Placed ({po.quantity} Bags/Tons)</span>
                      <p className="text-[10px] text-slate-400">Vendor: {po.vendorName} • {po.poNumber}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">{po.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- Tab 2: Vendors & Suppliers --- */}
      {activeTab === 'vendors' && (
        <div className="space-y-6" id="proc-view-vendors">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h4 className="font-display font-bold text-sm text-slate-800">{lang === 'en' ? 'Supplier Database & Contact Center' : 'সাপ্লায়ার ডেটাবেজ ও যোগাযোগ কেন্দ্র'}</h4>
              <p className="text-xs text-slate-400 mt-0.5">{lang === 'en' ? 'Manage verified trade suppliers and primary contacts' : 'অনুমোদিত ভেন্ডর এবং তাদের যোগাযোগ কারীদের তথ্য পরিচালনা করুন'}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowAddVendor(true)} className="bg-slate-900 text-white hover:bg-slate-800 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer">
                <Plus className="w-4 h-4" />
                {lang === 'en' ? 'Onboard Vendor' : 'ভেন্ডর যুক্ত করুন'}
              </button>
              <button onClick={() => setShowAddContact(true)} className="bg-slate-100 text-slate-700 hover:bg-slate-200 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer">
                <Plus className="w-4 h-4" />
                {lang === 'en' ? 'Add Contact Person' : 'যোগাযোগকারী ব্যক্তি যুক্ত করুন'}
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center gap-3">
            <Search className="text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder={lang === 'en' ? 'Search vendor name, category, license number...' : 'নাম, ক্যাটাগরি বা লাইসেন্স দিয়ে খুঁজুন...'}
              className="bg-transparent border-none outline-none text-xs text-slate-700 w-full"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* List */}
            <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    <th className="p-4">{lang === 'en' ? 'Vendor / Business' : 'ব্যবসার নাম'}</th>
                    <th className="p-4">{lang === 'en' ? 'Trade License' : 'ট্রেড লাইসেন্স'}</th>
                    <th className="p-4">{lang === 'en' ? 'Category' : 'ধরণ'}</th>
                    <th className="p-4 text-right">{lang === 'en' ? 'Outstanding' : 'বকেয়া'}</th>
                    <th className="p-4 text-center">{lang === 'en' ? 'Status' : 'অবস্থা'}</th>
                    <th className="p-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-xs">
                  {filteredVendors.map(v => (
                    <tr 
                      key={v.id} 
                      className={`hover:bg-slate-50/50 transition-colors cursor-pointer ${selectedVendorId === v.id ? 'bg-slate-50' : ''}`}
                      onClick={() => setSelectedVendorId(v.id)}
                    >
                      <td className="p-4">
                        <span className="font-bold text-slate-800">{v.vendorName}</span>
                        <p className="text-[10px] text-slate-400">{v.contactPerson} • {v.phone}</p>
                      </td>
                      <td className="p-4 font-mono text-[10px] text-slate-500">{v.tradeLicenseNo}</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[10px] font-medium">{v.category}</span>
                      </td>
                      <td className="p-4 text-right font-bold text-slate-700">{formatCur(v.outstandingPayable)}</td>
                      <td className="p-4 text-center">
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold ${
                          v.status === 'Active' 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                            : 'bg-rose-50 text-rose-700 border border-rose-100'
                        }`}>
                          {v.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Side Detail Card for selected vendor */}
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-6">
              {selectedVendorId ? (() => {
                const vendorObj = vendors.find(v => v.id === selectedVendorId);
                const vendorContacts = contacts.filter(c => c.vendorId === selectedVendorId);
                if (!vendorObj) return <p className="text-xs text-slate-400 text-center">{lang === 'en' ? 'Vendor not found' : 'ভেন্ডর পাওয়া যায়নি'}</p>;
                return (
                  <>
                    <div>
                      <span className="text-[9px] bg-slate-200/80 px-2.5 py-1 rounded-full text-slate-600 font-bold uppercase tracking-wider">{vendorObj.category}</span>
                      <h4 className="font-display font-bold text-base text-slate-800 mt-2">{vendorObj.vendorName}</h4>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">ID: {vendorObj.id} • License: {vendorObj.tradeLicenseNo}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200/50">
                      <div>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{lang === 'en' ? 'Outstanding Balance' : 'চলতি বকেয়া'}</span>
                        <p className="text-sm font-black text-rose-600 mt-0.5">{formatCur(vendorObj.outstandingPayable)}</p>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{lang === 'en' ? 'Supplier Status' : 'ভেন্ডর অবস্থা'}</span>
                        <p className="text-xs font-bold text-slate-700 mt-1">{vendorObj.status}</p>
                      </div>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-slate-200/50">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{lang === 'en' ? 'Vendor Contacts' : 'যোগাযোগের ব্যক্তিবর্গ'}</span>
                      {vendorContacts.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">{lang === 'en' ? 'No contacts registered' : 'কোন যোগাযোগের ব্যক্তি নেই'}</p>
                      ) : (
                        <div className="space-y-2.5">
                          {vendorContacts.map(c => (
                            <div key={c.id} className="bg-white p-3 rounded-xl border border-slate-100 shadow-3xs space-y-1">
                              <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-slate-800">{c.contactName}</span>
                                {c.isPrimary && <span className="bg-emerald-50 text-emerald-700 text-[8px] font-bold px-1.5 py-0.5 rounded border border-emerald-100">Primary</span>}
                              </div>
                              <p className="text-[10px] text-slate-500">{c.designation}</p>
                              <p className="text-[10px] font-mono text-slate-400">{c.phone} • {c.email}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                );
              })() : (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-3 py-12">
                  <div className="p-3 bg-slate-200/50 text-slate-400 rounded-full">
                    <Users className="w-8 h-8" />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-slate-700">{lang === 'en' ? 'No Vendor Selected' : 'কোন ভেন্ডর নির্বাচিত নেই'}</h5>
                    <p className="text-[10px] text-slate-400 mt-0.5">{lang === 'en' ? 'Click on a row to inspect contacts & details' : 'তথ্য দেখতে টেবিলে ক্লিক করুন'}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- Tab 3: Requisitions (PR) --- */}
      {activeTab === 'requisitions' && (
        <div className="space-y-6" id="proc-view-requisitions">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h4 className="font-display font-bold text-sm text-slate-800">{lang === 'en' ? 'Purchase Requisition Center (PR)' : 'ক্রয় রিকুইজিশন সেন্টার (PR)'}</h4>
              <p className="text-xs text-slate-400 mt-0.5">{lang === 'en' ? 'Track construction site material demands and status' : 'সাইটের মালামাল রিকুইজিশন এবং অনুমোদন ট্র্যাক করুন'}</p>
            </div>
            <button onClick={() => setShowAddRequisition(true)} className="bg-slate-900 text-white hover:bg-slate-800 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer">
              <Plus className="w-4 h-4" />
              {lang === 'en' ? 'Raise New Requisition' : 'নতুন রিকুইজিশন উত্থাপন'}
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  <th className="p-4">{lang === 'en' ? 'PR Details' : 'রিকুইজিশন বিবরণ'}</th>
                  <th className="p-4">{lang === 'en' ? 'Project' : 'প্রকল্প'}</th>
                  <th className="p-4">{lang === 'en' ? 'Material & Quantity' : 'মালামাল ও পরিমাণ'}</th>
                  <th className="p-4">{lang === 'en' ? 'Target Date' : 'প্রয়োজনীয় তারিখ'}</th>
                  <th className="p-4 text-center">{lang === 'en' ? 'Status' : 'অবস্থা'}</th>
                  <th className="p-4 text-right">{lang === 'en' ? 'Action' : 'পদক্ষেপ'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs">
                {requisitions.map(req => (
                  <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <span className="font-bold text-slate-800">{req.prNumber}</span>
                      <p className="text-[10px] text-slate-400">Created: {new Date(req.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td className="p-4">
                      <span className="font-semibold text-slate-700">{req.projectName}</span>
                      <p className="text-[10px] text-slate-400">By: {req.requestedBy}</p>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-slate-800">{req.materialName}</span>
                      <p className="text-[10px] text-slate-500 font-mono">{req.quantity} {req.unit}</p>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {req.requiredDate}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold ${
                        req.status === 'Approved' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          : req.status === 'RFQ Created'
                          ? 'bg-blue-50 text-blue-700 border border-blue-100'
                          : req.status === 'Rejected'
                          ? 'bg-rose-50 text-rose-700 border border-rose-100'
                          : 'bg-amber-50 text-amber-700 border border-amber-100'
                      }`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {req.status === 'Draft' && (
                        <div className="flex gap-1 justify-end">
                          <button 
                            onClick={() => handleUpdate(dbService.purchase_requisitions, setRequisitions, req.id, { status: 'Approved' })}
                            className="p-1 text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                            title="Approve"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleUpdate(dbService.purchase_requisitions, setRequisitions, req.id, { status: 'Rejected' })}
                            className="p-1 text-rose-600 hover:bg-rose-50 rounded transition-colors"
                            title="Reject"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                      {req.status === 'Approved' && (
                        <button 
                          onClick={() => {
                            setNewRfq(prev => ({ ...prev, requisitionId: req.id }));
                            setShowAddRfq(true);
                            setActiveTab('rfq');
                          }}
                          className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-2.5 py-1 rounded text-[10px] font-bold transition-all cursor-pointer"
                        >
                          {lang === 'en' ? 'Create RFQ' : 'আরএফকিউ তৈরি'}
                        </button>
                      )}
                      {req.status === 'RFQ Created' && (
                        <span className="text-[10px] text-slate-400 italic">{lang === 'en' ? 'RFQ Sourced' : 'আরএফকিউ তৈরি করা হয়েছে'}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- Tab 4: Request for Quotation (RFQ) & Sourcing --- */}
      {activeTab === 'rfq' && (
        <div className="space-y-6" id="proc-view-rfq">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h4 className="font-display font-bold text-sm text-slate-800">{lang === 'en' ? 'Request For Quotation (RFQ) & Quotation Comparison' : 'আরএফকিউ ও কোটেশন তুলনা পোর্টাল'}</h4>
              <p className="text-xs text-slate-400 mt-0.5">{lang === 'en' ? 'Launch biddings and analyze quotation comparison reports' : 'কোটেশন তুলনা রিপোর্ট ও ভেন্ডর সিলেকশন পোর্টাল'}</p>
            </div>
            <button onClick={() => setShowAddQuotation(true)} className="bg-slate-900 text-white hover:bg-slate-800 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer">
              <Plus className="w-4 h-4" />
              {lang === 'en' ? 'Submit Vendor Bid' : 'ভেন্ডর কোটেশন যুক্ত করুন'}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* RFQs List */}
            <div className="lg:col-span-1 bg-white p-5 rounded-3xl border border-slate-100 space-y-4 shadow-xs">
              <h5 className="font-display font-bold text-xs text-slate-800 uppercase tracking-wider">{lang === 'en' ? 'Active RFQs' : 'সচল আরএফকিউ'}</h5>
              <div className="space-y-2.5">
                {rfqs.map(r => (
                  <div 
                    key={r.id} 
                    onClick={() => setSelectedRfqId(r.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      selectedRfqId === r.id 
                        ? 'border-emerald-500 bg-emerald-50/20' 
                        : 'border-slate-100 bg-white hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-xs text-slate-800">{r.rfqNumber}</span>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                        r.status === 'Open' 
                          ? 'bg-blue-50 text-blue-700' 
                          : 'bg-emerald-50 text-emerald-700'
                      }`}>{r.status}</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-700 mt-1">{r.materialName} ({r.quantity} {r.unit})</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Closing Date: {r.closeDate}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Side Comparison Panel (Quotation Comparison Module) */}
            <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-6">
              {selectedRfqId ? (() => {
                const rfqObj = rfqs.find(r => r.id === selectedRfqId);
                const rfqQuotations = quotations.filter(q => q.rfqId === selectedRfqId);
                if (!rfqObj) return null;

                return (
                  <>
                    <div className="flex justify-between items-center flex-wrap gap-2">
                      <div>
                        <span className="text-[9px] bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-mono">{rfqObj.rfqNumber}</span>
                        <h4 className="font-display font-bold text-sm text-slate-800 mt-1">
                          {lang === 'en' ? 'Quotation Comparison Matrix' : 'কোটেশন তুলনা ছক'}: {rfqObj.materialName}
                        </h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">Quantity Required: {rfqObj.quantity} {rfqObj.unit} • Close Date: {rfqObj.closeDate}</p>
                      </div>
                    </div>

                    {rfqQuotations.length === 0 ? (
                      <div className="text-center py-12 space-y-2 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                        <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
                        <h5 className="font-bold text-xs text-slate-700">{lang === 'en' ? 'No Bids Received Yet' : 'এখনো কোন কোটেশন পাওয়া যায়নি'}</h5>
                        <p className="text-[10px] text-slate-400">{lang === 'en' ? 'Use the submit vendor bid button to record a quotation for comparison.' : 'তুলনা করতে নতুন ভেন্ডর কোটেশন ফর্ম পূরণ করুন।'}</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {rfqQuotations.map(q => {
                            const isBestPrice = q.offeredRate === Math.min(...rfqQuotations.map(item => item.offeredRate));
                            return (
                              <div 
                                key={q.id} 
                                className={`p-5 rounded-2xl border transition-all ${
                                  q.status === 'Accepted'
                                    ? 'border-emerald-500 bg-emerald-50/10'
                                    : isBestPrice
                                    ? 'border-blue-200 bg-blue-50/10'
                                    : 'border-slate-150 bg-slate-50/20'
                                }`}
                              >
                                <div className="flex justify-between items-start">
                                  <div>
                                    <span className="text-xs font-black text-slate-800">{q.vendorName}</span>
                                    <p className="text-[10px] text-slate-400">Bid Ref: {q.quotationNumber}</p>
                                  </div>
                                  {isBestPrice && <span className="bg-blue-100 text-blue-700 text-[8px] font-bold px-2 py-0.5 rounded-full">Lowest Rate</span>}
                                </div>

                                <div className="grid grid-cols-2 gap-3 mt-4 text-[11px] border-t border-b border-slate-100 py-3">
                                  <div>
                                    <span className="text-slate-400">Offered Rate</span>
                                    <p className="font-bold text-slate-800">{formatCur(q.offeredRate)} / {rfqObj.unit}</p>
                                  </div>
                                  <div>
                                    <span className="text-slate-400">Total Price</span>
                                    <p className="font-black text-slate-800">{formatCur(q.totalPrice)}</p>
                                  </div>
                                  <div>
                                    <span className="text-slate-400">Delivery Leadtime</span>
                                    <p className="font-bold text-slate-700">{q.deliveryLeadTimeDays} {lang === 'en' ? 'Days' : 'দিন'}</p>
                                  </div>
                                  <div>
                                    <span className="text-slate-400">Warranty</span>
                                    <p className="font-bold text-slate-700">{q.warrantyMonths ? `${q.warrantyMonths} Months` : 'N/A'}</p>
                                  </div>
                                </div>

                                <div className="mt-4 flex items-center justify-between">
                                  <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${
                                    q.status === 'Accepted' 
                                      ? 'bg-emerald-100 text-emerald-800' 
                                      : 'bg-slate-100 text-slate-600'
                                  }`}>{q.status}</span>

                                  {q.status === 'Submitted' && rfqObj.status === 'Open' && (
                                    <button 
                                      onClick={() => handleAcceptQuotation(q)}
                                      className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1 rounded text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                                    >
                                      Accept & Create PO
                                      <ArrowRight className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </>
                );
              })() : (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-3 py-16">
                  <div className="p-3 bg-slate-100 text-slate-400 rounded-full">
                    <FileText className="w-8 h-8" />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-slate-700">{lang === 'en' ? 'No RFQ Selected' : 'কোন আরএফকিউ সিলেক্ট করা নেই'}</h5>
                    <p className="text-[10px] text-slate-400 mt-0.5">{lang === 'en' ? 'Select an active RFQ from the left directory to analyze bids' : 'বাম পাশের তালিকা থেকে একটি সক্রিয় আরএফকিউ সিলেক্ট করুন'}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- Tab 5: Purchase Orders (PO) --- */}
      {activeTab === 'pos' && (
        <div className="space-y-6" id="proc-view-pos">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h4 className="font-display font-bold text-sm text-slate-800">{lang === 'en' ? 'Purchase Order Management (PO)' : 'ক্রয় আদেশ ব্যবস্থাপনা (PO)'}</h4>
              <p className="text-xs text-slate-400 mt-0.5">{lang === 'en' ? 'Review generated PO contracts and trigger Material Receipts' : 'তৈরিকৃত পিও বা পারচেজ অর্ডার নিরীক্ষা করুন ও মালামাল গ্রহণ ট্র্যাকিং করুন'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    <th className="p-4">{lang === 'en' ? 'PO Number' : 'পিও নম্বর'}</th>
                    <th className="p-4">{lang === 'en' ? 'Supplier' : 'সাপ্লায়ার'}</th>
                    <th className="p-4">{lang === 'en' ? 'Material / Scope' : 'মালামাল বিবরণ'}</th>
                    <th className="p-4 text-right">{lang === 'en' ? 'Total Amount' : 'মোট মূল্য'}</th>
                    <th className="p-4 text-center">{lang === 'en' ? 'Status' : 'অবস্থা'}</th>
                    <th className="p-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-xs">
                  {pos.map(po => (
                    <tr 
                      key={po.id} 
                      className={`hover:bg-slate-50/50 transition-colors cursor-pointer ${selectedPoId === po.id ? 'bg-slate-50' : ''}`}
                      onClick={() => setSelectedPoId(po.id)}
                    >
                      <td className="p-4">
                        <span className="font-bold text-slate-800">{po.poNumber}</span>
                        <p className="text-[10px] text-slate-400">{new Date(po.createdAt).toLocaleDateString()}</p>
                      </td>
                      <td className="p-4">
                        <span className="font-semibold text-slate-700">{po.vendorName}</span>
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-slate-800">{po.materialName}</span>
                        <p className="text-[10px] text-slate-400">{po.quantity} Bags/Tons @ {formatCur(po.rate)}</p>
                      </td>
                      <td className="p-4 text-right font-black text-slate-800">{formatCur(po.totalAmount)}</td>
                      <td className="p-4 text-center">
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold ${
                          po.status === 'Delivered' 
                            ? 'bg-slate-100 text-slate-500' 
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                        }`}>
                          {po.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Details Viewer & Material Receipt triggers */}
            <div className="bg-slate-900 text-white p-6 rounded-3xl space-y-6 shadow-xl">
              {selectedPoId ? (() => {
                const poObj = pos.find(p => p.id === selectedPoId);
                if (!poObj) return null;
                return (
                  <div className="space-y-6">
                    <div>
                      <span className="text-[9px] bg-emerald-500 text-white px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">{poObj.status}</span>
                      <h4 className="font-display font-bold text-lg text-white mt-3">{poObj.poNumber}</h4>
                      <p className="text-[10px] text-slate-400 mt-1">Generated automatically on bid approval</p>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-slate-800 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">{lang === 'en' ? 'Supplier Name' : 'সরবরাহকারী'}</span>
                        <span className="font-bold text-right">{poObj.vendorName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">{lang === 'en' ? 'Project Site' : 'সাইট প্রকল্প'}</span>
                        <span className="font-bold text-right">{poObj.projectName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">{lang === 'en' ? 'Scope of Supply' : 'সরবরাহ বিবরণ'}</span>
                        <span className="font-bold text-right">{poObj.materialName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">{lang === 'en' ? 'Order Volume' : 'অর্ডার ভলিউম'}</span>
                        <span className="font-bold text-right">{poObj.quantity} units</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">{lang === 'en' ? 'Price Rate' : 'দর বা রেট'}</span>
                        <span className="font-bold text-right">{formatCur(poObj.rate)}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-slate-800">
                        <span className="text-slate-300 font-bold">{lang === 'en' ? 'Total PO Value' : 'মোট মূল্য'}</span>
                        <span className="font-black text-emerald-400">{formatCur(poObj.totalAmount)}</span>
                      </div>
                    </div>

                    {poObj.status === 'Approved' && (
                      <div className="pt-4 border-t border-slate-800 space-y-2">
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">{lang === 'en' ? 'Goods Receiving Verification' : 'মাল প্রাপ্তি যাচাই'}</span>
                        <button 
                          onClick={() => handleReceiveMaterial(poObj)}
                          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Truck className="w-4 h-4" />
                          {lang === 'en' ? 'Log Material Receiving (MRN)' : 'মালামাল প্রাপ্তি নোট (MRN) বুক করুন'}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })() : (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-3 py-16">
                  <div className="p-3 bg-slate-800 text-slate-500 rounded-full">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-white">{lang === 'en' ? 'No PO Selected' : 'কোন পিও নির্বাচিত নেই'}</h5>
                    <p className="text-[10px] text-slate-400 mt-0.5">{lang === 'en' ? 'Click on a purchase order from the table to inspect details' : 'ডিটেইলস দেখতে টেবিলে পিও ক্লিক করুন'}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- Tab 6: Material Receipts (MRN) --- */}
      {activeTab === 'mrns' && (
        <div className="space-y-6" id="proc-view-mrns">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h4 className="font-display font-bold text-sm text-slate-800">{lang === 'en' ? 'Material Receiving Logs (MRN)' : 'মালামাল গ্রহণ খতিয়ান (MRN)'}</h4>
              <p className="text-xs text-slate-400 mt-0.5">{lang === 'en' ? 'Verify on-site arrivals and quality inspection records' : 'সাইটে মালামাল আগমন ও গুণমান যাচাই বিবরণ'}</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  <th className="p-4">{lang === 'en' ? 'Receipt No' : 'প্রাপ্তি নম্বর'}</th>
                  <th className="p-4">{lang === 'en' ? 'PO Reference' : 'সংশ্লিষ্ট পিও'}</th>
                  <th className="p-4">{lang === 'en' ? 'Material Name' : 'মালামাল বিবরণ'}</th>
                  <th className="p-4">{lang === 'en' ? 'Quantity Received' : 'গৃহীত পরিমাণ'}</th>
                  <th className="p-4">{lang === 'en' ? 'Inspection By' : 'নিরীক্ষণ কারী'}</th>
                  <th className="p-4">{lang === 'en' ? 'Date' : 'তারিখ'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs">
                {mrns.map(mrn => (
                  <tr key={mrn.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-bold text-slate-800">{mrn.receiptNo}</td>
                    <td className="p-4 font-mono text-slate-500">{mrn.poNumber}</td>
                    <td className="p-4">
                      <span className="font-bold text-slate-800">{mrn.materialName}</span>
                      <p className="text-[10px] text-slate-400">{mrn.projectName}</p>
                    </td>
                    <td className="p-4 font-black text-slate-800">{mrn.receivedQuantity} units</td>
                    <td className="p-4 text-slate-600 font-medium">{mrn.inspectedBy}</td>
                    <td className="p-4 text-slate-500">{mrn.receivedDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- Tab 7: Billing & Payments --- */}
      {activeTab === 'billing' && (
        <div className="space-y-6" id="proc-view-billing">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h4 className="font-display font-bold text-sm text-slate-800">{lang === 'en' ? 'Vendor Invoice Processing & Payments' : 'ভেন্ডর বিল ও পেমেন্ট কেন্দ্র'}</h4>
              <p className="text-xs text-slate-400 mt-0.5">{lang === 'en' ? 'Record bills against PO/MRN and disburse vendor payments' : 'ভেন্ডর বিল রেকর্ড করুন এবং ব্যাংক ট্রান্সফার বা চেক পেমেন্ট পরিচালনা করুন'}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowAddBill(true)} className="bg-slate-900 text-white hover:bg-slate-800 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer">
                <Plus className="w-4 h-4" />
                {lang === 'en' ? 'Submit New Bill' : 'নতুন ভেন্ডর বিল'}
              </button>
              <button onClick={() => setShowAddPayment(true)} className="bg-slate-100 text-slate-700 hover:bg-slate-200 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer">
                <Plus className="w-4 h-4" />
                {lang === 'en' ? 'Disburse Payment' : 'পেমেন্ট প্রদান করুন'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-xs">
              <h5 className="p-4 bg-slate-50 font-display font-bold text-xs text-slate-800 uppercase tracking-wider">{lang === 'en' ? 'Vendor Bills (Invoices)' : 'ভেন্ডর বিল ইনভয়েস'}</h5>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    <th className="p-4">{lang === 'en' ? 'Invoice Info' : 'ইনভয়েস বিবরণ'}</th>
                    <th className="p-4">{lang === 'en' ? 'Vendor' : 'ভেন্ডর'}</th>
                    <th className="p-4 text-right">{lang === 'en' ? 'Bill Amount' : 'বিল মূল্য'}</th>
                    <th className="p-4">{lang === 'en' ? 'Due Date' : 'পরিশোধের শেষ দিন'}</th>
                    <th className="p-4 text-center">{lang === 'en' ? 'Status' : 'অবস্থা'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-xs">
                  {bills.map(b => (
                    <tr 
                      key={b.id} 
                      className={`hover:bg-slate-50/50 transition-colors cursor-pointer ${selectedBillId === b.id ? 'bg-slate-50' : ''}`}
                      onClick={() => setSelectedBillId(b.id)}
                    >
                      <td className="p-4">
                        <span className="font-bold text-slate-800">{b.billNumber}</span>
                        <p className="text-[10px] text-slate-400">PO: {b.poNumber}</p>
                      </td>
                      <td className="p-4 font-semibold text-slate-700">{b.vendorName}</td>
                      <td className="p-4 text-right font-black text-slate-800">{formatCur(b.billAmount)}</td>
                      <td className="p-4 text-slate-600">{b.dueDate}</td>
                      <td className="p-4 text-center">
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold ${
                          b.status === 'Paid' 
                            ? 'bg-emerald-50 text-emerald-700' 
                            : b.status === 'Partially Paid'
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}>{b.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Payments list history */}
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs space-y-4">
              <h5 className="font-display font-bold text-xs text-slate-800 uppercase tracking-wider">{lang === 'en' ? 'Recent Disbursements' : 'সাম্প্রতিক পেমেন্ট সমুহ'}</h5>
              <div className="space-y-3">
                {payments.map(p => (
                  <div key={p.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-mono text-slate-400">{p.paymentNumber}</span>
                      <span className="font-bold text-xs text-emerald-600">-{formatCur(p.amountPaid)}</span>
                    </div>
                    <p className="text-xs font-bold text-slate-800">{p.vendorName}</p>
                    <p className="text-[10px] text-slate-500">Method: {p.paymentMethod} • Ref: {p.referenceNo}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- Tab 8: Vendor Ledgers --- */}
      {activeTab === 'ledger' && (
        <div className="space-y-6" id="proc-view-ledger">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-display font-bold text-sm text-slate-800">{lang === 'en' ? 'Vendor Ledger Module' : 'ভেন্ডর লেজার বিবরণী'}</h4>
              <p className="text-xs text-slate-400 mt-0.5">{lang === 'en' ? 'Comprehensive transactions, bills, disbursements, and liability statements' : 'ভেন্ডর ভিত্তিক লেনদেন, চালান ও পেমেন্ট বিবরণী এবং চলমান বকেয়া হিসাব'}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs space-y-5">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-xs font-bold text-slate-500">{lang === 'en' ? 'Select Vendor' : 'ভেন্ডর নির্বাচন করুন'}:</span>
              <div className="flex gap-2 flex-wrap">
                {vendors.map(v => (
                  <button 
                    key={v.id} 
                    onClick={() => setSelectedVendorId(v.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedVendorId === v.id 
                        ? 'bg-slate-900 text-white shadow-xs' 
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {v.vendorName}
                  </button>
                ))}
              </div>
            </div>

            {selectedVendorId ? (() => {
              const vendorObj = vendors.find(v => v.id === selectedVendorId);
              const vendorLedgers = ledgers.filter(l => l.vendorId === selectedVendorId);
              return (
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <span className="text-xs font-black text-slate-800">{vendorObj?.vendorName} {lang === 'en' ? 'Statement' : 'বিবরণী'}</span>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">{lang === 'en' ? 'Closing Balance' : 'চলতি বকেয়া'}</span>
                      <span className="text-sm font-black text-rose-600">{formatCur(vendorObj?.outstandingPayable || 0)}</span>
                    </div>
                  </div>

                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        <th className="p-3">{lang === 'en' ? 'Transaction Date' : 'লেনদেনের তারিখ'}</th>
                        <th className="p-3">{lang === 'en' ? 'Type' : 'ধরণ'}</th>
                        <th className="p-3">{lang === 'en' ? 'Reference' : 'রেফারেন্স'}</th>
                        <th className="p-3">{lang === 'en' ? 'Description' : 'বিবরণ'}</th>
                        <th className="p-3 text-right">{lang === 'en' ? 'Debit (Payment)' : 'ডেবিট (পেমেন্ট)'}</th>
                        <th className="p-3 text-right">{lang === 'en' ? 'Credit (Bill)' : 'ক্রেডিট (বিল)'}</th>
                        <th className="p-3 text-right">{lang === 'en' ? 'Running Balance' : 'চলতি ব্যালেন্স'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {vendorLedgers.map(l => (
                        <tr key={l.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-3 text-slate-500">{l.transactionDate}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                              l.transactionType === 'Bill' 
                                ? 'bg-rose-50 text-rose-700' 
                                : 'bg-emerald-50 text-emerald-700'
                            }`}>{l.transactionType}</span>
                          </td>
                          <td className="p-3 font-mono text-[10px] text-slate-500">{l.referenceNo}</td>
                          <td className="p-3 text-slate-700">{l.remarks}</td>
                          <td className="p-3 text-right text-emerald-600 font-bold">{l.debit > 0 ? formatCur(l.debit) : '-'}</td>
                          <td className="p-3 text-right text-rose-600 font-bold">{l.credit > 0 ? formatCur(l.credit) : '-'}</td>
                          <td className="p-3 text-right font-bold text-slate-800">{formatCur(l.balance)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })() : (
              <p className="text-xs text-slate-400 text-center py-8">{lang === 'en' ? 'Please select a vendor above to inspect ledger statements' : 'দয়া করে ভেন্ডর নির্বাচন করুন'}</p>
            )}
          </div>
        </div>
      )}

      {/* --- Tab 9: Reports Engine --- */}
      {activeTab === 'reports' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="proc-view-reports">
          {/* Report 1: Purchase Register */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4">
            <h4 className="font-display font-bold text-sm text-slate-800">{lang === 'en' ? 'Purchase Register Report' : 'ক্রয় রেজিস্টার রিপোর্ট'}</h4>
            <div className="max-h-60 overflow-y-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    <th className="p-2">PO No</th>
                    <th className="p-2">Supplier</th>
                    <th className="p-2">Material</th>
                    <th className="p-2 text-right">Qty</th>
                    <th className="p-2 text-right">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {pos.map(po => (
                    <tr key={po.id}>
                      <td className="p-2 font-mono text-[10px] text-slate-500">{po.poNumber}</td>
                      <td className="p-2 font-bold text-slate-700">{po.vendorName}</td>
                      <td className="p-2">{po.materialName}</td>
                      <td className="p-2 text-right">{po.quantity}</td>
                      <td className="p-2 text-right font-bold text-slate-800">{formatCur(po.totalAmount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Report 2: Outstanding Vendor Bills */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4">
            <h4 className="font-display font-bold text-sm text-slate-800">{lang === 'en' ? 'Outstanding Vendor Bills Report' : 'বকেয়া ভেন্ডর বিল রিপোর্ট'}</h4>
            <div className="max-h-60 overflow-y-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    <th className="p-2">Invoice No</th>
                    <th className="p-2">Supplier</th>
                    <th className="p-2">Due Date</th>
                    <th className="p-2 text-right">Due Amount</th>
                    <th className="p-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {bills.filter(b => b.status !== 'Paid').map(b => (
                    <tr key={b.id}>
                      <td className="p-2 font-mono text-[10px] text-slate-500">{b.billNumber}</td>
                      <td className="p-2 font-bold text-slate-700">{b.vendorName}</td>
                      <td className="p-2">{b.dueDate}</td>
                      <td className="p-2 text-right font-bold text-rose-600">{formatCur(b.billAmount)}</td>
                      <td className="p-2 text-center">
                        <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-rose-50 text-rose-700">{b.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Report 3: Material Consumption Tracker */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4">
            <h4 className="font-display font-bold text-sm text-slate-800">{lang === 'en' ? 'Material Consumption Tracker' : 'সাইট মালামাল ব্যবহার খতিয়ান'}</h4>
            <div className="max-h-60 overflow-y-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    <th className="p-2">Project</th>
                    <th className="p-2">Material</th>
                    <th className="p-2 text-right">Received</th>
                    <th className="p-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {mrns.map(mrn => (
                    <tr key={mrn.id}>
                      <td className="p-2 font-bold text-slate-700">{mrn.projectName}</td>
                      <td className="p-2">{mrn.materialName}</td>
                      <td className="p-2 text-right font-semibold text-slate-700">{mrn.receivedQuantity} Units</td>
                      <td className="p-2 text-right text-[10px] text-emerald-600 font-bold">Received</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Report 4: Price Comparison Report */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4">
            <h4 className="font-display font-bold text-sm text-slate-800">{lang === 'en' ? 'Price Comparison Report' : 'দরের তুলনা রিপোর্ট'}</h4>
            <div className="max-h-60 overflow-y-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    <th className="p-2">Material</th>
                    <th className="p-2">Supplier</th>
                    <th className="p-2 text-right">Offered Price</th>
                    <th className="p-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {quotations.map(q => (
                    <tr key={q.id}>
                      <td className="p-2 font-bold text-slate-700">{q.materialName}</td>
                      <td className="p-2">{q.vendorName}</td>
                      <td className="p-2 text-right font-black text-slate-800">{formatCur(q.offeredRate)}</td>
                      <td className="p-2 text-center">
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                          q.status === 'Accepted' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                        }`}>{q.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- ALL MODALS --- */}
      {/* 1. Add Vendor Modal */}
      {showAddVendor && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4" id="modal-add-vendor">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 max-w-md w-full space-y-4 shadow-xl">
            <h4 className="font-display font-bold text-sm text-slate-800">{lang === 'en' ? 'Add Supplier / Vendor' : 'নতুন ভেন্ডর বা সাপ্লায়ার যুক্ত করুন'}</h4>
            <form onSubmit={handleCreateVendor} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-slate-500 font-bold">{lang === 'en' ? 'Company Name' : 'প্রতিষ্ঠানের নাম'}</label>
                <input 
                  type="text" 
                  required 
                  className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-xl"
                  value={newVendor.vendorName}
                  onChange={e => setNewVendor(prev => ({ ...prev, vendorName: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-500 font-bold">{lang === 'en' ? 'Contact Person' : 'যোগাযোগকারী ব্যক্তি'}</label>
                  <input 
                    type="text" 
                    required 
                    className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-xl"
                    value={newVendor.contactPerson}
                    onChange={e => setNewVendor(prev => ({ ...prev, contactPerson: e.target.value }))}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-500 font-bold">{lang === 'en' ? 'Category' : 'ধরণ বা ক্যাটাগরি'}</label>
                  <select 
                    className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-xl"
                    value={newVendor.category}
                    onChange={e => setNewVendor(prev => ({ ...prev, category: e.target.value }))}
                  >
                    {materialsList.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-500 font-bold">Phone</label>
                  <input 
                    type="text" 
                    required 
                    className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-xl"
                    value={newVendor.phone}
                    onChange={e => setNewVendor(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-500 font-bold">Email</label>
                  <input 
                    type="email" 
                    required 
                    className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-xl"
                    value={newVendor.email}
                    onChange={e => setNewVendor(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-500 font-bold">Trade License No</label>
                <input 
                  type="text" 
                  required 
                  className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-xl"
                  value={newVendor.tradeLicenseNo}
                  onChange={e => setNewVendor(prev => ({ ...prev, tradeLicenseNo: e.target.value }))}
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={() => setShowAddVendor(false)} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold cursor-pointer">{lang === 'en' ? 'Cancel' : 'বাতিল'}</button>
                <button type="submit" className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold cursor-pointer">{lang === 'en' ? 'Onboard' : 'সংরক্ষণ'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Add Contact Person Modal */}
      {showAddContact && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4" id="modal-add-contact">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 max-w-md w-full space-y-4 shadow-xl">
            <h4 className="font-display font-bold text-sm text-slate-800">{lang === 'en' ? 'Add Contact Person' : 'ভেন্ডর বা সাপ্লায়ার প্রতিনিধি'}</h4>
            <form onSubmit={handleCreateContact} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-slate-500 font-bold">{lang === 'en' ? 'Select Supplier' : 'সাপ্লায়ার বা ভেন্ডর'}</label>
                <select 
                  className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-xl"
                  value={newContact.vendorId}
                  onChange={e => setNewContact(prev => ({ ...prev, vendorId: e.target.value }))}
                >
                  {vendors.map(v => (
                    <option key={v.id} value={v.id}>{v.vendorName}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-500 font-bold">{lang === 'en' ? 'Name' : 'নাম'}</label>
                  <input 
                    type="text" 
                    required 
                    className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-xl"
                    value={newContact.contactName}
                    onChange={e => setNewContact(prev => ({ ...prev, contactName: e.target.value }))}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-500 font-bold">{lang === 'en' ? 'Designation' : 'পদবী'}</label>
                  <input 
                    type="text" 
                    required 
                    className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-xl"
                    value={newContact.designation}
                    onChange={e => setNewContact(prev => ({ ...prev, designation: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-500 font-bold">Phone</label>
                  <input 
                    type="text" 
                    required 
                    className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-xl"
                    value={newContact.phone}
                    onChange={e => setNewContact(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-500 font-bold">Email</label>
                  <input 
                    type="email" 
                    required 
                    className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-xl"
                    value={newContact.email}
                    onChange={e => setNewContact(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input 
                  type="checkbox" 
                  id="chk-primary" 
                  checked={newContact.isPrimary} 
                  onChange={e => setNewContact(prev => ({ ...prev, isPrimary: e.target.checked }))} 
                />
                <label htmlFor="chk-primary" className="text-slate-600 font-semibold">{lang === 'en' ? 'Mark as Primary Contact' : 'প্রধান যোগাযোগকারী ব্যক্তি'}</label>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={() => setShowAddContact(false)} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold cursor-pointer">{lang === 'en' ? 'Cancel' : 'বাতিল'}</button>
                <button type="submit" className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold cursor-pointer">{lang === 'en' ? 'Add Contact' : 'যুক্ত করুন'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Raise Requisition (PR) Modal */}
      {showAddRequisition && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4" id="modal-add-req">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 max-w-md w-full space-y-4 shadow-xl">
            <h4 className="font-display font-bold text-sm text-slate-800">{lang === 'en' ? 'Raise Purchase Requisition (PR)' : 'নতুন ক্রয় রিকুইজিশন (PR)'}</h4>
            <form onSubmit={handleCreateRequisition} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-slate-500 font-bold">{lang === 'en' ? 'Select Project' : 'প্রকল্প বা সাইট'}</label>
                <select 
                  className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-xl"
                  value={newReq.projectId}
                  onChange={e => setNewReq(prev => ({ ...prev, projectId: e.target.value }))}
                >
                  <option value="">-- Choose Project --</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.nameEn}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-500 font-bold">{lang === 'en' ? 'Material Name' : 'মালামাল'}</label>
                  <select 
                    className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-xl"
                    value={newReq.materialName}
                    onChange={e => setNewReq(prev => ({ ...prev, materialName: e.target.value as any }))}
                  >
                    {materialsList.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-500 font-bold">{lang === 'en' ? 'Quantity Required' : 'পরিমাণ'}</label>
                  <input 
                    type="number" 
                    required 
                    min="1" 
                    className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-xl"
                    value={newReq.quantity}
                    onChange={e => setNewReq(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-500 font-bold">{lang === 'en' ? 'Unit' : 'ইউনিট'}</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Bags, Tons, Pcs"
                    className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-xl"
                    value={newReq.unit}
                    onChange={e => setNewReq(prev => ({ ...prev, unit: e.target.value }))}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-500 font-bold">{lang === 'en' ? 'Required Date' : 'প্রয়োজনীয় তারিখ'}</label>
                  <input 
                    type="date" 
                    required 
                    className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-xl"
                    value={newReq.requiredDate}
                    onChange={e => setNewReq(prev => ({ ...prev, requiredDate: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-500 font-bold">{lang === 'en' ? 'Remarks / Specifications' : 'মন্তব্য বা বিশেষ বিবরণ'}</label>
                <textarea 
                  className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-xl h-20"
                  value={newReq.remarks}
                  onChange={e => setNewReq(prev => ({ ...prev, remarks: e.target.value }))}
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={() => setShowAddRequisition(false)} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold cursor-pointer">{lang === 'en' ? 'Cancel' : 'বাতিল'}</button>
                <button type="submit" className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold cursor-pointer">{lang === 'en' ? 'Raise Requisition' : 'সাবমিট করুন'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Request for Quotation (RFQ) Invite Modal */}
      {showAddRfq && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4" id="modal-add-rfq">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 max-w-md w-full space-y-4 shadow-xl">
            <h4 className="font-display font-bold text-sm text-slate-800">{lang === 'en' ? 'Configure RFQ & Select Suppliers' : 'আরএফকিউ কনফিগারেশন ও সাপ্লায়ার আমন্ত্রণ'}</h4>
            <form onSubmit={handleCreateRfq} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-slate-500 font-bold">{lang === 'en' ? 'Requisition Reference' : 'ক্রয় রিকুইজিশন সংশ্লিষ্টতা'}</label>
                <select 
                  className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-xl"
                  value={newRfq.requisitionId}
                  onChange={e => setNewRfq(prev => ({ ...prev, requisitionId: e.target.value }))}
                >
                  <option value="">-- Select Approved Requisition --</option>
                  {requisitions.filter(r => r.status === 'Approved').map(r => (
                    <option key={r.id} value={r.id}>{r.prNumber} - {r.materialName} ({r.quantity} {r.unit})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-500 font-bold">{lang === 'en' ? 'Bidding Close Date' : 'নিলাম বন্ধের তারিখ'}</label>
                <input 
                  type="date" 
                  required 
                  className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-xl"
                  value={newRfq.closeDate}
                  onChange={e => setNewRfq(prev => ({ ...prev, closeDate: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <label className="text-slate-500 font-bold block">{lang === 'en' ? 'Invite Supplier / Vendors' : 'আমন্ত্রণকারী সাপ্লায়ার'}</label>
                <div className="max-h-36 overflow-y-auto border border-slate-100 rounded-xl p-3 bg-slate-50 space-y-1.5">
                  {vendors.map(v => (
                    <div key={v.id} className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        id={`chk-vend-${v.id}`} 
                        checked={newRfq.selectedVendors.includes(v.id)}
                        onChange={e => {
                          if (e.target.checked) {
                            setNewRfq(prev => ({ ...prev, selectedVendors: [...prev.selectedVendors, v.id] }));
                          } else {
                            setNewRfq(prev => ({ ...prev, selectedVendors: prev.selectedVendors.filter(id => id !== v.id) }));
                          }
                        }}
                      />
                      <label htmlFor={`chk-vend-${v.id}`} className="font-semibold text-slate-700">{v.vendorName}</label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={() => setShowAddRfq(false)} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold cursor-pointer">{lang === 'en' ? 'Cancel' : 'বাতিল'}</button>
                <button type="submit" className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold cursor-pointer">{lang === 'en' ? 'Launch RFQ Bidding' : 'আরএফকিউ পাবলিশ করুন'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Submit Vendor Quotation Modal */}
      {showAddQuotation && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4" id="modal-add-quot">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 max-w-md w-full space-y-4 shadow-xl">
            <h4 className="font-display font-bold text-sm text-slate-800">{lang === 'en' ? 'Submit Vendor Bid' : 'নতুন ভেন্ডর দরপত্র (Quotation) দাখিল'}</h4>
            <form onSubmit={handleCreateQuotation} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-500 font-bold">{lang === 'en' ? 'Active RFQ' : 'আরএফকিউ নম্বর'}</label>
                  <select 
                    className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-xl"
                    value={newQuotation.rfqId}
                    onChange={e => setNewQuotation(prev => ({ ...prev, rfqId: e.target.value }))}
                  >
                    <option value="">-- Choose RFQ --</option>
                    {rfqs.filter(r => r.status === 'Open').map(r => (
                      <option key={r.id} value={r.id}>{r.rfqNumber} ({r.materialName})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-500 font-bold">{lang === 'en' ? 'Select Vendor' : 'ভেন্ডর বা সাপ্লায়ার'}</label>
                  <select 
                    className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-xl"
                    value={newQuotation.vendorId}
                    onChange={e => setNewQuotation(prev => ({ ...prev, vendorId: e.target.value }))}
                  >
                    <option value="">-- Choose Vendor --</option>
                    {vendors.map(v => (
                      <option key={v.id} value={v.id}>{v.vendorName}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-500 font-bold">{lang === 'en' ? 'Offered Rate' : 'প্রস্তাবিত রেট'}</label>
                  <input 
                    type="number" 
                    required 
                    className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-xl"
                    value={newQuotation.offeredRate}
                    onChange={e => setNewQuotation(prev => ({ ...prev, offeredRate: Number(e.target.value) }))}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-500 font-bold">{lang === 'en' ? 'Lead Time (Days)' : 'ডেলিভারি সময় (দিন)'}</label>
                  <input 
                    type="number" 
                    required 
                    className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-xl"
                    value={newQuotation.deliveryLeadTimeDays}
                    onChange={e => setNewQuotation(prev => ({ ...prev, deliveryLeadTimeDays: Number(e.target.value) }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-500 font-bold">{lang === 'en' ? 'Warranty (Months)' : 'ওয়ারেন্টি (মাস)'}</label>
                  <input 
                    type="number" 
                    className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-xl"
                    value={newQuotation.warrantyMonths}
                    onChange={e => setNewQuotation(prev => ({ ...prev, warrantyMonths: Number(e.target.value) }))}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-500 font-bold">{lang === 'en' ? 'Specification / Terms' : 'শর্তাবলী বা মন্তব্য'}</label>
                <textarea 
                  className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-xl h-20"
                  value={newQuotation.remarks}
                  onChange={e => setNewQuotation(prev => ({ ...prev, remarks: e.target.value }))}
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={() => setShowAddQuotation(false)} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold cursor-pointer">{lang === 'en' ? 'Cancel' : 'বাতিল'}</button>
                <button type="submit" className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold cursor-pointer">{lang === 'en' ? 'Submit Bid' : 'সংরক্ষণ'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Process Bill Modal */}
      {showAddBill && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4" id="modal-add-bill">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 max-w-md w-full space-y-4 shadow-xl">
            <h4 className="font-display font-bold text-sm text-slate-800">{lang === 'en' ? 'Process Vendor Invoice' : 'নতুন ভেন্ডর ইনভয়েস চালান রেকর্ড'}</h4>
            <form onSubmit={handleCreateBill} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-slate-500 font-bold">{lang === 'en' ? 'Select Active PO' : 'সংশ্লিষ্ট ক্রয় আদেশ (PO)'}</label>
                <select 
                  className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-xl"
                  value={newBill.poId}
                  onChange={e => {
                    const po = pos.find(p => p.id === e.target.value);
                    setNewBill(prev => ({ 
                      ...prev, 
                      poId: e.target.value,
                      billAmount: po ? po.totalAmount : 0 
                    }));
                  }}
                >
                  <option value="">-- Choose PO --</option>
                  {pos.map(p => (
                    <option key={p.id} value={p.id}>{p.poNumber} - {p.vendorName} ({p.materialName})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-500 font-bold">{lang === 'en' ? 'Invoice Bill No' : 'চালান বা বিল নম্বর'}</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="INV-XXXX"
                    className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-xl"
                    value={newBill.billNumber}
                    onChange={e => setNewBill(prev => ({ ...prev, billNumber: e.target.value }))}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-500 font-bold">{lang === 'en' ? 'Bill Amount' : 'বিল মূল্য (টাকা)'}</label>
                  <input 
                    type="number" 
                    required 
                    className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-xl font-bold"
                    value={newBill.billAmount}
                    onChange={e => setNewBill(prev => ({ ...prev, billAmount: Number(e.target.value) }))}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-500 font-bold">{lang === 'en' ? 'Due Date' : 'পরিশোধের শেষ তারিখ'}</label>
                <input 
                  type="date" 
                  required 
                  className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-xl"
                  value={newBill.dueDate}
                  onChange={e => setNewBill(prev => ({ ...prev, dueDate: e.target.value }))}
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-500 font-bold">{lang === 'en' ? 'Remarks' : 'মন্তব্য'}</label>
                <textarea 
                  className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-xl h-16"
                  value={newBill.remarks}
                  onChange={e => setNewBill(prev => ({ ...prev, remarks: e.target.value }))}
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={() => setShowAddBill(false)} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold cursor-pointer">{lang === 'en' ? 'Cancel' : 'বাতিল'}</button>
                <button type="submit" className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold cursor-pointer">{lang === 'en' ? 'Record Invoice' : 'চালান সংরক্ষণ'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. Disburse Payment Modal */}
      {showAddPayment && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4" id="modal-add-pay">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 max-w-md w-full space-y-4 shadow-xl">
            <h4 className="font-display font-bold text-sm text-slate-800">{lang === 'en' ? 'Disburse Supplier Payment' : 'সাপ্লায়ার পেমেন্ট ক্লিয়ারেন্স'}</h4>
            <form onSubmit={handleCreatePayment} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-slate-500 font-bold">{lang === 'en' ? 'Select Unpaid Invoice' : 'বকেয়া বিল বা চালান নির্বাচন'}</label>
                <select 
                  className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-xl"
                  value={newPayment.billId}
                  onChange={e => {
                    const b = bills.find(item => item.id === e.target.value);
                    setNewPayment(prev => ({ 
                      ...prev, 
                      billId: e.target.value,
                      amountPaid: b ? b.billAmount : 0
                    }));
                  }}
                >
                  <option value="">-- Choose Outstanding Bill --</option>
                  {bills.filter(b => b.status !== 'Paid').map(b => (
                    <option key={b.id} value={b.id}>{b.billNumber} - {b.vendorName} ({formatCur(b.billAmount)})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-500 font-bold">{lang === 'en' ? 'Amount to Pay' : 'প্রদেয় মূল্য (টাকা)'}</label>
                  <input 
                    type="number" 
                    required 
                    className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-xl font-bold text-emerald-600"
                    value={newPayment.amountPaid}
                    onChange={e => setNewPayment(prev => ({ ...prev, amountPaid: Number(e.target.value) }))}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-500 font-bold">{lang === 'en' ? 'Payment Method' : 'পেমেন্ট মাধ্যম'}</label>
                  <select 
                    className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-xl"
                    value={newPayment.paymentMethod}
                    onChange={e => setNewPayment(prev => ({ ...prev, paymentMethod: e.target.value as any }))}
                  >
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Cash">Cash</option>
                    <option value="EFT">Electronic Funds Transfer</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-500 font-bold">{lang === 'en' ? 'Txn / Cheque Reference Number' : 'চেক বা ব্যাংক ট্রানজেকশন আইডি রেফারেন্স'}</label>
                <input 
                  type="text" 
                  required 
                  className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-xl"
                  value={newPayment.referenceNo}
                  onChange={e => setNewPayment(prev => ({ ...prev, referenceNo: e.target.value }))}
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-500 font-bold">{lang === 'en' ? 'Payment Remarks' : 'মন্তব্য'}</label>
                <textarea 
                  className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-xl h-16"
                  value={newPayment.remarks}
                  onChange={e => setNewPayment(prev => ({ ...prev, remarks: e.target.value }))}
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={() => setShowAddPayment(false)} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold cursor-pointer">{lang === 'en' ? 'Cancel' : 'বাতিল'}</button>
                <button type="submit" className="px-4 py-2 bg-emerald-500 text-white rounded-xl font-bold cursor-pointer">{lang === 'en' ? 'Disburse' : 'পেমেন্ট সম্পন্ন করুন'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
