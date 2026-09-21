import { Module } from '@nestjs/common';
import { EnquiriesService } from './enquiries.service';
import { EnquiriesController } from './enquiries.controller';
import { EnquiriesAdminController } from './enquiries-admin.controller';

@Module({
  controllers: [EnquiriesController, EnquiriesAdminController],
  providers: [EnquiriesService],
  exports: [EnquiriesService],
})
export class EnquiriesModule {}
