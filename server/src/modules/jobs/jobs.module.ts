import { Module } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { JobRunnerService } from './job-runner.service';

@Module({
  controllers: [JobsController],
  providers: [JobsService, JobRunnerService],
  exports: [JobsService],
})
export class JobsModule {}
