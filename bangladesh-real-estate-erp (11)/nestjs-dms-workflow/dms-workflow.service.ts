/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { 
  CreateDocumentDto, 
  ReviseDocumentDto, 
  CreateNotificationDto, 
  InitiateWorkflowDto, 
  SubmitWorkflowActionDto 
} from './dms-workflow.dto';

// Simulate Database client interface for compilation and clean NestJS setup
interface DatabaseClient {
  query(sql: string, params?: any[]): Promise<any>;
}

@Injectable()
export class DmsWorkflowService {
  private db: DatabaseClient; // Injected PostgreSQL pool / client

  constructor() {
    // Injectable DB adapter mock
    this.db = {
      query: async (sql: string, params?: any[]) => {
        return { rows: [] };
      }
    };
  }

  // ==========================================================================
  // DOCUMENT MANAGEMENT SYSTEM
  // ==========================================================================

  async createDocument(dto: CreateDocumentDto, actorId: string, actorName: string) {
    const queryStr = `
      SELECT * FROM register_new_document_revision(
        $1::UUID, $2::VARCHAR, $3::VARCHAR, $4::VARCHAR, $5::VARCHAR, $6::VARCHAR, $7::VARCHAR, 1, $8::VARCHAR
      );
    `;
    const params = [
      dto.companyId,
      dto.documentType,
      dto.relatedModule,
      dto.relatedEntityId,
      dto.title,
      dto.filePath,
      dto.remarks || '',
      actorId
    ];

    try {
      const result = await this.db.query(queryStr, params);
      await this.logAudit('INSERT', 'documents', `Uploaded document ${dto.title}`, actorId, actorName);
      return result.rows[0];
    } catch (err) {
      throw new InternalServerErrorException(`Failed to register document: ${err.message}`);
    }
  }

  async reviseDocument(id: string, dto: ReviseDocumentDto, actorId: string, actorName: string) {
    const queryStr = `
      UPDATE documents
      SET version_number = version_number + 1,
          remarks = $2,
          updated_at = NOW()
      WHERE id = $1
      RETURNING *;
    `;
    try {
      const result = await this.db.query(queryStr, [id, dto.remarks || 'Document revised']);
      await this.logAudit('UPDATE', 'documents', `Revised document ${id}`, actorId, actorName);
      return result.rows[0];
    } catch (err) {
      throw new InternalServerErrorException(`Failed to revise document: ${err.message}`);
    }
  }

  async getDocuments(companyId: string) {
    const queryStr = 'SELECT * FROM documents WHERE company_id = $1 AND is_archived = false ORDER BY created_at DESC;';
    const result = await this.db.query(queryStr, [companyId]);
    return result.rows;
  }

  // ==========================================================================
  // APPROVAL WORKFLOWS
  // ==========================================================================

  async initiateWorkflow(dto: InitiateWorkflowDto, initiatorId: string, initiatorName: string) {
    const queryStr = `
      SELECT * FROM initiate_approval_workflow(
        $1::UUID, $2::VARCHAR, $3::VARCHAR, $4::VARCHAR, $5::VARCHAR
      );
    `;
    const params = [
      dto.companyId,
      dto.module,
      dto.entityId,
      initiatorId,
      dto.remarks || ''
    ];

    try {
      const result = await this.db.query(queryStr, params);
      await this.logAudit('INSERT', 'approval_workflows', `Initiated workflow for ${dto.entityId}`, initiatorId, initiatorName);
      return result.rows[0];
    } catch (err) {
      throw new InternalServerErrorException(`Failed to initiate workflow: ${err.message}`);
    }
  }

  async submitWorkflowAction(workflowId: string, dto: SubmitWorkflowActionDto, actorId: string, actorName: string) {
    const queryStr = `
      SELECT * FROM submit_workflow_action(
        $1::UUID, $2::VARCHAR, $3::VARCHAR, $4::VARCHAR
      );
    `;
    const params = [
      workflowId,
      dto.action,
      actorId,
      dto.remarks || ''
    ];

    try {
      const result = await this.db.query(queryStr, params);
      await this.logAudit('UPDATE', 'approval_workflows', `Submitted action ${dto.action} on workflow ${workflowId}`, actorId, actorName);
      return result.rows[0];
    } catch (err) {
      throw new InternalServerErrorException(`Failed to submit workflow action: ${err.message}`);
    }
  }

  // ==========================================================================
  // NOTIFICATION SYSTEM
  // ==========================================================================

  async sendNotification(dto: CreateNotificationDto) {
    const queryStr = `
      SELECT * FROM trigger_system_notification(
        $1::UUID, $2::UUID, $3::VARCHAR, $4::VARCHAR, $5::VARCHAR, $6::VARCHAR
      );
    `;
    const params = [
      dto.companyId,
      dto.recipientId,
      dto.title,
      dto.message,
      dto.type,
      dto.channel
    ];
    const result = await this.db.query(queryStr, params);
    return result.rows[0];
  }

  // ==========================================================================
  // AUDIT LOGGING ADAPTER
  // ==========================================================================

  private async logAudit(action: string, table: string, desc: string, userId: string, userName: string) {
    const queryStr = `
      INSERT INTO audit_logs (id, user_id, user_name, action, table_name, details_en, details_bn, created_at)
      VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $5, NOW());
    `;
    await this.db.query(queryStr, [userId, userName, action, table, desc]);
  }
}
