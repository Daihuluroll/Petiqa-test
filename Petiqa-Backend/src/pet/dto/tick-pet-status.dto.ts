import { IsNumber, IsOptional, Max, Min } from 'class-validator';

export class TickPetStatusDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(6 * 60)
  deltaMinutes?: number;
}
