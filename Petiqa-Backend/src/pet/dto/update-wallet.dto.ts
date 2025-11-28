import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { WalletCurrency } from '../../shared/mongo/pet-wallet-transaction.schema';

class WalletSetDto {
  @ApiPropertyOptional({
    description: 'Set coins to this value',
    example: 1000,
    type: Number,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  coins?: number;

  @ApiPropertyOptional({
    description: 'Set points to this value',
    example: 500,
    type: Number,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  points?: number;
}

class WalletIncDto {
  @ApiPropertyOptional({
    description: 'Increment coins by this amount (can be negative)',
    example: 15,
    type: Number,
  })
  @IsOptional()
  @IsInt()
  coins?: number;

  @ApiPropertyOptional({
    description: 'Increment points by this amount (can be negative)',
    example: 10,
    type: Number,
  })
  @IsOptional()
  @IsInt()
  points?: number;
}

export class UpdateWalletDto {
  @ApiPropertyOptional({
    description: 'Set wallet values (replaces current values)',
    type: WalletSetDto,
    example: { coins: 1000, points: 500 },
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => WalletSetDto)
  set?: WalletSetDto;

  @ApiPropertyOptional({
    description: 'Increment wallet values (adds to current values)',
    type: WalletIncDto,
    example: { coins: 15, points: 10 },
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => WalletIncDto)
  inc?: WalletIncDto;

  @ApiPropertyOptional({
    description: 'Reason for the wallet change',
    example: 'Task reward: Daily Check in',
    maxLength: 120,
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  reason?: string;

  @ApiPropertyOptional({
    description: 'Additional metadata',
    example: { source: 'task' },
  })
  @IsOptional()
  metadata?: Record<string, unknown>;
}

export class WalletTransactionsQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by currency',
    enum: WalletCurrency,
  })
  @IsOptional()
  @IsEnum(WalletCurrency)
  currency?: WalletCurrency;

  @ApiPropertyOptional({
    description: 'Maximum number of transactions to return',
    example: 50,
    type: Number,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;
}
