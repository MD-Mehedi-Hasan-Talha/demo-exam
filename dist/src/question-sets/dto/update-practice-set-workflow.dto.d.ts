import { PracticeSetWorkflowStatus } from '@prisma/client';
export declare class UpdatePracticeSetWorkflowDto {
    workflowStatus: PracticeSetWorkflowStatus;
    reviewedBy?: string;
}
