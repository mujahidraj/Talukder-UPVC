import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getDashboardData() {
    // 1. Top products by views (Engagement trends)
    const topProducts = await this.prisma.product.findMany({
      where: { isDeleted: false },
      select: {
        productName: true,
        productCode: true,
        viewCount: true,
        enquiryCount: true,
      },
      orderBy: { viewCount: 'desc' },
      take: 5,
    });

    // 2. Enquiries by status (Conversion Funnel)
    const enquiriesByStatus = await this.prisma.enquiry.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    // 3. Top wishlisted products
    const topWishlisted = await this.prisma.product.findMany({
      where: { isDeleted: false, wishlistCount: { gt: 0 } },
      select: {
        id: true,
        productName: true,
        wishlistCount: true,
      },
      orderBy: { wishlistCount: 'desc' },
      take: 5,
    });

    // 4. Category distribution
    const categoryDistribution = await this.prisma.product.groupBy({
      by: ['categoryId'],
      _count: { id: true },
    });
    // Hydrate category names
    const categories = await this.prisma.category.findMany({
      where: { id: { in: categoryDistribution.map(c => c.categoryId) } },
      select: { id: true, name: true },
    });
    const categoryData = categoryDistribution.map(c => ({
      name: categories.find(cat => cat.id === c.categoryId)?.name || 'Unknown',
      value: c._count.id,
    }));

    // 5. Recent Enquiries
    const recentEnquiries = await this.prisma.enquiry.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        customerName: true,
        companyName: true,
        status: true,
        createdAt: true,
        _count: { select: { items: true } },
      },
    });

    // 6. Recent Activity
    const recentActivity = await this.prisma.activityLog.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { actor: { select: { name: true } } },
    });

    // 7. Media Storage Metrics
    const imageStats = await this.prisma.productImage.aggregate({
      _count: { id: true },
      _sum: { fileSize: true },
    });

    // 8. Active Admin Users
    const activeAdmins = await this.prisma.adminUser.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        role: true,
        lastLoginAt: true,
      },
      orderBy: { lastLoginAt: 'desc' },
    });

    // 10 MORE METRICS
    const totalProducts = await this.prisma.product.count({ where: { isDeleted: false } });
    const activeProducts = await this.prisma.product.count({ where: { isDeleted: false, status: 'ACTIVE' } });
    const deletedProducts = await this.prisma.product.count({ where: { isDeleted: true } });
    
    const totalEnquiries = await this.prisma.enquiry.count();
    const newEnquiries = await this.prisma.enquiry.count({ where: { status: 'NEW' } });
    
    const totalBanners = await this.prisma.banner.count();
    const totalFaqs = await this.prisma.fAQ.count();
    
    const totalImportJobs = await this.prisma.importJob.count();
    const failedImportJobs = await this.prisma.importJob.count({ where: { status: 'FAILED' } });
    
    const totalActivityLogs = await this.prisma.activityLog.count();

    // 5 EVEN MORE METRICS
    const missingDataProducts = await this.prisma.product.count({
      where: {
        isDeleted: false,
        OR: [
          { description: null },
          { description: '' },
          { features: { isEmpty: true } }
        ]
      }
    });
    
    const totalCategoriesCount = await this.prisma.category.count();
    const pendingEnquiries = await this.prisma.enquiry.count({ where: { status: 'IN_PROGRESS' } });
    const quotedEnquiries = await this.prisma.enquiry.count({ where: { status: 'QUOTED' } });
    
    const wishlistStats = await this.prisma.product.aggregate({
      _sum: { wishlistCount: true }
    });
    const totalWishlistSaves = wishlistStats._sum.wishlistCount || 0;

    return {
      topProducts,
      enquiriesByStatus: enquiriesByStatus.map(e => ({ name: e.status, value: e._count.id })),
      topWishlisted,
      categoryDistribution: categoryData,
      recentEnquiries,
      recentActivity,
      mediaStats: {
        count: imageStats._count.id || 0,
        totalBytes: imageStats._sum.fileSize || 0,
      },
      activeAdmins,
      // 15 additional genuine stats
      extraStats: {
        totalProducts,
        activeProducts,
        deletedProducts,
        totalEnquiries,
        newEnquiries,
        totalBanners,
        totalFaqs,
        totalImportJobs,
        failedImportJobs,
        totalActivityLogs,
        missingDataProducts,
        totalCategoriesCount,
        pendingEnquiries,
        quotedEnquiries,
        totalWishlistSaves
      }
    };
  }
}
