import { PracticeSetVisibility, PracticeSetWorkflowStatus } from '@prisma/client';
import { AddPracticeSetItemsDto } from './dto/add-practice-set-items.dto';
import { CreatePracticeSetDto } from './dto/create-practice-set.dto';
import { GeneratePracticeSetDto } from './dto/generate-practice-set.dto';
import { UpdatePracticeSetWorkflowDto } from './dto/update-practice-set-workflow.dto';
import { QuestionSetsService } from './question-sets.service';
export declare class QuestionSetsController {
    private readonly questionSetsService;
    constructor(questionSetsService: QuestionSetsService);
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
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
        title: string;
        titleLocal: string | null;
        totalMarks: number | null;
        isPublic: boolean;
        visibility: import("@prisma/client").$Enums.PracticeSetVisibility;
        workflowStatus: import("@prisma/client").$Enums.PracticeSetWorkflowStatus;
        timeLimit: number | null;
        version: number;
        qualityScore: number | null;
        sourceFilterSnapshot: import("@prisma/client/runtime/client").JsonValue | null;
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
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
        title: string;
        titleLocal: string | null;
        totalMarks: number | null;
        isPublic: boolean;
        visibility: import("@prisma/client").$Enums.PracticeSetVisibility;
        workflowStatus: import("@prisma/client").$Enums.PracticeSetWorkflowStatus;
        timeLimit: number | null;
        version: number;
        qualityScore: number | null;
        sourceFilterSnapshot: import("@prisma/client/runtime/client").JsonValue | null;
        estimatedDifficulty: import("@prisma/client").$Enums.DifficultyLevel | null;
        publishedAt: Date | null;
        reviewedBy: string | null;
    }>;
    addItems(id: string, payload: AddPracticeSetItemsDto): Promise<{
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
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
        title: string;
        titleLocal: string | null;
        totalMarks: number | null;
        isPublic: boolean;
        visibility: import("@prisma/client").$Enums.PracticeSetVisibility;
        workflowStatus: import("@prisma/client").$Enums.PracticeSetWorkflowStatus;
        timeLimit: number | null;
        version: number;
        qualityScore: number | null;
        sourceFilterSnapshot: import("@prisma/client/runtime/client").JsonValue | null;
        estimatedDifficulty: import("@prisma/client").$Enums.DifficultyLevel | null;
        publishedAt: Date | null;
        reviewedBy: string | null;
    }>;
    updateWorkflow(id: string, payload: UpdatePracticeSetWorkflowDto): Promise<{
        id: string;
        type: string;
        createdBy: string | null;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        slug: string;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
        title: string;
        titleLocal: string | null;
        totalMarks: number | null;
        isPublic: boolean;
        visibility: import("@prisma/client").$Enums.PracticeSetVisibility;
        workflowStatus: import("@prisma/client").$Enums.PracticeSetWorkflowStatus;
        timeLimit: number | null;
        version: number;
        qualityScore: number | null;
        sourceFilterSnapshot: import("@prisma/client/runtime/client").JsonValue | null;
        estimatedDifficulty: import("@prisma/client").$Enums.DifficultyLevel | null;
        publishedAt: Date | null;
        reviewedBy: string | null;
    }>;
    listSets(createdBy?: string, type?: string, visibility?: PracticeSetVisibility, workflowStatus?: PracticeSetWorkflowStatus, take?: number): Promise<({
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
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
        title: string;
        titleLocal: string | null;
        totalMarks: number | null;
        isPublic: boolean;
        visibility: import("@prisma/client").$Enums.PracticeSetVisibility;
        workflowStatus: import("@prisma/client").$Enums.PracticeSetWorkflowStatus;
        timeLimit: number | null;
        version: number;
        qualityScore: number | null;
        sourceFilterSnapshot: import("@prisma/client/runtime/client").JsonValue | null;
        estimatedDifficulty: import("@prisma/client").$Enums.DifficultyLevel | null;
        publishedAt: Date | null;
        reviewedBy: string | null;
    })[]>;
    getDetails(id: string): Promise<{
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
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
        title: string;
        titleLocal: string | null;
        totalMarks: number | null;
        isPublic: boolean;
        visibility: import("@prisma/client").$Enums.PracticeSetVisibility;
        workflowStatus: import("@prisma/client").$Enums.PracticeSetWorkflowStatus;
        timeLimit: number | null;
        version: number;
        qualityScore: number | null;
        sourceFilterSnapshot: import("@prisma/client/runtime/client").JsonValue | null;
        estimatedDifficulty: import("@prisma/client").$Enums.DifficultyLevel | null;
        publishedAt: Date | null;
        reviewedBy: string | null;
    }>;
}
