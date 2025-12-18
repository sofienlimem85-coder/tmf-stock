import {
  IsIn,
  IsMongoId,
  IsOptional,
  IsString,
  IsISO8601,
  MaxLength,
  MinLength,
} from 'class-validator';
import type { ToolLoanStatus } from '../schemas/tool-loan.schema';

export class CreateToolLoanDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  toolName!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(80)
  category!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  serialNumber?: string;

  @IsOptional()
  @IsMongoId()
  technicianId?: string;

  @IsOptional()
  @IsISO8601()
  loanedAt?: string;

  @IsOptional()
  @IsISO8601()
  dueDate?: string;

  @IsString()
  @IsIn(['EN_COURS', 'RETARD', 'DISPONIBLE'])
  status!: ToolLoanStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}


