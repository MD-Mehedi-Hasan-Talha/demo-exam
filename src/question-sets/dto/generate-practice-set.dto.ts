import { DifficultyLevel, Language, QuestionType } from '@prisma/client';

export class GeneratePracticeSetDto {
  title!: string;
  createdBy!: string;
  type: string = 'AI_GENERATED';
  take: number = 30;
  subjectIds?: string[];
  tagIds?: string[];
  examSessionIds?: string[];
  organizationIds?: string[];
  difficulty?: DifficultyLevel;
  questionType?: QuestionType;
  language?: Language;
  isPreviousYear?: boolean;
}
