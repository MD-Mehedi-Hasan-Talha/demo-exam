import { DifficultyLevel, Language, QuestionType } from '@prisma/client';

export class CreateQuestionDto {
  type!: QuestionType;
  difficulty!: DifficultyLevel;
  language?: Language;
  stem!: string;
  stemLocal?: string;
  explanation?: string;
  explanationLocal?: string;
  options?: unknown;
  answer?: unknown;
  defaultMarks?: number;
  defaultNegMarks?: number;
  estimatedSeconds?: number;
  isPreviousYear?: boolean;
  isModelTest?: boolean;
  isVerified?: boolean;
  subjectIds?: string[];
  primarySubjectId?: string;
  tagIds?: string[];
  organizationIds?: string[];
  examSessionIds?: string[];
  createdBy?: string;
}
