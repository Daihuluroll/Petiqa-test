import { ApiProperty } from '@nestjs/swagger';

export class DecryptDataResponseDto {
  @ApiProperty()
  data!: string;
}
