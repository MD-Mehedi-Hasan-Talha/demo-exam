import { Body, Controller, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { CreateMockExamDto } from './dto/create-mock-exam.dto';
import { StartMockAttemptDto } from './dto/start-mock-attempt.dto';
import { SubmitMockAttemptDto } from './dto/submit-mock-attempt.dto';
import { MockTestService } from './mock-test.service';

@Controller('mock-tests')
export class MockTestController {
  constructor(private readonly mockTestService: MockTestService) {}

  @Post()
  createMock(@Body() payload: CreateMockExamDto) {
    return this.mockTestService.createMockExam(payload);
  }

  @Get(':examId')
  getExam(@Param('examId') examId: string) {
    return this.mockTestService.getMockExamDetails(examId);
  }

  @Post(':examId/attempts')
  startAttempt(
    @Param('examId') examId: string,
    @Body() payload: StartMockAttemptDto,
  ) {
    return this.mockTestService.startAttempt(examId, payload);
  }

  @Post(':examId/attempts/:attemptId/submit')
  submitAttempt(
    @Param('examId') examId: string,
    @Param('attemptId') attemptId: string,
    @Body() payload: SubmitMockAttemptDto,
  ) {
    return this.mockTestService.submitAttempt(examId, attemptId, payload);
  }

  @Get(':examId/leaderboard')
  leaderboard(
    @Param('examId') examId: string,
    @Query('take', new ParseIntPipe({ optional: true })) take?: number,
  ) {
    return this.mockTestService.getLeaderboard(examId, take ?? 50);
  }
}
