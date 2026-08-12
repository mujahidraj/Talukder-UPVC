import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MediaService } from './media.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AdminRole } from '@prisma/client';

@Controller('admin/media')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(AdminRole.SUPER_ADMIN, AdminRole.CATALOG_MANAGER)
export class MediaController {
  constructor(private mediaService: MediaService) {}

  @Get()
  getLibrary() {
    return this.mediaService.getLibrary();
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/^image\/(jpg|jpeg|png|webp|gif)$/)) {
          return cb(
            new BadRequestException(
              'Only specific image formats (jpg, png, webp, gif) are allowed!',
            ),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('productId') productId: string,
    @Body('isPrimary') isPrimaryStr?: string,
  ) {
    const isPrimary = isPrimaryStr === 'true';
    return this.mediaService.uploadProductImage(productId, file, isPrimary);
  }

  @Delete(':id')
  deleteImage(@Param('id') id: string) {
    return this.mediaService.deleteImage(id);
  }
}
