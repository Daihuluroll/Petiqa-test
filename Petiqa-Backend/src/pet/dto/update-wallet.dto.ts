import {
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { WalletCurrency } from '../../shared/mongo/pet-wallet-transaction.schema';

class WalletSetDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  coins?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  points?: number;
}

class WalletIncDto {
  @IsOptional()
  @IsInt()
  coins?: number;

  @IsOptional()
  @IsInt()
  points?: number;
}

export class UpdateWalletDto {
  @IsOptional()
  @IsObject()
  set?: WalletSetDto;

  @IsOptional()
  @IsObject()
  inc?: WalletIncDto;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  reason?: string;

  @IsOptional()
  metadata?: Record<string, unknown>;
}

export class WalletTransactionsQueryDto {
  @IsOptional()
  @IsEnum(WalletCurrency)
  currency?: WalletCurrency;

  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;
}
