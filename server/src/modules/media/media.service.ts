import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as path from 'path';
import * as fs from 'fs/promises';
import * as sharpImport from 'sharp';
const sharp = (sharpImport as any).default || sharpImport;
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MediaService {
  private readonly uploadDir = process.env.UPLOAD_LOCAL_PATH || './uploads';

  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    await fs.mkdir(path.join(this.uploadDir, 'products', 'thumb'), {
      recursive: true,
    });
    await fs.mkdir(path.join(this.uploadDir, 'products', 'medium'), {
      recursive: true,
    });
    await fs.mkdir(path.join(this.uploadDir, 'products', 'full'), {
      recursive: true,
    });
  }

  async uploadProductImage(
    productId: string,
    file: Express.Multer.File,
    isPrimary = false,
  ) {
    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('Only images are allowed');
    }

    const ext = path.extname(file.originalname);
    const filename = `${uuidv4()}${ext}`;
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) throw new BadRequestException('Product not found');

    const fullPathRel = `/uploads/products/full/${filename}`;
    const mediumPathRel = `/uploads/products/medium/${filename}`;
    const thumbPathRel = `/uploads/products/thumb/${filename}`;

    const fullPathAbs = path.join(this.uploadDir, 'products', 'full', filename);
    const mediumPathAbs = path.join(
      this.uploadDir,
      'products',
      'medium',
      filename,
    );
    const thumbPathAbs = path.join(
      this.uploadDir,
      'products',
      'thumb',
      filename,
    );

    // Save full original (or slightly compressed)
    await sharp(file.buffer)
      .resize({ width: 1200, withoutEnlargement: true })
      .toFile(fullPathAbs);

    // Medium size
    await sharp(file.buffer)
      .resize({ width: 600, withoutEnlargement: true })
      .toFile(mediumPathAbs);

    // Thumbnail size
    await sharp(file.buffer)
      .resize({ width: 200, withoutEnlargement: true })
      .toFile(thumbPathAbs);

    // Get order
    const maxOrder = await this.prisma.productImage.aggregate({
      where: { productId },
      _max: { sortOrder: true },
    });

    if (isPrimary) {
      // Unset previous primary
      await this.prisma.productImage.updateMany({
        where: { productId, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    return this.prisma.productImage.create({
      data: {
        productId,
        fileName: file.originalname,
        filePath: fullPathRel,
        fullPath: fullPathRel,
        mediumPath: mediumPathRel,
        thumbPath: thumbPathRel,
        fileSize: file.size,
        mimeType: file.mimetype,
        sortOrder: (maxOrder._max.sortOrder || 0) + 1,
        isPrimary: isPrimary || maxOrder._max.sortOrder === null,
      },
    });
  }

  async getLibrary() {
    return this.prisma.productImage.findMany({
      include: {
        product: { select: { productName: true, productCode: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async deleteImage(id: string) {
    const img = await this.prisma.productImage.findUnique({ where: { id } });
    if (!img) return;

    // Delete files
    try {
      if (img.fullPath)
        await fs
          .unlink(path.join(__dirname, '..', '..', '..', img.fullPath))
          .catch(() => {});
      if (img.mediumPath)
        await fs
          .unlink(path.join(__dirname, '..', '..', '..', img.mediumPath))
          .catch(() => {});
      if (img.thumbPath)
        await fs
          .unlink(path.join(__dirname, '..', '..', '..', img.thumbPath))
          .catch(() => {});
    } catch (e) {
      console.warn('Failed to delete image files', e);
    }

    await this.prisma.productImage.delete({ where: { id } });
  }
}
