import { Module } from '@nestjs/common';
import { SitemapController } from './sitemap.controller';
import { ProductsModule } from '../products/products.module';
import { CategoriesModule } from '../categories/categories.module';
import { CmsModule } from '../cms/cms.module';

@Module({
  imports: [ProductsModule, CategoriesModule, CmsModule],
  controllers: [SitemapController],
})
export class SitemapModule {}
