/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Module } from '@nestjs/common';
import { DmsWorkflowController } from './dms-workflow.controller';
import { DmsWorkflowService } from './dms-workflow.service';

@Module({
  controllers: [DmsWorkflowController],
  providers: [DmsWorkflowService],
  exports: [DmsWorkflowService]
})
export class DmsWorkflowModule {}
