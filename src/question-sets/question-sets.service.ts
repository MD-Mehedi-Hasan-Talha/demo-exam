import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import {
  PracticeSetVisibility,
  PracticeSetWorkflowStatus,
  Prisma,
  QuestionStatus,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AddPracticeSetItemsDto } from './dto/add-practice-set-items.dto';
import { CreatePracticeSetDto } from './dto/create-practice-set.dto';
import { GeneratePracticeSetDto } from './dto/generate-practice-set.dto';
import { UpdatePracticeSetWorkflowDto } from './dto/update-practice-set-workflow.dto';

@Injectable()
export class QuestionSetsService {
  constructor(private readonly prisma: PrismaService) {}

  async createSet(payload: CreatePracticeSetDto) {
    const validatedQuestionIds = await this.validateQuestionIds(payload.questionIds);

    const created = await this.prisma.practiceSet.create({
      data: {
        slug: this.buildSlug(payload.title),
        title: payload.title,
        description: payload.description,
        type: payload.type,
        createdBy: payload.createdBy,
        visibility: payload.visibility ?? PracticeSetVisibility.PRIVATE,
        isPublic: (payload.visibility ?? PracticeSetVisibility.PRIVATE) === 'PUBLIC',
        totalMarks: payload.totalMarks,
        timeLimit: payload.timeLimit,
        estimatedDifficulty: payload.estimatedDifficulty,
        sourceFilterSnapshot: payload.sourceFilterSnapshot as Prisma.InputJsonValue,
        workflowStatus: PracticeSetWorkflowStatus.DRAFT,
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

  async generateSet(payload: GeneratePracticeSetDto) {
    const take = Math.min(Math.max(payload.take, 5), 200);
    const where: Prisma.QuestionWhereInput = {
      status: QuestionStatus.PUBLISHED,
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

    const difficultyCount = questions.reduce(
      (acc, row) => ({ ...acc, [row.difficulty]: (acc[row.difficulty] ?? 0) + 1 }),
      {} as Record<string, number>,
    );

    const created = await this.prisma.practiceSet.create({
      data: {
        slug: this.buildSlug(payload.title),
        title: payload.title,
        type: payload.type,
        createdBy: payload.createdBy,
        visibility: PracticeSetVisibility.PRIVATE,
        isPublic: false,
        workflowStatus: PracticeSetWorkflowStatus.DRAFT,
        sourceFilterSnapshot: payload as unknown as Prisma.InputJsonValue,
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

  async addItems(practiceSetId: string, payload: AddPracticeSetItemsDto) {
    const validatedQuestionIds = await this.validateQuestionIds(payload.questionIds);

    const existing = await this.prisma.practiceSetItem.findMany({
      where: { practiceSetId },
      select: { questionId: true, sortOrder: true },
      orderBy: { sortOrder: 'desc' },
      take: 1,
    });
    const maxSort = existing[0]?.sortOrder ?? 0;
    const existingIds = new Set(
      (
        await this.prisma.practiceSetItem.findMany({
          where: { practiceSetId },
          select: { questionId: true },
        })
      ).map((row) => row.questionId),
    );

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

  async updateWorkflow(
    practiceSetId: string,
    payload: UpdatePracticeSetWorkflowDto,
  ) {
    return this.prisma.practiceSet.update({
      where: { id: practiceSetId },
      data: {
        workflowStatus: payload.workflowStatus,
        reviewedBy: payload.reviewedBy,
        publishedAt:
          payload.workflowStatus === PracticeSetWorkflowStatus.PUBLISHED
            ? new Date()
            : null,
        isPublic: payload.workflowStatus === PracticeSetWorkflowStatus.PUBLISHED,
        visibility:
          payload.workflowStatus === PracticeSetWorkflowStatus.PUBLISHED
            ? PracticeSetVisibility.PUBLIC
            : undefined,
      },
    });
  }

  async listSets(params: {
    createdBy?: string;
    type?: string;
    visibility?: PracticeSetVisibility;
    workflowStatus?: PracticeSetWorkflowStatus;
    take?: number;
  }) {
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

  async getSetDetails(id: string) {
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
    if (!set) throw new NotFoundException('Practice set not found');
    return set;
  }

  private buildSlug(title: string): string {
    return `${title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')}-${Date.now()}`;
  }

  private async validateQuestionIds(questionIds?: string[]): Promise<string[]> {
    if (!questionIds?.length) return [];

    const uniqueQuestionIds = Array.from(new Set(questionIds));
    const existingRows = await this.prisma.question.findMany({
      where: { id: { in: uniqueQuestionIds } },
      select: { id: true },
    });
    const existingIds = new Set(existingRows.map((row) => row.id));
    const invalidIds = uniqueQuestionIds.filter((id) => !existingIds.has(id));

    if (invalidIds.length) {
      throw new BadRequestException({
        message: 'Some questionIds are invalid',
        invalidQuestionIds: invalidIds,
      });
    }

    return uniqueQuestionIds;
  }
}
