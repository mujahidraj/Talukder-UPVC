import { Controller, Get, Param } from '@nestjs/common';
import { CmsService } from './cms.service';

@Controller('cms')
export class CmsController {
  constructor(private cmsService: CmsService) {}

  @Get('banners')
  getBanners() {
    return this.cmsService.getBanners(true);
  }

  @Get('faqs')
  getFaqs() {
    return this.cmsService.getFaqs(true);
  }

  @Get('pages')
  getPages() {
    return this.cmsService.getPages(true);
  }

  @Get('pages/:slug')
  getPage(@Param('slug') slug: string) {
    return this.cmsService.getPageBySlug(slug);
  }
}
