import { DifficultyLevel, ExamMode, QuestionType } from '@prisma/client';
declare class MockRuleInput {
    subjectId?: string;
    tagId?: string;
    difficulty?: DifficultyLevel;
    questionType?: QuestionType;
    questionCount: number;
    marks?: number;
    negMarks?: number;
    fromPreviousYear?: boolean;
}
export declare class CreateMockExamDto {
    title: string;
    createdBy: string;
    mode: ExamMode;
    totalDuration?: number;
    totalMarks?: number;
    passMark?: number;
    organizationId?: string;
    examSessionId?: string;
    shuffleQuestions?: boolean;
    rules: MockRuleInput[];
}
export {};
