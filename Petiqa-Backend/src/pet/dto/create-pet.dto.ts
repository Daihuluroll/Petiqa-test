import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreatePetDto {
  @ApiProperty({
    description: 'Display name for the virtual pet',
    example: 'PixelPaws',
    maxLength: 50,
  })
  @IsString()
  @MaxLength(50)
  petName!: string;

  @ApiPropertyOptional({
    description: 'Optional character skin or avatar',
    example: 'Fox',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  character?: string;
}
