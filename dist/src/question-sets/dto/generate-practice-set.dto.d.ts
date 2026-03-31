import { DifficultyLevel, Language, QuestionType } from '@prisma/client';
export declare class GeneratePracticeSetDto {
    title: string;
    createdBy: string;
    type: string;
    take: number;
    subjectIds?: string[];
    tagIds?: string[];
    examSessionIds?: string[];
    organizationIds?: string[];
    difficulty?: DifficultyLevel;
    questionType?: QuestionType;
    language?: Language;
    isPreviousYear?: boolean;
}
