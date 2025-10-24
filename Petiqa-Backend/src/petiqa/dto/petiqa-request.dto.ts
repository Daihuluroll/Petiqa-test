import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class DecryptDataRequestDto {
  @ApiProperty({ required: true, example: 'acbdefghijklmn' })
  @IsString()
  data!: string;
}
