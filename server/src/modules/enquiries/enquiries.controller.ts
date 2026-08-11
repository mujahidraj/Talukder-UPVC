import { Controller, Post, Body } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { EnquiriesService } from './enquiries.service';
import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  IsArray,
  ValidateNested,
  IsInt,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

class EnquiryItemDto {
  @IsString() @IsNotEmpty() productId: string;
  @Type(() => Number) @IsInt() @Min(1) quantity: number;
  @IsString() @IsOptional() note?: string;
}

class SubmitEnquiryDto {
  @IsString() @IsNotEmpty() customerName: string;
  @IsString() @IsOptional() companyName?: string;
  @IsEmail() email: string;
  @IsString() @IsNotEmpty() phone: string;
  @IsString() @IsOptional() address?: string;
  @IsString() @IsOptional() district?: string;
  @IsString() @IsOptional() deliveryPref?: string;
  @IsString() @IsOptional() message?: string;
  @IsString() @IsOptional() sourcePage?: string;
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EnquiryItemDto)
  items: EnquiryItemDto[];
}

@Controller('enquiries')
export class EnquiriesController {
  constructor(private enquiriesService: EnquiriesService) {}

  @Post()
  @Throttle({ default: { ttl: 600000, limit: 3 } }) // Max 3 enquiries per 10 minutes
  submit(@Body() dto: SubmitEnquiryDto) {
    return this.enquiriesService.submit(dto);
  }
}
