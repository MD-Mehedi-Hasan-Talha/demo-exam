import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { LogActivityDto } from './dto/log-activity.dto';
import { MarkWeakQuestionDto } from './dto/mark-weak-question.dto';
import { UpsertBookmarkDto } from './dto/upsert-bookmark.dto';
import { ProgressService } from './progress.service';

@Controller('progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Post('bookmarks')
  upsertBookmark(@Body() payload: UpsertBookmarkDto) {
    return this.progressService.upsertBookmark(payload);
  }

  @Delete('bookmarks/:questionId')
  removeBookmark(@Param('questionId') questionId: string, @Query('userId') userId: string) {
    return this.progressService.removeBookmark(userId, questionId);
  }

  @Get('bookmarks')
  getBookmarks(
    @Query('userId') userId: string,
    @Query('take', new ParseIntPipe({ optional: true })) take?: number,
  ) {
    return this.progressService.getBookmarks(userId, take ?? 50);
  }

  @Post('weak')
  markWeak(@Body() payload: MarkWeakQuestionDto) {
    return this.progressService.markWeakQuestion(payload);
  }

  @Get('revision-queue')
  getRevisionQueue(
    @Query('userId') userId: string,
    @Query('take', new ParseIntPipe({ optional: true })) take?: number,
  ) {
    return this.progressService.getRevisionQueue(userId, take ?? 20);
  }

  @Get('question-status')
  getQuestionStatus(
    @Query('userId') userId: string,
    @Query('questionIds') questionIdsCsv: string,
  ) {
    const questionIds = questionIdsCsv
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean);
    return this.progressService.getQuestionStatus(userId, questionIds);
  }

  @Post('daily-activity')
  logDailyActivity(@Body() payload: LogActivityDto) {
    return this.progressService.logDailyActivity(payload);
  }

  @Get('streak')
  getStreak(@Query('userId') userId: string) {
    return this.progressService.getStreak(userId);
  }
}
