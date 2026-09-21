import {
  IsArray,
  IsEnum,
  IsString,
  ArrayMaxSize,
  ArrayMinSize,
} from 'class-validator';
import { ProductStatus } from '@prisma/client';

export class BulkDeleteDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(500)
  @IsString({ each: true })
  ids: string[];
}

export class BulkStatusChangeDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(500)
  @IsString({ each: true })
  ids: string[];

  @IsEnum(ProductStatus)
  status: ProductStatus;
}
