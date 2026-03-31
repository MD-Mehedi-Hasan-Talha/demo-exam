import { Module } from '@nestjs/common';
import { QuestionSetsController } from './question-sets.controller';
import { QuestionSetsService } from './question-sets.service';

@Module({
  controllers: [QuestionSetsController],
  providers: [QuestionSetsService],
})
export class QuestionSetsModule {}
