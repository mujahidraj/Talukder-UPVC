import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { WishlistService } from './wishlist.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AdminRole } from '@prisma/client';
import { IsNotEmpty, IsString } from 'class-validator';

export class TrackWishlistDto {
  @IsString()
  @IsNotEmpty()
  productId: string;
}

@Controller('wishlist')
export class WishlistController {
  constructor(private wishlistService: WishlistService) {}

  @Post('track')
  @Throttle({ default: { ttl: 60000, limit: 10 } }) // Max 10 tracking requests per minute per IP
  track(@Body() dto: TrackWishlistDto) {
    if (dto.productId) {
      return this.wishlistService.trackAdd(dto.productId);
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
