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
exports.QuestionsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
let QuestionsService = class QuestionsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createQuestion(payload) {
        const normalizedSubjectIds = Array.from(new Set(payload.subjectIds ?? []));
        const normalizedTagIds = Array.from(new Set(payload.tagIds ?? []));
        const normalizedOrganizationIds = Array.from(new Set(payload.organizationIds ?? []));
        const normalizedExamSessionIds = Array.from(new Set(payload.examSessionIds ?? []));
        const primarySubjectId = payload.primarySubjectId ?? normalizedSubjectIds[0];
        return this.prisma.$transaction(async (tx) => {
            const question = await tx.question.create({
                data: {
                    type: payload.type,
                    difficulty: payload.difficulty,
                    language: payload.language ?? client_1.Language.ENGLISH,
                    status: client_1.QuestionStatus.PUBLISHED,
                    defaultMarks: payload.defaultMarks ?? 1,
                    defaultNegMarks: payload.defaultNegMarks ?? 0,
                    estimatedSeconds: payload.estimatedSeconds,
                    isPreviousYear: payload.isPreviousYear ?? false,
                    isModelTest: payload.isModelTest ?? false,
                    isVerified: payload.isVerified ?? false,
                    createdBy: payload.createdBy,
                },
            });
            const version = await tx.questionVersion.create({
                data: {
                    questionId: question.id,
                    versionNumber: 1,
                    isActive: true,
                    stem: payload.stem,
                    stemLocal: payload.stemLocal,
                    explanation: payload.explanation,
                    explanationLocal: payload.explanationLocal,
                    options: payload.options,
                    answer: payload.answer,
                    createdBy: payload.createdBy,
                },
            });
            await tx.question.update({
                where: { id: question.id },
                data: { currentVersionId: version.id },
            });
            if (normalizedSubjectIds.length) {
                const existingSubjects = await tx.subject.findMany({
                    where: { id: { in: normalizedSubjectIds } },
                    select: { id: true },
                });
                const existingSubjectIds = new Set(existingSubjects.map((s) => s.id));
                const missingIds = normalizedSubjectIds.filter((id) => !existingSubjectIds.has(id));
                if (missingIds.length) {
                    throw new common_1.BadRequestException(`The following subjectIds do not exist: ${missingIds.join(', ')}`);
                }
                await tx.questionSubject.createMany({
                    data: normalizedSubjectIds.map((subjectId) => ({
                        questionId: question.id,
                        subjectId,
                        isPrimary: subjectId === primarySubjectId,
                    })),
                });
            }
            if (normalizedTagIds.length) {
                await tx.questionTag.createMany({
                    data: normalizedTagIds.map((tagId) => ({
                        questionId: question.id,
                        tagId,
                    })),
                });
            }
            if (normalizedOrganizationIds.length) {
                await tx.questionOrganization.createMany({
                    data: normalizedOrganizationIds.map((organizationId) => ({
                        questionId: question.id,
                        organizationId,
                    })),
                });
            }
            if (normalizedExamSessionIds.length) {
                await tx.questionExamSession.createMany({
                    data: normalizedExamSessionIds.map((examSessionId) => ({
                        questionId: question.id,
                        examSessionId,
                    })),
                });
            }
            return tx.question.findUnique({
                where: { id: question.id },
                include: {
                    currentVersion: {
                        select: {
                            stem: true,
                            stemLocal: true,
                            explanation: true,
                            options: true,
                            answer: true,
                        },
                    },
                    subjects: true,
                    tags: true,
                    organizations: true,
                    examSessions: true,
                },
            });
        });
    }
    async filterQuestions(query) {
        const take = this.parseTake(query.take);
        const userId = query.userId;
        const where = {
            status: client_1.QuestionStatus.PUBLISHED,
            ...(query.difficulty ? { difficulty: query.difficulty } : {}),
            ...(query.type ? { type: query.type } : {}),
            ...(query.language ? { language: query.language } : {}),
            ...(query.isPreviousYear
                ? { isPreviousYear: query.isPreviousYear === 'true' }
                : {}),
            ...(query.isModelTest ? { isModelTest: query.isModelTest === 'true' } : {}),
            ...(this.asList(query.subjectIds).length
                ? {
                    subjects: {
                        some: { subjectId: { in: this.asList(query.subjectIds) } },
                    },
                }
                : {}),
            ...(this.asList(query.tagIds).length
                ? { tags: { some: { tagId: { in: this.asList(query.tagIds) } } } }
                : {}),
            ...(this.asList(query.organizationIds).length
                ? {
                    organizations: {
                        some: { organizationId: { in: this.asList(query.organizationIds) } },
                    },
                }
                : {}),
            ...(this.asList(query.examSessionIds).length
                ? {
                    examSessions: {
                        some: { examSessionId: { in: this.asList(query.examSessionIds) } },
                    },
                }
                : {}),
            ...(query.bookmarked && userId
                ? {
                    bookmarks: query.bookmarked === 'true'
                        ? { some: { userId } }
                        : { none: { userId } },
                }
                : {}),
            ...(query.solved && userId
                ? {
                    attempts: query.solved === 'true'
                        ? { some: { userId } }
                        : { none: { userId } },
                }
                : {}),
        };
        const questions = await this.prisma.question.findMany({
            where,
            take,
            ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
            orderBy: { id: 'asc' },
            select: {
                id: true,
                uuid: true,
                difficulty: true,
                type: true,
                language: true,
                totalAttempts: true,
                totalCorrect: true,
                totalBookmarks: true,
                trendingScore: true,
                currentVersion: {
                    select: {
                        stem: true,
                        stemLocal: true,
                    },
                },
            },
        });
        const items = query.random === 'true'
            ? this.seededShuffle(questions, query.seed ?? 'default')
            : questions;
        const nextCursor = items.length === take ? items[items.length - 1].id : null;
        return {
            items,
            pageInfo: {
                take,
                nextCursor,
            },
            appliedFilters: this.buildAppliedFilters(query),
        };
    }
    parseTake(take) {
        const parsed = Number(take ?? '20');
        if (!Number.isFinite(parsed) || parsed <= 0)
            return 20;
        return Math.min(parsed, 100);
    }
    asList(csv) {
        if (!csv)
            return [];
        return csv
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean);
    }
    seededShuffle(items, seed) {
        const out = [...items];
        let hash = this.hashString(seed);
        for (let i = out.length - 1; i > 0; i -= 1) {
            hash = (hash * 1664525 + 1013904223) >>> 0;
            const j = hash % (i + 1);
            [out[i], out[j]] = [out[j], out[i]];
        }
        return out;
    }
    hashString(value) {
        let hash = 2166136261;
        for (let i = 0; i < value.length; i += 1) {
            hash ^= value.charCodeAt(i);
            hash = Math.imul(hash, 16777619);
        }
        return hash >>> 0;
    }
    buildAppliedFilters(query) {
        return {
            subjectIds: this.asList(query.subjectIds),
            tagIds: this.asList(query.tagIds),
            organizationIds: this.asList(query.organizationIds),
            examSessionIds: this.asList(query.examSessionIds),
            difficulty: query.difficulty ?? null,
            type: query.type ?? null,
            language: query.language ?? null,
            solved: query.solved ?? null,
            bookmarked: query.bookmarked ?? null,
            isPreviousYear: query.isPreviousYear ?? null,
            isModelTest: query.isModelTest ?? null,
            random: query.random ?? 'false',
        };
    }
};
exports.QuestionsService = QuestionsService;
exports.QuestionsService = QuestionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], QuestionsService);
//# sourceMappingURL=questions.service.js.map