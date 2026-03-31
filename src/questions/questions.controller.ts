import { Controller, Get, Query } from '@nestjs/common';
import { FilterQuestionsQueryDto } from './dto/filter-questions-query.dto';
import { QuestionsService } from './questions.service';

@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Get()
  filterQuestions(@Query() query: FilterQuestionsQueryDto) {
    return this.questionsService.filterQuestions(query);
  }
}
