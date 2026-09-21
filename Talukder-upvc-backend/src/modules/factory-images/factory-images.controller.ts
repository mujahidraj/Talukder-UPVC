import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FactoryImagesService } from './factory-images.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AdminRole } from '@prisma/client';

@Controller()
export class FactoryImagesController {
  constructor(private readonly factoryImagesService: FactoryImagesService) {}

  @Get('public/factory-images')
  getPublicFactoryImages() {
    return this.factoryImagesService.getAll();
  }

  @Get('admin/factory-images')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.CATALOG_MANAGER)
  getAdminFactoryImages() {
    return this.factoryImagesService.getAll();
  }

  @Post('admin/factory-images')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.CATALOG_MANAGER)
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
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    return this.factoryImagesService.uploadImage(file);
  }

  @Delete('admin/factory-images/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.CATALOG_MANAGER)
  deleteImage(@Param('id') id: string) {
    return this.factoryImagesService.deleteImage(id);
  }
}
