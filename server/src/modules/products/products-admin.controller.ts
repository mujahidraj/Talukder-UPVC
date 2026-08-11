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
  Res,
} from '@nestjs/common';
import * as express from 'express';
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

  @Get('export/csv')
  async exportCsv(@Res() res: express.Response) {
    const products = await this.productsService.exportAll();

    const escCsv = (val: any) => {
      if (val == null) return '';
      const s = String(val);
      if (s.includes(',') || s.includes('"') || s.includes('\n')) {
        return `"${s.replace(/"/g, '""')}"`;
      }
      return s;
    };

    const headers = [
      'Product Code',
      'Product Name',
      'Category',
      'Size',
      'Status',
      'Fitting/Connection',
      'Thickness (mm)',
      'Length',
      'Color',
      'Class Type',
      'Material',
      'Brand/Manufacturer',
      'Description',
      'Features',
      'Applications',
      'View Count',
      'Wishlist Count',
      'Enquiry Count',
      'Is Featured',
      'Created At',
    ];

    const rows = products.map((p: any) => [
      escCsv(p.productCode),
      escCsv(p.productName),
      escCsv(p.category?.name || ''),
      escCsv(p.size),
      escCsv(p.status),
      escCsv(p.fittingConnectionType),
      escCsv(p.thicknessMm),
      escCsv(p.length),
      escCsv(p.color),
      escCsv(p.classType),
      escCsv(p.material),
      escCsv(p.brandManufacturer),
      escCsv(p.description),
      escCsv((p.features || []).join('; ')),
      escCsv((p.applications || []).join('; ')),
      p.viewCount || 0,
      p.wishlistCount || 0,
      p.enquiryCount || 0,
      p.isFeatured ? 'Yes' : 'No',
      escCsv(p.createdAt?.toISOString?.() || p.createdAt),
    ]);

    const csv = [headers.join(','), ...rows.map((r: any[]) => r.join(','))].join(
      '\n',
    );

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="products-export-${new Date().toISOString().slice(0, 10)}.csv"`,
    );
    res.send(csv);
  }

  @Get('trash/list')
  getTrash(@Query() query: QueryProductsDto) {
    return this.productsService.getTrash(query);
  }

  @Get('trash/bulk/ids')
  getTrashIds(@Query() query: QueryProductsDto) {
    return this.productsService.getAllIds(query, true);
  }

  @Get('bulk/ids')
  getBulkIds(@Query() query: QueryProductsDto) {
    return this.productsService.getAllIds(query, false);
  }

  @Get('missing-data')
  getMissingData(@Query() query: QueryProductsDto) {
    return this.productsService.getMissingData(query);
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

  @Delete('bulk/delete')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.CATALOG_MANAGER)
  bulkDelete(@Body() body: { ids: string[] }) {
    return this.productsService.bulkSoftDelete(body.ids);
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



  @Put(':id/restore')
  restore(@Param('id') id: string) {
    return this.productsService.restore(id);
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
