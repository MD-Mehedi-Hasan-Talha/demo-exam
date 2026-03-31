"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgressService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
let ProgressService = class ProgressService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async upsertBookmark(payload) {
        const bookmark = await this.prisma.questionBookmark.upsert({
            where: {
                userId_questionId: {
                    userId: payload.userId,
                    questionId: payload.questionId,
                },
            },
            update: {
                reason: payload.reason ?? client_1.BookmarkReason.REVISIT,
                note: payload.note,
                tags: payload.tags ?? [],
            },
            create: {
                userId: payload.userId,
                questionId: payload.questionId,
                reason: payload.reason ?? client_1.BookmarkReason.REVISIT,
                note: payload.note,
                tags: payload.tags ?? [],
            },
        });
        await this.refreshQuestionBookmarkCount(payload.questionId);
        return bookmark;
    }
    async removeBookmark(userId, questionId) {
        const deleted = await this.prisma.questionBookmark.deleteMany({
            where: { userId, questionId },
        });
        await this.refreshQuestionBookmarkCount(questionId);
        return { deleted: deleted.count };
    }
    async getBookmarks(userId, take = 50) {
        return this.prisma.questionBookmark.findMany({
            where: { userId },
            take: Math.min(Math.max(take, 1), 100),
            orderBy: { createdAt: 'desc' },
            include: {
                question: {
                    select: {
                        id: true,
                        uuid: true,
                        type: true,
                        difficulty: true,
                        language: true,
                        currentVersion: {
                            select: {
                                stem: true,
                                stemLocal: true,
                            },
                        },
                    },
                },
            },
        });
    }
    async markWeakQuestion(payload) {
        const now = new Date();
        const nextRevisionAt = payload.weak
            ? new Date(now.getTime() + (payload.nextRevisionDays ?? 1) * 24 * 60 * 60 * 1000)
            : null;
        return this.prisma.userQuestionState.upsert({
            where: {
                userId_questionId: {
                    userId: payload.userId,
                    questionId: payload.questionId,
                },
            },
            update: {
                weaknessScore: payload.weak ? 0.95 : 0.1,
                nextRevisionAt,
                lastAttemptAt: now,
            },
            create: {
                userId: payload.userId,
                questionId: payload.questionId,
                weaknessScore: payload.weak ? 0.95 : 0.1,
                nextRevisionAt,
                lastAttemptAt: now,
            },
        });
    }
    async getRevisionQueue(userId, take = 20) {
        return this.prisma.userQuestionState.findMany({
            where: {
                userId,
                nextRevisionAt: { lte: new Date() },
            },
            orderBy: [{ weaknessScore: 'desc' }, { nextRevisionAt: 'asc' }],
            take: Math.min(Math.max(take, 1), 100),
            include: {
                question: {
                    select: {
                        id: true,
                        uuid: true,
                        difficulty: true,
                        type: true,
                        currentVersion: {
                            select: {
                                stem: true,
                                stemLocal: true,
                            },
                        },
                    },
                },
            },
        });
    }
    async getQuestionStatus(userId, questionIds) {
        const states = await this.prisma.userQuestionState.findMany({
            where: {
                userId,
                questionId: { in: questionIds },
            },
            select: {
                questionId: true,
                lastStatus: true,
                attemptCount: true,
                weaknessScore: true,
                nextRevisionAt: true,
            },
        });
        const bookmarks = await this.prisma.questionBookmark.findMany({
            where: {
                userId,
                questionId: { in: questionIds },
            },
            select: {
                questionId: true,
            },
        });
        const bookmarkedSet = new Set(bookmarks.map((b) => b.questionId));
        return questionIds.map((questionId) => {
            const state = states.find((row) => row.questionId === questionId);
            return {
                questionId,
                solved: state ? state.attemptCount > 0 : false,
                lastStatus: state?.lastStatus ?? null,
                attemptCount: state?.attemptCount ?? 0,
                weaknessScore: state?.weaknessScore ?? 0,
                nextRevisionAt: state?.nextRevisionAt ?? null,
                bookmarked: bookmarkedSet.has(questionId),
            };
        });
    }
    async logDailyActivity(payload) {
        const date = this.startOfDay(new Date());
        return this.prisma.userDailyActivity.upsert({
            where: {
                userId_activityDate: {
                    userId: payload.userId,
                    activityDate: date,
                },
            },
            update: {
                solvedCount: { increment: payload.solvedCount ?? 0 },
                correctCount: { increment: payload.correctCount ?? 0 },
                skippedCount: { increment: payload.skippedCount ?? 0 },
                timeSpent: { increment: payload.timeSpent ?? 0 },
                activeMinutes: { increment: payload.activeMinutes ?? 0 },
            },
            create: {
                userId: payload.userId,
                activityDate: date,
                solvedCount: payload.solvedCount ?? 0,
                correctCount: payload.correctCount ?? 0,
                skippedCount: payload.skippedCount ?? 0,
                timeSpent: payload.timeSpent ?? 0,
                activeMinutes: payload.activeMinutes ?? 0,
            },
        });
    }
    async getStreak(userId) {
        const rows = await this.prisma.userDailyActivity.findMany({
            where: { userId },
            orderBy: { activityDate: 'desc' },
            take: 400,
            select: { activityDate: true, solvedCount: true },
        });
        const activeDays = rows
            .filter((row) => row.solvedCount > 0)
            .map((row) => this.startOfDay(row.activityDate).getTime());
        const activeSet = new Set(activeDays);
        let streak = 0;
        let cursor = this.startOfDay(new Date());
        while (activeSet.has(cursor.getTime())) {
            streak += 1;
            cursor = new Date(cursor.getTime() - 24 * 60 * 60 * 1000);
        }
        return {
            userId,
            currentStreak: streak,
            lastActiveDate: rows[0]?.activityDate ?? null,
            trackedDays: rows.length,
        };
    }
    startOfDay(input) {
        return new Date(Date.UTC(input.getUTCFullYear(), input.getUTCMonth(), input.getUTCDate()));
    }
    async refreshQuestionBookmarkCount(questionId) {
        const total = await this.prisma.questionBookmark.count({
            where: { questionId },
        });
        await this.prisma.question.update({
            where: { id: questionId },
            data: { totalBookmarks: total },
        });
    }
};
exports.ProgressService = ProgressService;
exports.ProgressService = ProgressService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProgressService);
//# sourceMappingURL=progress.service.js.map