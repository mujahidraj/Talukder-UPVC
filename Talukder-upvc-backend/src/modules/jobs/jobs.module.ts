import { Module } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { JobRunnerService } from './job-runner.service';
import { ImportProcessor } from './import.processor';
import { MediaModule } from '../media/media.module';

@Module({
  imports: [MediaModule],
  controllers: [JobsController],
  providers: [JobsService, JobRunnerService, ImportProcessor],
  exports: [JobsService],
})
export class JobsModule {}
