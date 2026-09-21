import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AdminRole } from '@prisma/client';

@Controller('admin/jobs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(AdminRole.SUPER_ADMIN, AdminRole.CATALOG_MANAGER)
export class JobsController {
  constructor(private jobsService: JobsService) {}

  @Get()
  getJobHistory() {
    return this.jobsService.getJobHistory();
  }

  @Get(':id/status')
  getJobStatus(@Param('id') id: string) {
    return this.jobsService.getJobStatus(id);
  }
}
