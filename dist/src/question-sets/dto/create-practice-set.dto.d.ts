import { DifficultyLevel, PracticeSetVisibility } from '@prisma/client';
export declare class CreatePracticeSetDto {
    title: string;
    description?: string;
    type: string;
    createdBy: string;
    visibility?: PracticeSetVisibility;
    totalMarks?: number;
    timeLimit?: number;
    estimatedDifficulty?: DifficultyLevel;
    questionIds?: string[];
    sourceFilterSnapshot?: unknown;
}
