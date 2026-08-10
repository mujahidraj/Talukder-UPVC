import { Injectable } from '@nestjs/common';
import { JobsService } from '../jobs/jobs.service';
import { JobType } from '@prisma/client';

@Injectable()
export class ImportService {
  constructor(private jobsService: JobsService) {}

  async queueExcelImport(
    file: Express.Multer.File,
    uploadedById: string,
    importMode: string,
  ) {
    // In a real app we'd save the file to disk first and pass the path
    // For this boilerplate we just create the job
    return this.jobsService.createJob(
      JobType.EXCEL_IMPORT,
      uploadedById,
      file.originalname,
      {},
      importMode,
    );
  }

  async getTemplate() {
    return {
      message: 'Template generation would go here using ExcelJS',
    };
  }
}
