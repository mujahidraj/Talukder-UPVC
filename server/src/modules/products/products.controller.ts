import { Controller, Get, Param, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { QueryProductsDto } from './dto/query-products.dto';

@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Get()
  findAll(@Query() query: QueryProductsDto) {
    return this.productsService.findAll(query);
  }

  @Get('search')
  search(@Query('q') q: string, @Query('limit') limit?: number) {
    return this.productsService.search(q, limit);
  }

  @Get('filters')
  getFilterOptions(@Query('categoryId') categoryId?: string) {
    return this.productsService.getFilterOptions(categoryId);
  }

  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.productsService.findBySlug(slug);
  }

  @Get(':id/related')
  getRelated(
    @Param('id') id: string,
    @Query('categoryId') categoryId: string,
    @Query('limit') limit?: number,
  ) {
    return this.productsService.getRelatedProducts(id, categoryId, limit);
  }
}
