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
import { CategoriesService } from './categories.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AdminRole } from '@prisma/client';

@Controller('admin/categories')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(AdminRole.SUPER_ADMIN, AdminRole.CATALOG_MANAGER)
export class CategoriesAdminController {
  constructor(private categoriesService: CategoriesService) {}

  @Get()
  findAll() {
    return this.categoriesService.findAllAdmin();
  }

  @Get('tree')
  getTree() {
    return this.categoriesService.getTree();
  }

  @Post()
  create(@Body() body: any) {
    return this.categoriesService.create(body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.categoriesService.update(id, body);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.categoriesService.delete(id);
  }

  @Put('bulk/reorder')
  reorder(@Body() items: { id: string; sortOrder: number }[]) {
    return this.categoriesService.reorder(items);
  }
}
