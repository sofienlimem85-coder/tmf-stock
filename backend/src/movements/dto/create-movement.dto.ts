import {
  IsIn,
  IsInt,
  IsMongoId,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import type { MovementType } from '../schemas/movement.schema';

export class CreateMovementDto {
  @IsMongoId()
  productId!: string;

  @IsOptional()
  @IsMongoId()
  technicianId?: string;

  @IsInt()
  @Min(1)
  quantity!: number;

  @IsString()
  @IsIn(['ENTREE', 'SORTIE'])
  type!: MovementType;

  @IsOptional()
  @IsString()
  comment?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  invoiceNumber?: string;

  @IsOptional()
  @IsString()
  invoiceAttachment?: string;
}


