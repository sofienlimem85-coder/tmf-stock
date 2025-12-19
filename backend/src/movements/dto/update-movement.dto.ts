import {
  IsIn,
  IsInt,
  IsMongoId,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import type { MovementType } from '../schemas/movement.schema';

export class UpdateMovementDto {
  @IsOptional()
  @IsMongoId()
  productId?: string;

  @IsOptional()
  @IsMongoId()
  technicianId?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;

  @IsOptional()
  @IsString()
  @IsIn(['ENTREE', 'SORTIE'])
  type?: MovementType;

  @IsOptional()
  @IsString()
  comment?: string;

  @IsOptional()
  @IsString()
  @IsIn(['PRETE', 'RENDU'])
  loanStatus?: 'PRETE' | 'RENDU';
}


