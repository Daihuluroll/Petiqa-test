import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class EventStatusEffectDto {
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

class EventWalletEffectDto {
  @IsString()
  @MaxLength(10)
  currency!: string;

  @IsInt()
  amount!: number;
}

class EventInventoryEffectDto {
  @IsString()
  @MaxLength(80)
  item!: string;

  @IsInt()
  delta!: number;
}

class EventEffectsDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => EventStatusEffectDto)
  status?: EventStatusEffectDto;

  @IsOptional()
  @IsObject()
  wallet?: EventWalletEffectDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EventInventoryEffectDto)
  inventory?: EventInventoryEffectDto[];
}

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  type!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(280)
  description!: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => EventEffectsDto)
  effects?: EventEffectsDto;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
