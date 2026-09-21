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
    const product = await this.prisma.product.findFirst({
      where: {
        OR: [
          { id: productId },
          { productCode: productId }
        ]
      },
    });

    if (!product) throw new BadRequestException('Product not found');
    const actualProductId = product.id;

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
      where: { productId: actualProductId },
      _max: { sortOrder: true },
    });

    if (isPrimary) {
      // Unset previous primary
      await this.prisma.productImage.updateMany({
        where: { productId: actualProductId, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    return this.prisma.productImage.create({
      data: {
        productId: actualProductId,
        fileName: sanitizeFilename(file.originalname),
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

    // Delete files securely
    try {
      const safeRoot = path.resolve(this.uploadDir);

      const safeUnlink = async (filePath: string | null) => {
        if (!filePath) return;
        // Strip leading slashes/dots from stored path to prevent traversal
        const cleanPath = filePath.replace(/^[\/\\]+/, '').replace(/\.\./g, '');
        const targetPath = path.resolve(safeRoot, '..', cleanPath);
        const normalizedTarget = path.normalize(targetPath);
        const normalizedRoot = path.normalize(safeRoot);

        if (!normalizedTarget.startsWith(normalizedRoot)) {
          console.warn(
            'Security Warning: Path traversal detected in image deletion',
            normalizedTarget,
          );
          return;
        }
        await fs.unlink(normalizedTarget).catch(() => {});
      };

      await safeUnlink(img.fullPath);
      await safeUnlink(img.mediumPath);
      await safeUnlink(img.thumbPath);
    } catch (e) {
      console.warn('Failed to delete image files', e);
    }

    await this.prisma.productImage.delete({ where: { id } });
  }
}
