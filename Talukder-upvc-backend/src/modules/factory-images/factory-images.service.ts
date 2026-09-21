import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as path from 'path';
import * as fs from 'fs/promises';
import * as sharpImport from 'sharp';
const sharp = (sharpImport as any).default || sharpImport;
import { v4 as uuidv4 } from 'uuid';

/** Strip characters that could cause XSS or path issues from a filename */
function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._\-\s()]/g, '_').substring(0, 255);
}

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
        fileName: sanitizeFilename(file.originalname),
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
      // Use resolved upload directory as the safe root
      const safeRoot = path.resolve(this.uploadDir);
      // Strip leading slashes/dots from stored path to prevent traversal
      const cleanPath = (img.fullPath || '').replace(/^[\/\\]+/, '').replace(/\.\./g, '');
      const targetPath = path.resolve(safeRoot, '..', cleanPath);
      const normalizedTarget = path.normalize(targetPath);
      const normalizedRoot = path.normalize(safeRoot);

      if (!normalizedTarget.startsWith(normalizedRoot)) {
        console.warn(
          'Security Warning: Path traversal detected in factory image deletion',
          normalizedTarget,
        );
        return;
      }

      await fs.unlink(normalizedTarget).catch(() => {});
    } catch (e) {
      console.warn('Failed to delete factory image file', e);
    }

    await this.prisma.factoryImage.delete({ where: { id } });
  }
}

