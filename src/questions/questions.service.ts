import { Injectable } from '@nestjs/common';
import {
  DifficultyLevel,
  Language,
  Prisma,
  QuestionStatus,
  QuestionType,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { FilterQuestionsQueryDto } from './dto/filter-questions-query.dto';

type QuestionCard = {
  id: string;
  uuid: string;
  difficulty: DifficultyLevel;
  type: QuestionType;
  language: Language;
  totalAttempts: number;
  totalCorrect: number;
  totalBookmarks: number;
  trendingScore: number;
  currentVersion: {
    stem: string;
    stemLocal: string | null;
  } | null;
};

@Injectable()
export class QuestionsService {
  constructor(private readonly prisma: PrismaService) {}

  async filterQuestions(query: FilterQuestionsQueryDto) {
    const take = this.parseTake(query.take);
    const userId = query.userId;
    const where: Prisma.QuestionWhereInput = {
      status: QuestionStatus.PUBLISHED,
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
            bookmarks:
              query.bookmarked === 'true'
                ? { some: { userId } }
                : { none: { userId } },
          }
        : {}),
      ...(query.solved && userId
        ? {
            attempts:
              query.solved === 'true'
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

  private parseTake(take?: string): number {
    const parsed = Number(take ?? '20');
    if (!Number.isFinite(parsed) || parsed <= 0) return 20;
    return Math.min(parsed, 100);
  }

  private asList(csv?: string): string[] {
    if (!csv) return [];
    return csv
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  private seededShuffle(items: QuestionCard[], seed: string): QuestionCard[] {
    const out = [...items];
    let hash = this.hashString(seed);
    for (let i = out.length - 1; i > 0; i -= 1) {
      hash = (hash * 1664525 + 1013904223) >>> 0;
      const j = hash % (i + 1);
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }

  private hashString(value: string): number {
    let hash = 2166136261;
    for (let i = 0; i < value.length; i += 1) {
      hash ^= value.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  private buildAppliedFilters(query: FilterQuestionsQueryDto) {
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
}
