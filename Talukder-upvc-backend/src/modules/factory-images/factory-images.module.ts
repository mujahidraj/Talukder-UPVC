import { Module } from '@nestjs/common';
import { FactoryImagesController } from './factory-images.controller';
import { FactoryImagesService } from './factory-images.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [FactoryImagesController],
  providers: [FactoryImagesService],
})
export class FactoryImagesModule {}
