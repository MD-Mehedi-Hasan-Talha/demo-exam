import { PracticeSetVisibility, PracticeSetWorkflowStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AddPracticeSetItemsDto } from './dto/add-practice-set-items.dto';
import { CreatePracticeSetDto } from './dto/create-practice-set.dto';
import { GeneratePracticeSetDto } from './dto/generate-practice-set.dto';
import { UpdatePracticeSetWorkflowDto } from './dto/update-practice-set-workflow.dto';
export declare class QuestionSetsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createSet(payload: CreatePracticeSetDto): Promise<{
        items: ({
            question: {
                uuid: string;
                id: string;
                type: import("@prisma/client").$Enums.QuestionType;
                difficulty: import("@prisma/client").$Enums.DifficultyLevel;
                language: import("@prisma/client").$Enums.Language;
                currentVersion: {
                    stem: string;
                    stemLocal: string | null;
                } | null;
            };
        } & {
            id: string;
            questionId: string;
            sortOrder: number;
            practiceSetId: string;
            marks: number | null;
            negMarks: number | null;
            isRequired: boolean;
        })[];
    } & {
        id: string;
        type: string;
        createdBy: string | null;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        slug: string;
        metadata: Prisma.JsonValue | null;
        title: string;
        titleLocal: string | null;
        totalMarks: number | null;
        isPublic: boolean;
        visibility: import("@prisma/client").$Enums.PracticeSetVisibility;
        workflowStatus: import("@prisma/client").$Enums.PracticeSetWorkflowStatus;
        timeLimit: number | null;
        version: number;
        qualityScore: number | null;
        sourceFilterSnapshot: Prisma.JsonValue | null;
        estimatedDifficulty: import("@prisma/client").$Enums.DifficultyLevel | null;
        publishedAt: Date | null;
        reviewedBy: string | null;
    }>;
    generateSet(payload: GeneratePracticeSetDto): Promise<{
        items: ({
            question: {
                uuid: string;
                id: string;
                type: import("@prisma/client").$Enums.QuestionType;
                difficulty: import("@prisma/client").$Enums.DifficultyLevel;
                language: import("@prisma/client").$Enums.Language;
                currentVersion: {
                    stem: string;
                    stemLocal: string | null;
                } | null;
            };
        } & {
            id: string;
            questionId: string;
            sortOrder: number;
            practiceSetId: string;
            marks: number | null;
            negMarks: number | null;
            isRequired: boolean;
        })[];
    } & {
        id: string;
        type: string;
        createdBy: string | null;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        slug: string;
        metadata: Prisma.JsonValue | null;
        title: string;
        titleLocal: string | null;
        totalMarks: number | null;
        isPublic: boolean;
        visibility: import("@prisma/client").$Enums.PracticeSetVisibility;
        workflowStatus: import("@prisma/client").$Enums.PracticeSetWorkflowStatus;
        timeLimit: number | null;
        version: number;
        qualityScore: number | null;
        sourceFilterSnapshot: Prisma.JsonValue | null;
        estimatedDifficulty: import("@prisma/client").$Enums.DifficultyLevel | null;
        publishedAt: Date | null;
        reviewedBy: string | null;
    }>;
    addItems(practiceSetId: string, payload: AddPracticeSetItemsDto): Promise<{
        items: ({
            question: {
                uuid: string;
                id: string;
                type: import("@prisma/client").$Enums.QuestionType;
                difficulty: import("@prisma/client").$Enums.DifficultyLevel;
                language: import("@prisma/client").$Enums.Language;
                currentVersion: {
                    stem: string;
                    stemLocal: string | null;
                } | null;
            };
        } & {
            id: string;
            questionId: string;
            sortOrder: number;
            practiceSetId: string;
            marks: number | null;
            negMarks: number | null;
            isRequired: boolean;
        })[];
    } & {
        id: string;
        type: string;
        createdBy: string | null;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        slug: string;
        metadata: Prisma.JsonValue | null;
        title: string;
        titleLocal: string | null;
        totalMarks: number | null;
        isPublic: boolean;
        visibility: import("@prisma/client").$Enums.PracticeSetVisibility;
        workflowStatus: import("@prisma/client").$Enums.PracticeSetWorkflowStatus;
        timeLimit: number | null;
        version: number;
        qualityScore: number | null;
        sourceFilterSnapshot: Prisma.JsonValue | null;
        estimatedDifficulty: import("@prisma/client").$Enums.DifficultyLevel | null;
        publishedAt: Date | null;
        reviewedBy: string | null;
    }>;
    updateWorkflow(practiceSetId: string, payload: UpdatePracticeSetWorkflowDto): Promise<{
        id: string;
        type: string;
        createdBy: string | null;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        slug: string;
        metadata: Prisma.JsonValue | null;
        title: string;
        titleLocal: string | null;
        totalMarks: number | null;
        isPublic: boolean;
        visibility: import("@prisma/client").$Enums.PracticeSetVisibility;
        workflowStatus: import("@prisma/client").$Enums.PracticeSetWorkflowStatus;
        timeLimit: number | null;
        version: number;
        qualityScore: number | null;
        sourceFilterSnapshot: Prisma.JsonValue | null;
        estimatedDifficulty: import("@prisma/client").$Enums.DifficultyLevel | null;
        publishedAt: Date | null;
        reviewedBy: string | null;
    }>;
    listSets(params: {
        createdBy?: string;
        type?: string;
        visibility?: PracticeSetVisibility;
        workflowStatus?: PracticeSetWorkflowStatus;
        take?: number;
    }): Promise<({
        _count: {
            items: number;
        };
    } & {
        id: string;
        type: string;
        createdBy: string | null;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        slug: string;
        metadata: Prisma.JsonValue | null;
        title: string;
        titleLocal: string | null;
        totalMarks: number | null;
        isPublic: boolean;
        visibility: import("@prisma/client").$Enums.PracticeSetVisibility;
        workflowStatus: import("@prisma/client").$Enums.PracticeSetWorkflowStatus;
        timeLimit: number | null;
        version: number;
        qualityScore: number | null;
        sourceFilterSnapshot: Prisma.JsonValue | null;
        estimatedDifficulty: import("@prisma/client").$Enums.DifficultyLevel | null;
        publishedAt: Date | null;
        reviewedBy: string | null;
    })[]>;
    getSetDetails(id: string): Promise<{
        items: ({
            question: {
                uuid: string;
                id: string;
                type: import("@prisma/client").$Enums.QuestionType;
                difficulty: import("@prisma/client").$Enums.DifficultyLevel;
                language: import("@prisma/client").$Enums.Language;
                currentVersion: {
                    stem: string;
                    stemLocal: string | null;
                } | null;
            };
        } & {
            id: string;
            questionId: string;
            sortOrder: number;
            practiceSetId: string;
            marks: number | null;
            negMarks: number | null;
            isRequired: boolean;
        })[];
    } & {
        id: string;
        type: string;
        createdBy: string | null;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        slug: string;
        metadata: Prisma.JsonValue | null;
        title: string;
        titleLocal: string | null;
        totalMarks: number | null;
        isPublic: boolean;
        visibility: import("@prisma/client").$Enums.PracticeSetVisibility;
        workflowStatus: import("@prisma/client").$Enums.PracticeSetWorkflowStatus;
        timeLimit: number | null;
        version: number;
        qualityScore: number | null;
        sourceFilterSnapshot: Prisma.JsonValue | null;
        estimatedDifficulty: import("@prisma/client").$Enums.DifficultyLevel | null;
        publishedAt: Date | null;
        reviewedBy: string | null;
    }>;
    private buildSlug;
    private validateQuestionIds;
}
