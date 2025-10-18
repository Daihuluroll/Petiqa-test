import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PetWalletTransactionDocument = PetWalletTransaction & Document;

export enum WalletCurrency {
  COIN = 'coin',
  POINT = 'point',
}

@Schema({
  collection: 'petiqa.wallet.transactions',
  timestamps: true,
  versionKey: false,
})
export class PetWalletTransaction {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  petId!: Types.ObjectId;

  @Prop({ enum: WalletCurrency, required: true })
  currency!: WalletCurrency;

  @Prop({ required: true })
  amount!: number;

  @Prop({ required: true })
  balanceAfter!: number;

  @Prop({ default: null })
  reason?: string;

  @Prop({ type: Object, default: {} })
  metadata?: Record<string, unknown>;
}

export const PetWalletTransactionSchema =
  SchemaFactory.createForClass(PetWalletTransaction);
