import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class InventoryAdjustmentDto {
  @IsString()
  @MaxLength(80)
  item!: string;

  @IsInt()
  delta!: number;
}

export class UpdateInventoryDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => InventoryAdjustmentDto)
  adjustments!: InventoryAdjustmentDto[];

  @IsOptional()
  @IsString()
  @MaxLength(120)
  reason?: string;
}

export class UseInventoryItemDto {
  @IsString()
  @MaxLength(80)
  item!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;

  @IsOptional()
  @IsBoolean()
  applyEffects?: boolean;
}
