import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class TickPetStatusDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(6 * 60)
  deltaMinutes?: number;
}
