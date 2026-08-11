import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CmsService {
  constructor(private prisma: PrismaService) {}

  // ─── Banners ──────────────────────────────────────────
  async getBanners(onlyActive = true) {
    return this.prisma.banner.findMany({
      where: onlyActive ? { isActive: true } : undefined,
      orderBy: { sortOrder: 'asc' },
    });
  }

  async createBanner(data: {
    title: string;
    subtitle?: string;
    imageUrl: string;
    linkUrl?: string;
    isActive?: boolean;
    sortOrder?: number;
  }) {
    return this.prisma.banner.create({ data });
  }

  async updateBanner(id: string, data: any) {
    return this.prisma.banner.update({ where: { id }, data });
  }

  async deleteBanner(id: string) {
    return this.prisma.banner.delete({ where: { id } });
  }

  // ─── Pages ────────────────────────────────────────────
  async getPages(onlyPublished = true) {
    return this.prisma.page.findMany({
      where: onlyPublished ? { isPublished: true } : undefined,
      select: {
        id: true,
        title: true,
        slug: true,
        isPublished: true,
        updatedAt: true,
      },
    });
  }

  async getPageBySlug(slug: string) {
    const page = await this.prisma.page.findUnique({ where: { slug } });
    if (!page || !page.isPublished)
      throw new NotFoundException('Page not found');
    return page;
  }

  async getPageById(id: string) {
    return this.prisma.page.findUnique({ where: { id } });
  }

  async createPage(data: any) {
    return this.prisma.page.create({ data });
  }

  async updatePage(id: string, data: any) {
    return this.prisma.page.update({ where: { id }, data });
  }

  async deletePage(id: string) {
    return this.prisma.page.delete({ where: { id } });
  }

  // ─── FAQs ─────────────────────────────────────────────
  async getFaqs(onlyActive = true) {
    return this.prisma.fAQ.findMany({
      where: onlyActive ? { isActive: true } : undefined,
      orderBy: { sortOrder: 'asc' },
    });
  }

  async createFaq(data: any) {
    return this.prisma.fAQ.create({ data });
  }

  async updateFaq(id: string, data: any) {
    return this.prisma.fAQ.update({ where: { id }, data });
  }

  async deleteFaq(id: string) {
    return this.prisma.fAQ.delete({ where: { id } });
  }
}
