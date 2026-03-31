import { AnalyticsService } from './analytics.service';
import { RefreshQuestionAnalyticsDto } from './dto/refresh-question-analytics.dto';
export declare class AnalyticsController {
    private readonly analyticsService;
    constructor(analyticsService: AnalyticsService);
    refreshQuestionAnalytics(payload: RefreshQuestionAnalyticsDto): Promise<{
        updated: number;
    }>;
    mostSolved(limit?: number): Promise<({
        question: {
            uuid: string;
            id: string;
            type: import("@prisma/client").$Enums.QuestionType;
            difficulty: import("@prisma/client").$Enums.DifficultyLevel;
            currentVersion: {
                stem: string;
                stemLocal: string | null;
            } | null;
        };
    } & {
        totalAttempts: number;
        totalCorrect: number;
        totalBookmarks: number;
        trendingScore: number;
        questionId: string;
        accuracyRate: number;
        avgTimeSpent: number;
        difficultyDrift: number;
        lastComputedAt: Date;
    })[]>;
    mostDifficult(limit?: number): Promise<({
        question: {
            uuid: string;
            id: string;
            type: import("@prisma/client").$Enums.QuestionType;
            difficulty: import("@prisma/client").$Enums.DifficultyLevel;
            currentVersion: {
                stem: string;
                stemLocal: string | null;
            } | null;
        };
    } & {
        totalAttempts: number;
        totalCorrect: number;
        totalBookmarks: number;
        trendingScore: number;
        questionId: string;
        accuracyRate: number;
        avgTimeSpent: number;
        difficultyDrift: number;
        lastComputedAt: Date;
    })[]>;
    trendingTopics(limit?: number): Promise<{
        subjectId: string;
        subject: {
            id: string;
            name: string;
            slug: string;
            level: import("@prisma/client").$Enums.SubjectLevel;
        } | null;
        solvedVolume: number;
    }[]>;
    weakSubjects(userId: string, limit?: number): Promise<({
        subject: {
            id: string;
            name: string;
            slug: string;
            level: import("@prisma/client").$Enums.SubjectLevel;
        };
    } & {
        id: string;
        totalCorrect: number;
        updatedAt: Date;
        userId: string;
        subjectId: string;
        totalAttempted: number;
        accuracy: number;
        lastAttemptAt: Date | null;
        streak: number;
        weaknessScore: number;
    })[]>;
    performanceHeatmap(userId: string): Promise<{
        subjectId: string;
        subject: {
            id: string;
            name: string;
            slug: string;
        } | null;
        difficulty: string;
        total: number;
        correct: number;
        accuracy: number;
    }[]>;
    chapterStrength(userId: string, limit?: number): Promise<{
        chapter: {
            id: string;
            name: string;
            slug: string;
        };
        totalAttempted: number;
        totalCorrect: number;
        accuracy: number;
        weaknessScore: number;
        strengthScore: number;
    }[]>;
}
