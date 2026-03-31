import { Body, Controller, Get, ParseIntPipe, Post, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { RefreshQuestionAnalyticsDto } from './dto/refresh-question-analytics.dto';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post('refresh/questions')
  refreshQuestionAnalytics(@Body() payload: RefreshQuestionAnalyticsDto) {
    return this.analyticsService.refreshQuestionAnalytics(payload);
  }

  @Get('questions/most-solved')
  mostSolved(@Query('limit', new ParseIntPipe({ optional: true })) limit?: number) {
    return this.analyticsService.mostSolved(limit ?? 20);
  }

  @Get('questions/most-difficult')
  mostDifficult(@Query('limit', new ParseIntPipe({ optional: true })) limit?: number) {
    return this.analyticsService.mostDifficult(limit ?? 20);
  }

  @Get('topics/trending')
  trendingTopics(@Query('limit', new ParseIntPipe({ optional: true })) limit?: number) {
    return this.analyticsService.trendingTopics(limit ?? 20);
  }

  @Get('users/weak-subjects')
  weakSubjects(
    @Query('userId') userId: string,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.analyticsService.weakSubjects(userId, limit ?? 10);
  }

  @Get('users/performance-heatmap')
  performanceHeatmap(@Query('userId') userId: string) {
    return this.analyticsService.userPerformanceHeatmap(userId);
  }

  @Get('users/chapter-strength')
  chapterStrength(
    @Query('userId') userId: string,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.analyticsService.chapterStrength(userId, limit ?? 50);
  }
}
