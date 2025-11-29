import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

export type PetProfileDocument = PetProfile & Document;

export enum PetStatusMetric {
  ENERGY = 'energy',
  HAPPINESS = 'happiness',
  HUNGER = 'hunger',
  HEALTH = 'health',
}

export enum InventoryItemKind {
  FOOD = 'food',
  TOY = 'toy',
  COSMETIC = 'cosmetic',
  INSURANCE = 'insurance',
  MATERIAL = 'material',
  MISC = 'misc',
}

@Schema({ _id: false })
export class StatusSnapshot {
  @Prop({ min: 0, max: 100, default: 100 })
  energy!: number;

  @Prop({ min: 0, max: 100, default: 100 })
  happiness!: number;

  @Prop({ min: 0, max: 100, default: 100 })
  hunger!: number;

  @Prop({ min: 0, max: 100, default: 100 })
  health!: number;

  @Prop({ default: Date.now })
  updatedAt!: Date;
}

export const StatusSnapshotSchema =
  SchemaFactory.createForClass(StatusSnapshot);

@Schema({ _id: false })
export class WalletSnapshot {
  @Prop({ type: Number, min: 0, default: 0 })
  coins!: number;

  @Prop({ type: Number, min: 0, default: 0 })
  points!: number;

  @Prop({ type: Date, default: Date.now })
  updatedAt!: Date;
}

export const WalletSnapshotSchema =
  SchemaFactory.createForClass(WalletSnapshot);

@Schema({ _id: false })
export class InventoryEntry {
  @Prop({ required: true })
  name!: string;

  @Prop({ enum: InventoryItemKind, default: InventoryItemKind.MISC })
  kind!: InventoryItemKind;

  @Prop({ min: 0, default: 0 })
  quantity!: number;

  @Prop({ default: Date.now })
  updatedAt!: Date;
}

export const InventoryEntrySchema =
  SchemaFactory.createForClass(InventoryEntry);

@Schema({
  collection: 'petiqa.profile',
  timestamps: true,
  autoIndex: true,
  versionKey: false,
})
export class PetProfile {
  @Prop({ required: true, trim: true, index: true })
  petName!: string;

  @Prop({ type: String, trim: true, default: null })
  character!: string | null;

  @Prop({ type: StatusSnapshotSchema, default: () => ({}) })
  status!: StatusSnapshot;

  @Prop({ type: StatusSnapshotSchema, default: () => ({}) })
  initialStatus!: StatusSnapshot;

  // Wallet fields - flat instead of nested subdocument
  @Prop({ type: Number, min: 0, default: 0 })
  walletCoins!: number;

  @Prop({ type: Number, min: 0, default: 0 })
  walletPoints!: number;

  @Prop({ type: Date, default: Date.now })
  walletUpdatedAt!: Date;

  @Prop({ type: Object, default: {} })
  inventory!: Record<string, InventoryEntry>;

  @Prop({ type: Number, default: 0 })
  totalExperience!: number;

  @Prop({ type: Date, default: null })
  lastStatusTickAt!: Date | null;

  @Prop({
    type: [
      {
        name: { type: String },
        value: { type: String },
      },
    ],
    default: [],
  })
  metadata!: Array<{ name: string; value: string }>;

  // Virtual getter for backward compatibility
  get wallet(): WalletSnapshot {
    return {
      coins: this.walletCoins ?? 0,
      points: this.walletPoints ?? 0,
      updatedAt: this.walletUpdatedAt ?? new Date(),
    };
  }

  // Virtual setter for backward compatibility
  set wallet(value: WalletSnapshot) {
    if (value) {
      this.walletCoins = value.coins ?? 0;
      this.walletPoints = value.points ?? 0;
      this.walletUpdatedAt = value.updatedAt ?? new Date();
    }
  }
}

export const PetProfileSchema = SchemaFactory.createForClass(PetProfile);
PetProfileSchema.index({ petName: 1 }, { unique: true });
PetProfileSchema.plugin(mongoosePaginate);
