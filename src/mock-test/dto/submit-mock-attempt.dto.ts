import { AttemptStatus } from '@prisma/client';

class MockAnswerInput {
  examItemId!: string;
  questionId!: string;
  selectedAnswer?: unknown;
  status!: AttemptStatus;
  timeSpent?: number;
}

export class SubmitMockAttemptDto {
  answers!: MockAnswerInput[];
}
