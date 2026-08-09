/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Controller, Get, Post, Body, Param, Query, Headers } from '@nestjs/common';
import { DmsWorkflowService } from './dms-workflow.service';
import { 
  CreateDocumentDto, 
  ReviseDocumentDto, 
  CreateNotificationDto, 
  InitiateWorkflowDto, 
  SubmitWorkflowActionDto 
} from './dms-workflow.dto';

// Define Controller-level routing adapters
interface NestControllerDecorator {
  (path?: string): ClassDecorator;
}
interface NestMethodDecorator {
  (path?: string): MethodDecorator;
}

@Controller('api/dms-workflow')
export class DmsWorkflowController {
  constructor(private readonly service: DmsWorkflowService) {}

  // ==========================================================================
  // DMS ENDPOINTS
  // ==========================================================================

  @Post('documents')
  async uploadDocument(
    @Body() dto: CreateDocumentDto,
    @Headers('x-actor-id') actorId: string,
    @Headers('x-actor-name') actorName: string
  ) {
    return this.service.createDocument(dto, actorId || 'system-user', actorName || 'System User');
  }

  @Post('documents/:id/revise')
  async reviseDocument(
    @Param('id') id: string,
    @Body() dto: ReviseDocumentDto,
    @Headers('x-actor-id') actorId: string,
    @Headers('x-actor-name') actorName: string
  ) {
    return this.service.reviseDocument(id, dto, actorId || 'system-user', actorName || 'System User');
  }

  @Get('documents')
  async getDocuments(@Query('companyId') companyId: string) {
    return this.service.getDocuments(companyId);
  }

  // ==========================================================================
  // WORKFLOW ENDPOINTS
  // ==========================================================================

  @Post('workflows')
  async initiateWorkflow(
    @Body() dto: InitiateWorkflowDto,
    @Headers('x-actor-id') actorId: string,
    @Headers('x-actor-name') actorName: string
  ) {
    return this.service.initiateWorkflow(dto, actorId || 'system-user', actorName || 'System User');
  }

  @Post('workflows/:id/action')
  async submitWorkflowAction(
    @Param('id') id: string,
    @Body() dto: SubmitWorkflowActionDto,
    @Headers('x-actor-id') actorId: string,
    @Headers('x-actor-name') actorName: string
  ) {
    return this.service.submitWorkflowAction(id, dto, actorId || 'system-user', actorName || 'System User');
  }

  // ==========================================================================
  // NOTIFICATION ENDPOINTS
  // ==========================================================================

  @Post('notifications')
  async triggerNotification(@Body() dto: CreateNotificationDto) {
    return this.service.sendNotification(dto);
  }
}
