import { AttemptStatus } from '@prisma/client';
declare class MockAnswerInput {
    examItemId: string;
    questionId: string;
    selectedAnswer?: unknown;
    status: AttemptStatus;
    timeSpent?: number;
}
export declare class SubmitMockAttemptDto {
    answers: MockAnswerInput[];
}
export {};
