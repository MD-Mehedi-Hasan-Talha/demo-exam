import { LogActivityDto } from './dto/log-activity.dto';
import { MarkWeakQuestionDto } from './dto/mark-weak-question.dto';
import { UpsertBookmarkDto } from './dto/upsert-bookmark.dto';
import { ProgressService } from './progress.service';
export declare class ProgressController {
    private readonly progressService;
    constructor(progressService: ProgressService);
    upsertBookmark(payload: UpsertBookmarkDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tags: string[];
        questionId: string;
        userId: string;
        reason: import("@prisma/client").$Enums.BookmarkReason;
        note: string | null;
        isReviewed: boolean;
    }>;
    removeBookmark(questionId: string, userId: string): Promise<{
        deleted: number;
    }>;
    getBookmarks(userId: string, take?: number): Promise<({
        question: {
            uuid: string;
            id: string;
            type: import("@prisma/client").$Enums.QuestionType;
            difficulty: import("@prisma/client").$Enums.DifficultyLevel;
            language: import("@prisma/client").$Enums.Language;
            currentVersion: {
                stem: string;
                stemLocal: string | null;
            } | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tags: string[];
        questionId: string;
        userId: string;
        reason: import("@prisma/client").$Enums.BookmarkReason;
        note: string | null;
        isReviewed: boolean;
    })[]>;
    markWeak(payload: MarkWeakQuestionDto): Promise<{
        id: string;
        updatedAt: Date;
        questionId: string;
        userId: string;
        lastAttemptAt: Date | null;
        weaknessScore: number;
        attemptCount: number;
        correctCount: number;
        wrongCount: number;
        skippedCount: number;
        lastStatus: import("@prisma/client").$Enums.AttemptStatus | null;
        masteryScore: number;
        nextRevisionAt: Date | null;
    }>;
    getRevisionQueue(userId: string, take?: number): Promise<({
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
        id: string;
        updatedAt: Date;
        questionId: string;
        userId: string;
        lastAttemptAt: Date | null;
        weaknessScore: number;
        attemptCount: number;
        correctCount: number;
        wrongCount: number;
        skippedCount: number;
        lastStatus: import("@prisma/client").$Enums.AttemptStatus | null;
        masteryScore: number;
        nextRevisionAt: Date | null;
    })[]>;
    getQuestionStatus(userId: string, questionIdsCsv: string): Promise<{
        questionId: string;
        solved: boolean;
        lastStatus: import("@prisma/client").$Enums.AttemptStatus | null;
        attemptCount: number;
        weaknessScore: number;
        nextRevisionAt: Date | null;
        bookmarked: boolean;
    }[]>;
    logDailyActivity(payload: LogActivityDto): Promise<{
        id: string;
        updatedAt: Date;
        timeSpent: number;
        userId: string;
        correctCount: number;
        skippedCount: number;
        activityDate: Date;
        solvedCount: number;
        activeMinutes: number;
    }>;
    getStreak(userId: string): Promise<{
        userId: string;
        currentStreak: number;
        lastActiveDate: Date;
        trackedDays: number;
    }>;
}
