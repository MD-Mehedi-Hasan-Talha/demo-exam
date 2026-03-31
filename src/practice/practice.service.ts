import { Injectable, NotFoundException } from '@nestjs/common';
import {
  AttemptStatus,
  PracticeMode,
  PracticeSessionStatus,
  Prisma,
  QuestionStatus,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AnswerPracticeItemDto } from './dto/answer-practice-item.dto';
import { CreatePracticeSessionDto } from './dto/create-practice-session.dto';

@Injectable()
export class PracticeService {
  constructor(private readonly prisma: PrismaService) {}

  async createSession(payload: CreatePracticeSessionDto) {
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

  async getNextQuestion(sessionId: string, userId: string) {
    const item = await this.prisma.practiceSessionItem.findFirst({
      where: {
        practiceSessionId: sessionId,
        practiceSession: { userId, status: PracticeSessionStatus.ACTIVE },
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

  async answerQuestion(sessionId: string, payload: AnswerPracticeItemDto) {
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
      throw new NotFoundException('Practice session item not found');
    }

    if (item.practiceSession.status !== PracticeSessionStatus.ACTIVE) {
      throw new NotFoundException('Practice session is not active');
    }

    const answeredAt = new Date();
    await this.prisma.$transaction([
      this.prisma.practiceSessionItem.update({
        where: { id: item.id },
        data: {
          isAnswered: true,
          selectedAnswer: payload.selectedAnswer as Prisma.InputJsonValue,
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

  async completeSession(sessionId: string, userId: string) {
    const session = await this.prisma.practiceSession.updateMany({
      where: {
        id: sessionId,
        userId,
        status: PracticeSessionStatus.ACTIVE,
      },
      data: {
        status: PracticeSessionStatus.COMPLETED,
        endedAt: new Date(),
      },
    });

    return { updated: session.count };
  }

  private async selectQuestionIds(
    payload: CreatePracticeSessionDto,
    take: number,
  ): Promise<string[]> {
    const where: Prisma.QuestionWhereInput = {
      status: QuestionStatus.PUBLISHED,
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
      ...(payload.difficulty ? { difficulty: payload.difficulty as never } : {}),
      ...(payload.language ? { language: payload.language as never } : {}),
    };

    if (payload.mode === PracticeMode.WEAK_AREA) {
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
      orderBy:
        payload.mode === PracticeMode.ADAPTIVE
          ? [{ trendingScore: 'desc' }, { totalAttempts: 'desc' }]
          : [{ createdAt: 'desc' }],
      select: { id: true },
    });

    return rows.map((q) => q.id);
  }

  private getStateCreatePayload(status: AttemptStatus, attemptedAt: Date) {
    return {
      attemptCount: 1,
      correctCount: status === AttemptStatus.CORRECT ? 1 : 0,
      wrongCount: status === AttemptStatus.INCORRECT ? 1 : 0,
      skippedCount: status === AttemptStatus.SKIPPED ? 1 : 0,
      lastStatus: status,
      masteryScore: status === AttemptStatus.CORRECT ? 1 : 0,
      weaknessScore: status === AttemptStatus.CORRECT ? 0.1 : 0.7,
      lastAttemptAt: attemptedAt,
      nextRevisionAt: this.getNextRevisionDate(status, attemptedAt),
    };
  }

  private getStateUpdatePayload(status: AttemptStatus, attemptedAt: Date) {
    const isCorrect = status === AttemptStatus.CORRECT;
    return {
      attemptCount: { increment: 1 },
      correctCount: isCorrect ? { increment: 1 } : undefined,
      wrongCount: status === AttemptStatus.INCORRECT ? { increment: 1 } : undefined,
      skippedCount: status === AttemptStatus.SKIPPED ? { increment: 1 } : undefined,
      lastStatus: status,
      lastAttemptAt: attemptedAt,
      nextRevisionAt: this.getNextRevisionDate(status, attemptedAt),
      masteryScore: isCorrect ? { increment: 0.1 } : { decrement: 0.08 },
      weaknessScore: isCorrect ? { decrement: 0.05 } : { increment: 0.1 },
    };
  }

  private getNextRevisionDate(status: AttemptStatus, from: Date): Date {
    const days = status === AttemptStatus.CORRECT ? 3 : 1;
    return new Date(from.getTime() + days * 24 * 60 * 60 * 1000);
  }
}
