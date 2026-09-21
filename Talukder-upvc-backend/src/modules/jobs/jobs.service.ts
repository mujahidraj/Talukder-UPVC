import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JobType, JobStatus } from '@prisma/client';

@Injectable()
export class JobsService {
  constructor(private prisma: PrismaService) {}

  async createJob(
    type: JobType,
    uploadedById: string,
    fileName?: string,
    payload?: any,
    importMode?: string,
  ) {
    return this.prisma.importJob.create({
      data: {
        type,
        uploadedById,
        fileName,
        payload,
        importMode,
        status: JobStatus.PENDING,
      },
    });
  }

  async getJobStatus(id: string) {
    return this.prisma.importJob.findUnique({
      where: { id },
      select: {
        id: true,
        type: true,
        status: true,
        progress: true,
        rowsTotal: true,
        rowsSuccess: true,
        rowsFailed: true,
        result: true,
        errorReportPath: true,
      },
    });
  }

  async getJobHistory() {
    return this.prisma.importJob.findMany({
      orderBy: { createdAt: 'desc' },
      include: { uploadedBy: { select: { id: true, name: true } } },
      take: 50,
    });
  }
}
