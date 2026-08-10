import { Controller, Get, Header } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('sitemap.xml')
export class SitemapController {
  constructor(private prisma: PrismaService) {}

  @Get()
  @Header('Content-Type', 'text/xml')
  async getSitemap() {
    const baseUrl = process.env.VITE_SITE_URL || 'http://localhost:5173';
    const products = await this.prisma.product.findMany({
      where: { isDeleted: false, status: 'ACTIVE' },
      select: { slug: true, updatedAt: true },
    });
    const categories = await this.prisma.category.findMany({
      where: { isVisible: true },
      select: { slug: true, updatedAt: true },
    });
    const pages = await this.prisma.page.findMany({
      where: { isPublished: true },
      select: { slug: true, updatedAt: true },
    });

    const urls = [
      { url: `${baseUrl}/`, lastmod: new Date().toISOString() },
      { url: `${baseUrl}/products`, lastmod: new Date().toISOString() },
      ...categories.map((c) => ({
        url: `${baseUrl}/categories/${c.slug}`,
        lastmod: c.updatedAt.toISOString(),
      })),
      ...products.map((p) => ({
        url: `${baseUrl}/products/${p.slug}`,
        lastmod: p.updatedAt.toISOString(),
      })),
      ...pages.map((p) => ({
        url: `${baseUrl}/${p.slug}`,
        lastmod: p.updatedAt.toISOString(),
      })),
    ];

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls
    .map(
      (u) => `
  <url>
    <loc>${u.url}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`,
    )
    .join('')}
</urlset>`;
  }
}
