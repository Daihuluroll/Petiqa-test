import {
  IsIn,
  IsInt,
  IsObject,
  IsOptional,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class StatusSetDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  energy?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  happiness?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  hunger?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  health?: number;
}

class StatusIncDto {
  @IsOptional()
  @IsInt()
  @Min(-100)
  @Max(100)
  energy?: number;

  @IsOptional()
  @IsInt()
  @Min(-100)
  @Max(100)
  happiness?: number;

  @IsOptional()
  @IsInt()
  @Min(-100)
  @Max(100)
  hunger?: number;

  @IsOptional()
  @IsInt()
  @Min(-100)
  @Max(100)
  health?: number;
}

export class UpdatePetStatusDto {
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => StatusSetDto)
  set?: StatusSetDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => StatusIncDto)
  inc?: StatusIncDto;

  @IsOptional()
  @IsIn(['activity', 'item', 'tick', 'manual'])
  source?: string;
}
