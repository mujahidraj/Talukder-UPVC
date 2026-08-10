import {
  Controller,
  Get,
  Put,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { EnquiriesService } from './enquiries.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AdminRole, EnquiryStatus } from '@prisma/client';

@Controller('admin/enquiries')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(AdminRole.SUPER_ADMIN, AdminRole.CATALOG_MANAGER, AdminRole.SALES_STAFF)
export class EnquiriesAdminController {
  constructor(private enquiriesService: EnquiriesService) {}

  @Get()
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: EnquiryStatus,
    @Query('search') search?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.enquiriesService.findAll({
      page,
      limit,
      status,
      search,
      startDate,
      endDate,
    });
  }

  @Get('stats')
  getStats() {
    return this.enquiriesService.getDashboardStats();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.enquiriesService.findById(id);
  }

  @Put(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() body: { status: EnquiryStatus; internalNotes?: string },
  ) {
    return this.enquiriesService.updateStatus(
      id,
      body.status,
      body.internalNotes,
    );
  }

  @Put(':id/assign')
  assign(@Param('id') id: string, @Body() body: { assignedToId: string }) {
    return this.enquiriesService.assign(id, body.assignedToId);
  }

  @Post(':id/note')
  addNote(@Param('id') id: string, @Body() body: { note: string }) {
    return this.enquiriesService.addNote(id, body.note);
  }
}
