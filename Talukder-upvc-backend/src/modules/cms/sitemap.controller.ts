import { Controller, Get, Header } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('sitemap.xml')
export class SitemapController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @Header('Content-Type', 'application/xml')
  async getSitemap() {
    const baseUrl = 'https://talukder-upvc.com';

    // Static pages
    const staticPages = [
      '',
      '/products',
      '/about',
      '/contact',
      '/faq',
      '/downloads',
      '/certifications',
      '/factory',
    ];

    // Dynamic products
    const products = await this.prisma.product.findMany({
      where: { status: 'ACTIVE' },
      select: { slug: true, updatedAt: true },
    });

    // Dynamic categories
    const categories = await this.prisma.category.findMany({
      select: { slug: true, updatedAt: true },
    });

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Add static pages
    for (const page of staticPages) {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}${page}</loc>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>${page === '' ? '1.0' : '0.8'}</priority>\n`;
      xml += `  </url>\n`;
    }

    // Add categories
    for (const category of categories) {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/categories/${category.slug}</loc>\n`;
      xml += `    <lastmod>${category.updatedAt.toISOString()}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.7</priority>\n`;
      xml += `  </url>\n`;
    }

    // Add products
    for (const product of products) {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/products/${product.slug}</loc>\n`;
      xml += `    <lastmod>${product.updatedAt.toISOString()}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.9</priority>\n`;
      xml += `  </url>\n`;
    }

    xml += `</urlset>`;

    return xml;
  }
}
