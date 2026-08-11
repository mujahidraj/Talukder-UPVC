import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { JobStatus, JobType } from '@prisma/client';
import { ImportProcessor } from './import.processor';

@Injectable()
export class JobRunnerService {
  private readonly logger = new Logger(JobRunnerService.name);
  private isProcessing = false;

  constructor(
    private prisma: PrismaService,
    private importProcessor: ImportProcessor,
  ) {}

  @Cron(CronExpression.EVERY_10_SECONDS)
  async handleCron() {
    if (this.isProcessing) return;

    const job = await this.prisma.importJob.findFirst({
      where: { status: JobStatus.PENDING },
      orderBy: { createdAt: 'asc' },
    });

    if (!job) return;

    this.isProcessing = true;
    this.logger.log(`Starting job ${job.id} of type ${job.type}`);

    try {
      await this.prisma.importJob.update({
        where: { id: job.id },
        data: { status: JobStatus.PROCESSING, startedAt: new Date() },
      });

      let result: any = {};

      if (job.type === JobType.EXCEL_IMPORT) {
        const payload: any = job.payload || {};
        if (payload.filePath) {
           result = await this.importProcessor.processExcelImport(job.id, payload.filePath, job.uploadedById);
        } else {
           throw new Error('No filePath found in job payload');
        }
      } else if (job.type === JobType.BULK_IMAGE_RESIZE) {
        await this.simulateWork(job.id);
      }

      await this.prisma.importJob.update({
        where: { id: job.id },
        data: {
          status: JobStatus.COMPLETED,
          completedAt: new Date(),
          progress: 100,
          rowsSuccess: result.rowsSuccess || 0,
          rowsFailed: result.rowsFailed || 0,
        },
      });
      this.logger.log(`Completed job ${job.id}`);
    } catch (error: any) {
      this.logger.error(`Job ${job.id} failed`, error);
      await this.prisma.importJob.update({
        where: { id: job.id },
        data: {
          status: JobStatus.FAILED,
          completedAt: new Date(),
          result: { error: error.message },
        },
      });
    } finally {
      this.isProcessing = false;
    }
  }

  private async simulateWork(jobId: string) {
    for (let i = 1; i <= 10; i++) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      await this.prisma.importJob.update({
        where: { id: jobId },
        data: { progress: i * 10 },
      });
    }
  }
}
