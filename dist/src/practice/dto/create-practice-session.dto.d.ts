import { PracticeMode } from '@prisma/client';
export declare class CreatePracticeSessionDto {
    userId: string;
    mode: PracticeMode;
    take?: number;
    subjectIds?: string[];
    tagIds?: string[];
    examSessionIds?: string[];
    organizationIds?: string[];
    difficulty?: string;
    language?: string;
    timedSeconds?: number;
}
