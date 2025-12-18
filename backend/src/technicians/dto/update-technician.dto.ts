import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateTechnicianDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  team?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;
}


