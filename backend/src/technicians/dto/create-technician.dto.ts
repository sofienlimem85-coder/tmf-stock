import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateTechnicianDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  team!: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;
}


