import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_GUARD } from '@nestjs/core';
import { join } from 'path';
import appConfig from './config/app.config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProductsModule } from './modules/products/products.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { EnquiriesModule } from './modules/enquiries/enquiries.module';
import { MediaModule } from './modules/media/media.module';
import { ImportModule } from './modules/import/import.module';
import { CmsModule } from './modules/cms/cms.module';
import { AdminUsersModule } from './modules/admin-users/admin-users.module';
import { ReportsModule } from './modules/reports/reports.module';
import { ActivityLogModule } from './modules/activity-log/activity-log.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { WishlistModule } from './modules/wishlist/wishlist.module';
import { SitemapModule } from './modules/sitemap/sitemap.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
        limit: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
      },
    ]),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    ProductsModule,
    CategoriesModule,
    EnquiriesModule,
    MediaModule,
    ImportModule,
    CmsModule,
    AdminUsersModule,
    ReportsModule,
    ActivityLogModule,
    JobsModule,
    WishlistModule,
    SitemapModule,
    DashboardModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
