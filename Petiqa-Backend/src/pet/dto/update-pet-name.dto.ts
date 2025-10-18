import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdatePetNameDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  petName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  character?: string;
}
