import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PetActivityLogDocument = PetActivityLog & Document;

@Schema({
  collection: 'petiqa.activity.log',
  timestamps: true,
  versionKey: false,
})
export class PetActivityLog {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  petId!: Types.ObjectId;

  @Prop({ required: true })
  activityId!: string;

  @Prop({ type: Object, default: {} })
  result?: Record<string, unknown>;

  @Prop({ type: Object, default: {} })
  effects?: Record<string, unknown>;

  @Prop({ type: Object, default: {} })
  metadata?: Record<string, unknown>;
}

export const PetActivityLogSchema = SchemaFactory.createForClass(PetActivityLog);
