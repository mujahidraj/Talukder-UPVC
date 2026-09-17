import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class WishlistService {
  constructor(private prisma: PrismaService) {}

  async trackAdd(productId: string) {
    // Verify product exists to prevent blind incrementing
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, isDeleted: true },
    });

    if (!product || product.isDeleted) {
      return { success: false };
    }

    await this.prisma.product.update({
      where: { id: productId },
      data: { wishlistCount: { increment: 1 } },
    });

    return { success: true };
  }

  async getInsights(limit = 10) {
    return this.prisma.product.findMany({
      where: { wishlistCount: { gt: 0 }, isDeleted: false },
      orderBy: { wishlistCount: 'desc' },
      take: limit,
      select: {
        id: true,
        productName: true,
        productCode: true,
        wishlistCount: true,
        category: { select: { name: true } },
      },
    });
  }
}
