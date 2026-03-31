import { BookmarkReason } from '@prisma/client';

export class UpsertBookmarkDto {
  userId!: string;
  questionId!: string;
  reason?: BookmarkReason;
  note?: string;
  tags?: string[];
}
