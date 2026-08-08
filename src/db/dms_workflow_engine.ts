/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { COMPANY_PROFILE } from '../config/companyProfile';

// ============================================================================
// 1. DATA TRANSFER OBJECTS (DTOs)
// ============================================================================

export class CreateDocumentDto {
  companyId!: string;
  documentNo!: string;
  documentType!: 'Booking Agreement' | 'Money Receipt' | 'Land Deed' | 'Mutation Document' | 'JVA Agreement' | 'Employee File' | 'Payroll Document' | 'Investor Certificate' | 'Vendor Agreement' | 'Project Approval';
  relatedModule!: 'Real Estate' | 'Finance' | 'HR' | 'Sourcing' | 'Investor';
  relatedEntityId!: string;
  title!: string;
  filePath?: string;
  remarks?: string;
  uploadedBy!: string; // User/Employee ID
}

export class CreateDocumentRevisionDto {
  companyId!: string;
  documentId!: string;
  filePath!: string;
  remarks!: string;
  uploadedBy!: string;
}

export class CreateNotificationDto {
  companyId!: string;
  recipientId!: string;
  recipientRole?: string;
  title!: string;
  message!: string;
  type!: 'Installment Due' | 'Overdue Payment' | 'Booking Confirmed' | 'Booking Cancelled' | 'Salary Generated' | 'Payroll Released' | 'Investor Dividend Released' | 'Document Expiry Alert' | 'Land Mutation Reminder' | 'Project Deadline Reminder' | 'Workflow Pending Action';
  channel!: 'In-App' | 'SMS' | 'Email' | 'All';
}

export class InitiateWorkflowDto {
  companyId!: string;
  module!: 'Booking Approval' | 'Expense Approval' | 'Payroll Approval' | 'Land Purchase Approval' | 'Investor Payment Approval';
  entityId!: string;
  initiatorId!: string;
  remarks?: string;
  steps!: {
    level_no: number;
    required_role: 'Manager' | 'GM' | 'MD' | 'HR' | 'CFO';
    assigned_user_id?: string;
  }[];
}

export class WorkflowActionDto {
  companyId!: string;
  workflowId!: string;
  levelNo!: number;
  actionBy!: string;
  actionByName!: string;
  action!: 'Approve' | 'Reject' | 'Cancel';
  remarks?: string;
}

export class GeneratePdfDto {
  companyId!: string;
  pdfType!: 'Money Receipt' | 'Booking Agreement' | 'Investor Certificate' | 'Salary Slip' | 'Land Agreement';
  entityId!: string;
  generatedBy!: string;
}

// ============================================================================
// 2. REPOSITORY & INTERFACE PATTERNS
// ============================================================================

export interface IDocumentRepository {
  save(dto: CreateDocumentDto): Promise<any>;
  saveRevision(dto: CreateDocumentRevisionDto): Promise<any>;
  findById(id: string): Promise<any>;
  findAll(companyId: string): Promise<any[]>;
  findByEntity(relatedModule: string, relatedEntityId: string): Promise<any[]>;
  archive(id: string): Promise<void>;
}

export interface INotificationRepository {
  save(dto: CreateNotificationDto): Promise<any>;
  markAsRead(id: string): Promise<void>;
  findByRecipient(companyId: string, recipientId: string): Promise<any[]>;
  getUnreadCount(companyId: string, recipientId: string): Promise<number>;
}

export interface IApprovalWorkflowRepository {
  initiate(dto: InitiateWorkflowDto): Promise<any>;
  submitAction(dto: WorkflowActionDto): Promise<string>;
  findById(id: string): Promise<any>;
  findAll(companyId: string): Promise<any[]>;
  findSteps(workflowId: string): Promise<any[]>;
  findLogs(workflowId: string): Promise<any[]>;
}

// ============================================================================
// 3. REPOSITORY IMPLEMENTATIONS (POSTGRESQL & MEMORY DUAL-MODE ADAPTERS)
// ============================================================================

// Global in-memory fallback to allow high-fidelity operations in the Vite Preview without crash.
const _MEM_DOCUMENTS: any[] = [];
const _MEM_VERSIONS: any[] = [];
const _MEM_NOTIFICATIONS: any[] = [];
const _MEM_WORKFLOWS: any[] = [];
const _MEM_WORKFLOW_STEPS: any[] = [];
const _MEM_WORKFLOW_LOGS: any[] = [];

export class DocumentRepository implements IDocumentRepository {
  constructor(private readonly db: any) {}

  async save(dto: CreateDocumentDto): Promise<any> {
    if (this.db && typeof this.db.query === 'function') {
      try {
        const docIdResult = await this.db.query(
          `SELECT register_new_document_revision($1::UUID, NULL, $2::VARCHAR, $3::VARCHAR, $4::VARCHAR, $5::VARCHAR, $6::VARCHAR, $7::TEXT, $8::TEXT, $9::UUID) as doc_id`,
          [
            dto.companyId,
            dto.documentNo,
            dto.documentType,
            dto.relatedModule,
            dto.relatedEntityId,
            dto.title,
            dto.filePath || '',
            dto.remarks || '',
            dto.uploadedBy
          ]
        );
        const docId = docIdResult.rows[0]?.doc_id;
        return await this.findById(docId);
      } catch (err) {
        console.warn("DB Fallback triggered for Document save due to: ", err);
      }
    }

    // In-Memory Fallback
    const newDoc = {
      id: Math.random().toString(36).substr(2, 9),
      company_id: dto.companyId,
      document_no: dto.documentNo,
      document_type: dto.documentType,
      related_module: dto.relatedModule,
      related_entity_id: dto.relatedEntityId,
      title: dto.title,
      status: 'Active',
      version_number: 1,
      file_path: dto.filePath || '',
      remarks: dto.remarks || '',
      is_archived: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    _MEM_DOCUMENTS.push(newDoc);
    _MEM_VERSIONS.push({
      id: Math.random().toString(36).substr(2, 9),
      document_id: newDoc.id,
      version_number: 1,
      file_path: dto.filePath || '',
      remarks: 'Initial revision uploaded',
      uploaded_by: dto.uploadedBy,
      created_at: new Date().toISOString(),
    });
    return newDoc;
  }

  async saveRevision(dto: CreateDocumentRevisionDto): Promise<any> {
    if (this.db && typeof this.db.query === 'function') {
      try {
        const docIdResult = await this.db.query(
          `SELECT register_new_document_revision($1::UUID, $2::UUID, NULL, NULL, NULL, NULL, NULL, $3::TEXT, $4::TEXT, $5::UUID) as doc_id`,
          [
            dto.companyId,
            dto.documentId,
            dto.filePath,
            dto.remarks,
            dto.uploadedBy
          ]
        );
        const docId = docIdResult.rows[0]?.doc_id;
        return await this.findById(docId);
      } catch (err) {
        console.warn("DB Fallback triggered for Document revision due to: ", err);
      }
    }

    // In-Memory Fallback
    const existing = _MEM_DOCUMENTS.find(d => d.id === dto.documentId);
    if (!existing) throw new Error('Document not found for revision.');
    
    existing.version_number += 1;
    existing.file_path = dto.filePath;
    existing.remarks = dto.remarks;
    existing.updated_at = new Date().toISOString();

    const newRev = {
      id: Math.random().toString(36).substr(2, 9),
      document_id: dto.documentId,
      version_number: existing.version_number,
      file_path: dto.filePath,
      remarks: dto.remarks,
      uploaded_by: dto.uploadedBy,
      created_at: new Date().toISOString(),
    };
    _MEM_VERSIONS.push(newRev);
    return existing;
  }

  async findById(id: string): Promise<any> {
    if (this.db && typeof this.db.query === 'function') {
      try {
        const res = await this.db.query('SELECT * FROM documents WHERE id = $1', [id]);
        return res.rows[0] || null;
      } catch (err) {
        console.warn("DB Fallback findById: ", err);
      }
    }
    return _MEM_DOCUMENTS.find(d => d.id === id) || null;
  }

  async findAll(companyId: string): Promise<any[]> {
    if (this.db && typeof this.db.query === 'function') {
      try {
        const res = await this.db.query('SELECT * FROM documents WHERE company_id = $1 AND is_archived = FALSE ORDER BY created_at DESC', [companyId]);
        return res.rows;
      } catch (err) {
        console.warn("DB Fallback findAll: ", err);
      }
    }
    return _MEM_DOCUMENTS.filter(d => d.company_id === companyId && !d.is_archived);
  }

  async findByEntity(relatedModule: string, relatedEntityId: string): Promise<any[]> {
    if (this.db && typeof this.db.query === 'function') {
      try {
        const res = await this.db.query(
          'SELECT * FROM documents WHERE related_module = $1 AND related_entity_id = $2 AND is_archived = FALSE ORDER BY created_at DESC',
          [relatedModule, relatedEntityId]
        );
        return res.rows;
      } catch (err) {
        console.warn("DB Fallback findByEntity: ", err);
      }
    }
    return _MEM_DOCUMENTS.filter(d => d.related_module === relatedModule && d.related_entity_id === relatedEntityId && !d.is_archived);
  }

  async archive(id: string): Promise<void> {
    if (this.db && typeof this.db.query === 'function') {
      try {
        await this.db.query('UPDATE documents SET is_archived = TRUE, status = \'Archived\', updated_at = CURRENT_TIMESTAMP WHERE id = $1', [id]);
        return;
      } catch (err) {
        console.warn("DB Fallback archive: ", err);
      }
    }
    const doc = _MEM_DOCUMENTS.find(d => d.id === id);
    if (doc) {
      doc.is_archived = true;
      doc.status = 'Archived';
    }
  }
}

export class NotificationRepository implements INotificationRepository {
  constructor(private readonly db: any) {}

  async save(dto: CreateNotificationDto): Promise<any> {
    if (this.db && typeof this.db.query === 'function') {
      try {
        const context = JSON.stringify({ customMessage: dto.message });
        const res = await this.db.query(
          `SELECT trigger_system_notification($1::UUID, $2::VARCHAR, $3::VARCHAR, $4::VARCHAR, $5::VARCHAR, $6::JSONB) as notify_id`,
          [dto.companyId, dto.recipientId, dto.recipientRole || null, dto.type, dto.channel, context]
        );
        const notifyId = res.rows[0]?.notify_id;
        const finalRes = await this.db.query('SELECT * FROM notifications WHERE id = $1', [notifyId]);
        return finalRes.rows[0];
      } catch (err) {
        console.warn("DB Fallback notification save: ", err);
      }
    }

    // In-Memory Fallback
    const newNotif = {
      id: Math.random().toString(36).substr(2, 9),
      company_id: dto.companyId,
      recipient_id: dto.recipientId,
      recipient_role: dto.recipientRole || '',
      title: dto.title,
      message: dto.message,
      type: dto.type,
      channel: dto.channel,
      is_read: false,
      status: 'Sent',
      created_at: new Date().toISOString(),
      read_at: null
    };
    _MEM_NOTIFICATIONS.push(newNotif);
    return newNotif;
  }

  async markAsRead(id: string): Promise<void> {
    if (this.db && typeof this.db.query === 'function') {
      try {
        await this.db.query('UPDATE notifications SET is_read = TRUE, read_at = CURRENT_TIMESTAMP WHERE id = $1', [id]);
        return;
      } catch (err) {
        console.warn("DB Fallback markAsRead: ", err);
      }
    }
    const notif = _MEM_NOTIFICATIONS.find(n => n.id === id);
    if (notif) {
      notif.is_read = true;
      notif.read_at = new Date().toISOString();
    }
  }

  async findByRecipient(companyId: string, recipientId: string): Promise<any[]> {
    if (this.db && typeof this.db.query === 'function') {
      try {
        const res = await this.db.query(
          'SELECT * FROM notifications WHERE company_id = $1 AND (recipient_id = $2 OR recipient_id = \'ALL\') ORDER BY created_at DESC',
          [companyId, recipientId]
        );
        return res.rows;
      } catch (err) {
        console.warn("DB Fallback findByRecipient: ", err);
      }
    }
    return _MEM_NOTIFICATIONS.filter(n => n.company_id === companyId && (n.recipient_id === recipientId || n.recipient_id === 'ALL')).reverse();
  }

  async getUnreadCount(companyId: string, recipientId: string): Promise<number> {
    if (this.db && typeof this.db.query === 'function') {
      try {
        const res = await this.db.query(
          'SELECT COUNT(*)::INT as count FROM notifications WHERE company_id = $1 AND (recipient_id = $2 OR recipient_id = \'ALL\') AND is_read = FALSE',
          [companyId, recipientId]
        );
        return res.rows[0]?.count || 0;
      } catch (err) {
        console.warn("DB Fallback getUnreadCount: ", err);
      }
    }
    return _MEM_NOTIFICATIONS.filter(n => n.company_id === companyId && (n.recipient_id === recipientId || n.recipient_id === 'ALL') && !n.is_read).length;
  }
}

export class ApprovalWorkflowRepository implements IApprovalWorkflowRepository {
  constructor(private readonly db: any) {}

  async initiate(dto: InitiateWorkflowDto): Promise<any> {
    if (this.db && typeof this.db.query === 'function') {
      try {
        const stepsJson = JSON.stringify(dto.steps);
        const res = await this.db.query(
          `SELECT initiate_approval_workflow($1::UUID, $2::VARCHAR, $3::VARCHAR, $4::UUID, $5::TEXT, $6::JSONB) as workflow_id`,
          [dto.companyId, dto.module, dto.entityId, dto.initiatorId, dto.remarks || '', stepsJson]
        );
        const wfId = res.rows[0]?.workflow_id;
        return await this.findById(wfId);
      } catch (err) {
        console.warn("DB Fallback initiate workflow: ", err);
      }
    }

    // In-Memory Fallback
    const wfId = Math.random().toString(36).substr(2, 9);
    const newWf = {
      id: wfId,
      company_id: dto.companyId,
      module: dto.module,
      entity_id: dto.entityId,
      current_level: 1,
      max_levels: dto.steps.length,
      status: 'Pending',
      initiator_id: dto.initiatorId,
      remarks: dto.remarks || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    _MEM_WORKFLOWS.push(newWf);

    dto.steps.forEach(s => {
      _MEM_WORKFLOW_STEPS.push({
        id: Math.random().toString(36).substr(2, 9),
        workflow_id: wfId,
        level_no: s.level_no,
        required_role: s.required_role,
        assigned_user_id: s.assigned_user_id || null,
        status: 'Pending',
        action_taken_by: null,
        action_taken_name: null,
        action_taken_at: null,
        remarks: null,
        updated_at: new Date().toISOString(),
      });
    });

    _MEM_WORKFLOW_LOGS.push({
      id: Math.random().toString(36).substr(2, 9),
      company_id: dto.companyId,
      workflow_id: wfId,
      level_no: 0,
      previous_state: 'None',
      new_state: 'Pending Approval Level 1',
      action_by: dto.initiatorId,
      action_by_name: 'Initiator',
      action_date: new Date().toISOString(),
      remarks: 'Workflow registered in DMS system.',
    });

    return newWf;
  }

  async submitAction(dto: WorkflowActionDto): Promise<string> {
    if (this.db && typeof this.db.query === 'function') {
      try {
        const res = await this.db.query(
          `SELECT submit_workflow_action($1::UUID, $2::UUID, $3::INT, $4::UUID, $5::VARCHAR, $6::VARCHAR, $7::TEXT) as next_state`,
          [dto.companyId, dto.workflowId, dto.levelNo, dto.actionBy, dto.actionByName, dto.action, dto.remarks || '']
        );
        return res.rows[0]?.next_state || 'Pending';
      } catch (err) {
        console.warn("DB Fallback submit workflow action: ", err);
      }
    }

    // In-Memory Fallback
    const wf = _MEM_WORKFLOWS.find(w => w.id === dto.workflowId);
    if (!wf) throw new Error('Workflow not found.');

    const step = _MEM_WORKFLOW_STEPS.find(s => s.workflow_id === dto.workflowId && s.level_no === dto.levelNo);
    if (!step) throw new Error('Workflow level step not found.');

    if (dto.action === 'Reject') {
      step.status = 'Rejected';
      step.action_taken_by = dto.actionBy;
      step.action_taken_name = dto.actionByName;
      step.action_taken_at = new Date().toISOString();
      step.remarks = dto.remarks || '';

      wf.status = 'Rejected';
      wf.updated_at = new Date().toISOString();

      _MEM_WORKFLOW_LOGS.push({
        id: Math.random().toString(36).substr(2, 9),
        company_id: dto.companyId,
        workflow_id: dto.workflowId,
        level_no: dto.levelNo,
        previous_state: 'Under Review',
        new_state: 'Rejected',
        action_by: dto.actionBy,
        action_by_name: dto.actionByName,
        action_date: new Date().toISOString(),
        remarks: dto.remarks || 'Rejected',
      });
      return 'Rejected';
    } else {
      // Approve
      step.status = 'Approved';
      step.action_taken_by = dto.actionBy;
      step.action_taken_name = dto.actionByName;
      step.action_taken_at = new Date().toISOString();
      step.remarks = dto.remarks || '';

      if (dto.levelNo === wf.max_levels) {
        wf.status = 'Approved';
        wf.updated_at = new Date().toISOString();

        _MEM_WORKFLOW_LOGS.push({
          id: Math.random().toString(36).substr(2, 9),
          company_id: dto.companyId,
          workflow_id: dto.workflowId,
          level_no: dto.levelNo,
          previous_state: 'Under Review',
          new_state: 'Approved',
          action_by: dto.actionBy,
          action_by_name: dto.actionByName,
          action_date: new Date().toISOString(),
          remarks: dto.remarks || 'Final Level Signoff completed.',
        });
        return 'Approved';
      } else {
        wf.current_level += 1;
        wf.status = 'Under Review';
        wf.updated_at = new Date().toISOString();

        _MEM_WORKFLOW_LOGS.push({
          id: Math.random().toString(36).substr(2, 9),
          company_id: dto.companyId,
          workflow_id: dto.workflowId,
          level_no: dto.levelNo,
          previous_state: 'Under Review',
          new_state: `Reviewing Level ${wf.current_level}`,
          action_by: dto.actionBy,
          action_by_name: dto.actionByName,
          action_date: new Date().toISOString(),
          remarks: dto.remarks || `Approved Level ${dto.levelNo}. Advancing to ${wf.current_level}`,
        });
        return 'Under Review';
      }
    }
  }

  async findById(id: string): Promise<any> {
    if (this.db && typeof this.db.query === 'function') {
      try {
        const res = await this.db.query('SELECT * FROM approval_workflows WHERE id = $1', [id]);
        return res.rows[0] || null;
      } catch (err) {
        console.warn("DB findById workflow fallback: ", err);
      }
    }
    return _MEM_WORKFLOWS.find(w => w.id === id) || null;
  }

  async findAll(companyId: string): Promise<any[]> {
    if (this.db && typeof this.db.query === 'function') {
      try {
        const res = await this.db.query('SELECT * FROM approval_workflows WHERE company_id = $1 ORDER BY created_at DESC', [companyId]);
        return res.rows;
      } catch (err) {
        console.warn("DB findAll workflows fallback: ", err);
      }
    }
    return _MEM_WORKFLOWS.filter(w => w.company_id === companyId);
  }

  async findSteps(workflowId: string): Promise<any[]> {
    if (this.db && typeof this.db.query === 'function') {
      try {
        const res = await this.db.query('SELECT * FROM approval_workflow_steps WHERE workflow_id = $1 ORDER BY level_no ASC', [workflowId]);
        return res.rows;
      } catch (err) {
        console.warn("DB findSteps fallback: ", err);
      }
    }
    return _MEM_WORKFLOW_STEPS.filter(s => s.workflow_id === workflowId).sort((a,b) => a.level_no - b.level_no);
  }

  async findLogs(workflowId: string): Promise<any[]> {
    if (this.db && typeof this.db.query === 'function') {
      try {
        const res = await this.db.query('SELECT * FROM approval_workflow_logs WHERE workflow_id = $1 ORDER BY action_date ASC', [workflowId]);
        return res.rows;
      } catch (err) {
        console.warn("DB findLogs fallback: ", err);
      }
    }
    return _MEM_WORKFLOW_LOGS.filter(l => l.workflow_id === workflowId).sort((a,b) => new Date(a.action_date).getTime() - new Date(b.action_date).getTime());
  }
}

// ============================================================================
// 4. CORE BUSINESS DOMAIN SERVICES
// ============================================================================

export class DocumentManagementService {
  constructor(private readonly docRepo: IDocumentRepository) {}

  async createDocument(dto: CreateDocumentDto): Promise<any> {
    return await this.docRepo.save(dto);
  }

  async addRevision(dto: CreateDocumentRevisionDto): Promise<any> {
    return await this.docRepo.saveRevision(dto);
  }

  async getDocumentDetails(id: string): Promise<any> {
    return await this.docRepo.findById(id);
  }

  async listDocuments(companyId: string): Promise<any[]> {
    return await this.docRepo.findAll(companyId);
  }

  async listByEntity(relatedModule: string, relatedEntityId: string): Promise<any[]> {
    return await this.docRepo.findByEntity(relatedModule, relatedEntityId);
  }

  async archiveDocument(id: string): Promise<void> {
    await this.docRepo.archive(id);
  }
}

export class NotificationCenterService {
  constructor(private readonly notifRepo: INotificationRepository) {}

  async dispatchNotification(dto: CreateNotificationDto): Promise<any> {
    return await this.notifRepo.save(dto);
  }

  async getMyNotifications(companyId: string, recipientId: string): Promise<any[]> {
    return await this.notifRepo.findByRecipient(companyId, recipientId);
  }

  async getMyUnreadCount(companyId: string, recipientId: string): Promise<number> {
    return await this.notifRepo.getUnreadCount(companyId, recipientId);
  }

  async markAsRead(id: string): Promise<void> {
    await this.notifRepo.markAsRead(id);
  }

  // Multi-channel alert dispatch helper (SMS & Email simulated templates)
  async dispatchSystemAlert(
    companyId: string,
    recipientId: string,
    type: CreateNotificationDto['type'],
    payload: any,
    channels: ('In-App' | 'SMS' | 'Email')[]
  ): Promise<void> {
    const titleMap: Record<string, string> = {
      'Installment Due': 'Upcoming Installment Due Notice',
      'Overdue Payment': 'URGENT: Overdue Payment Notice',
      'Booking Confirmed': 'Booking Successfully Confirmed',
      'Booking Cancelled': 'Booking Cancellation Recorded',
      'Salary Generated': 'Monthly Salaries Prepared',
      'Payroll Released': 'Salary Disbursed Successfully',
      'Investor Dividend Released': 'Investor Dividends Distributed',
    };

    const smsTemplates: Record<string, string> = {
      'Installment Due': `${COMPANY_PROFILE.shortName} Alert: Installment due for Unit ${payload.unitNo}. Amount: BDT ${payload.amount}. Pay before ${payload.dueDate}.`,
      'Overdue Payment': `URGENT: ${COMPANY_PROFILE.shortName} Payment OVERDUE for Unit ${payload.unitNo}. BDT ${payload.amount} was due on ${payload.dueDate}. Clear balance immediately.`,
      'Booking Confirmed': `${COMPANY_PROFILE.shortName} Booking Confirmed for Unit ${payload.unitNo}, Project: ${payload.projectName}. Aggrement code: ${payload.docNo}. Thank you!`,
      'Salary Generated': `${COMPANY_PROFILE.shortName} HR: Payroll compiled for ${payload.month}. Level 1 approval pending.`,
      'Payroll Released': `${COMPANY_PROFILE.shortName} Finance: Salary for ${payload.month} BDT ${payload.netPay} has been credited to your account.`,
      'Investor Dividend Released': `${COMPANY_PROFILE.shortName} Investor: Dividend of BDT ${payload.amount} released for Project ${payload.projectName}.`,
    };

    const emailTemplates: Record<string, string> = {
      'Installment Due': `
Dear ${payload.customerName || 'Valued Customer'},

This is a scheduled system notification that your monthly plot/flat installment of BDT ${payload.amount} for Unit ${payload.unitNo} in Project ${payload.projectName} is due on ${payload.dueDate}.

Please clear the outstanding ledger balance using bank transfer, online pay, or cash counter deposits.

Best Regards,
${COMPANY_PROFILE.name} Billing Dept.
      `,
      'Overdue Payment': `
WARNING: IMMEDIATE PAYMENT ACTION REQUIRED

Dear ${payload.customerName || 'Valued Customer'},

Our auditing ledger indicates that your plot/flat installment of BDT ${payload.amount} due on ${payload.dueDate} is now OVERDUE. 
Please deposit the due amount immediately to avoid penal charges or contract cancellation protocols.

Best Regards,
Credit Control & Audit Dept.
${COMPANY_PROFILE.name}
      `,
      'Booking Confirmed': `
Dear ${payload.customerName || 'Valued Customer'},

Congratulations! Your booking for Unit ${payload.unitNo} in Project ${payload.projectName} has been successfully validated and approved by the Managing Director.
The Booking Agreement file ${payload.docNo} has been registered inside your Document Management folder.

Thank you for choosing ${COMPANY_PROFILE.name}.

Best Regards,
Registrar of Properties, ${COMPANY_PROFILE.name}.
      `,
    };

    for (const ch of channels) {
      let bodyText = payload.message || 'Alert';
      if (ch === 'SMS') {
        bodyText = smsTemplates[type] || `${COMPANY_PROFILE.shortName} Alert: Action required for ${type}. Ref ID: ${payload.entityId || 'N/A'}`;
      } else if (ch === 'Email') {
        bodyText = emailTemplates[type] || `
Hello,

This is an automated ERP notification regarding your ${type} record.
Detail: ${payload.description || 'Action required.'}

${COMPANY_PROFILE.name} ERP
        `;
      }

      await this.dispatchNotification({
        companyId,
        recipientId,
        recipientRole: payload.recipientRole || '',
        title: titleMap[type] || `Al Kaswa Alert: ${type}`,
        message: bodyText,
        type,
        channel: ch === 'In-App' ? 'In-App' : ch === 'SMS' ? 'SMS' : 'Email',
      });
    }
  }
}

export class ApprovalWorkflowService {
  constructor(private readonly wfRepo: IApprovalWorkflowRepository) {}

  async initiateWorkflow(dto: InitiateWorkflowDto): Promise<any> {
    return await this.wfRepo.initiate(dto);
  }

  async processAction(dto: WorkflowActionDto): Promise<string> {
    return await this.wfRepo.submitAction(dto);
  }

  async getWorkflowDetails(id: string): Promise<any> {
    const wf = await this.wfRepo.findById(id);
    if (!wf) return null;
    const steps = await this.wfRepo.findSteps(id);
    const logs = await this.wfRepo.findLogs(id);
    return { ...wf, steps, logs };
  }

  async listWorkflows(companyId: string): Promise<any[]> {
    return await this.wfRepo.findAll(companyId);
  }
}

// ============================================================================
// 5. HIGH-FIDELITY PDF GENERATION SIMULATION ENGINE (CLIENT-SIDE RENDERED Ready)
// ============================================================================

export class PdfGenerationEngineService {
  /**
   * Generates custom stylized printable HTML layout templates mimicking genuine enterprise PDF outputs
   * Returns a complete stand-alone styled Document Object with headers, signature pads, watermarks, 
   * and double-entry auditing codes.
   */
  async generateDocumentPdf(dto: GeneratePdfDto, contextData: any): Promise<{ fileName: string; contentType: string; contentHtml: string }> {
    const timestamp = new Date().toLocaleString();
    const watermark = `${COMPANY_PROFILE.shortName} ERP - INTERNAL OFFICIAL USE`;
    const refCode = `AL-KASWA-${dto.pdfType.toUpperCase().replace(/\s+/g, '-')}-${dto.entityId.substr(0,8).toUpperCase()}`;

    let contentBody = '';

    if (dto.pdfType === 'Money Receipt') {
      contentBody = `
        <div style="border: 2px dashed #1e293b; padding: 24px; position: relative; background: #faf9f6;">
          <div style="position: absolute; top: 40%; left: 10%; transform: rotate(-25deg); font-size: 40px; color: rgba(15, 118, 110, 0.08); font-weight: bold; font-family: sans-serif; pointer-events: none; user-select: none;">
            ${watermark}
          </div>
          
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; border-bottom: 2px solid #0f766e; padding-bottom: 12px;">
            <div>
              <h2 style="margin: 0; color: #0f766e; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">${COMPANY_PROFILE.name}</h2>
              <p style="margin: 2px 0; font-size: 11px; color: #64748b;">House 24, Road 11, Sector 10, Uttara, Dhaka-1230</p>
              <p style="margin: 2px 0; font-size: 11px; color: #64748b;">Phone: +8802-8902120 | Email: billing@alkaswaholdings.com</p>
            </div>
            <div style="text-align: right;">
              <span style="background: #0f766e; color: #ffffff; padding: 6px 14px; font-weight: bold; font-size: 14px; border-radius: 4px; text-transform: uppercase;">MONEY RECEIPT</span>
              <p style="margin: 8px 0 0 0; font-size: 11px; font-family: monospace;">Receipt No: <strong>${contextData.receiptNo || 'MR-MOCK'}</strong></p>
              <p style="margin: 2px 0 0 0; font-size: 11px; font-family: monospace;">Date: ${contextData.receivedDate || '2026-07-06'}</p>
            </div>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 13px;">
            <tr>
              <td style="width: 25%; padding: 8px 0; color: #475569; font-weight: 500;">Received From:</td>
              <td style="border-bottom: 1px dotted #cbd5e1; padding: 8px 4px; font-weight: bold; color: #1e293b;">${contextData.receivedFromName || 'Anonymous Client'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #475569; font-weight: 500;">Against Account/Booking:</td>
              <td style="border-bottom: 1px dotted #cbd5e1; padding: 8px 4px; color: #1e293b;">Unit No: ${contextData.unitNo || 'Plot Unit'}, Project: ${contextData.projectName || `${COMPANY_PROFILE.shortName} Skyline`}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #475569; font-weight: 500;">Amount Received:</td>
              <td style="border-bottom: 1px dotted #cbd5e1; padding: 8px 4px; font-size: 16px; font-weight: 800; color: #0f766e;">BDT ৳${Number(contextData.amountBdt || 0).toLocaleString('en-US')}/=</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #475569; font-weight: 500;">Payment Mode:</td>
              <td style="border-bottom: 1px dotted #cbd5e1; padding: 8px 4px; color: #1e293b;">
                <strong>${contextData.paymentMode || 'Cheque'}</strong> 
                ${contextData.bankName ? `(Bank: ${contextData.bankName}, Inst: ${contextData.instrumentNo || 'N/A'})` : ''}
              </td>
            </tr>
          </table>

          <div style="margin-top: 40px; display: flex; justify-content: space-between; align-items: flex-end;">
            <div style="font-size: 10px; color: #94a3b8; font-family: monospace;">
              System Ref: ${refCode}<br />
              Generated: ${timestamp} by ${dto.generatedBy}
            </div>
            <div style="text-align: center; width: 180px;">
              <div style="border-bottom: 1px solid #475569; height: 35px; width: 100%;"></div>
              <p style="margin: 6px 0 0 0; font-size: 12px; font-weight: bold; color: #334155;">Authorized Accounts Seal</p>
            </div>
          </div>
        </div>
      `;
    } else if (dto.pdfType === 'Booking Agreement') {
      contentBody = `
        <div style="padding: 30px; font-family: 'Times New Roman', serif; background: #fffcf7; border: 4px double #451a03; min-height: 500px; color: #292524;">
          <h1 style="text-align: center; margin: 0; color: #451a03; font-size: 26px; font-weight: bold; letter-spacing: 1px;">ALLOTMENT & BOOKING AGREEMENT</h1>
          <p style="text-align: center; margin: 5px 0 25px 0; font-size: 12px; color: #78716c; letter-spacing: 3px; font-weight: bold;">${COMPANY_PROFILE.name} REAL ESTATE SYNDICATE</p>
          
          <div style="margin-bottom: 20px; font-size: 14px; line-height: 1.6; text-align: justify;">
            This indenture of Allotment is made on this day of execution by and between <strong>${COMPANY_PROFILE.name}</strong>, hereinafter referred as the "Developer", and the "Allottee" described below:
          </div>

          <table style="width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 13px;">
            <tr style="background: rgba(69, 26, 3, 0.04);">
              <td style="padding: 8px; font-weight: bold; width: 30%; border: 1px solid #d6d3d1;">Allottee Name:</td>
              <td style="padding: 8px; border: 1px solid #d6d3d1;">${contextData.customerName || 'Tariqul Islam'}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold; border: 1px solid #d6d3d1;">Project & Unit:</td>
              <td style="padding: 8px; border: 1px solid #d6d3d1;">Unit ${contextData.unitNo || 'A-3'} in Project ${contextData.projectName || 'Uttara Skyline'}</td>
            </tr>
            <tr style="background: rgba(69, 26, 3, 0.04);">
              <td style="padding: 8px; font-weight: bold; border: 1px solid #d6d3d1;">Agreed Pricing Schedule:</td>
              <td style="padding: 8px; border: 1px solid #d6d3d1;">Total BDT ৳${Number(contextData.totalAgreedPrice || 12000000).toLocaleString('en-US')}/=</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold; border: 1px solid #d6d3d1;">Installment Terms:</td>
              <td style="padding: 8px; border: 1px solid #d6d3d1;">${contextData.installmentCount || 24} monthly installments</td>
            </tr>
          </table>

          <div style="font-size: 13px; line-height: 1.7; text-align: justify; margin-top: 15px;">
            The Allottee agrees to strictly comply with the installment timelines. If any payment remains overdue for more than 45 days, the Developer reserves full legal rights to cancel the allotment in accordance with the Real Estate Development and Management Act.
          </div>

          <div style="margin-top: 60px; display: flex; justify-content: space-between;">
            <div style="text-align: center; width: 150px;">
              <div style="border-bottom: 1px solid #78716c; height: 30px;"></div>
              <p style="margin: 5px 0; font-size: 12px; font-weight: bold;">Signature of Allottee</p>
            </div>
            <div style="text-align: center; width: 150px;">
              <div style="border-bottom: 1px solid #78716c; height: 30px; color: #a8a29e; font-size: 10px; line-height: 35px;">Verified by HR & Legal</div>
              <p style="margin: 5px 0; font-size: 12px; font-weight: bold;">Executive Witness</p>
            </div>
            <div style="text-align: center; width: 150px;">
              <div style="border-bottom: 1px solid #78716c; height: 30px;"></div>
              <p style="margin: 5px 0; font-size: 12px; font-weight: bold;">For ${COMPANY_PROFILE.name}</p>
            </div>
          </div>
          
          <div style="font-size: 9px; color: #a8a29e; text-align: center; margin-top: 40px; font-family: sans-serif;">
            Official Registration ID: ${refCode} | Printed via ${COMPANY_PROFILE.shortName} DMS on ${timestamp}
          </div>
        </div>
      `;
    } else if (dto.pdfType === 'Investor Certificate') {
      contentBody = `
        <div style="border: 10px double #c29b38; padding: 35px; background: #fffdf6; font-family: 'Georgia', serif; text-align: center; color: #1e1b4b; position: relative; min-height: 450px;">
          <div style="position: absolute; top: 0; left: 0; right: 0; height: 12px; background: #c29b38;"></div>
          <p style="margin: 5px 0; font-size: 11px; letter-spacing: 4px; color: #c29b38; font-weight: bold; font-family: sans-serif;">${COMPANY_PROFILE.name} REAL ESTATE INVESTMENT TRUST</p>
          <h2 style="margin: 15px 0; font-size: 28px; color: #1e1b4b; font-weight: bold;">CERTIFICATE OF CAPITAL SHARE INVESTMENT</h2>
          <p style="font-style: italic; font-size: 14px; margin-bottom: 25px;">This certificate of investment is proudly issued to:</p>
          
          <h1 style="margin: 0; font-size: 32px; font-weight: bold; color: #b45309; text-transform: uppercase;">${contextData.investorName || 'S.M. JUNAID AHMAD'}</h1>
          <hr style="width: 60%; border: none; border-top: 1px solid #c29b38; margin: 15px auto;" />

          <p style="font-size: 14px; line-height: 1.6; max-width: 650px; margin: 15px auto; text-align: center;">
            who has committed capital resources of <strong>BDT ৳${Number(contextData.investedAmount || 5000000).toLocaleString('en-US')}/=</strong> 
            towards project development of <strong>${contextData.projectName || `${COMPANY_PROFILE.shortName} Gulshan Skyline`}</strong>. 
            This holder is entitled to pro-rata dividend shares distributed under the Joint Venture trust accounts.
          </p>

          <table style="width: 70%; margin: 25px auto; font-family: sans-serif; font-size: 12px; text-align: left; border: 1px solid #e2e8f0; border-radius: 4px; padding: 10px;">
            <tr>
              <td style="color: #64748b; font-weight: bold; padding: 4px 10px;">Certificate ID:</td>
              <td style="font-weight: bold; color: #1e1b4b; padding: 4px 10px;">${contextData.certificateNo || 'AL-REIT-901'}</td>
              <td style="color: #64748b; font-weight: bold; padding: 4px 10px;">Share Holding:</td>
              <td style="font-weight: bold; color: #1e1b4b; padding: 4px 10px;">${contextData.sharePercent || '2.50'}%</td>
            </tr>
          </table>

          <div style="margin-top: 40px; display: flex; justify-content: space-around; font-family: sans-serif; font-size: 12px;">
            <div style="width: 150px;">
              <div style="border-bottom: 1px solid #c29b38; height: 30px;"></div>
              <p style="margin: 5px 0; font-weight: bold; color: #64748b;">Trustee Chairperson</p>
            </div>
            <div style="width: 150px;">
              <div style="border-bottom: 1px solid #c29b38; height: 30px;"></div>
              <p style="margin: 5px 0; font-weight: bold; color: #64748b;">Managing Director</p>
            </div>
          </div>
          
          <p style="font-size: 10px; color: #94a3b8; font-family: monospace; margin-top: 30px;">
            Security Code: ${refCode} | Audited on: ${timestamp}
          </p>
        </div>
      `;
    } else if (dto.pdfType === 'Salary Slip') {
      contentBody = `
        <div style="border: 1px solid #cbd5e1; padding: 25px; font-family: sans-serif; background: #ffffff; color: #334155;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #334155; padding-bottom: 10px;">
            <div>
              <h2 style="margin: 0; color: #1e293b; font-weight: 800;">${COMPANY_PROFILE.name}</h2>
              <p style="margin: 2px 0; font-size: 11px; color: #64748b;">Official Monthly Payslip / বেতন রসিদ</p>
            </div>
            <div style="text-align: right;">
              <span style="font-weight: bold; font-size: 14px; background: #334155; color: #ffffff; padding: 4px 10px; border-radius: 3px;">PAYSLIP</span>
              <p style="margin: 5px 0 0 0; font-size: 11px; font-family: monospace;">Month: <strong>${contextData.salaryMonth || '2026-06'}</strong></p>
            </div>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 12px;">
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 6px 0; color: #64748b; font-weight: bold;">Employee ID:</td>
              <td style="padding: 6px 4px; font-weight: bold;">${contextData.employeeId || 'EMP-102'}</td>
              <td style="padding: 6px 0; color: #64748b; font-weight: bold;">Employee Name:</td>
              <td style="padding: 6px 4px; font-weight: bold;">${contextData.employeeName || 'Nazia Sultana'}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 6px 0; color: #64748b; font-weight: bold;">Department:</td>
              <td style="padding: 6px 4px;">${contextData.department || 'Engineering'}</td>
              <td style="padding: 6px 0; color: #64748b; font-weight: bold;">Designation:</td>
              <td style="padding: 6px 4px;">${contextData.designation || 'Lead Architect'}</td>
            </tr>
          </table>

          <div style="display: flex; gap: 20px; margin-top: 15px;">
            <div style="flex: 1; border: 1px solid #e2e8f0; border-radius: 4px; padding: 10px;">
              <h4 style="margin: 0 0 10px 0; color: #1e293b; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; font-weight: bold;">Earnings (BDT)</h4>
              <table style="width: 100%; font-size: 11px; border-collapse: collapse;">
                <tr><td style="padding: 4px 0; color: #64748b;">Basic Salary:</td><td style="text-align: right; font-weight: bold;">৳${Number(contextData.basicSalary || 0).toLocaleString()}</td></tr>
                <tr><td style="padding: 4px 0; color: #64748b;">House Rent / Med / Trans:</td><td style="text-align: right;">৳${Number(contextData.allowances || 0).toLocaleString()}</td></tr>
                <tr><td style="padding: 4px 0; color: #64748b;">Commissions / Incentives:</td><td style="text-align: right;">৳${Number(contextData.commissionsPaid || 0).toLocaleString()}</td></tr>
                <tr style="border-top: 1px solid #cbd5e1; font-weight: bold;"><td style="padding: 6px 0; color: #1e293b;">Gross Earnings:</td><td style="text-align: right; color: #1e293b;">৳${Number((contextData.basicSalary || 0) + (contextData.allowances || 0) + (contextData.commissionsPaid || 0)).toLocaleString()}</td></tr>
              </table>
            </div>

            <div style="flex: 1; border: 1px solid #e2e8f0; border-radius: 4px; padding: 10px;">
              <h4 style="margin: 0 0 10px 0; color: #1e293b; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; font-weight: bold;">Deductions (BDT)</h4>
              <table style="width: 100%; font-size: 11px; border-collapse: collapse;">
                <tr><td style="padding: 4px 0; color: #64748b;">Provident Fund Share:</td><td style="text-align: right;">৳${Number(contextData.pfDeduction || 0).toLocaleString()}</td></tr>
                <tr><td style="padding: 4px 0; color: #64748b;">Tax Withholding:</td><td style="text-align: right;">৳${Number(contextData.taxDeduction || 0).toLocaleString()}</td></tr>
                <tr><td style="padding: 4px 0; color: #64748b;">Loan / Salary Advance:</td><td style="text-align: right;">৳${Number(contextData.loanDeduction || 0).toLocaleString()}</td></tr>
                <tr style="border-top: 1px solid #cbd5e1; font-weight: bold;"><td style="padding: 6px 0; color: #1e293b;">Total Deductions:</td><td style="text-align: right; color: #ef4444;">৳${Number((contextData.pfDeduction || 0) + (contextData.taxDeduction || 0) + (contextData.loanDeduction || 0)).toLocaleString()}</td></tr>
              </table>
            </div>
          </div>

          <div style="background: #f1f5f9; padding: 12px; margin-top: 20px; border-radius: 4px; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-weight: bold; font-size: 13px; color: #1e293b;">NET PAYABLE CASH CLEARING / নিট বেতন:</span>
            <span style="font-size: 18px; font-weight: 800; color: #10b981;">BDT ৳${Number(contextData.netPayable || 0).toLocaleString()}/=</span>
          </div>

          <div style="margin-top: 40px; display: flex; justify-content: space-between; font-size: 11px; font-family: monospace;">
            <div>
              System Code: ${refCode}<br />
              Generated: ${timestamp}
            </div>
            <div style="text-align: center; width: 150px; border-top: 1px solid #64748b; padding-top: 5px; font-weight: bold;">
              HR Department Seal
            </div>
          </div>
        </div>
      `;
    } else if (dto.pdfType === 'Land Agreement') {
      contentBody = `
        <div style="padding: 30px; font-family: 'Times New Roman', serif; background: #faf9f6; border: 4px solid #1c1917; min-height: 500px; color: #1c1917;">
          <h1 style="text-align: center; margin: 0; font-size: 24px; font-weight: bold; text-decoration: underline;">DEED OF LAND VENTURE AGREEMENT (JVA)</h1>
          <p style="text-align: center; margin: 5px 0 25px 0; font-size: 11px; letter-spacing: 2px;">GOVERNMENT OF THE PEOPLES REPUBLIC OF BANGLADESH</p>

          <div style="font-size: 13px; line-height: 1.6; text-align: justify; margin-bottom: 20px;">
            This tripartite deed of Joint Venture Agreement is entered into on this day at Dhaka Registry by and between the Land Owner <strong>${contextData.landOwner || 'Lateefur Rahman'}</strong> and Developer <strong>${COMPANY_PROFILE.name}</strong>.
          </div>

          <h4 style="margin: 10px 0 5px 0; font-weight: bold; border-bottom: 1px solid #78716c;">Schedule 'A' Property Details:</h4>
          <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 20px;">
            <tr><td style="padding: 5px; font-weight: bold; width: 30%;">Mouza / Location:</td><td style="padding: 5px;">${contextData.locationEn || 'Sector 15, Uttara, Dhaka'}</td></tr>
            <tr><td style="padding: 5px; font-weight: bold;">Total Area:</td><td style="padding: 5px;">${contextData.sizeDecimal || '15.4'} Decimals</td></tr>
            <tr><td style="padding: 5px; font-weight: bold;">CS / RS Daag No:</td><td style="padding: 5px;">${contextData.csDaagNo || 'CS-452'} / ${contextData.rsDaagNo || 'RS-1002'}</td></tr>
            <tr><td style="padding: 5px; font-weight: bold;">JVA Developer Share:</td><td style="padding: 5px;">${contextData.jvaRatioDeveloper || '60'}% Developer, ${contextData.jvaRatioLandowner || '40'}% Land Owner</td></tr>
          </table>

          <div style="font-size: 13px; line-height: 1.6; text-align: justify;">
            The Developer shall, at its own cost, design and construct a multi-storied luxurious building on the schedule land. The construction period is fixed for 48 calendar months with a grace period of 6 months.
          </div>

          <div style="margin-top: 60px; display: flex; justify-content: space-between;">
            <div style="text-align: center; width: 140px; border-top: 1px solid #78716c; padding-top: 4px; font-size: 12px; font-weight: bold;">
              First Party (Land Owner)
            </div>
            <div style="text-align: center; width: 140px; border-top: 1px solid #78716c; padding-top: 4px; font-size: 12px; font-weight: bold;">
              Second Party (Developer)
            </div>
            <div style="text-align: center; width: 140px; border-top: 1px solid #78716c; padding-top: 4px; font-size: 12px; font-weight: bold;">
              Witness/Registry Seal
            </div>
          </div>

          <div style="font-size: 9px; color: #78716c; text-align: center; margin-top: 40px; font-family: sans-serif;">
            Registered Legal Reference Code: ${refCode} | Generated: ${timestamp}
          </div>
        </div>
      `;
    }

    const contentHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${dto.pdfType}</title>
          <style>
            body {
              font-family: Arial, Helvetica, sans-serif;
              padding: 0;
              margin: 0;
              background-color: #f8fafc;
            }
            .pdf-container {
              max-width: 800px;
              margin: 20px auto;
              background: #ffffff;
              box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
              border-radius: 8px;
              overflow: hidden;
            }
          </style>
        </head>
        <body>
          <div class="pdf-container">
            ${contentBody}
          </div>
        </body>
      </html>
    `;

    return {
      fileName: `${refCode.toLowerCase()}.html`,
      contentType: 'text/html',
      contentHtml
    };
  }
}
