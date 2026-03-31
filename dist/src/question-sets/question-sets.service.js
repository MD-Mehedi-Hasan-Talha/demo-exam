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
exports.QuestionSetsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
let QuestionSetsService = class QuestionSetsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createSet(payload) {
        const validatedQuestionIds = await this.validateQuestionIds(payload.questionIds);
        const created = await this.prisma.practiceSet.create({
            data: {
                slug: this.buildSlug(payload.title),
                title: payload.title,
                description: payload.description,
                type: payload.type,
                createdBy: payload.createdBy,
                visibility: payload.visibility ?? client_1.PracticeSetVisibility.PRIVATE,
                isPublic: (payload.visibility ?? client_1.PracticeSetVisibility.PRIVATE) === 'PUBLIC',
                totalMarks: payload.totalMarks,
                timeLimit: payload.timeLimit,
                estimatedDifficulty: payload.estimatedDifficulty,
                sourceFilterSnapshot: payload.sourceFilterSnapshot,
                workflowStatus: client_1.PracticeSetWorkflowStatus.DRAFT,
                items: validatedQuestionIds.length
                    ? {
                        create: validatedQuestionIds.map((questionId, index) => ({
                            questionId,
                            sortOrder: index + 1,
                        })),
                    }
                    : undefined,
            },
        });
        return this.getSetDetails(created.id);
    }
    async generateSet(payload) {
        const take = Math.min(Math.max(payload.take, 5), 200);
        const where = {
            status: client_1.QuestionStatus.PUBLISHED,
            ...(payload.subjectIds?.length
                ? { subjects: { some: { subjectId: { in: payload.subjectIds } } } }
                : {}),
            ...(payload.tagIds?.length
                ? { tags: { some: { tagId: { in: payload.tagIds } } } }
                : {}),
            ...(payload.examSessionIds?.length
                ? { examSessions: { some: { examSessionId: { in: payload.examSessionIds } } } }
                : {}),
            ...(payload.organizationIds?.length
                ? {
                    organizations: {
                        some: { organizationId: { in: payload.organizationIds } },
                    },
                }
                : {}),
            ...(payload.difficulty ? { difficulty: payload.difficulty } : {}),
            ...(payload.questionType ? { type: payload.questionType } : {}),
            ...(payload.language ? { language: payload.language } : {}),
            ...(payload.isPreviousYear != null
                ? { isPreviousYear: payload.isPreviousYear }
                : {}),
        };
        const questions = await this.prisma.question.findMany({
            where,
            take,
            orderBy: [{ trendingScore: 'desc' }, { totalAttempts: 'desc' }, { id: 'asc' }],
            select: { id: true, difficulty: true },
        });
        const difficultyCount = questions.reduce((acc, row) => ({ ...acc, [row.difficulty]: (acc[row.difficulty] ?? 0) + 1 }), {});
        const created = await this.prisma.practiceSet.create({
            data: {
                slug: this.buildSlug(payload.title),
                title: payload.title,
                type: payload.type,
                createdBy: payload.createdBy,
                visibility: client_1.PracticeSetVisibility.PRIVATE,
                isPublic: false,
                workflowStatus: client_1.PracticeSetWorkflowStatus.DRAFT,
                sourceFilterSnapshot: payload,
                metadata: {
                    generatedBy: 'rule-engine-v1',
                    generatedAt: new Date().toISOString(),
                    difficultyCount,
                },
                items: {
                    create: questions.map((q, index) => ({
                        questionId: q.id,
                        sortOrder: index + 1,
                    })),
                },
            },
        });
        return this.getSetDetails(created.id);
    }
    async addItems(practiceSetId, payload) {
        const validatedQuestionIds = await this.validateQuestionIds(payload.questionIds);
        const existing = await this.prisma.practiceSetItem.findMany({
            where: { practiceSetId },
            select: { questionId: true, sortOrder: true },
            orderBy: { sortOrder: 'desc' },
            take: 1,
        });
        const maxSort = existing[0]?.sortOrder ?? 0;
        const existingIds = new Set((await this.prisma.practiceSetItem.findMany({
            where: { practiceSetId },
            select: { questionId: true },
        })).map((row) => row.questionId));
        const toInsert = validatedQuestionIds
            .filter((id) => !existingIds.has(id))
            .map((questionId, index) => ({
            practiceSetId,
            questionId,
            sortOrder: maxSort + index + 1,
            marks: payload.marks,
            negMarks: payload.negMarks,
        }));
        if (toInsert.length) {
            await this.prisma.practiceSetItem.createMany({ data: toInsert });
        }
        return this.getSetDetails(practiceSetId);
    }
    async updateWorkflow(practiceSetId, payload) {
        return this.prisma.practiceSet.update({
            where: { id: practiceSetId },
            data: {
                workflowStatus: payload.workflowStatus,
                reviewedBy: payload.reviewedBy,
                publishedAt: payload.workflowStatus === client_1.PracticeSetWorkflowStatus.PUBLISHED
                    ? new Date()
                    : null,
                isPublic: payload.workflowStatus === client_1.PracticeSetWorkflowStatus.PUBLISHED,
                visibility: payload.workflowStatus === client_1.PracticeSetWorkflowStatus.PUBLISHED
                    ? client_1.PracticeSetVisibility.PUBLIC
                    : undefined,
            },
        });
    }
    async listSets(params) {
        return this.prisma.practiceSet.findMany({
            where: {
                ...(params.createdBy ? { createdBy: params.createdBy } : {}),
                ...(params.type ? { type: params.type } : {}),
                ...(params.visibility ? { visibility: params.visibility } : {}),
                ...(params.workflowStatus ? { workflowStatus: params.workflowStatus } : {}),
            },
            orderBy: [{ updatedAt: 'desc' }],
            take: Math.min(Math.max(params.take ?? 50, 1), 100),
            include: {
                _count: {
                    select: { items: true },
                },
            },
        });
    }
    async getSetDetails(id) {
        const set = await this.prisma.practiceSet.findUnique({
            where: { id },
            include: {
                items: {
                    orderBy: { sortOrder: 'asc' },
                    include: {
                        question: {
                            select: {
                                id: true,
                                uuid: true,
                                difficulty: true,
                                type: true,
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
                },
            },
        });
        if (!set)
            throw new common_1.NotFoundException('Practice set not found');
        return set;
    }
    buildSlug(title) {
        return `${title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')}-${Date.now()}`;
    }
    async validateQuestionIds(questionIds) {
        if (!questionIds?.length)
            return [];
        const uniqueQuestionIds = Array.from(new Set(questionIds));
        const existingRows = await this.prisma.question.findMany({
            where: { id: { in: uniqueQuestionIds } },
            select: { id: true },
        });
        const existingIds = new Set(existingRows.map((row) => row.id));
        const invalidIds = uniqueQuestionIds.filter((id) => !existingIds.has(id));
        if (invalidIds.length) {
            throw new common_1.BadRequestException({
                message: 'Some questionIds are invalid',
                invalidQuestionIds: invalidIds,
            });
        }
        return uniqueQuestionIds;
    }
};
exports.QuestionSetsService = QuestionSetsService;
exports.QuestionSetsService = QuestionSetsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], QuestionSetsService);
//# sourceMappingURL=question-sets.service.js.map