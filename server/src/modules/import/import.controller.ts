import {
  Controller,
  Post,
  Get,
  UseInterceptors,
  UploadedFile,
  Body,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImportService } from './import.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AdminRole } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('admin/import')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(AdminRole.SUPER_ADMIN, AdminRole.CATALOG_MANAGER)
export class ImportController {
  constructor(private importService: ImportService) {}

  @Get('template')
  getTemplate() {
    return this.importService.getTemplate();
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadExcel(
    @UploadedFile() file: Express.Multer.File,
    @Body('mode') mode: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.importService.queueExcelImport(file, userId, mode);
  }
}
