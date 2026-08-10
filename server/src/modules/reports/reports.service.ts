import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getProductPerformance(limit = 20) {
    return this.prisma.product.findMany({
      where: { isDeleted: false },
      select: {
        id: true,
        productName: true,
        productCode: true,
        viewCount: true,
        wishlistCount: true,
        enquiryCount: true,
        category: { select: { name: true } },
      },
      orderBy: { enquiryCount: 'desc' },
      take: limit,
    });
  }

  async getEnquiryTrends() {
    // In a real app, this would use raw SQL or more complex Prisma groupings by date
    // For this boilerplate, returning a stub that the frontend could graph
    return {
      message: 'Enquiry trends data would be aggregated here',
    };
  }
}
