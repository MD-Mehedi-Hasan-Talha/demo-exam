import { PrismaService } from '../prisma/prisma.service';
import { FilterQuestionsQueryDto } from './dto/filter-questions-query.dto';
export declare class QuestionsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    filterQuestions(query: FilterQuestionsQueryDto): Promise<{
        items: {
            uuid: string;
            id: string;
            type: import("@prisma/client").$Enums.QuestionType;
            difficulty: import("@prisma/client").$Enums.DifficultyLevel;
            language: import("@prisma/client").$Enums.Language;
            totalAttempts: number;
            totalCorrect: number;
            totalBookmarks: number;
            trendingScore: number;
            currentVersion: {
                stem: string;
                stemLocal: string | null;
            } | null;
        }[];
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
