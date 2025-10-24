import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class ActivityResultDto {
  @IsOptional()
  @IsInt()
  score?: number;

  @IsOptional()
  @IsNumber()
  durationSeconds?: number;

  @IsOptional()
  @IsBoolean()
  success?: boolean;
}

class ActivityStatusEffectDto {
  @IsOptional()
  @IsInt()
  energy?: number;

  @IsOptional()
  @IsInt()
  happiness?: number;

  @IsOptional()
  @IsInt()
  hunger?: number;

  @IsOptional()
  @IsInt()
  health?: number;
}

class ActivityWalletEffectDto {
  @IsString()
  @MaxLength(10)
  currency!: string;

  @IsInt()
  amount!: number;
}

class ActivityInventoryEffectDto {
  @IsString()
  @MaxLength(80)
  item!: string;

  @IsInt()
  delta!: number;
}

class ActivityEffectsDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => ActivityStatusEffectDto)
  status?: ActivityStatusEffectDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ActivityWalletEffectDto)
  wallet?: ActivityWalletEffectDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ActivityInventoryEffectDto)
  inventory?: ActivityInventoryEffectDto[];
}

export class ActivityCompleteDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => ActivityResultDto)
  result?: ActivityResultDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ActivityEffectsDto)
  effects?: ActivityEffectsDto;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
