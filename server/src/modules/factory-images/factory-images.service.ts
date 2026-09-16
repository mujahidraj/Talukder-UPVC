import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as path from 'path';
import * as fs from 'fs/promises';
import * as sharpImport from 'sharp';
const sharp = (sharpImport as any).default || sharpImport;
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FactoryImagesService {
  private readonly uploadDir = process.env.UPLOAD_LOCAL_PATH || './uploads';

  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    await fs.mkdir(path.join(this.uploadDir, 'factory-images'), {
      recursive: true,
    });
  }

  async getAll() {
    return this.prisma.factoryImage.findMany({
      orderBy: { sortOrder: 'asc' },
    });
  }

  async uploadImage(file: Express.Multer.File) {
    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('Only images are allowed');
    }

    const ext = path.extname(file.originalname);
    const filename = `${uuidv4()}${ext}`;

    const relPath = `/uploads/factory-images/${filename}`;
    const absPath = path.join(this.uploadDir, 'factory-images', filename);

    // Save image
    await sharp(file.buffer)
      .resize({ width: 1200, withoutEnlargement: true }) // optimize size
      .toFile(absPath);

    // Get max sortOrder
    const maxOrder = await this.prisma.factoryImage.aggregate({
      _max: { sortOrder: true },
    });

    return this.prisma.factoryImage.create({
      data: {
        fileName: file.originalname,
        filePath: relPath,
        fullPath: relPath,
        sortOrder: (maxOrder._max.sortOrder || 0) + 1,
      },
    });
  }

  async deleteImage(id: string) {
    const img = await this.prisma.factoryImage.findUnique({ where: { id } });
    if (!img) return;

    try {
      const rootDir = path.resolve(__dirname, '..', '..', '..');
      const targetPath = path.resolve(rootDir, img.fullPath);
      
      // basic safety check
      if (targetPath.startsWith(rootDir)) {
        await fs.unlink(targetPath).catch(() => {});
      }
    } catch (e) {
      console.warn('Failed to delete factory image file', e);
    }

    await this.prisma.factoryImage.delete({ where: { id } });
  }
}
