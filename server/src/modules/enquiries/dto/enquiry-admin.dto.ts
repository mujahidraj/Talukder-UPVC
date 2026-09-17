import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { EnquiryStatus } from '@prisma/client';

export class UpdateEnquiryStatusDto {
  @IsEnum(EnquiryStatus)
  status: EnquiryStatus;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  internalNotes?: string;
}

export class AssignEnquiryDto {
  @IsString()
  @IsNotEmpty()
  assignedToId: string;
}

export class AddEnquiryNoteDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  note: string;
}
