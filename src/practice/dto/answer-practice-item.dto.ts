import { AttemptStatus } from '@prisma/client';

export class AnswerPracticeItemDto {
  userId!: string;
  questionId!: string;
  status!: AttemptStatus;
  selectedAnswer?: unknown;
  timeSpent?: number;
}
