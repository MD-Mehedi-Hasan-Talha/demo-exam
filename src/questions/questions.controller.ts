import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CreateQuestionDto } from './dto/create-question.dto';
import { FilterQuestionsQueryDto } from './dto/filter-questions-query.dto';
import { QuestionsService } from './questions.service';

@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Post()
  createQuestion(@Body() payload: CreateQuestionDto) {
    return this.questionsService.createQuestion(payload);
  }

  @Get()
  filterQuestions(@Query() query: FilterQuestionsQueryDto) {
    return this.questionsService.filterQuestions(query);
  }
}
