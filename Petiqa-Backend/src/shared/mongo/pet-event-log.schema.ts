import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PetEventLogDocument = PetEventLog & Document;

@Schema({
  collection: 'petiqa.event.log',
  timestamps: true,
  versionKey: false,
})
export class PetEventLog {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  petId!: Types.ObjectId;

  @Prop({ required: true })
  type!: string;

  @Prop({ default: null })
  description?: string;

  @Prop({ type: Object, default: {} })
  effects?: Record<string, unknown>;

  @Prop({ type: Object, default: {} })
  metadata?: Record<string, unknown>;
}

export const PetEventLogSchema = SchemaFactory.createForClass(PetEventLog);
