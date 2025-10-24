import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CompleteTaskDto {
  @IsOptional()
  @IsString()
  @MaxLength(80)
  source?: string;
}
