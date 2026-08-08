/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { dbService } from '../db/dbService';
import { COMPANY_PROFILE } from '../config/companyProfile';
import { 
  ERPDocument, 
  ERPNotification, 
  ApprovalWorkflow, 
  ApprovalWorkflowStep, 
  ApprovalWorkflowLog,
  RoleId,
  DocumentVersion,
  LandVaultRecord,
  JvaDocument,
  RajukDocument,
  MutationRecord,
  LegalCaseRecord,
  Contract,
  DocumentAlert,
  Archive,
  Project,
  PlotBooking
} from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FolderOpen, 
  FileText, 
  Upload, 
  Plus, 
  Search, 
  Bell, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  History, 
  Download, 
  Eye, 
  Clock, 
  User, 
  Calendar, 
  ArrowRight, 
  Lock,
  Filter,
  Check,
  AlertCircle,
  Building2,
  Scale,
  Briefcase,
  AlertTriangle,
  FileCheck,
  Printer,
  X,
  Trash2,
  RefreshCw,
  TrendingUp,
  Activity,
  Layers,
  Database,
  Grid,
  List,
  CheckCircle
} from 'lucide-react';

interface Props {
  lang: 'en' | 'bn';
  currentRole: RoleId;
  addAuditLog: (action: string, table: string, descEn: string, descBn: string) => void;
}

export default function DocumentLegalComplianceModule({ lang, currentRole, addAuditLog }: Props) {
  // DB States
  const [documents, setDocuments] = useState<ERPDocument[]>(() => {
    const existing = dbService.documents.getAll();
    if (existing.length === 0) {
      // Seed some mock documents across categories if empty
      const seeded: ERPDocument[] = [
        {
          id: 'DOC-001',
          companyId: 'c1',
          documentNo: 'LD-UT-782',
          documentType: 'Land Deed',
          relatedModule: 'Sourcing',
          relatedEntityId: 'p1',
          title: 'Registered Original Bainanama Deed - Uttara Skyline',
          status: 'Approved',
          versionNumber: 2,
          filePath: 'deed_uttara_bainanama_v2.pdf',
          remarks: 'Official registered deed with high court stamps',
          isArchived: false,
          createdAt: '2026-01-15T10:00:00Z',
          updatedAt: '2026-02-10T14:30:00Z'
        },
        {
          id: 'DOC-002',
          companyId: 'c1',
          documentNo: 'RAJUK-PL-4012',
          documentType: 'Project Approval',
          relatedModule: 'Real Estate',
          relatedEntityId: 'p1',
          title: 'RAJUK 14-Story Superstructure Layout & Design Approval',
          status: 'Active',
          versionNumber: 1,
          filePath: 'rajuk_layout_approved_v1.pdf',
          remarks: 'Pending final safety certificate audit',
          isArchived: false,
          createdAt: '2026-02-05T11:00:00Z',
          updatedAt: '2026-02-05T11:00:00Z'
        },
        {
          id: 'DOC-003',
          companyId: 'c1',
          documentNo: 'JVA-DH-270',
          documentType: 'JVA Agreement',
          relatedModule: 'Sourcing',
          relatedEntityId: 'p2',
          title: 'Joint Venture Agreement Deed - Dhanmondi Imperial',
          status: 'Approved',
          versionNumber: 1,
          filePath: 'jva_imperial_signed_v1.pdf',
          remarks: 'Signed 55:45 ratio with landowners representative',
          isArchived: false,
          createdAt: '2026-01-20T09:00:00Z',
          updatedAt: '2026-01-20T09:00:00Z'
        },
        {
          id: 'DOC-004',
          companyId: 'c1',
          documentNo: 'BKG-AGR-5021',
          documentType: 'Booking Agreement',
          relatedModule: 'Real Estate',
          relatedEntityId: 'BKG-001',
          title: 'Apartment Booking Agreement Deed (Ahmad Junaed - Unit A-402)',
          status: 'Active',
          versionNumber: 1,
          filePath: 'booking_agreement_junaed_v1.pdf',
          remarks: 'Initial booking installment paid in full',
          isArchived: false,
          createdAt: '2026-03-01T15:00:00Z',
          updatedAt: '2026-03-01T15:00:00Z'
        },
        {
          id: 'DOC-005',
          companyId: 'c1',
          documentNo: 'EMP-FILE-104',
          documentType: 'Employee File',
          relatedModule: 'HR',
          relatedEntityId: 'emp1',
          title: 'Chief Structural Engineer Appointment Package & CV',
          status: 'Approved',
          versionNumber: 1,
          filePath: 'emp_104_appointment_v1.pdf',
          remarks: 'Verified certifications and educational NID credentials',
          isArchived: false,
          createdAt: '2026-02-18T10:00:00Z',
          updatedAt: '2026-02-18T10:00:00Z'
        },
        {
          id: 'DOC-006',
          companyId: 'c1',
          documentNo: 'INV-CRT-923',
          documentType: 'Investor Certificate',
          relatedModule: 'Investor',
          relatedEntityId: 'inv1',
          title: 'Master Equity Share Partnership Investment Certificate',
          status: 'Approved',
          versionNumber: 1,
          filePath: 'investor_cert_rahim_v1.pdf',
          remarks: 'Registered under Al Kaswa Board resolution #089',
          isArchived: false,
          createdAt: '2026-01-10T10:00:00Z',
          updatedAt: '2026-01-10T10:00:00Z'
        }
      ];
      dbService.documents.saveAll(seeded);
      return seeded;
    }
    return existing;
  });

  const [docVersions, setDocVersions] = useState<DocumentVersion[]>(() => {
    const existing = dbService.documentVersions.getAll();
    if (existing.length === 0) {
      const seeded: DocumentVersion[] = [
        {
          id: 'VER-001',
          documentId: 'DOC-001',
          versionNumber: 1,
          filePath: 'deed_uttara_bainanama_v1.pdf',
          remarks: 'Draft Bainanama submitted for initial vetting',
          changeHistory: 'Initial draft created by legal desk',
          uploadedBy: 'Advocate Shafiul Islam',
          uploadedAt: '2026-01-15T10:00:00Z'
        },
        {
          id: 'VER-002',
          documentId: 'DOC-001',
          versionNumber: 2,
          filePath: 'deed_uttara_bainanama_v2.pdf',
          remarks: 'Incorporated landowner feedback on handover timelines',
          changeHistory: 'Section 4 clause updated for grace period',
          uploadedBy: 'Advocate Shafiul Islam',
          uploadedAt: '2026-02-10T14:30:00Z'
        }
      ];
      dbService.documentVersions.saveAll(seeded);
      return seeded;
    }
    return existing;
  });

  const [landVault, setLandVault] = useState<LandVaultRecord[]>(() => dbService.landVaultRecords.getAll());
  const [jvas, setJvas] = useState<JvaDocument[]>(() => dbService.jvaDocuments.getAll());
  const [rajuks, setRajuks] = useState<RajukDocument[]>(() => dbService.rajukDocuments.getAll());
  const [mutations, setMutations] = useState<MutationRecord[]>(() => dbService.mutationRecords.getAll());
  const [legalCases, setLegalCases] = useState<LegalCaseRecord[]>(() => dbService.legalCaseRecords.getAll());
  const [contracts, setContracts] = useState<Contract[]>(() => dbService.contracts.getAll());
  const [alerts, setAlerts] = useState<DocumentAlert[]>(() => {
    const existing = dbService.documentAlerts.getAll();
    if (existing.length === 0) {
      const seeded: DocumentAlert[] = [
        {
          id: 'ALT-001',
          documentId: 'DOC-003',
          documentType: 'JVA Agreement',
          documentTitle: 'Joint Venture Agreement Deed - Dhanmondi Imperial',
          expiryDate: '2026-10-31',
          daysRemaining: 112,
          alertType: '90 Days',
          status: 'Unresolved',
          createdAt: '2026-07-10T00:00:00Z'
        },
        {
          id: 'ALT-002',
          documentId: 'DOC-001',
          documentType: 'Power of Attorney',
          documentTitle: 'Registered POA - Land Sourcing Sector 10 Uttara',
          expiryDate: '2026-08-05',
          daysRemaining: 24,
          alertType: '30 Days',
          status: 'Unresolved',
          createdAt: '2026-07-11T00:00:00Z'
        }
      ];
      dbService.documentAlerts.saveAll(seeded);
      return seeded;
    }
    return existing;
  });
  const [archives, setArchives] = useState<Archive[]>(() => dbService.archives.getAll());

  // Integrations state
  const [projects] = useState<Project[]>(() => dbService.projects.getAll());
  const [bookings] = useState<PlotBooking[]>(() => dbService.bookings.getAll());

  // Multi-Module & Search/Filter Navigation State
  const [activeTab, setActiveTab] = useState<'dms' | 'workflow' | 'founder' | 'analytics' | 'land' | 'jva' | 'rajuk_mutation' | 'legal_contracts' | 'archive' | 'alerts'>('dms');
  const [selectedFolder, setSelectedFolder] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Creation Modals State
  const [isNewDocOpen, setIsNewDocOpen] = useState(false);
  const [newDocData, setNewDocData] = useState({
    title: '',
    documentNo: '',
    documentType: 'Booking Agreement',
    relatedModule: 'Real Estate',
    remarks: '',
    expiryDate: ''
  });

  const [isNewVersionOpen, setIsNewVersionOpen] = useState(false);
  const [selectedDocForVersion, setSelectedDocForVersion] = useState<ERPDocument | null>(null);
  const [newVersionData, setNewVersionData] = useState({
    remarks: '',
    changeHistory: '',
    filePath: ''
  });

  const [isWorkflowModalOpen, setIsWorkflowModalOpen] = useState(false);
  const [selectedDocForWorkflow, setSelectedDocForWorkflow] = useState<ERPDocument | null>(null);
  const [workflowComment, setWorkflowComment] = useState('');

  // Version History Modal
  const [isVersionHistoryOpen, setIsVersionHistoryOpen] = useState(false);
  const [selectedDocForHistory, setSelectedDocForHistory] = useState<ERPDocument | null>(null);

  // PDF Preview Modal
  const [pdfPayload, setPdfPayload] = useState<{
    title: string;
    contentHtml: React.ReactNode;
  } | null>(null);

  // Auto Expiry Alert Calculator & DB Sync
  useEffect(() => {
    dbService.documents.saveAll(documents);
    dbService.documentVersions.saveAll(docVersions);
    dbService.landVaultRecords.saveAll(landVault);
    dbService.jvaDocuments.saveAll(jvas);
    dbService.rajukDocuments.saveAll(rajuks);
    dbService.mutationRecords.saveAll(mutations);
    dbService.legalCaseRecords.saveAll(legalCases);
    dbService.contracts.saveAll(contracts);
    dbService.documentAlerts.saveAll(alerts);
    dbService.archives.saveAll(archives);
  }, [documents, docVersions, landVault, jvas, rajuks, mutations, legalCases, contracts, alerts, archives]);

  // Bilingual translation helper
  const tl = (en: string, bn: string) => (lang === 'en' ? en : bn);

  // Category folders mapping
  const folders = [
    { id: 'All', labelEn: 'All Documents', labelBn: 'সকল নথি', icon: Database, color: 'bg-slate-100 text-slate-700' },
    { id: 'Land Documents', labelEn: 'Land Documents', labelBn: 'জমির দলিলপত্র', icon: Building2, color: 'bg-emerald-50 text-emerald-700 border border-emerald-100' },
    { id: 'Legal Documents', labelEn: 'Legal Documents', labelBn: 'আইনি ও চুক্তি', icon: Scale, color: 'bg-indigo-50 text-indigo-700 border border-indigo-100' },
    { id: 'Project Documents', labelEn: 'Project Documents', labelBn: 'প্রকল্প অনুমোদন', icon: FolderOpen, color: 'bg-amber-50 text-amber-700 border border-amber-100' },
    { id: 'Customer Documents', labelEn: 'Customer Documents', labelBn: 'গ্রাহক নথি', icon: User, color: 'bg-purple-50 text-purple-700 border border-purple-100' },
    { id: 'Investor Documents', labelEn: 'Investor Documents', labelBn: 'বিনিয়োগকারী নথি', icon: TrendingUp, color: 'bg-cyan-50 text-cyan-700 border border-cyan-100' },
    { id: 'HR Documents', labelEn: 'HR Documents', labelBn: 'এইচআর ও ফাইল', icon: Briefcase, color: 'bg-rose-50 text-rose-700 border border-rose-100' },
    { id: 'Financial Documents', labelEn: 'Financial Documents', labelBn: 'অর্থনৈতিক ভাউচার', icon: FileText, color: 'bg-blue-50 text-blue-700 border border-blue-100' },
    { id: 'Engineering Documents', labelEn: 'Engineering Documents', labelBn: 'প্রকৌশল নথি', icon: Activity, color: 'bg-teal-50 text-teal-700 border border-teal-100' },
  ];

  // Map individual document type to 8 main central folders
  const getDocFolder = (docType: string): string => {
    switch (docType) {
      case 'Land Deed':
      case 'Mutation Document':
        return 'Land Documents';
      case 'JVA Agreement':
      case 'Vendor Agreement':
        return 'Legal Documents';
      case 'Project Approval':
        return 'Project Documents';
      case 'Booking Agreement':
      case 'Money Receipt':
        return 'Customer Documents';
      case 'Investor Certificate':
        return 'Investor Documents';
      case 'Employee File':
        return 'HR Documents';
      case 'Payroll Document':
        return 'Financial Documents';
      default:
        return 'Engineering Documents';
    }
  };

  // Section 16 - Strict Role-Based Visibility Filters
  const visibleDocuments = useMemo(() => {
    return documents.filter(doc => {
      // 1. Check folder category mapping
      const folder = getDocFolder(doc.documentType);

      // 2. Role-specific constraints
      if (currentRole === 'FND') return true; // Founder has complete view access
      if (currentRole === 'MD') {
        // MD sees most, except very sensitive private disciplinary HR folders
        if (folder === 'HR Documents' && doc.title.toLowerCase().includes('disciplinary')) return false;
        return true;
      }
      if (currentRole === 'ACT') return folder === 'Financial Documents' || doc.documentType === 'Money Receipt';
      if (currentRole === 'HRM') return folder === 'HR Documents';
      if (currentRole === 'LGL') return folder === 'Legal Documents' || folder === 'Land Documents';
      if (currentRole === 'ENG') return folder === 'Project Documents' || folder === 'Engineering Documents';
      if (currentRole === 'CST') {
        // Customer can only see their own customer documents (matching simulated customer entity)
        return folder === 'Customer Documents' && doc.relatedEntityId === 'BKG-001';
      }
      if (currentRole === 'INV') {
        // Investor can only see their own records
        return folder === 'Investor Documents' && doc.relatedEntityId === 'inv1';
      }
      // Safe fallback - other roles see generalized or non-confidential land/project data
      return folder === 'Land Documents' || folder === 'Project Documents';
    });
  }, [documents, currentRole]);

  // Apply Global Search across Entire ERP Indexed Fields
  const searchedDocuments = useMemo(() => {
    return visibleDocuments.filter(doc => {
      // Folder category filter
      if (selectedFolder !== 'All' && getDocFolder(doc.documentType) !== selectedFolder) {
        return false;
      }
      const query = searchTerm.toLowerCase();
      return (
        doc.title.toLowerCase().includes(query) ||
        doc.documentNo.toLowerCase().includes(query) ||
        doc.documentType.toLowerCase().includes(query) ||
        (doc.remarks && doc.remarks.toLowerCase().includes(query)) ||
        (doc.relatedEntityId && doc.relatedEntityId.toLowerCase().includes(query))
      );
    });
  }, [visibleDocuments, selectedFolder, searchTerm]);

  // Handler: Create New Document (Digital Vault upload)
  const handleCreateDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocData.title || !newDocData.documentNo) return;

    const newDoc: ERPDocument = {
      id: `DOC-${Math.floor(1000 + Math.random() * 9000)}`,
      companyId: 'c1',
      documentNo: newDocData.documentNo,
      documentType: newDocData.documentType as any,
      relatedModule: newDocData.relatedModule as any,
      relatedEntityId: 'p1', // Default assignment to active project
      title: newDocData.title,
      status: 'Draft',
      versionNumber: 1,
      filePath: `${newDocData.title.toLowerCase().replace(/\s+/g, '_')}_v1.pdf`,
      remarks: newDocData.remarks,
      isArchived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const initialVersion: DocumentVersion = {
      id: `VER-${Math.floor(1000 + Math.random() * 9000)}`,
      documentId: newDoc.id,
      versionNumber: 1,
      filePath: newDoc.filePath,
      remarks: 'Initial Digital Vault Registration',
      changeHistory: 'Document uploaded and registered in the centralized DMS catalog.',
      uploadedBy: `Role: ${currentRole}`,
      uploadedAt: new Date().toISOString()
    };

    setDocuments([newDoc, ...documents]);
    setDocVersions([initialVersion, ...docVersions]);
    setIsNewDocOpen(false);
    
    // Immutable Audit Trail
    addAuditLog(
      'UPLOAD_DOCUMENT',
      'documents',
      `Registered document ${newDoc.documentNo} in the Digital Vault`,
      `ডিজিটাল ভল্টে নতুন নথি ${newDoc.documentNo} নথিভুক্ত করা হয়েছে`
    );

    // Reset data
    setNewDocData({
      title: '',
      documentNo: '',
      documentType: 'Booking Agreement',
      relatedModule: 'Real Estate',
      remarks: '',
      expiryDate: ''
    });
  };

  // Handler: Upload Document Version
  const handleUploadVersion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDocForVersion) return;

    const nextVerNo = selectedDocForVersion.versionNumber + 1;
    const newPath = newVersionData.filePath || `${selectedDocForVersion.title.toLowerCase().replace(/\s+/g, '_')}_v${nextVerNo}.pdf`;

    const newVer: DocumentVersion = {
      id: `VER-${Math.floor(1000 + Math.random() * 9000)}`,
      documentId: selectedDocForVersion.id,
      versionNumber: nextVerNo,
      filePath: newPath,
      remarks: newVersionData.remarks || 'Incremental version update',
      changeHistory: newVersionData.changeHistory || 'Updated metadata details.',
      uploadedBy: `User Role: ${currentRole}`,
      uploadedAt: new Date().toISOString()
    };

    // Update parent document's version tag
    const updatedDocs = documents.map(d => {
      if (d.id === selectedDocForVersion.id) {
        return {
          ...d,
          versionNumber: nextVerNo,
          filePath: newPath,
          updatedAt: new Date().toISOString()
        };
      }
      return d;
    });

    setDocuments(updatedDocs);
    setDocVersions([newVer, ...docVersions]);
    setIsNewVersionOpen(false);
    setSelectedDocForVersion(null);
    setNewVersionData({ remarks: '', changeHistory: '', filePath: '' });

    addAuditLog(
      'VERSION_INCREMENT',
      'documents',
      `Uploaded version v${nextVerNo} for document ${selectedDocForVersion.documentNo}`,
      `নথি ${selectedDocForVersion.documentNo} এর জন্য সংস্করণ v${nextVerNo} আপলোড করা হয়েছে`
    );
  };

  // Handler: Advance Approval Workflow State
  const handleUpdateWorkflow = (status: 'Draft' | 'Submitted' | 'Reviewed' | 'Approved' | 'Archived') => {
    if (!selectedDocForWorkflow) return;

    const updatedDocs = documents.map(d => {
      if (d.id === selectedDocForWorkflow.id) {
        return {
          ...d,
          status,
          remarks: workflowComment ? `${d.remarks || ''} | Comment: ${workflowComment}` : d.remarks,
          updatedAt: new Date().toISOString()
        };
      }
      return d;
    });

    setDocuments(updatedDocs);
    setIsWorkflowModalOpen(false);
    setSelectedDocForWorkflow(null);
    setWorkflowComment('');

    addAuditLog(
      'WORKFLOW_TRANSITION',
      'documents',
      `Document ${selectedDocForWorkflow.documentNo} state updated to ${status}`,
      `নথি ${selectedDocForWorkflow.documentNo} এর অবস্থা ${status} এ পরিবর্তন করা হয়েছে`
    );
  };

  // Handler: Move document to static digital archive
  const handleArchiveDoc = (doc: ERPDocument) => {
    const updatedDocs = documents.map(d => {
      if (d.id === doc.id) {
        return { ...d, status: 'Archived' as any, isArchived: true };
      }
      return d;
    });
    setDocuments(updatedDocs);

    const newArc: Archive = {
      id: `ARC-${Math.floor(1000 + Math.random() * 9000)}`,
      originalTable: 'documents',
      originalEntityId: doc.id,
      title: doc.title,
      metadataJson: JSON.stringify(doc),
      archivedAt: new Date().toISOString(),
      archivedBy: `Role: ${currentRole}`
    };

    setArchives([newArc, ...archives]);

    addAuditLog(
      'ARCHIVE_DOCUMENT',
      'archives',
      `Archived document ${doc.documentNo} into Immutable Digital Archive`,
      `ইমিউটেবল আর্কাইভে নথি ${doc.documentNo} স্থানান্তর করা হয়েছে`
    );
  };

  // Handler: Resolve document expiry alert
  const handleResolveAlert = (alertId: string) => {
    const updatedAlerts = alerts.map(a => {
      if (a.id === alertId) return { ...a, status: 'Resolved' as const };
      return a;
    });
    setAlerts(updatedAlerts);

    addAuditLog(
      'RESOLVE_ALERT',
      'alerts',
      `Resolved document expiration alert ID: ${alertId}`,
      `নথির মেয়াদোত্তীর্ণ এলার্ট আইডি ${alertId} সমাধান করা হয়েছে`
    );
  };

  // Storage usage stats
  const storageStats = useMemo(() => {
    const totalFiles = documents.length + docVersions.length;
    const baseUsageGb = parseFloat((totalFiles * 1.83).toFixed(1)); // hypothetical 1.83MB per file
    const maxCapacityGb = 100;
    const usagePercent = Math.min(Math.round((baseUsageGb / maxCapacityGb) * 100), 100);

    // Group files by category
    const countsByCategory: Record<string, number> = {};
    documents.forEach(d => {
      const cat = getDocFolder(d.documentType);
      countsByCategory[cat] = (countsByCategory[cat] || 0) + 1;
    });

    return {
      totalFiles,
      baseUsageGb,
      maxCapacityGb,
      usagePercent,
      countsByCategory
    };
  }, [documents, docVersions]);

  // Founder Dashboard direct list of files requiring approval
  const pendingApprovalsList = useMemo(() => {
    return documents.filter(d => d.status === 'Draft' || d.status === 'Active');
  }, [documents]);

  // Dynamic Certified Print compiler
  const compilePdfView = (doc: ERPDocument) => {
    const folder = getDocFolder(doc.documentType);
    const docVerHistory = docVersions.filter(v => v.documentId === doc.id);

    setPdfPayload({
      title: doc.title.toUpperCase(),
      contentHtml: (
        <div className="space-y-6 font-sans text-slate-800 text-xs p-6 bg-white border border-slate-200 rounded-xl max-w-2xl mx-auto shadow-md">
          {/* Official Letterhead */}
          <div className="border-b-2 border-emerald-600 pb-4 text-center">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">{COMPANY_PROFILE.name}</h2>
            <p className="text-[10px] text-emerald-600 font-mono tracking-widest uppercase mt-1">{COMPANY_PROFILE.shortName} ERP Vault</p>
            <p className="text-[9px] text-slate-400 font-mono mt-2">DMS DIGITAL VAULT DOCUMENT ID: {doc.id} | REF: {doc.documentNo}</p>
          </div>

          <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 space-y-2">
            <h3 className="font-bold text-slate-900 text-sm">{tl('Certified Digital Record', 'প্রত্যয়িত ডিজিটাল রেকর্ড')}</h3>
            <p className="text-slate-600 leading-relaxed">
              This document represents a legally certified digital record preserved securely inside the Al Kaswa Holdings Enterprise Vault. Any tampering or unauthorized duplication of this certificate represents a federal offense.
            </p>
          </div>

          {/* Document Properties Grid */}
          <div className="grid grid-cols-2 gap-4 border-t border-b border-slate-100 py-4 font-mono text-[11px]">
            <div>
              <span className="text-slate-400 uppercase">Document Title:</span>
              <p className="font-sans font-bold text-slate-900 mt-0.5">{doc.title}</p>
            </div>
            <div>
              <span className="text-slate-400 uppercase">Category Folders:</span>
              <p className="font-sans font-bold text-slate-900 mt-0.5">{folder}</p>
            </div>
            <div>
              <span className="text-slate-400 uppercase">Document System No:</span>
              <p className="font-bold text-indigo-600 mt-0.5">{doc.documentNo}</p>
            </div>
            <div>
              <span className="text-slate-400 uppercase">Current Workflow Stage:</span>
              <p className="font-bold text-emerald-600 mt-0.5">{doc.status}</p>
            </div>
            <div>
              <span className="text-slate-400 uppercase">Active Version Number:</span>
              <p className="font-bold text-slate-800 mt-0.5">v{doc.versionNumber}</p>
            </div>
            <div>
              <span className="text-slate-400 uppercase">Vault Registration Date:</span>
              <p className="font-bold text-slate-800 mt-0.5">{new Date(doc.createdAt).toLocaleString()}</p>
            </div>
          </div>

          {/* Version control trail */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">{tl('Document Change Log & History', 'নথি পরিবর্তন ও সংস্করণের ইতিহাস')}</h4>
            <div className="border border-slate-100 rounded-lg overflow-hidden text-[10px] font-mono">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="p-2">Ver</th>
                    <th className="p-2">Modified By</th>
                    <th className="p-2">Date</th>
                    <th className="p-2">Change Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {docVerHistory.map(v => (
                    <tr key={v.id} className="border-b border-slate-50">
                      <td className="p-2 font-bold text-indigo-600">v{v.versionNumber}</td>
                      <td className="p-2">{v.uploadedBy}</td>
                      <td className="p-2">{new Date(v.uploadedAt).toLocaleDateString()}</td>
                      <td className="p-2 text-slate-600">{v.remarks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Legal Stamp Notice */}
          <div className="pt-8 flex justify-between items-center text-[9px] font-mono text-slate-400">
            <div>GENERATED SECURELY BY: {currentRole}</div>
            <div className="text-right">AL KASWA COMPLIANCE OFFICE SEAL</div>
          </div>
        </div>
      )
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header Panel */}
      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 text-white relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 p-8 text-emerald-500 opacity-10">
          <FolderOpen size={160} />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-mono tracking-wider uppercase rounded-full border border-emerald-500/20">
              {tl('Phase 17 - Enterprise Document Vault', 'ফেজ ১৭ - এন্টারপ্রাইজ নথি সংরক্ষণাগার')}
            </span>
            <h1 className="font-display font-black text-2xl mt-2 tracking-tight">
              {tl('Enterprise DMS, Digital Vault & Approval Center', 'ডিজিটাল ডক ম্যানেজমেন্ট সিস্টেম ও অনুমোদন কেন্দ্র')}
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              {tl('Centralized secure repository tracking Land deeds, RAJUK approvals, JVA contracts, legal corporate litigations, investor equities, and HR logs.', 'ভূমি দলিল, রাজউক অনুমোদন, জেভিএ চুক্তি, আইনি কর্পোরেট মামলা, বিনিয়োগকারী নথি এবং এইচআর ফাইলের জন্য একক নিরাপদ পোর্টাল।')}
            </p>
          </div>
          <button
            onClick={() => setIsNewDocOpen(true)}
            className="bg-emerald-500 text-slate-950 px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shrink-0 border-none"
            id="create-new-document-vault-btn"
          >
            <Upload size={16} />
            {tl('Register New Vault File', 'ভল্টে নতুন ফাইল আপলোড')}
          </button>
        </div>
      </div>

      {/* Role-Based Visibility Info Banner */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
            <ShieldCheck size={18} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800">
              {tl('Role-Based Access Matrix Control Active', 'রোল-ভিত্তিক অ্যাক্সেস ম্যাট্রিক্স নিয়ন্ত্রণ চালু আছে')}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">
              {tl(`Simulated Role: ${currentRole} | Displaying only authorized document repositories according strictly to corporate security protocols.`, `অনুকরণকৃত রোল: ${currentRole} | নিরাপত্তা বিধি অনুসারে শুধুমাত্র অনুমোদিত নথি ফোল্ডারগুলো দেখা যাচ্ছে।`)}
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full uppercase">
          {currentRole} Access
        </span>
      </div>

      {/* Primary DMS Subviews Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-2">
        <button
          onClick={() => setActiveTab('dms')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'dms' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 bg-slate-50'
          }`}
        >
          {tl('1. Digital Vault Explorer', '১. ডিজিটাল ভল্ট এক্সপ্লোরার')}
        </button>
        <button
          onClick={() => setActiveTab('workflow')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'workflow' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 bg-slate-50'
          }`}
        >
          {tl('2. Approval Workflows', '২. অনুমোদন ওয়ার্কফ্লো')}
        </button>
        {(currentRole === 'FND' || currentRole === 'MD' || currentRole === 'GM') && (
          <button
            onClick={() => setActiveTab('founder')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'founder' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 bg-slate-50'
            }`}
          >
            {tl('3. Founder Command Center', '৩. ফাউন্ডার কমান্ড সেন্টার')}
          </button>
        )}
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'analytics' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 bg-slate-50'
          }`}
        >
          {tl('4. Storage Analytics', '৪. স্টোরেজ এনালাইটিক্স')}
        </button>
        <button
          onClick={() => setActiveTab('alerts')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all relative ${
            activeTab === 'alerts' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 bg-slate-50'
          }`}
        >
          {tl('5. Expiry Engine Alerts', '৫. মেয়াদোত্তীর্ণের অ্যালার্ট')}
          {alerts.filter(a => a.status === 'Unresolved').length > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[8px] h-4 w-4 rounded-full flex items-center justify-center font-bold">
              {alerts.filter(a => a.status === 'Unresolved').length}
            </span>
          )}
        </button>
      </div>

      {/* Tab Panels */}
      <AnimatePresence mode="wait">
        {/* TAB 1: DIGITAL VAULT EXPLORER */}
        {activeTab === 'dms' && (
          <motion.div
            key="dms"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {/* Folder categories layout */}
            <div>
              <h3 className="font-display font-extrabold text-sm text-slate-800 mb-3 uppercase tracking-wider">
                {tl('Central Document Categories Repository', 'নথির কেন্দ্রীয় ক্যাটাগরি ফোল্ডারসমূহ')}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {folders.map(folder => {
                  const Icon = folder.icon;
                  // Count documents belonging to this folder mapped from database
                  const count = documents.filter(d => folder.id === 'All' || getDocFolder(d.documentType) === folder.id).length;
                  return (
                    <button
                      key={folder.id}
                      onClick={() => setSelectedFolder(folder.id)}
                      className={`p-3.5 rounded-xl text-left transition-all ${
                        selectedFolder === folder.id 
                          ? 'bg-slate-900 text-white shadow-md scale-[1.02]' 
                          : 'bg-white hover:bg-slate-50 border border-slate-100 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`p-1.5 rounded-lg ${selectedFolder === folder.id ? 'bg-slate-800' : 'bg-slate-50'}`}>
                          <Icon size={16} />
                        </div>
                        <span className="text-xs font-bold leading-tight block truncate">
                          {lang === 'en' ? folder.labelEn : folder.labelBn}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono font-bold block text-slate-400">
                        {count} {tl('Files Indexed', 'ফাইল সূচিবদ্ধ')}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Filter, Search & Explorer Grid Toolbar */}
            <div className="bg-white p-4 rounded-xl border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder={tl('Search vault by doc name, project ID, client name, case number...', 'নথি বা মামলার নম্বর দিয়ে সম্পূর্ণ ডাটাবেস সার্চ করুন...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-slate-800 text-slate-800"
                />
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div className="flex bg-slate-100 p-1 rounded-lg">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-md ${viewMode === 'grid' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-400 hover:text-slate-800'}`}
                  >
                    <Grid size={15} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-md ${viewMode === 'list' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-400 hover:text-slate-800'}`}
                  >
                    <List size={15} />
                  </button>
                </div>
              </div>
            </div>

            {/* Explorer Grid/List */}
            {searchedDocuments.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center space-y-3">
                <div className="mx-auto w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-400">
                  <Search size={20} />
                </div>
                <h4 className="font-bold text-slate-800 text-sm">{tl('No Registered Documents Found', 'কোন নথিপত্র পাওয়া যায়নি')}</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  {tl('No documents matched your search query or simulated role access permission parameters.', 'সার্চ এবং অ্যাক্সেস পারমিশন অনুযায়ী কোনো ডাটা খুঁজে পাওয়া যায়নি।')}
                </p>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchedDocuments.map(doc => {
                  const folder = getDocFolder(doc.documentType);
                  return (
                    <div key={doc.id} className="bg-white rounded-xl border border-slate-100 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-all">
                      <div>
                        <div className="flex items-start justify-between border-b border-slate-50 pb-3 mb-3">
                          <div className="space-y-1">
                            <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
                              {folder}
                            </span>
                            <h4 className="font-bold text-slate-800 text-xs line-clamp-1">{doc.title}</h4>
                            <span className="font-mono text-[9px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-sm">
                              ID: {doc.documentNo}
                            </span>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            doc.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                            doc.status === 'Reviewed' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                            'bg-slate-50 text-slate-700'
                          }`}>
                            {doc.status}
                          </span>
                        </div>

                        <p className="text-[10px] text-slate-400 mb-3 italic">
                          {doc.remarks || tl('No additional remarks entered', 'কোন মন্তব্য লিখা নেই')}
                        </p>

                        <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-[10px] font-mono text-slate-500 border-b border-slate-50 pb-3 mb-3">
                          <div>
                            {tl('Active Version:', 'সক্রিয় সংস্করণ:')} <span className="text-slate-800 font-bold">v{doc.versionNumber}</span>
                          </div>
                          <div>
                            {tl('Format type:', 'ফাইলের ফরম্যাট:')} <span className="text-indigo-600 font-bold uppercase">PDF</span>
                          </div>
                          <div className="col-span-2 truncate">
                            {tl('Server Path:', 'সার্ভার পাথ:')} <span className="text-slate-700 font-bold">{doc.filePath}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                        <span>Updated: {new Date(doc.updatedAt).toLocaleDateString()}</span>
                        <div className="flex items-center gap-1.5">
                          {/* Print summary */}
                          <button
                            onClick={() => compilePdfView(doc)}
                            title={tl('View Certified Copy', 'প্রত্যয়িত কপি দেখুন')}
                            className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                          >
                            <Printer size={13} />
                          </button>
                          {/* New Version Upload */}
                          <button
                            onClick={() => {
                              setSelectedDocForVersion(doc);
                              setIsNewVersionOpen(true);
                            }}
                            title={tl('Upload New Version', 'নতুন সংস্করণ আপলোড')}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                          >
                            <Upload size={13} />
                          </button>
                          {/* Version History */}
                          <button
                            onClick={() => {
                              setSelectedDocForHistory(doc);
                              setIsVersionHistoryOpen(true);
                            }}
                            title={tl('View Version Trail', 'সংস্করণের ইতিহাস')}
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                          >
                            <History size={13} />
                          </button>
                          {/* Advance Approval state */}
                          <button
                            onClick={() => {
                              setSelectedDocForWorkflow(doc);
                              setIsWorkflowModalOpen(true);
                            }}
                            title={tl('Trigger Approval Workflow', 'অনুমোদন ওয়ার্কফ্লো')}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                          >
                            <CheckCircle2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-100 shadow-xs overflow-hidden">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-mono text-slate-500 uppercase">
                      <th className="p-4">{tl('Document Name', 'নথির নাম')}</th>
                      <th className="p-4">{tl('Doc Type', 'ধরণ')}</th>
                      <th className="p-4">{tl('Active Version', 'সক্রিয় সংস্করণ')}</th>
                      <th className="p-4">{tl('Registration No', 'দলিল নং')}</th>
                      <th className="p-4">{tl('Status', 'অবস্থা')}</th>
                      <th className="p-4 text-right">{tl('Action', 'কার্যক্রম')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {searchedDocuments.map(doc => (
                      <tr key={doc.id} className="border-b border-slate-50 hover:bg-slate-50/40 text-xs">
                        <td className="p-4 font-bold text-slate-800 max-w-xs truncate">{doc.title}</td>
                        <td className="p-4 text-slate-500 font-semibold">{doc.documentType}</td>
                        <td className="p-4 font-mono font-bold text-indigo-600">v{doc.versionNumber}</td>
                        <td className="p-4 font-mono text-slate-600">{doc.documentNo}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            doc.status === 'Approved' ? 'bg-emerald-50 text-emerald-700' :
                            doc.status === 'Reviewed' ? 'bg-amber-50 text-amber-700' :
                            'bg-slate-50 text-slate-600'
                          }`}>
                            {doc.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => compilePdfView(doc)}
                              className="p-1 text-slate-500 hover:text-emerald-600"
                              title="Print Summary"
                            >
                              <Printer size={13} />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedDocForVersion(doc);
                                setIsNewVersionOpen(true);
                              }}
                              className="p-1 text-slate-500 hover:text-indigo-600"
                              title="New Version"
                            >
                              <Upload size={13} />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedDocForHistory(doc);
                                setIsVersionHistoryOpen(true);
                              }}
                              className="p-1 text-slate-500 hover:text-amber-600"
                              title="Version History"
                            >
                              <History size={13} />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedDocForWorkflow(doc);
                                setIsWorkflowModalOpen(true);
                              }}
                              className="p-1 text-slate-500 hover:text-rose-600"
                              title="Approval Workflow"
                            >
                              <CheckCircle2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}

        {/* TAB 2: APPROVAL WORKFLOWS */}
        {activeTab === 'workflow' && (
          <motion.div
            key="workflow"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            <div className="bg-white p-5 rounded-xl border border-slate-100">
              <h3 className="font-display font-extrabold text-slate-800 text-sm mb-1">
                {tl('Digital Workflow Approval Pipelines', 'ডিজিটাল অনুমোদন ওয়ার্কফ্লো পাইপলাইন')}
              </h3>
              <p className="text-[11px] text-slate-400 mb-4">
                {tl('All corporate documents must follow five pipeline steps before being archived or issued publicly.', 'সকল এন্টারপ্রাইজ নথি চূড়ান্তভাবে প্রকাশের পূর্বে পাঁচটি পর্যায় অতিক্রম করে।')}
              </p>

              {/* Progress Pipeline Graph Display */}
              <div className="grid grid-cols-5 gap-2 text-center text-xs font-bold font-mono py-4 border-t border-b border-slate-50 mb-6 bg-slate-50/50 rounded-xl">
                <div className="p-3 bg-slate-100 rounded-lg text-slate-700">
                  <span className="block text-[10px] text-slate-400">STAGE 1</span>
                  Draft (খসড়া)
                </div>
                <div className="p-3 bg-sky-50 text-sky-700 border border-sky-100 rounded-lg">
                  <span className="block text-[10px] text-sky-400">STAGE 2</span>
                  Submitted (দাখিল)
                </div>
                <div className="p-3 bg-amber-50 text-amber-700 border border-amber-100 rounded-lg">
                  <span className="block text-[10px] text-amber-400">STAGE 3</span>
                  Reviewed (পর্যালোচিত)
                </div>
                <div className="p-3 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg animate-pulse">
                  <span className="block text-[10px] text-emerald-400">STAGE 4</span>
                  Approved (অনুমোদিত)
                </div>
                <div className="p-3 bg-slate-900 text-slate-200 rounded-lg">
                  <span className="block text-[10px] text-slate-400">STAGE 5</span>
                  Archived (আর্কাইভ)
                </div>
              </div>

              {/* Workflows Registry */}
              <div className="space-y-4">
                {documents.map(doc => {
                  const stepsCount = doc.status === 'Approved' ? 4 : doc.status === 'Reviewed' ? 3 : doc.status === 'Submitted' ? 2 : 1;
                  return (
                    <div key={doc.id} className="p-4 border border-slate-100 rounded-xl space-y-3 hover:bg-slate-50/40 transition-all">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                        <div>
                          <p className="font-bold text-slate-800 text-xs">{doc.title}</p>
                          <span className="font-mono text-[9px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-sm">
                            SYS-REF: {doc.documentNo}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-slate-400">
                            {stepsCount}/5 {tl('Stages Resolved', 'ধাপ সম্পন্ন')}
                          </span>
                          <button
                            onClick={() => {
                              setSelectedDocForWorkflow(doc);
                              setIsWorkflowModalOpen(true);
                            }}
                            className="bg-slate-900 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg hover:bg-slate-800"
                          >
                            {tl('Change Approval Stage', 'অনুমোদন পরিবর্তন')}
                          </button>
                        </div>
                      </div>

                      {/* Visual progress bar */}
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-emerald-500 h-full transition-all duration-500" 
                          style={{ width: `${(stepsCount / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 3: FOUNDER COMMAND CENTER */}
        {activeTab === 'founder' && (
          <motion.div
            key="founder"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs">
                <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">{tl('Total Enterprise Vault Files', 'সর্বমোট ভল্ট ফাইলসমূহ')}</p>
                <p className="text-2xl font-black text-slate-900 mt-1">{documents.length}</p>
                <span className="text-[9px] text-slate-400 block mt-1">{tl('Fully indexed database logs', 'সরাসরি ডিজিটাল সূচিবদ্ধ')}</span>
              </div>
              <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs">
                <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">{tl('Awaiting Executive Approval', 'অনুমোদনের অপেক্ষায় নথিপত্র')}</p>
                <p className="text-2xl font-black text-amber-600 mt-1">{pendingApprovalsList.length}</p>
                <span className="text-[9px] text-amber-500 font-bold block mt-1">{tl('Awaiting Founder confirmation signature', 'ফাউন্ডার স্বাক্ষরের অপেক্ষায়')}</span>
              </div>
              <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs">
                <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">{tl('Expired Legal Documents', 'মেয়াদোত্তীর্ণ দলিলপত্র')}</p>
                <p className="text-2xl font-black text-rose-500 mt-1">{alerts.filter(a => a.status === 'Unresolved' && a.daysRemaining <= 30).length}</p>
                <span className="text-[9px] text-rose-500 font-bold block mt-1">{tl('High-priority exipry risks', 'সর্বোচ্চ ঝুঁকিপূর্ণ ফাইল')}</span>
              </div>
              <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs">
                <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">{tl('Immutable Archive Depot', 'সংরক্ষিত ডিজিটাল রেকর্ড')}</p>
                <p className="text-2xl font-black text-indigo-600 mt-1">{archives.length}</p>
                <span className="text-[9px] text-indigo-500 block mt-1">{tl('Hashed digital copies', 'স্থায়ীভাবে সংরক্ষিত ফাইল')}</span>
              </div>
            </div>

            {/* Founder Quick Actions Approval Desk */}
            <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs">
              <div className="flex justify-between items-center border-b border-slate-50 pb-3 mb-4">
                <div>
                  <h3 className="font-display font-bold text-slate-800 text-sm">{tl('Founder Quick Batch Approvals Desk', 'ফাউন্ডার দ্রুত অনুমোদন ডেস্ক')}</h3>
                  <p className="text-[10px] text-slate-400">{tl('Directly approve legal contracts and RAJUK files awaiting executive clearance.', 'তদারকির জন্য মুলতুবি থাকা ফাইলগুলো সরাসরি ১-ক্লিকে অনুমোদন করুন।')}</p>
                </div>
                <span className="text-[10px] font-mono bg-indigo-50 text-indigo-700 font-bold px-2.5 py-1 rounded-full uppercase">
                  Chairman Authorization
                </span>
              </div>

              {pendingApprovalsList.length === 0 ? (
                <div className="p-8 text-center bg-slate-50/50 rounded-xl text-slate-400 text-xs">
                  <CheckCircle size={28} className="text-emerald-500 mx-auto mb-2" />
                  {tl('No documents currently pending your review or approval signatures.', 'এই মুহূর্তে কোনো নথি আপনার রিভিউ বা স্বাক্ষরের জন্য বাকি নেই।')}
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingApprovalsList.map(doc => (
                    <div key={doc.id} className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div>
                        <h4 className="font-bold text-slate-800 text-xs">{doc.title}</h4>
                        <div className="flex gap-2 text-[10px] font-mono text-slate-400 mt-1">
                          <span>No: {doc.documentNo}</span>
                          <span>•</span>
                          <span>Stage: <span className="font-bold text-amber-600">{doc.status}</span></span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            const updated = documents.map(d => d.id === doc.id ? { ...d, status: 'Approved' as const } : d);
                            setDocuments(updated);
                            addAuditLog('FOUNDER_APPROVE', 'documents', `Founder fast-approved document ${doc.documentNo}`, `ফাউন্ডার দ্বারা দ্রুত অনুমোদন সম্পন্ন হয়েছে: ${doc.documentNo}`);
                          }}
                          className="bg-emerald-500 text-slate-950 px-3 py-1.5 rounded-lg text-[10px] font-bold hover:bg-emerald-400"
                        >
                          {tl('Approve (অনুমোদন)', 'অনুমোদন')}
                        </button>
                        <button
                          onClick={() => {
                            const updated = documents.map(d => d.id === doc.id ? { ...d, status: 'Draft' as const } : d);
                            setDocuments(updated);
                          }}
                          className="border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg text-[10px] font-bold hover:bg-slate-100"
                        >
                          {tl('Reject (প্রত্যাখ্যান)', 'প্রত্যাখ্যান')}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* TAB 4: STORAGE ANALYTICS */}
        {activeTab === 'analytics' && (
          <motion.div
            key="analytics"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Storage Gauge */}
              <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs md:col-span-1 space-y-4">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">{tl('Database Capacity Gauge', 'ডাটাবেস ধারণক্ষমতা গেজ')}</h4>
                <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between text-xs font-mono">
                    <div>{tl('Volume Used:', 'মোট ব্যবহৃত স্থান:')} <span className="font-bold text-slate-800">{storageStats.baseUsageGb} GB</span></div>
                    <div className="text-right text-slate-500">{storageStats.maxCapacityGb} GB</div>
                  </div>
                  <div className="overflow-hidden h-3 text-xs flex rounded-full bg-slate-100">
                    <div 
                      style={{ width: `${storageStats.usagePercent}%` }} 
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-600 transition-all duration-500"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-2 text-right">
                    {storageStats.usagePercent}% {tl('Total space allocated', 'সর্বমোট স্পেস ব্যবহৃত হয়েছে')}
                  </span>
                </div>
              </div>

              {/* Categorization Breakdown list */}
              <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs md:col-span-2 space-y-4">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">{tl('Files Density by Business Category', 'ব্যবসায়িক ক্যাটাগরি অনুসারে ফাইলের সংখ্যা')}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                  {Object.entries(storageStats.countsByCategory).map(([category, count]) => (
                    <div key={category} className="p-3 bg-slate-50 rounded-lg flex items-center justify-between">
                      <span className="font-sans font-semibold text-slate-700">{category}</span>
                      <span className="bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded">
                        {count} {tl('Files', 'ফাইল')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 5: DOCUMENT EXPIRY ALERTS */}
        {activeTab === 'alerts' && (
          <motion.div
            key="alerts"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            <div className="bg-white p-5 rounded-xl border border-slate-100">
              <div className="flex justify-between items-center border-b border-slate-50 pb-3 mb-4">
                <div>
                  <h3 className="font-display font-bold text-slate-800 text-sm">{tl('Document Expiry Warning Engine', 'নথির মেয়াদোত্তীর্ণ সতর্কতা ইঞ্জিন')}</h3>
                  <p className="text-[10px] text-slate-400">{tl('Automatic countdown monitoring legal contracts, Power of Attorney agreements, and RAJUK layout files.', 'আইনি এগ্রিমেন্ট ও রাজউক লেআউটের জন্য স্বয়ংক্রিয় মেয়াদোত্তীর্ণ গণনা।')}</p>
                </div>
                <span className="p-1 text-slate-400 hover:text-indigo-600 cursor-pointer">
                  <RefreshCw size={14} />
                </span>
              </div>

              <div className="space-y-3">
                {alerts.map(alt => (
                  <div key={alt.id} className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-rose-50 text-rose-600 rounded-lg shrink-0 mt-0.5">
                        <AlertTriangle size={16} />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-xs">{alt.documentTitle}</h4>
                        <div className="flex flex-wrap gap-2 text-[10px] font-mono text-slate-400 mt-1">
                          <span>No: {(alt as any).documentNo || alt.documentId || 'N/A'}</span>
                          <span>•</span>
                          <span>Type: {alt.documentType}</span>
                          <span>•</span>
                          <span className="text-rose-500 font-bold">Expiry: {alt.expiryDate}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right font-mono text-[11px]">
                        <span className="text-rose-600 font-black block">
                          {alt.daysRemaining} {tl('Days Left', 'দিন বাকি আছে')}
                        </span>
                        <span className="text-[9px] text-slate-400 uppercase">Alert level: {alt.alertType}</span>
                      </div>
                      {alt.status === 'Unresolved' ? (
                        <button
                          onClick={() => handleResolveAlert(alt.id)}
                          className="bg-slate-900 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg hover:bg-slate-800"
                        >
                          {tl('Resolve Alert', 'সমাধান করুন')}
                        </button>
                      ) : (
                        <span className="bg-emerald-100 text-emerald-800 font-bold text-[10px] px-3 py-1.5 rounded-lg">
                          {tl('Resolved', 'মীমাংসিত')}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* POPUP: REGISTER NEW VAULT DOCUMENT */}
      {isNewDocOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl"
          >
            <div className="flex justify-between items-center border-b border-slate-50 pb-3">
              <h3 className="font-display font-bold text-slate-900 text-sm">{tl('Register New Vault File', 'ভল্টে নতুন ফাইল আপলোড')}</h3>
              <button onClick={() => setIsNewDocOpen(false)} className="text-slate-400 hover:text-slate-800">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateDocument} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">{tl('Document Name / Title', 'নথির নাম বা বিবরণী')}</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bainanama Deed Sector 10"
                  value={newDocData.title}
                  onChange={(e) => setNewDocData({ ...newDocData, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">{tl('Document/Deed Registry No', 'দলিল/চুক্তিপত্র সূচি নম্বর')}</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. LD-UT-980"
                    value={newDocData.documentNo}
                    onChange={(e) => setNewDocData({ ...newDocData, documentNo: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">{tl('Doc Format Category', 'নথির ধরণ ক্যাটাগরি')}</label>
                  <select
                    value={newDocData.documentType}
                    onChange={(e) => setNewDocData({ ...newDocData, documentType: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 cursor-pointer"
                  >
                    <option value="Land Deed">Land Deed (জমির দলিল)</option>
                    <option value="Mutation Document">Mutation Document (মিউটেশন)</option>
                    <option value="JVA Agreement">JVA Agreement (জেভিএ চুক্তি)</option>
                    <option value="Project Approval">Project Approval (রাজউক/লেআউট)</option>
                    <option value="Booking Agreement">Booking Agreement (গ্রাহক বুকিং)</option>
                    <option value="Money Receipt">Money Receipt (মানি রিসিট)</option>
                    <option value="Employee File">Employee File (এইচআর ফাইল)</option>
                    <option value="Investor Certificate">Investor Certificate (বিনিয়োগকারী সনদ)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">{tl('Remarks / Storage Description', 'নথি সংশ্লিষ্ট অতিরিক্ত তথ্য বা বিবরণ')}</label>
                <textarea
                  placeholder="Vetted by senior advocate cabinet..."
                  value={newDocData.remarks}
                  onChange={(e) => setNewDocData({ ...newDocData, remarks: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 h-16 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-500 text-slate-950 font-bold py-2.5 rounded-lg hover:bg-emerald-400 transition-all cursor-pointer border-none"
              >
                {tl('Confirm Registry Upload', 'ডকুমেন্ট আপলোড নিশ্চিত করুন')}
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* POPUP: UPLOAD NEW VERSION */}
      {isNewVersionOpen && selectedDocForVersion && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl"
          >
            <div className="flex justify-between items-center border-b border-slate-50 pb-3">
              <h3 className="font-display font-bold text-slate-900 text-sm">
                {tl(`Upload New Version (v${selectedDocForVersion.versionNumber + 1})`, `নতুন সংস্করণ আপলোড করুন (v${selectedDocForVersion.versionNumber + 1})`)}
              </h3>
              <button onClick={() => setIsNewVersionOpen(false)} className="text-slate-400 hover:text-slate-800">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleUploadVersion} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">{tl('Version Remarks / Change Purpose', 'সংস্করণ পরিবর্তনের মূল কারণ')}</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Incorporated corrections on Section 4"
                  value={newVersionData.remarks}
                  onChange={(e) => setNewVersionData({ ...newVersionData, remarks: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">{tl('Detailed Change History', 'বিস্তারিত পরিবর্তন সংক্রান্ত বিবরণী')}</label>
                <textarea
                  placeholder="Specific details about what changed since the previous upload..."
                  value={newVersionData.changeHistory}
                  onChange={(e) => setNewVersionData({ ...newVersionData, changeHistory: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 h-20 resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">{tl('Simulated PDF File Name', 'আপলোডকৃত পিডিএফ ফাইল নেম')}</label>
                <input
                  type="text"
                  placeholder="e.g. original_bainanama_v2.pdf"
                  value={newVersionData.filePath}
                  onChange={(e) => setNewVersionData({ ...newVersionData, filePath: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 text-white font-bold py-2.5 rounded-lg hover:bg-indigo-500 transition-all cursor-pointer border-none"
              >
                {tl('Register Incremental Version', 'নতুন সংস্করণ সূচিবদ্ধ করুন')}
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* POPUP: ADVANCE WORKFLOW STAGE */}
      {isWorkflowModalOpen && selectedDocForWorkflow && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl"
          >
            <div className="flex justify-between items-center border-b border-slate-50 pb-3">
              <h3 className="font-display font-bold text-slate-900 text-sm">{tl('Advance Document Approval Step', 'অনুমোদন ওয়ার্কফ্লো ধাপ পরিবর্তন')}</h3>
              <button onClick={() => setIsWorkflowModalOpen(false)} className="text-slate-400 hover:text-slate-800">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg">
                <p className="font-bold text-slate-800">{selectedDocForWorkflow.title}</p>
                <span className="font-mono text-[9px] text-slate-400">Current Stage: {selectedDocForWorkflow.status}</span>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">{tl('Executive Comment / Remarks', 'অনুমোদনকারী নির্বাহী কর্মকর্তার মন্তব্য')}</label>
                <input
                  type="text"
                  placeholder="e.g. Vetted perfectly and cleared for layout construction"
                  value={workflowComment}
                  onChange={(e) => setWorkflowComment(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5"
                />
              </div>

              <div className="grid grid-cols-1 gap-2">
                <button
                  onClick={() => handleUpdateWorkflow('Submitted')}
                  className="bg-sky-50 text-sky-700 font-bold py-2 rounded-lg hover:bg-sky-100 border border-sky-200"
                >
                  {tl('Move to [Submitted] - দাখিল করুন', 'Move to Submitted')}
                </button>
                <button
                  onClick={() => handleUpdateWorkflow('Reviewed')}
                  className="bg-amber-50 text-amber-700 font-bold py-2 rounded-lg hover:bg-amber-100 border border-amber-200"
                >
                  {tl('Move to [Reviewed] - পর্যালোচনা সম্পন্ন', 'Move to Reviewed')}
                </button>
                <button
                  onClick={() => handleUpdateWorkflow('Approved')}
                  className="bg-emerald-500 text-slate-950 font-bold py-2 rounded-lg hover:bg-emerald-400 border-none"
                >
                  {tl('Approve & Sign Certificate - অনুমোদন ও স্বাক্ষর', 'Approve & Sign')}
                </button>
                <button
                  onClick={() => {
                    handleArchiveDoc(selectedDocForWorkflow);
                    setIsWorkflowModalOpen(false);
                  }}
                  className="bg-slate-900 text-white font-bold py-2 rounded-lg hover:bg-slate-800 border-none"
                >
                  {tl('Move to Immutable Digital Archive - আর্কাইভ', 'Move to Archive')}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* POPUP: VERSION TRAIL HISTORY */}
      {isVersionHistoryOpen && selectedDocForHistory && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl"
          >
            <div className="flex justify-between items-center border-b border-slate-50 pb-3">
              <h3 className="font-display font-bold text-slate-900 text-sm">{tl('Document Historical Version Logs', 'সংস্করণ পরিবর্তনের ধারাবাহিক ইতিহাস')}</h3>
              <button onClick={() => setIsVersionHistoryOpen(false)} className="text-slate-400 hover:text-slate-800">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {docVersions
                .filter(v => v.documentId === selectedDocForHistory.id)
                .sort((a, b) => b.versionNumber - a.versionNumber)
                .map(v => (
                  <div key={v.id} className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                        Version v{v.versionNumber}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{new Date(v.uploadedAt).toLocaleString()}</span>
                    </div>
                    <p className="font-semibold text-slate-800 mt-1">{v.remarks}</p>
                    <p className="text-[10px] text-slate-500 italic mt-0.5">{v.changeHistory}</p>
                    <p className="text-[9px] text-slate-400 font-mono mt-1">Uploaded by: {v.uploadedBy}</p>
                  </div>
                ))}
            </div>
          </motion.div>
        </div>
      )}

      {/* MODAL: EXPORT / VIEW CERTIFIED SUMMARY PDF */}
      {pdfPayload && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl"
          >
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <span className="text-xs font-mono font-bold bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full uppercase flex items-center gap-1">
                <ShieldCheck size={14} /> Certified Digital Transcript
              </span>
              <button onClick={() => setPdfPayload(null)} className="text-slate-400 hover:text-slate-800">
                <X size={16} />
              </button>
            </div>

            <div className="max-h-[500px] overflow-y-auto p-1">
              {pdfPayload.contentHtml}
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                onClick={() => window.print()}
                className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-800 cursor-pointer flex items-center gap-1.5 border-none"
              >
                <Printer size={14} />
                {tl('Print Document', 'মুদ্রণ করুন')}
              </button>
              <button
                onClick={() => setPdfPayload(null)}
                className="bg-slate-100 text-slate-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-200 cursor-pointer border-none"
              >
                {tl('Close View', 'বন্ধ করুন')}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
