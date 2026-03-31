import { Injectable } from '@nestjs/common';
import { BookmarkReason } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { LogActivityDto } from './dto/log-activity.dto';
import { MarkWeakQuestionDto } from './dto/mark-weak-question.dto';
import { UpsertBookmarkDto } from './dto/upsert-bookmark.dto';

@Injectable()
export class ProgressService {
  constructor(private readonly prisma: PrismaService) {}

  async upsertBookmark(payload: UpsertBookmarkDto) {
    const bookmark = await this.prisma.questionBookmark.upsert({
      where: {
        userId_questionId: {
          userId: payload.userId,
          questionId: payload.questionId,
        },
      },
      update: {
        reason: payload.reason ?? BookmarkReason.REVISIT,
        note: payload.note,
        tags: payload.tags ?? [],
      },
      create: {
        userId: payload.userId,
        questionId: payload.questionId,
        reason: payload.reason ?? BookmarkReason.REVISIT,
        note: payload.note,
        tags: payload.tags ?? [],
      },
    });

    await this.refreshQuestionBookmarkCount(payload.questionId);
    return bookmark;
  }

  async removeBookmark(userId: string, questionId: string) {
    const deleted = await this.prisma.questionBookmark.deleteMany({
      where: { userId, questionId },
    });
    await this.refreshQuestionBookmarkCount(questionId);
    return { deleted: deleted.count };
  }

  async getBookmarks(userId: string, take = 50) {
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

  async markWeakQuestion(payload: MarkWeakQuestionDto) {
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

  async getRevisionQueue(userId: string, take = 20) {
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

  async getQuestionStatus(userId: string, questionIds: string[]) {
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

  async logDailyActivity(payload: LogActivityDto) {
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

  async getStreak(userId: string) {
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

  private startOfDay(input: Date): Date {
    return new Date(Date.UTC(input.getUTCFullYear(), input.getUTCMonth(), input.getUTCDate()));
  }

  private async refreshQuestionBookmarkCount(questionId: string) {
    const total = await this.prisma.questionBookmark.count({
      where: { questionId },
    });
    await this.prisma.question.update({
      where: { id: questionId },
      data: { totalBookmarks: total },
    });
  }
}
