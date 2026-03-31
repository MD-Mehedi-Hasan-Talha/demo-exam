import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { AnswerPracticeItemDto } from './dto/answer-practice-item.dto';
import { CreatePracticeSessionDto } from './dto/create-practice-session.dto';
import { PracticeService } from './practice.service';

@Controller('practice')
export class PracticeController {
  constructor(private readonly practiceService: PracticeService) {}

  @Post('sessions')
  createSession(@Body() payload: CreatePracticeSessionDto) {
    return this.practiceService.createSession(payload);
  }

  @Get('sessions/:id/next')
  getNextQuestion(@Param('id') sessionId: string, @Query('userId') userId: string) {
    return this.practiceService.getNextQuestion(sessionId, userId);
  }

  @Post('sessions/:id/answer')
  answerQuestion(
    @Param('id') sessionId: string,
    @Body() payload: AnswerPracticeItemDto,
  ) {
    return this.practiceService.answerQuestion(sessionId, payload);
  }

  @Post('sessions/:id/complete')
  completeSession(@Param('id') sessionId: string, @Body('userId') userId: string) {
    return this.practiceService.completeSession(sessionId, userId);
  }
}
