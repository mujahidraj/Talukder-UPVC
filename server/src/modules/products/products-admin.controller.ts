import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AdminRole, ProductStatus } from '@prisma/client';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductsDto } from './dto/query-products.dto';

@Controller('admin/products')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(AdminRole.SUPER_ADMIN, AdminRole.CATALOG_MANAGER)
export class ProductsAdminController {
  constructor(private productsService: ProductsService) {}

  @Get()
  findAll(@Query() query: QueryProductsDto) {
    return this.productsService.findAll({
      ...query,
      // Admin can see deleted products too
    });
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.productsService.findById(id);
  }

  @Post()
  create(@Body() dto: CreateProductDto, @CurrentUser('id') userId: string) {
    return this.productsService.create(dto, userId);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.productsService.update(id, dto, userId);
  }

  @Delete(':id')
  softDelete(@Param('id') id: string) {
    return this.productsService.softDelete(id);
  }

  @Delete(':id/permanent')
  @Roles(AdminRole.SUPER_ADMIN)
  hardDelete(@Param('id') id: string) {
    return this.productsService.hardDelete(id);
  }

  @Post(':id/clone')
  clone(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.productsService.clone(id, userId);
  }

  @Put('bulk/status')
  bulkStatusChange(@Body() body: { ids: string[]; status: ProductStatus }) {
    return this.productsService.bulkStatusChange(body.ids, body.status);
  }
}
