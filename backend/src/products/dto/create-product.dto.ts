import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { ProductType } from '../schemas/product.schema';

export class CreateProductDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name!: string;

  @IsInt()
  @Min(0)
  quantity!: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  invoiceNumber?: string;

  @IsOptional()
  @IsString()
  invoiceAttachment?: string;

  @IsEnum(['TYPE1', 'TYPE2'])
  type!: ProductType;
}


