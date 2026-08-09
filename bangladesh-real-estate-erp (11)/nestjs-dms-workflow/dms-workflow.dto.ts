/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// DTO classes for NestJS DMS, Notifications, and Workflow Engine

export class CreateDocumentDto {
  companyId: string;
  documentType: string;
  relatedModule: string;
  relatedEntityId: string;
  title: string;
  filePath: string;
  remarks?: string;
}

export class ReviseDocumentDto {
  remarks?: string;
}

export class CreateNotificationDto {
  companyId: string;
  recipientId: string;
  recipientRole?: string;
  title: string;
  message: string;
  type: string;
  channel: 'In-App' | 'SMS' | 'Email' | 'All';
}

export class InitiateWorkflowDto {
  companyId: string;
  module: string;
  entityId: string;
  remarks?: string;
}

export class SubmitWorkflowActionDto {
  action: 'Approve' | 'Reject';
  remarks?: string;
}
