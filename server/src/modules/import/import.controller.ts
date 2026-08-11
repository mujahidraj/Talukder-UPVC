import {
  Controller,
  Post,
  Get,
  UseInterceptors,
  UploadedFile,
  Body,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
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
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/temp',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `import-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(csv|xlsx|xls)$/i)) {
          return cb(new BadRequestException('Only Excel or CSV files are allowed!'), false);
        }
        cb(null, true);
      },
    }),
  )
  uploadExcel(
    @UploadedFile() file: Express.Multer.File,
    @Body('mode') mode: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.importService.queueExcelImport(file, userId, mode);
  }
}
