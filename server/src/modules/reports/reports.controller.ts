import { Controller, Get, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AdminRole } from '@prisma/client';

@Controller('admin/reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(AdminRole.SUPER_ADMIN, AdminRole.CATALOG_MANAGER)
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get('product-performance')
  getProductPerformance() {
    return this.reportsService.getProductPerformance();
  }

  @Get('enquiry-trends')
  getEnquiryTrends() {
    return this.reportsService.getEnquiryTrends();
  }
}
