import { BookmarkReason } from '@prisma/client';
export declare class UpsertBookmarkDto {
    userId: string;
    questionId: string;
    reason?: BookmarkReason;
    note?: string;
    tags?: string[];
}
