import { Module } from '@nestjs/common';
import { MockTestController } from './mock-test.controller';
import { MockTestService } from './mock-test.service';

@Module({
  controllers: [MockTestController],
  providers: [MockTestService],
})
export class MockTestModule {}
