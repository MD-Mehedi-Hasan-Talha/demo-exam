import { AnswerPracticeItemDto } from './dto/answer-practice-item.dto';
import { CreatePracticeSessionDto } from './dto/create-practice-session.dto';
import { PracticeService } from './practice.service';
export declare class PracticeController {
    private readonly practiceService;
    constructor(practiceService: PracticeService);
    createSession(payload: CreatePracticeSessionDto): Promise<{
        items: {
            id: string;
            questionId: string;
            sortOrder: number;
        }[];
    } & {
        id: string;
        status: import("@prisma/client").$Enums.PracticeSessionStatus;
        userId: string;
        mode: import("@prisma/client").$Enums.PracticeMode;
        startedAt: Date;
        config: import("@prisma/client/runtime/client").JsonValue | null;
        endedAt: Date | null;
    }>;
    getNextQuestion(sessionId: string, userId: string): Promise<({
        question: {
            uuid: string;
            id: string;
            type: import("@prisma/client").$Enums.QuestionType;
            difficulty: import("@prisma/client").$Enums.DifficultyLevel;
            language: import("@prisma/client").$Enums.Language;
            estimatedSeconds: number | null;
            currentVersion: {
                options: import("@prisma/client/runtime/client").JsonValue;
                id: string;
                stem: string;
                stemLocal: string | null;
            } | null;
        };
    } & {
        id: string;
        createdAt: Date;
        questionId: string;
        timeSpent: number | null;
        selectedAnswer: import("@prisma/client/runtime/client").JsonValue | null;
        sortOrder: number;
        isAnswered: boolean;
        resultStatus: import("@prisma/client").$Enums.AttemptStatus | null;
        answeredAt: Date | null;
        practiceSessionId: string;
    }) | null>;
    answerQuestion(sessionId: string, payload: AnswerPracticeItemDto): Promise<{
        ok: boolean;
    }>;
    completeSession(sessionId: string, userId: string): Promise<{
        updated: number;
    }>;
}
