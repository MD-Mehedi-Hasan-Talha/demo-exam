import { Module } from '@nestjs/common';
import { AnalyticsModule } from './analytics/analytics.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MockTestModule } from './mock-test/mock-test.module';
import { PrismaModule } from './prisma/prisma.module';
import { PracticeModule } from './practice/practice.module';
import { ProgressModule } from './progress/progress.module';
import { QuestionSetsModule } from './question-sets/question-sets.module';
import { QuestionsModule } from './questions/questions.module';

@Module({
  imports: [
    PrismaModule,
    QuestionsModule,
    PracticeModule,
    MockTestModule,
    ProgressModule,
    QuestionSetsModule,
    AnalyticsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
