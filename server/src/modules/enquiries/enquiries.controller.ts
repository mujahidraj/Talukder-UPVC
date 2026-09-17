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
  MaxLength,
  ArrayMaxSize,
} from 'class-validator';
import { Type } from 'class-transformer';

class EnquiryItemDto {
  @IsString() @IsNotEmpty() productId: string;
  @Type(() => Number) @IsInt() @Min(1) quantity: number;
  @IsString() @IsOptional() @MaxLength(500) note?: string;
}

class SubmitEnquiryDto {
  @IsString() @IsNotEmpty() @MaxLength(200) customerName: string;
  @IsString() @IsOptional() @MaxLength(200) companyName?: string;
  @IsEmail() @MaxLength(255) email: string;
  @IsString() @IsNotEmpty() @MaxLength(30) phone: string;
  @IsString() @IsOptional() @MaxLength(500) address?: string;
  @IsString() @IsOptional() @MaxLength(100) district?: string;
  @IsString() @IsOptional() @MaxLength(100) deliveryPref?: string;
  @IsString() @IsOptional() @MaxLength(2000) message?: string;
  @IsString() @IsOptional() @MaxLength(255) sourcePage?: string;
  @IsArray()
  @ArrayMaxSize(50)
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
