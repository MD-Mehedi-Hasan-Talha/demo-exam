import { DifficultyLevel, Language, Prisma, QuestionType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { FilterQuestionsQueryDto } from './dto/filter-questions-query.dto';
type QuestionCard = {
    id: string;
    uuid: string;
    difficulty: DifficultyLevel;
    type: QuestionType;
    language: Language;
    totalAttempts: number;
    totalCorrect: number;
    totalBookmarks: number;
    trendingScore: number;
    currentVersion: {
        stem: string;
        stemLocal: string | null;
    } | null;
};
export declare class QuestionsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createQuestion(payload: CreateQuestionDto): Promise<({
        currentVersion: {
            stem: string;
            stemLocal: string | null;
            explanation: string | null;
            options: Prisma.JsonValue;
            answer: Prisma.JsonValue;
        } | null;
        subjects: {
            questionId: string;
            subjectId: string;
            isPrimary: boolean;
            weight: number;
        }[];
        tags: {
            questionId: string;
            tagId: string;
            relevance: number;
        }[];
        organizations: {
            questionId: string;
            organizationId: string;
        }[];
        examSessions: {
            questionId: string;
            examSessionId: string;
            questionNo: number | null;
        }[];
    } & {
        id: string;
        uuid: string;
        type: import("@prisma/client").$Enums.QuestionType;
        difficulty: import("@prisma/client").$Enums.DifficultyLevel;
        language: import("@prisma/client").$Enums.Language;
        status: import("@prisma/client").$Enums.QuestionStatus;
        currentVersionId: string | null;
        defaultMarks: number;
        defaultNegMarks: number;
        estimatedSeconds: number | null;
        totalAttempts: number;
        totalCorrect: number;
        totalBookmarks: number;
        trendingScore: number;
        isVerified: boolean;
        isMultiSubject: boolean;
        isPreviousYear: boolean;
        isAIGenerated: boolean;
        isModelTest: boolean;
        createdBy: string | null;
        createdAt: Date;
        updatedAt: Date;
    }) | null>;
    filterQuestions(query: FilterQuestionsQueryDto): Promise<{
        items: QuestionCard[];
        pageInfo: {
            take: number;
            nextCursor: string | null;
        };
        appliedFilters: {
            subjectIds: string[];
            tagIds: string[];
            organizationIds: string[];
            examSessionIds: string[];
            difficulty: import("@prisma/client").$Enums.DifficultyLevel | null;
            type: import("@prisma/client").$Enums.QuestionType | null;
            language: import("@prisma/client").$Enums.Language | null;
            solved: "true" | "false" | null;
            bookmarked: "true" | "false" | null;
            isPreviousYear: "true" | "false" | null;
            isModelTest: "true" | "false" | null;
            random: "true" | "false";
        };
    }>;
    private parseTake;
    private asList;
    private seededShuffle;
    private hashString;
    private buildAppliedFilters;
}
export {};
