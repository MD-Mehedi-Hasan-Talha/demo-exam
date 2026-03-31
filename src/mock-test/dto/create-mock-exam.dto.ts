import { DifficultyLevel, ExamMode, QuestionType } from '@prisma/client';

class MockRuleInput {
  subjectId?: string;
  tagId?: string;
  difficulty?: DifficultyLevel;
  questionType?: QuestionType;
  questionCount!: number;
  marks?: number;
  negMarks?: number;
  fromPreviousYear?: boolean;
}

export class CreateMockExamDto {
  title!: string;
  createdBy!: string;
  mode: ExamMode = ExamMode.MOCK;
  totalDuration?: number;
  totalMarks?: number;
  passMark?: number;
  organizationId?: string;
  examSessionId?: string;
  shuffleQuestions?: boolean;
  rules!: MockRuleInput[];
}
