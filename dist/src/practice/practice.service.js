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
exports.PracticeService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
let PracticeService = class PracticeService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createSession(payload) {
        const take = Math.min(Math.max(payload.take ?? 20, 5), 100);
        const questionIds = await this.selectQuestionIds(payload, take);
        const session = await this.prisma.practiceSession.create({
            data: {
                userId: payload.userId,
                mode: payload.mode,
                config: {
                    ...payload,
                    take,
                    seed: `${payload.userId}:${payload.mode}:${Date.now()}`,
                },
                items: {
                    create: questionIds.map((questionId, index) => ({
                        questionId,
                        sortOrder: index + 1,
                    })),
                },
            },
            include: {
                items: {
                    orderBy: { sortOrder: 'asc' },
                    select: {
                        id: true,
                        questionId: true,
                        sortOrder: true,
                    },
                },
            },
        });
        return session;
    }
    async getNextQuestion(sessionId, userId) {
        const item = await this.prisma.practiceSessionItem.findFirst({
            where: {
                practiceSessionId: sessionId,
                practiceSession: { userId, status: client_1.PracticeSessionStatus.ACTIVE },
                isAnswered: false,
            },
            orderBy: { sortOrder: 'asc' },
            include: {
                question: {
                    select: {
                        id: true,
                        uuid: true,
                        type: true,
                        difficulty: true,
                        language: true,
                        estimatedSeconds: true,
                        currentVersion: {
                            select: {
                                id: true,
                                stem: true,
                                stemLocal: true,
                                options: true,
                            },
                        },
                    },
                },
            },
        });
        return item;
    }
    async answerQuestion(sessionId, payload) {
        const item = await this.prisma.practiceSessionItem.findFirst({
            where: {
                practiceSessionId: sessionId,
                questionId: payload.questionId,
                practiceSession: { userId: payload.userId },
            },
            include: {
                practiceSession: true,
            },
        });
        if (!item) {
            throw new common_1.NotFoundException('Practice session item not found');
        }
        if (item.practiceSession.status !== client_1.PracticeSessionStatus.ACTIVE) {
            throw new common_1.NotFoundException('Practice session is not active');
        }
        const answeredAt = new Date();
        await this.prisma.$transaction([
            this.prisma.practiceSessionItem.update({
                where: { id: item.id },
                data: {
                    isAnswered: true,
                    selectedAnswer: payload.selectedAnswer,
                    resultStatus: payload.status,
                    timeSpent: payload.timeSpent ?? 0,
                    answeredAt,
                },
            }),
            this.prisma.userQuestionState.upsert({
                where: {
                    userId_questionId: {
                        userId: payload.userId,
                        questionId: payload.questionId,
                    },
                },
                update: this.getStateUpdatePayload(payload.status, answeredAt),
                create: {
                    userId: payload.userId,
                    questionId: payload.questionId,
                    ...this.getStateCreatePayload(payload.status, answeredAt),
                },
            }),
        ]);
        return { ok: true };
    }
    async completeSession(sessionId, userId) {
        const session = await this.prisma.practiceSession.updateMany({
            where: {
                id: sessionId,
                userId,
                status: client_1.PracticeSessionStatus.ACTIVE,
            },
            data: {
                status: client_1.PracticeSessionStatus.COMPLETED,
                endedAt: new Date(),
            },
        });
        return { updated: session.count };
    }
    async selectQuestionIds(payload, take) {
        const where = {
            status: client_1.QuestionStatus.PUBLISHED,
            ...(payload.subjectIds?.length
                ? { subjects: { some: { subjectId: { in: payload.subjectIds } } } }
                : {}),
            ...(payload.tagIds?.length
                ? { tags: { some: { tagId: { in: payload.tagIds } } } }
                : {}),
            ...(payload.organizationIds?.length
                ? {
                    organizations: {
                        some: { organizationId: { in: payload.organizationIds } },
                    },
                }
                : {}),
            ...(payload.examSessionIds?.length
                ? {
                    examSessions: {
                        some: { examSessionId: { in: payload.examSessionIds } },
                    },
                }
                : {}),
            ...(payload.difficulty ? { difficulty: payload.difficulty } : {}),
            ...(payload.language ? { language: payload.language } : {}),
        };
        if (payload.mode === client_1.PracticeMode.WEAK_AREA) {
            const weakSubjects = await this.prisma.userSubjectProgress.findMany({
                where: { userId: payload.userId },
                orderBy: { weaknessScore: 'desc' },
                take: 5,
                select: { subjectId: true },
            });
            const weakSubjectIds = weakSubjects.map((row) => row.subjectId);
            if (weakSubjectIds.length) {
                where.subjects = {
                    some: {
                        subjectId: { in: weakSubjectIds },
                    },
                };
            }
        }
        const rows = await this.prisma.question.findMany({
            where,
            take,
            orderBy: payload.mode === client_1.PracticeMode.ADAPTIVE
                ? [{ trendingScore: 'desc' }, { totalAttempts: 'desc' }]
                : [{ createdAt: 'desc' }],
            select: { id: true },
        });
        return rows.map((q) => q.id);
    }
    getStateCreatePayload(status, attemptedAt) {
        return {
            attemptCount: 1,
            correctCount: status === client_1.AttemptStatus.CORRECT ? 1 : 0,
            wrongCount: status === client_1.AttemptStatus.INCORRECT ? 1 : 0,
            skippedCount: status === client_1.AttemptStatus.SKIPPED ? 1 : 0,
            lastStatus: status,
            masteryScore: status === client_1.AttemptStatus.CORRECT ? 1 : 0,
            weaknessScore: status === client_1.AttemptStatus.CORRECT ? 0.1 : 0.7,
            lastAttemptAt: attemptedAt,
            nextRevisionAt: this.getNextRevisionDate(status, attemptedAt),
        };
    }
    getStateUpdatePayload(status, attemptedAt) {
        const isCorrect = status === client_1.AttemptStatus.CORRECT;
        return {
            attemptCount: { increment: 1 },
            correctCount: isCorrect ? { increment: 1 } : undefined,
            wrongCount: status === client_1.AttemptStatus.INCORRECT ? { increment: 1 } : undefined,
            skippedCount: status === client_1.AttemptStatus.SKIPPED ? { increment: 1 } : undefined,
            lastStatus: status,
            lastAttemptAt: attemptedAt,
            nextRevisionAt: this.getNextRevisionDate(status, attemptedAt),
            masteryScore: isCorrect ? { increment: 0.1 } : { decrement: 0.08 },
            weaknessScore: isCorrect ? { decrement: 0.05 } : { increment: 0.1 },
        };
    }
    getNextRevisionDate(status, from) {
        const days = status === client_1.AttemptStatus.CORRECT ? 3 : 1;
        return new Date(from.getTime() + days * 24 * 60 * 60 * 1000);
    }
};
exports.PracticeService = PracticeService;
exports.PracticeService = PracticeService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PracticeService);
//# sourceMappingURL=practice.service.js.map