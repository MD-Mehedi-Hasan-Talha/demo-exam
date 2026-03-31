import { DifficultyLevel, Language, QuestionType } from '@prisma/client';
export declare class FilterQuestionsQueryDto {
    userId?: string;
    subjectIds?: string;
    tagIds?: string;
    organizationIds?: string;
    examSessionIds?: string;
    difficulty?: DifficultyLevel;
    type?: QuestionType;
    language?: Language;
    solved?: 'true' | 'false';
    bookmarked?: 'true' | 'false';
    isPreviousYear?: 'true' | 'false';
    isModelTest?: 'true' | 'false';
    random?: 'true' | 'false';
    seed?: string;
    take?: string;
    cursor?: string;
}
