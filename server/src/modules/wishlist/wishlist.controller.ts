import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AdminRole } from '@prisma/client';

@Controller('wishlist')
export class WishlistController {
  constructor(private wishlistService: WishlistService) {}

  @Post('track')
  track(@Body('productId') productId: string) {
    if (productId) {
      return this.wishlistService.trackAdd(productId);
    }
    return { success: false };
  }

  @Get('insights')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    AdminRole.SUPER_ADMIN,
    AdminRole.CATALOG_MANAGER,
    AdminRole.SALES_STAFF,
  )
  getInsights() {
    return this.wishlistService.getInsights();
  }
}
