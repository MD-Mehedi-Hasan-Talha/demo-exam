import { Injectable, NotFoundException } from '@nestjs/common';
import { ExamMode, ExamStatus, Prisma, QuestionStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMockExamDto } from './dto/create-mock-exam.dto';
import { StartMockAttemptDto } from './dto/start-mock-attempt.dto';
import { SubmitMockAttemptDto } from './dto/submit-mock-attempt.dto';

@Injectable()
export class MockTestService {
  constructor(private readonly prisma: PrismaService) {}

  async createMockExam(payload: CreateMockExamDto) {
    const exam = await this.prisma.$transaction(async (tx) => {
      const created = await tx.exam.create({
        data: {
          slug: this.buildSlug(payload.title),
          title: payload.title,
          mode: payload.mode ?? ExamMode.MOCK,
          status: ExamStatus.PUBLISHED,
          totalDuration: payload.totalDuration,
          totalMarks: payload.totalMarks,
          passMark: payload.passMark,
          organizationId: payload.organizationId,
          examSessionId: payload.examSessionId,
          shuffleQuestions: payload.shuffleQuestions ?? true,
          createdBy: payload.createdBy,
          rules: {
            create: payload.rules.map((rule) => ({
              subjectId: rule.subjectId,
              tagId: rule.tagId,
              difficulty: rule.difficulty,
              questionType: rule.questionType,
              questionCount: rule.questionCount,
              marks: rule.marks,
              negMarks: rule.negMarks,
              fromPreviousYear: rule.fromPreviousYear ?? false,
            })),
          },
        },
      });

      const examItems: Prisma.ExamItemCreateManyInput[] = [];
      for (const rule of payload.rules) {
        const candidates = await tx.question.findMany({
          where: {
            status: QuestionStatus.PUBLISHED,
            ...(rule.subjectId
              ? { subjects: { some: { subjectId: rule.subjectId } } }
              : {}),
            ...(rule.tagId ? { tags: { some: { tagId: rule.tagId } } } : {}),
            ...(rule.difficulty ? { difficulty: rule.difficulty } : {}),
            ...(rule.questionType ? { type: rule.questionType } : {}),
            ...(rule.fromPreviousYear ? { isPreviousYear: true } : {}),
          },
          take: rule.questionCount,
          orderBy: [{ trendingScore: 'desc' }, { totalAttempts: 'desc' }],
          select: { id: true },
        });

        const baseOrder = examItems.length;
        candidates.forEach((question, index) => {
          examItems.push({
            examId: created.id,
            questionId: question.id,
            sortOrder: baseOrder + index + 1,
            marks: rule.marks ?? 1,
            negMarks: rule.negMarks ?? 0,
          });
        });
      }

      if (examItems.length) {
        await tx.examItem.createMany({ data: examItems });
      }

      return created;
    });

    return this.getMockExamDetails(exam.id);
  }

  async getMockExamDetails(examId: string) {
    const exam = await this.prisma.exam.findUnique({
      where: { id: examId },
      include: {
        rules: true,
        items: {
          orderBy: { sortOrder: 'asc' },
          include: {
            question: {
              select: {
                id: true,
                uuid: true,
                type: true,
                difficulty: true,
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

    if (!exam) throw new NotFoundException('Exam not found');
    return exam;
  }

  async startAttempt(examId: string, payload: StartMockAttemptDto) {
    const exam = await this.prisma.exam.findUnique({ where: { id: examId } });
    if (!exam) throw new NotFoundException('Exam not found');

    const last = await this.prisma.examAttempt.findFirst({
      where: { examId, userId: payload.userId },
      orderBy: { attemptNo: 'desc' },
      select: { attemptNo: true },
    });

    const attempt = await this.prisma.examAttempt.create({
      data: {
        examId,
        userId: payload.userId,
        attemptNo: (last?.attemptNo ?? 0) + 1,
      },
    });

    return attempt;
  }

  async submitAttempt(examId: string, attemptId: string, payload: SubmitMockAttemptDto) {
    const attempt = await this.prisma.examAttempt.findUnique({
      where: { id: attemptId },
      include: { exam: true },
    });

    if (!attempt || attempt.examId !== examId) {
      throw new NotFoundException('Exam attempt not found');
    }

    const examItems = await this.prisma.examItem.findMany({
      where: { examId },
      select: {
        id: true,
        questionId: true,
        marks: true,
        negMarks: true,
      },
    });

    const itemMap = new Map(examItems.map((item) => [item.id, item]));
    let score = 0;
    let totalMarks = 0;
    let totalTime = 0;

    const questionAttempts = payload.answers
      .map((answer) => {
        const item = itemMap.get(answer.examItemId);
        if (!item || item.questionId !== answer.questionId) return null;

        const marks = item.marks ?? 1;
        const negMarks = item.negMarks ?? 0;
        totalMarks += marks;
        totalTime += answer.timeSpent ?? 0;

        if (answer.status === 'CORRECT') score += marks;
        if (answer.status === 'INCORRECT') score -= negMarks;

        return {
          examAttemptId: attemptId,
          examItemId: item.id,
          questionId: item.questionId,
          userId: attempt.userId,
          selectedAnswer: answer.selectedAnswer as Prisma.InputJsonValue,
          status: answer.status,
          marksAwarded: answer.status === 'CORRECT' ? marks : 0,
          timeSpent: answer.timeSpent ?? 0,
        };
      })
      .filter((row): row is NonNullable<typeof row> => Boolean(row));

    await this.prisma.$transaction(async (tx) => {
      if (questionAttempts.length) {
        await tx.questionAttempt.createMany({ data: questionAttempts });
      }

      const percentage = totalMarks > 0 ? (score / totalMarks) * 100 : 0;
      await tx.examAttempt.update({
        where: { id: attemptId },
        data: {
          submittedAt: new Date(),
          isCompleted: true,
          timeSpent: totalTime,
          score,
          totalMarks,
          percentage,
          isPassed: attempt.exam.passMark != null ? score >= attempt.exam.passMark : null,
        },
      });
    });

    const rank = await this.calculateRank(examId, attemptId);
    const updated = await this.prisma.examAttempt.update({
      where: { id: attemptId },
      data: { rank },
    });

    return updated;
  }

  async getLeaderboard(examId: string, take = 50) {
    const leaderboard = await this.prisma.examAttempt.findMany({
      where: {
        examId,
        isCompleted: true,
      },
      orderBy: [{ score: 'desc' }, { timeSpent: 'asc' }, { submittedAt: 'asc' }],
      take: Math.min(Math.max(take, 1), 100),
      select: {
        id: true,
        userId: true,
        attemptNo: true,
        score: true,
        totalMarks: true,
        percentage: true,
        rank: true,
        timeSpent: true,
      },
    });

    return leaderboard;
  }

  private async calculateRank(examId: string, attemptId: string): Promise<number> {
    const current = await this.prisma.examAttempt.findUnique({
      where: { id: attemptId },
      select: { score: true, timeSpent: true, submittedAt: true },
    });
    if (!current) return 0;

    const betterCount = await this.prisma.examAttempt.count({
      where: {
        examId,
        isCompleted: true,
        OR: [
          { score: { gt: current.score ?? 0 } },
          {
            score: current.score ?? 0,
            timeSpent: { lt: current.timeSpent ?? 0 },
          },
          {
            score: current.score ?? 0,
            timeSpent: current.timeSpent ?? 0,
            submittedAt: { lt: current.submittedAt ?? new Date() },
          },
        ],
      },
    });

    return betterCount + 1;
  }

  private buildSlug(title: string): string {
    return `${title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')}-${Date.now()}`;
  }
}
