import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { CmsService } from './cms.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AdminRole } from '@prisma/client';

@Controller('admin/cms')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(AdminRole.SUPER_ADMIN, AdminRole.CATALOG_MANAGER)
export class CmsAdminController {
  constructor(private cmsService: CmsService) {}

  // ─── Banners ────────────────────────────────
  @Get('banners')
  getBanners() {
    return this.cmsService.getBanners(false);
  }

  @Post('banners')
  createBanner(@Body() body: any) {
    return this.cmsService.createBanner(body);
  }

  @Put('banners/:id')
  updateBanner(@Param('id') id: string, @Body() body: any) {
    return this.cmsService.updateBanner(id, body);
  }

  @Delete('banners/:id')
  deleteBanner(@Param('id') id: string) {
    return this.cmsService.deleteBanner(id);
  }

  // ─── Pages ──────────────────────────────────
  @Get('pages')
  getPages() {
    return this.cmsService.getPages(false);
  }

  @Get('pages/:id')
  getPage(@Param('id') id: string) {
    return this.cmsService.getPageById(id);
  }

  @Post('pages')
  createPage(@Body() body: any) {
    return this.cmsService.createPage(body);
  }

  @Put('pages/:id')
  updatePage(@Param('id') id: string, @Body() body: any) {
    return this.cmsService.updatePage(id, body);
  }

  @Delete('pages/:id')
  deletePage(@Param('id') id: string) {
    return this.cmsService.deletePage(id);
  }

  // ─── FAQs ───────────────────────────────────
  @Get('faqs')
  getFaqs() {
    return this.cmsService.getFaqs(false);
  }

  @Post('faqs')
  createFaq(@Body() body: any) {
    return this.cmsService.createFaq(body);
  }

  @Put('faqs/:id')
  updateFaq(@Param('id') id: string, @Body() body: any) {
    return this.cmsService.updateFaq(id, body);
  }

  @Delete('faqs/:id')
  deleteFaq(@Param('id') id: string) {
    return this.cmsService.deleteFaq(id);
  }
}
