import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class BannerDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  subtitle?: string;

  @IsString()
  @IsNotEmpty()
  imageUrl: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  linkUrl?: string;

  @IsNumber()
  @IsOptional()
  sortOrder?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class CreateBannerDto extends BannerDto {}
export class UpdateBannerDto extends BannerDto {}

export class FaqDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  question: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  answer: string;

  @IsNumber()
  @IsOptional()
  sortOrder?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class CreateFaqDto extends FaqDto {}
export class UpdateFaqDto extends FaqDto {}

export class PageDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  slug: string;

  @IsString()
  @IsOptional()
  @MaxLength(100000)
  content?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  metaTitle?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  metaDescription?: string;

  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;
}

export class CreatePageDto extends PageDto {}
export class UpdatePageDto extends PageDto {}
