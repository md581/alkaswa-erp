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
  RoleId 
} from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FolderOpen, 
  FileText, 
  Upload, 
  Plus, 
  Search, 
  Bell, 
  Mail, 
  Phone, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  History, 
  Download, 
  Eye, 
  FileDown, 
  Clock, 
  User, 
  Calendar, 
  ArrowRight, 
  Lock,
  Filter,
  Check,
  RotateCcw,
  AlertCircle
} from 'lucide-react';

interface Props {
  lang: 'en' | 'bn';
  currentRole: RoleId;
  addAuditLog: (action: string, table: string, descEn: string, descBn: string) => void;
}

export default function DocumentWorkflowNotificationModule({ lang, currentRole, addAuditLog }: Props) {
  // DB States backed by localStorage repository
  const [documents, setDocuments] = useState<ERPDocument[]>(() => dbService.documents.getAll());
  const [notifications, setNotifications] = useState<ERPNotification[]>(() => dbService.notifications.getAll());
  const [workflows, setWorkflows] = useState<ApprovalWorkflow[]>(() => dbService.workflows.getAll());
  const [workflowSteps, setWorkflowSteps] = useState<ApprovalWorkflowStep[]>(() => dbService.workflowSteps.getAll());
  const [workflowLogs, setWorkflowLogs] = useState<ApprovalWorkflowLog[]>(() => dbService.workflowLogs.getAll());

  // Component UI States
  const [activeTab, setActiveTab] = useState<'dms' | 'workflow' | 'notifications'>('dms');
  const [docFilter, setDocFilter] = useState<string>('All');
  const [docSearch, setDocSearch] = useState<string>('');
  
  // Create Document State
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocType, setNewDocType] = useState<ERPDocument['documentType']>('Booking Agreement');
  const [newDocEntityId, setNewDocEntityId] = useState('');
  const [newDocRemarks, setNewDocRemarks] = useState('');

  // Selected document for history view
  const [selectedDocHistory, setSelectedDocHistory] = useState<ERPDocument | null>(null);
  
  // Selected PDF viewer modal state
  const [previewPdfContent, setPreviewPdfContent] = useState<{
    title: string;
    type: string;
    html: string;
  } | null>(null);

  // Workflow Interaction state
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>('wf-1');
  const [actionRemarks, setActionRemarks] = useState('');

  // Save changes back to local dbService
  useEffect(() => {
    dbService.documents.saveAll(documents);
  }, [documents]);

  useEffect(() => {
    dbService.notifications.saveAll(notifications);
  }, [notifications]);

  useEffect(() => {
    dbService.workflows.saveAll(workflows);
  }, [workflows]);

  useEffect(() => {
    dbService.workflowSteps.saveAll(workflowSteps);
  }, [workflowSteps]);

  useEffect(() => {
    dbService.workflowLogs.saveAll(workflowLogs);
  }, [workflowLogs]);

  // Translate labels helper
  const tl = (en: string, bn: string) => (lang === 'en' ? en : bn);

  // Role translation & authority mapping helper
  const roleRequiredMap: Record<RoleId, string> = {
    FND: 'MD',
    MD: 'MD',
    GM: 'GM',
    HRM: 'HR',
    ACT: 'CFO',
    SLM: 'Manager',
    LAM: 'Manager',
    LGL: 'Manager',
    ENG: 'Manager',
    PRM: 'Manager',
    CST: 'Customer',
    LDO: 'LandOwner',
    INV: 'Investor'
  };

  const getMyRequiredWorkflowRole = (): string => {
    return roleRequiredMap[currentRole] || 'Manager';
  };

  // Filtered lists
  const filteredDocs = useMemo(() => {
    return documents.filter(doc => {
      const matchType = docFilter === 'All' || doc.documentType === docFilter;
      const matchSearch = doc.title.toLowerCase().includes(docSearch.toLowerCase()) || 
                          doc.documentNo.toLowerCase().includes(docSearch.toLowerCase()) ||
                          doc.relatedEntityId.toLowerCase().includes(docSearch.toLowerCase());
      return matchType && matchSearch;
    });
  }, [documents, docFilter, docSearch]);

  const unreadNotificationCount = useMemo(() => {
    return notifications.filter(n => !n.isRead).length;
  }, [notifications]);

  // Handle uploading/adding new document revision
  const handleUploadDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocTitle) return;

    const count = documents.filter(d => d.documentType === newDocType).length + 1;
    const prefix = newDocType.replace(/\s+/g, '').slice(0, 4).toUpperCase();
    const docNo = `AKH-${prefix}-2026-${String(count).padStart(3, '0')}`;

    const newDoc: ERPDocument = {
      id: `doc-${Date.now()}`,
      companyId: 'c1',
      documentNo: docNo,
      documentType: newDocType,
      relatedModule: getRelatedModule(newDocType),
      relatedEntityId: newDocEntityId || 'N/A',
      title: newDocTitle,
      status: 'Active',
      versionNumber: 1,
      filePath: '#',
      remarks: newDocRemarks || 'First draft successfully uploaded to repository.',
      isArchived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setDocuments([newDoc, ...documents]);

    // Track in system audit log
    addAuditLog(
      'INSERT',
      'documents',
      `Uploaded new DMS Document: ${docNo} (${newDocTitle})`,
      `ডিএমএস-এ নতুন নথি আপলোড করা হয়েছে: ${docNo} (${newDocTitle})`
    );

    // Trigger Notification automatically
    triggerSystemNotification(
      'Document Expiry Alert',
      tl('New Document Uploaded', 'নতুন নথি আপলোড করা হয়েছে'),
      tl(`New Document ${docNo} (${newDocType}) has been registered inside ${COMPANY_PROFILE.name} secure DMS vault.`, `${COMPANY_PROFILE.shortName} সিকিউর ডিএমএস ভল্টে নতুন নথি ${docNo} (${newDocType}) নিবন্ধিত হয়েছে।`),
      'In-App'
    );

    // Reset Form
    setNewDocTitle('');
    setNewDocRemarks('');
    setNewDocEntityId('');
    setIsUploadOpen(false);
  };

  const getRelatedModule = (type: ERPDocument['documentType']): ERPDocument['relatedModule'] => {
    switch(type) {
      case 'Booking Agreement':
      case 'Mutation Document': return 'Real Estate';
      case 'Money Receipt':
      case 'Vendor Agreement': return 'Finance';
      case 'Land Deed':
      case 'JVA Agreement':
      case 'Project Approval': return 'Real Estate';
      case 'Employee File':
      case 'Payroll Document': return 'HR';
      case 'Investor Certificate': return 'Investor';
      default: return 'Real Estate';
    }
  };

  // Handle document version upgrade (mock revision trigger)
  const handleReviseDocument = (docId: string) => {
    const doc = documents.find(d => d.id === docId);
    if (!doc) return;

    const updatedDocs = documents.map(d => {
      if (d.id === docId) {
        return {
          ...d,
          versionNumber: d.versionNumber + 1,
          updatedAt: new Date().toISOString(),
          remarks: `Version ${d.versionNumber + 1} amended by ${currentRole} officer.`
        };
      }
      return d;
    });

    setDocuments(updatedDocs);

    // Log update
    addAuditLog(
      'UPDATE',
      'documents',
      `Amended DMS Document ${doc.documentNo} to version ${doc.versionNumber + 1}`,
      `ডিএমএস নথি ${doc.documentNo} সংস্করণ ${doc.versionNumber + 1}-এ সংশোধন করা হয়েছে`
    );

    triggerSystemNotification(
      'Document Expiry Alert',
      tl('Document Revised', 'নথি সংশোধিত হয়েছে'),
      tl(`Document ${doc.documentNo} has been revised to version ${doc.versionNumber + 1} by authorized personnel.`, `অনুমোদিত কর্মকর্তা দ্বারা ${doc.documentNo} নথিটি সংস্করণ ${doc.versionNumber + 1}-এ সংশোধিত হয়েছে।`),
      'In-App'
    );
  };

  // Soft Archive/Delete
  const handleArchiveDocument = (docId: string) => {
    const doc = documents.find(d => d.id === docId);
    if (!doc) return;

    const updated = documents.map(d => {
      if (d.id === docId) {
        return { ...d, status: 'Archived' as const, isArchived: true };
      }
      return d;
    });
    setDocuments(updated);

    addAuditLog(
      'DELETE',
      'documents',
      `Soft archived DMS Document ${doc.documentNo}`,
      `ডিএমএস নথি ${doc.documentNo} আর্কাইভ করা হয়েছে`
    );
  };

  // Trigger Notifications helper
  const triggerSystemNotification = (
    type: ERPNotification['type'], 
    title: string, 
    message: string, 
    channel: ERPNotification['channel'] = 'All'
  ) => {
    const newNotif: ERPNotification = {
      id: `notif-${Date.now()}`,
      companyId: 'c1',
      recipientId: 'ALL',
      recipientRole: 'Staff',
      title,
      message,
      type,
      channel,
      isRead: false,
      status: 'Sent',
      createdAt: new Date().toISOString()
    };
    setNotifications([newNotif, ...notifications]);
  };

  // Mark all notifications as read
  const handleMarkAllRead = () => {
    const updated = notifications.map(n => ({ ...n, isRead: true, readAt: new Date().toISOString() }));
    setNotifications(updated);
  };

  // Workflow triggers (Initiate review workflow)
  const handleInitiateWorkflow = (module: ApprovalWorkflow['module'], entityId: string, remarks: string) => {
    const wfId = `wf-${Date.now()}`;
    const newWf: ApprovalWorkflow = {
      id: wfId,
      companyId: 'c1',
      module,
      entityId,
      currentLevel: 1,
      maxLevels: 3,
      status: 'Pending',
      initiatorId: currentRole,
      remarks,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const newSteps: ApprovalWorkflowStep[] = [
      { id: `step-${Date.now()}-1`, workflowId: wfId, levelNo: 1, requiredRole: 'Manager', status: 'Pending', updatedAt: new Date().toISOString() },
      { id: `step-${Date.now()}-2`, workflowId: wfId, levelNo: 2, requiredRole: 'GM', status: 'Pending', updatedAt: new Date().toISOString() },
      { id: `step-${Date.now()}-3`, workflowId: wfId, levelNo: 3, requiredRole: 'MD', status: 'Pending', updatedAt: new Date().toISOString() }
    ];

    const newLog: ApprovalWorkflowLog = {
      id: `log-${Date.now()}`,
      companyId: 'c1',
      workflowId: wfId,
      levelNo: 0,
      previousState: 'Draft',
      newState: 'Pending Level 1 Approval',
      actionBy: currentRole,
      actionByName: getActorName(currentRole),
      actionDate: new Date().toISOString(),
      remarks: 'Workflow initiated.'
    };

    setWorkflows([newWf, ...workflows]);
    setWorkflowSteps([...newSteps, ...workflowSteps]);
    setWorkflowLogs([newLog, ...workflowLogs]);
    setSelectedWorkflowId(wfId);

    addAuditLog(
      'INSERT',
      'approval_workflows',
      `Initiated ${module} workflow for ${entityId}`,
      `${entityId} এর জন্য ${module} অনুমোদন প্রক্রিয়া শুরু করা হয়েছে`
    );

    triggerSystemNotification(
      'Workflow Pending Action',
      tl('Approval Workflow Initiated', 'অনুমোদন প্রক্রিয়া শুরু করা হয়েছে'),
      tl(`Approval Workflow for ${module} (${entityId}) is waiting for Level 1 Manager approval.`, `${module} (${entityId}) এর অনুমোদন প্রক্রিয়াটি প্রথম স্তরের ম্যানেজারের অনুমোদনের জন্য অপেক্ষমাণ।`),
      'All'
    );
  };

  // Perform action (Approve/Reject) on active workflow step
  const handleWorkflowAction = (action: 'Approve' | 'Reject') => {
    const wf = workflows.find(w => w.id === selectedWorkflowId);
    if (!wf) return;

    const currentLevelSteps = workflowSteps.filter(s => s.workflowId === wf.id);
    const activeStep = currentLevelSteps.find(s => s.levelNo === wf.currentLevel);

    if (!activeStep) return;

    // Security Check: Verify user role has rights
    const myWorkRole = getMyRequiredWorkflowRole();
    if (activeStep.requiredRole !== myWorkRole && currentRole !== 'FND' && currentRole !== 'MD') {
      alert(`Access Denied: This step requires ${activeStep.requiredRole} role authority.`);
      return;
    }

    const nextStatus = action === 'Approve' ? 'Approved' : 'Rejected';
    const isLastLevel = wf.currentLevel === wf.maxLevels;

    // Update Step status
    const updatedSteps = workflowSteps.map(step => {
      if (step.id === activeStep.id) {
        return {
          ...step,
          status: nextStatus as any,
          actionTakenBy: currentRole,
          actionTakenName: getActorName(currentRole),
          actionTakenAt: new Date().toISOString(),
          remarks: actionRemarks || 'Approved at executive authority review.',
          updatedAt: new Date().toISOString()
        };
      }
      return step;
    });

    setWorkflowSteps(updatedSteps);

    // Update Workflow Status
    const updatedWorkflows = workflows.map(w => {
      if (w.id === wf.id) {
        if (action === 'Reject') {
          return {
            ...w,
            status: 'Rejected' as const,
            updatedAt: new Date().toISOString(),
            remarks: `Rejected at Level ${wf.currentLevel}: ${actionRemarks}`
          };
        } else if (isLastLevel) {
          return {
            ...w,
            status: 'Approved' as const,
            updatedAt: new Date().toISOString(),
            remarks: `Fully approved at Level ${wf.maxLevels}`
          };
        } else {
          return {
            ...w,
            currentLevel: wf.currentLevel + 1,
            status: 'Under Review' as const,
            updatedAt: new Date().toISOString()
          };
        }
      }
      return w;
    });

    setWorkflows(updatedWorkflows);

    // Log Workflow action
    const newLog: ApprovalWorkflowLog = {
      id: `log-${Date.now()}`,
      companyId: 'c1',
      workflowId: wf.id,
      levelNo: wf.currentLevel,
      previousState: wf.status,
      newState: action === 'Reject' ? 'Rejected' : (isLastLevel ? 'Fully Approved' : `Pending Level ${wf.currentLevel + 1}`),
      actionBy: currentRole,
      actionByName: getActorName(currentRole),
      actionDate: new Date().toISOString(),
      remarks: actionRemarks || `${action} action completed successfully.`
    };

    setWorkflowLogs([newLog, ...workflowLogs]);

    // Add general audit log
    addAuditLog(
      'UPDATE',
      'approval_workflows',
      `Workflow ${wf.module} (${wf.entityId}) - Level ${wf.currentLevel} ${nextStatus} by ${currentRole}`,
      `ওয়ার্কফ্লো ${wf.module} (${wf.entityId}) - স্তর ${wf.currentLevel} ${currentRole} দ্বারা ${nextStatus} করা হয়েছে`
    );

    // Trigger dynamic notifications based on event type
    let notifType: ERPNotification['type'] = 'Workflow Pending Action';
    if (wf.module === 'Booking Approval' && action === 'Approve' && isLastLevel) {
      notifType = 'Booking Confirmed';
    } else if (wf.module === 'Booking Approval' && action === 'Reject') {
      notifType = 'Booking Cancelled';
    }

    triggerSystemNotification(
      notifType,
      tl(`Workflow Step ${nextStatus}`, `ওয়ার্কফ্লো স্তর ${nextStatus}`),
      tl(`Workflow ${wf.module} has been ${nextStatus} at Level ${wf.currentLevel} by ${getActorName(currentRole)}. Remarks: ${actionRemarks || 'N/A'}`, `ওয়ার্কফ্লো ${wf.module} স্তর ${wf.currentLevel}-এ ${getActorName(currentRole)} দ্বারা ${nextStatus} করা হয়েছে।`),
      'All'
    );

    // Reset action state
    setActionRemarks('');
  };

  const getActorName = (role: RoleId): string => {
    const map: Record<RoleId, string> = {
      FND: 'Md Nazrul Islam (Founder)',
      MD: 'Md Nazrul Islam (MD)',
      GM: 'Suhrawardy Ahmed (GM)',
      HRM: 'Anika Rahman (HRM)',
      ACT: 'Sohail Tanvir (ACT)',
      SLM: 'S.M. Rafiqul Hassan (SLM)',
      LAM: 'Tariq Al-Amin (LAM)',
      LGL: 'Barrister Imtiaz Ahmed (LGL)',
      ENG: 'Nazia Sultana (ENG)',
      PRM: 'Mizanur Rahman (PRM)',
      CST: 'Afsana Mim (CST)',
      LDO: 'Haji Mohammad Yusuf (LDO)',
      INV: 'Farhan Adil (INV)'
    };
    return map[role] || 'System Officer';
  };

  // Compile styled HTML templates for document PDFs (Production quality templates with custom watermarks, stamps, and signatures)
  const generatePdfContent = (docType: ERPDocument['documentType'], entityId: string, title: string) => {
    let innerHtml = '';
    
    if (docType === 'Money Receipt') {
      innerHtml = `
        <div style="border: 2px solid #0f172a; padding: 24px; font-family: sans-serif; position: relative; background: #fff;">
          <!-- Watermark -->
          <div style="position: absolute; top: 35%; left: 15%; font-size: 52px; color: rgba(16, 185, 129, 0.08); transform: rotate(-30deg); font-weight: bold; pointer-events: none; text-align: center; width: 70%;">
            ${COMPANY_PROFILE.name}<br><span style="font-size: 24px;">OFFICIAL RECEIPT</span>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
              <td style="width: 70%;">
                <h2 style="margin: 0; color: #10b981; font-size: 28px; font-weight: bold; letter-spacing: -1px;">${COMPANY_PROFILE.name}</h2>
                <p style="margin: 4px 0 0 0; font-size: 11px; color: #475569;">House 14, Road 5, Sector 11, Uttara, Dhaka, Bangladesh</p>
                <p style="margin: 2px 0 0 0; font-size: 11px; color: #475569;">Tel: +8802-9876543 | Email: info@${COMPANY_PROFILE.shortName.toLowerCase()}.com.bd</p>
              </td>
              <td style="width: 30%; text-align: right; vertical-align: top;">
                <div style="border: 1px solid #cbd5e1; padding: 8px 12px; background: #f8fafc; display: inline-block; border-radius: 4px; text-align: left;">
                  <span style="font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: bold;">Receipt Number</span>
                  <div style="font-size: 13px; font-weight: bold; color: #0f172a; font-family: monospace; margin-top: 2px;">MR-2026-${entityId.slice(-4) || '1048'}</div>
                </div>
              </td>
            </tr>
          </table>

          <div style="border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; padding: 12px 0; margin-bottom: 20px;">
            <h3 style="margin: 0; font-size: 16px; text-align: center; text-transform: uppercase; letter-spacing: 2px; color: #1e293b;">OFFICIAL MONEY RECEIPT</h3>
          </div>

          <table style="width: 100%; border-collapse: collapse; font-size: 13px; line-height: 2;">
            <tr>
              <td style="width: 25%; color: #64748b;">Received With Thanks From:</td>
              <td style="width: 75%; font-weight: bold; border-bottom: 1px dotted #cbd5e1; color: #0f172a;">Tariqul Islam Rubel</td>
            </tr>
            <tr>
              <td style="color: #64748b;">The Sum of Taka (in Words):</td>
              <td style="font-weight: bold; border-bottom: 1px dotted #cbd5e1; color: #0f172a;">Fifteen Lakh Taka Only</td>
            </tr>
            <tr>
              <td style="color: #64748b;">Against Project Plot / Flat:</td>
              <td style="font-weight: bold; border-bottom: 1px dotted #cbd5e1; color: #0f172a;">${COMPANY_PROFILE.shortName} Rose Valley - Unit A-2 (Level 2)</td>
            </tr>
            <tr>
              <td style="color: #64748b;">Payment Mode / Bank details:</td>
              <td style="font-weight: bold; border-bottom: 1px dotted #cbd5e1; color: #0f172a;">City Bank Uttara, Pay Order #9283401</td>
            </tr>
          </table>

          <table style="width: 100%; border-collapse: collapse; margin-top: 30px;">
            <tr>
              <td style="width: 40%; vertical-align: middle;">
                <div style="background: #ecfdf5; border: 2px solid #10b981; padding: 12px 20px; border-radius: 6px; display: inline-block;">
                  <span style="font-size: 10px; text-transform: uppercase; color: #047857; font-weight: bold;">Total Amount BDT</span>
                  <div style="font-size: 22px; font-weight: bold; color: #065f46; font-family: monospace; margin-top: 2px;">৳ 1,500,000.00</div>
                </div>
              </td>
              <td style="width: 60%; text-align: right; vertical-align: bottom;">
                <div style="display: inline-block; text-align: center; margin-right: 30px;">
                  <div style="height: 45px; vertical-align: bottom;">
                    <span style="font-family: 'Brush Script MT', cursive; font-size: 22px; color: #1e3a8a; border-bottom: 1px solid #475569; display: inline-block; padding: 0 10px;">Nazrul Islam</span>
                  </div>
                  <div style="font-size: 10px; color: #475569; font-weight: bold; margin-top: 4px;">Md Nazrul Islam</div>
                  <div style="font-size: 9px; color: #64748b;">Managing Director</div>
                </div>
                <div style="display: inline-block; text-align: center;">
                  <div style="border: 2px solid #10b981; color: #10b981; border-radius: 50%; width: 55px; height: 55px; display: inline-flex; align-items: center; justify-content: center; font-size: 8px; font-weight: bold; text-transform: uppercase; transform: rotate(15deg); box-shadow: 0 0 4px rgba(16, 185, 129, 0.2);">
                    ${COMPANY_PROFILE.shortName}<br>PAID
                  </div>
                </div>
              </td>
            </tr>
          </table>

          <div style="margin-top: 35px; border-top: 1px solid #f1f5f9; padding-top: 8px; text-align: center; font-size: 9px; color: #94a3b8; font-family: monospace;">
            Secure Digital Document verified through ${COMPANY_PROFILE.shortName} DMS Blockchain. Check ID: MD5-\${entityId || 'SECURE_HASH_001'}
          </div>
        </div>
      `;
    } else if (docType === 'Booking Agreement') {
      innerHtml = `
        <div style="border: 1px solid #cbd5e1; padding: 35px; font-family: serif; line-height: 1.6; background: #fff; position: relative;">
          <!-- Stamp Header -->
          <div style="border: 4px double #1e3a8a; padding: 12px; margin-bottom: 30px; text-align: center; background: #f8fafc;">
            <span style="font-size: 18px; font-weight: bold; color: #1e3a8a; letter-spacing: 4px; text-transform: uppercase;">GOVERNMENT OF BANGLADESH REVENUE STAMP</span>
            <div style="font-size: 11px; color: #475569; margin-top: 2px;">NON-JUDICIAL STAMP VALUE BDT 300</div>
          </div>

          <div style="text-align: center; margin-bottom: 25px;">
            <h2 style="margin: 0; font-size: 20px; font-weight: bold; color: #111827;">DEED OF AGREEMENT FOR PLOT/FLAT BOOKING</h2>
            <p style="margin: 5px 0 0 0; font-size: 12px; color: #4b5563;">This agreement is executed on this 15th day of June 2026</p>
          </div>

          <p style="font-size: 12px; text-align: justify; text-indent: 40px;">
            <strong>BETWEEN ${COMPANY_PROFILE.name}</strong>, represented by its Founder & Managing Director, <strong>Md Nazrul Islam</strong>, hereinafter referred to as the <strong>"FIRST PARTY / DEVELOPER"</strong> (which expression shall unless excluded by or repugnant to the context mean and include its successors-in-office, administrators, and assigns).
          </p>

          <p style="font-size: 12px; text-align: justify; text-indent: 40px; margin-top: 10px;">
            <strong>AND MR. TARIQUL ISLAM RUBEL</strong>, son of Late Md. Aminul Islam, bearing NID #1987625129384, residing at Sector 11, Uttara, Dhaka, hereinafter referred to as the <strong>"SECOND PARTY / ALLOTTEE"</strong>.
          </p>

          <p style="font-size: 12px; text-align: justify; margin-top: 15px;">
            WHEREAS the First Party has developed a modern residential complex named <strong>"${COMPANY_PROFILE.shortName} Rose Valley"</strong> situated at Sector 15, Uttara, Dhaka, Bangladesh. The Second Party has inspected the master layouts and agreed to book <strong>Flat A-2 (Level 2)</strong> comprising approximately 1,650 sq. ft. of residential space.
          </p>

          <h3 style="font-size: 13px; font-weight: bold; border-bottom: 1px solid #111827; margin-top: 20px; padding-bottom: 2px;">NOW THIS DEED OF AGREEMENT WITNESSETH AS FOLLOWS:</h3>
          <ol style="font-size: 11px; padding-left: 20px; margin-top: 10px;">
            <li style="margin-bottom: 6px;">The total agreed consideration value of the schedule Flat is BDT 16,335,000 (Sixteen Million Three Hundred and Thirty-Five Thousand Taka Only).</li>
            <li style="margin-bottom: 6px;">The Second Party has paid an amount of BDT 1,500,000 as booking downpayment. The remaining balance shall be liquidated through 12 consecutive equal monthly installments.</li>
            <li style="margin-bottom: 6px;">Timely payment of installments is the essence of this Agreement. Any delay beyond 30 days shall attract a grace interest fine of 1.5% per month.</li>
          </ol>

          <table style="width: 100%; margin-top: 40px; font-size: 11px;">
            <tr>
              <td style="width: 50%; text-align: center;">
                <div style="height: 50px;"></div>
                <div style="border-top: 1px solid #111827; width: 160px; margin: 0 auto; padding-top: 4px;"><strong>First Party (Developer)</strong></div>
                <div style="font-size: 9px; color: #4b5563;">${COMPANY_PROFILE.name}</div>
              </td>
              <td style="width: 50%; text-align: center;">
                <div style="height: 50px;"></div>
                <div style="border-top: 1px solid #111827; width: 160px; margin: 0 auto; padding-top: 4px;"><strong>Second Party (Allottee)</strong></div>
                <div style="font-size: 9px; color: #4b5563;">Tariqul Islam Rubel</div>
              </td>
            </tr>
          </table>
        </div>
      `;
    } else {
      // General Corporate Document
      innerHtml = `
        <div style="border: 1px solid #cbd5e1; padding: 30px; font-family: sans-serif; background: #fff;">
          <div style="text-align: center; border-bottom: 2px solid #10b981; padding-bottom: 15px; margin-bottom: 20px;">
            <h2 style="margin: 0; color: #0f172a;">${COMPANY_PROFILE.name} ERP</h2>
            <p style="margin: 5px 0 0 0; font-size: 11px; color: #64748b;">Enterprise DMS Certified Archival Document</p>
          </div>

          <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 25px; background: #f8fafc; border: 1px solid #e2e8f0;">
            <tr>
              <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold; width: 30%;">Document Name:</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0; color: #334155;">${title}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Document Type:</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0; color: #334155;">${docType}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Related Entity / Reference ID:</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0; color: #334155; font-family: monospace;">${entityId || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Classification Code:</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0; color: #334155; font-family: monospace;">AK-DMS-SYS-92182</td>
            </tr>
          </table>

          <h4 style="color: #0f172a; margin-top: 0;">OFFICIAL CLASSIFICATION STATEMENT</h4>
          <p style="font-size: 12px; color: #334155; line-height: 1.6; text-align: justify;">
            This is an automated system generation of the classified record in compliance with AL KASWA HOLDINGS LIMITED specifications. The authenticity is digitally signed by ${COMPANY_PROFILE.name} system logs. All subsequent access history is locked under the blockchain double-entry audit tables.
          </p>

          <div style="margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 15px; text-align: right;">
            <div style="display: inline-block; text-align: center;">
              <div style="font-size: 11px; font-weight: bold; color: #0f172a;">SYSTEM COMPILED RECORD</div>
              <div style="font-size: 9px; color: #64748b;">${COMPANY_PROFILE.name} DMS Engine v1.2</div>
            </div>
          </div>
        </div>
      `;
    }

    setPreviewPdfContent({
      title,
      type: docType,
      html: innerHtml
    });
  };

  return (
    <div className="space-y-6" id="dms-root-container">
      {/* Module Title Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-emerald-500 text-slate-950 font-mono text-[10px] font-bold rounded-full uppercase tracking-wider">
                {tl('Phase 1F Production Ready', 'ফেজ ১এফ প্রোডাকশন রেডি')}
              </span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            <h1 className="font-display font-extrabold text-2xl md:text-3xl tracking-tight mt-2 text-white">
              {tl('DMS, Workflows & Notifications', 'ডিএমএস, অনুমোদন ওয়ার্কফ্লো ও নোটিফিকেশন')}
            </h1>
            <p className="text-slate-400 text-xs mt-1 max-w-2xl">
              {tl(
                'Enterprise-grade Document Vault, multi-level hierarchy approval engine, dynamic notification dispatch system, and automated PDF document compiler.',
                'এন্টারপ্রাইজ-গ্রেড ডকুমেন্ট ভল্ট, বহু-স্তরের অনুক্রমের অনুমোদন ওয়ার্কফ্লো, গতিশীল বিজ্ঞপ্তি প্রেরণ সিস্টেম এবং স্বয়ংক্রিয় পিডিএফ ডকুমেন্ট সংকলক।'
              )}
            </p>
          </div>

          {/* Tab Selection Switch */}
          <div className="flex bg-slate-950/60 p-1.5 rounded-2xl border border-slate-800/80 shrink-0 shadow-inner">
            <button
              onClick={() => setActiveTab('dms')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'dms' 
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20' 
                  : 'text-slate-400 hover:text-white'
              }`}
              id="tab-btn-dms"
            >
              <FolderOpen size={14} />
              {tl('DMS Vault', 'ডিএমএস ভল্ট')}
            </button>
            <button
              onClick={() => setActiveTab('workflow')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer relative ${
                activeTab === 'workflow' 
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20' 
                  : 'text-slate-400 hover:text-white'
              }`}
              id="tab-btn-workflow"
            >
              <ShieldCheck size={14} />
              {tl('Approval Pipeline', 'অনুমোদন প্রক্রিয়া')}
              {workflows.filter(w => w.status === 'Pending' || w.status === 'Under Review').length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[8px] font-bold text-white animate-pulse">
                  {workflows.filter(w => w.status === 'Pending' || w.status === 'Under Review').length}
                </span>
              )}
            </button>
            <button
              onClick={() => {
                setActiveTab('notifications');
                // Auto mark as read on visit
                handleMarkAllRead();
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer relative ${
                activeTab === 'notifications' 
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20' 
                  : 'text-slate-400 hover:text-white'
              }`}
              id="tab-btn-notifications"
            >
              <Bell size={14} />
              {tl('Notification Center', 'নোটিফিকেশন')}
              {unreadNotificationCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-rose-500 text-[8px] font-extrabold text-white">
                  {unreadNotificationCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Display Area */}
      <AnimatePresence mode="wait">
        {activeTab === 'dms' && (
          <motion.div
            key="dms-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="space-y-6"
          >
            {/* Folder Filters & Search Bar */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex flex-wrap gap-2 items-center w-full md:w-auto">
                <span className="text-slate-400 text-xs font-bold flex items-center gap-1.5 mr-2">
                  <Filter size={13} />
                  {tl('Folder Category:', 'ফোল্ডার ক্যাটাগরি:')}
                </span>
                {['All', 'Booking Agreement', 'Money Receipt', 'Land Deed', 'Mutation Document', 'Employee File', 'Investor Certificate'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setDocFilter(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                      docFilter === cat 
                        ? 'bg-slate-900 text-white shadow-xs' 
                        : 'bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                    }`}
                  >
                    {tl(cat, cat === 'All' ? 'সব ফাইল' : cat)}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3 w-full md:w-80">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
                  <input
                    type="text"
                    value={docSearch}
                    onChange={(e) => setDocSearch(e.target.value)}
                    placeholder={tl('Search document ID or reference...', 'নথি আইডি বা তথ্য খুঁজুন...')}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs focus:outline-none focus:border-emerald-500 text-slate-800"
                    id="dms-search-input"
                  />
                </div>
                
                {/* Upload Button */}
                <button
                  onClick={() => setIsUploadOpen(true)}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 shadow-sm shadow-emerald-500/10 cursor-pointer transition-colors"
                  id="dms-upload-btn"
                >
                  <Plus size={14} />
                  {tl('Register File', 'ফাইল যুক্ত করুন')}
                </button>
              </div>
            </div>

            {/* Document Grid / Table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-display font-bold text-base text-slate-800 flex items-center gap-2">
                  <FolderOpen size={18} className="text-emerald-500" />
                  {tl('Secure Digital Vault Archives', 'নিরাপদ ডিজিটাল ভল্ট আর্কাইভস')}
                </h3>
                <span className="text-xs font-mono text-slate-400">
                  {filteredDocs.length} {tl('Files Registered', 'টি নথি নিবন্ধিত')}
                </span>
              </div>

              {filteredDocs.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="p-3 bg-slate-50 text-slate-400 rounded-full inline-block mb-3">
                    <Search size={24} />
                  </div>
                  <h4 className="font-bold text-slate-700 text-sm">{tl('No documents matched search criteria', 'কোন নথি পাওয়া যায়নি')}</h4>
                  <p className="text-xs text-slate-400 mt-1">{tl('Try clearing search queries or select another filter folder.', 'অনুগ্রহ করে অন্য ফোল্ডার সিলেক্ট করে পুনরায় চেষ্টা করুন।')}</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-400 uppercase tracking-wider font-semibold">
                        <th className="p-4">{tl('Document Code', 'ডকুমেন্ট কোড')}</th>
                        <th className="p-4">{tl('Title & Classification', 'শিরোনাম এবং শ্রেণীবিভাগ')}</th>
                        <th className="p-4">{tl('Ref ID', 'রেফারেন্স আইডি')}</th>
                        <th className="p-4">{tl('Revision', 'সংস্করণ')}</th>
                        <th className="p-4">{tl('Status', 'স্ট্যাটাস')}</th>
                        <th className="p-4">{tl('Upload Date', 'আপলোড তারিখ')}</th>
                        <th className="p-4 text-right">{tl('Actions', 'কার্যকলাপ')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 font-medium">
                      {filteredDocs.map(doc => (
                        <tr key={doc.id} className="hover:bg-slate-50/50 transition-all">
                          <td className="p-4 font-mono font-bold text-slate-900">{doc.documentNo}</td>
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-slate-100 text-slate-600 rounded-lg shrink-0">
                                <FileText size={16} />
                              </div>
                              <div>
                                <p className="font-semibold text-slate-800 text-xs">{doc.title}</p>
                                <span className="text-[10px] text-slate-400 font-bold block mt-0.5">{doc.documentType}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="px-2 py-1 bg-slate-100 border border-slate-200/50 text-slate-600 rounded-md font-mono text-[10px] font-bold">
                              {doc.relatedEntityId}
                            </span>
                          </td>
                          <td className="p-4">
                            <button
                              onClick={() => setSelectedDocHistory(doc)}
                              className="flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 px-2 py-1 rounded-md transition-all cursor-pointer font-bold text-[11px]"
                              title={tl('View Revision History', 'সংস্করণ ইতিহাস')}
                            >
                              <History size={13} />
                              v{doc.versionNumber}
                            </button>
                          </td>
                          <td className="p-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                              doc.status === 'Approved' 
                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                : doc.status === 'Active'
                                ? 'bg-indigo-50 text-indigo-600 border border-indigo-100'
                                : 'bg-slate-50 text-slate-400 border border-slate-100'
                            }`}>
                              {doc.status}
                            </span>
                          </td>
                          <td className="p-4 text-slate-500 font-mono text-[10px]">
                            {new Date(doc.createdAt).toLocaleDateString()}
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {/* PDF Generator Trigger */}
                              <button
                                onClick={() => generatePdfContent(doc.documentType, doc.relatedEntityId, doc.title)}
                                className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all cursor-pointer"
                                title={tl('Compile Official PDF', 'পিডিএফ সংকলন করুন')}
                              >
                                <FileDown size={14} />
                              </button>
                              
                              {/* Revise Button */}
                              <button
                                onClick={() => handleReviseDocument(doc.id)}
                                className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all cursor-pointer"
                                title={tl('Create New Revision v+1', 'নতুন সংশোধন')}
                              >
                                <RotateCcw size={14} />
                              </button>

                              {/* Archive Button */}
                              <button
                                onClick={() => handleArchiveDocument(doc.id)}
                                className="p-1.5 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                                title={tl('Archive Document', 'আর্কাইভ')}
                              >
                                <XCircle size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'workflow' && (
          <motion.div
            key="workflow-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Workflows List Panel */}
            <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
              <h3 className="font-display font-bold text-sm text-slate-800 border-b border-slate-100 pb-3">
                {tl('Active Pipelines', 'সক্রিয় অনুমোদন ওয়ার্কফ্লো')}
              </h3>

              {/* Trigger Workflow Starter Trigger Form */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-3">
                <span className="text-slate-800 font-bold text-xs flex items-center gap-1">
                  <Plus size={14} className="text-emerald-500" />
                  {tl('Start Fast-Track Approval', 'নতুন অনুমোদন অনুরোধ')}
                </span>
                <p className="text-[10px] text-slate-400">
                  {tl('Initiate multi-level review pipeline (Manager ➔ GM ➔ MD) for bookings or receipts.', 'বুকিং বা রিসিট ফাইলের জন্য বহু-স্তরের পর্যালোচনা প্রোটোকল চালু করুন।')}
                </p>
                <div className="space-y-2">
                  <button
                    onClick={() => handleInitiateWorkflow('Booking Approval', 'BKG-2026-001', `Immediate clearance requested for ${COMPANY_PROFILE.shortName} Rose Valley unit A-2.`)}
                    className="w-full py-1.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-[11px] font-bold rounded-lg transition-all text-left px-3 flex items-center justify-between cursor-pointer"
                  >
                    <span>Booking Approval</span>
                    <ArrowRight size={12} className="text-emerald-500" />
                  </button>
                  <button
                    onClick={() => handleInitiateWorkflow('Expense Approval', 'VOUCH-1002', 'Approval requested for materials purchase invoice.')}
                    className="w-full py-1.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-[11px] font-bold rounded-lg transition-all text-left px-3 flex items-center justify-between cursor-pointer"
                  >
                    <span>Expense Approval</span>
                    <ArrowRight size={12} className="text-emerald-500" />
                  </button>
                </div>
              </div>

              {/* Workflows list */}
              <div className="space-y-2 mt-4">
                {workflows.map(wf => (
                  <button
                    key={wf.id}
                    onClick={() => setSelectedWorkflowId(wf.id)}
                    className={`w-full p-4 rounded-xl text-left border transition-all flex flex-col gap-1 cursor-pointer ${
                      selectedWorkflowId === wf.id 
                        ? 'bg-slate-900 text-white border-slate-900 shadow-md' 
                        : 'bg-slate-50/50 hover:bg-slate-50 text-slate-700 border-slate-100'
                    }`}
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-emerald-500">
                        {wf.module}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        wf.status === 'Approved'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : wf.status === 'Rejected'
                          ? 'bg-rose-500/10 text-rose-400'
                          : 'bg-amber-500/10 text-amber-400 animate-pulse'
                      }`}>
                        {wf.status}
                      </span>
                    </div>
                    <span className="font-bold text-xs mt-1">{wf.entityId}</span>
                    <div className="flex justify-between items-center w-full mt-2 text-[9px] text-slate-400">
                      <span>Level {wf.currentLevel} / {wf.maxLevels}</span>
                      <span>{new Date(wf.createdAt).toLocaleDateString()}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Workflow Detail & Active Action Panel */}
            <div className="lg:col-span-2 space-y-6">
              {(() => {
                const wf = workflows.find(w => w.id === selectedWorkflowId);
                if (!wf) return (
                  <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center text-slate-400">
                    {tl('Select a workflow pipeline to examine details.', 'বিস্তারিত দেখতে একটি অনুমোদন প্রক্রিয়া সিলেক্ট করুন।')}
                  </div>
                );

                const currentLevelSteps = workflowSteps.filter(s => s.workflowId === wf.id).sort((a,b) => a.levelNo - b.levelNo);
                const activeStep = currentLevelSteps.find(s => s.levelNo === wf.currentLevel);
                const logsForWf = workflowLogs.filter(l => l.workflowId === wf.id);

                return (
                  <>
                    {/* Progression Visualizer */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
                      <div className="flex justify-between items-start gap-4 flex-wrap border-b border-slate-50 pb-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                              {wf.module}
                            </span>
                            <span className="text-[10px] text-slate-400">{wf.id}</span>
                          </div>
                          <h3 className="font-display font-extrabold text-lg text-slate-800 mt-1.5">{wf.entityId}</h3>
                          <p className="text-xs text-slate-500 mt-1">{wf.remarks}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block uppercase font-bold">{tl('Current Status', 'বর্তমান স্ট্যাটাস')}</span>
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold mt-1 uppercase ${
                            wf.status === 'Approved' 
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                              : wf.status === 'Rejected'
                              ? 'bg-rose-50 text-rose-600 border border-rose-100'
                              : 'bg-amber-50 text-amber-600 border border-amber-100 animate-pulse'
                          }`}>
                            {wf.status}
                          </span>
                        </div>
                      </div>

                      {/* Timeline flow */}
                      <div className="py-4">
                        <div className="flex flex-col md:flex-row justify-between gap-6 relative">
                          {currentLevelSteps.map((step, idx) => {
                            const isCurrent = step.levelNo === wf.currentLevel && wf.status !== 'Approved' && wf.status !== 'Rejected';
                            const isCompleted = step.status === 'Approved' || (wf.status === 'Approved' && step.levelNo <= wf.currentLevel);
                            const isRejected = step.status === 'Rejected';

                            return (
                              <div key={step.id} className="flex-1 flex items-start gap-3 relative z-10">
                                <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 font-bold font-mono text-xs ${
                                  isCompleted 
                                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                                    : isRejected
                                    ? 'bg-rose-500 text-white'
                                    : isCurrent
                                    ? 'bg-slate-900 text-white border-2 border-emerald-400 animate-pulse'
                                    : 'bg-slate-100 text-slate-400'
                                }`}>
                                  {isCompleted ? <Check size={14} /> : step.levelNo}
                                </div>
                                <div className="text-left">
                                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Level {step.levelNo}</span>
                                  <h4 className="font-bold text-slate-800 text-xs mt-0.5">{step.requiredRole} Review</h4>
                                  <span className={`text-[9px] font-bold ${
                                    isCompleted ? 'text-emerald-600' : isRejected ? 'text-rose-500' : isCurrent ? 'text-amber-500' : 'text-slate-400'
                                  }`}>
                                    {isCompleted ? tl('Approved', 'অনুমোদিত') : isRejected ? tl('Rejected', 'প্রত্যাখ্যাত') : isCurrent ? tl('Under Review', 'পর্যালোচনাধীন') : tl('Pending', 'অপেক্ষমাণ')}
                                  </span>
                                  {step.actionTakenName && (
                                    <p className="text-[9px] text-slate-400 mt-1 block">By: {step.actionTakenName}</p>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Authoritative Action Board Panel (Requires specific roles to perform actions) */}
                    {wf.status !== 'Approved' && wf.status !== 'Rejected' && activeStep && (
                      <div className="bg-white rounded-2xl border border-slate-150 p-6 shadow-sm space-y-4">
                        <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
                          <Lock size={14} className="text-amber-500" />
                          <h4 className="font-bold text-sm text-slate-800 uppercase tracking-tight">
                            {tl('Security Enforcement Board: Review Required', 'সিকিউরিটি এনফোর্সমেন্ট বোর্ড: পর্যালোচনা')}
                          </h4>
                        </div>

                        <div className="bg-slate-50 p-4 rounded-xl text-xs space-y-2 border border-slate-100">
                          <div className="flex justify-between font-medium">
                            <span className="text-slate-500">{tl('Required Step Authority:', 'প্রয়োজনীয় স্তর কতৃত্ব:')}</span>
                            <span className="font-bold text-slate-800">{activeStep.requiredRole} Role</span>
                          </div>
                          <div className="flex justify-between font-medium">
                            <span className="text-slate-500">{tl('Your Assigned Simulation Role:', 'আপনার সিমুলেটেড রোল:')}</span>
                            <span className="font-bold text-emerald-600">{currentRole} ({getMyRequiredWorkflowRole()})</span>
                          </div>
                          
                          {/* Role access check notice */}
                          {activeStep.requiredRole !== getMyRequiredWorkflowRole() && currentRole !== 'FND' && currentRole !== 'MD' ? (
                            <div className="mt-3 p-2 bg-amber-50 text-amber-700 rounded-lg flex items-center gap-2 text-[10px] font-bold border border-amber-100">
                              <AlertCircle size={14} />
                              <span>{tl('READ-ONLY: Switch Role in the top navbar to execute actions.', 'শুধুমাত্র রিড-অনলি: কার্যকলাপ সম্পাদন করতে উপরে আপনার রোল পরিবর্তন করুন।')}</span>
                            </div>
                          ) : (
                            <div className="mt-3 p-2 bg-emerald-50 text-emerald-700 rounded-lg flex items-center gap-2 text-[10px] font-bold border border-emerald-100">
                              <ShieldCheck size={14} />
                              <span>{tl('AUTHORITY GRANTED: You are authorized to approve or reject this step.', 'অনুমতি প্রাপ্ত: আপনি এই স্তরের সিদ্ধান্ত নিতে পারবেন।')}</span>
                            </div>
                          )}
                        </div>

                        {/* Textarea for remarks */}
                        <div className="space-y-1.5">
                          <label className="text-slate-500 font-bold text-xs">{tl('Executive Action Remarks', 'নির্বাহী পর্যালোচনা মন্তব্য')}</label>
                          <textarea
                            value={actionRemarks}
                            onChange={(e) => setActionRemarks(e.target.value)}
                            placeholder={tl('Provide clearance details, tax terms, or rejection reasons...', 'ছাড়পত্র, ট্যাক্স শর্ত বা প্রত্যাখ্যানের কারণ লিখুন...')}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-500 text-slate-800 h-20"
                            disabled={activeStep.requiredRole !== getMyRequiredWorkflowRole() && currentRole !== 'FND' && currentRole !== 'MD'}
                          />
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-3 justify-end pt-2">
                          <button
                            onClick={() => handleWorkflowAction('Reject')}
                            disabled={activeStep.requiredRole !== getMyRequiredWorkflowRole() && currentRole !== 'FND' && currentRole !== 'MD'}
                            className="px-5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border border-rose-200/50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <XCircle size={14} />
                            {tl('Reject / Terminate', 'প্রত্যাখ্যান করুন')}
                          </button>
                          <button
                            onClick={() => handleWorkflowAction('Approve')}
                            disabled={activeStep.requiredRole !== getMyRequiredWorkflowRole() && currentRole !== 'FND' && currentRole !== 'MD'}
                            className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm shadow-emerald-500/10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <CheckCircle2 size={14} />
                            {tl('Approve Step', 'অনুমোদন করুন')}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Detailed Workflow Transition Log (Audit trail) */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
                      <h4 className="font-display font-bold text-sm text-slate-800 border-b border-slate-50 pb-2">
                        {tl('Workflow Verification Trail Log', 'ওয়ার্কফ্লো ট্রেইল ভেরিফিকেশন লগ')}
                      </h4>

                      <div className="space-y-3">
                        {logsForWf.map(log => (
                          <div key={log.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                            <div className="p-2 bg-slate-100 text-slate-500 rounded-lg shrink-0">
                              <History size={14} />
                            </div>
                            <div className="text-xs">
                              <div className="flex items-center gap-2 font-mono text-[9px] font-bold text-emerald-600">
                                <span>{log.previousState} ➔ {log.newState}</span>
                                <span>•</span>
                                <span>{new Date(log.actionDate).toLocaleTimeString()}</span>
                              </div>
                              <p className="font-bold text-slate-800 mt-1">{log.remarks}</p>
                              <span className="text-[10px] text-slate-400 block mt-0.5">By: {log.actionByName} ({log.actionBy})</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </motion.div>
        )}

        {activeTab === 'notifications' && (
          <motion.div
            key="notifications-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="space-y-4"
          >
            {/* Notification logs panel */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-display font-extrabold text-slate-800 text-lg flex items-center gap-2">
                    <Bell size={20} className="text-emerald-500" />
                    {tl('System Notification Center logs', 'সিস্টেম নোটিফিকেশন সেন্টার লগ')}
                  </h3>
                  <p className="text-slate-400 text-xs mt-0.5">{tl(`Logs of all SMS, Emails, and In-App alerts dispatched across ${COMPANY_PROFILE.name}.`, `${COMPANY_PROFILE.shortName} হোল্ডিংসের সব এসএমএস, ইমেল এবং ইন-অ্যাপ নোটিফিকেশনের তালিকা।`)}</p>
                </div>
                <button
                  onClick={handleMarkAllRead}
                  className="px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 transition-all cursor-pointer"
                >
                  {tl('Mark All Read', 'সব পঠিত হিসেবে চিহ্নিত করুন')}
                </button>
              </div>

              <div className="space-y-3 mt-4">
                {notifications.map(n => (
                  <div key={n.id} className={`p-4 rounded-2xl border transition-all flex gap-3.5 items-start ${
                    n.isRead ? 'bg-white border-slate-100 text-slate-600' : 'bg-emerald-50/20 border-emerald-100 text-slate-900 shadow-xs'
                  }`}>
                    {/* Icon mapping based on alert type */}
                    <div className={`p-2.5 rounded-xl shrink-0 ${
                      n.type === 'Overdue Payment' ? 'bg-rose-50 text-rose-500' :
                      n.type === 'Booking Confirmed' ? 'bg-emerald-50 text-emerald-500' :
                      n.type === 'Document Expiry Alert' ? 'bg-amber-50 text-amber-500' :
                      'bg-slate-50 text-slate-500'
                    }`}>
                      {n.type === 'Overdue Payment' ? <AlertCircle size={18} /> :
                       n.type === 'Booking Confirmed' ? <CheckCircle2 size={18} /> :
                       n.type === 'Document Expiry Alert' ? <Calendar size={18} /> :
                       <Bell size={18} />}
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-start gap-4 flex-wrap">
                        <div>
                          <h4 className="font-bold text-xs">{n.title}</h4>
                          <span className="text-[9px] font-mono font-bold tracking-wider uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md inline-block mt-1">
                            {n.type}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">{new Date(n.createdAt).toLocaleString()}</span>
                      </div>
                      
                      <p className="text-xs text-slate-500 mt-2 leading-relaxed">{n.message}</p>

                      {/* Dispatched channel logs */}
                      <div className="flex gap-4 pt-2.5 text-[10px] font-bold text-slate-400 border-t border-slate-50 mt-3">
                        <span className="flex items-center gap-1">
                          <Eye size={12} className={n.channel === 'In-App' || n.channel === 'All' ? 'text-emerald-500' : ''} />
                          In-App Portal {n.isRead ? '(Seen)' : '(Unread)'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone size={12} className={n.channel === 'SMS' || n.channel === 'All' ? 'text-blue-500' : ''} />
                          SMS Template (Dispatched)
                        </span>
                        <span className="flex items-center gap-1">
                          <Mail size={12} className={n.channel === 'Email' || n.channel === 'All' ? 'text-indigo-500' : ''} />
                          Email Template (Sent successfully)
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- POPUP WINDOW: PDF Compiler Output Preview --- */}
      <AnimatePresence>
        {previewPdfContent && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-100 overflow-hidden"
              id="pdf-preview-modal"
            >
              <div className="p-5 border-b border-slate-100 bg-slate-900 text-white flex items-center justify-between">
                <div>
                  <span className="text-[9px] uppercase font-mono tracking-wider text-emerald-400 font-extrabold">{COMPANY_PROFILE.shortName} PDF Compiler Engine v1.2</span>
                  <h3 className="font-display font-bold text-sm text-white mt-1">
                    {previewPdfContent.title}
                  </h3>
                </div>
                <button
                  onClick={() => setPreviewPdfContent(null)}
                  className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
                  id="pdf-close-btn"
                >
                  <XCircle size={20} />
                </button>
              </div>

              {/* Rendered PDF area */}
              <div className="p-6 bg-slate-100 overflow-y-auto max-h-[60vh]">
                <div 
                  dangerouslySetInnerHTML={{ __html: previewPdfContent.html }} 
                  className="shadow-md rounded-lg overflow-hidden bg-white"
                />
              </div>

              <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-between items-center flex-wrap gap-3">
                <span className="text-xs text-slate-400 font-mono">
                  {tl('Includes Revenue Stamps & Official Digital Seals', 'রাজস্ব স্ট্যাম্প ও অফিসিয়াল ডিজিটাল সিল অন্তর্ভুক্ত')}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPreviewPdfContent(null)}
                    className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    {tl('Dismiss', 'বাতিল করুন')}
                  </button>
                  <button
                    onClick={() => {
                      alert('PDF Download dispatched successfully into local directory.');
                      setPreviewPdfContent(null);
                    }}
                    className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm shadow-emerald-500/10 cursor-pointer"
                  >
                    <Download size={14} />
                    {tl('Export PDF', 'পিডিএফ ডাউনলোড করুন')}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- POPUP WINDOW: Register New DMS File Form --- */}
      <AnimatePresence>
        {isUploadOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden"
              id="upload-modal"
            >
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-display font-extrabold text-slate-800 text-base">
                  {tl('Register New Document to Vault', 'নতুন নথি ডিএমএস-এ যুক্ত করুন')}
                </h3>
                <button
                  onClick={() => setIsUploadOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                >
                  <XCircle size={18} />
                </button>
              </div>

              <form onSubmit={handleUploadDocument} className="p-5 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-slate-500 text-xs font-bold block">{tl('Document Title', 'নথির শিরোনাম')}</label>
                  <input
                    type="text"
                    value={newDocTitle}
                    onChange={(e) => setNewDocTitle(e.target.value)}
                    placeholder={tl('e.g., Land Sale Deed Sector 15', 'যেমন: জমি ক্রয় চুক্তি পত্র সেক্টর ১৫')}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-500 text-slate-800"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-slate-500 text-xs font-bold block">{tl('Document Type', 'নথির ধরণ')}</label>
                    <select
                      value={newDocType}
                      onChange={(e) => setNewDocType(e.target.value as any)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-500 text-slate-800 cursor-pointer"
                    >
                      <option value="Booking Agreement">Booking Agreement</option>
                      <option value="Money Receipt">Money Receipt</option>
                      <option value="Land Deed">Land Deed</option>
                      <option value="Mutation Document">Mutation Document</option>
                      <option value="JVA Agreement">JVA Agreement</option>
                      <option value="Employee File">Employee File</option>
                      <option value="Payroll Document">Payroll Document</option>
                      <option value="Investor Certificate">Investor Certificate</option>
                      <option value="Vendor Agreement">Vendor Agreement</option>
                      <option value="Project Approval">Project Approval</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-500 text-xs font-bold block">{tl('Related Entity / Booking ID', 'সংশ্লিষ্ট আইডি')}</label>
                    <input
                      type="text"
                      value={newDocEntityId}
                      onChange={(e) => setNewDocEntityId(e.target.value)}
                      placeholder="e.g. BKG-2026-001"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-500 text-slate-800"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-500 text-xs font-bold block">{tl('Classification Remarks', 'শ্রেণীবিভাগ মন্তব্য')}</label>
                  <textarea
                    value={newDocRemarks}
                    onChange={(e) => setNewDocRemarks(e.target.value)}
                    placeholder={tl('Add any notes or internal comments here...', 'এখানে মন্তব্য বা অন্যান্য তথ্য লিখুন...')}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-500 text-slate-800 h-16"
                  />
                </div>

                {/* Drag and drop zone mock */}
                <div className="border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-2xl p-6 text-center transition-all bg-slate-50 cursor-pointer">
                  <Upload className="text-slate-400 mx-auto mb-2" size={22} />
                  <span className="text-xs font-bold text-slate-600 block">{tl('Drag & drop or Click to Upload File', 'ড্র্যাগ এবং ড্রপ করুন অথবা আপলোড করতে ক্লিক করুন')}</span>
                  <span className="text-[10px] text-slate-400 block mt-1">PDF, DOCX, scan image up to 15MB supported</span>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsUploadOpen(false)}
                    className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    {tl('Cancel', 'বাতিল করুন')}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
                  >
                    {tl('Save to DMS', 'ডকুমেন্ট সংরক্ষণ করুন')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- POPUP WINDOW: Revision history explorer panel --- */}
      <AnimatePresence>
        {selectedDocHistory && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden"
              id="history-modal"
            >
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-600 font-bold block">
                    {selectedDocHistory.documentNo}
                  </span>
                  <h3 className="font-display font-extrabold text-slate-800 text-base mt-0.5">
                    {tl('Document Version History', 'সংস্করণ ইতিহাস')}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedDocHistory(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                >
                  <XCircle size={18} />
                </button>
              </div>

              <div className="p-5 space-y-4 max-h-[50vh] overflow-y-auto">
                <p className="text-xs text-slate-500">
                  {tl(`Below are the classified revisions, audit footprints, and date markers saved for this file in compliance with ${COMPANY_PROFILE.shortName} compliance.`, `${COMPANY_PROFILE.shortName} কমপ্লায়েন্স অনুযায়ী এই ফাইলটির সমস্ত সংশোধিত সংস্করণ এবং সংরক্ষণের ইতিহাস নিচে দেওয়া হলো।`)}
                </p>

                <div className="space-y-4 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                  {/* Dynamic generation of mock versions based on document level */}
                  {Array.from({ length: selectedDocHistory.versionNumber }).map((_, idx) => {
                    const ver = selectedDocHistory.versionNumber - idx;
                    return (
                      <div key={ver} className="flex gap-4 items-start relative">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold font-mono z-10 ${
                          ver === selectedDocHistory.versionNumber 
                            ? 'bg-emerald-500 text-slate-950' 
                            : 'bg-slate-100 text-slate-400'
                        }`}>
                          v{ver}
                        </div>
                        <div className="text-left text-xs flex-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-slate-800">
                              {ver === selectedDocHistory.versionNumber ? tl('Current Active Revision', 'বর্তমান সক্রিয় সংস্করণ') : tl('Amended Revision', 'সংশোধিত সংস্করণ')}
                            </span>
                            <span className="text-[9px] font-mono text-slate-400">
                              {new Date(selectedDocHistory.updatedAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-slate-500 mt-1.5 text-[11px]">
                            {ver === selectedDocHistory.versionNumber 
                              ? selectedDocHistory.remarks 
                              : `Version ${ver} audit footprints registered inside DB under transaction lock.`}
                          </p>
                          <span className="text-[9px] text-emerald-600 font-bold block mt-2">
                            Verified By: Suhrawardy Ahmed (GM)
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-5 border-t border-slate-100 bg-slate-50 text-right">
                <button
                  onClick={() => setSelectedDocHistory(null)}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  {tl('Close History', 'বন্ধ করুন')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
