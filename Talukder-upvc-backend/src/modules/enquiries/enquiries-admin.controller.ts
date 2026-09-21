import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
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
import {
  UpdateEnquiryStatusDto,
  AssignEnquiryDto,
  AddEnquiryNoteDto,
} from './dto/enquiry-admin.dto';

@Controller('admin/enquiries')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(AdminRole.SUPER_ADMIN, AdminRole.CATALOG_MANAGER, AdminRole.SALES_STAFF)
export class EnquiriesAdminController {
  constructor(private enquiriesService: EnquiriesService) {}

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: EnquiryStatus,
    @Query('search') search?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.enquiriesService.findAll({
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
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
    @Body() dto: UpdateEnquiryStatusDto,
  ) {
    return this.enquiriesService.updateStatus(
      id,
      dto.status,
      dto.internalNotes,
    );
  }

  @Put(':id/assign')
  assign(@Param('id') id: string, @Body() dto: AssignEnquiryDto) {
    return this.enquiriesService.assign(id, dto.assignedToId);
  }

  @Post(':id/note')
  addNote(@Param('id') id: string, @Body() dto: AddEnquiryNoteDto) {
    return this.enquiriesService.addNote(id, dto.note);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.enquiriesService.delete(id);
  }
}
