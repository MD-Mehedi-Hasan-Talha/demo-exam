import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMockExamDto } from './dto/create-mock-exam.dto';
import { StartMockAttemptDto } from './dto/start-mock-attempt.dto';
import { SubmitMockAttemptDto } from './dto/submit-mock-attempt.dto';
export declare class MockTestService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createMockExam(payload: CreateMockExamDto): Promise<{
        items: ({
            question: {
                uuid: string;
                id: string;
                type: import("@prisma/client").$Enums.QuestionType;
                difficulty: import("@prisma/client").$Enums.DifficultyLevel;
                currentVersion: {
                    stem: string;
                    stemLocal: string | null;
                } | null;
            };
        } & {
            id: string;
            questionId: string;
            sortOrder: number;
            marks: number | null;
            negMarks: number | null;
            examId: string;
            sectionName: string | null;
        })[];
        rules: {
            id: string;
            difficulty: import("@prisma/client").$Enums.DifficultyLevel | null;
            subjectId: string | null;
            metadata: Prisma.JsonValue | null;
            tagId: string | null;
            questionType: import("@prisma/client").$Enums.QuestionType | null;
            questionCount: number;
            marks: number | null;
            negMarks: number | null;
            fromPreviousYear: boolean;
            examId: string;
        }[];
    } & {
        id: string;
        status: import("@prisma/client").$Enums.ExamStatus;
        createdBy: string | null;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        slug: string;
        title: string;
        titleLocal: string | null;
        mode: import("@prisma/client").$Enums.ExamMode;
        totalDuration: number | null;
        perQuestionTime: number | null;
        startsAt: Date | null;
        endsAt: Date | null;
        totalMarks: number | null;
        passMark: number | null;
        shuffleQuestions: boolean;
        showResult: boolean;
        allowReview: boolean;
        isPublic: boolean;
        maxAttempts: number | null;
        organizationId: string | null;
        examSessionId: string | null;
        practiceSetId: string | null;
    }>;
    getMockExamDetails(examId: string): Promise<{
        items: ({
            question: {
                uuid: string;
                id: string;
                type: import("@prisma/client").$Enums.QuestionType;
                difficulty: import("@prisma/client").$Enums.DifficultyLevel;
                currentVersion: {
                    stem: string;
                    stemLocal: string | null;
                } | null;
            };
        } & {
            id: string;
            questionId: string;
            sortOrder: number;
            marks: number | null;
            negMarks: number | null;
            examId: string;
            sectionName: string | null;
        })[];
        rules: {
            id: string;
            difficulty: import("@prisma/client").$Enums.DifficultyLevel | null;
            subjectId: string | null;
            metadata: Prisma.JsonValue | null;
            tagId: string | null;
            questionType: import("@prisma/client").$Enums.QuestionType | null;
            questionCount: number;
            marks: number | null;
            negMarks: number | null;
            fromPreviousYear: boolean;
            examId: string;
        }[];
    } & {
        id: string;
        status: import("@prisma/client").$Enums.ExamStatus;
        createdBy: string | null;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        slug: string;
        title: string;
        titleLocal: string | null;
        mode: import("@prisma/client").$Enums.ExamMode;
        totalDuration: number | null;
        perQuestionTime: number | null;
        startsAt: Date | null;
        endsAt: Date | null;
        totalMarks: number | null;
        passMark: number | null;
        shuffleQuestions: boolean;
        showResult: boolean;
        allowReview: boolean;
        isPublic: boolean;
        maxAttempts: number | null;
        organizationId: string | null;
        examSessionId: string | null;
        practiceSetId: string | null;
    }>;
    startAttempt(examId: string, payload: StartMockAttemptDto): Promise<{
        id: string;
        createdAt: Date;
        timeSpent: number | null;
        userId: string;
        totalMarks: number | null;
        examId: string;
        attemptNo: number;
        startedAt: Date;
        submittedAt: Date | null;
        score: number | null;
        percentage: number | null;
        rank: number | null;
        isPassed: boolean | null;
        isCompleted: boolean;
    }>;
    submitAttempt(examId: string, attemptId: string, payload: SubmitMockAttemptDto): Promise<{
        id: string;
        createdAt: Date;
        timeSpent: number | null;
        userId: string;
        totalMarks: number | null;
        examId: string;
        attemptNo: number;
        startedAt: Date;
        submittedAt: Date | null;
        score: number | null;
        percentage: number | null;
        rank: number | null;
        isPassed: boolean | null;
        isCompleted: boolean;
    }>;
    getLeaderboard(examId: string, take?: number): Promise<{
        id: string;
        timeSpent: number | null;
        userId: string;
        totalMarks: number | null;
        attemptNo: number;
        score: number | null;
        percentage: number | null;
        rank: number | null;
    }[]>;
    private calculateRank;
    private buildSlug;
}
