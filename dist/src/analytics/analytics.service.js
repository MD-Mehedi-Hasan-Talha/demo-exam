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
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
let AnalyticsService = class AnalyticsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async refreshQuestionAnalytics(payload) {
        const take = Math.min(Math.max(payload.take ?? 200, 1), 1000);
        const sourceQuestionIds = payload.questionIds && payload.questionIds.length
            ? payload.questionIds
            : (await this.prisma.question.findMany({
                where: { status: 'PUBLISHED' },
                take,
                orderBy: [{ updatedAt: 'desc' }],
                select: { id: true },
            })).map((row) => row.id);
        for (const questionId of sourceQuestionIds) {
            const [attemptAgg, bookmarkCount] = await Promise.all([
                this.prisma.questionAttempt.aggregate({
                    where: { questionId },
                    _count: { _all: true },
                    _avg: { timeSpent: true },
                }),
                this.prisma.questionBookmark.count({ where: { questionId } }),
            ]);
            const correctCount = await this.prisma.questionAttempt.count({
                where: { questionId, status: client_1.AttemptStatus.CORRECT },
            });
            const totalAttempts = attemptAgg._count._all;
            const accuracyRate = totalAttempts > 0 ? correctCount / totalAttempts : 0;
            const avgTimeSpent = attemptAgg._avg.timeSpent ?? 0;
            const trendingScore = totalAttempts * 0.6 + bookmarkCount * 0.4;
            await this.prisma.$transaction([
                this.prisma.question.update({
                    where: { id: questionId },
                    data: {
                        totalAttempts,
                        totalCorrect: correctCount,
                        totalBookmarks: bookmarkCount,
                        trendingScore,
                    },
                }),
                this.prisma.questionAnalytics.upsert({
                    where: { questionId },
                    update: {
                        totalAttempts,
                        totalCorrect: correctCount,
                        totalBookmarks: bookmarkCount,
                        accuracyRate,
                        avgTimeSpent,
                        trendingScore,
                        difficultyDrift: 0,
                        lastComputedAt: new Date(),
                    },
                    create: {
                        questionId,
                        totalAttempts,
                        totalCorrect: correctCount,
                        totalBookmarks: bookmarkCount,
                        accuracyRate,
                        avgTimeSpent,
                        trendingScore,
                        difficultyDrift: 0,
                    },
                }),
            ]);
        }
        return { updated: sourceQuestionIds.length };
    }
    async mostSolved(limit = 20) {
        return this.prisma.questionAnalytics.findMany({
            orderBy: [{ totalAttempts: 'desc' }, { trendingScore: 'desc' }],
            take: this.clampLimit(limit),
            include: {
                question: {
                    select: {
                        id: true,
                        uuid: true,
                        difficulty: true,
                        type: true,
                        currentVersion: { select: { stem: true, stemLocal: true } },
                    },
                },
            },
        });
    }
    async mostDifficult(limit = 20) {
        const rows = await this.prisma.questionAnalytics.findMany({
            where: { totalAttempts: { gte: 5 } },
            orderBy: [{ accuracyRate: 'asc' }, { avgTimeSpent: 'desc' }],
            take: this.clampLimit(limit),
            include: {
                question: {
                    select: {
                        id: true,
                        uuid: true,
                        difficulty: true,
                        type: true,
                        currentVersion: { select: { stem: true, stemLocal: true } },
                    },
                },
            },
        });
        return rows;
    }
    async trendingTopics(limit = 20) {
        const rows = await this.prisma.questionSubject.groupBy({
            by: ['subjectId'],
            _count: { questionId: true },
            orderBy: { _count: { questionId: 'desc' } },
            take: this.clampLimit(limit),
        });
        const subjects = await this.prisma.subject.findMany({
            where: { id: { in: rows.map((r) => r.subjectId) } },
            select: { id: true, name: true, level: true, slug: true },
        });
        const subjectMap = new Map(subjects.map((s) => [s.id, s]));
        return rows.map((row) => ({
            subjectId: row.subjectId,
            subject: subjectMap.get(row.subjectId) ?? null,
            solvedVolume: row._count.questionId,
        }));
    }
    async weakSubjects(userId, limit = 10) {
        return this.prisma.userSubjectProgress.findMany({
            where: { userId },
            orderBy: [{ weaknessScore: 'desc' }, { accuracy: 'asc' }],
            take: this.clampLimit(limit, 100),
            include: {
                subject: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        level: true,
                    },
                },
            },
        });
    }
    async userPerformanceHeatmap(userId) {
        const attempts = await this.prisma.questionAttempt.findMany({
            where: { userId },
            select: {
                status: true,
                question: {
                    select: {
                        difficulty: true,
                        subjects: {
                            where: { isPrimary: true },
                            select: { subjectId: true },
                            take: 1,
                        },
                    },
                },
            },
            take: 5000,
            orderBy: { createdAt: 'desc' },
        });
        const matrix = new Map();
        for (const attempt of attempts) {
            const subjectId = attempt.question.subjects[0]?.subjectId ?? 'unknown';
            const key = `${subjectId}:${attempt.question.difficulty}`;
            const cell = matrix.get(key) ?? { total: 0, correct: 0 };
            cell.total += 1;
            if (attempt.status === client_1.AttemptStatus.CORRECT)
                cell.correct += 1;
            matrix.set(key, cell);
        }
        const subjectIds = Array.from(new Set(attempts
            .map((a) => a.question.subjects[0]?.subjectId)
            .filter((id) => Boolean(id))));
        const subjects = await this.prisma.subject.findMany({
            where: { id: { in: subjectIds } },
            select: { id: true, name: true, slug: true },
        });
        const subjectMap = new Map(subjects.map((s) => [s.id, s]));
        return Array.from(matrix.entries()).map(([key, value]) => {
            const [subjectId, difficulty] = key.split(':');
            const accuracy = value.total > 0 ? value.correct / value.total : 0;
            return {
                subjectId,
                subject: subjectMap.get(subjectId) ?? null,
                difficulty,
                total: value.total,
                correct: value.correct,
                accuracy,
            };
        });
    }
    async chapterStrength(userId, limit = 50) {
        const rows = await this.prisma.userSubjectProgress.findMany({
            where: {
                userId,
                subject: { level: 'CHAPTER' },
            },
            orderBy: [{ accuracy: 'desc' }, { totalAttempted: 'desc' }],
            take: this.clampLimit(limit, 200),
            include: {
                subject: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                    },
                },
            },
        });
        return rows.map((row) => ({
            chapter: row.subject,
            totalAttempted: row.totalAttempted,
            totalCorrect: row.totalCorrect,
            accuracy: row.accuracy,
            weaknessScore: row.weaknessScore,
            strengthScore: row.accuracy * 0.7 + (1 - row.weaknessScore) * 0.3,
        }));
    }
    clampLimit(limit, max = 50) {
        return Math.min(Math.max(limit, 1), max);
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map