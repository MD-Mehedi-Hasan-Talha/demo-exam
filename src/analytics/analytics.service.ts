import { Injectable } from '@nestjs/common';
import { AttemptStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RefreshQuestionAnalyticsDto } from './dto/refresh-question-analytics.dto';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async refreshQuestionAnalytics(payload: RefreshQuestionAnalyticsDto) {
    const take = Math.min(Math.max(payload.take ?? 200, 1), 1000);
    const sourceQuestionIds =
      payload.questionIds && payload.questionIds.length
        ? payload.questionIds
        : (
            await this.prisma.question.findMany({
              where: { status: 'PUBLISHED' },
              take,
              orderBy: [{ updatedAt: 'desc' }],
              select: { id: true },
            })
          ).map((row) => row.id);

    const uniqueQuestionIds = Array.from(new Set(sourceQuestionIds));
    const existingRows = await this.prisma.question.findMany({
      where: { id: { in: uniqueQuestionIds } },
      select: { id: true },
    });
    const existingIds = new Set(existingRows.map((row) => row.id));
    const validQuestionIds = uniqueQuestionIds.filter((id) => existingIds.has(id));
    const skippedQuestionIds = uniqueQuestionIds.filter((id) => !existingIds.has(id));

    for (const questionId of validQuestionIds) {
      const [attemptAgg, bookmarkCount] = await Promise.all([
        this.prisma.questionAttempt.aggregate({
          where: { questionId },
          _count: { _all: true },
          _avg: { timeSpent: true },
        }),
        this.prisma.questionBookmark.count({ where: { questionId } }),
      ]);

      const correctCount = await this.prisma.questionAttempt.count({
        where: { questionId, status: AttemptStatus.CORRECT },
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

    return {
      updated: validQuestionIds.length,
      skipped: skippedQuestionIds.length,
      skippedQuestionIds,
    };
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

  async weakSubjects(userId: string, limit = 10) {
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

  async userPerformanceHeatmap(userId: string) {
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

    const matrix = new Map<string, { total: number; correct: number }>();
    for (const attempt of attempts) {
      const subjectId = attempt.question.subjects[0]?.subjectId ?? 'unknown';
      const key = `${subjectId}:${attempt.question.difficulty}`;
      const cell = matrix.get(key) ?? { total: 0, correct: 0 };
      cell.total += 1;
      if (attempt.status === AttemptStatus.CORRECT) cell.correct += 1;
      matrix.set(key, cell);
    }

    const subjectIds = Array.from(
      new Set(
        attempts
          .map((a) => a.question.subjects[0]?.subjectId)
          .filter((id): id is string => Boolean(id)),
      ),
    );
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

  async chapterStrength(userId: string, limit = 50) {
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

  private clampLimit(limit: number, max = 50): number {
    return Math.min(Math.max(limit, 1), max);
  }
}
