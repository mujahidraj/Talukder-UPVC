import { Module } from '@nestjs/common';
import { CmsService } from './cms.service';
import { CmsController } from './cms.controller';
import { CmsAdminController } from './cms-admin.controller';
import { SitemapController } from './sitemap.controller';

@Module({
  controllers: [CmsController, CmsAdminController, SitemapController],
  providers: [CmsService],
  exports: [CmsService],
})
export class CmsModule {}
