import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { PracticeSetVisibility, PracticeSetWorkflowStatus } from '@prisma/client';
import { AddPracticeSetItemsDto } from './dto/add-practice-set-items.dto';
import { CreatePracticeSetDto } from './dto/create-practice-set.dto';
import { GeneratePracticeSetDto } from './dto/generate-practice-set.dto';
import { UpdatePracticeSetWorkflowDto } from './dto/update-practice-set-workflow.dto';
import { QuestionSetsService } from './question-sets.service';

@Controller('question-sets')
export class QuestionSetsController {
  constructor(private readonly questionSetsService: QuestionSetsService) {}

  @Post()
  createSet(@Body() payload: CreatePracticeSetDto) {
    return this.questionSetsService.createSet(payload);
  }

  @Post('generate')
  generateSet(@Body() payload: GeneratePracticeSetDto) {
    return this.questionSetsService.generateSet(payload);
  }

  @Post(':id/items')
  addItems(@Param('id') id: string, @Body() payload: AddPracticeSetItemsDto) {
    return this.questionSetsService.addItems(id, payload);
  }

  @Patch(':id/workflow')
  updateWorkflow(@Param('id') id: string, @Body() payload: UpdatePracticeSetWorkflowDto) {
    return this.questionSetsService.updateWorkflow(id, payload);
  }

  @Get()
  listSets(
    @Query('createdBy') createdBy?: string,
    @Query('type') type?: string,
    @Query('visibility') visibility?: PracticeSetVisibility,
    @Query('workflowStatus') workflowStatus?: PracticeSetWorkflowStatus,
    @Query('take', new ParseIntPipe({ optional: true })) take?: number,
  ) {
    return this.questionSetsService.listSets({
      createdBy,
      type,
      visibility,
      workflowStatus,
      take: take ?? 50,
    });
  }

  @Get(':id')
  getDetails(@Param('id') id: string) {
    return this.questionSetsService.getSetDetails(id);
  }
}
