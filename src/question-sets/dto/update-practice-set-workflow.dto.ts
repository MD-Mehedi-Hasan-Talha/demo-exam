import { PracticeSetWorkflowStatus } from '@prisma/client';

export class UpdatePracticeSetWorkflowDto {
  workflowStatus!: PracticeSetWorkflowStatus;
  reviewedBy?: string;
}
